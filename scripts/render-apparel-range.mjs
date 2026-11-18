import { corporateHero, corporateCta } from "./render-corporate-pages.mjs";
import { portfolio, capabilities, sectors, qualitySteps, companyIntro, rangeExamples } from "./apparel-portfolio-data.mjs";

const esc = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const link = (title, href) => `<a class="text-link" href="${href}">${esc(title)}</a>`;
const section = (title, body, soft = false) => `<section class="section${soft ? " section-soft" : ""}"><div class="container"><div class="section-head"><h2>${esc(title)}</h2></div>${body}</div></section>`;

export const homeTitle = "Custom Apparel Manufacturer & Clothing Supplier | LF Clothing";
export const homeDescription = "LF Clothing provides custom apparel manufacturing and supply solutions for businesses, brands and professional buyers, covering workwear, uniforms, casualwear, outerwear and specialized garments.";
export const productTitle = "Custom Apparel Products, Workwear & Uniforms | LF Clothing";
export const productDescription = "Explore LF Clothing's comprehensive apparel range, including industrial workwear, protective clothing, corporate uniforms, casualwear, jackets, aviation apparel and accessories.";
const homeIntro = "OEM and ODM apparel for businesses, brands and professional buyers. Our own garment factory in Hebei, China develops and produces clothing from industrial uniforms to private label collections and technical outerwear.";

const imageNote = "Industry photography illustrates applications. Products are developed to your brief and approved sample.";
const photoGroups = [
  { title: "Workwear & Outerwear", image: "range-workwear-stock-v4", alt: "Industry photograph illustrating workwear and outerwear in use", examples: "Work jackets · Coveralls · Trousers · Insulated clothing", href: "/custom-workwear", cta: "Explore workwear", categories: ["workwear","protective","outerwear","aviation"] },
  { title: "Corporate & Service Uniforms", image: "range-corporate-stock-v4", alt: "Industry photograph illustrating corporate and service clothing", examples: "Suits · Shirts · Staff polos · Tailored uniforms", href: "/collections/corporate-service-uniforms", cta: "Explore uniforms", categories: ["corporate"] },
  { title: "School, Team & Event Clothing", image: "range-team-stock-v4", alt: "Industry photograph illustrating team and casual clothing", examples: "School uniforms · T-shirts · Hoodies · Tracksuits", href: "/event-staff-uniforms", cta: "Explore team clothing", categories: ["casual","team"] },
  { title: "Accessories & Related Products", image: "range-accessories-stock-v4", alt: "Industry photograph illustrating complementary textile accessories", examples: "Caps · Bags · Footwear · Towels · Textile accessories", href: "/inquiry?request=Related%20Products", cta: "Discuss your product list", categories: ["accessories"] },
];
const byId = new Map(portfolio.map(row => [row[0], row]));

function themeFigure(key, caption, alt, extraClass = "") {
  return `<figure class="editorial-theme-image ${extraClass}"><img src="/assets/editorial/${key}.webp" srcset="/assets/editorial/${key}-960.webp 960w, /assets/editorial/${key}.webp 1536w" sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1280px) 46vw, 570px" width="1536" height="1024" loading="lazy" alt="${alt}"><figcaption>${caption}</figcaption></figure>`;
}

