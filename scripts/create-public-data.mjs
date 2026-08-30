import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = JSON.parse(await fs.readFile(path.join(root, "data", "products.source.json"), "utf8"));

const collections = [
  {
    slug: "industrial-workwear",
    name: "Industrial Workwear",
    shortName: "Industrial",
    description: "Work jackets, coveralls, trousers, coats and denim layers for manufacturing, maintenance, logistics and general industrial programs.",
    seoTitle: "Industrial Workwear Supplier China | LF Clothing",
    seoDescription: "Source custom industrial workwear from China, including work jackets, coveralls, trousers and coats, with B2B sampling, quality control and export support.",
    intro: "Start with the working environment, movement, pocket needs and laundering plan. LF then coordinates fabric, construction, sampling and production around the agreed specification.",
    factors: ["Daily task and movement", "Pocket and closure layout", "Fabric composition and weight", "Laundering and repeat-supply requirements"],
  },
  {
    slug: "protective-hi-vis",
    name: "Protective & Hi-Vis",
    shortName: "Protective & Hi-Vis",
    description: "High-visibility and performance-oriented garments configured around the buyer's target material, construction and verification requirements.",
    seoTitle: "Protective & Hi-Vis Workwear Supplier China | LF Clothing",
    seoDescription: "Custom protective and hi-vis workwear supply from China, including reflective, FR-option and anti-static-option garments developed to project requirements.",
    intro: "Performance is specified project by project. Fabric properties, reflective layouts and garment testing are confirmed against the destination market and intended use.",
    factors: ["Risk assessment and end use", "Target fabric performance", "Reflective material and layout", "Testing and documentation route"],
  },
  {
    slug: "cold-weather-outdoor-workwear",
    name: "Cold Weather & Outdoor Workwear",
    shortName: "Cold Weather",
    description: "Shells, insulated jackets and weather-ready workwear for outdoor teams, field service and cold-season operations.",
    seoTitle: "Cold Weather Workwear & Outdoor Jackets Supplier China | LF Clothing",
    seoDescription: "Source custom cold-weather workwear and outdoor jackets from China, including insulated coveralls, softshells and weather-ready shells for B2B programs.",
    intro: "Outer fabric, insulation, hood, liner and weather-protection details are balanced against climate, activity level and the buyer's delivery program.",
    factors: ["Climate and activity level", "Shell and lining system", "Insulation type and target warmth", "Hood, cuff and closure details"],
  },
  {
    slug: "corporate-service-uniforms",
    name: "Corporate & Service Uniforms",
    shortName: "Corporate Uniforms",
    description: "Tailored jackets and trousers for corporate, reception, hospitality, institutional and service uniform programs.",
    seoTitle: "Custom Corporate Uniform Supplier China | LF Clothing",
    seoDescription: "Custom corporate and service uniforms from China for offices, reception, hospitality and institutions, with coordinated sampling, sizing and branding.",
    intro: "Fabric, silhouette, grading, lining and presentation details are coordinated across roles so a program reads as one consistent uniform system.",
    factors: ["Role and presentation level", "Fabric handle and season", "Fit and grading method", "Coordinated trims and packaging"],
  },
  {
    slug: "team-staff-apparel",
    name: "School, Team & Staff Apparel",
    shortName: "School & Team",
    description: "Track jackets, trousers, hoodies, softshells and polos for school uniforms, staff, education, team and branded apparel programs.",
    seoTitle: "Custom School Uniform & Team Apparel Supplier China | LF Clothing",
    seoDescription: "Custom school uniforms, staff apparel and teamwear from China, including polos, hoodies, softshells and tracksuits with B2B sizing and branding support.",
    intro: "School identity, colour blocking, decoration placement, size mix and repeat-order practicality are reviewed together before samples are developed.",
    factors: ["School or team identity and colour blocking", "Decoration method and placement", "Size mix and grading", "Fabric hand feel and care"],
  },
];

