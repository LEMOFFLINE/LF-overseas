import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { transformCopy, normalize, needsTranslation, keyFor, runtimeCopy } from './localization-core.mjs';
const root = path.resolve(import.meta.dirname, '..');
const messages = new Map();
const add = (text, page) => {
  const value = normalize(text);
  if (needsTranslation(value)) {
    const key = keyFor(value);
    const entry = messages.get(key) || { id:key, text:value, pages:[] };
    if (!entry.pages.includes(page)) entry.pages.push(page);
    messages.set(key, entry);
  }
  return text;
};
async function walk(dir) {
  for (const item of await readdir(dir, {withFileTypes:true})) {
    const file = path.join(dir,item.name);
    if (item.isDirectory() && !['assets','de','fr','ar','es','pt','ja','ko'].includes(item.name)) await walk(file);
    if (item.isFile() && item.name.endsWith('.html')) {
      const page = path.relative(path.join(root,'dist'), file).replaceAll('\\','/');
      const html = await readFile(file,'utf8');
      transformCopy(html, text => add(text,page));
      for (const match of html.matchAll(/href="([^"<>]*\?[^"<>]*)"/g)) {
        const url = new URL(match[1].replaceAll('&amp;','&'), 'https://lfclothing.com');
        for (const name of ['request','product','context']) if(url.searchParams.has(name)) add(url.searchParams.get(name),page);
      }
    }
  }
}
await walk(path.join(root,'dist'));
runtimeCopy.forEach(text => add(text,'runtime'));
const list = [...messages.values()];
await mkdir(path.join(root,'data','locales'), {recursive:true});
await writeFile(path.join(root,'data','locales','source.json'),JSON.stringify(list,null,2)+'\n');
console.log(JSON.stringify({strings:list.length, words:list.reduce((n,item)=>n+item.text.split(' ').length,0), chars:list.reduce((n,item)=>n+item.text.length,0)}));
