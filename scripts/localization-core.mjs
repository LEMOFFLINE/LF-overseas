import { createHash } from 'node:crypto';

export const locales = ['en', 'de', 'fr', 'ar', 'es', 'pt', 'ja', 'ko'];
export const languageNames = { en: 'English', de: 'Deutsch', fr: 'Français', ar: 'العربية', es: 'Español', pt: 'Português', ja: '日本語', ko: '한국어' };
export const origin = 'https://lfclothing.com';
export const normalize = value => value.replace(/\s+/g, ' ').trim();
export const keyFor = value => createHash('sha256').update(normalize(value)).digest('hex').slice(0, 12);
export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
export const decodeHtml = value => value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|hellip|ndash|mdash|copy);/gi, (match, entity) => {
  if (entity.startsWith('#')) return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
  return { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:'\u00a0', hellip:'…', ndash:'–', mdash:'—', copy:'©' }[entity.toLowerCase()] || match;
});
const protectedText = /^(?:LF(?: Clothing)?|Beijing Lingfeng Apparel Co\., Ltd\.|LINGFENG|Lingfeng|ANA|Mercedes-Benz|SMS group|PetroChina|Sinopec|Apple|IBM|BMW|Volkswagen|Toyota|Hyundai|3M|YKK|FESCO|ORDINS|REC|ITOCHU Corporation|HPH Consorcio|LinkedIn|Facebook|WhatsApp|ISO \d+|GAR-[A-Z]+-\d+|SKU|MOQ|B2B|OEM|ODM)$/i;
export const needsTranslation = value => /[A-Za-z]{2}/.test(value) && !protectedText.test(value) && !/^(?:https?:|mailto:|tel:|sales@|\+?\d[\d\s./%–-]*$)/i.test(value);
const descriptiveKeys = new Set(['name', 'description', 'text', 'headline', 'caption', 'articleBody']);
const attributes = new Set(['alt', 'title', 'aria-label', 'placeholder', 'data-alt']);

// Generated markup is controlled by our renderer. Script/style bodies stay intact;
// JSON-LD is parsed separately, so markup-like characters in it are not tokenized.
export function transformCopy(html, translate) {
  return html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<[^>]*>|[^<]+/gi, token => {
    if (/^<script\b/i.test(token)) {
      if (!/type="application\/ld\+json"/.test(token)) return token;
      const start = token.indexOf('>') + 1;
      const end = token.lastIndexOf('</');
      const walk = (value, key = '') => {
        if (Array.isArray(value)) return value.map(item => walk(item, key));
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,walk(v,k)]));
        if (typeof value === 'string' && descriptiveKeys.has(key)) return translate(value);
        return value;
      };
      return token.slice(0,start) + JSON.stringify(walk(JSON.parse(token.slice(start,end)))).replaceAll('<','\\u003c') + token.slice(end);
    }
    if (/^<(?:!|style\b)/i.test(token)) return token;
    if (token.startsWith('<')) {
      const isMeta = /^<meta\b/i.test(token) && /(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)"/i.test(token);
      return token.replace(/([\w:-]+)="([^"]*)"/g, (match, attr, value) => (attributes.has(attr) || (attr === 'content' && isMeta)) ? `${attr}="${escapeHtml(translate(decodeHtml(value)))}"` : match);
    }
    if (!token.trim()) return token;
    const leading = token.match(/^\s*/)[0];
    const trailing = token.match(/\s*$/)[0];
    return leading + escapeHtml(translate(decodeHtml(token.trim()))) + trailing;
  });
}

export const runtimeCopy = [
  'Language', 'Open menu', 'Close menu', 'Sending…', 'Please upload a file under 4 MB.',
  'The attachment could not be read.', 'Unable to send the inquiry right now.',
  'Thank you. Your inquiry has been sent to LF Clothing.', 'You can also email sales@lfclothing.com.',
  'Request', 'Selected product', 'Context', '{count} products',
  'Product Inquiry', 'Sample Development', 'Related Products', 'Aviation Flight Suit',
  'Please complete all required fields.', 'Please enter a valid email address.',
  'Please check this field.', 'File too large. Maximum 4 MB.',
];
