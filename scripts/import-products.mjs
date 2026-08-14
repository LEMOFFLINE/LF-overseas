import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = path.resolve(import.meta.dirname, "..");
const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Pass the reviewed master workbook path.");

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(sourcePath));
const sheet = workbook.worksheets.getItem("SKU信息表");
const values = sheet.getRange("A4:P54").values;
const [headers, ...rows] = values;
const records = rows.map((row) => Object.fromEntries(headers.map((header, index) => [String(header).replace(/\s+/g, " ").trim(), row[index] ?? null])));

if (records.length !== 50 || new Set(records.map((item) => item["SKU（款号）"])).size !== 50) {
  throw new Error(`Expected 50 unique reviewed SKUs, found ${records.length}.`);
}
for (const record of records) {
  if (record["资料状态"] !== "已归档") throw new Error(`${record["SKU（款号）"]} is not marked as reviewed/archived.`);
}

const output = { source: sourcePath, extractedAt: new Date().toISOString().slice(0, 10), records };
await fs.writeFile(path.join(root, "data", "products.source.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Imported ${records.length} reviewed products into data/products.source.json.`);
