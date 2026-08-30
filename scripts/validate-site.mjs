import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || "dist");
const products = JSON.parse(await readFile(path.resolve("data/products.json"), "utf8"));
const collections = JSON.parse(await readFile(path.resolve("data/collections.json"), "utf8"));
const featuredProducts = products.filter((product) => product.homepage);
const errors = [];
const baseUrl = "https://lfclothing.com";

function decodeHtml(value = "") {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function hasTrailingSlash(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname === "/" || parsed.pathname.endsWith("/");
  } catch {
    return false;
  }
}

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
  const isPrivacy = rel === "privacy/index.html";
  const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim());
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1]?.trim();
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${rel}: expected one H1, found ${h1Count}`);
  if (!title || title.length < 20 || title.length > 72) errors.push(`${rel}: title length ${title?.length || 0}`);
  if (!description || description.length < 70 || description.length > 190) errors.push(`${rel}: description length ${description?.length || 0}`);
  if (!is404 && !canonical?.startsWith("https://lfclothing.com/")) errors.push(`${rel}: invalid canonical`);
  if (!is404 && !hasTrailingSlash(canonical)) errors.push(`${rel}: canonical must use a trailing slash`);
  if (!is404 && !isPrivacy && !/index,follow/.test(html)) errors.push(`${rel}: not indexable`);
  if ((is404 || isPrivacy) && !/noindex,follow/.test(html)) errors.push(`${rel}: auxiliary page must be noindex`);
  if (!/<meta property="og:title"/.test(html) || !/<meta name="twitter:card"/.test(html)) errors.push(`${rel}: social metadata missing`);
  if (!/<script type="application\/ld\+json">/.test(html)) errors.push(`${rel}: structured data missing`);
  for (const match of html.matchAll(/https:\/\/lfclothing\.com\/[^"'<>\s]+\.(?:png|jpe?g|webp|svg)\//gi)) errors.push(`${rel}: asset URL must not have a trailing slash: ${match[0]}`);
  if (titles.has(title)) errors.push(`${rel}: duplicate title with ${titles.get(title)}`); else titles.set(title, rel);
  if (!is404 && canonicals.has(canonical)) errors.push(`${rel}: duplicate canonical with ${canonicals.get(canonical)}`); else if (!is404) canonicals.set(canonical, rel);
  for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) {
    const url = match[1];
    if (url.startsWith("/.netlify/") || url.startsWith("//")) continue;
    const candidate = url === "/" ? path.join(root, "index.html") : path.join(root, url.slice(1));
    const target = path.extname(candidate) ? candidate : path.join(candidate, "index.html");
    if (!await exists(target)) errors.push(`${rel}: broken internal reference ${url}`);
  }
  for (const match of html.matchAll(/href="(\/(?!\/)[^"]*)"/g)) {
    const url = match[1];
    if (url.startsWith("/assets/") || url === "/styles.css") continue;
    const parsed = new URL(url, baseUrl);
    if (parsed.pathname !== "/" && !parsed.pathname.endsWith("/")) errors.push(`${rel}: internal link must use a trailing slash: ${url}`);
  }
  for (const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json[1]); } catch (error) { errors.push(`${rel}: invalid JSON-LD ${error.message}`); }
  }
}

if (products.length !== 50) errors.push(`expected 50 products, found ${products.length}`);
for (const product of products) {
  for (const image of Object.values(product.images).filter(Boolean)) if (!await exists(path.join(root, image.slice(1)))) errors.push(`missing image ${product.sku}: ${image}`);
}
const generatedProductDetails = htmlFiles.filter((file) => {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  return rel.startsWith("products/") && rel !== "products/index.html";
});
const expectedProductDetails = new Set(featuredProducts.map((product) => `products/${product.slug}/index.html`));
const actualProductDetails = new Set(generatedProductDetails.map((file) => path.relative(root, file).replaceAll("\\", "/")));
if (featuredProducts.length !== 8) errors.push(`expected 8 featured products, found ${featuredProducts.length}`);
for (const rel of expectedProductDetails) if (!actualProductDetails.has(rel)) errors.push(`missing retained product detail page: ${rel}`);
for (const rel of actualProductDetails) if (!expectedProductDetails.has(rel)) errors.push(`unexpected product detail page: ${rel}`);
for (const file of generatedProductDetails) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const html = await readFile(file, "utf8");
  if (html.includes('"@type":"Product"')) errors.push(`${rel}: product rich-result schema must not be emitted without truthful offers or reviews`);
  if (!html.includes('"@type":"BreadcrumbList"')) errors.push(`${rel}: breadcrumb structured data missing`);
}

const redirects = await readFile(path.join(root, "_redirects"), "utf8");
const productRedirectLines = redirects.split(/\r?\n/).filter((line) => line.startsWith("/products/"));
if (productRedirectLines.length !== products.length - featuredProducts.length) errors.push(`expected ${products.length - featuredProducts.length} product redirects, found ${productRedirectLines.length}`);
for (const product of featuredProducts) if (redirects.includes(`/products/${product.slug}/ `)) errors.push(`retained product must not redirect: ${product.slug}`);
for (const product of products.filter((item) => !item.homepage)) if (!redirects.includes(`/products/${product.slug}/ `)) errors.push(`missing legacy product redirect: ${product.slug}`);

const allText = await Promise.all(files.filter((file) => /\.(html|js|css|xml)$/.test(file)).map((file) => readFile(file, "utf8")));
const combined = allText.join("\n");
const analytics = await readFile(path.join(root, "analytics.js"), "utf8");
if (!analytics.includes('G-D5XWSW9S5V')) errors.push("GA4 measurement ID is missing");
if (!analytics.includes('window.gtag("consent", "default"')) errors.push("Consent Mode default is missing");
if (!analytics.includes('lfProductionHosts.has(location.hostname)')) errors.push("GA4 must be limited to production hosts");
if (!analytics.includes('window.lfTrackEvent')) errors.push("consent-aware event helper is missing");
if (/[\u3400-\u9fff]|[，。；（）]/.test(combined)) errors.push("public build contains Chinese product or interface text");
for (const banned of ["Request Full Catalog", "Download Catalogue", "700,000", "200+ Production", "Aviation & Special Projects", "LF-BW-", "LF-IW-", "LF-CA-"]) {
  if (combined.includes(banned)) errors.push(`banned legacy content remains: ${banned}`);
}
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((item) => item[1]);
const expectedSitemapUrls = collections.length + 12 + featuredProducts.length;
if (sitemapUrls.length !== expectedSitemapUrls) errors.push(`expected ${expectedSitemapUrls} sitemap URLs, found ${sitemapUrls.length}`);
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push("sitemap has duplicate URLs");
if (sitemap.includes("<lastmod>")) errors.push("sitemap must not emit an unreliable build-date lastmod value");
for (const url of sitemapUrls) if (!hasTrailingSlash(url)) errors.push(`sitemap URL must use a trailing slash: ${url}`);
for (const product of featuredProducts) if (!sitemapUrls.includes(`${baseUrl}/products/${product.slug}/`)) errors.push(`retained product missing from sitemap: ${product.slug}`);
for (const product of products.filter((item) => !item.homepage)) if (sitemapUrls.includes(`${baseUrl}/products/${product.slug}/`)) errors.push(`redirected product must not appear in sitemap: ${product.slug}`);
if (!sitemapUrls.includes(`${baseUrl}/collections/aviation-flight-suits/`)) errors.push("aviation flight suits landing page missing from sitemap");

const expectedSeoTitles = new Map([
  ["index.html", "OEM/ODM Custom Workwear & Uniform Manufacturer China | LF Clothing"],
  ["custom-workwear/index.html", "Custom Workwear Supplier in China | LF Clothing"],
  ["custom-jackets/index.html", "Custom Jacket Supplier in China | LF Clothing"],
  ["custom-suits/index.html", "Custom Corporate Suit Supplier China | LF Clothing"],
  ["school-uniforms/index.html", "Custom School Uniform Supplier China | LF Clothing"],
  ...collections.map((collection) => [`collections/${collection.slug}/index.html`, collection.seoTitle]),
  ["collections/aviation-flight-suits/index.html", "Custom Flight Suit & Aviation Uniform Supplier China | LF Clothing"],
]);
for (const [rel, expectedTitle] of expectedSeoTitles) {
  const html = await readFile(path.join(root, ...rel.split("/")), "utf8");
  const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim());
  if (title !== expectedTitle) errors.push(`${rel}: expected SEO title "${expectedTitle}", found "${title || ""}"`);
}

const homepage = await readFile(path.join(root, "index.html"), "utf8");
if (!homepage.includes('<script src="/analytics.js"></script>')) errors.push("homepage is missing the analytics bootstrap");
if (!homepage.includes('data-cookie-banner')) errors.push("homepage is missing analytics consent controls");
const homepageRequirements = [
  ["representative product tiles", (homepage.match(/class="home-product-tile"/g) || []).length, 9],
  ["homepage capability cards", (homepage.match(/class="home-capability-card"/g) || []).length, 6],
  ["visual process steps", (homepage.match(/class="visual-process-card"/g) || []).length, 7],
  ["visual process detail links", (homepage.match(/class="visual-process-more"/g) || []).length, 1],
  ["certificate logos", (homepage.match(/class="certificate-logo"/g) || []).length, 8],
  ["why choose reasons", (homepage.match(/class="why-choose-card"/g) || []).length, 5],
];
for (const [label, actual, expected] of homepageRequirements) if (actual !== expected) errors.push(`homepage expected ${expected} ${label}, found ${actual}`);
if (homepage.includes("Four main product lines") || homepage.includes("Start with the Product You Need")) errors.push("homepage still contains the removed four-product-line section");
if (homepage.includes("Flexible Customization with One Accountable Contact")) errors.push("homepage still contains the replaced long why-choose section");
for (const removedFact of ["100,000 pcs", "10,000+", "Representative export markets", "coordinated production personnel", "1.5 million pieces"]) if (homepage.includes(removedFact)) errors.push(`homepage still contains removed company fact: ${removedFact}`);
if (homepage.includes("Quick Answers About LF Clothing") || homepage.includes('"@type":"FAQPage"')) errors.push("homepage still contains the FAQ section or FAQ structured data");
const aboutPage = await readFile(path.join(root, "about", "index.html"), "utf8");
if (!aboutPage.includes("Quick Answers About LF Clothing")) errors.push("about page is missing the relocated FAQ section");
if (!aboutPage.includes('"@type":"FAQPage"')) errors.push("about page is missing FAQ structured data");
if ((aboutPage.match(/class="faq-grid"/g) || []).length !== 1) errors.push("about page must contain exactly one FAQ grid");
const privacyPage = await readFile(path.join(root, "privacy", "index.html"), "utf8");
if (!privacyPage.includes("How LF Clothing Uses Website and Inquiry Data")) errors.push("privacy page content is missing");
if (!privacyPage.includes('noindex,follow')) errors.push("privacy page must remain outside the search index");
if (sitemapUrls.includes(`${baseUrl}/privacy/`)) errors.push("privacy page must not be included in the SEO sitemap");

const productsPage = await readFile(path.join(root, "products", "index.html"), "utf8");
if ((productsPage.match(/class="product-category-link"/g) || []).length !== collections.length + 1) errors.push("products page must link to every product collection and the aviation collection");
for (const collection of collections) if (!productsPage.includes(`href="/collections/${collection.slug}/"`)) errors.push(`products page is missing collection link: ${collection.slug}`);
if (!productsPage.includes(`href="/collections/aviation-flight-suits/"`)) errors.push("products page is missing aviation collection link");
if (/\/assets\/(?:cases|capabilities)\/[^"'<>\s]+\.png/i.test(combined)) errors.push("public pages still reference an unoptimized case or capability PNG");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} HTML pages, ${featuredProducts.length} retained product details, ${productRedirectLines.length} product redirects, ${sitemapUrls.length} sitemap URLs and all referenced local assets.`);
