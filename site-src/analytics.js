const lfGaMeasurementId = "G-D5XWSW9S5V";
const lfConsentStorageKey = "lf_cookie_consent_v1";
const lfProductionHosts = new Set(["lfclothing.com", "www.lfclothing.com"]);
const lfIsProduction = lfProductionHosts.has(location.hostname);

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

window.gtag("consent", "default", {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  functionality_storage: "granted",
  security_storage: "granted",
  wait_for_update: 500,
});
window.gtag("set", "ads_data_redaction", true);
window.gtag("set", "url_passthrough", true);

let lfConsentPreference = "";
try { lfConsentPreference = localStorage.getItem(lfConsentStorageKey) || ""; } catch {}

function lfUpdateGoogleConsent(preference) {
  const value = preference === "granted" ? "granted" : "denied";
  window.gtag("consent", "update", {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
}

function lfSaveConsent(preference) {
  lfConsentPreference = preference;
  try { localStorage.setItem(lfConsentStorageKey, preference); } catch {}
  lfUpdateGoogleConsent(preference);
  if (preference === "granted") lfLoadGoogleTag();
}

function lfLoadGoogleTag() {
  if (!lfIsProduction || document.querySelector(`script[data-lf-google-tag="${lfGaMeasurementId}"]`)) return;
  window.gtag("js", new Date());
  window.gtag("config", lfGaMeasurementId);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(lfGaMeasurementId)}`;
  script.dataset.lfGoogleTag = lfGaMeasurementId;
  document.head.append(script);
}

if (lfConsentPreference) lfUpdateGoogleConsent(lfConsentPreference);
if (lfConsentPreference === "granted") lfLoadGoogleTag();

window.lfTrackEvent = (name, parameters = {}) => {
  if (!lfIsProduction || lfConsentPreference !== "granted") return false;
  window.gtag("event", name, parameters);
  return true;
};

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.querySelector("[data-cookie-banner]");
  if (!banner) return;
  const accept = banner.querySelector("[data-cookie-accept]");
  const reject = banner.querySelector("[data-cookie-reject]");
  const settings = document.querySelectorAll("[data-cookie-settings]");
  const show = () => {
    banner.hidden = false;
    banner.setAttribute("aria-hidden", "false");
  };
  const hide = () => {
    banner.hidden = true;
    banner.setAttribute("aria-hidden", "true");
  };

  accept?.addEventListener("click", () => { lfSaveConsent("granted"); hide(); });
  reject?.addEventListener("click", () => { lfSaveConsent("denied"); hide(); });
  settings.forEach((button) => button.addEventListener("click", () => { show(); accept?.focus(); }));
  if (!lfConsentPreference) show();
});
