from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\LEMOFF\Desktop\Capability")
OUTPUT = ROOT / "assets" / "capabilities"
RESAMPLE = getattr(getattr(Image, "Resampling", Image), "LANCZOS")

FILES = {
    "OEMODM.jpg": "home-oem-odm.webp",
    "customization.jpg": "home-apparel-range.webp",
    "fabric color card.jpg": "home-fabrics-colours.webp",
    "embroidery.png": "home-embroidery-branding.webp",
    "packaging.png": "home-custom-packaging.webp",
    "bags.jpg": "home-related-products.webp",
}


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source_name, target_name in FILES.items():
        source = SOURCE / source_name
        if not source.is_file():
            raise FileNotFoundError(source)
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail((1800, 1800), RESAMPLE)
            image.save(OUTPUT / target_name, "WEBP", quality=82, method=6)
    print(f"Prepared {len(FILES)} homepage capability images in {OUTPUT}.")


if __name__ == "__main__":
    main()
