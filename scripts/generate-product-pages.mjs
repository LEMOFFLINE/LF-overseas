import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = join(root, "product-pages");

const categories = {
  business: { name: "Business & Professional Wear", path: "/business-professional-wear" },
  corporate: { name: "Corporate Polos & T-Shirts", path: "/corporate-logo-apparel" },
  workwear: { name: "Workwear & Industrial Uniforms", path: "/industrial-workwear" },
  teamwear: { name: "Hoodies & Team Jackets", path: "/team-jackets-hoodies" },
  outdoor: { name: "Outdoor & All-Weather Jackets", path: "/outdoor-apparel" },
  school: { name: "School & Activity Uniforms", path: "/school-uniforms" },
};

const products = [
  {
    sku: "LF-BW-01",
    slug: "mens-professional-suit",
    name: "Men's Professional Suit",
    category: "business",
    image: "/assets/products/mens-business-suit.webp",
    alt: "Custom navy men's professional business suit",
    summary: "A coordinated men's suit direction for corporate offices, hospitality teams and formal uniform programs.",
    material: "Polyester-viscose or stretch suiting options",
    composition: "Confirmed against the selected fabric swatch",
    features: "Single-breasted jacket with coordinated trouser options",
    colors: "Navy, charcoal, black or buyer-selected colors",
    sizes: "Standard range or buyer-provided size chart",
    applications: ["Corporate offices", "Hospitality teams", "Institutional uniforms"],
  },
  {
    sku: "LF-BW-02",
    slug: "womens-professional-suit",
    name: "Women's Professional Suit",
    category: "business",
    image: "/assets/products/womens-business-suit.webp",
    alt: "Custom navy women's professional business suit",
    summary: "A modern women's business uniform with coordinated blazer, trouser, skirt and vest possibilities.",
    material: "Polyester-viscose or stretch suiting options",
    composition: "Confirmed against the selected fabric swatch",
    features: "Coordinated separates for practical uniform programs",
    colors: "Navy, charcoal, black or buyer-selected colors",
    sizes: "Standard range or buyer-provided size chart",
    applications: ["Reception teams", "Corporate offices", "Service uniforms"],
  },
  {
    sku: "LF-BW-03",
    slug: "coordinated-team-suit-program",
    name: "Coordinated Team Suit Program",
    category: "business",
    image: "/assets/products/corporate-business-suit-team.webp",
    alt: "Coordinated men's and women's custom business suits",
    summary: "Matching men's and women's suit styles developed around one fabric, color and brand direction.",
    material: "Project-selected suiting fabric",
    composition: "Confirmed during fabric and sample approval",
    features: "Blazer, trouser, skirt, vest, lining and trim coordination",
    colors: "Corporate colors developed from available fabric options",
    sizes: "Buyer size chart, grading rules or agreed standard range",
    applications: ["Corporate uniform programs", "Hotels and service teams", "Institutional procurement"],
  },
  {
    sku: "LF-BW-04",
    sourceId: "848701462888",
    slug: "business-long-sleeve-shirts",
    name: "Business Long-Sleeve Shirts",
    category: "business",
    image: "/assets/products/business-long-sleeve-shirts.webp",
    alt: "Men's and women's deep navy business uniform shirts",
    summary: "Coordinated long-sleeve shirts for office, reception, hospitality and service uniform programs.",
    material: "Cotton-bamboo fiber fabric",
    composition: "Cotton-bamboo fiber listed in the source catalog",
    features: "Men's and women's coordinated shirt styling",
    colors: "Deep navy listed; project colors reviewed on request",
    sizes: "S-4XL",
    applications: ["Office uniforms", "Reception teams", "Hospitality staff"],
  },
  {
    sku: "LF-BW-05",
    sourceId: "851182070482",
    slug: "mens-business-trousers",
    name: "Men's Business Trousers",
    category: "business",
    image: "/assets/products/mens-business-trousers.webp",
    alt: "Men's straight-leg gray business uniform trousers",
    summary: "Straight-leg professional trousers for office uniforms and coordinated business sets.",
    material: "Polyester-based suiting fabric",
    composition: "Listed polyester content: 80%",
    features: "Clean straight-leg business fit",
    colors: "Gray listed; coordinated colors reviewed by project",
    sizes: "Confirmed by garment measurements or buyer size chart",
    applications: ["Business uniforms", "Reception teams", "Formal service programs"],
  },
  {
    sku: "LF-CA-01",
    sourceId: "1060273374549",
    slug: "quick-dry-corporate-polo",
    name: "Quick-Dry Corporate Polo",
    category: "corporate",
    image: "/assets/products/quick-dry-corporate-polo.webp",
    alt: "Women's navy quick-dry corporate polo shirt",
    summary: "A lightweight performance polo for warm-weather teams, promotions and operational uniforms.",
    material: "Polyester quick-dry knit",
    composition: "Listed polyester content: 96% or higher",
    features: "Breathable and moisture-wicking",
    colors: "13 listed colors including white, navy, royal blue, red, green, black and orange",
    sizes: "S-7XL",
    applications: ["Corporate teams", "Promotional programs", "Warm-weather uniforms"],
  },
  {
    sku: "LF-CA-02",
    sourceId: "938500402822",
    slug: "230-gsm-cotton-polo",
    name: "230 GSM Cotton Polo",
    category: "corporate",
    image: "/assets/products/cotton-business-polo.webp",
    alt: "Men's pink 230 GSM cotton business polo shirt",
    summary: "A substantial cotton polo for business casual uniforms, staff apparel and branded programs.",
    material: "230 GSM cotton pique",
    composition: "100% cotton",
    features: "Men's and women's catalog options",
    colors: "21 listed men's and women's color options",
    sizes: "S-3XL",
    applications: ["Business casual uniforms", "Retail staff", "Branded team apparel"],
  },
  {
    sku: "LF-CA-03",
    sourceId: "1062211120039",
    slug: "130-gsm-quick-dry-t-shirt",
    name: "130 GSM Quick-Dry T-Shirt",
    category: "corporate",
    image: "/assets/products/quick-dry-logo-t-shirt.webp",
    alt: "Men's and women's navy quick-dry logo T-shirts",
    summary: "A breathable short-sleeve T-shirt for sports, events, campaigns and staff programs.",
    material: "130 GSM polyester knit",
    composition: "Listed polyester content: 96% or higher",
    features: "Breathable and moisture-wicking",
    colors: "Red, green, light blue, olive, white, black and navy",
    sizes: "S-7XL",
    applications: ["Events and campaigns", "Sports teams", "Staff apparel"],
  },
  {
    sku: "LF-CA-04",
    sourceId: "940570086180",
    slug: "200-gsm-cooling-feel-t-shirt",
    name: "200 GSM Cooling-Feel T-Shirt",
    category: "corporate",
    image: "/assets/products/custom-cooling-t-shirt.webp",
    alt: "Men's and women's yellow cooling-feel cotton T-shirts",
    summary: "A clean premium T-shirt direction for corporate apparel, retail programs and team use.",
    material: "Long-staple cotton face with cooling-fiber inner layer",
    composition: "Listed cotton content: 100%",
    features: "Moisture-management direction",
    colors: "14 listed colors including black, navy, ivory, red, gray-blue and green",
    sizes: "S-4XL",
    applications: ["Premium team apparel", "Retail programs", "Corporate uniforms"],
  },
  {
    sku: "LF-CA-05",
    sourceId: "792905875137",
    slug: "cotton-team-t-shirt",
    name: "100% Cotton Team T-Shirt",
    category: "corporate",
    image: "/assets/products/cotton-team-t-shirt.webp",
    alt: "Men's and women's black cotton crew-neck team T-shirts",
    summary: "A soft crew-neck T-shirt for classwear, teams, promotions and custom logo programs.",
    material: "Cotton jersey",
    composition: "100% cotton",
    features: "Plain base suitable for multiple decoration methods",
    colors: "10 listed colors including black, white, gray, blue, pink, green and beige",
    sizes: "S-4XL",
    applications: ["Classwear", "Promotional apparel", "Custom logo programs"],
  },
  {
    sku: "LF-IW-01",
    sourceId: "778432042625",
    slug: "summer-short-sleeve-workwear-set",
    name: "Summer Short-Sleeve Workwear Set",
    category: "workwear",
    image: "/assets/products/summer-short-sleeve-workwear-set.webp",
    alt: "Men's and women's navy and gray summer workwear sets",
    summary: "A short-sleeve jacket and trouser set for warm-weather industrial and service use.",
    material: "Poly-cotton workwear fabric",
    composition: "Listed polyester content: 65%",
    features: "Short-sleeve jacket and coordinated trousers",
    colors: "Five listed workwear combinations: X116, X1306, X1603, X766 and X781",
    sizes: "XXS-4XL",
    applications: ["Workshops", "Maintenance teams", "Warm-weather operations"],
  },
  {
    sku: "LF-IW-02",
    sourceId: "778124766966",
    slug: "spring-autumn-workwear-set",
    name: "Spring & Autumn Workwear Set",
    category: "workwear",
    image: "/assets/products/spring-autumn-workwear-set.webp",
    alt: "Men's and women's gray long-sleeve industrial workwear sets",
    summary: "A long-sleeve workwear jacket and trouser set for workshops and operational teams.",
    material: "Poly-cotton workwear fabric",
    composition: "Listed polyester content: 65%",
    features: "Long-sleeve jacket and coordinated trousers",
    colors: "Five listed workwear combinations: X001, X003, X009, X100 and X101",
    sizes: "XXS-4XL",
    applications: ["Industrial teams", "Engineering crews", "Maintenance programs"],
  },
  {
    sku: "LF-IW-03",
    sourceId: "782037983909",
    slug: "engineering-short-sleeve-workwear-set",
    name: "Engineering Short-Sleeve Workwear Set",
    category: "workwear",
    image: "/assets/products/reflective-short-sleeve-workwear-set.webp",
    alt: "Orange and gray short-sleeve engineering workwear set",
    summary: "A lightweight short-sleeve workwear direction for engineering, workshop and welding-support teams.",
    material: "Poly-cotton workwear fabric",
    composition: "Listed polyester content: 65%",
    features: "Functional fabric options are confirmed by project specification and testing needs",
    colors: "Project workwear color combinations",
    sizes: "Buyer size chart or confirmed stock range",
    applications: ["Engineering teams", "Workshop crews", "Industrial service uniforms"],
  },
  {
    sku: "LF-IW-04",
    sourceId: "816653933901",
    slug: "dark-workshop-workwear-set",
    name: "Dark Workshop Workwear Set",
    category: "workwear",
    image: "/assets/products/dark-workshop-workwear-set.webp",
    alt: "Dark gray short-sleeve workshop workwear set",
    summary: "A durable workwear direction for workshops, maintenance and operational teams.",
    material: "Poly-cotton workwear fabric",
    composition: "Listed polyester content: 65%",
    features: "Short jacket construction for active work environments",
    colors: "Five listed workwear combinations: X008, X009, X100, X101 and X105",
    sizes: "XXS-4XL",
    applications: ["Workshops", "Automotive service", "Maintenance teams"],
  },
  {
    sku: "LF-IW-05",
    sourceId: "816485318295",
    slug: "breathable-short-sleeve-workwear-set",
    name: "Breathable Short-Sleeve Workwear Set",
    category: "workwear",
    image: "/assets/products/breathable-short-sleeve-workwear-set.webp",
    alt: "Gray and orange breathable short-sleeve workwear set",
    summary: "A light short-sleeve workwear set for factory, maintenance and warm-weather operational use.",
    material: "Poly-cotton workwear fabric",
    composition: "Listed polyester content: 65%",
    features: "Short-sleeve construction for warmer working conditions",
    colors: "Five listed workwear combinations: X001, X003, X004, X005 and X007",
    sizes: "XXS-4XL",
    applications: ["Factory teams", "Electrical service", "Warm-weather maintenance"],
  },
  {
    sku: "LF-TJ-01",
    sourceId: "843199685171",
    slug: "custom-pullover-hoodie",
    name: "Custom Pullover Hoodie",
    category: "teamwear",
    image: "/assets/products/custom-team-hoodie.webp",
    alt: "Black and white pullover hoodies for custom team apparel",
    summary: "A relaxed hoodie direction for teams, events, clubs, campaigns and casual staff wear.",
    material: "Polyester sweatshirt fabric",
    composition: "Listed polyester content: 96% or higher",
    features: "Pullover construction with hood and branding area",
    colors: "22 listed colors across neutral, bright and muted options",
    sizes: "L-3XL listed",
    applications: ["Clubs and teams", "Events", "Casual staff apparel"],
  },
  {
    sku: "LF-TJ-02",
    sourceId: "838360351834",
    slug: "colorblock-varsity-jacket",
    name: "Colorblock Varsity Jacket",
    category: "teamwear",
    image: "/assets/products/colorblock-varsity-jacket.webp",
    alt: "Orange and gray colorblock varsity jackets for teams",
    summary: "A custom team jacket direction for education, training, clubs and promotional projects.",
    material: "Polyester-based jacket fabric",
    composition: "Listed polyester content: 100%",
    features: "Colorblock varsity construction suitable for logo decoration",
    colors: "11 listed catalog colorways",
    sizes: "S-3XL",
    applications: ["Education programs", "Training teams", "Promotional projects"],
  },
  {
    sku: "LF-TJ-03",
    sourceId: "831210133245",
    slug: "cotton-rich-crewneck-sweatshirt",
    name: "Cotton-Rich Crewneck Sweatshirt",
    category: "teamwear",
    image: "/assets/products/multi-color-crewneck-sweatshirt.webp",
    alt: "Men's and women's cotton-rich crew-neck team sweatshirts",
    summary: "A relaxed crew-neck layer for clubs, schools, staff teams and branded programs.",
    material: "Cotton-rich sweatshirt fabric",
    composition: "Listed cotton content: 80-90%",
    features: "Crew-neck pullover construction",
    colors: "10 listed colors including navy, blue, white, pink, green, black and red",
    sizes: "S-3XL",
    applications: ["School groups", "Team programs", "Branded casual wear"],
  },
  {
    sku: "LF-TJ-04",
    sourceId: "838717955127",
    slug: "stand-collar-zip-team-jacket",
    name: "Stand-Collar Zip Team Jacket",
    category: "teamwear",
    image: "/assets/products/stand-collar-team-zip-jacket.webp",
    alt: "Men's and women's black stand-collar team zip jackets",
    summary: "A clean full-zip team layer for staff, clubs, events and coordinated branded apparel.",
    material: "Polyester-based jacket fabric",
    composition: "Listed polyester content: 100%",
    features: "Full zip and stand collar",
    colors: "Red, navy, orange, pink, black, gray-green and blue",
    sizes: "S-3XL",
    applications: ["Staff teams", "Clubs", "Branded event apparel"],
  },
  {
    sku: "LF-TJ-05",
    sourceId: "826662539479",
    slug: "unisex-crewneck-sweatshirt",
    name: "Unisex Crewneck Sweatshirt",
    category: "teamwear",
    image: "/assets/products/unisex-crewneck-sweatshirt.webp",
    alt: "Men's black and women's white unisex crew-neck sweatshirts",
    summary: "A straightforward pullover sweatshirt for teams, classwear, promotions and casual staff use.",
    material: "Polyester sweatshirt fabric",
    composition: "Polyester listed in the source catalog",
    features: "Unisex crew-neck pullover construction",
    colors: "Eight listed colors including off-white, navy, red, khaki, black and gray",
    sizes: "S-4XL",
    applications: ["Classwear", "Team uniforms", "Promotional apparel"],
  },
  {
    sku: "LF-TJ-06",
    sourceId: "843088856015",
    slug: "college-varsity-team-jacket",
    name: "College Varsity Team Jacket",
    category: "teamwear",
    image: "/assets/products/college-varsity-team-jacket.webp",
    alt: "Men's navy and women's beige college varsity team jackets",
    summary: "A color-block varsity jacket for schools, clubs, events and custom team collections.",
    material: "Synthetic blended jacket fabric",
    composition: "Polyester listed as the primary composition",
    features: "Varsity styling with decoration and color coordination options",
    colors: "10 listed catalog colorways",
    sizes: "L-3XL listed",
    applications: ["Schools and colleges", "Clubs", "Event apparel"],
  },
  {
    sku: "LF-TJ-07",
    sourceId: "841985122092",
    slug: "fleece-zip-team-jacket",
    name: "Fleece Zip Team Jacket",
    category: "teamwear",
    image: "/assets/products/fleece-zip-team-jacket.webp",
    alt: "Men's gray and women's tan fleece zip team jackets",
    summary: "A warm stand-collar fleece layer for staff, field teams, clubs and seasonal programs.",
    material: "Polyester fleece",
    composition: "Listed polyester content: 80%",
    features: "Full zip, stand collar and warm fleece direction",
    colors: "Eight listed catalog colorways",
    sizes: "L-3XL listed",
    applications: ["Seasonal staff apparel", "Field teams", "Clubs"],
  },
  {
    sku: "LF-OA-01",
    sourceId: "825440956120",
    slug: "three-in-one-outdoor-jacket",
    name: "Three-in-One Outdoor Jacket",
    category: "outdoor",
    image: "/assets/products/three-in-one-outdoor-jacket.webp",
    alt: "Men's and women's red three-in-one outdoor jackets",
    summary: "A detachable layered jacket direction for cold-weather teams and outdoor programs.",
    material: "Polyester and cotton construction",
    composition: "Polyester and cotton listed in the source catalog",
    features: "Detachable layered three-in-one construction",
    colors: "Black, light gray, navy, khaki, dark gray and red",
    sizes: "S-4XL",
    applications: ["Outdoor teams", "Cold-weather uniforms", "Field programs"],
  },
  {
    sku: "LF-OA-02",
    sourceId: "942151240083",
    slug: "lightweight-summer-cover-jacket",
    name: "Lightweight Summer Cover Jacket",
    category: "outdoor",
    image: "/assets/products/lightweight-sun-protection-jacket.webp",
    alt: "Men's and women's lightweight green summer hooded jackets",
    summary: "A thin hooded layer for warm-weather outdoor, travel and team apparel programs.",
    material: "Lightweight acetate-based fabric listing",
    composition: "Exact content confirmed with the selected option",
    features: "Lightweight hooded coverage; performance claims require project confirmation",
    colors: "10 men's and women's combinations across black, white, khaki, green and gray",
    sizes: "S-4XL",
    applications: ["Warm-weather teams", "Travel programs", "Light outdoor coverage"],
  },
  {
    sku: "LF-OA-03",
    sourceId: "941455346378",
    slug: "lightweight-stand-collar-jacket",
    name: "Lightweight Stand-Collar Jacket",
    category: "outdoor",
    image: "/assets/products/lightweight-stand-collar-jacket.webp",
    alt: "Orange lightweight stand-collar outdoor jacket",
    summary: "A single-layer zip jacket for field teams, events and lightweight outdoor programs.",
    material: "Lightweight woven shell option",
    composition: "Confirmed against the selected fabric option",
    features: "Single-layer shell with stand collar",
    colors: "10 listed colors including black, beige, navy, red, khaki, orange, blue and green",
    sizes: "S-6XL",
    applications: ["Field teams", "Outdoor events", "Lightweight staff jackets"],
  },
  {
    sku: "LF-OA-04",
    sourceId: "842535131105",
    slug: "three-layer-taped-seam-shell",
    name: "Three-Layer Taped-Seam Shell",
    category: "outdoor",
    image: "/assets/products/three-layer-taped-shell-jacket.webp",
    alt: "Black and green three-layer taped-seam hooded shell jacket",
    summary: "A hard-shell direction with taped seams for outdoor and field apparel projects.",
    material: "Three-layer shell fabric",
    composition: "Exact membrane and face fabric confirmed by project",
    features: "Taped-seam construction; performance values require applicable testing",
    colors: "Four listed catalog colorways",
    sizes: "L-3XL listed",
    applications: ["Outdoor programs", "Field teams", "Weather-protection projects"],
  },
  {
    sku: "LF-SU-01",
    sourceId: "788578601883",
    slug: "secondary-school-sports-set",
    name: "Secondary School Sports Set",
    category: "school",
    image: "/assets/products/school-sports-uniform-set.webp",
    alt: "Custom secondary school sports uniform set",
    summary: "A coordinated short-sleeve sports uniform set for secondary schools and activity programs.",
    material: "Pique knit",
    composition: "Listed polyester content: 75%",
    features: "Top and bottom coordination for school programs",
    colors: "Light blue, white and red listed; school colors reviewed by project",
    sizes: "Buyer size chart or project grading",
    applications: ["Secondary schools", "Student activities", "Education suppliers"],
  },
  {
    sku: "LF-SU-02",
    sourceId: "841673634247",
    slug: "waffle-knit-school-sweatshirt",
    name: "Waffle-Knit School Sweatshirt",
    category: "school",
    image: "/assets/products/waffle-knit-school-sweatshirt.webp",
    alt: "Custom waffle-knit crew-neck school sweatshirt",
    summary: "A textured crew-neck sweatshirt for school groups, classwear and student activity programs.",
    material: "Polyester waffle-knit fabric",
    composition: "Listed polyester content: 81-90%",
    features: "Textured crew-neck pullover construction",
    colors: "Eight listed catalog colorways",
    sizes: "L-3XL listed; project sizing reviewed separately",
    applications: ["School classwear", "Student groups", "Activity uniforms"],
  },
  {
    sku: "LF-SU-03",
    sourceId: "794649488901",
    slug: "quick-dry-school-sports-t-shirt",
    name: "Quick-Dry School Sports T-Shirt",
    category: "school",
    image: "/assets/products/quick-dry-school-sports-t-shirt.webp",
    alt: "Custom quick-dry school sports T-shirt",
    summary: "A breathable mesh sports T-shirt for school activities, teams and class programs.",
    material: "Quick-dry sports mesh",
    composition: "Listed polyester content: 96% or higher",
    features: "Breathable and moisture-wicking",
    colors: "12 listed colors including orange, pink, black, blue, gray, yellow, green, red and white",
    sizes: "S-5XL; larger sizes reviewed on request",
    applications: ["School sports", "Class activities", "Team programs"],
  },
];

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const footer = `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid footer-grid-compact">
          <div class="footer-about">
            <h3>LF Clothing</h3>
            <p>The international inquiry platform of Beijing Lingfeng Apparel for custom apparel, uniforms and coordinated B2B orders.</p>
            <div class="social-links" aria-label="LF Clothing social media">
              <a class="social-link social-linkedin" href="https://www.linkedin.com/in/kai-wang-b6aa79420/" target="_blank" rel="noopener noreferrer" aria-label="Visit LF Clothing on LinkedIn" title="LinkedIn"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg></a>
              <a class="social-link social-facebook" href="https://www.facebook.com/profile.php?id=61591964337372" target="_blank" rel="noopener noreferrer" aria-label="Visit LF Clothing on Facebook" title="Facebook"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/></svg></a>
              <a class="social-link social-whatsapp" href="https://wa.me/8613901335518" target="_blank" rel="noopener noreferrer" aria-label="Contact LF Clothing on WhatsApp" title="WhatsApp"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg></a>
            </div>
          </div>
          <div class="footer-contact">
            <h3>Contact</h3>
            <p>Email: <a href="mailto:sales@lfclothing.com">sales@lfclothing.com</a></p>
            <p>WhatsApp: <a href="https://wa.me/8613901335518">+86 139 0133 5518</a></p>
            <p>Room 203, Building 1, No. 18 Jia, Longtai Road, Jiugong Industrial Park, Daxing District, Beijing, China.</p>
          </div>
        </div>
        <div class="footer-bottom">(c) 2026 Beijing Lingfeng Apparel Co., Ltd. All rights reserved.</div>
      </div>
    </footer>`;

