import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderProjectStudyBody } from "./render-project-study.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const products = JSON.parse(await readFile(path.join(root, "data", "products.json"), "utf8"));
const collections = JSON.parse(await readFile(path.join(root, "data", "collections.json"), "utf8"));
const buyerPrograms = JSON.parse(await readFile(path.join(root, "data", "buyer-programs.json"), "utf8"));
const buyerCommon = JSON.parse(await readFile(path.join(root, "data", "buyer-common.json"), "utf8"));
const catalogPages = JSON.parse(await readFile(path.join(root, "data", "catalog-pages.json"), "utf8"));
const projectStudies = JSON.parse(await readFile(path.join(root, "data", "project-studies.json"), "utf8"));
const styles = await readFile(path.join(root, "site-src", "styles.css"), "utf8");
const siteJs = await readFile(path.join(root, "site-src", "site.js"), "utf8");
const analyticsJs = await readFile(path.join(root, "site-src", "analytics.js"), "utf8");
const baseUrl = "https://lfclothing.com";
const aviationRoute = "/collections/aviation-flight-suits";
const eventRoute = "/event-staff-uniforms";
const corporateRoute = "/collections/corporate-service-uniforms";
const winterEventStudy = projectStudies.find((study) => study.slug === "winter-event-clothing-2019");
const winterEventRoute = `/projects/${winterEventStudy.slug}`;

const partners = [
  ["3M", "3m.jpg"], ["All Nippon Airways", "ana.jpg"], ["Apple", "apple.jpg"], ["BMW", "bmw.jpg"],
  ["Volkswagen", "volkswagen.jpg"], ["Hyundai", "hyundai.jpg"], ["IBM", "ibm.jpg"], ["Mercedes-Benz", "mercedes-benz.jpg"],
  ["Toyota", "toyota.jpg"], ["PetroChina", "petrochina.jpg"], ["Sinopec", "sinopec.jpg"], ["ITOCHU Corporation", "itochu.jpg"],
  ["SMS group", "sms-group.jpg"], ["YKK", "ykk.jpg"], ["HPH Consorcio", "hph-consorcio.jpg"], ["REC", "rec.jpg"],
  ["FESCO", "fesco.jpg"], ["ORDINS", "ordins.jpg"],
];

const certifications = [
  ["ISO 9001", "iso-9001.webp"],
  ["ISO 45001", "iso-45001.webp"],
  ["ISO 14001", "iso-14001.webp"],
];

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
function canonicalPath(url = "/") {
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  const parsed = new URL(url, baseUrl);
  const pathname = parsed.pathname === "/" || /\.[^/]+$/.test(parsed.pathname) ? parsed.pathname : `${parsed.pathname.replace(/\/+$/, "")}/`;
  return `${pathname}${parsed.search}${parsed.hash}`;
}
const absolute = (url) => `${baseUrl}${canonicalPath(url)}`;
const absoluteAsset = (url) => new URL(url, `${baseUrl}/`).href;
const normalizeInternalLinks = (html) => html.replace(/href="(\/(?!\/)[^"]*)"/g, (_match, url) => `href="${canonicalPath(url)}"`);
const collectionBySlug = new Map(collections.map((item) => [item.slug, item]));
const productBySku = new Map(products.map((item) => [item.sku, item]));
const featuredProducts = products.filter((item) => item.homepage);
const featuredProductSkus = new Set(featuredProducts.map((item) => item.sku));
const detailProductSkus = new Set([...featuredProductSkus, ...catalogPages.additionalDetailSkus]);
const detailProducts = products.filter((item) => detailProductSkus.has(item.sku));
const productUrl = (product) => `/products/${product.slug}`;
const inquiryUrl = (product) => `/inquiry?request=Product%20Inquiry&sku=${encodeURIComponent(product.sku)}&product=${encodeURIComponent(product.name)}`;
const legacyProductTargets = {
  "industrial-workwear": "/custom-workwear/",
  "protective-hi-vis": "/collections/protective-hi-vis/",
  "cold-weather-outdoor-workwear": "/custom-jackets/",
  "corporate-service-uniforms": "/custom-suits/",
  "team-staff-apparel": "/collections/team-staff-apparel/",
};

// Earlier product URLs observed in Bing's submission history. These predate
// the GAR catalogue and have no verified one-to-one SKU replacement.
const legacyNamedProductTargets = {
  "mens-professional-suit": "/custom-suits/",
  "womens-professional-suit": "/custom-suits/",
  "coordinated-team-suit-program": "/custom-suits/",
  "business-long-sleeve-shirts": "/collections/corporate-service-uniforms/",
  "mens-business-trousers": "/custom-suits/",
  "quick-dry-corporate-polo": "/collections/team-staff-apparel/",
  "230-gsm-cotton-polo": "/collections/team-staff-apparel/",
  "130-gsm-quick-dry-t-shirt": "/event-staff-uniforms/",
  "200-gsm-cooling-feel-t-shirt": "/event-staff-uniforms/",
  "cotton-team-t-shirt": "/event-staff-uniforms/",
  "summer-short-sleeve-workwear-set": "/custom-workwear/",
  "spring-autumn-workwear-set": "/custom-workwear/",
  "engineering-short-sleeve-workwear-set": "/custom-workwear/",
  "dark-workshop-workwear-set": "/custom-workwear/",
  "breathable-short-sleeve-workwear-set": "/custom-workwear/",
  "custom-pullover-hoodie": "/collections/team-staff-apparel/",
  "colorblock-varsity-jacket": "/collections/team-staff-apparel/",
  "cotton-rich-crewneck-sweatshirt": "/collections/team-staff-apparel/",
  "stand-collar-zip-team-jacket": "/collections/team-staff-apparel/",
  "unisex-crewneck-sweatshirt": "/collections/team-staff-apparel/",
  "college-varsity-team-jacket": "/collections/team-staff-apparel/",
  "fleece-zip-team-jacket": "/collections/team-staff-apparel/",
  "three-in-one-outdoor-jacket": "/custom-jackets/",
  "lightweight-summer-cover-jacket": "/custom-jackets/",
  "lightweight-stand-collar-jacket": "/custom-jackets/",
  "three-layer-taped-seam-shell": "/custom-jackets/",
  "secondary-school-sports-set": "/school-uniforms/",
  "waffle-knit-school-sweatshirt": "/school-uniforms/",
  "quick-dry-school-sports-t-shirt": "/school-uniforms/",
};

const priorityPages = [
  { route: "/custom-workwear", label: "Custom Workwear", short: "Workwear", skus: ["GAR-WJ-001", "GAR-WJ-002", "GAR-WP-001", "GAR-WP-002", "GAR-CO-001", "GAR-CO-003"], title: "Custom Workwear Supplier in China | LF Clothing", description: "Custom work jackets, coveralls, trousers and industrial uniforms from China with MOQ guidance from 50 pieces per style/colour, sampling and export delivery support.", hero: "Custom Workwear for Industrial and Service Teams", intro: "LF supplies custom work jackets, coveralls, trousers and coordinated industrial uniforms for importers, distributors, uniform companies and corporate buyers. Start with a photo, drawing, reference garment or technical brief.", uses: ["Manufacturing and maintenance teams", "Logistics, warehousing and field service", "Service-station and infrastructure uniforms", "Summer, winter and repeat-supply programs"] },
  { route: "/custom-jackets", label: "Custom Jackets", short: "Jackets", skus: ["GAR-OJ-001", "GAR-OJ-003", "GAR-KN-003", "GAR-OJ-005", "GAR-OJ-008", "GAR-OJ-010"], title: "Custom Jacket Supplier in China | LF Clothing", description: "Custom work jackets, insulated jackets, softshells, shells and down jackets from China for corporate, staff, event and outdoor programs.", hero: "Custom Jackets for Work, Staff and Corporate Programs", intro: "LF develops work jackets, insulated outerwear, softshells, shells and down jackets with the fabric, lining, logo method, sizing and packing confirmed for each order. Fashion-led jackets can also be reviewed, but our main focus is functional B2B supply.", uses: ["Work and staff jackets", "Insulated and cold-weather outerwear", "Corporate events and branded programs", "Softshell, shell and removable-liner options"] },
  { route: "/custom-suits", label: "Custom Suits", short: "Suits", skus: ["GAR-BL-001", "GAR-TR-001", "GAR-BL-002", "GAR-TR-002", "GAR-BL-005", "GAR-BL-008"], title: "Custom Corporate Suit Supplier China | LF Clothing", description: "Custom corporate suits, blazers and tailored trousers from China for office, hospitality and service-uniform programs, with coordinated sizing and branding.", hero: "Custom Suits and Tailored Corporate Uniforms", intro: "LF supplies men's and women's suits, blazers and tailored trousers for corporate, reception, hospitality and service-uniform programs. Fabric, silhouette, lining, grading and presentation are confirmed as one coordinated range.", uses: ["Men's and women's coordinated suiting", "Office, reception and hospitality uniforms", "Wool-blend and easy-care fabric options", "Size grading, lining, labels and individual packing"] },
  { route: "/school-uniforms", label: "School Uniforms", short: "School Uniforms", skus: ["GAR-KN-001", "GAR-KN-004", "GAR-TJ-001", "GAR-TP-001", "GAR-PO-001", "GAR-TJ-005"], title: "Custom School Uniform Supplier China | LF Clothing", description: "Custom school uniforms from China for schools and purchasing teams, including tracksuits, polos, hoodies, jackets and coordinated colours, logos and sizing.", hero: "Custom School Uniforms for Schools and Student Teams", intro: "LF supplies school tracksuits, polos, hoodies, jackets, trousers and coordinated staff apparel. We support schools and their purchasing teams with sampling, size grading, school colours, logo application and repeat-order records.", uses: ["Primary and secondary school programs", "Tracksuits, polos, hoodies and outerwear", "School colours, badges and name labels", "Broad size ranges and repeat-order coordination"] },
];

const productCollectionLinks = [
  ...collections.map((collection) => ({ label: collection.name, url: `/collections/${collection.slug}` })),
  { label: "Aviation Flight Suits", url: aviationRoute },
  { label: "Event Staff Uniforms", url: eventRoute },
];

