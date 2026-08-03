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
