import { portfolio, capabilities } from "./apparel-portfolio-data.mjs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderProjectStudyBody } from "./render-project-study.mjs";
import { renderHome, renderProductsOverview, homeTitle, homeDescription, productTitle, productDescription, newPages, renderNewPage } from "./render-apparel-range.mjs";
import { corporateHero, corporateCta, corporateFaqs, renderCustomization, renderProcess, renderAbout, renderProjects, renderInquiry } from "./render-corporate-pages.mjs";
import { renderDevelopmentScope, renderReferenceNote, renderGuidesIndex, renderCustomizationGuide, guidesIntro } from "./render-customization-guides.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const products = JSON.parse(await readFile(path.join(root, "data", "products.json"), "utf8"));
const collections = JSON.parse(await readFile(path.join(root, "data", "collections.json"), "utf8"));
const buyerPrograms = JSON.parse(await readFile(path.join(root, "data", "buyer-programs.json"), "utf8"));
const buyerCommon = JSON.parse(await readFile(path.join(root, "data", "buyer-common.json"), "utf8"));
const catalogPages = JSON.parse(await readFile(path.join(root, "data", "catalog-pages.json"), "utf8"));
const projectStudies = JSON.parse(await readFile(path.join(root, "data", "project-studies.json"), "utf8"));
const customizationGuides = JSON.parse(await readFile(path.join(root, "data", "customization-guides.json"), "utf8"));
const styles = await readFile(path.join(root, "site-src", "styles.css"), "utf8") + "\n" + await readFile(path.join(root, "site-src", "apparel-editorial.css"), "utf8") + "\n" + await readFile(path.join(root, "site-src", "corporate-pages.css"), "utf8");
const localizationStyles = await readFile(path.join(root, "site-src", "localization.css"), "utf8");
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
  { name: "ANA", id: "ana-ground-crew", image: "/assets/cases/ana-ground-crew-coverall.webp", alt: "ANA ground crew coverall supplied through an apparel program", fact: "LF supplied long-sleeve coveralls for an ANA ground-crew uniform programme.", referenceDetails: "The project reference shows a grey long-sleeve coverall with a covered front opening, zipped chest pockets, waist adjustment tabs and leg pockets. Chest branding and blue sleeve panels carry the team identity across a practical one-piece uniform.", planningNote: "For a similar ground-crew order, we review movement, pocket access, size distribution and laundering requirements before sampling. Any required protective performance is specified and verified separately for the new order." },
  { name: "Mercedes-Benz", image: winterEventStudy.image, alt: winterEventStudy.imageAlt, label: "2019 winter event program", fact: winterEventStudy.summary, route: winterEventRoute, linkLabel: "Explore the complete winter outfit" },
  { name: "SMS group", image: "/assets/cases/sms-group-work-jacket.webp", alt: "SMS group branded industrial work jacket", fact: "LF has supported repeat supply of branded industrial work jackets for an SMS group program." },
  { name: "PetroChina", image: "/assets/cases/petrochina-yellow-down-jacket.webp", alt: "PetroChina yellow insulated service-station jacket project", fact: "LF has provided long-term apparel supply for PetroChina service-station programs, covering summer uniforms, winter uniforms and down jackets." },
  { name: "Sinopec", image: "/assets/cases/sinopec-winter-work-jacket.webp", alt: "Sinopec service-station winter uniform project", fact: "LF has provided long-term uniform supply for Sinopec service-station programs, covering both summer and winter staff uniforms." },
];

const pekingUniversityCase = { name: "Peking University", image: "/assets/cases/peking-university-sweatshirt.webp", alt: "Peking University event sweatshirt project", fact: "LF completed a one-time order of 1,200 Peking University event sweatshirts for a specific activity program." };
const appleStaffCase = { name: "Apple", id: "apple-store-staff", image: "/assets/cases/apple-staff-jacket.webp", alt: "Apple branded staff jacket project", fact: "LF has supplied an Apple store-staff uniform program, including a black zip jacket with discreet chest branding.", referenceDetails: "The project reference shows a black stand-collar jacket with a full front zip, zipped side pockets and a small white chest logo. The restrained design gives customer-facing teams a consistent appearance without a large graphic or contrasting colour panels.", planningNote: "For a similar retail-staff programme, we can review fabric weight, room for layering, size grading and logo placement around the working environment. The sample establishes the fit, finish and branding for the new order." };

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


function activeClass(active, key) { return active === key ? " class=\"is-active\"" : ""; }