const productCopy = {
  "GAR-WP-001": "Bib work trousers with reflective details, adjustable suspenders and a weather-protection fabric option for outdoor teams.",
  "GAR-WP-002": "Cotton-rich work trousers with a conductive-fibre fabric option for industrial staff, with performance requirements reviewed for each order.",
  "GAR-WJ-001": "Cotton twill work jacket with pre-wash options for manufacturing, maintenance and general staff programs.",
  "GAR-WJ-002": "Cotton work jacket with reflective details for teams that need better low-light visibility.",
  "GAR-CO-001": "Long-sleeve cotton coverall with practical pocket and closure options for daily industrial use.",
  "GAR-WJ-003": "Reflective work jacket available with a conductive-fibre fabric option when anti-static performance is specified and verified.",
  "GAR-WJ-004": "Colour-block work jacket available with a conductive-fibre fabric option and buyer-approved trim details.",
  "GAR-DJ-001": "Dark indigo cotton denim work jacket with pre-wash and colour-setting options.",
  "GAR-OJ-001": "Hooded shell jacket with a waterproof-breathable coating option for outdoor teams and staff programs.",
  "GAR-OJ-003": "Polyester hooded work jacket with selectable synthetic, down or project-reviewed insulation.",
  "GAR-KN-003": "Stretch softshell jacket for staff, school and light-duty outdoor programs.",
  "GAR-OJ-005": "Down work jacket with a waterproof-breathable shell option for cold-weather programs.",
  "GAR-OJ-008": "Cotton work jacket with a removable insulated liner for changing seasons.",
  "GAR-OJ-010": "Insulated work jacket with a waterproof-breathable shell option and confirmed insulation route.",
  "GAR-BL-001": "Men's single-breasted wool-blend suit jacket for office, reception and hospitality uniform programs.",
  "GAR-TR-001": "Men's wool-blend tailored trousers coordinated with corporate suit programs.",
  "GAR-BL-002": "Women's long double-breasted wool-blend blazer with buyer-selected lining and presentation details.",
  "GAR-TR-002": "Tailored wool-blend uniform trousers for coordinated corporate and service ranges.",
  "GAR-BL-005": "Women's wool-blend uniform blazer for reception, office and hospitality teams.",
  "GAR-BL-008": "Men's wool-blend suit available with conductive-fibre fabric and anti-static lining options when required.",
  "GAR-KN-001": "Stretch cotton zip hoodie for school, club and staff apparel programs.",
  "GAR-KN-004": "Cotton-blend pullover hoodie for branded event crews, staff clothing and school teams.",
  "GAR-TJ-001": "Blue-and-white track jacket for coordinated school and team tracksuit programs.",
  "GAR-TP-001": "Black jogger trousers for school, team and staff uniform sets.",
  "GAR-PO-001": "Colour-block polo for event hosts, service staff and coordinated team uniforms.",
  "GAR-TJ-005": "Green-and-white track jacket with school colour and logo customization.",
  "GAR-CO-002": "Insulated work coverall with weather-protection options for cold and outdoor roles.",
  "GAR-CO-003": "Reflective coverall available with a flame-resistant finishing route when specified and tested.",
  "GAR-HV-001": "High-visibility safety vest with buyer-selected reflective material and layout.",
  "GAR-OJ-004": "High-visibility work jacket available with conductive-fibre fabric and project-specific verification.",
  "GAR-OJ-006": "Insulated work jacket available with a conductive-fibre shell and confirmed insulation options.",
  "GAR-PO-002": "Side-panel polo for staff, school and service-uniform programs.",
};

const projectCases = [
  { name: "ANA", image: "/assets/cases/ana-ground-crew-coverall.webp", alt: "ANA ground crew coverall supplied through an apparel program", fact: "LF supplied 600 one-piece ground-crew coveralls for an ANA program." },
  { name: "Mercedes-Benz", image: winterEventStudy.image, alt: winterEventStudy.imageAlt, label: "2019 winter event program", fact: winterEventStudy.summary, route: winterEventRoute, linkLabel: "Explore the complete winter outfit" },
  { name: "SMS group", image: "/assets/cases/sms-group-work-jacket.webp", alt: "SMS group branded industrial work jacket", fact: "LF has supported repeat supply of branded industrial work jackets for an SMS group program." },
  { name: "PetroChina", image: "/assets/cases/petrochina-yellow-down-jacket.webp", alt: "PetroChina yellow insulated service-station jacket project", fact: "LF has provided long-term apparel supply for PetroChina service-station programs, covering summer uniforms, winter uniforms and down jackets." },
  { name: "Sinopec", image: "/assets/cases/sinopec-winter-work-jacket.webp", alt: "Sinopec service-station winter uniform project", fact: "LF has provided long-term uniform supply for Sinopec service-station programs, covering both summer and winter staff uniforms." },
];

const pekingUniversityCase = { name: "Peking University", image: "/assets/cases/peking-university-sweatshirt.webp", alt: "Peking University event sweatshirt project", fact: "LF completed a one-time order of 1,200 Peking University event sweatshirts for a specific activity program." };
const appleStaffCase = { name: "Apple", image: "/assets/cases/apple-staff-jacket.webp", alt: "Apple branded staff jacket project", fact: "LF has supplied an Apple store-staff uniform program, including a black zip jacket with discreet chest branding." };

const projectBuyerLinks = {
  "ANA": { route: "/custom-workwear", linkLabel: "Plan your team’s workwear" },
  "Mercedes-Benz": { route: winterEventRoute, linkLabel: "Explore the complete winter outfit" },
  "SMS group": { route: "/custom-workwear", linkLabel: "Plan custom industrial workwear" },
  "PetroChina": { route: corporateRoute, linkLabel: "Plan a staff uniform range" },
  "Sinopec": { route: corporateRoute, linkLabel: "Plan a staff uniform range" },
  "IBM": { route: eventRoute, linkLabel: "Explore branded event clothing" },
  "Apple": { route: corporateRoute, linkLabel: "Plan corporate staff uniforms" },
  "Peking University": { route: eventRoute, linkLabel: "Plan clothing for your event" },
};

const homeProjectCases = [
  { ...projectCases[0], label: "600 coveralls" },
  { ...projectCases[1], label: "2,000 sets · 30 days · 2019" },
  { ...pekingUniversityCase, label: "1,200 event sweatshirts" },
  { ...projectCases[3], label: "Long-term supply" },
  { ...projectCases[4], label: "Long-term supply" },
  { ...projectCases[2], label: "Repeat supply" },
];

function activeClass(active, key) { return active === key ? " class=\"is-active\"" : ""; }

function header(active = "") {
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="nav-wrap">
    <a class="brand" href="/" aria-label="LF Clothing home"><img src="/assets/brand/lingfeng-logo.webp" width="1200" height="292" alt="Lingfeng Workwear and Uniform Supply"></a>
    <nav class="nav-links" aria-label="Primary navigation">
      <a${activeClass(active, "home")} href="/">Home</a>
      <div class="nav-dropdown"><button type="button" aria-haspopup="true">Products</button><div class="dropdown-menu">
        ${active === "inquiry" ? "" : `<a href="${corporateRoute}">Corporate Staff Uniforms</a><a href="${eventRoute}">Event Staff Clothing</a>`}${priorityPages.map((item) => `<a href="${item.route}">${escapeHtml(item.label)}</a>`).join("")}<a href="/products">Selected Products</a><a href="${aviationRoute}">Aviation Uniforms</a>
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
      <div class="footer-brand"><h3>LF Clothing</h3><p>Custom workwear, jackets, suits and school uniforms for international B2B programs.</p><div class="social-links">
        <a class="social-link social-linkedin" href="https://www.linkedin.com/in/kai-wang-b6aa79420/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.1 20.45H3.54V9H7.1v11.45Z"/></svg></a>
        <a class="social-link social-facebook" href="https://www.facebook.com/profile.php?id=61591964337372" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z"/></svg></a>
        <a class="social-link social-whatsapp" href="https://wa.me/8613901335518" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.48a8.97 8.97 0 0 1-1.65-2.07c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35ZM12.04 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.22-3.74.98 1-3.65-.23-.37A9.86 9.86 0 1 1 12.04 21.79ZM20.43 3.49A11.8 11.8 0 0 0 12.05 0 11.91 11.91 0 0 0 1.72 17.84L.05 24l6.3-1.65A11.9 11.9 0 0 0 24 11.91a11.82 11.82 0 0 0-3.57-8.42Z"/></svg></a>
      </div></div>
      <div><h3>Explore</h3><div class="footer-links"><a href="/products">Products</a><a href="/customization">Customization</a><a href="/process-quality">Process &amp; Quality</a><a href="/about">About</a></div></div>
      <div><h3>Contact</h3><div class="footer-links"><a href="mailto:sales@lfclothing.com">sales@lfclothing.com</a><a href="https://wa.me/8613901335518">+86 139 0133 5518</a><span>Room 203, Building 1, No. 18 Jia, Longtai Road, Jiugong Industrial Park, Daxing District, Beijing, China.</span></div></div>
    </div><div class="footer-bottom"><span>© 2026 Beijing Lingfeng Apparel Co., Ltd. All rights reserved.</span><span><a href="/privacy">Privacy &amp; Cookies</a><button class="footer-cookie-button" type="button" data-cookie-settings>Cookie settings</button></span></div>
  </div></footer>`;
}

function cookieBanner() {
  return `<aside class="cookie-banner" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-description" aria-hidden="true" data-cookie-banner hidden><div><h2 id="cookie-title">Analytics preferences</h2><p id="cookie-description">We use Google Analytics to understand which pages and campaigns lead to business inquiries. You can allow analytics or reject optional tracking.</p><a href="/privacy/">Privacy &amp; Cookies</a></div><div class="cookie-actions"><button class="btn btn-primary" type="button" data-cookie-accept>Allow analytics</button><button class="btn btn-outline" type="button" data-cookie-reject>Reject optional</button></div></aside>`;
}

function jsonLd(value) { return `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, "\\u003c")}</script>`; }

function metaDescription(value) {
  if (value.length <= 178) return value;
  return `${value.slice(0, 175).replace(/\s+\S*$/, "")}…`;
}

function layout({ title, description, pathName, active, body, schema = [], robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1", image = "/assets/operations/fabric-cutting-table.webp" }) {
  const url = absolute(pathName);
  description = metaDescription(description);
  const organization = {
    "@context": "https://schema.org", "@type": "Organization", "@id": `${baseUrl}/#organization`, name: "Beijing Lingfeng Apparel Co., Ltd.", alternateName: "LF Clothing", url: `${baseUrl}/`,
    logo: absoluteAsset("/assets/brand/lingfeng-logo.webp"), email: "sales@lfclothing.com", telephone: "+86 139 0133 5518",
    address: { "@type": "PostalAddress", streetAddress: "Room 203, Building 1, No. 18 Jia, Longtai Road, Jiugong Industrial Park, Daxing District", addressLocality: "Beijing", addressCountry: "CN" },
    sameAs: ["https://www.linkedin.com/in/kai-wang-b6aa79420/", "https://www.facebook.com/profile.php?id=61591964337372"],
  };
  const pageContent = normalizeInternalLinks(`${header(active)}<main id="main">${body}</main>${footer()}`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${robots}"><link rel="canonical" href="${url}">
    <meta property="og:type" content="website"><meta property="og:site_name" content="LF Clothing"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${absoluteAsset(image)}">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${absoluteAsset(image)}">
    <link rel="icon" type="image/png" sizes="48x48" href="/assets/brand/lf-icon-48.png"><link rel="icon" type="image/png" sizes="192x192" href="/assets/brand/lf-icon-192.png"><link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/apple-touch-icon.png"><link rel="stylesheet" href="/styles.css"><script src="/analytics.js"></script>
    ${jsonLd(organization)}${schema.map(jsonLd).join("")}</head><body>${pageContent}${cookieBanner()}<script src="/site.js" defer></script></body></html>`;
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
  const hasDetailPage = detailProductSkus.has(product.sku);
  const detailUrl = productUrl(product);
  const image = `<img src="${product.images.front}" width="1280" height="1280" loading="lazy" alt="Front view of ${escapeHtml(product.name)} ${escapeHtml(product.sku)}">`;
  const summary = `<details class="style-specification"><summary>Explore this reference</summary><dl><dt>Material direction</dt><dd>${escapeHtml(product.materials[0].value)}</dd><dt>Construction</dt><dd>${escapeHtml(product.construction.slice(0, 2).join(". "))}</dd><dt>Customisation</dt><dd>${escapeHtml(product.customization.slice(0, 2).join(". "))}</dd></dl></details>`;
  return `<article class="product-card" data-product-card data-search="${escapeHtml(`${product.sku} ${product.name} ${product.garmentType} ${product.filters.join(" ")}`.toLowerCase())}" data-collections="${allCollections.join("|")}" data-type="${escapeHtml(product.garmentType)}" data-features="${escapeHtml(product.filters.join("|"))}">
    ${hasDetailPage ? `<a class="product-media" href="${detailUrl}">${image}</a>` : `<div class="product-media">${image}</div>`}
    <div class="product-card-body"><span class="product-code">${escapeHtml(product.sku)} · ${escapeHtml(collectionBySlug.get(product.primaryCollection).shortName)}</span><h3>${hasDetailPage ? `<a href="${detailUrl}">${escapeHtml(product.name)}</a>` : escapeHtml(product.name)}</h3><p>${escapeHtml(productCopy[product.sku] || product.summary)}</p>${hasDetailPage ? `<p class="style-material">${escapeHtml(product.materials[0].value)}</p>` : summary}<div class="style-actions">${hasDetailPage ? `<a class="text-link" href="${detailUrl}">View specifications</a>` : ""}<a class="text-link" href="${inquiryUrl(product)}">Request this style</a></div></div>
  </article>`;
}

function logos() { return `<div class="logo-grid">${partners.map(([name, file]) => `<div class="logo-card"><img src="/assets/partners/${file}" width="480" height="240" loading="lazy" alt="${escapeHtml(name)} project logo"></div>`).join("")}</div>`; }

function inquiryForm(prefix = "inquiry") {
  return `<form class="inquiry-form" data-inquiry-form><div class="form-two"><div class="field"><label for="${prefix}-name">Name *</label><input id="${prefix}-name" name="name" autocomplete="name" required></div><div class="field"><label for="${prefix}-email">Email *</label><input id="${prefix}-email" name="email" type="email" autocomplete="email" required></div></div><div class="form-two"><div class="field"><label for="${prefix}-phone">WhatsApp / Phone *</label><input id="${prefix}-phone" name="phone" type="tel" autocomplete="tel" required placeholder="Include country code"></div><div class="field"><label for="${prefix}-country">Country / Region *</label><select id="${prefix}-country" name="countryCode" autocomplete="country" required data-country-select><option value="">Select country or region</option></select><small>Selected automatically where location information is available. You can change it.</small></div></div><div class="field"><label for="${prefix}-message">What do you need? *</label><textarea id="${prefix}-message" name="message" required placeholder="Product, quantity, destination, target date and any logo or material requirements."></textarea></div><div class="field"><label for="${prefix}-attachment">Reference file <span>(optional)</span></label><input id="${prefix}-attachment" name="attachment" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"><small>Photo, drawing, tech pack, artwork or size chart. One file, maximum 4 MB.</small></div><div class="visually-hidden" aria-hidden="true"><label for="${prefix}-website">Leave blank</label><input id="${prefix}-website" name="website" tabindex="-1" autocomplete="off"></div><button class="btn btn-primary" type="submit">Send Inquiry</button><div class="form-message" tabindex="-1" data-form-message></div></form>`;
}

function projectCaseCards(cases = projectCases, className = "") {
  return `<div class="case-card-grid ${escapeHtml(className)}">${cases.map((item) => `<article class="case-card"><div class="case-card-media ${item.logo ? "is-logo" : ""}"><img src="${item.image || item.logo}" width="1536" height="1920" loading="lazy" alt="${escapeHtml(item.alt)}"></div><div class="case-card-body"><span class="product-code">${escapeHtml(item.label || "Real project example")}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.fact)}</p>${item.route ? `<a class="text-link" href="${item.route}">${escapeHtml(item.linkLabel)}</a>` : ""}</div></article>`).join("")}</div>`;
}

