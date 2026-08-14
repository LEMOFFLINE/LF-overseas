from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PRODUCT_SOURCE = Path(r"C:\Users\LEMOFF\Desktop\products\outputs\019fe676-3d47-7972-9bfb-efb0587f21e8\首批50款SKU文件夹归档\SKU图片")
REAL_SOURCE = Path(r"C:\Users\LEMOFF\Desktop\新建文件夹 (4)")
LOGO_SOURCE = Path(r"C:\Users\LEMOFF\xwechat_files\wxid_lqpqvm8l5wyq12_fe08\temp\RWTemp\2026-08\9e20f478899dc29eb19741386f9343c8\21a1b3fbdc90e258707fbe13725e7702.png")

PRODUCT_OUTPUT = ROOT / "assets" / "products"
REAL_OUTPUT = ROOT / "assets" / "operations"
BRAND_OUTPUT = ROOT / "assets" / "brand"

REAL_NAMES = [
    "office-meeting-space", "production-floor-overview-01", "sewing-line-overview-01",
    "garment-finishing-area", "automated-cutting-table", "sewing-floor-detail-01",
    "sample-showroom-01", "fabric-cutting-table", "sewing-station-detail-01",
    "fabric-spreading-machine", "specialized-sewing-machine", "sewing-floor-overview-02",
    "sample-showroom-02", "industrial-sewing-machine", "sample-garment-racks-01",
    "operator-sewing-detail", "pattern-and-cutting-table", "fabric-layer-preparation",
    "sewing-floor-detail-02", "sample-garment-racks-02", "production-floor-overview-02",
    "sample-showroom-03", "sewing-line-overview-02",
]


def save_webp(image: Image.Image, target: Path, quality=84):
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, "WEBP", quality=quality, method=6)


def prepare_product(source: Path, target: Path):
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (1280, 1280), (247, 248, 250))
        canvas.paste(image, ((1280 - image.width) // 2, (1280 - image.height) // 2))
        save_webp(canvas, target, 88)


def prepare_real(source: Path, target: Path):
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        image = ImageEnhance.Contrast(image).enhance(1.03)
        image = ImageEnhance.Color(image).enhance(0.98)
        save_webp(image, target, 82)


def remove_near_white(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            light = min(r, g, b)
            alpha = max(0, min(255, (255 - light) * 8))
            if light < 226:
                alpha = 255
            pixels[x, y] = (r, g, b, alpha)
    return rgba


def crop_alpha(image: Image.Image, padding=16) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return image
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(image.width, bbox[2] + padding)
    bottom = min(image.height, bbox[3] + padding)
    return image.crop((left, top, right, bottom))


def prepare_brand():
    with Image.open(LOGO_SOURCE) as image:
        transparent = crop_alpha(remove_near_white(image), 12)
        transparent.save(BRAND_OUTPUT / "lingfeng-logo.png", optimize=True)
        transparent.thumbnail((1200, 320), Image.Resampling.LANCZOS)
        save_webp(transparent, BRAND_OUTPUT / "lingfeng-logo.webp", 92)

        mark = remove_near_white(image.crop((0, 0, 400, image.height)))
        mark = crop_alpha(mark, 8)
        mark.save(BRAND_OUTPUT / "lf-mark.png", optimize=True)

        icon = Image.new("RGBA", (512, 512), (255, 255, 255, 0))
        mark_copy = mark.copy()
        mark_copy.thumbnail((420, 420), Image.Resampling.LANCZOS)
        icon.paste(mark_copy, ((512 - mark_copy.width) // 2, (512 - mark_copy.height) // 2), mark_copy)
        icon.save(BRAND_OUTPUT / "lf-icon-512.png", optimize=True)
        icon.resize((192, 192), Image.Resampling.LANCZOS).save(BRAND_OUTPUT / "lf-icon-192.png", optimize=True)
        icon.resize((48, 48), Image.Resampling.LANCZOS).save(BRAND_OUTPUT / "lf-icon-48.png", optimize=True)
        icon.resize((180, 180), Image.Resampling.LANCZOS).save(BRAND_OUTPUT / "apple-touch-icon.png", optimize=True)


def main():
    PRODUCT_OUTPUT.mkdir(parents=True, exist_ok=True)
    REAL_OUTPUT.mkdir(parents=True, exist_ok=True)
    BRAND_OUTPUT.mkdir(parents=True, exist_ok=True)

    for source in sorted(PRODUCT_SOURCE.rglob("*.png")):
        sku, view = source.stem.rsplit("-", 1)
        target_name = {"front": "front.webp", "back": "back.webp", "in": "inner.webp"}[view]
        prepare_product(source, PRODUCT_OUTPUT / sku.lower() / target_name)

    real_files = sorted(REAL_SOURCE.glob("*.jpg"))
    if len(real_files) != len(REAL_NAMES):
        raise RuntimeError(f"Expected {len(REAL_NAMES)} real photos, found {len(real_files)}")
    for source, name in zip(real_files, REAL_NAMES):
        prepare_real(source, REAL_OUTPUT / f"{name}.webp")

    prepare_brand()
    print(f"Prepared {len(list(PRODUCT_SOURCE.rglob('*.png')))} product images, {len(real_files)} real photos and the new brand assets.")


if __name__ == "__main__":
    main()
