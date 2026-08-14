import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const products = JSON.parse(await readFile(path.join(root, "data", "products.json"), "utf8"));
const collections = JSON.parse(await readFile(path.join(root, "data", "collections.json"), "utf8"));
const styles = await readFile(path.join(root, "site-src", "styles.css"), "utf8");
const siteJs = await readFile(path.join(root, "site-src", "site.js"), "utf8");
const baseUrl = "https://lfclothing.com";
const today = "2026-08-12";

const partners = [
  ["3M", "3m.jpg"], ["All Nippon Airways", "ana.jpg"], ["Apple", "apple.jpg"], ["BMW", "bmw.jpg"],
  ["Volkswagen", "volkswagen.jpg"], ["Hyundai", "hyundai.jpg"], ["IBM", "ibm.jpg"], ["Mercedes-Benz", "mercedes-benz.jpg"],
  ["Toyota", "toyota.jpg"], ["PetroChina", "petrochina.jpg"], ["Sinopec", "sinopec.jpg"], ["ITOCHU Corporation", "itochu.jpg"],
  ["SMS group", "sms-group.jpg"], ["YKK", "ykk.jpg"], ["HPH Consorcio", "hph-consorcio.jpg"], ["REC", "rec.jpg"],
  ["FESCO", "fesco.jpg"], ["ORDINS", "ordins.jpg"],
];

const projectDisclaimer = "Some projects were supplied through procurement companies, project partners or other purchasing channels. Brand names and logos identify project end users or supplied programs and do not imply endorsement, sponsorship or a direct contractual relationship with LF unless specifically stated.";

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const absolute = (url) => `${baseUrl}${url}`;
const collectionBySlug = new Map(collections.map((item) => [item.slug, item]));
const productBySku = new Map(products.map((item) => [item.sku, item]));
const productUrl = (product) => `/products/${product.slug}`;
const inquiryUrl = (product) => `/inquiry?request=Product%20Inquiry&sku=${encodeURIComponent(product.sku)}&product=${encodeURIComponent(product.name)}`;

function activeClass(active, key) { return active === key ? " class=\"is-active\"" : ""; }

function header(active = "") {
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="nav-wrap">
    <a class="brand" href="/" aria-label="LF Clothing home"><img src="/assets/brand/lingfeng-logo.webp" width="1200" height="292" alt="Lingfeng Workwear and Uniform Supply"></a>
    <nav class="nav-links" aria-label="Primary navigation">
      <a${activeClass(active, "home")} href="/">Home</a>
      <div class="nav-dropdown"><button type="button" aria-haspopup="true">Products</button><div class="dropdown-menu">
        <a href="/products">All 50 Products</a>${collections.map((item) => `<a href="/collections/${item.slug}">${escapeHtml(item.name)}</a>`).join("")}
      </div></div>
      <a${activeClass(active, "customization")} href="/customization">Customization</a>
      <a${activeClass(active, "process")} href="/process-quality">Process &amp; Quality</a>
      <a${activeClass(active, "projects")} href="/projects">Projects</a>
      <a${activeClass(active, "about")} href="/about">About</a>
    </nav>
    <div class="nav-actions"><a class="btn btn-primary" href="/inquiry">Inquiry</a><button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button></div>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container">
    <div class="footer-grid">
      <div class="footer-brand"><h3>LF Clothing</h3><p>Workwear and uniform supply for international B2B programs.</p><div class="social-links">
        <a class="social-link social-linkedin" href="https://www.linkedin.com/in/kai-wang-b6aa79420/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.1 20.45H3.54V9H7.1v11.45Z"/></svg></a>
        <a class="social-link social-facebook" href="https://www.facebook.com/profile.php?id=61591964337372" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z"/></svg></a>
        <a class="social-link social-whatsapp" href="https://wa.me/8613901335518" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.48a8.97 8.97 0 0 1-1.65-2.07c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35ZM12.04 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.22-3.74.98 1-3.65-.23-.37A9.86 9.86 0 1 1 12.04 21.79ZM20.43 3.49A11.8 11.8 0 0 0 12.05 0 11.91 11.91 0 0 0 1.72 17.84L.05 24l6.3-1.65A11.9 11.9 0 0 0 24 11.91a11.82 11.82 0 0 0-3.57-8.42Z"/></svg></a>
      </div></div>
      <div><h3>Explore</h3><div class="footer-links"><a href="/products">Products</a><a href="/customization">Customization</a><a href="/process-quality">Process &amp; Quality</a><a href="/about">About</a></div></div>
      <div><h3>Contact</h3><div class="footer-links"><a href="mailto:sales@lfclothing.com">sales@lfclothing.com</a><a href="https://wa.me/8613901335518">+86 139 0133 5518</a><span>Room 203, Building 1, No. 18 Jia, Longtai Road, Jiugong Industrial Park, Daxing District, Beijing, China.</span></div></div>
    </div><div class="footer-bottom"><span>© 2026 Beijing Lingfeng Apparel Co., Ltd. All rights reserved.</span></div>
  </div></footer>`;
}

function jsonLd(value) { return `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, "\\u003c")}</script>`; }

function metaDescription(value) {
  if (value.length <= 178) return value;
  return `${value.slice(0, 175).replace(/\s+\S*$/, "")}…`;
}

function layout({ title, description, pathName, active, body, schema = [], robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1", image = "/assets/site/process-table-hero.webp" }) {
  const url = absolute(pathName);
  description = metaDescription(description);
  const organization = {
    "@context": "https://schema.org", "@type": "Organization", "@id": `${baseUrl}/#organization`, name: "Beijing Lingfeng Apparel Co., Ltd.", alternateName: "LF Clothing", url: `${baseUrl}/`,
    logo: absolute("/assets/brand/lingfeng-logo.png"), email: "sales@lfclothing.com", telephone: "+86 139 0133 5518",
    address: { "@type": "PostalAddress", streetAddress: "Room 203, Building 1, No. 18 Jia, Longtai Road, Jiugong Industrial Park, Daxing District", addressLocality: "Beijing", addressCountry: "CN" },
    sameAs: ["https://www.linkedin.com/in/kai-wang-b6aa79420/", "https://www.facebook.com/profile.php?id=61591964337372"],
  };
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${robots}"><link rel="canonical" href="${url}">
    <meta property="og:type" content="website"><meta property="og:site_name" content="LF Clothing"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${absolute(image)}">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${absolute(image)}">
    <link rel="icon" type="image/png" sizes="48x48" href="/assets/brand/lf-icon-48.png"><link rel="icon" type="image/png" sizes="192x192" href="/assets/brand/lf-icon-192.png"><link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/apple-touch-icon.png"><link rel="stylesheet" href="/styles.css">
    ${jsonLd(organization)}${schema.map(jsonLd).join("")}</head><body>${header(active)}<main id="main">${body}</main>${footer()}<script src="/site.js" defer></script></body></html>`;
}

function breadcrumb(items, current) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${items.map(([name, url]) => `<a href="${url}">${escapeHtml(name)}</a><span>/</span>`).join("")}<span aria-current="page">${escapeHtml(current)}</span></nav>`;
}