const homeFaqs = buyerCommon.home.faqs.map(({ q, a }) => [q, a]);

const homeProcessCards = [
  { title: "Requirement & Design Review", image: "/assets/steps/requirement-design.webp", alt: "Garment design and pattern direction being reviewed" },
  { title: "Sampling & Confirmation", image: "/assets/steps/sampling-confirmation.webp", alt: "Garment pattern pieces prepared for sampling and confirmation" },
  { title: "Fabric Preparation & Cutting", image: "/assets/steps/fabric-cutting.webp", alt: "Automated garment fabric cutting equipment" },
  { title: "Printing & Embroidery", image: "/assets/steps/printing-embroidery.webp", alt: "Industrial embroidery machine applying a custom logo" },
  { title: "Bulk Sewing", image: "/assets/steps/bulk-sewing.webp", alt: "Garment sewing operator producing a bulk apparel order" },
  { title: "Quality Inspection", image: "/assets/steps/quality-inspection.webp", alt: "Garment production and quality inspection area" },
  { title: "Packing & Export Delivery", image: "/assets/steps/packing-export.webp", alt: "Container vessel transporting export cargo" },
];

const homeProductCards = [
  { sku: "GAR-BL-001", label: "Suits", title: "Custom Corporate Suits", route: "/custom-suits/" },
  { sku: "GAR-WC-001", label: "Work Coats", title: "Custom Work Coats", route: "/custom-workwear/" },
  { sku: "GAR-CO-001", label: "Coveralls", title: "Custom Work Coveralls", route: "/custom-workwear/" },
  { sku: "GAR-HV-001", label: "Safety Vests", title: "High-Visibility Safety Vests", route: "/collections/protective-hi-vis/" },
  { sku: "GAR-WJ-001", label: "Workwear", title: "Essential Work Jackets", route: "/custom-workwear/" },
  { sku: "GAR-OJ-001", label: "Lightweight Jackets", title: "Lightweight Shell Jackets", route: "/custom-jackets/" },
  { sku: "GAR-OJ-005", label: "Winter Jackets", title: "Insulated Winter Jackets", route: "/custom-jackets/" },
  { sku: "GAR-PO-002", label: "T-Shirts & Polos", title: "Custom T-Shirts & Polos", route: eventRoute },
  { sku: "GAR-KN-004", label: "Hoodies", title: "Custom Pullover Hoodies", route: "/collections/team-staff-apparel/" },
].map((item) => ({ ...item, product: productBySku.get(item.sku) }));

const homeCapabilityCards = [
  { title: "From Concept to Sample", text: "Start with a photo, drawing, AI concept or existing garment. We help define the details and prepare a sample before production.", image: "/assets/capabilities/home-oem-odm.webp", alt: "Apparel operator sewing a tailored garment for OEM and ODM production" },
  { title: "Full Apparel Customization", text: "Adapt an existing style or develop fabric, patterns, fit, pockets and construction around your staff roles and brand.", image: "/assets/capabilities/home-apparel-range.webp", alt: "Wide range of custom apparel samples displayed in the LF showroom" },
  { title: "Customized Fabrics & Colours", text: "Cotton, blends, functional fabrics, recycled or organic routes, colour matching and project-selected fabric weights.", image: "/assets/capabilities/home-fabrics-colours.webp", alt: "Fabric colour cards for custom garment material selection" },
  { title: "Printing, Embroidery & Branding", text: "Embroidery, patches, screen printing, heat transfer, labels, hangtags and other logo applications.", image: "/assets/capabilities/home-embroidery-branding.webp", alt: "Industrial embroidery machine applying a custom apparel logo" },
  { title: "Custom Packaging", text: "Poly bags, reusable bags, cartons, shipping marks, hangers and other export-ready packing options.", image: "/assets/capabilities/home-custom-packaging.webp", alt: "Garments presented in reusable custom packaging bags" },
  { title: "Related Products & Accessories", text: "Caps, footwear, towels and related supplies alongside clothing. PPE and safety helmets are reviewed against product-specific requirements.", image: "/assets/capabilities/home-related-products.webp", alt: "Custom bags available alongside coordinated apparel programs" },
];

const homeReasons = [
  { value: "20", unit: "years", title: "Clothing Experience" },
  { value: "One", unit: "contact", title: "Across Product Categories" },
  { value: "7–12", unit: "days", title: "Sample Turnaround" },
  { value: "By", unit: "project", title: "Production Schedule" },
  { value: "QA", unit: "& Testing", title: "Garment Quality Verification" },
];

function certificationGrid() {
  return `<div class="certificate-strip">${certifications.map(([name, file]) => `<figure class="certificate-logo"><img src="/assets/certifications/${file}" width="320" height="220" loading="lazy" alt="${escapeHtml(name)} certification logo" title="${escapeHtml(name)}"></figure>`).join("")}</div>`;
}

const heroBody = `<section class="home-hero"><picture class="home-hero-media"><source media="(max-width: 620px)" srcset="/assets/operations/production-floor-overview-01.webp"><img src="/assets/operations/fabric-cutting-table.webp" width="1920" height="1440" fetchpriority="high" alt="Garment fabric cutting and production preparation for custom workwear orders"></picture><div class="home-hero-shade" aria-hidden="true"></div><div class="container hero-inner"><div class="hero-copy"><span class="hero-kicker">${escapeHtml(buyerCommon.home.eyebrow)}</span><h1>${escapeHtml(buyerCommon.home.h1)}</h1><p>${escapeHtml(buyerCommon.home.heroIntro)}</p><div class="hero-actions"><a class="btn btn-hero" href="#home-inquiry">Request a Custom Quote</a><a class="hero-secondary-link" href="/customization/">View Our Customization Process <span aria-hidden="true">→</span></a></div></div></div></section>`;

