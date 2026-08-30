const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  });
  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }));
}

const carousel = document.querySelector("[data-hero-carousel]");
if (carousel) {
  const slides = [...carousel.querySelectorAll(".hero-slide")];
  const dots = [...carousel.querySelectorAll(".hero-dot")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = 0;
  let timer;
  const show = (index) => {
    active = index;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-pressed", String(i === index));
    });
  };
  const start = () => {
    if (reduced || slides.length < 2) return;
    clearInterval(timer);
    timer = setInterval(() => show((active + 1) % slides.length), 6500);
  };
  dots.forEach((dot, index) => dot.addEventListener("click", () => { show(index); start(); }));
  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", () => clearInterval(timer));
  carousel.addEventListener("focusout", start);
  start();
}

const mobileQuoteBar = document.querySelector(".mobile-quote-bar");
const homeHero = document.querySelector(".home-hero");
if (mobileQuoteBar && homeHero) {
  if ("IntersectionObserver" in window) {
    const quoteObserver = new IntersectionObserver(([entry]) => {
      mobileQuoteBar.classList.toggle("is-visible", !entry.isIntersecting);
    }, { threshold: 0.05 });
    quoteObserver.observe(homeHero);
  } else {
    mobileQuoteBar.classList.add("is-visible");
  }
}

const productGrid = document.querySelector("[data-product-grid]");
if (productGrid) {
  const cards = [...productGrid.querySelectorAll("[data-product-card]")];
  const search = document.querySelector("[data-filter-search]");
  const collection = document.querySelector("[data-filter-collection]");
  const type = document.querySelector("[data-filter-type]");
  const feature = document.querySelector("[data-filter-feature]");
  const count = document.querySelector("[data-results-count]");
  const empty = document.querySelector("[data-empty-state]");
  const apply = () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const haystack = card.dataset.search;
      const collections = card.dataset.collections.split("|");
      const features = card.dataset.features.split("|");
      const match = (!query || haystack.includes(query))
        && (!collection.value || collections.includes(collection.value))
        && (!type.value || card.dataset.type === type.value)
        && (!feature.value || features.includes(feature.value));
      card.hidden = !match;
      if (match) visible += 1;
    });
    count.textContent = `${visible} product${visible === 1 ? "" : "s"}`;
    empty.hidden = visible !== 0;
  };
  [search, collection, type, feature].forEach((control) => control?.addEventListener(control.tagName === "INPUT" ? "input" : "change", apply));
  document.querySelector("[data-clear-filters]")?.addEventListener("click", () => {
    search.value = ""; collection.value = ""; type.value = ""; feature.value = ""; apply(); search.focus();
  });
  apply();
}

const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const main = gallery.querySelector("[data-gallery-main]");
  const thumbs = [...gallery.querySelectorAll("[data-gallery-thumb]")];
  thumbs.forEach((button) => button.addEventListener("click", () => {
    main.src = button.dataset.image;
    main.alt = button.dataset.alt;
    thumbs.forEach((item) => item.classList.toggle("is-active", item === button));
  }));
}

const attributionKey = "lf_inquiry_attribution";
const classifySource = (referrer, utmSource) => {
  const source = String(utmSource || "").toLowerCase();
  const host = (() => { try { return new URL(referrer).hostname.toLowerCase(); } catch { return ""; } })();
  if (source.includes("chatgpt") || host.includes("chatgpt.com") || host.includes("openai.com")) return "ChatGPT";
  if (source.includes("perplexity") || host.includes("perplexity.ai")) return "Perplexity";
  if (source.includes("google") || host.includes("google.")) return "Google";
  if (source.includes("bing") || source.includes("copilot") || host.includes("bing.com") || host.includes("copilot.microsoft.com")) return "Bing / Copilot";
  if (source.includes("claude") || host.includes("claude.ai")) return "Claude";
  if (source.includes("gemini") || host.includes("gemini.google.com")) return "Gemini";
  if (source) return `Campaign: ${utmSource}`;
  if (host) return `Referral: ${host}`;
  return "Direct / unavailable";
};

const getFirstTouch = () => {
  try {
    const stored = sessionStorage.getItem(attributionKey);
    if (stored) return JSON.parse(stored);
  } catch {}
  const params = new URLSearchParams(location.search);
  const attribution = {
    landingPage: location.href,
    firstReferrer: document.referrer || "Direct / unavailable",
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmContent: params.get("utm_content") || "",
    utmTerm: params.get("utm_term") || "",
  };
  attribution.sourceCategory = classifySource(attribution.firstReferrer, attribution.utmSource);
  try { sessionStorage.setItem(attributionKey, JSON.stringify(attribution)); } catch {}
  return attribution;
};

const firstTouch = getFirstTouch();

document.querySelectorAll("[data-inquiry-form]").forEach((rfqForm) => {
  const params = new URLSearchParams(location.search);
  const skus = params.get("skus") || params.get("sku");
  const product = params.get("product");
  const context = params.get("context");
  const request = params.get("request");
  const initialMessage = [];
  if (request) initialMessage.push(`Request: ${request}`);
  if (skus) initialMessage.push(`Selected product: ${product ? `${skus} — ${product}` : skus}`);
  if (context) initialMessage.push(`Context: ${context}`);
  if (initialMessage.length && rfqForm.elements.message) rfqForm.elements.message.value = initialMessage.join("\n");

  const message = rfqForm.querySelector("[data-form-message]");
  const submit = rfqForm.querySelector("button[type=submit]");
  const maxBytes = 4 * 1024 * 1024;
  const fileToAttachment = (file) => new Promise((resolve, reject) => {
    if (!file || !file.size) return resolve(null);
    if (file.size > maxBytes) return reject(new Error("Please upload a file under 4 MB."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The attachment could not be read."));
    reader.onload = () => resolve({ name: file.name, size: file.size, content: String(reader.result).split(",")[1] });
    reader.readAsDataURL(file);
  });
  const showMessage = (text, error = false) => {
    message.textContent = text;
    message.classList.add("is-visible");
    message.classList.toggle("is-error", error);
    message.focus();
  };
  rfqForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!rfqForm.reportValidity()) return;
    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = "Sending…";
    try {
      const data = new FormData(rfqForm);
      const file = data.get("attachment");
      const payload = Object.fromEntries([...data.entries()].filter(([key]) => key !== "attachment"));
      payload.attachment = await fileToAttachment(file);
      payload.pageUrl = location.href;
      payload.referrer = document.referrer || "Direct / unavailable";
      payload.landingPage = firstTouch.landingPage;
      payload.firstReferrer = firstTouch.firstReferrer;
      payload.sourceCategory = firstTouch.sourceCategory;
      payload.utmSource = firstTouch.utmSource;
      payload.utmMedium = firstTouch.utmMedium;
      payload.utmCampaign = firstTouch.utmCampaign;
      payload.utmContent = firstTouch.utmContent;
      payload.utmTerm = firstTouch.utmTerm;
      const response = await fetch("/.netlify/functions/rfq", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to send the inquiry right now.");
      rfqForm.reset();
      showMessage("Thank you. Your inquiry has been sent to LF Clothing.");
      if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { source_category: firstTouch.sourceCategory });
    } catch (error) {
      showMessage(`${error.message} You can also email sales@lfclothing.com.`, true);
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
});