function breadcrumbSchema(items, current, currentUrl) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [...items.map(([name, url], index) => ({ "@type": "ListItem", position: index + 1, name, item: absolute(url) })), { "@type": "ListItem", position: items.length + 1, name: current, item: absolute(currentUrl) }] };
}

function pageHero(eyebrow, title, text, crumbs = []) {
  return `<section class="page-hero"><div class="container">${crumbs.length ? breadcrumb(crumbs, title) : ""}<p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p></div></section>`;
}

function productCard(product) {
  const allCollections = [product.primaryCollection, ...product.secondaryCollections];
  return `<article class="product-card" data-product-card data-search="${escapeHtml(`${product.sku} ${product.name} ${product.garmentType} ${product.filters.join(" ")}`.toLowerCase())}" data-collections="${allCollections.join("|")}" data-type="${escapeHtml(product.garmentType)}" data-features="${escapeHtml(product.filters.join("|"))}">
    <a class="product-media" href="${productUrl(product)}"><img src="${product.images.front}" width="1280" height="1280" loading="lazy" alt="Front view of ${escapeHtml(product.name)} ${escapeHtml(product.sku)}"></a>
    <div class="product-card-body"><span class="product-code">${escapeHtml(product.sku)} · ${escapeHtml(collectionBySlug.get(product.primaryCollection).shortName)}</span><h3><a href="${productUrl(product)}">${escapeHtml(product.name)}</a></h3><p>${escapeHtml(product.summary)}</p><a class="text-link" href="${productUrl(product)}">View details</a></div>
  </article>`;
}

function logos() { return `<div class="logo-grid">${partners.map(([name, file]) => `<div class="logo-card"><img src="/assets/partners/${file}" width="480" height="240" loading="lazy" alt="${escapeHtml(name)} project logo"></div>`).join("")}</div><p class="disclaimer">${escapeHtml(projectDisclaimer)}</p>`; }

const heroBody = `<section class="home-hero" data-hero-carousel><div class="hero-carousel" aria-hidden="true">
  <div class="hero-slide is-active"><img src="/assets/site/process-table-hero.webp" width="1920" height="822" alt="" fetchpriority="high"></div>
  <div class="hero-slide"><img src="/assets/site/hero-factory-hero.webp" width="1920" height="822" alt="" loading="lazy"></div>
  <div class="hero-slide"><img src="/assets/site/workshop-rack-hero.webp" width="1920" height="822" alt="" loading="lazy"></div></div><div class="hero-shade"></div>
  <div class="container hero-inner"><div class="hero-copy"><span class="hero-kicker">International B2B Workwear &amp; Uniform Programs</span><h1>Workwear &amp; Uniform Supply, Managed from Specification to Delivery</h1><p>LF Clothing supports international B2B buyers with product development, material sourcing, managed manufacturing and hands-on quality control.</p><div class="hero-actions"><a class="btn btn-light" href="/products">Browse Products</a><a class="btn btn-secondary" href="/process-quality">How We Manage Orders</a><a class="text-link" href="/inquiry">Start an Inquiry</a></div></div></div>
  <div class="hero-dots" role="group" aria-label="Hero image carousel"><button class="hero-dot is-active" aria-label="Show product development image" aria-pressed="true"></button><button class="hero-dot" aria-label="Show production image" aria-pressed="false"></button><button class="hero-dot" aria-label="Show garment rack image" aria-pressed="false"></button></div></section>`;

