// Shared category content keeps the homepage and product overview consistent.
export const apparelRange = [
  {
    id: "workwear", title: "Workwear & Outerwear", image: "range-workwear-stock-v4",
    alt: "Industry photograph illustrating workwear and outerwear in use",
    text: "Practical clothing for industrial, outdoor and service teams.",
    items: "Work jackets · Coveralls · Trousers · Insulated clothing",
    links: [["Workwear", "/custom-workwear/"], ["Jackets", "/custom-jackets/"], ["Hi-vis", "/collections/protective-hi-vis/"], ["Aviation", "/collections/aviation-flight-suits/"]],
    route: "/custom-workwear/", cta: "Explore workwear",
  },
  {
    id: "corporate", title: "Corporate & Service Uniforms", image: "range-corporate-stock-v4",
    alt: "Industry photograph illustrating corporate and service clothing",
    text: "A coordinated appearance for customer-facing and office teams.",
    items: "Suits · Shirts · Staff polos · Tailored uniforms",
    links: [["Corporate uniforms", "/collections/corporate-service-uniforms/"], ["Suits & tailoring", "/custom-suits/"]],
    route: "/collections/corporate-service-uniforms/", cta: "Explore uniforms",
  },
  {
    id: "team", title: "School, Team & Event Clothing", image: "range-team-stock-v4",
    alt: "Industry photograph illustrating team and casual clothing",
    text: "Your colours and identity across everyday team essentials.",
    items: "School uniforms · T-shirts · Hoodies · Tracksuits",
    links: [["School uniforms", "/school-uniforms/"], ["Team apparel", "/collections/team-staff-apparel/"], ["Event clothing", "/event-staff-uniforms/"]],
    route: "/event-staff-uniforms/", cta: "Explore team clothing",
  },
  {
    id: "accessories", title: "Accessories & Related Products", image: "range-accessories-stock-v4",
    alt: "Industry photograph illustrating complementary textile accessories",
    text: "Complementary products brought together in the same order.",
    items: "Caps · Bags · Footwear · Towels · Textile accessories",
    links: [["Discuss related products", "/inquiry/?request=Related%20Products"], ["Branding options", "/customization/"]],
    route: "/inquiry/?request=Related%20Products", cta: "Discuss your product list",
  },
];

const imageNote = "Industry photography illustrates applications. Products are developed to your brief and approved sample.";
const rangeLinks = (item) => item.links.map(([label, url]) => `<a href="${url}">${label}<span aria-hidden="true"> →</span></a>`).join("");
const rangeImage = (item, sizes, loading = "lazy") => `<img src="/assets/editorial/${item.image}.webp" srcset="/assets/editorial/${item.image}-640.webp 640w, /assets/editorial/${item.image}.webp 960w" sizes="${sizes}" width="960" height="720" loading="${loading}" alt="${item.alt}">`;
const details = [
  ["Fabric & colour", "Materials, weights and colours to suit the product and its use."],
  ["Fit & construction", "Sizing, pockets, linings and functional garment details."],
  ["Branding & packaging", "Printing, embroidery, labels, hangtags and presentation."],
];
const stages = ["Development", "Sample approval", "Production & quality checks", "Packing & export preparation"];

function themeFigure(key, caption, alt, extraClass = "") {
  return `<figure class="editorial-theme-image ${extraClass}"><img src="/assets/editorial/${key}.webp" srcset="/assets/editorial/${key}-960.webp 960w, /assets/editorial/${key}.webp 1536w" sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1280px) 46vw, 570px" width="1536" height="1024" loading="lazy" alt="${alt}"><figcaption>${caption}</figcaption></figure>`;
}

