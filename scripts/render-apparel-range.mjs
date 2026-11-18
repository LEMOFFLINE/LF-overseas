import { corporateHero, corporateCta } from "./render-corporate-pages.mjs";

const esc = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const a = (title, href) => `<a class="text-link" href="${href}">${esc(title)}</a>`;
const section = (title, body, soft = false) => `<section class="section${soft ? " section-soft" : ""}"><div class="container"><div class="section-head"><h2>${esc(title)}</h2></div>${body}</div></section>`;

import { portfolio, capabilities, sectors, qualitySteps, companyIntro, rangeExamples } from "./apparel-portfolio-data.mjs";

function categoryCards(full) {
  const cards = portfolio.map(([id, title, description, img, links]) => {
    const href = full ? links[0][1] : `/products#${id}`;
    const related = full ? links : [id === "team" ? links[1] : links[0]];
    return `<article class="portfolio-card" data-range-category="${id}"${full ? ` id="${id}"` : ""}>
      <a class="portfolio-photo${img.startsWith("editorial/") ? " is-scene" : ""}" href="${href}" aria-label="${esc(title)}"><img src="/assets/${img}" alt="" width="480" height="400" loading="lazy"></a>
      <div><h3><a href="${href}">${esc(title)}</a></h3><p>${esc(rangeExamples[id])}</p>
        ${full ? `<p>${esc(description)}</p>` : ""}
        <div class="portfolio-links">${related.map(([label,url]) => a(label,url)).join("")}</div>
      </div></article>`;
  });
  return `<div class="portfolio-grid">${cards.join("")}</div>`;
}
function topicRows(rows) {
  return `<dl class="portfolio-topics">${rows.map(([title,body])=>`<div><dt>${esc(title)}</dt><dd>${esc(body)}</dd></div>`).join("")}</dl>`;
}
const photo = (src,alt) => `<img class="portfolio-feature" src="/assets/${src}" alt="${esc(alt)}" width="960" height="720" loading="lazy">`;
const topicLinks = (rows,route) => `<ul class="portfolio-index">${rows.map(([title],i)=>`<li>${a(title,route+"#topic-"+(i+1))}</li>`).join("")}</ul>`;
export const homeTitle = "Custom Apparel Manufacturer & Clothing Supplier | LF Clothing";
export const homeDescription = "LF Clothing provides custom apparel manufacturing and supply solutions for businesses, brands and professional buyers, covering workwear, uniforms, casualwear, outerwear and specialized garments.";
export const productTitle = "Custom Apparel Products, Workwear & Uniforms | LF Clothing";
export const productDescription = "Explore LF Clothing's comprehensive apparel range, including industrial workwear, protective clothing, corporate uniforms, casualwear, jackets, aviation apparel and accessories.";
const homeIntro = "OEM and ODM apparel for businesses, brands and professional buyers. Our own garment factory in Hebei, China develops and produces clothing from industrial uniforms to private label collections and technical outerwear.";
export function renderHome() {
  const hero = `<section class="editorial-hero"><div class="editorial-hero-grid"><figure class="editorial-hero-image"><img src="/assets/editorial/apparel-development-hero-stock-v4.webp" srcset="/assets/editorial/apparel-development-hero-stock-v4-960.webp 960w, /assets/editorial/apparel-development-hero-stock-v4.webp 1920w" sizes="100vw" width="1920" height="1280" fetchpriority="high" alt="Stock photograph illustrating garment design and pattern development"></figure><div class="container editorial-hero-copy"><p class="eyebrow">LF Clothing</p><h1>Custom apparel manufacturing and supply</h1><p>${homeIntro}</p><div class="editorial-hero-actions"><a class="btn btn-primary" href="/inquiry">Request a Quote</a><a class="btn btn-outline" href="/products">Explore Our Range</a><a class="btn btn-outline hero-whatsapp" href="https://wa.me/8613901335518">WhatsApp</a></div></div></div></section>`;
  return hero + section("Our product range", categoryCards(false)) +
    section("Manufacturing capabilities", `<div class="portfolio-split">${photo("operations/pattern-and-cutting-table.webp","Pattern development and cutting")}${topicLinks(capabilities,"/manufacturing-capabilities")}</div>`,true) +
    section("Industries & solutions", topicLinks(sectors,"/industries")) +
    section("Quality & delivery assurance", `<div class="portfolio-split"><div>${topicRows([qualitySteps[0],qualitySteps[2],qualitySteps[3]])}</div><div>${topicRows([qualitySteps[4],qualitySteps[5],qualitySteps[6],qualitySteps[7]])}</div></div>${a("Review quality control","/process-quality")}`,true) +
    section("Selected projects", `<div class="portfolio-projects">${[["Aviation","cases/flight-suit-sample-original.jpg","/projects#specialist-project"],["SMS group","cases/sms-group-work-jacket.webp","/projects#staff-projects"],["Mercedes-Benz","cases/mercedes-event-jacket.webp","/projects/winter-event-clothing-2019"]].map(([title,img,url])=>`<a href="${url}"><img src="/assets/${img}" alt="" width="420" height="340" loading="lazy"><strong>${esc(title)}</strong></a>`).join("")}</div>${a("View our projects","/projects")}`) +
    section("About LF Clothing", `<div class="portfolio-split">${photo("operations/sewing-line-overview-02.webp","Garment production floor in LF's own factory")}<div><h3>Beijing Lingfeng Clothing Co., Ltd.</h3><p>${companyIntro}</p>${a("About LF Clothing","/about")}</div></div>`,true) + corporateCta();
}
export function renderProductsOverview() {
  return corporateHero({eyebrow:"Products",title:"Custom apparel products and supply",intro:productDescription,actions:[["Request a Quote","/inquiry"],["Manufacturing capabilities","/manufacturing-capabilities"]]}) +
    section("Product portfolio",categoryCards(true)) +
    section("Coordinated uniform programmes",`<p>We can coordinate summer uniforms, winter jackets, trousers and accessories under one brief, with agreed samples, branding and shipment dates.</p>${a("Industries & solutions","/industries")}`,true) +
    section("Full garment development",`<p>Send a tech pack, sketch, photograph or sample garment. We can develop a new pattern, construction, fabric combination and brand details for your collection.</p>${a("Manufacturing capabilities","/manufacturing-capabilities")} · ${a("Customization","/customization")}`) + corporateCta();
}
export const newPages = {
  industries: {label:"Industries & solutions", title:"Apparel Solutions by Industry | LF Clothing", intro:"Choose uniforms by role, working conditions and brand identity. Combine garments and accessories across teams under one purchasing programme.", image:"/assets/cases/ana-ground-crew-coverall.webp"},
  "manufacturing-capabilities": {label:"Manufacturing capabilities", title:"Apparel Manufacturing Capabilities | LF Clothing", intro:"Explore how our Hebei factory develops patterns, selects materials and makes garments from the first sample through bulk production.", image:"/assets/operations/pattern-and-cutting-table.webp"},
};
export function renderNewPage(key) {
  const p = newPages[key], industry = key === "industries";
  const rows = industry ? sectors : capabilities;
  return corporateHero({eyebrow:"LF Clothing",title:p.label,breadcrumbLabel:p.label,intro:p.intro,image:p.image,contain:industry,alt:industry?"ANA ground crew coverall supplied through an apparel program":"Pattern development and cutting",actions:[[industry?"Explore Our Range":"Discuss Your Brief",industry?"/products":"/inquiry"]]}) +
    section(industry?"Industries we serve":"Product development and production", `<div class="portfolio-details">${rows.map(([title,body,id],i)=>`<article id="topic-${i+1}"><h3>${esc(title)}</h3><p>${esc(body)}</p>${industry ? a(portfolio.find(row=>row[0]===id)[1],"/products#"+id) : ""}</article>`).join("")}</div>`) +
    section(industry?"Coordinated uniform programmes":"Sample approval", `<p>${industry?"Plan a common colour palette and branding, then adapt fabric, fit and pockets to each role. Confirm quantities by style, colour and size for packing and reorders.":esc(qualitySteps[2][1])}</p>${a(industry?"Request a Quote":"Customization",industry?"/inquiry":"/customization")}`,true) + corporateCta();
}
