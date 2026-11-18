import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { locales, keyFor, transformCopy, normalize, needsTranslation, decodeHtml } from './localization-core.mjs';
import { pagePaths } from '../netlify/edge-functions/lib/page-paths.mjs';
import { languagePath } from '../netlify/edge-functions/lib/language-policy.mjs';
const root=path.resolve(import.meta.dirname,'..');
const dist=path.join(root,'dist');
const catalog=JSON.parse(await readFile(path.join(root,'data/locales/source.json'),'utf8'));
const errors=[];
const exists=async file=>{try{await access(file);return true;}catch{return false;}};
let pages=0, links=0;
for(const language of locales){
  if(language!=='en'){
    const dictionary=JSON.parse(await readFile(path.join(root,`data/locales/${language}.json`),'utf8'));
    for(const {id,text} of catalog){
      if(typeof dictionary[id]!=='string'||!dictionary[id].trim()) errors.push(`${language}: missing ${id}`);
      if(dictionary[id]&&/[<>]/.test(dictionary[id])) errors.push(`${language}: unexpected markup in ${id}`);
      for(const sku of text.match(/GAR-[A-Z]+-\d+/g)||[]) if(!dictionary[id]?.includes(sku)) errors.push(`${language}: missing SKU ${sku} in ${id}`);
      if(text.includes('{count}')&&!dictionary[id]?.includes('{count}')) errors.push(`${language}: missing count placeholder`);
    }
  }
  for(const base of pagePaths){
    const route=languagePath(base,language);
    const html=await readFile(path.join(dist,route.slice(1),'index.html'),'utf8');pages++;
    if(!html.includes(`<html lang="${language}" dir="${language==='ar'?'rtl':'ltr'}">`)) errors.push(`${route}: wrong language/direction`);
    if(!html.includes(`<link rel="canonical" href="https://lfclothing.com${route}">`)) errors.push(`${route}: incorrect canonical`);
    if((html.match(/<h1\b/g)||[]).length!==1) errors.push(`${route}: expected one H1`);
    for(const code of [...locales,'x-default']){
      const expected=`<link rel="alternate" hreflang="${code}" href="https://lfclothing.com${languagePath(base,code==='x-default'?'en':code)}">`;
      if(!html.includes(expected)) errors.push(`${route}: missing ${code} alternate`);
    }
    if((html.match(/data-language="/g)||[]).length!==8) errors.push(`${route}: language menu incomplete`);
    const title=decodeHtml(html.match(/<title>(.*?)<\/title>/)?.[1]||'');
    if(!title||title==='undefined'||title==='null') errors.push(`${route}: empty title`);
    for(const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)[^\"]*"/g)){
      const pathname=decodeHtml(match[1]);
      if(pathname.startsWith('//')||pathname.startsWith('/.netlify/'))continue;
      const file=path.extname(pathname)?path.join(dist,pathname.slice(1)):path.join(dist,pathname.slice(1),'index.html');
      if(!await exists(file)) errors.push(`${route}: broken local URL ${pathname}`);
      links++;
    }
    for(const match of html.matchAll(/<a\b([^>]*)>/g)){
      if(/data-language=/.test(match[1]))continue;
      const href=decodeHtml(match[1].match(/href="([^"]*)"/)?.[1]||'');
      if(language!=='en'&&href.startsWith('/')&&!href.startsWith('/assets/')&&!href.startsWith(`/${language}/`)) errors.push(`${route}: navigation escaped locale ${href}`);
    }
    if(base==='/inquiry/'){
      for(const name of ['name','email','phone','countryCode','message']) if(!html.includes(`name="${name}"`))errors.push(`${route}: missing inquiry ${name}`);
      const copy=JSON.parse(html.match(/<script type="application\/json" id="lf-translations">(.*?)<\/script>/)?.[1]||'{}');
      for(const name of ['Sending…','Please enter a valid email address.','Thank you. Your inquiry has been sent to LF Clothing.']) if(!copy[name])errors.push(`${route}: missing runtime message ${name}`);
    }
    if(base==='/privacy/'&&!html.includes('lf_language'))errors.push(`${route}: missing language preference notice`);
  }
}
const sitemap=await readFile(path.join(dist,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
const expectedUrlCount=pagePaths.filter(route=>route!=='/privacy/').length*locales.length;
if(urls.length!==expectedUrlCount||new Set(urls).size!==expectedUrlCount)errors.push(`Expected ${expectedUrlCount} unique sitemap URLs, found ${urls.length}`);
for(const language of locales)for(const base of pagePaths.filter(route=>route!=='/privacy/'))if(!urls.includes(`https://lfclothing.com${languagePath(base,language)}`))errors.push(`Missing sitemap URL ${language}:${base}`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`Validated ${pages} public pages in ${locales.length} languages, ${links} local references, all translation entries, language navigation, RTL, inquiry messages and ${expectedUrlCount} sitemap URLs.`);
