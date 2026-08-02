import { copyFile, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "dist");
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
  "c9e4c5b4b2d84f1e8a9a6d0f7e8c1b3a.txt",
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
const productPageFiles = (await readdir(join(root, "product-pages")))
  .filter((name) => name.endsWith(".html"))
  .sort();

for (const file of [...htmlFiles, ...rootFiles]) {
  await copyRelative(file);
}

for (const file of productPageFiles) {
  const sourcePath = join(root, "product-pages", file);
  const outputPath = join(output, "products", file);
  await mkdir(dirname(outputPath), { recursive: true });
  await copyFile(sourcePath, outputPath);
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
