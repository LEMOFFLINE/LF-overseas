import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || "dist");
const products = JSON.parse(await readFile(path.resolve("data/products.json"), "utf8"));
const collections = JSON.parse(await readFile(path.resolve("data/collections.json"), "utf8"));
const buyerPrograms = JSON.parse(await readFile(path.resolve("data/buyer-programs.json"), "utf8"));
const projectStudies = JSON.parse(await readFile(path.resolve("data/project-studies.json"), "utf8"));
const catalogPages = JSON.parse(await readFile(path.resolve("data/catalog-pages.json"), "utf8"));
const featuredProducts = products.filter((product) => product.homepage);
const errors = [];
const baseUrl = "https://lfclothing.com";
const productBySku = new Map(products.map((product) => [product.sku, product]));
const originalDetailSkus = ["GAR-WJ-001", "GAR-CO-003", "GAR-HV-001", "GAR-OJ-004", "GAR-KN-003", "GAR-OJ-006", "GAR-BL-002", "GAR-PO-002"];
const additionalDetailSkus = Array.isArray(catalogPages.additionalDetailSkus) ? catalogPages.additionalDetailSkus : [];
if (!Array.isArray(catalogPages.additionalDetailSkus)) errors.push("catalog-pages.additionalDetailSkus must be an array");
if (new Set(additionalDetailSkus).size !== additionalDetailSkus.length) errors.push("additional detail SKUs must be unique");
for (const sku of additionalDetailSkus) {
  if (!productBySku.has(sku)) errors.push(`unknown additional detail SKU: ${sku}`);
  if (featuredProducts.some((product) => product.sku === sku)) errors.push(`additional detail SKU already belongs to the featured set: ${sku}`);
}
const detailProductSkus = new Set([...featuredProducts.map((product) => product.sku), ...additionalDetailSkus]);
const detailProducts = products.filter((product) => detailProductSkus.has(product.sku));
const redirectedProducts = products.filter((product) => !detailProductSkus.has(product.sku));
const detailProductsByPath = new Map(detailProducts.map((product) => [`products/${product.slug}/index.html`, product]));
const detailUrlPaths = new Set(detailProducts.map((product) => `/products/${product.slug}/`));
for (const sku of originalDetailSkus) if (!detailProductSkus.has(sku)) errors.push(`original retained product detail must remain published: ${sku}`);
for (const [sku, seo] of Object.entries(catalogPages.seoOverrides || {})) {
  if (!detailProductSkus.has(sku) || !productBySku.has(sku)) errors.push(`SEO override requires a published detail SKU: ${sku}`);
  if (!seo || typeof seo.title !== "string" || typeof seo.description !== "string" || !seo.title.trim() || !seo.description.trim()) errors.push(`SEO override must contain a title and description: ${sku}`);
}
const productProgramRoutes = {
  "industrial-workwear": ["/custom-workwear/"],
  "protective-hi-vis": ["/collections/protective-hi-vis/", "/custom-workwear/"],
  "cold-weather-outdoor-workwear": ["/custom-jackets/", "/custom-workwear/", "/event-staff-uniforms/"],
  "corporate-service-uniforms": ["/collections/corporate-service-uniforms/", "/custom-suits/"],
  "team-staff-apparel": ["/event-staff-uniforms/", "/collections/corporate-service-uniforms/", "/school-uniforms/"],
};

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

