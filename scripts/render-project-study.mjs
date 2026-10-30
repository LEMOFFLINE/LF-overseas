// Shared editorial layout for documented projects and clearly labelled visualizations.
export function renderProjectStudyBody(study, { escapeHtml, breadcrumb, eventRoute, corporateRoute }) {
  const visuals = study.visuals;
  return `<article class="project-story">
    <section class="study-hero container">
      ${breadcrumb([["Home", "/"], ["Projects", "/projects"]], "Winter event clothing · 2019")}
      <div class="study-hero-grid">
        <div class="study-intro"><p class="eyebrow">${escapeHtml(study.eyebrow)}</p><h1>${escapeHtml(study.heading)}</h1><p>${escapeHtml(study.intro)}</p></div>
        <figure class="study-hero-figure"><img src="${visuals.overview.src}" width="1536" height="1024" fetchpriority="high" alt="${escapeHtml(visuals.overview.alt)}"><figcaption><span class="study-image-note">AI outfit visualization</span>${escapeHtml(visuals.overview.caption)}</figcaption></figure>
      </div>
    </section>
    <section class="study-facts container" aria-label="Project facts">${study.facts.map((fact) => `<div class="study-fact"><strong>${escapeHtml(fact.value)}</strong><small>${escapeHtml(fact.label)}</small></div>`).join("")}</section>
    <section class="study-section container" aria-labelledby="study-outfit-heading">
      <div class="study-section-head"><span>01 / The complete outfit</span><h2 id="study-outfit-heading">Designed to belong together.</h2><p>Four product types shared one winter-event brief, from the outerwear to the finishing accessories.</p></div>
      <div class="study-kit-grid">${study.outfit.map(([name, detail], index) => `<div class="study-kit-item"><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(name)}</h3><p>${escapeHtml(detail)}</p></div>`).join("")}</div>
    </section>
    <section class="study-section container" aria-labelledby="study-materials-heading">
      <div class="study-section-head"><span>02 / Material decisions</span><h2 id="study-materials-heading">Consistency you can see.<br>Warmth built into the brief.</h2></div>
      <div class="study-material-grid">
        <figure class="study-image-card"><img src="${visuals.matching.src}" width="1448" height="1086" loading="lazy" alt="${escapeHtml(visuals.matching.alt)}"><figcaption><span class="study-image-note">${escapeHtml(visuals.matching.caption)}</span><h3>One shell fabric. Two products.</h3><p>${escapeHtml(study.sections[0].body)}</p></figcaption></figure>
        <figure class="study-image-card"><img src="${visuals.insulation.src}" width="1448" height="1086" loading="lazy" alt="${escapeHtml(visuals.insulation.alt)}"><figcaption><span class="study-image-note">${escapeHtml(visuals.insulation.caption)}</span><h3>Insulation and a fleece interior.</h3><p>${escapeHtml(study.sections[1].body)}</p></figcaption></figure>
      </div>
    </section>
    <section class="study-reference container" aria-labelledby="study-coordination-heading">
      <figure><img src="${study.image}" width="1122" height="1402" loading="lazy" alt="${escapeHtml(study.imageAlt)}"><figcaption>${escapeHtml(study.imageCaption)}</figcaption></figure>
      <div class="study-reference-copy"><p class="eyebrow">03 / What LF coordinated</p><h2 id="study-coordination-heading">One brief, across the whole outfit.</h2><p>${escapeHtml(study.sections[2].body)}</p><ul class="study-points">${study.coordinationPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul></div>
    </section>
    <section class="study-delivery container" aria-labelledby="study-delivery-heading">
      <div class="study-delivery-number">30<span>days · project delivery</span></div>
      <div><p class="eyebrow">04 / The result</p><h2 id="study-delivery-heading">2,000 complete sets delivered.</h2><p>${escapeHtml(study.outcome)}</p></div>
    </section>
    <section class="study-next container" aria-labelledby="study-next-heading">
      <p class="eyebrow">Your next event</p><h2 id="study-next-heading">${escapeHtml(study.buyerHeading)}</h2><p>${escapeHtml(study.buyerText)}</p>
      <div class="cta-actions"><a class="btn btn-primary" href="/inquiry?request=Coordinated%20Winter%20Event%20Clothing">Discuss Your Event Outfit</a><a class="btn btn-outline" href="/projects">View More Projects</a></div>
      <nav class="study-related" aria-label="Related clothing programs"><a class="text-link" href="${eventRoute}">Event staff clothing</a><a class="text-link" href="${corporateRoute}">Corporate uniforms</a><a class="text-link" href="/custom-jackets">Winter jacket options</a></nav>
    </section>
  </article>`;
}