const curated = {
  "GAR-WJ-001": ["Cotton Twill Work Jacket", "Work Jacket", "industrial-workwear", [], "100% combed cotton with a pre-wash option; shrinkage and colourfastness targets are confirmed in the approved specification.", ["Cotton", "Work Jacket"]],
  "GAR-KN-001": ["Stretch Cotton Zip Hoodie", "Zip Hoodie", "team-staff-apparel", [], "95% cotton / 5% elastane with a pre-wash option.", ["Cotton Blend", "Stretch", "Hoodie"]],
  "GAR-OJ-001": ["Waterproof-Breathable Hooded Shell", "Hooded Shell Jacket", "cold-weather-outdoor-workwear", ["protective-hi-vis"], "100% polyester shell with a waterproof-breathable coating option; performance targets are subject to the final specification and test route.", ["Polyester", "Weather Protection", "Hooded"]],
  "GAR-WJ-002": ["Cotton Work Jacket with Reflective Detail", "Work Jacket", "industrial-workwear", ["protective-hi-vis"], "100% combed cotton.", ["Cotton", "Reflective Detail", "Work Jacket"]],
  "GAR-OJ-002": ["Aramid High-Visibility Hooded Jacket", "Protective Work Jacket", "protective-hi-vis", ["cold-weather-outdoor-workwear"], "100% aramid fabric option; flame-resistant and high-visibility requirements are subject to project specification and verification.", ["Aramid Option", "Flame-Resistant Option", "Reflective Detail", "Hooded"]],
  "GAR-CO-001": ["Cotton Long-Sleeve Work Coverall", "Work Coverall", "industrial-workwear", [], "100% cotton.", ["Cotton", "Coverall"]],
  "GAR-CO-002": ["Weather-Ready Insulated Work Coverall", "Insulated Coverall", "cold-weather-outdoor-workwear", ["industrial-workwear"], "100% polyester shell with a waterproof-breathable coating option; insulation and performance targets are confirmed for the project.", ["Polyester", "Weather Protection", "Insulated", "Coverall"]],
  "GAR-WP-001": ["High-Visibility Bib Work Trousers", "Bib Work Trousers", "protective-hi-vis", ["industrial-workwear"], "100% polyester shell with a waterproof-breathable coating option; performance is subject to final material and garment verification.", ["Polyester", "Weather Protection", "Reflective Detail", "Bib Trousers"]],
  "GAR-CO-003": ["FR-Option Reflective Work Coverall", "Protective Coverall", "protective-hi-vis", ["industrial-workwear"], "100% cotton with a flame-resistant finishing option; wash durability and garment performance require project-specific testing.", ["Cotton", "Flame-Resistant Option", "Reflective Detail", "Coverall"]],
  "GAR-WC-001": ["Anti-Static Option Long Work Coat", "Long Work Coat", "industrial-workwear", ["protective-hi-vis"], "60% cotton / 38% polyester / 2% conductive fibre; anti-static performance is subject to the final fabric and garment verification route.", ["Cotton Blend", "Anti-Static Option", "Reflective Detail", "Work Coat"]],
  "GAR-OJ-003": ["Polyester Insulated Hooded Work Jacket", "Insulated Work Jacket", "cold-weather-outdoor-workwear", [], "100% polyester shell with selectable synthetic insulation, down or other project-reviewed fill options.", ["Polyester", "Insulated", "Hooded"]],
  "GAR-WJ-003": ["Anti-Static Option Reflective Work Jacket", "Work Jacket", "industrial-workwear", ["protective-hi-vis"], "60% cotton / 38% polyester / 2% conductive fibre; anti-static requirements are subject to final verification.", ["Cotton Blend", "Anti-Static Option", "Reflective Detail", "Work Jacket"]],
  "GAR-HV-001": ["High-Visibility Reflective Safety Vest", "Safety Vest", "protective-hi-vis", [], "100% polyester with high-brightness TC reflective tape or specified branded reflective material, subject to sourcing confirmation.", ["Polyester", "High Visibility", "Reflective Detail", "Vest"]],
  "GAR-OJ-004": ["High-Visibility Anti-Static Option Jacket", "Protective Work Jacket", "protective-hi-vis", ["industrial-workwear"], "60% cotton / 38% polyester / 2% conductive fibre; anti-static and high-visibility requirements are confirmed for each project.", ["Cotton Blend", "Anti-Static Option", "High Visibility", "Reflective Detail"]],
  "GAR-KN-002": ["Cotton-Rich Zip Hoodie", "Zip Hoodie", "team-staff-apparel", [], "80% cotton / 20% polyester knitted fabric.", ["Cotton Blend", "Hoodie"]],
  "GAR-KN-003": ["Stretch Softshell Work Jacket", "Softshell Jacket", "team-staff-apparel", ["cold-weather-outdoor-workwear"], "95% polyester / 5% elastane softshell option.", ["Polyester", "Stretch", "Softshell"]],
  "GAR-KN-004": ["Cotton-Blend Pullover Hoodie", "Pullover Hoodie", "team-staff-apparel", [], "65% cotton / 35% polyester.", ["Cotton Blend", "Hoodie"]],
  "GAR-WJ-004": ["Colour-Block Anti-Static Fabric Option Jacket", "Work Jacket", "industrial-workwear", ["protective-hi-vis"], "98% polyester / 2% conductive fibre anti-static fabric option; Toray sourcing is available only when confirmed in the project specification.", ["Polyester", "Anti-Static Option", "Colour Block", "Work Jacket"]],
  "GAR-OJ-005": ["Waterproof-Breathable Down Work Jacket", "Down Work Jacket", "cold-weather-outdoor-workwear", [], "100% polyester shell with a waterproof-breathable coating option and 90% white duck-down fill option.", ["Polyester", "Weather Protection", "Down Option", "Insulated"]],
  "GAR-OJ-006": ["Anti-Static Option Insulated Work Jacket", "Insulated Work Jacket", "cold-weather-outdoor-workwear", ["protective-hi-vis"], "60% cotton / 38% polyester / 2% conductive fibre shell with 3M Thinsulate insulation available subject to sourcing and specification confirmation.", ["Cotton Blend", "Anti-Static Option", "Insulated"]],
  "GAR-OJ-007": ["Cotton-Blend Synthetic Insulated Jacket", "Insulated Work Jacket", "cold-weather-outdoor-workwear", [], "35% cotton / 65% polyester shell with synthetic insulation.", ["Cotton Blend", "Insulated", "Reflective Detail"]],
  "GAR-WJ-005": ["Cotton-Rich Anti-Static Option Work Jacket", "Work Jacket", "industrial-workwear", ["protective-hi-vis"], "98% cotton / 2% conductive fibre; anti-static requirements are subject to final material and garment verification.", ["Cotton", "Anti-Static Option", "Work Jacket"]],
  "GAR-WP-002": ["Cotton-Rich Anti-Static Option Work Trousers", "Work Trousers", "industrial-workwear", ["protective-hi-vis"], "98% cotton / 2% conductive fibre; anti-static requirements are subject to final material and garment verification.", ["Cotton", "Anti-Static Option", "Work Trousers"]],
  "GAR-OJ-008": ["Cotton Work Jacket with Removable Liner", "Lined Work Jacket", "cold-weather-outdoor-workwear", ["industrial-workwear"], "100% cotton shell with a removable synthetic-insulation liner.", ["Cotton", "Removable Liner", "Insulated"]],
  "GAR-OJ-009": ["Waterproof-Breathable Goose Down Jacket", "Down Work Jacket", "cold-weather-outdoor-workwear", [], "100% polyester shell with a waterproof-breathable coating option and 90% goose-down fill option.", ["Polyester", "Weather Protection", "Down Option", "Insulated"]],
  "GAR-OJ-010": ["Waterproof-Breathable Insulated Work Jacket", "Insulated Work Jacket", "cold-weather-outdoor-workwear", [], "100% polyester shell with a waterproof-breathable coating option and 3M Thinsulate insulation available subject to confirmation.", ["Polyester", "Weather Protection", "Insulated"]],
  "GAR-OJ-011": ["Cotton-Rich Jacket with Removable Liner", "Lined Work Jacket", "cold-weather-outdoor-workwear", ["industrial-workwear"], "65% cotton / 35% polyester shell with a removable synthetic-insulation liner.", ["Cotton Blend", "Removable Liner", "Insulated", "Reflective Detail"]],
  "GAR-BL-001": ["Men's Single-Breasted Wool-Blend Suit", "Men's Suit Jacket", "corporate-service-uniforms", [], "70% wool / 30% polyester with an anti-static lining option.", ["Wool Blend", "Men's Tailoring"]],
  "GAR-TR-001": ["Men's Wool-Blend Tailored Trousers", "Men's Tailored Trousers", "corporate-service-uniforms", [], "70% wool / 30% polyester.", ["Wool Blend", "Men's Tailoring", "Trousers"]],
  "GAR-BL-002": ["Long Double-Breasted Wool-Blend Blazer", "Women's Tailored Blazer", "corporate-service-uniforms", [], "80% wool / 20% polyester with an anti-static lining option.", ["Wool Blend", "Women's Tailoring", "Double Breasted"]],
  "GAR-TR-002": ["Wool-Blend Tailored Uniform Trousers", "Tailored Trousers", "corporate-service-uniforms", [], "80% wool / 20% polyester.", ["Wool Blend", "Trousers"]],
  "GAR-TR-003": ["Anti-Static Option Wool-Blend Trousers", "Tailored Trousers", "corporate-service-uniforms", [], "50% wool / 49.5% polyester / 0.5% conductive fibre.", ["Wool Blend", "Anti-Static Option", "Trousers"]],
  "GAR-BL-003": ["Women's Anti-Static Option Wool-Blend Blazer", "Women's Tailored Blazer", "corporate-service-uniforms", [], "50% wool / 49.5% polyester / 0.5% conductive fibre.", ["Wool Blend", "Anti-Static Option", "Women's Tailoring"]],
  "GAR-BL-004": ["High-Wool Women's Tailored Blazer", "Women's Tailored Blazer", "corporate-service-uniforms", [], "90% wool / 10% polyester with an anti-static lining option.", ["Wool Blend", "Women's Tailoring"]],
  "GAR-BL-005": ["Women's Wool-Blend Uniform Blazer", "Women's Tailored Blazer", "corporate-service-uniforms", [], "35% wool / 65% polyester.", ["Wool Blend", "Women's Tailoring"]],
  "GAR-BL-006": ["Women's Single-Breasted Uniform Blazer", "Women's Uniform Blazer", "corporate-service-uniforms", [], "65% polyester / 35% viscose reference composition; final fabric selection is confirmed during specification review.", ["Polyester Blend", "Women's Tailoring"]],
  "GAR-BL-007": ["Women's Polyester Uniform Blazer", "Women's Uniform Blazer", "corporate-service-uniforms", [], "100% polyester.", ["Polyester", "Women's Tailoring"]],
  "GAR-BL-008": ["Men's Anti-Static Option Wool-Blend Suit", "Men's Suit Jacket", "corporate-service-uniforms", [], "70% wool / 29.5% polyester / 0.5% conductive fibre with an anti-static lining option.", ["Wool Blend", "Anti-Static Option", "Men's Tailoring"]],
  "GAR-TJ-001": ["Blue-and-White Team Track Jacket", "Team Track Jacket", "team-staff-apparel", [], "40% cotton / 60% polyester.", ["Cotton Blend", "Teamwear", "Colour Block"]],
  "GAR-TP-001": ["Black Team Jogger Trousers", "Team Track Trousers", "team-staff-apparel", [], "40% cotton / 60% polyester.", ["Cotton Blend", "Teamwear", "Trousers"]],
  "GAR-TJ-002": ["Blue Zip Team Track Jacket", "Team Track Jacket", "team-staff-apparel", [], "35% cotton / 65% polyester.", ["Cotton Blend", "Teamwear", "Colour Block"]],
  "GAR-TJ-003": ["Red-and-White Team Track Jacket", "Team Track Jacket", "team-staff-apparel", [], "60% cotton / 40% polyester.", ["Cotton Blend", "Teamwear", "Colour Block"]],
  "GAR-DJ-001": ["Dark Indigo Denim Work Jacket", "Denim Work Jacket", "industrial-workwear", [], "100% cotton denim with pre-wash and colour-setting options.", ["Cotton", "Denim", "Work Jacket"]],
  "GAR-DJ-002": ["Mid-Blue Denim Work Jacket", "Denim Work Jacket", "industrial-workwear", [], "100% cotton denim with pre-wash and colour-setting options.", ["Cotton", "Denim", "Work Jacket"]],
  "GAR-TJ-004": ["Red Panel Team Track Jacket", "Team Track Jacket", "team-staff-apparel", [], "60% cotton / 40% polyester.", ["Cotton Blend", "Teamwear", "Colour Block"]],
  "GAR-PO-001": ["Colour-Block Short-Sleeve Polo", "Staff Polo Shirt", "team-staff-apparel", ["corporate-service-uniforms"], "75% cotton / 25% polyester.", ["Cotton Blend", "Polo", "Colour Block"]],
  "GAR-TP-002": ["Purple Team Track Trousers", "Team Track Trousers", "team-staff-apparel", [], "60% cotton / 40% polyester.", ["Cotton Blend", "Teamwear", "Trousers"]],
  "GAR-TJ-005": ["Green-and-White Team Track Jacket", "Team Track Jacket", "team-staff-apparel", [], "40% cotton / 60% polyester.", ["Cotton Blend", "Teamwear", "Colour Block"]],
  "GAR-PO-002": ["Side-Panel Staff Polo", "Staff Polo Shirt", "team-staff-apparel", ["corporate-service-uniforms"], "75% cotton / 25% polyester.", ["Cotton Blend", "Polo", "Colour Block"]],
  "GAR-TP-003": ["Green Team Track Trousers", "Team Track Trousers", "team-staff-apparel", [], "35% cotton / 65% polyester.", ["Cotton Blend", "Teamwear", "Trousers", "Colour Block"]],
};

