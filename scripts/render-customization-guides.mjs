import { corporateHero, corporateCta, corporateFaqs } from "./render-corporate-pages.mjs";

const esc = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export const developmentScope = "Share your reference and requirements so we can assess materials, construction and sampling. The development route, price and schedule are confirmed for your project.";
export const guidesIntro = "Practical guides to preparing a custom clothing brief, choosing development details and reviewing samples. Start with your intended use and a reference image.";

export function renderDevelopmentScope(showGuideLink = true) {
  return `<div class="development-scope"><h2>Custom clothing development</h2><p>${developmentScope}</p>${showGuideLink ? '<a class="text-link" href="/guides/">Read our customization guides</a>' : ""}</div>`;
}

export function renderReferenceNote() {
  return `<p class="development-reference-note">Design reference for discussion. Fabric, construction and feasibility are reviewed for your brief; the approved sample defines the garment for production.</p>`;
}

export function renderGuidesIndex(guides) {
  return corporateHero({ eyebrow: "Customization guides", title: "Plan your custom clothing project", intro: guidesIntro }) +
    `<section class="section"><div class="container">${renderDevelopmentScope(false)}<div class="guide-list">${guides.map(guide => `<article><h2><a href="/guides/${guide.slug}/">${esc(guide.heading)}</a></h2><p>${esc(guide.intro)}</p><a class="text-link" href="/guides/${guide.slug}/">Read the guide</a></article>`).join("")}</div></div></section>` + corporateCta();
}

export function renderCustomizationGuide(guide, guides, orderFaqs) {
  const relatedGuides = guides.filter(item => item.slug !== guide.slug);
  return corporateHero({ eyebrow: "Customization guides", title: guide.heading, intro: guide.intro, breadcrumbLabel: guide.heading, crumbs: [["Customization guides", "/guides/"]] }) +
    `<article class="section guide-article"><div class="container guide-layout"><div class="guide-copy"><p class="guide-byline">By LF Clothing</p>${guide.sections.map((section, index) => `<section id="step-${index + 1}"><h2>${esc(section.heading)}</h2><p>${esc(section.text)}</p></section>`).join("")}<p><a class="text-link" href="${guide.relatedUrl}">${esc(guide.relatedLabel)}</a></p></div><aside class="guide-sidebar"><h2>In this guide</h2><nav aria-label="In this guide"><ol>${guide.sections.map((section, index) => `<li><a href="#step-${index + 1}">${esc(section.heading)}</a></li>`).join("")}</ol></nav>${relatedGuides.length ? `<h2>More customization guides</h2><ul>${relatedGuides.map(item => `<li><a href="/guides/${item.slug}/">${esc(item.heading)}</a></li>`).join("")}</ul>` : ""}</aside></div></article>` +
    corporateFaqs(orderFaqs, "Sampling and production questions") +
    corporateCta("Discuss your custom clothing brief", "Send your reference image, requested changes, quantities, destination and required arrival date. We will review the development route with you.");
}
