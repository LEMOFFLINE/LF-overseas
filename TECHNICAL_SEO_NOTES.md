# Technical SEO Notes

## What was added

- `sitemap.xml`: A machine-readable list of important public pages for Google, Bing and other search engines.
- `robots.txt`: A crawler instruction file that allows crawling and points search engines to the sitemap.
- Canonical tags: Each HTML page declares its preferred official URL to reduce duplicate URL confusion.
- Open Graph tags: Link preview data for WhatsApp, LinkedIn, Facebook and other sharing surfaces.
- Twitter Card tags: Link preview data for X/Twitter-compatible crawlers.
- Organization JSON-LD: Structured company information for search engines, including name, URL, logo, email, phone and address.
- Improved image alt text: More descriptive text for important product and factory images.

## 2026-08-03 optimization

- Repositioned the homepage and six category pages around high-intent B2B supplier searches.
- Shortened all product-page titles and added build-time synchronization for Open Graph and Twitter titles.
- Added full search-preview crawler directives, including large image previews, to every indexable page.
- Added `noindex,follow` to the 404 page.
- Expanded Organization and WebSite structured data with stable entity IDs, publisher linkage and official social profiles.
- Added product images to the XML sitemap and made `lastmod` update when product pages are regenerated.
- Expanded validation to fail on duplicate or unsuitable titles/descriptions, missing crawler directives and sitemap drift.

## GA4 and inquiry attribution

Netlify must provide this build environment variable in every deploy context:

```text
GA4_MEASUREMENT_ID=G-D5XWSW9S5V
```

The build injects one Google tag into every HTML page. The shared site script records these events without sending inquiry contact details to GA4:

- `view_product`
- `quote_click`
- `catalog_click`
- `whatsapp_click`
- `email_click`
- `rfq_form_start`
- `generate_lead` after a successful RFQ response
- `rfq_submit_error`

The RFQ email also includes the first landing page, form URL, referrer and available UTM parameters. GA4 collection begins only after the tagged build is deployed and does not backfill historical visits.

## Sitemap submission URL

Submit this URL in Bing Webmaster Tools and Google Search Console:

```text
https://lfclothing.com/sitemap.xml
```

## Files to check after deployment

```text
https://lfclothing.com/robots.txt
https://lfclothing.com/sitemap.xml
```

## Search Console / Bing checklist

1. Verify `lfclothing.com` as a domain property.
2. Submit `https://lfclothing.com/sitemap.xml`.
3. Use URL inspection for the homepage and Products page.
4. Request reindexing for the six category pages after deploying major title/content changes.
5. Review non-brand queries, impressions, CTR and average position after 28 days; use the data to choose the next content cluster.