function rangePhoto(group, large) {
  const sizes = large
    ? "(max-width: 760px) calc(100vw - 40px), (max-width: 1280px) 46vw, 580px"
    : "(max-width: 760px) calc((100vw - 56px) / 2), (max-width: 1280px) 22vw, 282px";
  const base = "/assets/editorial/" + group.image;
  return `<img src="${base}.webp" srcset="${base}-640.webp 640w, ${base}.webp 960w" sizes="${sizes}" width="960" height="720" loading="lazy" alt="${esc(group.alt)}">`;
}
function rangeCard(group, full) {
  if (!full) {
    return `<a class="range-card" href="${group.href}">
      <div class="range-card-image">${rangePhoto(group, false)}</div>
      <h3>${esc(group.title)}</h3><p>${esc(group.examples)}</p>
      <span class="range-card-link">${esc(group.cta)} <span aria-hidden="true">→</span></span></a>`;
  }
  const sections = group.categories.map(id => {
    const title = byId.get(id)[1];
    return `<a href="#${id}">${esc(title)} <span aria-hidden="true">→</span></a>`;
  });
  return `<article class="range-collection-item">
    <a class="range-collection-image" href="${group.href}" aria-label="${esc(group.title)}">${rangePhoto(group, true)}</a>
    <div class="range-collection-title"><h2><a href="${group.href}">${esc(group.title)}</a></h2></div>
    <p class="range-items">${esc(group.examples)}</p><div class="range-collection-links">${sections.join("")}</div>
  </article>`;
}
function topicLinks(rows, route) {
  return `<ul class="portfolio-index">${rows.map(([title],i) => `<li>${link(title,route+"#topic-"+(i+1))}</li>`).join("")}</ul>`;
}
function portfolioDetails() {
  return `<div class="portfolio-details product-specs">${portfolio.map(([id,title,description,,links]) => `
    <article id="${id}"><h3>${esc(title)}</h3><p>${esc(description)}</p><p class="range-items">${esc(rangeExamples[id])}</p>
      <div class="range-collection-links">${links.map(([label,href]) => link(label,href)).join("")}</div>
    </article>`).join("")}</div>`;
}
function productRange() {
  return `<section class="editorial-range" id="our-range" aria-labelledby="home-range-title"><div class="container">
    <div class="editorial-section-head"><h2 id="home-range-title">Our product range</h2>${link("View all categories","/products")}</div>
    <div class="range-card-grid">${photoGroups.map(group => rangeCard(group,false)).join("")}</div>
    <details class="range-directory"><summary>Product portfolio</summary><dl class="range-directory-list">
      ${portfolio.map(([id,title]) => `<div><dt><a href="/products#${id}" data-range-category="${id}">${esc(title)}</a></dt><dd>${esc(rangeExamples[id])}</dd></div>`).join("")}
    </dl></details>
    <p class="editorial-image-note">${imageNote}</p></div></section>`;
}
function manufacturingSection() {
  return `<section class="editorial-customization"><div class="container editorial-customization-grid">
    ${themeFigure("professional-design-stock-v3","Apparel design & development","Stock photograph of designers working on garment patterns; illustrative industry scene")}
    <div class="editorial-customization-copy"><p class="eyebrow">Design &amp; development</p><h2>Manufacturing capabilities</h2>
      ${topicLinks(capabilities,"/manufacturing-capabilities")}${link("Explore customization","/customization")}
    </div></div></section>`;
}
function industrySection() {
  return `<section class="editorial-directory"><div class="container editorial-directory-grid">
    <div><h2>Industries &amp; solutions</h2><p>${esc(newPages.industries.intro)}</p></div>
    ${topicLinks(sectors,"/industries")}</div></section>`;
}
function qualitySection() {
  return `<section class="editorial-process"><div class="container">
    <div class="editorial-logistics-grid">${themeFigure("coordinated-logistics-stock-v4","Packing & dispatch coordination","Stock photograph of warehouse staff carrying packed cartons; illustrative logistics scene")}
      <div class="editorial-process-intro"><p class="eyebrow">Supply &amp; logistics</p><h2>Quality &amp; delivery assurance</h2>
        <p>From specifications and samples to production in our own factory, quality checks and export preparation, LF manages your order directly.</p>
        ${link("Review quality control","/process-quality")}</div></div>
    <ol class="editorial-order-steps">${qualitySteps.map(([title,body],i) => `<li><span aria-hidden="true">0${i+1}</span><details><summary>${esc(title)}</summary><p>${esc(body)}</p></details></li>`).join("")}</ol>
  </div></section>`;
}
function projectsSection() {
  const projects = [
    ["10","flight suits","Specialist flight-suit project in Germany","/projects#specialist-project"],
    ["SMS group","","Industrial Workwear","/projects#staff-projects"],
    ["2,000","outfits","Explore the winter clothing project","/projects/winter-event-clothing-2019"],
  ];
  const partners = [["ANA","ana.jpg"],["Mercedes-Benz","mercedes-benz.jpg"],["SMS group","sms-group.jpg"],["PetroChina","petrochina.jpg"],["Sinopec","sinopec.jpg"]];
  return `<section class="editorial-experience"><div class="container">
    <div class="editorial-experience-grid"><div><p class="eyebrow">Enterprise project experience</p><h2>Selected projects</h2>
      <p>Some projects were supplied through procurement partners. The names identify past supply experience and do not imply endorsement.</p>${link("View our projects","/projects")}</div>
      ${themeFigure("enterprise-projects-stock-v3","Batch embroidery & production","Stock photograph of industrial embroidery equipment, not an LF facility or customer project")}</div>
    <div class="editorial-project-facts">${projects.map(([name,unit,title,url]) => `<a href="${url}"><strong>${esc(name)}${unit ? ` <small>${esc(unit)}</small>` : ""}</strong><span>${esc(title)} <b aria-hidden="true">→</b></span></a>`).join("")}</div>
    <div class="editorial-proof-logos" aria-label="Selected project end users">${partners.map(([name,img]) => `<a href="/projects" aria-label="View ${name} apparel project"><img src="/assets/partners/${img}" width="480" height="240" loading="lazy" alt="${name}"></a>`).join("")}</div>
  </div></section>`;
}
function factorySection() {
  return `<section class="editorial-customization"><div class="container editorial-customization-grid">
    <figure class="editorial-theme-image"><img src="/assets/operations/sewing-line-overview-02.webp" alt="Garment production floor in LF's own factory" width="960" height="720" loading="lazy"></figure>
    <div class="editorial-customization-copy"><h2>About LF Clothing</h2><p>${esc(companyIntro)}</p>${link("About LF Clothing","/about")}</div>
  </div></section>`;
}