const homeBody = `${heroBody}
<section class="proof-strip"><div class="container proof-grid"><div class="proof-item"><strong>One coordinated order</strong><span>Uniforms and related items for different staff roles.</span></div><div class="proof-item"><strong>Clothing samples: 7–12 days</strong><span>From your approved brief after order confirmation and sample payment.</span></div><div class="proof-item"><strong>Project-specific schedules</strong><span>Timing reviewed around the products, quantities and required arrival date.</span></div><div class="proof-item"><strong>Production follow-up</strong><span>LF coordinates manufacturing partners and quality checks.</span></div></div></section>
<section class="section home-product-range"><div class="container"><div class="section-head home-product-head"><p class="eyebrow">Uniforms for your company and event</p><h2>Workwear, Staff Uniforms and Branded Clothing</h2><p>Outfit reception, service staff, operations and event crews with clothing suited to each role and one consistent brand identity. Start with these real garment references or bring your own design.</p></div><div class="home-product-grid">${homeProductCards.map((item) => `<a class="home-product-tile" href="${item.route}"><div class="home-product-media"><img src="${item.product.images.front}" width="1280" height="1280" loading="lazy" alt="${escapeHtml(item.title)} product reference"></div><div class="home-product-copy"><span>${escapeHtml(item.label)}</span><h3>${escapeHtml(item.title)}</h3></div></a>`).join("")}</div><p class="home-product-action"><a class="btn btn-primary" href="/products/">View Selected Products</a></p>${buyerProgramLinks()}</div></section>
<section class="section section-soft home-capability"><div class="container"><div class="section-head home-capability-head"><p class="eyebrow">Semi-custom to fully custom</p><h2>What We Offer</h2><p>Choose the fabric, fit, construction and branding your team needs. The options below show what can be developed from a reference garment or a new concept.</p></div><div class="home-capability-grid">${homeCapabilityCards.map((item) => `<article class="home-capability-card"><img src="${item.image}" width="1800" height="1200" loading="lazy" alt="${escapeHtml(item.alt)}"><div class="home-capability-shade" aria-hidden="true"></div><div class="home-capability-copy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></div></article>`).join("")}</div></div></section>
<section class="section section-soft visual-process"><div class="container"><div class="visual-process-intro"><div><p class="eyebrow">From your team’s brief to delivery</p><h2>Turn Your Custom Apparel Brief into Production in 7 Steps</h2></div><p>Review the sample before production begins. LF follows material preparation, cutting, decoration and sewing through specialist production partners, with checks against the approved reference before packing.</p></div><div class="visual-process-grid">${homeProcessCards.map((step, index) => `<article class="visual-process-card"><img src="${step.image}" width="1600" height="1200" loading="lazy" alt="${escapeHtml(step.alt)}"><div class="visual-process-shade"></div><div class="visual-process-label"><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(step.title)}</h3></div></article>`).join("")}<a class="visual-process-more" href="/process-quality/"><span aria-hidden="true">•••</span><strong>Read More</strong><small>Process &amp; quality controls</small></a></div></div></section>
<section class="expert-cta"><div class="container expert-cta-inner"><div><p class="eyebrow">Free project review</p><h2>Get Practical Advice and a Timely Quote</h2><p>Send your product reference, quantity and destination. An LF custom apparel specialist will review the practical production route with you.</p></div><div class="cta-actions"><a class="btn btn-hero" href="#home-inquiry">Contact Your Apparel Specialist</a><a class="btn btn-secondary" href="https://wa.me/8613901335518?text=Hello%20LF%20Clothing%2C%20I%20would%20like%20free%20advice%20and%20a%20quote%20for%20a%20custom%20apparel%20project." target="_blank" rel="noopener noreferrer">WhatsApp LF</a></div></div></section>
<section class="section home-company"><div class="container"><div class="company-profile-grid"><div><div class="section-head"><p class="eyebrow">Your garment manufacturing partner in China</p><h2>20 Years of Clothing Experience</h2><p>Tailored suits, industrial workwear and event clothing require different materials and construction methods. LF draws on 20 years of clothing experience to match each product with suitable specialist production partners.</p></div><p>Our work includes sample development, one-time event orders and repeat staff-uniform supply. Explore the garments and project details below to see how different briefs have been put into production.</p><a class="text-link" href="/about/">Learn more about LF Clothing</a></div><figure class="company-profile-media"><img src="/assets/operations/production-floor-overview-02.webp" width="1920" height="1080" loading="lazy" alt="Garment production floor supporting LF custom apparel programs"><figcaption>A specialist partner production facility. LF coordinates the specification, samples, production follow-up and agreed quality checks.</figcaption></figure></div></div></section>
<section class="certificate-band"><div class="container certificate-band-inner"><h2>Our ISO Certificates</h2><div>${certificationGrid()}<p class="disclaimer">Management system certificates cover clothing sales and the related environmental and occupational health and safety management activities. Product and garment testing is reviewed separately.</p></div></div></section>
<section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Selected customer programs</p><h2>Uniform and Apparel Projects Delivered by LF</h2><p>Selected orders include one-time event programs, repeat jacket orders and long-term service-station uniform supply. Known quantities and delivery times are shown directly.</p></div>${projectCaseCards(homeProjectCases, "home-case-grid")}<p style="margin-top:28px"><a class="text-link" href="/projects">View all project examples</a></p></div></section>
<section class="why-choose"><div class="container"><div class="why-choose-head"><p class="eyebrow">Why choose LF</p><h2>Why Choose Us</h2><p>Start from your reference, review a physical sample and agree the order requirements before production. For repeat orders, LF retains a bulk garment to compare fit, construction and branding.</p></div><div class="why-choose-grid">${homeReasons.map((item) => `<article class="why-choose-card"><span class="why-choose-value"><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.unit)}</small></span><h3>${escapeHtml(item.title)}</h3></article>`).join("")}</div></div></section>
<section class="section section-soft" id="home-inquiry"><div class="container form-layout"><div><div class="section-head"><p class="eyebrow">Direct inquiry</p><h2>Send Your Product, Quantity and Target Date</h2><p>A short message is enough to start. You can attach a photo, drawing, tech pack or logo file.</p></div>${inquiryForm("home")}</div><aside class="contact-panel"><h2>Talk directly with LF</h2><p>For a faster first discussion, send the product type, expected quantity and destination on WhatsApp.</p><p><a class="btn btn-whatsapp" href="https://wa.me/8613901335518?text=Hello%20LF%20Clothing%2C%20I%20would%20like%20a%20quote." target="_blank" rel="noopener noreferrer">Open WhatsApp</a></p><hr><p><strong>MOQ guidance:</strong> 50 pieces per style/colour, subject to fabric and customization.</p><p><strong>Sample:</strong> usually 7–12 days.</p><p><strong>Production timing:</strong> confirmed for your products, quantities, customization and required arrival date.</p><hr><p>Email <a href="mailto:sales@lfclothing.com">sales@lfclothing.com</a></p></aside></div></section><a class="mobile-quote-bar" href="#home-inquiry">Request a Custom Quote</a>`;

const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "LF Clothing", url: `${baseUrl}/`, publisher: { "@id": `${baseUrl}/#organization` }, inLanguage: "en" };
const buyerFaqSection = `<section class="section section-soft about-faq"><div class="container"><div class="section-head"><p class="eyebrow">Buyer questions</p><h2>Quick Answers About LF Clothing</h2></div><div class="faq-grid">${homeFaqs.map(([question, answer]) => `<article><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("")}</div></div></section>`;
const buyerFaqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: homeFaqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };

function productsPage() {
  const body = `${pageHero("Company and event clothing", "Workwear, Staff Uniforms & Event Clothing", "Plan garments for different staff roles, from tailored suits and service polos to industrial workwear and event clothing. Use these real references as a starting point, or send your own concept for semi-custom or full development.")}<section class="product-category-links" aria-labelledby="product-category-heading"><div class="container">${buyerProgramLinks()}<h2 id="product-category-heading">Browse Product Collections</h2><nav class="product-category-nav" aria-label="Product collections">${productCollectionLinks.map((item) => `<a class="product-category-link" href="${item.url}">${escapeHtml(item.label)}</a>`).join("")}</nav></div></section><section class="section"><div class="container"><div class="results-row"><div class="results-count">${detailProducts.length} selected styles</div><a class="text-link" href="/inquiry?request=Additional%20Styles&context=Please%20review%20a%20style%20not%20shown%20in%20the%20selected%20range.">Ask for Another Style</a></div><div class="product-grid">${detailProducts.map(productCard).join("")}</div></div></section><section class="cta-band"><div class="container cta-inner"><h2>Have a reference garment, photo or technical brief?</h2><div class="cta-actions"><a class="btn btn-light" href="/inquiry">Send Your Requirements</a><a class="btn btn-secondary" href="/customization">Review Customization</a></div></div></section>`;
  return layout({ title: "Workwear, Staff Uniforms & Event Clothing | LF Clothing", description: "Explore custom workwear, staff uniforms and event clothing for your company. Start with existing styles or develop garments, branding and coordinated supplies.", pathName: "/products", active: "products", body, schema: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Selected LF Clothing Product References", url: absolute("/products") }] });
}

function programSections(program) {
  return program.sections.map((section) => `<section class="detail-section"><div class="container detail-grid"><h2>${escapeHtml(section.heading)}</h2><div><p>${escapeHtml(section.body)}</p>${section.items?.length ? `<ul class="content-list">${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</div></div></section>`).join("");
}