const homeBody = `${heroBody}
<section class="proof-strip"><div class="container proof-grid"><div class="proof-item"><strong>50 public product configurations</strong><span>Every style has a dedicated specification page.</span></div><div class="proof-item"><strong>5 buyer-led collections</strong><span>Workwear, protective, cold weather, corporate and team.</span></div><div class="proof-item"><strong>One accountable supplier</strong><span>Specification, sourcing, follow-up, inspection and delivery.</span></div><div class="proof-item"><strong>Built for repeat supply</strong><span>Program details documented for future orders.</span></div></div></section>
<section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Product range</p><h2>A Practical Product Range for Workwear &amp; Uniform Programs</h2><p>Browse eight representative styles below, or explore all 50 public product configurations by collection, garment type, material direction or SKU.</p></div><div class="product-grid">${products.filter((item) => item.homepage).map(productCard).join("")}</div><p style="margin-top:32px"><a class="btn btn-primary" href="/products">View All 50 Products</a></p></div></section>
<section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Why LF</p><h2>Product Expertise with Managed Manufacturing</h2></div><div class="feature-grid"><article class="feature-card"><h3>Product &amp; Material Expertise</h3><p>We turn end-use requirements into a workable garment specification, fabric direction and sample brief.</p></article><article class="feature-card"><h3>Flexible Production Resources</h3><p>Production is matched to product type, construction, quantity and delivery requirements.</p></article><article class="feature-card"><h3>Hands-On Quality Control</h3><p>LF remains responsible for approved details, production follow-up, inspection and packing consistency.</p></article><article class="feature-card"><h3>Built for Repeat Supply</h3><p>Agreed specifications, colours, trims and packing instructions become the working reference for repeat orders.</p></article></div></div></section>
<section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">Configuration</p><h2>Configure the Product, Not Just the Logo</h2><p>Fabric, construction, trims, branding, labels and packaging are reviewed as one program—not as disconnected add-ons.</p></div><ul class="check-list"><li>Fabrics and reference weights</li><li>Pockets, closures, cuffs and reinforcements</li><li>Reflective, functional and branded trim options</li><li>Embroidery, printing, patches and labels</li><li>Individual packing, cartons and project marks</li></ul><p style="margin-top:26px"><a class="text-link" href="/customization">Explore customization</a></p></div><div class="photo-collage"><img src="/assets/operations/sample-showroom-01.webp" width="1800" height="1350" loading="lazy" alt="Sample garments displayed in a product showroom"><img src="/assets/operations/fabric-layer-preparation.webp" width="1280" height="1707" loading="lazy" alt="Fabric layers being prepared on a cutting table"><img src="/assets/operations/industrial-sewing-machine.webp" width="1080" height="1920" loading="lazy" alt="Industrial garment sewing machine"></div></div></section>
<section class="section section-navy"><div class="container"><div class="section-head"><p class="eyebrow">Process &amp; quality</p><h2>One Accountable Supplier from Specification to Delivery</h2><p>LF does not transfer responsibility when production begins. We coordinate the program through inspection and delivery.</p></div><div class="process-list">${["Requirement Review", "Product Specification", "Fabric & Trim Sourcing", "Sample Development", "Manufacturing Selection", "Production Follow-up", "Inspection", "Packing & Delivery"].map((name) => `<article class="process-step"><h3>${name}</h3><p>${name === "Inspection" ? "Measurements, workmanship, accessories, packing and order consistency." : "Documented coordination against the agreed project requirements."}</p></article>`).join("")}</div><p style="margin-top:32px"><a class="btn btn-light" href="/process-quality">See the full process</a></p></div></section>
<section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Project experience</p><h2>Selected Projects We Have Supplied</h2><p>Project logos identify end users or supplied programs. Relationship context is stated clearly and never presented as blanket endorsement.</p></div>${logos()}</div></section>
<section class="section section-soft"><div class="container split"><div><div class="section-head"><p class="eyebrow">Operating model</p><h2>International Supply Managed by Beijing Lingfeng Apparel</h2><p>LF Clothing is the international B2B business operated by Beijing Lingfeng Apparel. We match production resources to the product and remain accountable for specification, sourcing, coordination, quality control and export delivery.</p></div><a class="text-link" href="/about">About LF Clothing</a></div><div class="photo-collage"><img src="/assets/operations/office-meeting-space.webp" width="1706" height="1279" loading="lazy" alt="LF office meeting space"><img src="/assets/operations/sample-garment-racks-01.webp" width="1706" height="1279" loading="lazy" alt="Sample garment racks"><img src="/assets/operations/sewing-floor-overview-02.webp" width="1920" height="1080" loading="lazy" alt="Partner production sewing floor"></div></div></section>
<section class="cta-band"><div class="container cta-inner"><h2>Start with a Product. Build the Program from There.</h2><div class="cta-actions"><a class="btn btn-light" href="/products">Browse Products</a><a class="btn btn-secondary" href="/inquiry">Start an Inquiry</a><a class="text-link" style="color:#fff" href="/inquiry?request=Additional%20Styles&context=Please%20help%20me%20source%20additional%20styles.">Ask for Additional Styles</a></div></div></section>`;

