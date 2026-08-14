import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || "dist");
const products = JSON.parse(await readFile(path.resolve("data/products.json"), "utf8"));
const errors = [];

async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(file)); else result.push(file);
  }
  return result;
}

async function exists(file) { try { await access(file); return true; } catch { return false; } }
const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const titles = new Map();
const canonicals = new Map();

for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const html = await readFile(file, "utf8");
  const is404 = rel === "404.html";
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1]?.trim();
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${rel}: expected one H1, found ${h1Count}`);
  if (!title || title.length < 20 || title.length > 72) errors.push(`${rel}: title length ${title?.length || 0}`);
  if (!description || description.length < 70 || description.length > 190) errors.push(`${rel}: description length ${description?.length || 0}`);
  if (!is404 && !canonical?.startsWith("https://lfclothing.com/")) errors.push(`${rel}: invalid canonical`);
  if (!is404 && !/index,follow/.test(html)) errors.push(`${rel}: not indexable`);
  if (is404 && !/noindex,follow/.test(html)) errors.push(`${rel}: 404 must be noindex`);
  if (!/<meta property="og:title"/.test(html) || !/<meta name="twitter:card"/.test(html)) errors.push(`${rel}: social metadata missing`);
  if (!/<script type="application\/ld\+json">/.test(html)) errors.push(`${rel}: structured data missing`);
  if (titles.has(title)) errors.push(`${rel}: duplicate title with ${titles.get(title)}`); else titles.set(title, rel);
  if (!is404 && canonicals.has(canonical)) errors.push(`${rel}: duplicate canonical with ${canonicals.get(canonical)}`); else if (!is404) canonicals.set(canonical, rel);
  for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) {
    const url = match[1];
    if (url.startsWith("/.netlify/") || url.startsWith("//")) continue;
    const candidate = url === "/" ? path.join(root, "index.html") : path.join(root, url.slice(1));
    const target = path.extname(candidate) ? candidate : path.join(candidate, "index.html");
    if (!await exists(target)) errors.push(`${rel}: broken internal reference ${url}`);
  }
  for (const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json[1]); } catch (error) { errors.push(`${rel}: invalid JSON-LD ${error.message}`); }
  }
}

if (products.length !== 50) errors.push(`expected 50 products, found ${products.length}`);
for (const product of products) {
  const page = path.join(root, "products", product.slug, "index.html");
  if (!await exists(page)) errors.push(`missing product page ${product.sku}`);
  for (const image of Object.values(product.images).filter(Boolean)) if (!await exists(path.join(root, image.slice(1)))) errors.push(`missing image ${product.sku}: ${image}`);
}

const allText = await Promise.all(files.filter((file) => /\.(html|js|css|xml)$/.test(file)).map((file) => readFile(file, "utf8")));
const combined = allText.join("\n");
if (/[\u3400-\u9fff]|[，。；（）]/.test(combined)) errors.push("public build contains Chinese product or interface text");
for (const banned of ["Request Full Catalog", "Download Catalogue", "700,000", "200+ Production", "Aviation & Special Projects", "LF-BW-", "LF-IW-", "LF-CA-"]) {
  if (combined.includes(banned)) errors.push(`banned legacy content remains: ${banned}`);
}
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((item) => item[1]);
if (sitemapUrls.length !== 62) errors.push(`expected 62 sitemap URLs, found ${sitemapUrls.length}`);
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push("sitemap has duplicate URLs");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} HTML pages, 50 products, ${sitemapUrls.length} sitemap URLs and all referenced local assets.`);