function programFaqs(program, title = "Questions About Your Uniform Order") {
  return `<section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Before you order</p><h2>${escapeHtml(title)}</h2></div><div class="faq-grid">${program.faqs.map(({ question, answer }) => `<article><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("")}</div></div></section>`;
}

function buyerProgramLinks() {
  return `<nav class="cta-actions" aria-label="Uniform purchasing needs"><a class="text-link" href="${corporateRoute}">Corporate staff uniforms</a><a class="text-link" href="${eventRoute}">Event staff clothing</a><a class="text-link" href="/custom-workwear">Traditional workwear</a></nav>`;
}

function outfitPlanSection(program) {
  const plan = program.outfitPlan;
  if (!plan) return "";
  return `<section class="section section-soft outfit-plan"><div class="container"><div class="section-head"><p class="eyebrow">Plan by staff role</p><h2>${escapeHtml(plan.heading)}</h2><p>${escapeHtml(plan.intro)}</p></div><div class="outfit-table-wrap"><table class="outfit-table"><caption class="visually-hidden">${escapeHtml(plan.heading)}</caption><thead><tr>${plan.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${plan.rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="disclaimer">${escapeHtml(plan.note)}</p></div></section>`;
}

function orderSummarySection(program) {
  if (!program.orderSummary) return "";
  return `<section class="proof-strip" aria-label="Order planning"><div class="container proof-grid">${program.orderSummary.map((item) => `<div class="proof-item"><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.value)}</span></div>`).join("")}</div></section>`;
}

function programContext(product) {
  const contexts = {
    "industrial-workwear": { heading: "Plan the rest of your workwear", text: "Pair this reference with jackets, trousers or coveralls for the same staff group. Review shared colours, logo placement and the size breakdown for each garment.", links: [["Plan a custom workwear order", "/custom-workwear"], ["Coordinate uniforms across departments", corporateRoute]] },
    "protective-hi-vis": { heading: "Discuss the clothing and the required performance", text: "Include the job, destination and required standard with your garment list. Material options and changes to the design need to be assessed for the exact product.", links: [["Review protective and hi-vis garment references", "/collections/protective-hi-vis"], ["See inspection and testing arrangements", "/process-quality"]] },
    "cold-weather-outdoor-workwear": { heading: "Build the layers around your team's work", text: "Tell us the climate, activity level and layers worn underneath. Coordinate the shell, insulation, pockets and branding with the rest of your staff clothing.", links: [["Plan custom staff jackets", "/custom-jackets"], ["Outfit outdoor event crews", eventRoute]] },
    "corporate-service-uniforms": { heading: "Coordinate a complete staff uniform range", text: "Use this tailored reference alongside shirts, polos or workwear for other roles. Review fabric, fit and brand details together before approving individual samples.", links: [["Plan corporate staff uniforms", corporateRoute], ["Explore corporate suit options", "/custom-suits"]] },
    "team-staff-apparel": { heading: "Use this style in a coordinated team order", text: "Match the garment to staff roles and add your artwork, quantities and size breakdown. Compare it with the other layers your team needs before sampling.", links: [["Plan event staff clothing", eventRoute], ["Coordinate corporate uniforms", corporateRoute], ["Review school uniform requirements", "/school-uniforms"]] },
  };
  const context = contexts[product.primaryCollection];
  return `<section class="detail-section"><div class="container detail-grid"><h2>${escapeHtml(context.heading)}</h2><div><p>${escapeHtml(context.text)}</p><div class="style-actions">${context.links.map(([label, url]) => `<a class="text-link" href="${url}">${escapeHtml(label)}</a>`).join("")}</div></div></div></section>`;
}

function flightSuitProjectSummary() {
  return `<section class="section section-soft flight-project" id="flight-suit-project"><div class="container split"><figure class="flight-project-media"><img src="/assets/cases/flight-suit-sample-ai-studio-v2.jpg" width="1086" height="1448" loading="lazy" alt="AI studio visualization based on LF's white flight-suit sample"><figcaption>AI visualization based on the actual LF sample. <a class="text-link" href="/assets/cases/flight-suit-sample-original.jpg" target="_blank" rel="noopener noreferrer">View original sample photograph</a></figcaption></figure><div><div class="section-head"><p class="eyebrow">Completed flight-suit project</p><h2>One concept image. Ten custom flight suits.</h2><p>The customer started with a concept image, without a technical pack or fabric specification. LF developed the sample, selected the fabric and worked through one round of refinements.</p></div><ul class="content-list"><li>Flame-resistant ripstop: 98% cotton and 2% conductive fibre, with material test reports.</li><li>Offset chest zip pockets, a flight-chart leg pocket, sleeve pockets and fleece at the back neck.</li><li>Customer-requested back and underarm ventilation; LF incorporated zips into the underarm vents.</li><li>Sample refinements: narrower leg openings, longer epaulettes and a larger back vent.</li></ul><p><strong>28 days from order to arrival:</strong> 10 suits delivered to Friedrichshafen, Germany, by FedEx International Priority.</p><p class="disclaimer">Timing describes this completed project. Fabric reports do not certify the finished suit.</p><div class="style-actions"><a class="text-link" href="/customization#flight-suit-details">Explore the development and ventilation details</a><a class="text-link" href="/inquiry?request=Aviation%20Flight%20Suit">Discuss a flight-suit brief</a></div></div></div></section>`;
}

function projectStudyPage(study) {
  const route = `/projects/${study.slug}`;
  const body = renderProjectStudyBody(study, { escapeHtml, breadcrumb, eventRoute, corporateRoute });
  return layout({ title: study.title, description: study.description, pathName: route, active: "projects", body, image: study.image, schema: [breadcrumbSchema([["Home", "/"], ["Projects", "/projects"]], "2019 Winter Event Clothing Program", route)] });
}

function buyerProjectProof(key) {
  const proof = {
    corporate: { heading: "Staff Uniforms Supplied for Real Teams", intro: "Store-staff clothing and seasonal service-station uniforms show two different ways to build a branded staff range.", cases: [appleStaffCase, projectCases[3]] },
    eventStaff: { heading: "Event Clothing Put into Production", intro: "Coordinated winter outfits and activity sweatshirts from completed orders. The quantities and timing below describe these individual projects.", cases: [projectCases[1], pekingUniversityCase] },
    workwear: { heading: "Workwear for Industrial and Ground-Crew Roles", intro: "Repeat industrial jackets and a ground-crew coverall program from LF’s existing production experience.", cases: [projectCases[2], projectCases[0]] },
  }[key];
  return `<section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Real garments, supplied programs</p><h2>${escapeHtml(proof.heading)}</h2><p>${escapeHtml(proof.intro)}</p></div>${projectCaseCards(proof.cases, "home-case-grid")}${key === "corporate" ? `<p style="margin-top:24px"><a class="text-link" href="${winterEventRoute}">See how jackets, trousers, gloves and knitted hats became one coordinated outfit</a></p>` : ""}<p class="disclaimer">Project experience includes supply through procurement partners. <a class="text-link" href="/projects">View more garments and project details</a>.</p></div></section>`;
}

function buyerLandingPage(key, route, skus, label) {
  const program = buyerPrograms[key];
  const selected = skus.map((sku) => productBySku.get(sku)).filter(Boolean);
  const body = `${pageHero("Uniforms for companies and events", program.heading, program.intro, [["Home", "/"], ["Products", "/products"]])}
  ${orderSummarySection(program)}${outfitPlanSection(program)}
  <section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Choose a starting point</p><h2>${escapeHtml(label)} Reference Styles</h2><p>Start with one of these garment references or send your own. Adapt the branding and selected details, or develop a new style for your team.</p></div><div class="product-grid">${selected.map(productCard).join("")}</div></div></section>
  ${key === "eventStaff" ? `<section class="section event-layering"><div class="container"><div class="section-head"><p class="eyebrow">Venue and weather</p><h2>Add layers for outdoor or cold-weather teams</h2><p>Start with a polo or hoodie for the role, then review a shell, softshell or insulated jacket where conditions require it. Confirm how the layers fit together and where the event branding should appear.</p></div><div class="cta-actions"><a class="text-link" href="/custom-jackets">Compare staff jacket options</a><a class="text-link" href="/collections/cold-weather-outdoor-workwear">Browse outdoor and cold-weather references</a></div></div></section>` : ""}
  ${programSections(program)}
  ${buyerProjectProof(key)}
  <section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">One contact from brief to shipment</p><h2>See How Your Order Is Followed</h2><p>Explore the production stages and quality checks LF coordinates, from sample approval and material preparation to final inspection and packing.</p></div><div class="cta-actions"><a class="text-link" href="/customization">Explore full customization</a><a class="text-link" href="/process-quality">Review quality checks</a></div></div><figure class="company-profile-media"><img src="/assets/operations/production-floor-overview-02.webp" width="1920" height="1080" loading="lazy" alt="Partner garment production floor used for custom uniform orders"><figcaption>Production through specialist partners, coordinated by LF.</figcaption></figure></div></section>
  ${programFaqs(program, `${label} Questions`)}
  <section class="section"><div class="container"><div class="section-head"><h2>Plan the Rest of Your Team’s Clothing</h2></div>${buyerProgramLinks()}</div></section>
  <section class="cta-band"><div class="container cta-inner"><h2>Share your references, quantities and required arrival date.</h2><div class="cta-actions"><a class="btn btn-light" href="/inquiry?request=${encodeURIComponent(label)}">Request a ${key === "corporate" ? "Uniform" : "Clothing"} Quote</a><a class="btn btn-secondary" href="/projects">View project examples</a></div></div></section>`;
  return layout({ title: program.title, description: program.description, pathName: route, active: "products", body, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"]], label, route)] });
}

function priorityLandingPage(page) {
  if (page.route === "/custom-workwear") page = { ...page, title: buyerPrograms.workwear.title, description: buyerPrograms.workwear.description, hero: buyerPrograms.workwear.heading, intro: buyerPrograms.workwear.intro };
  const selected = page.skus.map((sku) => productBySku.get(sku)).filter(Boolean);
  const body = `${pageHero("Custom apparel supply", page.hero, page.intro, [["Home", "/"], ["Products", "/products"]])}
  <section class="proof-strip"><div class="container proof-grid"><div class="proof-item"><strong>Order quantities</strong><span>${page.route === "/custom-workwear" ? "Regular workwear: usually from 50 garments." : "Reviewed by style, material and colour."}</span></div><div class="proof-item"><strong>Sampling</strong><span>Usually 7–12 days.</span></div><div class="proof-item"><strong>Production timing</strong><span>Confirmed for the product, quantity and customization.</span></div><div class="proof-item"><strong>Start from</strong><span>Photo, drawing, concept or reference garment.</span></div></div></section>
  <section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">What we can supply</p><h2>${escapeHtml(page.label)} Made Around Your Order</h2><p>LF confirms the fabric, construction, size range, logo method, labels, packing and delivery plan for the specific project. The approved sample becomes the production reference.</p></div><ul class="check-list">${page.uses.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div class="feature-card"><span class="product-code">How to start</span><h3>Send one clear reference</h3><p>A product photo, drawing, tech pack, existing garment or even an AI concept image is enough for an initial review. Include the expected quantity, destination and target date.</p><a class="text-link" href="/inquiry?request=${encodeURIComponent(page.label)}">Request a quote</a></div></div></section>
  <section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Selected from LF's product archive</p><h2>${escapeHtml(page.label)} Reference Styles</h2><p>These products are starting points, not fixed stock. Colours, fabrics, pockets, fit, logos and packing can be changed after review.</p></div><div class="product-grid">${selected.map(productCard).join("")}</div></div></section>
  ${page.route === "/custom-workwear" ? programSections(buyerPrograms.workwear) + buyerProjectProof("workwear") + programFaqs(buyerPrograms.workwear, "Custom Workwear Questions") + `<section class="section"><div class="container">${buyerProgramLinks()}<p><a class="text-link" href="/customization">Review fabrics, fit and customization</a></p></div></section>` : ""}
  <section class="section"><div class="container"><div class="section-head"><p class="eyebrow">From sample to delivery</p><h2>A Production Schedule for Your Order</h2><p>Sample development usually takes 7–12 days. Bulk production timing depends on the products, quantities, materials and customization. We agree the schedule around sample approval, material readiness and your required arrival date. Shipping time is reviewed separately for the destination and method.</p></div><div class="feature-grid"><article class="feature-card"><h3>1. Review</h3><p>Confirm product, quantity, size range, fabric direction, logo and target date.</p></article><article class="feature-card"><h3>2. Sample</h3><p>Develop and revise the sample until the key fit, construction and appearance details are approved.</p></article><article class="feature-card"><h3>3. Bulk &amp; inspection</h3><p>Produce against the approved reference, inspect the order and prepare the agreed packing for export.</p></article></div></div></section>
  <section class="cta-band"><div class="container cta-inner"><h2>Send your ${escapeHtml(page.short.toLowerCase())} reference and expected quantity.</h2><div class="cta-actions"><a class="btn btn-light" href="/inquiry?request=${encodeURIComponent(page.label)}">Request a Quote</a><a class="btn btn-whatsapp" href="https://wa.me/8613901335518?text=${encodeURIComponent(`Hello LF Clothing, I would like to discuss ${page.label.toLowerCase()}.`)}" target="_blank" rel="noopener noreferrer">WhatsApp LF</a></div></div></section>`;
  return layout({ title: page.title, description: page.description, pathName: page.route, active: "products", body, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"]], page.label, page.route)] });
}

function collectionPage(collection) {
  if (collection.slug === "corporate-service-uniforms") return buyerLandingPage("corporate", corporateRoute, ["GAR-BL-001", "GAR-PO-002", "GAR-WJ-001"], "Corporate Uniforms");
  const selected = detailProducts.filter((product) => product.primaryCollection === collection.slug || product.secondaryCollections.includes(collection.slug));
  const pathName = `/collections/${collection.slug}`;
  const specialistProgram = collection.slug === "industrial-workwear" ? `<p class="disclaimer">LF can also review <a class="text-link" href="${aviationRoute}">aviation flight suit requirements</a> as a separate specialist uniform program.</p>` : "";
  const body = `${pageHero("Product collection", collection.name, collection.description, [["Home", "/"], ["Products", "/products"]])}${collectionProgramSection(collection)}<section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">What to confirm</p><h2>Tell Us Where and How the Garment Will Be Used</h2><p>${escapeHtml(collection.intro)}</p></div><ul class="check-list">${collection.factors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>${specialistProgram}</div><div class="feature-card"><span class="product-code">${selected.length} selected references</span><h3>Need a different style?</h3><p>Send the intended use, target quantity, climate, material direction or a reference garment. We can review additional constructions from the internal product archive.</p><a class="text-link" href="/inquiry?request=Additional%20Styles&context=${encodeURIComponent(collection.name)}">Ask for another style</a></div></div></section><section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Selected references</p><h2>${escapeHtml(collection.name)} Examples</h2></div><div class="product-grid">${selected.map(productCard).join("")}</div></div></section>`;
  return layout({ title: collection.seoTitle, description: collection.seoDescription, pathName, active: "products", body, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"]], collection.name, pathName)] });
}

function collectionProgramSection(collection) {
  const plans = {
    "industrial-workwear": ["Buying workwear for your team?", "Use the references below to compare garment types. For a coordinated order, review staff roles, sampling, quantities and repeat supply on our workwear procurement page.", "Plan a custom workwear order", "/custom-workwear"],
    "cold-weather-outdoor-workwear": ["Plan the jackets around your staff roles", "Compare shell, softshell and insulated references here. Review the development and ordering options for your team's jackets before choosing materials and layers.", "Review custom staff jacket options", "/custom-jackets"],
    "team-staff-apparel": ["Choose the style, then plan the team order", "These polos, hoodies and other layers are garment references. Use the relevant purchasing guide to coordinate staff roles, sizes, branding and the required arrival date.", "Plan event staff clothing", eventRoute],
    "protective-hi-vis": ["Specify the job before choosing the garment", "Use these references to discuss visibility, materials and construction. Include the intended use, destination and required standard so testing needs can be reviewed for the actual order.", "Review quality checks and testing", "/process-quality"],
  };
  const plan = plans[collection.slug];
  if (!plan) return "";
  return `<section class="section collection-order-guide"><div class="container"><div class="section-head"><h2>${plan[0]}</h2><p>${plan[1]}</p></div><div class="cta-actions"><a class="text-link" href="${plan[3]}">${plan[2]}</a>${collection.slug === "team-staff-apparel" ? `<a class="text-link" href="/school-uniforms">Plan school uniforms and student teamwear</a>` : ""}</div></div></section>`;
}

function relatedFeaturedProducts(product, limit = 4) {
  const sameCollection = detailProducts.filter((item) => item.sku !== product.sku && item.primaryCollection === product.primaryCollection);
  const otherFeatured = detailProducts.filter((item) => item.sku !== product.sku && item.primaryCollection !== product.primaryCollection);
  return [...sameCollection, ...otherFeatured].slice(0, limit);
}

function productPage(product) {
  const collection = collectionBySlug.get(product.primaryCollection);
  const pathName = productUrl(product);
  const galleryImages = [["Front", product.images.front], ["Back", product.images.back], ...(product.images.inner ? [["Inner construction", product.images.inner]] : [])];
  const description = productCopy[product.sku] || product.summary;
  const seo = catalogPages.seoOverrides[product.sku] || product.seo;
  const body = `<section class="product-detail"><div class="container">${breadcrumb([["Home", "/"], ["Products", "/products"], [collection.name, `/collections/${collection.slug}`]], product.name)}<div class="product-main"><div class="product-gallery" data-gallery><div class="gallery-main"><img src="${product.images.front}" width="1280" height="1280" alt="Front view of ${escapeHtml(product.name)} ${escapeHtml(product.sku)}" data-gallery-main></div><div class="gallery-thumbs">${galleryImages.map(([label, image], index) => `<button class="gallery-thumb${index === 0 ? " is-active" : ""}" type="button" data-gallery-thumb data-image="${image}" data-alt="${escapeHtml(label)} view of ${escapeHtml(product.name)} ${escapeHtml(product.sku)}" aria-label="Show ${escapeHtml(label.toLowerCase())} view"><img src="${image}" width="1280" height="1280" alt=""></button>`).join("")}</div></div><div class="product-copy"><span class="product-code">${escapeHtml(product.sku)} · ${escapeHtml(collection.name)}</span><h1>${escapeHtml(product.name)}</h1><p class="product-lede">${escapeHtml(description)}</p><div class="product-meta"><div><span>Order quantity</span><strong>Confirmed per style</strong></div><div><span>Sampling</span><strong>Usually 7–12 days</strong></div></div><div class="detail-actions"><a class="btn btn-primary" href="${inquiryUrl(product)}">Request This Style</a><a class="btn btn-secondary" href="/customization/">Review Customization</a></div></div></div></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Reference Specification</h2><table class="spec-table"><tr><th>Material direction</th><td>${escapeHtml(product.materials[0].value)}</td></tr><tr><th>Reference weight</th><td>${escapeHtml(product.referenceWeight.value)} — final weight is confirmed in the approved specification.</td></tr><tr><th>Colours</th><td>${escapeHtml(product.colours)}</td></tr><tr><th>Sizes</th><td>${escapeHtml(product.sizes)}</td></tr></table></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Key Construction</h2><ul class="content-list">${product.construction.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Recommended Applications</h2><ul class="pill-list">${product.applications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></section>
  ${programContext(product)}
  <section class="detail-section"><div class="container detail-grid"><h2>Available Customization</h2><ul class="content-list">${product.customization.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Branding, Labels &amp; Packaging</h2><div><ul class="content-list">${product.branding.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><p>${escapeHtml(product.packaging)}</p></div></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Order, Sampling &amp; Testing</h2><div><table class="spec-table"><tr><th>MOQ guidance</th><td>${escapeHtml(product.moq)}</td></tr><tr><th>Sample</th><td>${escapeHtml(product.sample)}</td></tr><tr><th>Bulk lead time</th><td>${escapeHtml(product.bulkLeadTime)}</td></tr></table><p class="disclaimer">Fabric certificates, inspection records and third-party testing can be coordinated when required. Finished-garment performance testing, including waterproof, flame-resistant, anti-static or chemical-protection tests, is quoted separately before any compliance claim is made.</p></div></div></section>
  <section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Selected related styles</p><h2>Continue Exploring Custom Apparel</h2></div><div class="product-grid">${relatedFeaturedProducts(product).map(productCard).join("")}</div></div></section>
  <section class="cta-band"><div class="container cta-inner"><h2>Use ${escapeHtml(product.sku)} as the starting point for your program.</h2><div class="cta-actions"><a class="btn btn-light" href="${inquiryUrl(product)}">Request a Custom Quote</a><a class="btn btn-secondary" href="/products/">Back to Products</a></div></div></section>`;
  return layout({ title: seo.title, description: seo.description, pathName, active: "products", body, image: product.images.front, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"], [collection.name, `/collections/${collection.slug}`]], product.name, pathName)] });
}

function aviationFlightSuitsPage() {
  const pathName = aviationRoute;
  const referenceSkus = ["GAR-CO-001", "GAR-CO-002", "GAR-CO-003"];
  const references = referenceSkus.map((sku) => productBySku.get(sku)).filter(Boolean);
  const faqs = [
    ["Can LF develop a flight suit from a technical brief or reference garment?", "Yes. LF can review drawings, a specification, photos or a reference garment, then coordinate pattern development, material sourcing and an approval sample before bulk production."],
    ["Can aviation uniforms include flame-resistant or anti-static requirements?", "These requirements can be reviewed as project-specific options. The fabric, trims, garment construction and test route must be agreed before LF makes any compliance claim."],
    ["What information is needed for an aviation uniform quotation?", "Share the intended role, garment type, quantity, destination market, size range, material or performance targets, pocket layout, insignia and branding requirements, and delivery target."],
  ];
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };
  const body = `${pageHero("Aviation uniform development", "Custom Flight Suits & Aviation Uniforms", "China-based B2B supply for flight suits, aviation coveralls and role-specific uniforms developed from the buyer's operational brief and required verification route.", [["Home", "/"], ["Products", "/products"]])}
  ${flightSuitProjectSummary()}
  <section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">Role and garment requirements</p><h2>Start with the Aviation Job and Working Conditions</h2><p>LF reviews the wearer role, operating environment, movement, access needs, identification, climate and destination-market requirements before making the sample.</p></div><ul class="check-list"><li>Pilot, aircrew, training, maintenance or ground-support use</li><li>Pocket access, closures, adjustment and movement requirements</li><li>Badge, name, rank, reflective and other identification placement</li><li>Size range, grading, layering and wearer-specific fit</li><li>Material performance and garment testing route where required</li></ul></div><div class="feature-card"><span class="product-code">Start with your brief</span><h3>Send a drawing, specification, photo or reference garment</h3><p>The approved sample and written order details become the working production reference.</p><p><a class="text-link" href="/customization#flight-suit-details">See our real flight-suit details</a></p><a class="text-link" href="/inquiry?request=Aviation%20Flight%20Suit&context=Please%20review%20our%20flight%20suit%20or%20aviation%20uniform%20requirement.">Request an aviation uniform review</a></div></div></section>
  <section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Options to confirm</p><h2>Details Agreed Before Sampling</h2><p>The final construction depends on the role and required verification route. Fabric, fit, functional details and identification are recorded for the order.</p></div><div class="feature-grid"><article class="feature-card"><h3>Fabric &amp; Performance</h3><p>Cotton, blends and project-specific FR or anti-static directions can be reviewed. Fibre content, weight, finish and testing are confirmed for the order.</p></article><article class="feature-card"><h3>Functional Construction</h3><p>Two-way closures, action back or gusset options, adjustable waist and cuffs, reinforcement and pocket layouts are set around movement and equipment access.</p></article><article class="feature-card"><h3>Identification &amp; Branding</h3><p>Name patches, badges, rank or role identifiers, embroidery, labels and packing can be coordinated with placement approved on the sample.</p></article><article class="feature-card"><h3>Climate &amp; Layering</h3><p>Lightweight, standard and insulated directions can be reviewed around temperature, activity level and underlayers.</p></article></div></div></section>
  <section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Reference starting points</p><h2>Coverall Constructions for Technical Review</h2><p>These selected constructions are starting references, not ready-made aviation certifications. LF adapts the garment only after reviewing the actual flight suit or aviation uniform brief.</p></div><div class="product-grid">${references.map(productCard).join("")}</div></div></section>
  <section class="section section-navy"><div class="container"><div class="section-head"><p class="eyebrow">Project control</p><h2>From Requirement Review to Shipment Readiness</h2><p>LF coordinates the specification, material route, sample approval, suitable production resources, production follow-up, inspection, packing and export preparation. Where a standard or performance claim is required, the verification route is agreed before production.</p></div><div class="cta-actions"><a class="btn btn-light" href="/process-quality">Review quality control</a><a class="btn btn-secondary" href="/customization">See customization options</a></div></div></section>
  <section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Buyer questions</p><h2>Flight Suit &amp; Aviation Uniform FAQ</h2></div><div class="quality-grid">${faqs.map(([question, answer]) => `<article class="quality-card"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("")}</div></div></section>
  <section class="cta-band"><div class="container cta-inner"><h2>Send the role, quantity, destination market and technical requirements.</h2><div class="cta-actions"><a class="btn btn-light" href="/inquiry?request=Aviation%20Flight%20Suit">Start an Aviation Inquiry</a><a class="btn btn-secondary" href="/products">Browse Product References</a></div></div></section>`;
  return layout({ title: "Custom Flight Suit & Aviation Uniform Supplier China | LF Clothing", description: "Custom flight suit and aviation uniform supply from China for international B2B buyers, with specification review, sampling, quality control and export support.", pathName, active: "products", body, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"]], "Custom Flight Suits & Aviation Uniforms", pathName), faqSchema] });
}

function flightSuitDetails() {
  return `<section class="section section-soft flight-details" id="flight-suit-details" aria-labelledby="flight-details-heading"><div class="container">
    <div class="section-head"><p class="eyebrow">Real garment development</p><h2 id="flight-details-heading">From One Concept Image to 10 Custom Flight Suits</h2><p>The customer supplied a single concept image, without a technical pack or fabric specification. LF developed the first sample, selected materials and refined the garment details before production.</p></div>
    <div class="flight-detail-grid"><figure class="flight-sample"><img src="/assets/cases/flight-suit-sample-ai-studio-v2.jpg" width="1086" height="1448" loading="lazy" alt="AI visualization of a white LF flight suit with offset chest zip pockets, sleeve pockets and a leg pocket"><figcaption>AI visualization based on an LF sample developed from a customer’s concept image. <a class="text-link" href="/assets/cases/flight-suit-sample-original.jpg" target="_blank" rel="noopener noreferrer">View original sample photograph</a></figcaption></figure>
    <div class="flight-detail-copy"><h3>Material selection</h3><p>Considering the intended appearance and flight application, LF selected a flame-resistant ripstop fabric made from 98% cotton and 2% conductive fibre.</p>
    <h3>Turning the brief into garment details</h3><p>The customer requested back and underarm ventilation. Drawing on previous flight-suit and racing-garment experience, LF incorporated zips into the underarm vents.</p><ul class="content-list"><li>Offset chest zip pockets for the requested appearance</li><li>A leg pocket positioned for flight-chart access</li><li>Sleeve pockets and fleece at the back neck</li><li>Mesh ventilation openings at the back and underarms</li></ul>
    <h3>One round of sample refinements</h3><p>The sample revisions narrowed the leg openings, lengthened the epaulettes and enlarged the back-ventilation area.</p>
    <div class="flight-vent-grid"><figure><div class="flight-vent-frame"><img src="/assets/cases/flight-suit-back-vent-ai-studio-v2.jpg" width="1536" height="1024" loading="lazy" alt="AI visualization of back ventilation with mesh beneath an overlapping fabric panel"></div><figcaption><strong>Covered back vent</strong><span>Mesh beneath the outer panel. AI visualization based on the sample.</span></figcaption></figure><figure><div class="flight-vent-frame"><img src="/assets/cases/flight-suit-underarm-vent-ai-studio-v2.jpg" width="1536" height="1024" loading="lazy" alt="AI visualization of underarm ventilation with a zip opening and inner mesh panel"></div><figcaption><strong>Zipped underarm vent</strong><span>A zip opening with an inner mesh panel. AI visualization based on the sample.</span></figcaption></figure></div>
    <p>The 10-piece order was delivered to Friedrichshafen, Germany, via FedEx International Priority, 28 days after order placement. This was the complete order-to-arrival interval for this project.</p>
    <p class="disclaimer">The ripstop fabric has test reports for flame-resistant and anti-static properties. These are material reports, not certification of the finished suit.</p></div></div>
  </div></section>`;
}

function standardPage(name) {
  if (name === "customization") {
    const capabilityGroups = [
      { title: "Trims & Components", text: "Closures, functional components and identification details selected around the garment and its intended use.", items: [
        ["Zips, Buttons & Snap Fasteners", "/assets/capabilities/zips-buttons-snaps.webp", "Zips, buttons and snap fasteners arranged on workwear fabric"],
        ["Hook-and-loop, Elastic & Sewing Thread", "/assets/capabilities/hook-loop-elastic-thread.webp", "Hook-and-loop tape, elastic and industrial sewing thread"],
        ["Reflective Materials", "/assets/capabilities/reflective-material.webp", "Reflective tape stitched to high-visibility fabric"],
        ["Patches, Woven Labels, Care Labels & Hangtags", "/assets/capabilities/patches-labels-hangtags.webp", "Garment patches, woven labels, care labels and hangtags"],
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
        ["Embroidery, Screen Printing, Heat Transfer & Patches", "/assets/capabilities/branding-methods.webp", "Examples of embroidery, printing, heat transfer and patch branding methods"],
        ["Brand Labels & Care Labels", "/assets/capabilities/brand-care-labels.webp", "Brand and wash-care labels applied inside a workwear garment"],
        ["Individual Packing, Cartons & Shipping Marks", "/assets/capabilities/packing-cartons.webp", "Individually packed workwear arranged in export cartons"],
      ] },
      { title: "What to Review on Your Sample", text: "Use the physical sample to settle the decisions that a concept image cannot show. LF records the approved details as the production reference.", items: [
        ["Fabric Colour, Weight & Feel", "/assets/operations/fabric-layer-preparation.webp", "Fabric selection for a garment sample"],
        ["Fit, Movement & Pocket Access", "/assets/operations/sample-showroom-01.webp", "Garment samples for fit and functional review"],
        ["Logo Size, Position & Finish", "/assets/capabilities/branding-methods.webp", "Logo application methods for sample approval"],
        ["Approved Details & Repeat-order Reference", "/assets/operations/sample-garment-racks-02.webp", "Retained garment samples for specification comparison"],
      ] },
    ];
    const capabilitySections = capabilityGroups.map((group, groupIndex) => `<section class="capability-group${groupIndex % 2 ? " section-soft" : ""}"><div class="container"><div class="capability-group-head"><span>${String(groupIndex + 1).padStart(2, "0")}</span><div><p class="eyebrow">Customization capability</p><h2>${escapeHtml(group.title)}</h2><p>${escapeHtml(group.text)}</p></div></div><div class="capability-card-grid">${group.items.map(([title, image, alt]) => `<article class="capability-card"><div class="capability-card-media"><img src="${image}" width="1024" height="1024" loading="lazy" alt="${escapeHtml(alt)}"></div><h3>${escapeHtml(title)}</h3></article>`).join("")}</div></div></section>`).join("");
    const body = `${pageHero("Custom staff uniforms and clothing", buyerCommon.customization.h1, buyerCommon.customization.intro)}<section class="section capability-intro"><div class="container"><div class="section-head"><p class="eyebrow">Options to confirm</p><h2>Choose Semi-Custom or Full Garment Development</h2><p>Keep the parts of an existing uniform that work and change the details that do not. Or develop a new garment around your team’s fabric, fit and functional needs. We help you choose the route before starting the sample.</p></div></div></section>${flightSuitDetails()}${capabilitySections}<section class="section section-soft"><div class="container"><div class="section-head"><h2>After the sample is approved</h2><p>Review how LF follows materials, production, inspection and packing against the agreed reference.</p><a class="text-link" href="/process-quality">See production stages and quality checkpoints</a></div></div></section>${programFaqs({faqs: buyerCommon.customization.faqs.map(({q,a}) => ({question:q,answer:a}))}, "Uniform Customization Questions")}<section class="section"><div class="container">${buyerProgramLinks()}</div></section><section class="cta-band"><div class="container cta-inner"><h2>Start with your product, reference garment or technical brief.</h2><a class="btn btn-light" href="/inquiry?request=Sample%20Development">Send Your Uniform Brief</a></div></section>`;
    return layout({ title: buyerCommon.customization.title, description: buyerCommon.customization.description, pathName: "/customization", active: "customization", body });
  }
  if (name === "process-quality") {
    const steps = [["Requirement Review", "Review the intended use, destination, quantity, delivery target, reference material and the details the buyer cares about most."], ["Product Specification", "Turn the brief into a working reference covering material, colour, construction, size chart, logo method, labels and packing."], ["Fabric & Trim Sourcing", "Check suitable fabric, reflective materials, zips, buttons, lining and other trims against availability and project requirements."], ["Sample Development", "Use the paper pattern, first sample and fit review to settle practical questions before bulk production."], ["Production Setup", "Match the product with suitable production resources, set milestones and confirm the approved sample as the bulk reference."], ["Production Follow-up", "Track material readiness and progress, report key milestones, and raise issues early so corrections can be agreed."], ["Inspection", "Check dimensions, workmanship, seams, zips, buttons, logo placement, accessories, quantity and packing against the agreed reference."], ["Packing & Export Preparation", "Check packing marks, carton quantities and shipment documents before the order moves to the agreed export route."]];
    const body = `${pageHero("Process & quality", "Quality Control from Sample Approval to Shipment Readiness", "LF stays involved after the order is placed: we coordinate the technical reference, production checkpoints and the records buyers need to review the delivery.")}<section class="section"><div class="container split"><div class="timeline">${steps.map(([title, text], index) => `<article class="timeline-item"><div class="timeline-num">${String(index + 1).padStart(2, "0")}</div><div><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</div><div class="photo-collage"><img src="/assets/operations/automated-cutting-table.webp" width="1920" height="1080" loading="lazy" alt="Automated fabric cutting table in a production partner facility"><img src="/assets/operations/operator-sewing-detail.webp" width="1280" height="1707" loading="lazy" alt="Garment operator sewing a workwear product"><img src="/assets/operations/production-floor-overview-02.webp" width="1920" height="1080" loading="lazy" alt="Overview of a partner garment production floor"></div></div></section><section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Quality checkpoints</p><h2>Inspection Checks for the Actual Order</h2><p>Small orders can be fully inspected. Larger orders can be inspected by sampling or AQL method when this is agreed in the order requirements.</p></div><div class="quality-grid"><article class="quality-card"><h3>Before Production</h3><ul class="content-list"><li>Paper pattern, sample fit and approved reference</li><li>Fabric, colour, lining and functional trims</li><li>Size chart, grading and critical measurements</li><li>Logo method, artwork and placement</li><li>Individual packing and carton requirements</li></ul></article><article class="quality-card"><h3>During Production</h3><ul class="content-list"><li>Construction and seam consistency</li><li>Critical measurements and fit-sensitive points</li><li>Zips, buttons, reflective materials and other accessories</li><li>Logo, patch and label placement</li><li>Workmanship issues and corrective follow-up</li></ul></article><article class="quality-card"><h3>Before Shipment</h3><ul class="content-list"><li>Appearance, measurements and order consistency</li><li>Finished-garment workmanship and accessories</li><li>Quantity, size assortment and packing</li><li>Carton marks and packing list</li><li>Shipment-readiness photos or video when requested</li></ul></article></div></div></section><section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Documentation &amp; testing</p><h2>Records and Testing Available When Required</h2><p>For products with a required standard, LF can source certified fabrics and trims, provide available certificates and test reports, and coordinate third-party garment testing. The final route, timing and additional cost are confirmed per project.</p></div><div class="feature-grid"><article class="feature-card"><h3>Buyer Review Records</h3><p>Photos, video, size charts, material details, approved samples and packing information can be shared at the agreed stages.</p></article><article class="feature-card"><h3>Inspection Reports</h3><p>Inspection reports and third-party inspection can be arranged when the order requires formal records beyond normal production follow-up.</p></article><article class="feature-card"><h3>Standards &amp; Testing</h3><p>For high-visibility, flame-resistant, anti-static, waterproof or other specified requirements, we confirm the material and testing route before making a compliance claim.</p></article></div><p class="disclaimer">Production images show offices, sample areas and production environments used in the supply process. Partner-facility images are not presented as LF-owned factories, equipment or personnel.</p></div></section>`;
    return layout({ title: "Workwear Quality Control & Inspection | LF Clothing", description: "LF manages workwear and uniform orders through sample approval, material checks, production follow-up, inspection, packing and export preparation.", pathName: "/process-quality", active: "process", body });
  }
  if (name === "projects") {
    const extendedCases = [
      ...projectCases,
      { name: "IBM", image: "/assets/cases/ibm-hoodie.webp", alt: "IBM branded hoodie project", fact: "LF has supplied an IBM-branded hoodie program. The real sample shows a black pullover hoodie with a multi-colour front graphic and sleeve identification." },
      appleStaffCase,
      pekingUniversityCase,
      { name: "DiDi Programmer", image: "/assets/cases/didi-programmer-hoodie.webp", alt: "DiDi Programmer branded pullover hoodie sample", fact: "LF's real project sample archive includes a cream DiDi Programmer pullover hoodie with a multi-colour chest graphic, kangaroo pocket and sleeve identification. Quantity and delivery timing are not currently published." },
    ].map((item) => ({ ...item, ...projectBuyerLinks[item.name] }));
    const groups = [
      { heading: "Event and Branded Team Clothing", intro: "Coordinated winter outfits, jackets and sweatshirts supplied for company events and organised activities.", names: ["Mercedes-Benz", "IBM", "Peking University", "DiDi Programmer"] },
      { heading: "Staff Uniforms and Seasonal Supply", intro: "Staff jackets and summer-to-winter uniform ranges for customer-facing teams.", names: ["Apple", "PetroChina", "Sinopec"] },
      { heading: "Industrial and Ground-Crew Workwear", intro: "Work jackets and coveralls supplied for industrial and ground-crew roles.", names: ["SMS group", "ANA"] },
    ];
    const projectSections = groups.map((group, index) => `<section class="section${index % 2 ? " section-soft" : ""}"><div class="container"><div class="section-head"><h2>${group.heading}</h2><p>${group.intro}</p></div>${projectCaseCards(group.names.map((name) => extendedCases.find((item) => item.name === name)).filter(Boolean))}</div></section>`).join("");
    const body = `${pageHero("Documented project experience", "Real Uniform and Branded Apparel Programs", "Explore garments supplied for event teams, staff uniforms and industrial roles. Each example describes the products and project facts available; supply includes orders through procurement partners.")}${projectSections}<section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Specialist development</p><h2>From a Concept Image to a Delivered Flight-Suit Order</h2><p>Ten custom flight suits, one round of sample refinements and delivery to Germany 28 days after order placement.</p><a class="text-link" href="${aviationRoute}#flight-suit-project">Explore the flight-suit project</a></div></div></section><section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Other organisations served</p><h2>Selected Apparel and Textile Programs</h2><p>Some programs were supplied directly; others were delivered through procurement companies, project partners or appointed purchasing channels.</p></div>${logos()}</div></section><section class="cta-band"><div class="container cta-inner"><h2>Need a supplier that can develop from your own reference?</h2><div class="cta-actions"><a class="btn btn-light" href="/inquiry">Discuss Your Project</a><a class="btn btn-whatsapp" href="https://wa.me/8613901335518?text=Hello%20LF%20Clothing%2C%20I%20would%20like%20to%20discuss%20a%20custom%20uniform%20project." target="_blank" rel="noopener noreferrer">WhatsApp LF</a></div></div></section>`;
    return layout({ title: "Uniform & Branded Apparel Project Examples | LF Clothing", description: "See documented LF Clothing apparel programs and real samples for ANA, Mercedes-Benz, SMS group, PetroChina, Sinopec, IBM, Apple and other organisations.", pathName: "/projects", active: "projects", body, image: "/assets/brand/lingfeng-logo.webp" });
  }
  if (name === "about") {
    const body = `${pageHero("About LF Clothing", "Your Clothing Manufacturing Partner in China", "LF Clothing is the international B2B apparel business operated by Beijing Lingfeng Apparel. As a Chinese clothing manufacturer working with specialist production partners, we manage garment development, samples and production for staff uniforms, workwear and event clothing. Your team has one contact for clothing and related supplies.")}<section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">What we specialise in</p><h2>Staff Clothing, from Existing Styles to Full Customization</h2><p>Our strongest product areas are industrial workwear, specialist uniforms, coveralls, durable trousers, insulated and lined outerwear, corporate suits and logo-applied team apparel.</p></div><p>Choose existing-style customisation or full garment development. Your team can plan different garments together, with LF managing materials, samples, production partners and quality checks across the range.</p><ul class="check-list"><li>Custom workwear and uniform development from a brief or reference item</li><li>Garment development, including fabric, trims, sizing and logo application</li><li>Complementary shoes, caps, bags, towels and textile items for one-stop programs</li><li>Export and customs-document support alongside packing coordination</li></ul></div><div class="photo-collage"><img src="/assets/operations/office-meeting-space.webp" width="1706" height="1279" loading="lazy" alt="Beijing Lingfeng Apparel office meeting room"><img src="/assets/operations/sample-showroom-03.webp" width="4096" height="3072" loading="lazy" alt="Garment sample showroom"><img src="/assets/operations/sewing-line-overview-01.webp" width="1080" height="1920" loading="lazy" alt="Partner garment sewing line"></div></div></section><section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Who we support</p><h2>Supporting Companies and Event Teams</h2><p>LF supports companies buying clothing for their own staff, organisers planning event apparel and operational teams sourcing workwear, with a focus on buyers in the UK, Europe and North America. Bring one garment requirement or a coordinated range across departments. LF manages development and production follow-up in China, with your destination and purchasing requirements reviewed from the start.</p></div><div class="feature-grid"><article class="feature-card"><h3>Company Procurement Teams</h3><p>Coordinate suits, polos, workwear and related items for different roles, with shared branding and item-specific samples.</p></article><article class="feature-card"><h3>Event Organisers &amp; Venues</h3><p>Plan branded staff and crew clothing around roles, venue conditions, quantities and your required arrival date.</p></article><article class="feature-card"><h3>Contractors &amp; Corporate Buyers</h3><p>Build role-specific uniforms and complementary textile items around job conditions, wearer sizes, identification and delivery requirements.</p></article></div></div></section><section class="section section-navy"><div class="container"><div class="section-head"><p class="eyebrow">How manufacturing is organised</p><h2>LF Matches the Production Resource to the Product</h2><p>Tailored suits, workwear and event apparel need different production expertise. LF works with specialist partners suited to each garment, while managing the specification, samples, production follow-up, inspection and packing. Your team keeps one point of contact across the range.</p><p><a class="text-link" href="${winterEventRoute}">Explore a 2,000-set winter event clothing program</a></p></div></div></section><section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Company information</p><h2>Beijing Lingfeng Apparel Co., Ltd.</h2><p>Room 203, Building 1, No. 18 Jia, Longtai Road, Jiugong Industrial Park, Daxing District, Beijing, China.</p></div><p><strong>Email:</strong> <a class="text-link" href="mailto:sales@lfclothing.com">sales@lfclothing.com</a></p><p><strong>WhatsApp:</strong> <a class="text-link" href="https://wa.me/8613901335518">+86 139 0133 5518</a></p></div></section>`;
    const aboutBody = `${body}${buyerFaqSection}`;
    return layout({ title: "China Clothing Manufacturer & Uniform Supplier | LF Clothing", description: "Meet LF Clothing, a Chinese clothing manufacturer for uniforms, workwear and event apparel. We manage development and production through specialist partners.", pathName: "/about", active: "about", body: aboutBody, schema: [buyerFaqSchema] });
  }
  if (name === "inquiry") {
    const body = `${pageHero("Start an inquiry", "Tell Us the Product, Quantity and Target Date", "A photo, drawing, existing garment, AI concept image or short description is enough to start. Typical MOQ guidance is 50 pieces per style/colour.")}<section class="section"><div class="container form-layout">${inquiryForm("inquiry")}<aside class="contact-panel"><h2>What helps us quote</h2><ul class="content-list"><li>Product photo, drawing or style code</li><li>Quantity and size breakdown</li><li>Destination country and target date</li><li>Fabric, insulation or performance requirements</li><li>Logo artwork, labels and packing</li></ul><hr><p><strong>Sample:</strong> usually 7–12 days.</p><p><strong>Production timing:</strong> confirmed for your products, quantities, customization and required arrival date.</p><hr><p>Email <a href="mailto:sales@lfclothing.com">sales@lfclothing.com</a></p><p>WhatsApp <a href="https://wa.me/8613901335518">+86 139 0133 5518</a></p></aside></div></section>`;
    return layout({ title: "Request a Custom Workwear or Uniform Quote | LF Clothing", description: "Send LF Clothing your workwear or uniform brief, product reference, quantity, delivery target and logo or testing requirements for project review.", pathName: "/inquiry", active: "inquiry", body });
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
await writeFile(path.join(dist, "analytics.js"), analyticsJs, "utf8");

await cp(path.join(root, "assets", "brand"), path.join(dist, "assets", "brand"), { recursive: true });
await cp(path.join(root, "assets", "products"), path.join(dist, "assets", "products"), { recursive: true });
await cp(path.join(root, "assets", "operations"), path.join(dist, "assets", "operations"), { recursive: true });
await cp(path.join(root, "assets", "steps"), path.join(dist, "assets", "steps"), { recursive: true });
await cp(path.join(root, "assets", "capabilities"), path.join(dist, "assets", "capabilities"), { recursive: true });
await cp(path.join(root, "assets", "cases"), path.join(dist, "assets", "cases"), { recursive: true });
await cp(path.join(root, "assets", "certifications"), path.join(dist, "assets", "certifications"), { recursive: true });
await mkdir(path.join(dist, "assets", "site"), { recursive: true });
for (const file of ["process-table-hero.webp", "hero-factory-hero.webp", "workshop-rack-hero.webp"]) await cp(path.join(root, "assets", "site", file), path.join(dist, "assets", "site", file));
await mkdir(path.join(dist, "assets", "partners"), { recursive: true });
for (const [, file] of partners) await cp(path.join(root, "assets", "partners", file), path.join(dist, "assets", "partners", file));

await writePage("/", layout({ title: buyerCommon.home.title, description: buyerCommon.home.description, pathName: "/", active: "home", body: homeBody, image: "/assets/operations/fabric-cutting-table.webp", schema: [websiteSchema] }));
await writePage("/products", productsPage());
for (const product of detailProducts) await writePage(productUrl(product), productPage(product));
for (const page of priorityPages) await writePage(page.route, priorityLandingPage(page));
for (const collection of collections) await writePage(`/collections/${collection.slug}`, collectionPage(collection));
await writePage(aviationRoute, aviationFlightSuitsPage());
for (const study of projectStudies) await writePage(`/projects/${study.slug}`, projectStudyPage(study));
await writePage(eventRoute, buyerLandingPage("eventStaff", eventRoute, ["GAR-PO-001", "GAR-KN-004", "GAR-OJ-001"], "Event Staff Uniforms"));
for (const page of ["customization", "process-quality", "projects", "about", "inquiry"]) await writePage(`/${page}`, standardPage(page));

const privacyBody = `${pageHero("Privacy & cookies", "How LF Clothing Uses Website and Inquiry Data", "This notice explains the information used to operate the website, respond to sourcing inquiries and measure website performance.")}<section class="section"><div class="container legal-content"><h2>Information You Submit</h2><p>When you send an inquiry, LF receives the contact details, project information and optional reference file you provide. We also retain the landing page, referral and campaign parameters attached to the inquiry so we can understand how the request reached us and respond appropriately.</p><h2>Country Selection</h2><p>On pages that contain an inquiry form, Netlify may provide an approximate two-letter country code based on the visit so the Country / Region field can be preselected. The site stores that code in the functional <code>lf_country</code> cookie for up to one year. The cookie does not contain an IP address or precise location, is not used for advertising analytics, and is updated if you choose a different country.</p><h2>Website Analytics</h2><p>LF uses Google Analytics 4 to understand page usage and campaign performance. Analytics and advertising storage are denied by default. If you allow analytics, Google Analytics may process information about your visit, such as pages viewed, approximate location, device and browser information, referral source and campaign parameters. Local development visits are excluded from the production analytics property.</p><h2>Consent and Your Choice</h2><p>You can allow or reject optional analytics from the website notice. Your choice is stored in your browser so the site can remember it. Use the Cookie settings control in the footer to review or change the preference on this device.</p><h2>Service Providers</h2><p>LF uses Netlify to host the website and process the inquiry endpoint, Brevo to deliver inquiry email, and Google Analytics when analytics is allowed. These providers process information under their own security, retention and privacy terms.</p><h2>Contact</h2><p>For a question about website or inquiry data, email <a class="text-link" href="mailto:sales@lfclothing.com">sales@lfclothing.com</a>.</p></div></section>`;
await writePage("/privacy", layout({ title: "Privacy & Cookies | LF Clothing", description: "Learn how LF Clothing handles website analytics, cookie preferences and information submitted with custom workwear and uniform inquiries.", pathName: "/privacy", body: privacyBody, robots: "noindex,follow" }));

const errorBody = `<section class="page-hero"><div class="container"><p class="eyebrow">404</p><h1>Page Not Found</h1><p>The requested page is not part of the current LF Clothing product range.</p><p style="margin-top:28px"><a class="btn btn-light" href="/products">Browse Products</a></p></div></section>`;
await writeFile(path.join(dist, "404.html"), layout({ title: "Page Not Found | LF Clothing", description: "The requested LF Clothing page could not be found. Browse the current workwear and uniform range or send LF Clothing a sourcing brief.", pathName: "/404", body: errorBody, robots: "noindex,follow" }), "utf8");

const routes = ["/", "/products", ...detailProducts.map(productUrl), ...priorityPages.map((item) => item.route), ...collections.map((item) => `/collections/${item.slug}`), aviationRoute, eventRoute, ...projectStudies.map((study) => `/projects/${study.slug}`), "/customization", "/process-quality", "/projects", "/about", "/inquiry"];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${absolute(route)}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap, "utf8");
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`, "utf8");
const legacyProductRedirects = products
  .filter((product) => !detailProductSkus.has(product.sku))
  .map((product) => `${canonicalPath(productUrl(product))} ${legacyProductTargets[product.primaryCollection] || "/products/"} 301!`);
const legacyNamedProductRedirects = Object.entries(legacyNamedProductTargets)
  .flatMap(([slug, target]) => [
    `/products/${slug} ${target} 301!`,
    `/products/${slug}/ ${target} 301!`,
  ]);
await writeFile(path.join(dist, "_redirects"), `${[...legacyProductRedirects, ...legacyNamedProductRedirects].join("\n")}\n/product-pages/* /products/ 301!\n`, "utf8");
for (const file of (await readdir(root)).filter((name) => name.endsWith(".txt"))) await cp(path.join(root, file), path.join(dist, file));
console.log(`Generated ${routes.length + 1} pages, ${detailProducts.length} product detail pages and ${legacyProductRedirects.length + legacyNamedProductRedirects.length} targeted product redirects.`);