function renderPage(product) {
  const category = categories[product.category];
  const url = `https://lfclothing.com/products/${product.slug}`;
  const quoteUrl = `/contact?request=product&category=${encodeURIComponent(category.name)}&style=${encodeURIComponent(product.sku)}`;
  const whatsappUrl = `https://wa.me/8613901335518?text=${encodeURIComponent(`Hello, I'm interested in ${product.name} (${product.sku}).`)}`;
  const related = products.filter((candidate) => candidate.category === product.category && candidate.sku !== product.sku).slice(0, 3);
  const metaDescription = `${product.summary} MOQ 50-100 pieces per style and color with OEM/ODM support.`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [`https://lfclothing.com${product.image}`],
    description: product.summary,
    sku: product.sku,
    brand: { "@type": "Brand", name: "LF Clothing" },
    category: category.name,
    additionalProperty: [
      { "@type": "PropertyValue", name: "MOQ", value: "50-100 pieces per style and color" },
      { "@type": "PropertyValue", name: "Sample lead time", value: "5-10 business days" },
      { "@type": "PropertyValue", name: "Material", value: product.material },
    ],
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://lfclothing.com/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://lfclothing.com/products" },
      { "@type": "ListItem", position: 3, name: category.name, item: `https://lfclothing.com${category.path}` },
      { "@type": "ListItem", position: 4, name: product.name, item: url },
    ],
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(product.name)} | Custom B2B Apparel | LF Clothing</title>
    <meta name="description" content="${escapeHtml(metaDescription)}">
    <link rel="canonical" href="${url}">
    <meta property="og:site_name" content="LF Clothing | Lingfeng Apparel">
    <meta property="og:type" content="product">
    <meta property="og:title" content="${escapeHtml(product.name)} | LF Clothing">
    <meta property="og:description" content="${escapeHtml(product.summary)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="https://lfclothing.com${product.image}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(product.name)} | LF Clothing">
    <meta name="twitter:description" content="${escapeHtml(product.summary)}">
    <meta name="twitter:image" content="https://lfclothing.com${product.image}">
    <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="nav-wrap">
        <a class="brand" href="/" aria-label="LF Clothing home"><img class="brand-mark" src="/assets/site/logo-mark-160.webp" width="44" height="44" alt="LF Clothing logo"><span class="brand-text"><span>LF CLOTHING</span><span>Beijing Lingfeng Apparel</span></span></a>
        <nav class="nav-links" aria-label="Primary navigation"><a href="/">Home</a><a class="is-active" href="/products">Products</a><a href="/manufacturing">Production</a><a href="/about">About</a><a href="/contact">Contact</a></nav>
        <div class="nav-actions"><a class="btn btn-primary" href="/contact?request=catalog">Request Catalog</a><button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button></div>
      </div>
    </header>
    <main id="main">
      <nav class="product-breadcrumb" aria-label="Breadcrumb"><a href="/products">Products</a><span>/</span><a href="${category.path}">${escapeHtml(category.name)}</a><span>/</span><span aria-current="page">${escapeHtml(product.name)}</span></nav>
      <section class="product-detail-hero">
        <div class="product-detail-media"><img src="${product.image}" width="1100" height="1100" alt="${escapeHtml(product.alt)}"></div>
        <div class="product-detail-copy">
          <p class="eyebrow">${escapeHtml(category.name)}</p>
          <span class="product-code">${product.sku}</span>
          <h1>${escapeHtml(product.name)}</h1>
          <p class="product-detail-summary">${escapeHtml(product.summary)}</p>
          <div class="product-key-facts">
            <div><strong>MOQ</strong><span>50-100 pcs per style and color</span></div>
            <div><strong>Sample</strong><span>5-10 business days</span></div>
            <div><strong>Service</strong><span>OEM, ODM and sample-based development</span></div>
            <div><strong>Branding</strong><span>Print, embroidery, labels and packaging</span></div>
          </div>
          <div class="hero-actions"><a class="btn btn-primary" href="${quoteUrl}">Request a Quote</a><a class="btn btn-outline" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a></div>
        </div>
      </section>

      <section class="section section-soft">
        <div class="section-inner product-info-layout">
          <div class="product-overview">
            <p class="eyebrow">Reference specification</p>
            <h2>Product Details</h2>
            <p>This style can be used as a starting point for custom orders. Final fabric, construction, color, measurements and decoration details are confirmed against the approved sample before bulk production.</p>
            <div class="product-spec-table">
              <div><strong>Material</strong><span>${escapeHtml(product.material)}</span></div>
              <div><strong>Composition</strong><span>${escapeHtml(product.composition)}</span></div>
              <div><strong>Construction / function</strong><span>${escapeHtml(product.features)}</span></div>
              <div><strong>Color range</strong><span>${escapeHtml(product.colors)}</span></div>
              <div><strong>Size range</strong><span>${escapeHtml(product.sizes)}</span></div>
              <div><strong>Reference code</strong><span>${product.sku}</span></div>
            </div>
          </div>
          <aside class="product-use-panel">
            <p class="eyebrow">Typical applications</p>
            <h2>Suitable For</h2>
            <ul>${product.applications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            <p>Send a reference image, sample garment, tech pack or size chart for a project-specific review.</p>
          </aside>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <div class="section-head"><p class="eyebrow">Customization support</p><h2>Develop the Style Around Your Project</h2><p>Available options depend on the garment, artwork, fabric and order quantity.</p></div>
          <div class="feature-grid product-customization-grid">
            <article class="feature-item"><h3>Fabric & Color</h3><p>Review stock fabric directions, alternative weights, project colors and trims.</p></article>
            <article class="feature-item"><h3>Logo Decoration</h3><p>Screen print, heat transfer, DTF, digital print, sublimation and embroidery where suitable.</p></article>
            <article class="feature-item"><h3>Private Label</h3><p>Woven labels, care labels, hangtags, patches and buyer-specified packaging.</p></article>
            <article class="feature-item"><h3>Fit & Construction</h3><p>Develop from an existing style, physical sample, tech pack, image or buyer size chart.</p></article>
          </div>
        </div>
      </section>

      <section class="section section-dark product-process-section">
        <div class="section-inner">
          <div class="section-head"><p class="eyebrow">Order workflow</p><h2>From Requirement to Bulk Production</h2></div>
          <ol class="product-process">
            <li><strong>01</strong><span>Confirm style, quantity, fabric, colors, sizing and logo requirements.</span></li>
            <li><strong>02</strong><span>Review quotation and prepare the sample in approximately 5-10 business days.</span></li>
            <li><strong>03</strong><span>Approve the sample and confirm bulk production details.</span></li>
            <li><strong>04</strong><span>Complete production checks, packing and export preparation.</span></li>
          </ol>
        </div>
      </section>

      ${related.length ? `<section class="section"><div class="section-inner"><div class="section-head"><p class="eyebrow">Related styles</p><h2>More in ${escapeHtml(category.name)}</h2></div><div class="product-grid">${related.map((item) => `<article class="product-card"><a class="product-media" href="/products/${item.slug}"><img src="${item.image}" width="1100" height="1100" loading="lazy" alt="${escapeHtml(item.alt)}"></a><div class="product-card-body"><span class="product-code">${item.sku}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.summary)}</p><div class="product-actions"><a class="text-link" href="/products/${item.slug}">View product details</a></div></div></article>`).join("")}</div></div></section>` : ""}

      <section class="cta-band"><div class="cta-inner"><div class="cta-copy"><p class="eyebrow">Project inquiry</p><h2>Request Pricing for ${escapeHtml(product.name)}</h2><p>Send your quantity, logo, destination and required delivery date for a project review.</p></div><div class="cta-actions"><a class="btn btn-primary" href="${quoteUrl}">Start an RFQ</a><a class="btn btn-light" href="/contact?request=catalog&category=${encodeURIComponent(category.name)}">Request Category Catalog</a></div></div></section>
    </main>