function header(active = "") {
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="nav-wrap">
    <a class="brand" href="/" aria-label="LF Clothing home"><img src="/assets/brand/lingfeng-logo.webp" width="1200" height="292" alt="Lingfeng Workwear and Uniform Supply"></a>
    <div class="nav-utility"><a class="nav-email" href="mailto:sales@lfclothing.com">sales@lfclothing.com</a><a href="tel:+8613901335518">+86 139 0133 5518</a></div>
    <div class="nav-actions">${active === "inquiry" ? '<a class="btn btn-primary" href="https://wa.me/8613901335518">WhatsApp</a>' : '<a class="btn btn-primary" href="/inquiry">Request a Quote</a>'}<button class="menu-toggle" type="button" aria-label="Open menu" aria-controls="primary-navigation" aria-expanded="false"><span></span><span></span><span></span></button></div>
  </div><div class="nav-bar">
    <nav class="nav-links" id="primary-navigation" aria-label="Primary navigation">
      <a${activeClass(active, "home")} href="/">Home</a>
      <div class="nav-dropdown"><button${activeClass(active, "products")} type="button" aria-expanded="false" aria-controls="product-navigation">Products</button><div class="dropdown-menu" id="product-navigation">
        <a href="/products">All Product Categories</a>${portfolio.map(([id,title]) => `<a href="/products#${id}">${escapeHtml(title)}</a>`).join("")}
      </div></div>
      <a${activeClass(active, "industries")} href="/industries">Industries</a>
      <a${activeClass(active, "manufacturing-capabilities")} href="/manufacturing-capabilities">Manufacturing capabilities</a>
      <a${activeClass(active, "customization")} href="/customization">Customization</a>
      <a${activeClass(active, "process")} href="/process-quality">Quality &amp; delivery assurance</a>
      <a${activeClass(active, "projects")} href="/projects">Projects</a>
      <a${activeClass(active, "guides")} href="/guides">Resources</a>
      <a${activeClass(active, "about")} href="/about">About</a>
      <a${activeClass(active, "inquiry")} href="/inquiry">Contact</a>
    </nav>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container">
    <div class="footer-grid">
      <div class="footer-brand"><h3>LF Clothing</h3><p>Custom apparel manufacturing and supply</p><div class="social-links">
        <a class="social-link social-linkedin" href="https://www.linkedin.com/in/kai-wang-b6aa79420/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.37 4.27 5.46v6.28ZM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.1 20.45H3.54V9H7.1v11.45Z"/></svg></a>
        <a class="social-link social-facebook" href="https://www.facebook.com/profile.php?id=61591964337372" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z"/></svg></a>
        <a class="social-link social-whatsapp" href="https://wa.me/8613901335518" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.48a8.97 8.97 0 0 1-1.65-2.07c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35ZM12.04 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.22-3.74.98 1-3.65-.23-.37A9.86 9.86 0 1 1 12.04 21.79ZM20.43 3.49A11.8 11.8 0 0 0 12.05 0 11.91 11.91 0 0 0 1.72 17.84L.05 24l6.3-1.65A11.9 11.9 0 0 0 24 11.91a11.82 11.82 0 0 0-3.57-8.42Z"/></svg></a>
      </div></div>
      <div><h3>Product Range</h3><div class="footer-links">${portfolio.map(([id,title])=>`<a href="/products#${id}">${escapeHtml(title)}</a>`).join("")}</div></div>
      <div><h3>Manufacturing capabilities</h3><div class="footer-links">${capabilities.map(([title],i)=>`<a href="/manufacturing-capabilities#topic-${i+1}">${escapeHtml(title)}</a>`).join("")}</div></div>
      <div><h3>Company &amp; Services</h3><div class="footer-links"><a href="/about">About LF Clothing</a><a href="/industries">Industries</a><a href="/customization">Customization</a><a href="/process-quality">Quality &amp; delivery assurance</a><a href="/projects">Our Projects</a><a href="/guides">Resources</a></div></div>
      <div class="footer-contact"><h3>Contact Our Team</h3><div class="footer-links"><a href="mailto:sales@lfclothing.com">sales@lfclothing.com</a><a href="https://wa.me/8613901335518">WhatsApp: +86 139 0133 5518</a><span>Beijing, China</span></div></div>
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
  description = pathName === "/" ? description : metaDescription(description);
  const organization = {
    "@context": "https://schema.org", "@type": "Organization", "@id": `${baseUrl}/#organization`, name: "Beijing Lingfeng Apparel Co., Ltd.", alternateName: "LF Clothing", url: `${baseUrl}/`,
    logo: absoluteAsset("/assets/brand/lingfeng-logo.webp"), email: "sales@lfclothing.com", telephone: "+86 139 0133 5518",
    address: { "@type": "PostalAddress", streetAddress: "Room 203, Building 1, No. 18 Jia, Longtai Road, Jiugong Industrial Park, Daxing District", addressLocality: "Beijing", addressCountry: "CN" },
    sameAs: ["https://www.linkedin.com/in/kai-wang-b6aa79420/", "https://www.facebook.com/profile.php?id=61591964337372"],
  };
  const pageContent = normalizeInternalLinks(`${header(active)}<main id="main"${pathName !== "/" && pathName !== "/products" ? ' class="inner-page"' : ""}>${body}</main>${footer()}`);
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
    <div class="product-card-body"><span class="product-code">Design reference</span><h3>${hasDetailPage ? `<a href="${detailUrl}">${escapeHtml(product.name)}</a>` : escapeHtml(product.name)}</h3><p>${escapeHtml(productCopy[product.sku] || product.summary)}</p>${hasDetailPage ? `<p class="style-material">${escapeHtml(product.materials[0].value)}</p>` : summary}<div class="style-actions">${hasDetailPage ? `<a class="text-link" href="${detailUrl}">View design details</a>` : ""}<a class="text-link" href="${inquiryUrl(product)}">Discuss this design</a></div></div>
  </article>`;
}

function logos() { return `<div class="logo-grid">${partners.map(([name, file]) => `<div class="logo-card"><img src="/assets/partners/${file}" width="480" height="240" loading="lazy" alt="${escapeHtml(name)} project logo"></div>`).join("")}</div>`; }

function inquiryForm(prefix = "inquiry") {
  return `<form class="inquiry-form" data-inquiry-form>
    <div class="field">
      <label for="${prefix}-email">Email *</label>
      <input id="${prefix}-email" name="email" type="email" autocomplete="email" required>
    </div>
    <div class="field">
      <label for="${prefix}-message">What do you need? *</label>
      <textarea id="${prefix}-message" name="message" rows="3" required placeholder="What would you like us to make? A brief description is enough."></textarea>
    </div>
    <details class="inquiry-extras">
      <summary>Add a file or other details (optional)</summary>
      <div class="inquiry-extra-fields">
        <div class="field"><label for="${prefix}-attachment">Reference file</label><input id="${prefix}-attachment" name="attachment" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"><small>Photo, drawing, tech pack, artwork or size chart. One file, maximum 4 MB.</small></div>
        <div class="field"><label for="${prefix}-country">Country / Region</label><select id="${prefix}-country" name="countryCode" autocomplete="country" data-country-select><option value="">Select country or region</option></select><small>Selected automatically where location information is available. You can change it.</small></div>
        <div class="field"><label for="${prefix}-company">Company name</label><input id="${prefix}-company" name="company" autocomplete="organization"></div>
        <div class="form-two">
          <div class="field"><label for="${prefix}-category">Product category</label><select id="${prefix}-category" name="category"><option value=""></option>${portfolio.map(([,title])=>`<option value="${escapeHtml(title)}">${escapeHtml(title)}</option>`).join("")}</select></div>
          <div class="field"><label for="${prefix}-quantity">Estimated quantity</label><input id="${prefix}-quantity" name="quantity" type="number" min="1" step="1"></div>
          <div class="field"><label for="${prefix}-date">Target delivery date</label><input id="${prefix}-date" name="deliveryDate" type="date"></div>
          <div class="field"><label for="${prefix}-destination">Delivery destination</label><input id="${prefix}-destination" name="destination"></div>
        </div>
        <div class="form-two">
          <div class="field"><label for="${prefix}-name">Name</label><input id="${prefix}-name" name="name" autocomplete="name"></div>
          <div class="field"><label for="${prefix}-phone">WhatsApp / Phone</label><input id="${prefix}-phone" name="phone" type="tel" autocomplete="tel" placeholder="Include country code"></div>
        </div>
      </div>
    </details>
    <div class="visually-hidden" aria-hidden="true"><label for="${prefix}-website">Leave blank</label><input id="${prefix}-website" name="website" tabindex="-1" autocomplete="off"></div>
    <button class="btn btn-primary" type="submit">Submit your inquiry</button>
    <div class="form-message" role="status" tabindex="-1" data-form-message></div>
  </form>`;
}

function projectCaseCards(cases = projectCases, className = "") {
  return `<div class="case-card-grid ${escapeHtml(className)}">${cases.map((item) => `<article class="case-card"><div class="case-card-media ${item.logo ? "is-logo" : ""}"><img src="${item.image || item.logo}" width="1536" height="1920" loading="lazy" alt="${escapeHtml(item.alt)}"></div><div class="case-card-body"><span class="product-code">${escapeHtml(item.label || "Real project example")}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.fact)}</p>${item.route ? `<a class="text-link" href="${item.route}">${escapeHtml(item.linkLabel)}</a>` : ""}</div></article>`).join("")}</div>`;
}

const homeFaqs = buyerCommon.home.faqs.map(({ q, a }) => [q, a]);

function certificationGrid() {
  return `<div class="certificate-strip">${certifications.map(([name, file]) => `<figure class="certificate-logo"><img src="/assets/certifications/${file}" width="320" height="220" loading="lazy" alt="${escapeHtml(name)} certification logo" title="${escapeHtml(name)}"></figure>`).join("")}</div>`;
}

const homeBody = renderHome();
const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "LF Clothing", url: `${baseUrl}/`, publisher: { "@id": `${baseUrl}/#organization` }, inLanguage: "en" };


const buyerFaqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: homeFaqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };

