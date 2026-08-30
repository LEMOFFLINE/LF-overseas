from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\LEMOFF\Desktop\steps")
OUTPUT = ROOT / "assets" / "steps"

STEP_FILES = {
    "Consulting design.jpg": "requirement-design.webp",
    "Sampling .jpg": "sampling-confirmation.webp",
    "Fabric cutting.jpg": "fabric-cutting.webp",
    "Embroidery.png": "printing-embroidery.webp",
    "sewing.jpg": "bulk-sewing.webp",
    "quality inspection.jpg": "quality-inspection.webp",
    "shipment.jpg": "packing-export.webp",
}
RESAMPLE = getattr(getattr(Image, "Resampling", Image), "LANCZOS")


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source_name, output_name in STEP_FILES.items():
        with Image.open(SOURCE / source_name) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail((1800, 1800), RESAMPLE)
            image = ImageEnhance.Contrast(image).enhance(1.03)
            image.save(OUTPUT / output_name, "WEBP", quality=82, method=6)
    print(f"Prepared {len(STEP_FILES)} process images in {OUTPUT}")


if __name__ == "__main__":
    main()
