# LF Clothing V1

Static B2B workwear and uniform website for Beijing Lingfeng Apparel.

## Site structure

- `data/products.source.json` — locked extraction of the reviewed 50-SKU business workbook.
- `data/products.json` — archived product data retained for future curation; only selected references are currently displayed.
- `data/collections.json` — five public buyer-led product collections and their SEO metadata.
- `assets/products/` — 50 front images, 50 back images and three inner-construction images.
- `assets/operations/` — 23 real office, sample and production-environment photos.
- `assets/site/` — the three approved legacy Hero images only.
- `assets/partners/` — the 18 approved project/end-user logos only.
- `site-src/` — the design system and browser interactions.
- `scripts/generate-site.mjs` — generates the complete `dist/` site.
- `scripts/validate-site.mjs` — validates pages, images, links, metadata, sitemap and legacy-content removal.

## Build

Netlify runs:

```text
node scripts/generate-site.mjs && node scripts/validate-site.mjs
```

The generated site contains 25 indexable URLs plus a noindex 404 page. It includes four priority product pages, a selected-products overview, five supporting collection pages, one aviation flight-suit landing page, eight retained product detail pages, project content and inquiry pages. The remaining 42 legacy product URLs redirect to the most relevant active category or service page.

## Product data review flow

The reviewed Excel workbook remains the internal business master. When it changes:

1. Run `scripts/import-products.mjs` with the reviewed workbook using the configured spreadsheet runtime.
2. Review and update public wording/mappings in `scripts/create-public-data.mjs`.
3. Run `scripts/create-public-data.mjs`.
4. Run the site generator and validator.

Internal source notes are not copied into the public `dist/` site.

## Inquiry delivery

`netlify/functions/rfq.js` keeps the existing Brevo email-forwarding flow. Netlify requires the existing `BREVO_API_KEY`, sender and RFQ destination environment variables described in `BREVO_NETLIFY_SETUP.md`.
