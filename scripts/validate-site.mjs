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

const files = await readdir(root);
const pages = files.filter((file) => file.endsWith(".html"));

for (const page of pages) {
  const filePath = path.join(root, page);
  const html = await readFile(filePath, "utf8");

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (page !== "404.html" && h1Count !== 1) {
    errors.push(`${page}: expected 1 H1, found ${h1Count}`);
  }

  if (page !== "404.html" && !/<meta\s+name="description"\s+content="[^"]{50,180}"/i.test(html)) {
    errors.push(`${page}: missing or unsuitable meta description`);
  }

  if (page !== "404.html" && !/<link\s+rel="canonical"\s+href="https:\/\/lfclothing\.com\/[^"]*"/i.test(html)) {
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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${pages.length} pages: links, assets, metadata, H1 and JSON-LD passed.`);