const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "LF Clothing", url: `${baseUrl}/`, publisher: { "@id": `${baseUrl}/#organization` }, inLanguage: "en" };

function productsPage() {
  const types = [...new Set(products.map((item) => item.garmentType))].sort();
  const features = [...new Set(products.flatMap((item) => item.filters))].sort();
  const filters = `<section class="filter-panel"><div class="container filter-grid"><div class="field"><label for="productSearch">Search by product or SKU</label><input id="productSearch" type="search" placeholder="e.g. GAR-OJ-006 or softshell" data-filter-search></div><div class="field"><label for="collectionFilter">Collection</label><select id="collectionFilter" data-filter-collection><option value="">All collections</option>${collections.map((item) => `<option value="${item.slug}">${escapeHtml(item.name)}</option>`).join("")}</select></div><div class="field"><label for="typeFilter">Garment type</label><select id="typeFilter" data-filter-type><option value="">All garment types</option>${types.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></div><div class="field"><label for="featureFilter">Material / feature direction</label><select id="featureFilter" data-filter-feature><option value="">All directions</option>${features.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></div><button class="btn btn-secondary" type="button" data-clear-filters>Clear</button></div></section>`;
  const body = `${pageHero("50 public configurations", "Workwear & Uniform Products", "Explore the complete first product range. Use the filters to narrow by collection, garment type, material direction or SKU.")}${filters}<section class="section"><div class="container"><div class="results-row"><div class="results-count" data-results-count>50 products</div><a class="text-link" href="/inquiry?request=Additional%20Styles&context=I%20need%20a%20style%20not%20shown%20in%20the%2050-product%20range.">Ask for Additional Styles</a></div><div class="product-grid" data-product-grid>${products.map(productCard).join("")}<div class="empty-state" data-empty-state hidden><h2>No matching products</h2><p>Clear the filters or send us the garment type you need.</p></div></div></div></section>`;
  return layout({ title: "Workwear & Uniform Products | LF Clothing", description: "Browse 50 workwear and uniform product configurations from LF Clothing, including industrial, protective, cold-weather, corporate and team apparel.", pathName: "/products", active: "products", body, schema: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "LF Clothing Product Range", url: absolute("/products"), mainEntity: { "@type": "ItemList", numberOfItems: products.length, itemListElement: products.map((item, index) => ({ "@type": "ListItem", position: index + 1, url: absolute(productUrl(item)), name: item.name })) } }] });
}