${footer}
    <script src="/script.js" defer></script>
  </body>
</html>
`;
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const product of products) {
  await writeFile(join(outputDirectory, `${product.slug}.html`), renderPage(product), "utf8");
}

const cardPages = [
  "products.html",
  "business-professional-wear.html",
  "corporate-logo-apparel.html",
  "industrial-workwear.html",
  "team-jackets-hoodies.html",
  "outdoor-apparel.html",
  "school-uniforms.html",
];

for (const page of cardPages) {
  const filePath = join(root, page);
  let html = await readFile(filePath, "utf8");
  for (const product of products) {
    const contactPattern = new RegExp(`href="/contact\\?request=product(?:&amp;|&)category=[^"]+(?:&amp;|&)style=${product.sku}"`, "g");
    html = html.replace(contactPattern, `href="/products/${product.slug}"`);
  }
  html = html.replaceAll(">Ask about this style</a>", ">View product details</a>");
  await writeFile(filePath, html, "utf8");
}

const sitemapPages = [
  ["/", "2026-07-31"],
  ["/products", "2026-07-31"],
  ["/business-professional-wear", "2026-07-31"],
  ["/corporate-logo-apparel", "2026-07-31"],
  ["/industrial-workwear", "2026-07-31"],
  ["/team-jackets-hoodies", "2026-07-31"],
  ["/outdoor-apparel", "2026-07-31"],
  ["/school-uniforms", "2026-07-31"],
  ["/manufacturing", "2026-07-31"],
  ["/about", "2026-07-31"],
  ["/contact", "2026-07-31"],
  ...products.map((product) => [`/products/${product.slug}`, "2026-07-31"]),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPages.map(([path, lastmod]) => `  <url><loc>https://lfclothing.com${path}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}\n</urlset>\n`;
await writeFile(join(root, "sitemap.xml"), sitemap, "utf8");

console.log(`Generated ${products.length} product detail pages and updated product links.`);
