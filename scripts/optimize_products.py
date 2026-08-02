from pathlib import Path
import re

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "网站产品首图"
OUTPUT_DIR = ROOT / "assets" / "products"
MAX_SIZE = (1100, 1100)

OUTPUT_NAMES_BY_ID = {
    "940570086180": "custom-cooling-t-shirt.webp",
    "778124766966": "spring-autumn-workwear-set.webp",
    "938500402822": "cotton-business-polo.webp",
    "843199685171": "custom-team-hoodie.webp",
    "848701462888": "business-long-sleeve-shirts.webp",
    "851182070482": "mens-business-trousers.webp",
    "825440956120": "three-in-one-outdoor-jacket.webp",
    "1060273374549": "quick-dry-corporate-polo.webp",
    "1062211120039": "quick-dry-logo-t-shirt.webp",
    "942151240083": "lightweight-sun-protection-jacket.webp",
    "778432042625": "summer-short-sleeve-workwear-set.webp",
    "788578601883": "school-sports-uniform-set.webp",
    "838360351834": "colorblock-varsity-jacket.webp",
    "792905875137": "cotton-team-t-shirt.webp",
    "831210133245": "multi-color-crewneck-sweatshirt.webp",
    "782037983909": "reflective-short-sleeve-workwear-set.webp",
    "841673634247": "waffle-knit-school-sweatshirt.webp",
    "941455346378": "lightweight-stand-collar-jacket.webp",
    "838717955127": "stand-collar-team-zip-jacket.webp",
    "826662539479": "unisex-crewneck-sweatshirt.webp",
    "842535131105": "three-layer-taped-shell-jacket.webp",
    "816653933901": "dark-workshop-workwear-set.webp",
    "794649488901": "quick-dry-school-sports-t-shirt.webp",
    "816485318295": "breathable-short-sleeve-workwear-set.webp",
    "843088856015": "college-varsity-team-jacket.webp",
    "841985122092": "fleece-zip-team-jacket.webp",
}

OUTPUT_NAMES_BY_LABEL = {
    "男士商务西服": "mens-business-suit.webp",
    "女士商务西服": "womens-business-suit.webp",
    "男女团体商务西服": "corporate-business-suit-team.webp",
}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for source_path in sorted(SOURCE_DIR.glob("*.png")):
        id_match = re.search(r"(\d{12,13})", source_path.stem)
        output_name = OUTPUT_NAMES_BY_ID.get(id_match.group(1)) if id_match else None

        if not output_name:
            output_name = next(
                (
                    output
                    for label, output in OUTPUT_NAMES_BY_LABEL.items()
                    if label in source_path.stem
                ),
                None,
            )

        if not output_name:
            continue

        with Image.open(source_path) as source_image:
            image = source_image.convert("RGB")
            image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
            image.save(
                OUTPUT_DIR / output_name,
                "WEBP",
                quality=82,
                method=6,
            )

    logo_output = ROOT / "assets" / "site" / "logo-mark-160.webp"
    with Image.open(ROOT / "logo.png") as source_logo:
        logo = source_logo.convert("RGB")
        logo.thumbnail((160, 160), Image.Resampling.LANCZOS)
        logo.save(logo_output, "WEBP", quality=88, method=6)


if __name__ == "__main__":
    main()