function collectionPage(collection) {
  const selected = products.filter((product) => product.primaryCollection === collection.slug || product.secondaryCollections.includes(collection.slug));
  const pathName = `/collections/${collection.slug}`;
  const body = `${pageHero("Product collection", collection.name, collection.description, [["Home", "/"], ["Products", "/products"]])}<section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">Selection approach</p><h2>Choose Around the Program, Not a Generic Label</h2><p>${escapeHtml(collection.intro)}</p></div><ul class="check-list">${collection.factors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div class="feature-card"><span class="product-code">${selected.length} related products</span><h3>Need a different construction?</h3><p>Send the intended use, target quantity, climate, material direction or a reference garment. We can review additional styles without promising an unlimited catalogue.</p><a class="text-link" href="/inquiry?request=Additional%20Styles&context=${encodeURIComponent(collection.name)}">Ask for Additional Styles</a></div></div></section><section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Related products</p><h2>${escapeHtml(collection.name)} Product Range</h2></div><div class="product-grid">${selected.map(productCard).join("")}</div></div></section>`;
  return layout({ title: `${collection.name} | LF Clothing`, description: `${collection.description} Browse ${selected.length} related LF Clothing product configurations.`, pathName, active: "products", body, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"]], collection.name, pathName)] });
}

function relatedProducts(product, limit = 4) {
  return products.filter((item) => item.sku !== product.sku && (item.primaryCollection === product.primaryCollection || item.secondaryCollections.includes(product.primaryCollection))).slice(0, limit);
}

function productPage(product) {
  const collection = collectionBySlug.get(product.primaryCollection);
  const pathName = productUrl(product);
  const galleryImages = [["Front", product.images.front], ["Back", product.images.back], ...(product.images.inner ? [["Inner construction", product.images.inner]] : [])];
  const visibleProductSchema = { "@context": "https://schema.org", "@type": "Product", name: product.name, sku: product.sku, description: product.summary, image: galleryImages.map(([, image]) => absolute(image)), brand: { "@type": "Brand", name: "LF Clothing" }, category: collection.name, url: absolute(pathName), manufacturer: { "@id": `${baseUrl}/#organization` } };
  const body = `<section class="product-detail"><div class="container">${breadcrumb([["Home", "/"], ["Products", "/products"], [collection.name, `/collections/${collection.slug}`]], product.name)}<div class="product-main"><div class="product-gallery" data-gallery><div class="gallery-main"><img src="${product.images.front}" width="1280" height="1280" alt="Front view of ${escapeHtml(product.name)} ${escapeHtml(product.sku)}" data-gallery-main></div><div class="gallery-thumbs">${galleryImages.map(([label, image], index) => `<button class="gallery-thumb${index === 0 ? " is-active" : ""}" type="button" data-gallery-thumb data-image="${image}" data-alt="${escapeHtml(label)} view of ${escapeHtml(product.name)} ${escapeHtml(product.sku)}" aria-label="Show ${escapeHtml(label.toLowerCase())} view"><img src="${image}" width="1280" height="1280" alt=""></button>`).join("")}</div></div><div class="product-copy"><span class="product-code">${escapeHtml(product.sku)} · ${escapeHtml(collection.name)}</span><h1>${escapeHtml(product.name)}</h1><p class="product-lede">${escapeHtml(product.summary)}</p><div class="product-meta"><div><span>Reference weight</span><strong>${escapeHtml(product.referenceWeight.value)}</strong></div><div><span>Sampling</span><strong>Available after specification review</strong></div></div><div class="detail-actions"><a class="btn btn-primary" href="${inquiryUrl(product)}">Add SKU to Inquiry</a><a class="btn btn-secondary" href="/inquiry?request=Additional%20Styles&context=${encodeURIComponent(`${product.sku} ${product.name}`)}">Ask for Additional Styles</a></div></div></div></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Reference Specification</h2><table class="spec-table"><tr><th>Material direction</th><td>${escapeHtml(product.materials[0].value)}</td></tr><tr><th>Reference weight</th><td>${escapeHtml(product.referenceWeight.value)} — final weight confirmed in the approved specification.</td></tr><tr><th>Colours</th><td>${escapeHtml(product.colours)}</td></tr><tr><th>Sizes</th><td>${escapeHtml(product.sizes)}</td></tr></table></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Key Construction</h2><ul class="content-list">${product.construction.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Recommended Applications</h2><ul class="pill-list">${product.applications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Available Configuration Options</h2><ul class="content-list">${product.customization.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Branding, Labels &amp; Packaging</h2><div><ul class="content-list">${product.branding.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><p>${escapeHtml(product.packaging)}</p></div></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Order &amp; Sampling Guidance</h2><table class="spec-table"><tr><th>MOQ guidance</th><td>${escapeHtml(product.moq)}</td></tr><tr><th>Sample</th><td>${escapeHtml(product.sample)}</td></tr><tr><th>Bulk lead time</th><td>${escapeHtml(product.bulkLeadTime)}</td></tr></table></div></section>
  <section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Related products</p><h2>Continue Exploring ${escapeHtml(collection.shortName)}</h2></div><div class="product-grid">${relatedProducts(product).map(productCard).join("")}</div></div></section>
  <section class="cta-band"><div class="container cta-inner"><h2>Use ${escapeHtml(product.sku)} as the starting point for your program.</h2><div class="cta-actions"><a class="btn btn-light" href="${inquiryUrl(product)}">Add SKU to Inquiry</a><a class="btn btn-secondary" href="/products">Back to Products</a></div></div></section>`;
  return layout({ title: `${product.name} | ${product.sku}`, description: product.seo.description, pathName, active: "products", body, image: product.images.front, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"], [collection.name, `/collections/${collection.slug}`]], product.name, pathName), visibleProductSchema] });
}

function standardPage(name) {
  if (name === "customization") {
    const capabilityGroups = [
      { title: "Trims & Components", text: "Closures, functional components and identification details selected around the garment and its intended use.", items: [
        ["Zips, Buttons & Snap Fasteners", "/assets/capabilities/zips-buttons-snaps.png", "Zips, buttons and snap fasteners arranged on workwear fabric"],
        ["Hook-and-loop, Elastic & Sewing Thread", "/assets/capabilities/hook-loop-elastic-thread.png", "Hook-and-loop tape, elastic and industrial sewing thread"],
        ["Reflective Materials", "/assets/capabilities/reflective-material.png", "Reflective tape stitched to high-visibility fabric"],
        ["Patches, Woven Labels, Care Labels & Hangtags", "/assets/capabilities/patches-labels-hangtags.png", "Garment patches, woven labels, care labels and hangtags"],
      ] },
      { title: "Garment Construction", text: "Functional structures reviewed around movement, durability, climate and the requirements of different roles.", items: [
        ["Pockets, Plackets, Cuffs & Waist Construction", "/assets/products/gar-wj-001/front.webp", "Work jacket showing pocket, placket, cuff and waist construction"],
        ["Reinforcement Areas", "/assets/operations/operator-sewing-detail.webp", "Operator sewing reinforced garment construction"],
        ["Hoods & Removable Liners", "/assets/products/gar-oj-001/inner.webp", "Removable inner layer for a hooded work jacket"],
        ["Functional Configurations for Different Roles", "/assets/operations/sample-garment-racks-01.webp", "Workwear samples configured for different team roles"],
      ] },
      { title: "Fit & Sizing", text: "Pattern, size chart and grading work used to carry an approved fit across the required size range.", items: [
        ["Base Pattern Adjustments", "/assets/operations/pattern-and-cutting-table.webp", "Garment patterns and panels on a cutting table"],
        ["Size Chart Conversion", "/assets/operations/office-meeting-space.webp", "Product specification and size chart review meeting space"],
        ["Men's, Women's & Body-shape Adjustments", "/assets/operations/sample-showroom-03.webp", "Garment sample range for different fits and body shapes"],
        ["Full Size Grading & Sample Confirmation", "/assets/operations/sample-garment-racks-02.webp", "Graded garment samples prepared for confirmation"],
      ] },
      { title: "Branding & Packaging", text: "Brand application, product identification and packing coordinated with the garment and delivery method.", items: [
        ["Embroidery, Screen Printing, Heat Transfer & Patches", "/assets/capabilities/branding-methods.png", "Examples of embroidery, printing, heat transfer and patch branding methods"],
        ["Brand Labels & Care Labels", "/assets/capabilities/brand-care-labels.png", "Brand and wash-care labels applied inside a workwear garment"],
        ["Individual Packing, Cartons & Shipping Marks", "/assets/capabilities/packing-cartons.png", "Individually packed workwear arranged in export cartons"],
      ] },
      { title: "Sampling to Production", text: "A controlled path that keeps the approved materials and product specification connected through bulk supply.", items: [
        ["Requirement Review", "/assets/operations/office-meeting-space.webp", "Meeting space used for requirement and product review"],
        ["Material Confirmation", "/assets/operations/fabric-layer-preparation.webp", "Fabric material prepared for production confirmation"],
        ["Sample Development", "/assets/operations/sample-showroom-01.webp", "Garment samples developed for project review"],
        ["Pre-production Sample Approval", "/assets/operations/sample-showroom-02.webp", "Pre-production garment samples displayed for approval"],
        ["Bulk Production & Quality Inspection", "/assets/operations/production-floor-overview-02.webp", "Bulk garment production in a partner facility"],
        ["Specification Records & Repeat Orders", "/assets/operations/sample-garment-racks-02.webp", "Retained garment samples supporting repeat orders"],
      ] },
    ];
    const capabilitySections = capabilityGroups.map((group, groupIndex) => `<section class="capability-group${groupIndex % 2 ? " section-soft" : ""}"><div class="container"><div class="capability-group-head"><span>${String(groupIndex + 1).padStart(2, "0")}</span><div><p class="eyebrow">Customization capability</p><h2>${escapeHtml(group.title)}</h2><p>${escapeHtml(group.text)}</p></div></div><div class="capability-card-grid">${group.items.map(([title, image, alt]) => `<article class="capability-card"><div class="capability-card-media"><img src="${image}" width="1024" height="1024" loading="lazy" alt="${escapeHtml(alt)}"></div><h3>${escapeHtml(title)}</h3></article>`).join("")}</div></div></section>`).join("");
    const body = `${pageHero("Product development & customization", "Configure Every Product Detail", "Explore the specific components, garment structures, sizing work, branding, packing and production stages LF can coordinate for a workwear or uniform program.")}<section class="section capability-intro"><div class="container"><div class="section-head"><p class="eyebrow">Specific, visible capabilities</p><h2>Each Option Is Shown as a Practical Product Detail</h2><p>The cards below separate the individual choices and development stages so buyers can see what can be specified, reviewed and retained for production.</p></div></div></section>${capabilitySections}<section class="cta-band"><div class="container cta-inner"><h2>Start with your product, reference garment or technical brief.</h2><a class="btn btn-light" href="/inquiry?request=Sample%20Development">Send a Sourcing Brief</a></div></section>`;
    return layout({ title: "Garment Components & Customization | LF Clothing", description: "Review specific garment trims, construction options, sizing work, branding, packaging, sampling and production capabilities for workwear and uniform programs.", pathName: "/customization", active: "customization", body });
  }
  if (name === "process-quality") {
    const steps = [["Requirement Review", "Intended use, quantity, destination, delivery target and reference information are reviewed."], ["Product Specification", "Fabric, weight, colour, construction, size, branding and packing requirements are documented."], ["Fabric & Trim Sourcing", "Materials and components are sourced against the agreed direction and availability."], ["Sample Development", "The sample becomes the practical reference for fit, construction and presentation."], ["Manufacturing Selection", "Production resources are matched to product type, construction, quantity and timing."], ["Production Follow-up", "LF coordinates approved details, material readiness, progress and corrective action."], ["Inspection", "Measurements, appearance, stitching, accessories, quantity and packing consistency are reviewed."], ["Packing & Delivery", "Packing marks, quantity and shipment preparation are checked against the order."]];
    const body = `${pageHero("Process & quality", "One Accountable Supplier from Specification to Delivery", "LF does not transfer responsibility when production begins. We remain responsible for coordinating the program through inspection and delivery.")}<section class="section"><div class="container split"><div class="timeline">${steps.map(([title, text], index) => `<article class="timeline-item"><div class="timeline-num">${String(index + 1).padStart(2, "0")}</div><div><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</div><div class="photo-collage"><img src="/assets/operations/automated-cutting-table.webp" width="1920" height="1080" loading="lazy" alt="Automated fabric cutting table in a production partner facility"><img src="/assets/operations/operator-sewing-detail.webp" width="1280" height="1707" loading="lazy" alt="Garment operator sewing a workwear product"><img src="/assets/operations/production-floor-overview-02.webp" width="1920" height="1080" loading="lazy" alt="Overview of a partner garment production floor"></div></div></section><section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Quality checkpoints</p><h2>What We Check at Each Stage</h2></div><div class="quality-grid"><article class="quality-card"><h3>Before Production</h3><ul class="content-list"><li>Approved sample and fabric</li><li>Colour and trims</li><li>Size specification</li><li>Logo position</li><li>Packing requirement</li></ul></article><article class="quality-card"><h3>During Production</h3><ul class="content-list"><li>Construction consistency</li><li>Critical measurements</li><li>Logo and patch placement</li><li>Workmanship</li><li>Problem correction</li></ul></article><article class="quality-card"><h3>Before Shipment</h3><ul class="content-list"><li>Measurements and appearance</li><li>Stitching and accessories</li><li>Packing and quantity</li><li>Order consistency</li><li>Shipment preparation</li></ul></article></div><p class="disclaimer">Production images show offices, sample areas and production environments used in the supply process. Partner-facility images are not presented as LF-owned factories, equipment or personnel.</p></div></section>`;
    return layout({ title: "Order Process & Quality Control | LF Clothing", description: "See how LF Clothing manages workwear and uniform orders from requirement review and sampling through production follow-up, inspection and delivery.", pathName: "/process-quality", active: "process", body });
  }
  if (name === "projects") {
    const body = `${pageHero("Project experience", "Selected Projects We Have Supplied", "The logos below identify project end users or supplied programs. They are presented with relationship context and do not imply blanket endorsement.")}<section class="section"><div class="container">${logos()}</div></section><section class="section section-soft"><div class="container split"><div><div class="section-head"><p class="eyebrow">How projects are managed</p><h2>One Program Can Involve Several Purchasing Channels</h2><p>International uniform projects may be purchased directly, through procurement companies, through project partners or through another appointed channel. LF describes the supplied program carefully and does not convert end-user recognition into an unsupported client claim.</p></div></div><img class="split-media" src="/assets/operations/sample-garment-racks-02.webp" width="1706" height="1279" loading="lazy" alt="Racks of sample workwear and uniform garments"></div></section>`;
    return layout({ title: "Selected Workwear & Uniform Projects | LF Clothing", description: "Review selected end users and programs supplied through direct, procurement or project-partner channels, with clear relationship context.", pathName: "/projects", active: "projects", body });
  }
  if (name === "about") {
    const body = `${pageHero("About LF Clothing", "Product Expertise with Managed Manufacturing", "LF Clothing is the international workwear and uniform supply business operated by Beijing Lingfeng Apparel.")}<section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">Our operating model</p><h2>We Match the Production Resource to the Product</h2><p>Our work combines product development, material sourcing, manufacturing coordination, quality control and export delivery for B2B apparel programs.</p></div><p>LF does not depend on one production line for every garment type. We review the product, construction, quantity and delivery requirement, then coordinate suitable mature production resources. Responsibility for the specification, materials, sample, production follow-up, inspection and delivery remains with LF.</p><ul class="check-list"><li>One commercial and technical point of coordination</li><li>Production matched to product and program requirements</li><li>Specifications retained for repeat supply</li><li>Quality and packing followed through delivery</li></ul></div><div class="photo-collage"><img src="/assets/operations/office-meeting-space.webp" width="1706" height="1279" loading="lazy" alt="Beijing Lingfeng Apparel office meeting room"><img src="/assets/operations/sample-showroom-03.webp" width="4096" height="3072" loading="lazy" alt="Garment sample showroom"><img src="/assets/operations/sewing-line-overview-01.webp" width="1080" height="1920" loading="lazy" alt="Partner garment sewing line"></div></div></section><section class="section section-navy"><div class="container"><div class="section-head"><p class="eyebrow">Responsibility boundary</p><h2>Transparent About How Manufacturing Is Organized</h2><p>Production-partner facilities, equipment and operators remain those of the relevant production resource. LF manages the program and remains accountable for coordination and quality follow-up without presenting partner assets as wholly owned.</p></div></div></section><section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Company information</p><h2>Beijing Lingfeng Apparel Co., Ltd.</h2><p>Room 203, Building 1, No. 18 Jia, Longtai Road, Jiugong Industrial Park, Daxing District, Beijing, China.</p></div><p><strong>Email:</strong> <a class="text-link" href="mailto:sales@lfclothing.com">sales@lfclothing.com</a></p><p><strong>WhatsApp:</strong> <a class="text-link" href="https://wa.me/8613901335518">+86 139 0133 5518</a></p></div></section>`;
    return layout({ title: "About LF Clothing | Beijing Lingfeng Apparel", description: "Learn how Beijing Lingfeng Apparel manages product development, material sourcing, manufacturing coordination, quality control and export delivery.", pathName: "/about", active: "about", body });
  }
  if (name === "inquiry") {
    const body = `${pageHero("Inquiry", "Tell Us What You Need", "Leave your name, WhatsApp or phone number, and a short message. You can also attach a reference image, tech pack or other project file.")}<section class="section"><div class="container form-layout"><form class="inquiry-form" data-inquiry-form><div class="field"><label for="name">Name *</label><input id="name" name="name" autocomplete="name" required></div><div class="field"><label for="phone">WhatsApp / Phone Number *</label><input id="phone" name="phone" type="tel" autocomplete="tel" required placeholder="Include the country code"></div><div class="field"><label for="message">Message *</label><textarea id="message" name="message" required placeholder="Tell us what product or service you need. You can write freely and include any details you already know."></textarea></div><div class="field"><label for="attachment">Attachment <span>(optional)</span></label><input id="attachment" name="attachment" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"><small>Reference image, tech pack or other project file. One file, maximum 4 MB.</small></div><div class="visually-hidden" aria-hidden="true"><label for="website">Leave blank</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div><p>By submitting this form, you authorise LF Clothing to use the information to review and respond to your inquiry.</p><button class="btn btn-primary" type="submit">Send Inquiry</button><div class="form-message" tabindex="-1" data-form-message></div></form><aside class="contact-panel"><h2>Direct contact</h2><p>Email <a href="mailto:sales@lfclothing.com">sales@lfclothing.com</a></p><p>WhatsApp <a href="https://wa.me/8613901335518">+86 139 0133 5518</a></p><hr><p>We will use your contact details only to review and respond to your inquiry.</p></aside></div></section>`;
    return layout({ title: "Contact LF Clothing | Workwear & Uniform Inquiry", description: "Contact LF Clothing by name and WhatsApp or phone number, add a message, and optionally attach a project reference file.", pathName: "/inquiry", active: "inquiry", body });
  }
}

async function writePage(route, html) {
  const target = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.slice(1), "index.html");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "styles.css"), styles, "utf8");
await writeFile(path.join(dist, "site.js"), siteJs, "utf8");

await cp(path.join(root, "assets", "brand"), path.join(dist, "assets", "brand"), { recursive: true });
await cp(path.join(root, "assets", "products"), path.join(dist, "assets", "products"), { recursive: true });
await cp(path.join(root, "assets", "operations"), path.join(dist, "assets", "operations"), { recursive: true });
await cp(path.join(root, "assets", "capabilities"), path.join(dist, "assets", "capabilities"), { recursive: true });
await mkdir(path.join(dist, "assets", "site"), { recursive: true });
for (const file of ["process-table-hero.webp", "hero-factory-hero.webp", "workshop-rack-hero.webp"]) await cp(path.join(root, "assets", "site", file), path.join(dist, "assets", "site", file));
await mkdir(path.join(dist, "assets", "partners"), { recursive: true });
for (const [, file] of partners) await cp(path.join(root, "assets", "partners", file), path.join(dist, "assets", "partners", file));

await writePage("/", layout({ title: "Workwear & Uniform Supply | LF Clothing", description: "LF Clothing manages international B2B workwear and uniform programs from product specification and material sourcing through manufacturing, quality control and delivery.", pathName: "/", active: "home", body: homeBody, schema: [websiteSchema] }));
await writePage("/products", productsPage());
for (const collection of collections) await writePage(`/collections/${collection.slug}`, collectionPage(collection));
for (const page of ["customization", "process-quality", "projects", "about", "inquiry"]) await writePage(`/${page}`, standardPage(page));
for (const product of products) await writePage(productUrl(product), productPage(product));

const errorBody = `<section class="page-hero"><div class="container"><p class="eyebrow">404</p><h1>Page Not Found</h1><p>The requested page is not part of the current LF Clothing product range.</p><p style="margin-top:28px"><a class="btn btn-light" href="/products">Browse Products</a></p></div></section>`;
await writeFile(path.join(dist, "404.html"), layout({ title: "Page Not Found | LF Clothing", description: "The requested LF Clothing page could not be found. Browse the current workwear and uniform range or send LF Clothing a sourcing brief.", pathName: "/404", body: errorBody, robots: "noindex,follow" }), "utf8");

const routes = ["/", "/products", ...collections.map((item) => `/collections/${item.slug}`), "/customization", "/process-quality", "/projects", "/about", "/inquiry", ...products.map(productUrl)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${absolute(route)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`, "utf8");
for (const file of (await readdir(root)).filter((name) => name.endsWith(".txt"))) await cp(path.join(root, file), path.join(dist, file));
console.log(`Generated ${routes.length + 1} pages, ${products.length} product pages and ${collections.length} collection pages.`);