function productsPage() {
  return layout({ title: productTitle, description: productDescription, pathName: "/products", active: "products", body: renderProductsOverview(), image: "/assets/editorial/range-workwear-stock-v4.webp", schema: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Product portfolio", url: absolute("/products") }] });
}

function customizationGuidePage(guide) {
  const route = `/guides/${guide.slug}`;
  return layout({ title: guide.title, description: guide.description, pathName: route, active: "guides", body: renderCustomizationGuide(guide, customizationGuides, [...buyerCommon.samplingFaqs, ...buyerCommon.productionFaqs]), schema: [
    breadcrumbSchema([["Home", "/"], ["Customization guides", "/guides"]], guide.heading, route),
    { "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${absolute(route)}#article`, mainEntityOfPage: { "@type": "WebPage", "@id": absolute(route) }, headline: guide.heading, description: guide.description, author: { "@id": `${baseUrl}/#organization` }, publisher: { "@id": `${baseUrl}/#organization` }, inLanguage: "en" },
  ] });
}

function programSections(program) {
  return `<section class="section"><div class="container program-brief-rows">${program.sections.map((section) => `<article><h2>${escapeHtml(section.heading)}</h2><div><p>${escapeHtml(section.body)}</p>${section.items?.length ? `<ul class="content-list">${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</div></article>`).join("")}</div></section>`;
}

function programFaqs(program, title = "Questions About Your Uniform Order") {
  return corporateFaqs([...program.faqs, buyerCommon.samplingFaqs[3], ...buyerCommon.productionFaqs], title);
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
  return `<section class="section section-soft flight-project" id="flight-suit-project"><div class="container split"><figure class="flight-project-media"><img src="/assets/cases/flight-suit-sample-original.jpg" width="1086" height="1448" loading="lazy" alt="Original photograph of the white LF flight-suit sample"><figcaption><a class="text-link" href="/assets/cases/flight-suit-sample-original.jpg" target="_blank" rel="noopener noreferrer">View original sample photograph</a></figcaption></figure><div><div class="section-head"><p class="eyebrow">Completed flight-suit project</p><h2>Ten flight suits, developed from one concept</h2><p>The customer started with a concept image, without a technical pack or fabric specification. LF developed the sample, selected the fabric and worked through one round of refinements.</p></div><ul class="content-list"><li>Flame-resistant and anti-static fabric supported by material test reports.</li><li>Offset chest zip pockets, a flight-chart leg pocket, sleeve pockets and fleece at the back neck.</li><li>Customer-requested back and underarm ventilation; LF incorporated zips into the underarm vents.</li><li>Sample refinements: narrower leg openings, longer epaulettes and a larger back vent.</li></ul><p><strong>28 days from order to arrival:</strong> 10 suits delivered to Friedrichshafen, Germany, by FedEx International Priority.</p><p class="disclaimer">Timing describes this completed project. Fabric reports do not certify the finished suit.</p><div class="style-actions"><a class="text-link" href="/customization#flight-suit-details">Explore the development and ventilation details</a><a class="text-link" href="/inquiry?request=Aviation%20Flight%20Suit">Discuss a flight-suit brief</a></div></div></div></section>`;
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
  return `<section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Real garments, supplied programs</p><h2>${escapeHtml(proof.heading)}</h2><p>${escapeHtml(proof.intro)}</p></div>${projectCaseCards(proof.cases, "home-case-grid")}${key === "corporate" ? `<p style="margin-top:24px"><a class="text-link" href="${winterEventRoute}">See how jackets, trousers, gloves and knitted hats became one coordinated outfit</a></p>` : ""}<p class="disclaimer"><a class="text-link" href="/projects">View more garments and project details</a></p></div></section>`;
}

function buyerLandingPage(key, route, skus, label) {
  const program = buyerPrograms[key];
  const selected = skus.map((sku) => productBySku.get(sku)).filter(Boolean);
  const body = `${corporateHero({ eyebrow: label, title: program.heading, intro: program.intro, image: key === "corporate" ? "/assets/editorial/range-corporate-stock-v4.webp" : "/assets/editorial/range-team-stock-v4.webp", alt: key === "corporate" ? "Stock photograph illustrating tailored corporate clothing" : "Stock photograph illustrating team T-shirt clothing", caption: "Illustrative category photography · developed to your approved brief", crumbs: [["Products", "/products"]], actions: [["Discuss Your Uniforms", `/inquiry?request=${encodeURIComponent(label)}`], ["Explore reference styles", "#reference-styles"]] })}
  ${orderSummarySection(program)}<section class="section"><div class="container">${renderDevelopmentScope()}</div></section>${outfitPlanSection(program)}
  <section class="section" id="reference-styles"><div class="container"><div class="section-head"><p class="eyebrow">Choose a starting point</p><h2>${escapeHtml(label)} Reference Styles</h2><p>Start with one of these garment references or send your own. Adapt the branding and selected details, or develop a new style for your team.</p></div><div class="product-grid">${selected.map(productCard).join("")}</div></div></section>
  ${key === "eventStaff" ? `<section class="section event-layering"><div class="container"><div class="section-head"><p class="eyebrow">Venue and weather</p><h2>Add layers for outdoor or cold-weather teams</h2><p>Start with a polo or hoodie for the role, then review a shell, softshell or insulated jacket where conditions require it. Confirm how the layers fit together and where the event branding should appear.</p></div><div class="cta-actions"><a class="text-link" href="/custom-jackets">Compare staff jacket options</a><a class="text-link" href="/collections/cold-weather-outdoor-workwear">Browse outdoor and cold-weather references</a></div></div></section>` : ""}
  ${programSections(program)}
  ${buyerProjectProof(key)}
  <section class="section"><div class="container"><div class="section-head"><p class="eyebrow">From brief to delivery</p><h2>Development, production and quality checks</h2><p>Review sample approval, production follow-up, inspection and packing before planning your order.</p></div><div class="cta-actions"><a class="text-link" href="/customization">Explore customization</a><a class="text-link" href="/process-quality">Review our process and quality checks</a></div></div></section>
  ${programFaqs(program, `${label} Questions`)}
  <section class="section"><div class="container"><div class="section-head"><h2>Plan the Rest of Your Team’s Clothing</h2></div>${buyerProgramLinks()}</div></section>
  ${corporateCta("Plan your team’s clothing", "Share your references, quantities, staff roles and required arrival date.", `/inquiry?request=${encodeURIComponent(label)}`)}`;
  return layout({ title: program.title, description: program.description, pathName: route, active: "products", body, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"]], label, route)] });
}

function priorityLandingPage(page) {
  if (page.route === "/custom-workwear") page = { ...page, title: buyerPrograms.workwear.title, description: buyerPrograms.workwear.description, hero: buyerPrograms.workwear.heading, intro: buyerPrograms.workwear.intro };
  const selected = page.skus.map((sku) => productBySku.get(sku)).filter(Boolean);
  const heroCopy = {
    "/custom-workwear": ["Custom workwear for your team", "Work jackets, trousers and coveralls developed around the job and made in our own factory. We handle fabric selection, fit, branding, samples and production."],
    "/custom-jackets": ["Custom jackets & outerwear", "Work jackets, insulated layers, softshells and shells for staff, events and outdoor roles. Confirm fabrics, lining, fit and branding before production."],
    "/custom-suits": ["Custom suits & corporate tailoring", "Coordinated suits, blazers and trousers for office, reception and hospitality teams. Develop fabric, fit, lining and presentation as one uniform range."],
    "/school-uniforms": ["Custom school uniforms", "Tracksuits, polos, hoodies, jackets and trousers with coordinated colours, badges and sizing. LF manages sampling, production follow-up and repeat-order references."],
  }[page.route];
  const body = `${corporateHero({ eyebrow: page.label, title: heroCopy[0], intro: heroCopy[1], image: page.route === "/custom-suits" ? "/assets/editorial/range-corporate-stock-v4.webp" : page.route === "/school-uniforms" ? "/assets/editorial/range-team-stock-v4.webp" : "/assets/editorial/range-workwear-stock-v4.webp", alt: `Stock photograph illustrating ${page.label.toLowerCase()}`, caption: "Illustrative category photography · developed to your approved brief", crumbs: [["Products", "/products"]], actions: [["Request a Quote", `/inquiry?request=${encodeURIComponent(page.label)}`], ["Explore reference styles", "#reference-styles"]] })}
  <section class="proof-strip"><div class="container proof-grid"><div class="proof-item"><strong>Order quantities</strong><span>${page.route === "/custom-workwear" ? "Regular workwear usually starts at 50 pieces per style and colour." : "Reviewed by style, material and colour."}</span></div><div class="proof-item"><strong>Sampling</strong><span>Usually 7–12 days.</span></div><div class="proof-item"><strong>Production timing</strong><span>Confirmed for the product, quantity and customization.</span></div><div class="proof-item"><strong>Start from</strong><span>Photo, drawing, concept or reference garment.</span></div></div></section>
  <section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">What we can supply</p><h2>${escapeHtml(page.label)} Made Around Your Order</h2><p>LF confirms the fabric, construction, size range, logo method, labels, packing and delivery plan for the specific project. The approved sample becomes the production reference.</p></div><ul class="check-list">${page.uses.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div class="feature-card"><span class="product-code">How to start</span><h3>Send one clear reference</h3><p>A product photo, drawing, tech pack, existing garment or even an AI concept image is enough for an initial review. Include the expected quantity, destination and target date.</p><a class="text-link" href="/inquiry?request=${encodeURIComponent(page.label)}">Request a quote</a></div></div></section>
  <section class="section section-soft" id="reference-styles"><div class="container">${renderDevelopmentScope()}<div class="section-head"><p class="eyebrow">Design references</p><h2>${escapeHtml(page.label)} Reference Styles</h2>${renderReferenceNote()}</div><div class="product-grid">${selected.map(productCard).join("")}</div></div></section>
  ${page.route === "/custom-workwear" ? programSections(buyerPrograms.workwear) + buyerProjectProof("workwear") + programFaqs(buyerPrograms.workwear, "Custom Workwear Questions") + `<section class="section"><div class="container">${buyerProgramLinks()}<p><a class="text-link" href="/customization">Review fabrics, fit and customization</a></p></div></section>` : ""}
  <section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Order planning</p><h2>Agree the schedule around your arrival date</h2><p>Samples usually take 7–12 days. Production and shipping depend on materials, quantities, approvals and destination. We review these stages separately before agreeing the schedule.</p></div><a class="text-link" href="/process-quality">Review production and quality checkpoints</a></div></section>
  ${corporateCta(`Discuss your ${page.short.toLowerCase()} requirements`, "Send a reference, estimated quantities, destination and required arrival date.", `/inquiry?request=${encodeURIComponent(page.label)}`)}`;
  return layout({ title: page.title, description: page.description, pathName: page.route, active: "products", body, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"]], page.label, page.route)] });
}

function collectionPage(collection) {
  if (collection.slug === "corporate-service-uniforms") return buyerLandingPage("corporate", corporateRoute, ["GAR-BL-001", "GAR-PO-002", "GAR-WJ-001"], "Corporate Uniforms");
  const selected = detailProducts.filter((product) => product.primaryCollection === collection.slug || product.secondaryCollections.includes(collection.slug));
  const pathName = `/collections/${collection.slug}`;
  const specialistProgram = collection.slug === "industrial-workwear" ? `<p class="disclaimer">LF can also review <a class="text-link" href="${aviationRoute}">aviation flight suit requirements</a> as a separate specialist uniform program.</p>` : "";
  const body = `${pageHero("Product collection", collection.name, collection.description, [["Home", "/"], ["Products", "/products"]])}${collectionProgramSection(collection)}<section class="section"><div class="container split"><div><div class="section-head"><p class="eyebrow">What to confirm</p><h2>Tell Us Where and How the Garment Will Be Used</h2><p>${escapeHtml(collection.intro)}</p></div><ul class="check-list">${collection.factors.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>${specialistProgram}</div><div class="feature-card"><span class="product-code">Design references</span><h3>Need a different style?</h3><p>Send the intended use, target quantity, climate, material direction or a reference garment. We can assess the development work and sampling needed for your design.</p><a class="text-link" href="/inquiry?request=Additional%20Styles&context=${encodeURIComponent(collection.name)}">Ask for another style</a></div></div></section><section class="section section-soft"><div class="container"><div class="section-head"><p class="eyebrow">Selected references</p><h2>${escapeHtml(collection.name)} Examples</h2></div>${renderDevelopmentScope()}<div class="product-grid">${selected.map(productCard).join("")}</div></div></section>`;
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
  const body = `<section class="product-detail"><div class="container">${breadcrumb([["Home", "/"], ["Products", "/products"], [collection.name, `/collections/${collection.slug}`]], product.name)}<div class="product-main"><div class="product-gallery" data-gallery><div class="gallery-main"><img src="${product.images.front}" width="1280" height="1280" alt="Front view of ${escapeHtml(product.name)} ${escapeHtml(product.sku)}" data-gallery-main></div><div class="gallery-thumbs">${galleryImages.map(([label, image], index) => `<button class="gallery-thumb${index === 0 ? " is-active" : ""}" type="button" data-gallery-thumb data-image="${image}" data-alt="${escapeHtml(label)} view of ${escapeHtml(product.name)} ${escapeHtml(product.sku)}" aria-label="Show ${escapeHtml(label.toLowerCase())} view"><img src="${image}" width="1280" height="1280" alt=""></button>`).join("")}</div></div><div class="product-copy"><span class="product-code">${escapeHtml(product.sku)} · ${escapeHtml(collection.name)}</span><h1>${escapeHtml(product.name)}</h1><p class="product-lede">${escapeHtml(description)}</p>${renderReferenceNote()}<div class="product-meta"><div><span>Order quantity</span><strong>Confirmed per style</strong></div><div><span>Sampling</span><strong>Usually 7–12 days</strong></div></div><div class="detail-actions"><a class="btn btn-primary" href="${inquiryUrl(product)}">Discuss this design</a><a class="btn btn-secondary" href="/customization/">Review Customization</a></div></div></div></div></section>
  <section class="detail-section"><div class="container detail-grid"><h2>Development options to review</h2><table class="spec-table"><tr><th>Material direction</th><td>${escapeHtml(product.materials[0].value)}</td></tr><tr><th>Reference weight</th><td>${escapeHtml(product.referenceWeight.value)} — final weight is confirmed in the approved specification.</td></tr><tr><th>Colours</th><td>${escapeHtml(product.colours)}</td></tr><tr><th>Sizes</th><td>${escapeHtml(product.sizes)}</td></tr></table></div></section>
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
  <section class="section section-navy"><div class="container"><div class="section-head"><p class="eyebrow">Project control</p><h2>From Requirement Review to Shipment Readiness</h2><p>LF manages specifications, fabric selection, samples, production in our own factory, inspection, packing and export preparation. Where a standard or performance claim is required, the verification route is agreed before production.</p></div><div class="cta-actions"><a class="btn btn-light" href="/process-quality">Review quality control</a><a class="btn btn-secondary" href="/customization">See customization options</a></div></div></section>
  <section class="section"><div class="container"><div class="section-head"><p class="eyebrow">Buyer questions</p><h2>Flight Suit &amp; Aviation Uniform FAQ</h2></div><div class="quality-grid">${faqs.map(([question, answer]) => `<article class="quality-card"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("")}</div></div></section>
  <section class="cta-band"><div class="container cta-inner"><h2>Send the role, quantity, destination market and technical requirements.</h2><div class="cta-actions"><a class="btn btn-light" href="/inquiry?request=Aviation%20Flight%20Suit">Start an Aviation Inquiry</a><a class="btn btn-secondary" href="/products">Browse Product References</a></div></div></section>`;
  return layout({ title: "Custom Flight Suit & Aviation Uniform Supplier China | LF Clothing", description: "Custom flight suit and aviation uniform supply from China for international B2B buyers, with specification review, sampling, quality control and export support.", pathName, active: "products", body, schema: [breadcrumbSchema([["Home", "/"], ["Products", "/products"]], "Custom Flight Suits & Aviation Uniforms", pathName), faqSchema] });
}

function flightSuitDetails() {
  return `<section class="section section-soft flight-details" id="flight-suit-details" aria-labelledby="flight-details-heading"><div class="container">
    <div class="section-head"><p class="eyebrow">Real garment development</p><h2 id="flight-details-heading">From One Concept Image to 10 Custom Flight Suits</h2><p>The customer supplied a single concept image, without a technical pack or fabric specification. LF developed the first sample, selected materials and refined the garment details before production.</p></div>
    <div class="flight-detail-grid"><figure class="flight-sample"><img src="/assets/cases/flight-suit-sample-original.jpg" width="1086" height="1448" loading="lazy" alt="Original photograph of the white LF flight-suit sample"><figcaption><a class="text-link" href="/assets/cases/flight-suit-sample-original.jpg" target="_blank" rel="noopener noreferrer">View original sample photograph</a></figcaption></figure>
    <div class="flight-detail-copy"><h3>Material selection</h3><p>Flame-resistant and anti-static fabric supported by material test reports.</p>
    <h3>Turning the brief into garment details</h3><p>The customer requested back and underarm ventilation. Drawing on previous flight-suit and racing-garment experience, LF incorporated zips into the underarm vents.</p><ul class="content-list"><li>Offset chest zip pockets for the requested appearance</li><li>A leg pocket positioned for flight-chart access</li><li>Sleeve pockets and fleece at the back neck</li><li>Mesh ventilation openings at the back and underarms</li></ul>
    <h3>One round of sample refinements</h3><p>The sample revisions narrowed the leg openings, lengthened the epaulettes and enlarged the back-ventilation area.</p>
    <div class="flight-vent-grid"><figure><div class="flight-vent-frame"><img src="/assets/cases/flight-suit-back-vent-original.jpg" width="1536" height="1024" loading="lazy" alt="Covered back vent"></div><figcaption><strong>Covered back vent</strong><span>Mesh beneath the outer panel.</span></figcaption></figure><figure><div class="flight-vent-frame"><img src="/assets/cases/flight-suit-underarm-vent-original.jpg" width="1536" height="1024" loading="lazy" alt="Zipped underarm vent"></div><figcaption><strong>Zipped underarm vent</strong><span>A zip opening with an inner mesh panel.</span></figcaption></figure></div>
    <p>The 10-piece order was delivered to Friedrichshafen, Germany, via FedEx International Priority, 28 days after order placement. This was the complete order-to-arrival interval for this project.</p>
    <p class="disclaimer">The ripstop fabric has test reports for flame-resistant and anti-static properties. These are material reports, not certification of the finished suit.</p></div></div>
  </div></section>`;
}

function standardPage(name) {
  const context = { buyerCommon, flightSuitDetails, inquiryForm, projectCases, appleStaffCase, pekingUniversityCase, projectBuyerLinks, winterEventStudy, logos, developmentScope: renderDevelopmentScope() };
  const page = {
    customization: { title: buyerCommon.customization.title, description: buyerCommon.customization.description, active: "customization", render: renderCustomization, image: "/assets/editorial/professional-design-stock-v3.webp" },
    "process-quality": { title: "Workwear Quality Control & Inspection | LF Clothing", description: "See how LF manufactures clothing in our own factory, from approved samples and material checks to production, inspection, packing and export preparation.", active: "process", render: renderProcess, image: "/assets/editorial/enterprise-projects-stock-v3.webp" },
    projects: { title: "Uniform & Branded Apparel Project Examples | LF Clothing", description: "See documented LF Clothing apparel programs and real samples for ANA, Mercedes-Benz, SMS group, PetroChina, Sinopec, IBM, Apple and other organisations.", active: "projects", render: renderProjects, image: winterEventStudy.image },
    about: { title: "China Clothing Manufacturer & Uniform Supplier | LF Clothing", description: "Meet LF Clothing, a custom clothing manufacturer with our own factory in China. We develop, sample and produce uniforms, workwear and branded apparel.", active: "about", render: renderAbout, image: "/assets/operations/sample-showroom-03.webp", schema: [buyerFaqSchema] },
    inquiry: { title: "Request a Custom Clothing Quote | LF Clothing", description: "Tell our factory what you would like to make. Send a short description or attach a reference for a custom garment, staff uniform or private label collection.", active: "inquiry", render: renderInquiry },
  }[name];
  return layout({ ...page, pathName: `/${name}`, body: page.render(context) });
}

async function writePage(route, html) {
  const target = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.slice(1), "index.html");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "styles.css"), styles + "\n" + localizationStyles, "utf8");
await writeFile(path.join(dist, "site.js"), siteJs, "utf8");
await writeFile(path.join(dist, "analytics.js"), analyticsJs, "utf8");

await cp(path.join(root, "assets", "brand"), path.join(dist, "assets", "brand"), { recursive: true });
await cp(path.join(root, "assets", "products"), path.join(dist, "assets", "products"), { recursive: true });
await cp(path.join(root, "assets", "operations"), path.join(dist, "assets", "operations"), { recursive: true });
await cp(path.join(root, "assets", "steps"), path.join(dist, "assets", "steps"), { recursive: true });
await cp(path.join(root, "assets", "capabilities"), path.join(dist, "assets", "capabilities"), { recursive: true });
await cp(path.join(root, "assets", "cases"), path.join(dist, "assets", "cases"), { recursive: true });
await cp(path.join(root, "assets", "certifications"), path.join(dist, "assets", "certifications"), { recursive: true });
await mkdir(path.join(dist, "assets", "editorial"), { recursive: true });
for (const file of (await readdir(path.join(root, "assets", "editorial"))).filter((name) => name.endsWith(".webp"))) await cp(path.join(root, "assets", "editorial", file), path.join(dist, "assets", "editorial", file));
await mkdir(path.join(dist, "assets", "site"), { recursive: true });
for (const file of ["process-table-hero.webp", "hero-factory-hero.webp", "workshop-rack-hero.webp"]) await cp(path.join(root, "assets", "site", file), path.join(dist, "assets", "site", file));
await mkdir(path.join(dist, "assets", "partners"), { recursive: true });
for (const [, file] of partners) await cp(path.join(root, "assets", "partners", file), path.join(dist, "assets", "partners", file));

await writePage("/", layout({ title: homeTitle, description: homeDescription, pathName: "/", active: "home", body: homeBody, image: "/assets/editorial/apparel-development-hero-stock-v4.webp", schema: [websiteSchema] }));
await writePage("/products", productsPage());
await writePage("/guides", layout({ title: "Apparel Sourcing & Development Resources | LF Clothing", description: guidesIntro, pathName: "/guides", active: "guides", body: renderGuidesIndex(customizationGuides), schema: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Customization guides", url: absolute("/guides") }] }));
for (const [slug, page] of Object.entries(newPages)) {
  await writePage(`/${slug}`, layout({ title: page.title, description: page.intro, pathName: `/${slug}`, active: slug, body: renderNewPage(slug), image: page.image }));
}
for (const guide of customizationGuides) await writePage(`/guides/${guide.slug}`, customizationGuidePage(guide));
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

const routes = [...Object.keys(newPages).map(slug => `/${slug}`), "/", "/products", "/guides", ...customizationGuides.map((guide) => `/guides/${guide.slug}`), ...detailProducts.map(productUrl), ...priorityPages.map((item) => item.route), ...collections.map((item) => `/collections/${item.slug}`), aviationRoute, eventRoute, ...projectStudies.map((study) => `/projects/${study.slug}`), "/customization", "/process-quality", "/projects", "/about", "/inquiry"];
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