function renderHomeCustomization() {
  return `<section class="editorial-customization" aria-labelledby="home-customization-title"><div class="container editorial-customization-grid">${themeFigure("professional-design-stock-v3", "Apparel design & development", "Stock photograph of designers working on garment patterns; illustrative industry scene")}<div class="editorial-customization-copy"><p class="eyebrow">Design &amp; development</p><h2 id="home-customization-title">Custom clothing, developed to your brief</h2><p>Start with a reference image or an existing garment. We help develop the fabric, fit, construction and branding, with a sample for your approval before production.</p><dl class="editorial-detail-list">${details.map(([title, text]) => `<div><dt>${title}</dt><dd>${text}</dd></div>`).join("")}</dl><a class="text-link" href="/customization/">Explore customization</a></div></div></section>`;
}

function renderHomeExperience() {
  return `<section class="editorial-experience" aria-labelledby="home-experience-title"><div class="container"><div class="editorial-experience-grid"><div><p class="eyebrow">Enterprise project experience</p><h2 id="home-experience-title">Experience in enterprise apparel supply</h2><p>With 20 years of clothing industry experience, LF supports corporate uniform programmes, industrial workwear and event apparel projects.</p><a class="text-link" href="/projects/">View our projects</a></div>${themeFigure("enterprise-projects-stock-v3", "Batch embroidery & production", "Stock photograph of industrial embroidery equipment, not an LF facility or customer project")}</div><div class="editorial-project-facts"><a href="/projects/"><strong>600 <small>coveralls</small></strong><span>ANA ground-crew apparel programme <b aria-hidden="true">→</b></span></a><a href="/projects/winter-event-clothing-2019/"><strong>2,000 <small>outfits</small></strong><span>Mercedes-Benz winter event · 2019 <b aria-hidden="true">→</b></span></a><a href="/projects/"><strong>Repeat <small>supply</small></strong><span>SMS group industrial work jackets <b aria-hidden="true">→</b></span></a></div><div class="editorial-proof-logos" aria-label="Selected project end users">${[["ANA", "ana.jpg"], ["Mercedes-Benz", "mercedes-benz.jpg"], ["SMS group", "sms-group.jpg"], ["PetroChina", "petrochina.jpg"], ["Sinopec", "sinopec.jpg"]].map(([name, file]) => `<a href="/projects/" aria-label="View ${name} apparel project"><img src="/assets/partners/${file}" width="480" height="240" loading="lazy" alt="${name}"></a>`).join("")}</div><p class="editorial-proof-note">Selected project end users. Supply experience includes orders through procurement partners.</p></div></section>`;
}

function renderHomeProcess() {
  return `<section class="editorial-process" aria-labelledby="home-process-title"><div class="container"><div class="editorial-logistics-grid">${themeFigure("coordinated-logistics-stock-v4", "Packing & dispatch coordination", "Stock photograph of warehouse staff carrying packed cartons; illustrative logistics scene")}<div class="editorial-process-intro"><p class="eyebrow">Supply &amp; logistics</p><h2 id="home-process-title">Coordinated supply, from development to delivery</h2><p>One point of contact for clothing and complementary products. We coordinate specialist production partners, quality checks, packing and export preparation around your agreed requirements.</p><a class="text-link" href="/process-quality/">Our process &amp; quality checks</a></div></div><ol class="editorial-order-steps">${stages.map((title, i) => `<li><span aria-hidden="true">0${i + 1}</span><h3>${title}</h3></li>`).join("")}</ol></div></section>`;
}

export function renderInquiryCta() {
  return `<section class="editorial-contact" id="home-inquiry"><div class="container editorial-contact-inner"><div><p class="eyebrow">Project inquiry</p><h2>Discuss your next project</h2><p>Send your product list, estimated quantities, destination and required delivery date. A reference image is enough to start the conversation.</p></div><div class="editorial-contact-actions"><a class="btn btn-primary" href="/inquiry/">Request a Quote <span aria-hidden="true">→</span></a><a class="text-link" href="mailto:sales@lfclothing.com">Email our team</a></div></div></section>`;
}

