import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { locales, languageNames, origin, keyFor, normalize, needsTranslation, transformCopy, decodeHtml, escapeHtml, runtimeCopy } from './localization-core.mjs';
import { pagePaths } from '../netlify/edge-functions/lib/page-paths.mjs';
import { languagePath } from '../netlify/edge-functions/lib/language-policy.mjs';
import { privacyLanguageCopy } from './localization-supplement.mjs';
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const source = JSON.parse(await readFile(path.join(root,'data/locales/source.json'),'utf8'));
const validPaths = new Set(pagePaths);
const htmlFiles = [];
async function walk(dir) {
  for (const item of await readdir(dir,{withFileTypes:true})) {
    if (item.isDirectory() && !['assets',...locales.slice(1)].includes(item.name)) await walk(path.join(dir,item.name));
    else if (item.isFile() && item.name.endsWith('.html')) htmlFiles.push(path.join(dir,item.name));
  }
}
await walk(dist);
const originals = await Promise.all(htmlFiles.map(async file => ({relative:path.relative(dist,file),html:await readFile(file,'utf8')})));
const indexableRoutes = [...(await readFile(path.join(dist,'sitemap.xml'),'utf8')).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1]).pathname);
const missing = new Set();
for (const language of locales) {
  const dictionary = language === 'en' ? {} : JSON.parse(await readFile(path.join(root,`data/locales/${language}.json`),'utf8'));
  if (language !== 'en') for(const {id} of source) if(typeof dictionary[id] !== 'string' || !dictionary[id].trim()) missing.add(`${language}:${id}`);
  const translate = value => {
    const text = normalize(value);
    if(language === 'en' || !needsTranslation(text)) return value;
    const found = dictionary[keyFor(text)];
    if(!found) { missing.add(`${language}:${text}`); return value; }
    return found;
  };
  const localUrl = (value, translateQuery = false) => {
    if (!value.startsWith('/') && !value.startsWith(origin + '/')) return value;
    const url = new URL(decodeHtml(value),origin);
    if(url.origin !== origin) return value;
    const route = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
    if(!validPaths.has(route)) return value;
    url.pathname = languagePath(route,language);
    if(translateQuery) for(const name of ['request','product','context']) if(url.searchParams.has(name)) url.searchParams.set(name,translate(url.searchParams.get(name)));
    return value.startsWith(origin) ? url.href : `${url.pathname}${url.search}${url.hash}`;
  };
  for(const {relative,html:original} of originals) {
    const is404 = relative === '404.html';
    const route = relative.replaceAll('\\','/').replace(/(^|\/)index\.html$/,'$1');
    const base = is404 ? '/' : '/' + route;
    let html = language === 'en' ? original : transformCopy(original,translate);
    html = html.replace('<html lang="en">',`<html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">`);
    if (language !== 'en') {
      html = html.replace(/href="([^"]*)"/g,(_match,value)=>`href="${escapeHtml(localUrl(value,true))}"`);
      html = html.replace(/(<meta property="og:url" content=")([^"]*)"/,(_match,prefix,value)=>prefix+escapeHtml(localUrl(value))+'"');
      html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_match,json)=>{
        const walk = value => {
          if(Array.isArray(value)) return value.map(walk);
          if(value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,v]) => [key,key === 'inLanguage' ? language : (['url','item','@id'].includes(key) && typeof v === 'string' && !v.includes('#organization')) ? localUrl(v) : walk(v)]));
          return value;
        };
        return '<script type="application/ld+json">'+JSON.stringify(walk(JSON.parse(json))).replaceAll('<','\\u003c')+'</script>';
      });
    }
    const alternatives = locales.map(code=>`<link rel="alternate" hreflang="${code}" href="${origin}${languagePath(base,code)}">`).join('')+`<link rel="alternate" hreflang="x-default" href="${origin}${base}">`;
    html = html.replace('</head>',`${is404 ? '' : alternatives}<meta property="og:locale" content="${{en:'en_GB',de:'de_DE',fr:'fr_FR',ar:'ar',es:'es_ES',pt:'pt',ja:'ja_JP',ko:'ko_KR'}[language]}"></head>`);
    const label = translate('Language');
    const selector = `<details class="language-switcher"><summary aria-label="${escapeHtml(label)}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/></svg><span>${languageNames[language]}</span></summary><nav class="language-options" aria-label="${escapeHtml(label)}">${locales.map(code=>`<a href="${languagePath(base,code)}?lang=${code}" data-language="${code}" lang="${code}" hreflang="${code}"${language === code ? ' aria-current="true"' : ''}>${languageNames[code]}</a>`).join('')}</nav></details>`;
    html = html.replace('<div class="nav-actions">',`<div class="nav-actions">${selector}`);
    if(base === '/privacy/') {
      const copy = privacyLanguageCopy[language];
      html = html.replace('</div></section></main>',`<h2>${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.body)}</p></div></section></main>`);
    }
    const runtime = Object.fromEntries(runtimeCopy.map(text=>[text,translate(text)]));
    html = html.replace('<script src="/site.js" defer>',`<script type="application/json" id="lf-translations">${JSON.stringify(runtime).replaceAll('<','\\u003c')}</script><script src="/site.js" defer>`);
    const file = path.join(dist, language === 'en' ? relative : path.join(language,relative));
    await mkdir(path.dirname(file),{recursive:true});
    await writeFile(file,html,'utf8');
  }
}
if(missing.size) throw new Error(`Missing translations (${missing.size}): ${[...missing].slice(0,30).join('\n')}`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${locales.flatMap(language=>indexableRoutes.map(route=>`  <url><loc>${origin}${languagePath(route,language)}</loc>${locales.map(code=>`<xhtml:link rel="alternate" hreflang="${code}" href="${origin}${languagePath(route,code)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${origin}${route}"/></url>`)).join('\n')}\n</urlset>\n`;
await writeFile(path.join(dist,'sitemap.xml'),sitemap,'utf8');
console.log(`Localized ${originals.length} pages into ${locales.length} languages (${originals.length*locales.length} HTML files).`);
