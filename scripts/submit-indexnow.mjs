const key = process.env.INDEXNOW_KEY?.trim();
const host = process.env.INDEXNOW_HOST?.trim() || "lfclothing.com";
const sitemapUrl = process.env.INDEXNOW_SITEMAP_URL?.trim() || `https://${host}/sitemap.xml`;
const endpoint = process.env.INDEXNOW_ENDPOINT?.trim() || "https://api.indexnow.org/indexnow";

if (!key) {
  throw new Error("Set INDEXNOW_KEY before running this script.");
}

if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  throw new Error("INDEXNOW_KEY must be 8-128 characters using letters, numbers or hyphens.");
}

const keyLocation = `https://${host}/${key}.txt`;
const keyResponse = await fetch(keyLocation, {
  headers: { "user-agent": "LF-Clothing-IndexNow/1.0" },
});

if (!keyResponse.ok) {
  throw new Error(`Key verification file returned HTTP ${keyResponse.status}: ${keyLocation}`);
}

const publishedKey = (await keyResponse.text()).trim();
if (publishedKey !== key) {
  throw new Error(`Key verification file content does not match INDEXNOW_KEY: ${keyLocation}`);
}

const sitemapResponse = await fetch(sitemapUrl, {
  headers: { "user-agent": "LF-Clothing-IndexNow/1.0" },
});

if (!sitemapResponse.ok) {
  throw new Error(`Sitemap returned HTTP ${sitemapResponse.status}: ${sitemapUrl}`);
}

const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].trim())
  .filter((value, index, values) => values.indexOf(value) === index)
  .filter((value) => {
    try {
      return new URL(value).hostname === host;
    } catch {
      return false;
    }
  });

if (urlList.length === 0) {
  throw new Error(`No URLs for ${host} were found in ${sitemapUrl}.`);
}

if (urlList.length > 10000) {
  throw new Error(`Sitemap contains ${urlList.length} URLs; IndexNow accepts at most 10,000 per request.`);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});
const responseText = (await response.text()).trim();

if (response.status !== 200 && response.status !== 202) {
  throw new Error(
    `IndexNow returned HTTP ${response.status}${responseText ? `: ${responseText}` : ""}`,
  );
}

console.log(
  `IndexNow accepted ${urlList.length} URLs for ${host} with HTTP ${response.status}.`,
);