const applications = {
  "industrial-workwear": ["Manufacturing", "Maintenance", "Logistics", "Engineering support"],
  "protective-hi-vis": ["Utilities", "Road and infrastructure teams", "Site safety programs", "Industrial operations"],
  "cold-weather-outdoor-workwear": ["Outdoor operations", "Cold-weather teams", "Logistics yards", "Field service"],
  "corporate-service-uniforms": ["Corporate offices", "Hospitality and reception", "Institutional uniforms", "Service teams"],
  "team-staff-apparel": ["Staff programs", "Education and clubs", "Events and promotion", "General teamwear"],
};

const typeConstruction = {
  "Work Jacket": ["Structured workwear body with practical layering room", "Front closure selected for the project", "Pocket layout can be adapted to the task", "Cuff and hem details reviewed at sampling"],
  "Protective Work Jacket": ["Workwear body designed for visible performance details", "Front closure and storm protection reviewed by use", "Reflective layout is specified before sampling", "Pocket and cuff details can be project configured"],
  "Zip Hoodie": ["Full-front zip construction", "Drawcord hood with ribbed cuffs and hem", "Front hand pockets", "Decoration zones suitable for team programs"],
  "Pullover Hoodie": ["Pullover hooded construction", "Kangaroo pocket", "Ribbed cuffs and hem", "Front and back decoration zones"],
  "Hooded Shell Jacket": ["Protective hood and high front closure", "Shell construction designed for layering", "Pocket and cuff layout visible in the approved sample", "Coating and seam details set by performance target"],
  "Insulated Work Jacket": ["Insulated body for cold-weather layering", "High front closure and protective collar or hood", "Outer and inner pocket options", "Cuff, hem and liner details confirmed at sampling"],
  "Down Work Jacket": ["Insulated shell with project-selected down fill", "Protective hood or collar construction", "Cold-weather pocket layout", "Fill distribution and closures confirmed in the approved sample"],
  "Lined Work Jacket": ["Outer work jacket with removable liner system", "Front closure configured for layered use", "Workwear pocket layout", "Liner attachment and cuff details confirmed at sampling"],
  "Softshell Jacket": ["Stand collar with full-front zip", "Stretch shell construction", "Zipped hand pockets", "Clean panels for team branding"],
  "Work Coverall": ["One-piece long-sleeve construction", "Front opening designed for practical dressing", "Chest and side pocket options", "Waist and cuff details reviewed at sampling"],
  "Protective Coverall": ["One-piece long-sleeve protective configuration", "Reflective layout visible front and back", "Multi-pocket workwear construction", "Closure and cuff details set by the risk specification"],
  "Insulated Coverall": ["One-piece insulated body", "Protective hood and high front closure", "Cold-weather pocket and cuff details", "Shell, lining and insulation reviewed as a system"],
  "Bib Work Trousers": ["Bib-and-brace workwear construction", "Adjustable shoulder straps", "Cargo and hand-pocket options", "Reflective placement specified before sampling"],
  "Work Trousers": ["Straight workwear leg", "Waistband and belt-loop construction", "Cargo and hand-pocket options", "Reinforcement details available where required"],
  "Long Work Coat": ["Long-line work coat coverage", "Point collar and front closure", "Patch-pocket workwear layout", "Reflective details can be positioned by specification"],
  "Safety Vest": ["Lightweight sleeveless construction", "Full-front zip", "Vertical and horizontal reflective layout", "Pocket layout can be configured for the role"],
  "Men's Suit Jacket": ["Tailored single-breasted silhouette", "Lapel, lining and internal construction reviewed at sampling", "Coordinated pocket and button details", "Grading can follow the buyer's size chart"],
  "Women's Tailored Blazer": ["Tailored women's silhouette", "Lapel, lining and closure details set by the approved sample", "Coordinated pocket and button options", "Buyer-specific grading supported"],
  "Women's Uniform Blazer": ["Single-breasted uniform silhouette", "Lining, lapel and button options", "Practical tailored pocket construction", "Buyer-specific grading supported"],
  "Men's Tailored Trousers": ["Tailored straight-leg silhouette", "Waistband, fly and pocket construction", "Fabric and pressing standard set at sampling", "Buyer-specific grading supported"],
  "Tailored Trousers": ["Tailored uniform trouser silhouette", "Waistband, fly and pocket construction", "Coordinated fabric and trim options", "Buyer-specific grading supported"],
  "Team Track Jacket": ["Full-front zip team jacket", "Stand collar with colour-block paneling", "Ribbed or adjustable finishing options", "Clear zones for team marks and sponsor graphics"],
  "Team Track Trousers": ["Elasticated waist with drawcord option", "Straight or cuffed leg configuration", "Side-pocket options", "Colour panels coordinated with matching jackets"],
  "Denim Work Jacket": ["Point-collar denim work jacket", "Front button closure", "Chest and lower-pocket construction", "Wash and stitching details confirmed through samples"],
  "Staff Polo Shirt": ["Short-sleeve polo construction", "Rib collar and button placket", "Colour-block panels for team identity", "Chest and sleeve decoration zones"],
};

