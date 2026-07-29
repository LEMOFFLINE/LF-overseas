const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const rfqForm = document.querySelector("[data-rfq-form]");
const formMessage = document.querySelector("[data-form-message]");
const submitButton = document.querySelector("[data-submit-button]");
const heroCarousel = document.querySelector("[data-hero-carousel]");
const footer = document.querySelector(".footer");
const whatsappLink = document.querySelector(".whatsapp-link");
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

function syncHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (footer && whatsappLink && "IntersectionObserver" in window) {
  const footerObserver = new IntersectionObserver(
    ([entry]) => {
      whatsappLink.classList.toggle("is-hidden", entry.isIntersecting);
    },
    { threshold: 0.05 },
  );

  footerObserver.observe(footer);
}

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
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeHeroIndex = 0;
  let heroTimer;

  function showHeroSlide(index) {
    activeHeroIndex = index;
    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    heroDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
  }

  function stopHeroRotation() {
    window.clearInterval(heroTimer);
  }

  function startHeroRotation() {
    if (reduceMotion || heroSlides.length < 2) return;
    stopHeroRotation();
    heroTimer = window.setInterval(() => {
      showHeroSlide((activeHeroIndex + 1) % heroSlides.length);
    }, 5500);
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
  startHeroRotation();
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
