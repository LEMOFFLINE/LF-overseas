const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const rfqForm = document.querySelector("[data-rfq-form]");
const formMessage = document.querySelector("[data-form-message]");
const submitButton = document.querySelector("[data-submit-button]");
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
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
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
        name: formData.get("name") || "",
        company: formData.get("company") || "",
        email: formData.get("email") || "",
        phone: formData.get("phone") || "",
        country: formData.get("country") || "",
        category: formData.get("category") || "",
        quantity: formData.get("quantity") || "",
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

      showFormMessage("Thank you. Your request has been received. Our team will review the details and contact you soon.");
      rfqForm.reset();
    } catch (error) {
      showFormMessage(error.message || "Unable to send your request right now. Please email sales@lfclothing.com directly.", true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send RFQ";
      }
    }
  });
}