const homepageSkus = new Set(["GAR-WJ-001", "GAR-CO-003", "GAR-HV-001", "GAR-OJ-004", "GAR-OJ-006", "GAR-BL-002", "GAR-KN-003", "GAR-PO-002"]);

function slugify(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function brandingFor(type) {
  if (/Suit|Blazer|Tailored/.test(type)) return ["Woven main and care labels", "Custom buttons", "Branded lining option", "Garment bags and project tags"];
  if (/Polo|Hoodie|Track/.test(type)) return ["Embroidery", "Screen printing", "Heat transfer", "Woven patches and labels"];
  return ["Embroidery", "Heat transfer", "Woven or rubber patches", "Project labels and packing marks"];
}

function publicWeight(value) {
  return String(value)
    .replace(/；/g, "; ")
    .replace("面布", "Shell fabric ")
    .replace("填充克重按保暖等级确认", "insulation weight confirmed for the target warmth level")
    .replace("羽绒充绒量按款式及尺码确认", "down fill weight confirmed by style and size")
    .replace("（约", " (approx. ")
    .replace("）", ")");
}

function configurationFor(type, filters) {
  const options = ["Custom colours subject to fabric availability and MOQ", "Buyer size chart and grading support", "Pocket, closure and trim review", "Individual polybag and export carton"];
  if (filters.includes("Reflective Detail") || filters.includes("High Visibility")) options.splice(2, 0, "Reflective material, width and placement subject to specification");
  if (filters.some((item) => item.includes("Anti-Static") || item.includes("Flame-Resistant") || item.includes("Weather Protection"))) options.splice(1, 0, "Target performance and verification route confirmed before sampling");
  if (/Suit|Blazer|Tailored/.test(type)) return ["Fabric composition and seasonal weight", "Lining, lapel, button and pocket details", "Buyer size chart and role-based grading", "Hangers, garment bags and project packaging"];
  return options;
}

const products = source.records.map((record, index) => {
  const sku = record["SKU（款号）"];
  const entry = curated[sku];
  if (!entry) throw new Error(`Missing curated mapping for ${sku}`);
  const [name, garmentType, primaryCollection, secondaryCollections, material, filters] = entry;
  const app = applications[primaryCollection];
  const front = `/assets/products/${sku.toLowerCase()}/front.webp`;
  const back = `/assets/products/${sku.toLowerCase()}/back.webp`;
  const inner = record["夹层图路径"] ? `/assets/products/${sku.toLowerCase()}/inner.webp` : null;
  const primaryName = collections.find((item) => item.slug === primaryCollection).name;
  const summaryOpeners = ["A practical", "A configurable", "A project-ready", "A specification-led", "A versatile"];
  const summary = `${summaryOpeners[index % summaryOpeners.length]} ${name.toLowerCase()} built around ${material.replace(/\.$/, "")} for ${app[0].toLowerCase()} and ${app[1].toLowerCase()}.`;
  return {
    sku,
    sourceNumber: record["原编号"],
    slug: `${slugify(name)}-${sku.toLowerCase()}`,
    name,
    primaryCollection,
    secondaryCollections,
    garmentType,
    summary,
    applications: app,
    materials: [{ value: material, status: material.includes("subject to") || material.includes("option") ? "configurable" : "verified" }],
    referenceWeight: { value: publicWeight(record["参考克重"]), status: "reference" },
    construction: typeConstruction[garmentType] || typeConstruction["Work Jacket"],
    customization: configurationFor(garmentType, filters),
    branding: brandingFor(garmentType),
    filters,
    colours: "Custom colours available; subject to fabric availability and MOQ.",
    sizes: "European and Asian grading available; buyer size chart supported.",
    moq: "From 50 pieces per style/colour; subject to fabric, colour and customization.",
    sample: "Available; timing confirmed after specification review.",
    bulkLeadTime: "Confirmed after sample, specification, quantity and delivery review.",
    packaging: "Individual polybag and export carton; project-specific packing available.",
    images: { front, back, inner },
    homepage: homepageSkus.has(sku),
    seo: {
      title: `${name} | ${sku} | LF Clothing`,
      description: `${name} (${sku}) for international B2B workwear and uniform programs. Review the reference material, construction and configurable options.`,
    },
    internal: {
      sourceCategory: record["一级分类"],
      sourceName: record["产品名称"],
      sourceMaterialText: record["面料及工艺（业务原文）"],
      imageStatus: record["图片归档状态"],
      reviewStatus: record["资料状态"],
      primaryCollectionName: primaryName,
    },
  };
});

if (products.length !== 50 || new Set(products.map((item) => item.sku)).size !== 50) throw new Error("Expected 50 unique products.");
if (products.filter((item) => item.homepage).length !== 8) throw new Error("Expected 8 homepage products.");

await fs.writeFile(path.join(root, "data", "collections.json"), `${JSON.stringify(collections, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(root, "data", "products.json"), `${JSON.stringify(products, null, 2)}\n`, "utf8");
console.log(`Created public data for ${products.length} products across ${collections.length} collections.`);
