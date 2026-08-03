import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] || "dist");
const baseUrl = new URL("https://lfclothing.com/");
const errors = [];

const exists = async (filePath) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

async function findHtmlPages(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      pages.push(...await findHtmlPages(path.join(directory, entry.name), relativePath));
    } else if (entry.name.endsWith(".html")) {
      pages.push(relativePath);
    }
  }

  return pages;
}

const pages = await findHtmlPages(root);
const titles = new Map();
const descriptions = new Map();
const canonicalUrls = new Set();

for (const page of pages) {
  const filePath = path.join(root, page);
  const html = await readFile(filePath, "utf8");

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (path.basename(page) !== "404.html" && h1Count !== 1) {
    errors.push(`${page}: expected 1 H1, found ${h1Count}`);
  }

  if (path.basename(page) !== "404.html") {
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]?.trim();
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1]?.trim();

    if (!title || title.length < 25 || title.length > 65) {
      errors.push(`${page}: title should be 25-65 characters, found ${title?.length || 0}`);
    }
    if (title) titles.set(title, [...(titles.get(title) || []), page]);
    if (description) descriptions.set(description, [...(descriptions.get(description) || []), page]);
    if (canonical) canonicalUrls.add(canonical);

    if (!/<meta\s+name="robots"\s+content="[^"]*max-image-preview:large/i.test(html)) {
      errors.push(`${page}: missing indexable robots preview directives`);
    }
  }

  if (path.basename(page) !== "404.html" && !/<meta\s+name="description"\s+content="[^"]{50,180}"/i.test(html)) {
    errors.push(`${page}: missing or unsuitable meta description`);
  }

  if (path.basename(page) !== "404.html" && !/<link\s+rel="canonical"\s+href="https:\/\/lfclothing\.com\/[^"]*"/i.test(html)) {
    errors.push(`${page}: missing canonical URL`);
  }

  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${page}: invalid JSON-LD (${error.message})`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const value = match[1];
    if (
      value.startsWith("#") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:") ||
      value.startsWith("javascript:")
    ) {
      continue;
    }

    const url = new URL(value, baseUrl);
    if (url.origin !== baseUrl.origin) continue;

    const pathname = decodeURIComponent(url.pathname);
    let target;

    if (pathname === "/") {
      target = path.join(root, "index.html");
    } else if (path.extname(pathname)) {
      target = path.join(root, pathname);
    } else {
      target = path.join(root, `${pathname}.html`);
    }

    if (!(await exists(target))) {
      errors.push(`${page}: missing local target ${pathname}`);
    }
  }
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()));

for (const canonical of canonicalUrls) {
  if (!sitemapUrls.has(canonical)) errors.push(`sitemap missing canonical URL: ${canonical}`);
}

for (const sitemapUrl of sitemapUrls) {
  if (!canonicalUrls.has(sitemapUrl)) errors.push(`sitemap contains unknown URL: ${sitemapUrl}`);
}

for (const [title, titlePages] of titles) {
  if (titlePages.length > 1) errors.push(`duplicate title "${title}": ${titlePages.join(", ")}`);
}

for (const [description, descriptionPages] of descriptions) {
  if (descriptionPages.length > 1) errors.push(`duplicate description: ${descriptionPages.join(", ")}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${pages.length} pages: links, assets, metadata, H1 and JSON-LD passed.`);
