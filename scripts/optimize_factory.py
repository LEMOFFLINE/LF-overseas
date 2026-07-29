from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "factory"
OUTPUT = ROOT / "assets" / "factory"

FILES = {
    "ChatGPT Image 2026年7月28日 19_42_04 (1).png": "sewing-workshop-blue-shirts.webp",
    "ChatGPT Image 2026年7月28日 19_42_05 (2).png": "active-sewing-floor.webp",
    "ChatGPT Image 2026年7月28日 19_42_06 (3).png": "apparel-production-floor.webp",
    "ChatGPT Image 2026年7月28日 19_42_06 (4).png": "business-suits-finishing-line.webp",
    "ChatGPT Image 2026年7月28日 19_42_07 (5).png": "finished-suits-protected-storage.webp",
    "ChatGPT Image 2026年7月28日 19_42_07 (6).png": "garment-storage-racks.webp",
}


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for source_name, output_name in FILES.items():
        source_path = SOURCE / source_name
        output_path = OUTPUT / output_name

        with Image.open(source_path) as image:
            image = image.convert("RGB")
            image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
            image.save(output_path, "WEBP", quality=84, method=6)
            print(f"{output_name}: {image.width}x{image.height}")


if __name__ == "__main__":
    main()
