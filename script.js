const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const rfqForm = document.querySelector("[data-rfq-form]");
const formMessage = document.querySelector("[data-form-message]");
const submitButton = document.querySelector("[data-submit-button]");
const heroCarousel = document.querySelector("[data-hero-carousel]");
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

function syncHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("menu-open");
    });
  });
}

function prefillInquiryForm() {
  if (!rfqForm) return;

  const params = new URLSearchParams(window.location.search);
  const request = params.get("request");
  const category = params.get("category");
  const style = params.get("style");
  const requestType = rfqForm.elements.requestType;
  const categoryField = rfqForm.elements.category;
  const styleField = rfqForm.elements.productStyle;

  const requestValues = {
    catalog: "Full Product Catalog",
    product: "Product Inquiry",
    sample: "Sample Development",
    quote: "Quotation Request",
  };

  if (requestType && requestValues[request]) {
    requestType.value = requestValues[request];
  }
  if (categoryField && category) {
    categoryField.value = category;
  }
  if (styleField && style) {
    styleField.value = style;
  }
}

prefillInquiryForm();

if (heroCarousel) {
  const heroSlides = Array.from(heroCarousel.querySelectorAll(".hero-slide"));
  const heroDots = Array.from(heroCarousel.querySelectorAll("[data-hero-index]"));
  const heroImages = heroSlides.map((slide) => slide.querySelector("img"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const readyHeroIndices = new Set();
  let activeHeroIndex = 0;
  let heroTimer;

  function showHeroSlide(index) {
    if (!readyHeroIndices.has(index)) return false;
    activeHeroIndex = index;
    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    heroDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
    return true;
  }

  function stopHeroRotation() {
    window.clearInterval(heroTimer);
  }

  function startHeroRotation() {
    if (reduceMotion || readyHeroIndices.size < 2) return;
    stopHeroRotation();
    heroTimer = window.setInterval(() => {
      for (let offset = 1; offset <= heroSlides.length; offset += 1) {
        const nextIndex = (activeHeroIndex + offset) % heroSlides.length;
        if (showHeroSlide(nextIndex)) break;
      }
    }, 5500);
  }

  async function markHeroReady(index) {
    const image = heroImages[index];
    if (!image || !image.complete || !image.naturalWidth) return;
    try {
      if (image.decode) await image.decode();
    } catch {
      // A loaded image can still be displayed when decode() is unavailable or rejects.
    }
    readyHeroIndices.add(index);
    if (heroDots[index]) heroDots[index].disabled = false;
    startHeroRotation();
  }

  async function loadDeferredHeroImages() {
    for (let index = 1; index < heroImages.length; index += 1) {
      const image = heroImages[index];
      if (!image?.dataset.src) continue;

      await new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
        image.src = image.dataset.src;
        delete image.dataset.src;
      });
      await markHeroReady(index);
    }
  }

  heroDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showHeroSlide(Number(dot.dataset.heroIndex));
      startHeroRotation();
    });
  });

  heroCarousel.addEventListener("mouseenter", stopHeroRotation);
  heroCarousel.addEventListener("mouseleave", startHeroRotation);
  heroCarousel.addEventListener("focusin", stopHeroRotation);
  heroCarousel.addEventListener("focusout", startHeroRotation);

  const firstHeroImage = heroImages[0];
  if (firstHeroImage?.complete) {
    markHeroReady(0);
  } else {
    firstHeroImage?.addEventListener("load", () => markHeroReady(0), { once: true });
  }

  window.addEventListener("load", () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadDeferredHeroImages, { timeout: 1500 });
    } else {
      window.setTimeout(loadDeferredHeroImages, 250);
    }
  }, { once: true });
}

function showFormMessage(message, isError = false) {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.classList.toggle("is-error", isError);
  formMessage.classList.add("is-visible");
  formMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  formMessage.focus();
}

function readAttachment(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      reject(new Error("Please upload a file under 4 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const content = result.includes(",") ? result.split(",")[1] : result;
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        content,
      });
    };
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

if (rfqForm && formMessage) {
  rfqForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    formMessage.classList.remove("is-visible", "is-error");

    try {
      const formData = new FormData(rfqForm);
      const file = formData.get("file");
      const attachment = file instanceof File && file.size ? await readAttachment(file) : null;

      const payload = {
        website: formData.get("website") || "",
        requestType: formData.get("requestType") || "",
        name: formData.get("name") || "",
        company: formData.get("company") || "",
        email: formData.get("email") || "",
        phone: formData.get("phone") || "",
        country: formData.get("country") || "",
        category: formData.get("category") || "",
        productStyle: formData.get("productStyle") || "",
        quantity: formData.get("quantity") || "",
        logoMethod: formData.get("logoMethod") || "",
        delivery: formData.get("delivery") || "",
        customization: formData.get("customization") || "",
        functionRequirements: formData.get("function") || "",
        message: formData.get("message") || "",
        attachment,
      };

      const response = await fetch("/.netlify/functions/rfq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Unable to send your request right now.");
      }

      showFormMessage("Thank you. Your inquiry has been received. Our team will review the details and contact you soon.");
      rfqForm.reset();
    } catch (error) {
      showFormMessage(error.message || "Unable to send your request right now. Please email sales@lfclothing.com directly.", true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Inquiry";
      }
    }
  });
}