export function renderHome() {
  return `<div class="apparel-editorial">
    <section class="editorial-hero" aria-labelledby="home-title"><div class="editorial-hero-grid"><figure class="editorial-hero-image"><img src="/assets/editorial/apparel-development-hero-stock-v4.webp" srcset="/assets/editorial/apparel-development-hero-stock-v4-960.webp 960w, /assets/editorial/apparel-development-hero-stock-v4.webp 1920w" sizes="100vw" width="1920" height="1280" fetchpriority="high" alt="Stock photograph of garment sample sewing with fabric and paper patterns; illustrative apparel development scene"></figure><div class="container editorial-hero-copy"><p class="eyebrow">China-based custom apparel supplier</p><h1 id="home-title">Custom Clothing &amp;<br>Related Products</h1><p>LF Clothing coordinates product development, sampling, production and export preparation, backed by 20 years of apparel industry experience.</p><div class="editorial-hero-actions"><a class="btn btn-primary" href="/inquiry/">Request a Quote <span aria-hidden="true">→</span></a><a class="btn btn-outline" href="#our-range">Explore Our Range</a></div><div class="editorial-hero-foot"><span>Custom apparel</span><span>Enterprise supply experience</span><span>One point of contact</span></div></div></div></section>
    <section class="editorial-range" id="our-range" aria-labelledby="home-range-title"><div class="container"><div class="editorial-section-head"><div><p class="eyebrow">Our product range</p><h2 id="home-range-title">Clothing and accessories for your business</h2><p>From one garment type to a coordinated range, supplied through one point of contact.</p></div><a class="text-link" href="/products/">View all categories</a></div><div class="range-card-grid">${apparelRange.map((item) => `<a class="range-card" href="${item.route}" data-range-category="${item.id}"><div class="range-card-image">${rangeImage(item, "(max-width: 760px) calc((100vw - 56px) / 2), (max-width: 1280px) 22vw, 282px")}</div><h3>${item.title}</h3><p>${item.items}</p><span class="range-card-link">${item.cta} <span aria-hidden="true">→</span></span></a>`).join("")}</div><p class="editorial-image-note">${imageNote}</p></div></section>
    ${renderHomeCustomization()}${renderHomeExperience()}${renderHomeProcess()}${renderInquiryCta()}
  </div>`;
}

export function renderProductsOverview() {
  return `<div class="apparel-editorial"><section class="range-page-intro"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Products</span></nav><p class="eyebrow">Our product range</p><h1>Custom clothing &amp; related products</h1><p>Explore the categories we supply. Choose one product type or bring together clothing and accessories for a complete programme.</p></div></section><section class="range-collection container" aria-label="Custom clothing and related product categories">${apparelRange.map((item, i) => `<article class="range-collection-item" id="${item.id}"><a class="range-collection-image" href="${item.route}" aria-label="${item.cta}">${rangeImage(item, "(max-width: 760px) calc(100vw - 40px), (max-width: 1280px) 46vw, 580px", i < 2 ? "eager" : "lazy")}</a><div class="range-collection-title"><h2>${item.title}</h2></div><p>${item.text}</p><p class="range-items">${item.items}</p><nav class="range-collection-links" aria-label="${item.title} options">${rangeLinks(item)}</nav></article>`).join("")}</section><div class="container range-page-notes"><p class="editorial-image-note">${imageNote}</p><p>Also explore <a href="/collections/industrial-workwear/">industrial workwear</a> and <a href="/collections/cold-weather-outdoor-workwear/">cold-weather clothing</a>.</p></div><section class="range-customization"><div class="container"><div><p class="eyebrow">Design &amp; development</p><h2>Developed to your requirements</h2><p>Adapt an existing style or develop a new garment. We coordinate fabrics, fit, colours, branding and samples with specialist production partners.</p></div><a class="btn btn-outline" href="/customization/">Explore Customization</a></div></section>${renderInquiryCta()}</div>`;
}