function renderInquiryCta() {
  return `<section class="editorial-contact" id="home-inquiry"><div class="container editorial-contact-inner"><div><p class="eyebrow">Project inquiry</p><h2>Discuss your next project</h2><p>Send your product list, estimated quantities, destination and required delivery date. A reference image is enough to start the conversation.</p></div><div class="editorial-contact-actions"><a class="btn btn-primary" href="/inquiry/">Request a Quote <span aria-hidden="true">→</span></a><a class="text-link" href="mailto:sales@lfclothing.com">Email our team</a></div></div></section>`;
}

export function renderHome() {
  return `<div class="apparel-editorial">
    <section class="editorial-hero" aria-labelledby="home-title"><div class="editorial-hero-grid"><figure class="editorial-hero-image"><img src="/assets/editorial/apparel-development-hero-stock-v4.webp" srcset="/assets/editorial/apparel-development-hero-stock-v4-960.webp 960w, /assets/editorial/apparel-development-hero-stock-v4.webp 1920w" sizes="100vw" width="1920" height="1280" fetchpriority="high" alt="Stock photograph of garment sample sewing with fabric and paper patterns; illustrative apparel development scene"></figure><div class="container editorial-hero-copy"><p class="eyebrow">LF Clothing</p><h1 id="home-title">Custom apparel manufacturing and supply</h1><p>${homeIntro}</p><div class="editorial-hero-actions"><a class="btn btn-primary" href="/inquiry/">Request a Quote <span aria-hidden="true">→</span></a><a class="btn btn-outline hero-range-link" href="#our-range">Explore Our Range</a><a class="btn btn-outline hero-whatsapp" href="https://wa.me/8613901335518">WhatsApp</a></div><div class="editorial-hero-foot"><span>Start with a reference image</span><span>Regular clothing: usually 50 pcs / style / colour</span><span>Clothing &amp; accessories</span></div></div></div></section>
    ${productRange()}${manufacturingSection()}${industrySection()}${qualitySection()}${projectsSection()}${factorySection()}${renderInquiryCta()}
  </div>`;
}
export function renderProductsOverview() {
  return `<div class="apparel-editorial">
    <section class="range-page-intro"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Products</span></nav>
      <h1>Custom apparel products and supply</h1><p>${esc(productDescription)}</p></div></section>
    <section class="range-collection container" aria-label="Custom clothing and related product categories">${photoGroups.map(group => rangeCard(group,true)).join("")}</section>
    <div class="container range-page-notes"><p>${imageNote}</p></div>
    ${section("Product portfolio",portfolioDetails(),true)}
    <section class="editorial-directory"><div class="container editorial-directory-grid">
      <div><h2>Coordinated uniform programmes</h2><p>We can coordinate summer uniforms, winter jackets, trousers and accessories under one brief, with agreed samples, branding and shipment dates.</p>${link("Industries & solutions","/industries")}</div>
      <div><h2>Full garment development</h2><p>Send a tech pack, sketch, photograph or sample garment. We can develop a new pattern, construction, fabric combination and brand details for your collection.</p>${link("Manufacturing capabilities","/manufacturing-capabilities")}</div>
    </div></section>${renderInquiryCta()}</div>`;
}
export const newPages = {
  industries: {label:"Industries & solutions", title:"Apparel Solutions by Industry | LF Clothing", intro:"Choose uniforms by role, working conditions and brand identity. Combine garments and accessories across teams under one purchasing programme.", image:"/assets/editorial/range-workwear-stock-v4.webp"},
  "manufacturing-capabilities": {label:"Manufacturing capabilities", title:"Apparel Manufacturing Capabilities | LF Clothing", intro:"Explore how our Hebei factory develops patterns, selects materials and makes garments from the first sample through bulk production.", image:"/assets/editorial/professional-design-stock-v3.webp"},
};
export function renderNewPage(key) {
  const p = newPages[key], industry = key === "industries";
  const rows = industry ? sectors : capabilities;
  return corporateHero({eyebrow:"LF Clothing",title:p.label,breadcrumbLabel:p.label,intro:p.intro,image:p.image,alt:industry?"Industry photograph illustrating workwear and outerwear in use":"Stock photograph of designers working on garment patterns; illustrative industry scene",actions:[[industry?"Explore Our Range":"Discuss Your Brief",industry?"/products":"/inquiry"]]}) +
    section(industry?"Industries we serve":"Product development and production", `<div class="portfolio-details">${rows.map(([title,body,id],i)=>`<article id="topic-${i+1}"><h3>${esc(title)}</h3><p>${esc(body)}</p>${industry ? link(portfolio.find(row=>row[0]===id)[1],"/products#"+id) : ""}</article>`).join("")}</div>`) +
    section(industry?"Coordinated uniform programmes":"Sample approval", `<p>${industry?"Plan a common colour palette and branding, then adapt fabric, fit and pockets to each role. Confirm quantities by style, colour and size for packing and reorders.":esc(qualitySteps[2][1])}</p>${link(industry?"Request a Quote":"Customization",industry?"/inquiry":"/customization")}`,true) + corporateCta();
}
