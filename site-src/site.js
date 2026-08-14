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

const rfqForm = document.querySelector("[data-inquiry-form]");
if (rfqForm) {
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

  const message = document.querySelector("[data-form-message]");
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
      const response = await fetch("/.netlify/functions/rfq", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to send the inquiry right now.");
      rfqForm.reset();
      showMessage("Thank you. Your inquiry has been sent to LF Clothing.");
    } catch (error) {
      showMessage(`${error.message} You can also email sales@lfclothing.com.`, true);
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
}