function robotsTokens(html) {
  const tokens = new Set();
  for (const match of html.matchAll(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi)) {
    const content = match[0].match(/\bcontent=(["'])(.*?)\1/i)?.[2] || "";
    for (const token of decodeHtml(content).toLowerCase().split(/[,\s]+/).filter(Boolean)) tokens.add(token);
  }
  return tokens;
}

function expectedCanonicalFor(rel) {
  return `${baseUrl}${rel === "index.html" ? "/" : `/${rel.replace(/\/index\.html$/, "/")}`}`;
}

function internalLinkPaths(html, pageUrl) {
  const paths = new Set();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
  for (const match of main.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1/gi)) {
    try {
      const url = new URL(decodeHtml(match[2]), pageUrl);
      if (url.origin === baseUrl) paths.add(url.pathname);
    } catch {}
  }
  return paths;
}

function bodyProgramLinkPaths(html, pageUrl) {
  // Navigation, breadcrumb links and unrelated product cards must not satisfy the
  // requirement for an intentional link from a product to a purchasing program.
  const content = html
    .replace(/<nav\b[^>]*\bclass=["'][^"']*\bbreadcrumb\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<article\b[^>]*\bclass=["'][^"']*\bproduct-card\b[^"']*["'][^>]*>[\s\S]*?<\/article>/gi, "");
  return internalLinkPaths(content, pageUrl);
}

function validateOutfitTable(html, program, rel) {
  const plan = program.outfitPlan;
  if (!plan || !Array.isArray(plan.rows) || plan.rows.length < 3 || !Array.isArray(plan.columns) || plan.columns.length < 3) {
    errors.push(`${rel}: outfit plan needs at least three staff-role rows and three columns`);
    return;
  }
  const table = html.match(/<table\b[^>]*\bclass=["'][^"']*\boutfit-table\b[^"']*["'][^>]*>([\s\S]*?)<\/table>/i)?.[1];
  if (!table) { errors.push(`${rel}: staff-role outfit table is missing`); return; }
  const head = table.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/i)?.[1] || "";
  const body = table.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i)?.[1] || "";
  const rows = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1]);
  if ((head.match(/<th\b[^>]*\bscope=["']col["']/gi) || []).length !== plan.columns.length) errors.push(`${rel}: outfit table needs scoped column headings`);
  if (rows.length !== plan.rows.length) errors.push(`${rel}: expected ${plan.rows.length} outfit-plan rows, found ${rows.length}`);
  for (const [index, row] of rows.entries()) {
    if ((row.match(/<th\b[^>]*\bscope=["']row["']/gi) || []).length !== 1) errors.push(`${rel}: outfit row ${index + 1} needs one staff-role heading`);
    const cells = [...row.matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)];
    if (cells.length !== plan.columns.length || cells.some((match) => !decodeHtml(match[1].replace(/<[^>]+>/g, "")).trim())) errors.push(`${rel}: outfit row ${index + 1} has missing or empty cells`);
  }
}

async function validateSchemaImages(value, rel) {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) await validateSchemaImages(child, rel);
    return;
  }
  if (typeof value !== "string") return;
  let url;
  let pathname;
  try {
    url = new URL(value, expectedCanonicalFor(rel));
    pathname = decodeURIComponent(url.pathname);
  } catch { return; }
  if (url.origin !== baseUrl || !/\.(?:avif|gif|ico|jpe?g|png|svg|webp)\/?$/i.test(pathname)) return;
  if (!await exists(path.join(root, pathname.slice(1)))) errors.push(`${rel}: missing local JSON-LD image ${value}`);
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
  const robots = robotsTokens(html);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${rel}: expected one H1, found ${h1Count}`);
  if (!title || title.length < 20 || title.length > 72) errors.push(`${rel}: title length ${title?.length || 0}`);
  if (!description || description.length < 70 || description.length > 190) errors.push(`${rel}: description length ${description?.length || 0}`);
  if (!is404 && !canonical?.startsWith("https://lfclothing.com/")) errors.push(`${rel}: invalid canonical`);
  if (!is404 && !hasTrailingSlash(canonical)) errors.push(`${rel}: canonical must use a trailing slash`);
  if (!is404 && canonical !== expectedCanonicalFor(rel)) errors.push(`${rel}: canonical must point to ${expectedCanonicalFor(rel)}`);
  if (!is404 && !isPrivacy && (!robots.has("index") || !robots.has("follow") || robots.has("noindex") || robots.has("nofollow") || robots.has("none"))) errors.push(`${rel}: not indexable`);
  if ((is404 || isPrivacy) && (!robots.has("noindex") || !robots.has("follow") || robots.has("index") || robots.has("nofollow") || robots.has("none"))) errors.push(`${rel}: auxiliary page must be noindex,follow`);
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
    try { await validateSchemaImages(JSON.parse(json[1]), rel); } catch (error) { errors.push(`${rel}: invalid JSON-LD ${error.message}`); }
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
const expectedProductDetails = new Set(detailProductsByPath.keys());
const actualProductDetails = new Set(generatedProductDetails.map((file) => path.relative(root, file).replaceAll("\\", "/")));
if (featuredProducts.length !== 8) errors.push(`expected 8 featured products, found ${featuredProducts.length}`);
for (const rel of expectedProductDetails) if (!actualProductDetails.has(rel)) errors.push(`missing retained product detail page: ${rel}`);
for (const rel of actualProductDetails) if (!expectedProductDetails.has(rel)) errors.push(`unexpected product detail page: ${rel}`);
for (const file of generatedProductDetails) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const html = await readFile(file, "utf8");
  if (html.includes('"@type":"Product"')) errors.push(`${rel}: product rich-result schema must not be emitted without truthful offers or reviews`);
  if (!html.includes('"@type":"BreadcrumbList"')) errors.push(`${rel}: breadcrumb structured data missing`);
  const product = detailProductsByPath.get(rel);
  if (product) {
    const expectedSeo = { ...product.seo, ...(catalogPages.seoOverrides?.[product.sku] || {}) };
    const actualTitle = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim());
    if (actualTitle !== expectedSeo.title) errors.push(`${rel}: expected product SEO title "${expectedSeo.title}", found "${actualTitle}"`);
    const links = bodyProgramLinkPaths(html, expectedCanonicalFor(rel));
    const expectedRoutes = productProgramRoutes[product.primaryCollection] || [];
    if (!expectedRoutes.some((route) => links.has(route))) errors.push(`${rel}: missing contextual body link to an applicable purchasing program (${expectedRoutes.join(", ")})`);
  }
}

const redirects = await readFile(path.join(root, "_redirects"), "utf8");
const productRedirectLines = redirects.split(/\r?\n/).filter((line) => line.startsWith("/products/"));
if (productRedirectLines.length !== redirectedProducts.length) errors.push(`expected ${redirectedProducts.length} product redirects, found ${productRedirectLines.length}`);
for (const product of detailProducts) if (redirects.includes(`/products/${product.slug}/ `)) errors.push(`retained product must not redirect: ${product.slug}`);
for (const product of redirectedProducts) if (!redirects.includes(`/products/${product.slug}/ `)) errors.push(`missing legacy product redirect: ${product.slug}`);

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
const expectedSitemapUrls = collections.length + 13 + detailProducts.length + projectStudies.length;
if (sitemapUrls.length !== expectedSitemapUrls) errors.push(`expected ${expectedSitemapUrls} sitemap URLs, found ${sitemapUrls.length}`);
for (const study of projectStudies) if (!sitemapUrls.includes(`${baseUrl}/projects/${study.slug}/`)) errors.push(`project study missing from sitemap: ${study.slug}`);
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push("sitemap has duplicate URLs");
if (sitemap.includes("<lastmod>")) errors.push("sitemap must not emit an unreliable build-date lastmod value");
for (const url of sitemapUrls) if (!hasTrailingSlash(url)) errors.push(`sitemap URL must use a trailing slash: ${url}`);
for (const product of detailProducts) if (!sitemapUrls.includes(`${baseUrl}/products/${product.slug}/`)) errors.push(`retained product missing from sitemap: ${product.slug}`);
for (const product of redirectedProducts) if (sitemapUrls.includes(`${baseUrl}/products/${product.slug}/`)) errors.push(`redirected product must not appear in sitemap: ${product.slug}`);
if (!sitemapUrls.includes(`${baseUrl}/collections/aviation-flight-suits/`)) errors.push("aviation flight suits landing page missing from sitemap");
if (!sitemapUrls.includes(`${baseUrl}/event-staff-uniforms/`)) errors.push("event staff uniforms landing page missing from sitemap");

const expectedSeoTitles = new Map([
  ["index.html", "Custom Clothing Manufacturer in China | LF Clothing"],
  ["custom-workwear/index.html", buyerPrograms.workwear.title],
  ["event-staff-uniforms/index.html", buyerPrograms.eventStaff.title],
  ["customization/index.html", "Bespoke Staff Uniforms & Clothing Customization | LF Clothing"],
  ["custom-jackets/index.html", "Custom Jacket Supplier in China | LF Clothing"],
  ["custom-suits/index.html", "Custom Corporate Suit Supplier China | LF Clothing"],
  ["school-uniforms/index.html", "Custom School Uniform Supplier China | LF Clothing"],
  ...collections.map((collection) => [`collections/${collection.slug}/index.html`, collection.seoTitle]),
  ["collections/corporate-service-uniforms/index.html", buyerPrograms.corporate.title],
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
  ["certificate logos", (homepage.match(/class="certificate-logo"/g) || []).length, 3],
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
if (!privacyPage.includes("lf_country")) errors.push("privacy page is missing the country preference cookie disclosure");
if (!robotsTokens(privacyPage).has("noindex")) errors.push("privacy page must remain outside the search index");
if (sitemapUrls.includes(`${baseUrl}/privacy/`)) errors.push("privacy page must not be included in the SEO sitemap");
const inquiryPage = await readFile(path.join(root, "inquiry", "index.html"), "utf8");
for (const field of ["name", "email", "phone", "countryCode", "message"]) {
  const fieldPattern = new RegExp(`name=["']${field}["'][^>]*\\brequired\\b`, "i");
  if (!fieldPattern.test(inquiryPage)) errors.push(`inquiry page is missing required field: ${field}`);
}
if (!/<input[^>]*name=["']email["'][^>]*type=["']email["']/i.test(inquiryPage)) errors.push("inquiry email field must use type=email");
if (!/<select[^>]*name=["']countryCode["'][^>]*data-country-select/i.test(inquiryPage)) errors.push("inquiry country field must use the country selector");

const productsPage = await readFile(path.join(root, "products", "index.html"), "utf8");
if ((productsPage.match(/class="product-category-link"/g) || []).length !== collections.length + 2) errors.push("products page must link to every product collection, aviation and event staff uniforms");
for (const collection of collections) if (!productsPage.includes(`href="/collections/${collection.slug}/"`)) errors.push(`products page is missing collection link: ${collection.slug}`);
if (!productsPage.includes(`href="/collections/aviation-flight-suits/"`)) errors.push("products page is missing aviation collection link");
if (!productsPage.includes(`href="/event-staff-uniforms/"`)) errors.push("products page is missing event staff uniforms link");
const buyerRoutes = ["/collections/corporate-service-uniforms/", "/event-staff-uniforms/", "/custom-workwear/"];
for (const [rel, html] of [["index.html", homepage], ["products/index.html", productsPage]]) {
  const links = internalLinkPaths(html, expectedCanonicalFor(rel));
  for (const route of buyerRoutes) if (!links.has(route)) errors.push(`${rel}: missing buyer route link ${route}`);
}
const eventStaffPage = await readFile(path.join(root, "event-staff-uniforms", "index.html"), "utf8");
const eventStaffLinks = internalLinkPaths(eventStaffPage, `${baseUrl}/event-staff-uniforms/`);
for (const route of ["/customization/", "/inquiry/"]) if (!eventStaffLinks.has(route)) errors.push(`event-staff-uniforms/index.html: missing next-step link ${route}`);
const corporatePage = await readFile(path.join(root, "collections/corporate-service-uniforms/index.html"), "utf8");
validateOutfitTable(corporatePage, buyerPrograms.corporate, "collections/corporate-service-uniforms/index.html");
validateOutfitTable(eventStaffPage, buyerPrograms.eventStaff, "event-staff-uniforms/index.html");

for (const route of buyerRoutes) {
  const rel = `${route.slice(1)}index.html`;
  const html = await readFile(path.join(root, rel), "utf8");
  const cards = [...html.matchAll(/<article\b[^>]*\bclass=["'][^"']*\bproduct-card\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi)];
  if (!cards.length) errors.push(`${rel}: selected product references are missing`);
  for (const [index, card] of cards.entries()) {
    const mediaLinks = [...card[1].matchAll(/<a\b[^>]*>/gi)].filter((match) => /\bclass=["'][^"']*\bproduct-media\b[^"']*["']/i.test(match[0]));
    const href = mediaLinks[0]?.[0].match(/\bhref=(["'])(.*?)\1/i)?.[2];
    let destination;
    try { destination = new URL(decodeHtml(href), `${baseUrl}${route}`); } catch {}
    if (mediaLinks.length !== 1 || !href || destination?.origin !== baseUrl || !detailUrlPaths.has(destination?.pathname)) errors.push(`${rel}: selected product ${index + 1} image must link to a published detail page, not an inquiry or redirect`);
  }
}

const aviationPage = await readFile(path.join(root, "collections/aviation-flight-suits/index.html"), "utf8");
const flightProject = aviationPage.match(/<section\b[^>]*\bid=["']flight-suit-project["'][^>]*>([\s\S]*?)<\/section>/i)?.[1];
if (!flightProject) errors.push("aviation page is missing its completed flight-suit project section");
else {
  const projectText = decodeHtml(flightProject.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  const projectFacts = [
    ["ten-suit completed order", /\b(?:10|ten)\s+(?:custom\s+flight\s+|flight\s+)?suits\b/i],
    ["98% cotton material", /\b98\s*%\s*cotton\b/i],
    ["2% conductive fibre material", /\b2\s*%\s*conductive\s+fib(?:re|er)\b/i],
    ["one sample-revision round", /\b(?:one|1)\s+round\b/i],
    ["28-day project interval", /\b28\s+days?\b/i],
    ["order-to-arrival context", /\border\s+to\s+arrival\b/i],
    ["Friedrichshafen destination", /\bFriedrichshafen\b/i],
    ["Germany destination", /\bGermany\b/i],
    ["FedEx International Priority service", /\bFedEx\s+International\s+Priority\b/i],
    ["material-versus-garment evidence boundary", /fabric\s+reports?\s+(?:do(?:es)?\s+not|cannot)\s+certify\s+(?:the\s+)?finished\s+(?:suit|garment)/i],
  ];
  for (const [label, pattern] of projectFacts) if (!pattern.test(projectText)) errors.push(`aviation project is missing its confirmed ${label}`);
  if (!/\bhref=["']\/assets\/cases\/flight-suit-sample-original\.jpg["']/i.test(flightProject)) errors.push("aviation project must link to the original sample photograph");
  if (!/\bAI\b/i.test(projectText)) errors.push("aviation project must disclose the AI visualization accompanying the original-photo link");
}
if (/\/assets\/(?:cases|capabilities)\/[^"'<>\s]+\.png/i.test(combined)) errors.push("public pages still reference an unoptimized case or capability PNG");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} HTML pages, ${detailProducts.length} retained product details (${featuredProducts.length} featured), ${productRedirectLines.length} product redirects, ${sitemapUrls.length} sitemap URLs and all referenced local assets.`);
