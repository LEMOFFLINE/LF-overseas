from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_FOLDERS = [ROOT / "assets" / "cases", ROOT / "assets" / "capabilities"]
QUALITY = 82


def main():
    converted = 0
    original_bytes = 0
    optimized_bytes = 0

    for folder in SOURCE_FOLDERS:
        for source in sorted(folder.glob("*.png")):
            target = source.with_suffix(".webp")
            with Image.open(source) as image:
                image = ImageOps.exif_transpose(image).convert("RGB")
                image.save(target, "WEBP", quality=QUALITY, method=6)
            converted += 1
            original_bytes += source.stat().st_size
            optimized_bytes += target.stat().st_size

    saved_percent = 0 if not original_bytes else round((1 - optimized_bytes / original_bytes) * 100)
    print(
        f"Converted {converted} PNG assets to WebP: "
        f"{original_bytes / 1024 / 1024:.2f} MB -> "
        f"{optimized_bytes / 1024 / 1024:.2f} MB ({saved_percent}% smaller)."
    )


if __name__ == "__main__":
    main()
