import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "dist");
const ga4MeasurementId = process.env.GA4_MEASUREMENT_ID?.trim();

if (ga4MeasurementId && !/^G-[A-Z0-9]+$/.test(ga4MeasurementId)) {
  throw new Error("GA4_MEASUREMENT_ID must be a valid ID beginning with G-.");
}

const ga4Snippet = ga4MeasurementId ? `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${ga4MeasurementId}');
    </script>` : "";
const rootFiles = [
  "styles.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
  "favicon-48x48.png",
  "favicon-192x192.png",
  "apple-touch-icon.png",
  "apple-touch-icon-precomposed.png",
  "logo.png",
];

async function copyRelative(relativePath) {
  const sourcePath = join(root, relativePath);
  const outputPath = join(output, relativePath);
  await mkdir(dirname(outputPath), { recursive: true });
  await copyFile(sourcePath, outputPath);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const htmlFiles = (await readdir(root))
  .filter((name) => name.endsWith(".html"))
  .sort();
const verificationFiles = (await readdir(root))
  .filter((name) => name.endsWith(".txt"))
  .sort();
const productPageFiles = (await readdir(join(root, "product-pages")))
  .filter((name) => name.endsWith(".html"))
  .sort();

for (const file of [...htmlFiles, ...rootFiles, ...verificationFiles]) {
  await copyRelative(file);
}

for (const file of productPageFiles) {
  const sourcePath = join(root, "product-pages", file);
  const outputPath = join(output, "products", file);
  await mkdir(dirname(outputPath), { recursive: true });
  await copyFile(sourcePath, outputPath);
}

// Keep crawl directives and social titles consistent across every deployable page.
for (const relativePath of [
  ...htmlFiles,
  ...productPageFiles.map((file) => join("products", file)),
]) {
  const outputPath = join(output, relativePath);
  let html = await readFile(outputPath, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];

  if (ga4Snippet && !/googletagmanager\.com\/gtag\/js/i.test(html)) {
    html = html.replace(/<head>/i, `<head>${ga4Snippet}`);
  }

  if (title) {
    html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${title}$2`);
    html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i, `$1${title}$2`);
  }

  if (!/<meta\s+name="robots"/i.test(html)) {
    const directive = relativePath === "404.html"
      ? "noindex,follow"
      : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
    html = html.replace(
      /(<meta\s+name="description"[^>]*>)/i,
      `$1\n    <meta name="robots" content="${directive}">`,
    );
  }

  await writeFile(outputPath, html);
}

const sourceText = await Promise.all(
  [
    ...htmlFiles.map((file) => join(root, file)),
    ...productPageFiles.map((file) => join(root, "product-pages", file)),
    join(root, "styles.css"),
  ].map((file) => readFile(file, "utf8")),
);
const assetReferences = new Set();

for (const text of sourceText) {
  for (const match of text.matchAll(/(?:https:\/\/lfclothing\.com)?\/(assets\/[A-Za-z0-9_./-]+)/g)) {
    assetReferences.add(match[1]);
  }
  for (const match of text.matchAll(/url\(["']?(assets\/[A-Za-z0-9_./-]+)/g)) {
    assetReferences.add(match[1]);
  }
}

for (const asset of [...assetReferences].sort()) {
  await copyRelative(asset);
}

console.log(`Built ${htmlFiles.length + productPageFiles.length} pages and ${assetReferences.size} referenced assets in ${relative(root, output)}.`);
