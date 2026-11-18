const pageLanguage = document.documentElement.lang || 'en';
const localizedCopy = JSON.parse(document.getElementById('lf-translations')?.textContent || '{}');
const t = (value) => localizedCopy[value] || value;
const languageMenu = document.querySelector('.language-switcher');
document.querySelectorAll('[data-language]').forEach((link) => {
  const target = new URL(link.href);
  target.search = location.search;
  target.searchParams.set('lang', link.dataset.language);
  target.hash = location.hash;
  link.href = target.href;
  link.addEventListener('click', () => {
    document.cookie = `lf_language=${link.dataset.language}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  });
});
document.addEventListener('click', (event) => {
  if (!languageMenu?.contains(event.target)) languageMenu?.removeAttribute('open');
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && languageMenu?.open) {
    languageMenu.removeAttribute('open');
    languageMenu.querySelector('summary')?.focus();
  }
});
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const productDropdown = document.querySelector(".nav-dropdown");
const productToggle = productDropdown?.querySelector("button");

function setProductMenu(open) {
  productDropdown?.classList.toggle("is-open", open);
  productToggle?.setAttribute("aria-expanded", String(open));
}
function setMainMenu(open) {
  navLinks?.classList.toggle("is-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", t(open ? "Close menu" : "Open menu"));
  document.body.classList.toggle("menu-open", open);
  if (!open) setProductMenu(false);
}
menuToggle?.addEventListener("click", () => setMainMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
productToggle?.addEventListener("click", () => setProductMenu(productToggle.getAttribute("aria-expanded") !== "true"));
navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMainMenu(false)));
document.addEventListener("click", (event) => {
  if (!productDropdown?.contains(event.target)) setProductMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (productToggle?.getAttribute("aria-expanded") === "true") {
    setProductMenu(false);
    productToggle.focus();
  } else if (menuToggle?.getAttribute("aria-expanded") === "true") {
    setMainMenu(false);
    menuToggle.focus();
  }
});
productDropdown?.addEventListener("focusout", (event) => {
  if (!productDropdown.contains(event.relatedTarget)) setProductMenu(false);
});
matchMedia("(max-width: 860px)").addEventListener("change", () => setMainMenu(false));

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
    count.textContent = pageLanguage === 'en' ? `${visible} product${visible === 1 ? "" : "s"}` : t('{count} products').replace('{count}', visible);
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

document.querySelectorAll('a[href^="https://wa.me"], a[href^="mailto:"], a[href^="tel:"]').forEach((link) => {
  link.addEventListener("click", () => {
    const href = link.getAttribute("href") || "";
    const contactMethod = href.startsWith("https://wa.me") ? "whatsapp" : href.startsWith("mailto:") ? "email" : "phone";
    window.lfTrackEvent?.("contact_click", { contact_method: contactMethod, page_path: location.pathname });
  });
});

const countryCodes = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" ");
const countryCodeSet = new Set(countryCodes);
const countryNames = typeof Intl.DisplayNames === "function"
  ? new Intl.DisplayNames([pageLanguage], { type: "region" })
  : null;
const countryChoices = countryCodes
  .map((code) => ({ code, name: countryNames?.of(code) || code }))
  .sort((a, b) => a.name.localeCompare(b.name, pageLanguage));

const readCookie = (name) => {
  const item = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!item) return "";
  try { return decodeURIComponent(item.slice(name.length + 1)); } catch { return ""; }
};

const saveCountryCookie = (countryCode) => {
  if (!countryCodeSet.has(countryCode)) return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `lf_country=${encodeURIComponent(countryCode)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
};

const browserCountry = () => {
  if (typeof Intl.Locale !== "function") return "";
  for (const language of navigator.languages || [navigator.language]) {
    try {
      const region = new Intl.Locale(language).region?.toUpperCase();
      if (countryCodeSet.has(region)) return region;
    } catch {}
  }
  return "";
};

document.querySelectorAll("[data-inquiry-form]").forEach((rfqForm) => {
  rfqForm.addEventListener('invalid', (event) => {
    const field = event.target;
    field.setCustomValidity(field.validity.valueMissing ? t('Please complete all required fields.') : field.validity.typeMismatch && field.type === 'email' ? t('Please enter a valid email address.') : t('Please check this field.'));
  }, true);
  for (const eventName of ['input', 'change']) rfqForm.addEventListener(eventName, (event) => event.target.setCustomValidity?.(''));
  const countrySelect = rfqForm.querySelector("[data-country-select]");
  if (countrySelect) {
    countryChoices.forEach(({ code, name }) => countrySelect.add(new Option(name, code)));
    const savedCountry = readCookie("lf_country").toUpperCase();
    const initialCountry = countryCodeSet.has(savedCountry) ? savedCountry : browserCountry();
    if (initialCountry) {
      countrySelect.value = initialCountry;
      if (!savedCountry) saveCountryCookie(initialCountry);
    }
    countrySelect.addEventListener("change", () => saveCountryCookie(countrySelect.value));
  }

  const params = new URLSearchParams(location.search);
  const skus = params.get("skus") || params.get("sku");
  const product = params.get("product");
  const context = params.get("context");
  const request = params.get("request");
  const initialMessage = [];
  if (request) initialMessage.push(`${t('Request')}: ${t(request)}`);
  if (skus) initialMessage.push(`${t('Selected product')}: ${product ? `${skus} — ${product}` : skus}`);
  if (context) initialMessage.push(`${t('Context')}: ${context}`);
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
    submit.textContent = t("Sending…");
    try {
      const data = new FormData(rfqForm);
      const file = data.get("attachment");
      const payload = Object.fromEntries([...data.entries()].filter(([key]) => key !== "attachment"));
      payload.country = payload.countryCode ? countrySelect.selectedOptions[0].textContent.trim() : "";
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
      if (!response.ok || result.ok !== true) throw new Error(response.status === 413 ? "Please upload a file under 4 MB." : "Unable to send the inquiry right now.");
      const selectedCountry = countrySelect?.value;
      rfqForm.reset();
      if (countrySelect && selectedCountry) countrySelect.value = selectedCountry;
      showMessage(t("Thank you. Your inquiry has been sent to LF Clothing."));
      window.lfTrackEvent?.("generate_lead", {
        source_category: firstTouch.sourceCategory,
        campaign_source: firstTouch.utmSource || "",
        campaign_name: firstTouch.utmCampaign || "",
        form_location: location.pathname,
      });
    } catch (error) {
      const errorText = localizedCopy[error.message] ? t(error.message) : t('Unable to send the inquiry right now.');
      showMessage(`${errorText} ${t('You can also email sales@lfclothing.com.')}`, true);
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
});
