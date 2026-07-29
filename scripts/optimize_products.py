from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "products"
OUTPUT_DIR = ROOT / "assets" / "products"
MAX_SIZE = (1100, 1100)

OUTPUT_NAMES = {
    "01_": "custom-cooling-t-shirt.webp",
    "02_": "spring-autumn-workwear-set.webp",
    "03_": "cotton-business-polo.webp",
    "04_": "custom-team-hoodie.webp",
    "05_": "business-long-sleeve-shirts.webp",
    "06_": "mens-business-trousers.webp",
    "07_": "three-in-one-outdoor-jacket.webp",
    "08_": "quick-dry-corporate-polo.webp",
    "09_": "quick-dry-logo-t-shirt.webp",
    "10_": "lightweight-sun-protection-jacket.webp",
    "11_": "summer-short-sleeve-workwear-set.webp",
    "12_": "school-sports-uniform-set.webp",
    "13_": "colorblock-varsity-jacket.webp",
    "14_": "mens-business-suit.webp",
    "15_": "womens-business-suit.webp",
    "16_": "corporate-business-suit-team.webp",
}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for source_path in sorted(SOURCE_DIR.glob("*.png")):
        output_name = OUTPUT_NAMES.get(source_path.name[:3])
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
