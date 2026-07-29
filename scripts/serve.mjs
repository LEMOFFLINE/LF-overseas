import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = process.argv[2] ? resolve(process.argv[2]) : normalize(join(import.meta.dirname, ".."));
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let relativePath = requestPath === "/" ? "index.html" : requestPath.slice(1);

  if (!extname(relativePath)) {
    const htmlPath = `${relativePath}.html`;
    relativePath = existsSync(join(root, htmlPath)) ? htmlPath : relativePath;
  }

  let filePath = normalize(join(root, relativePath));
  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, "404.html");
    response.statusCode = 404;
  }

  response.setHeader("Content-Type", mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream");
  response.setHeader("Cache-Control", "no-store");
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`LF Clothing preview: http://127.0.0.1:${port}`);
});
