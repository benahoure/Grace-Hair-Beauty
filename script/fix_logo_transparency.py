from PIL import Image
from pathlib import Path
import argparse

INPUTS = {
    "logo-primary-transparent.png": "logo-primary-transparent.webp",
    "logo-light.png": "logo-light.webp",
    "logo-mark.png": "logo-mark.webp",
}

SOURCE_DIR = Path("script/brand-source")
OUTPUT_DIR = Path("apps/web/public/brand")
HERO_DIR = Path("apps/web/public/hero")
HERO_VARIANTS = ("desktop", "mobile")
HERO_FILES = tuple(f"hero-{index}" for index in range(1, 6))


def is_checker_pixel(r, g, b):
    return (
        abs(r - g) < 8
        and abs(g - b) < 8
        and r > 210
        and g > 210
        and b > 210
    )


def make_transparent(input_path: Path, output_path: Path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()

    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]

            if is_checker_pixel(r, g, b):
                pixels[x, y] = (255, 255, 255, 0)

    img.save(output_path, "WEBP", quality=95, method=6)
    print(f"Saved: {output_path}")


def convert_to_webp(input_path: Path, output_path: Path, quality: int = 92):
    img = Image.open(input_path)
    if img.mode in {"RGBA", "LA"}:
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")
    img.save(output_path, "WEBP", quality=quality, method=6)
    print(f"Saved: {output_path}")


def convert_logos():
    for source, target in INPUTS.items():
        source_path = SOURCE_DIR / source
        target_path = OUTPUT_DIR / target

        if source_path.exists():
            make_transparent(source_path, target_path)
        else:
            print(f"Missing: {source_path}")


def convert_hero_assets():
    for variant in HERO_VARIANTS:
        for name in HERO_FILES:
            source_path = HERO_DIR / variant / f"{name}.png"
            target_path = HERO_DIR / variant / f"{name}.webp"

            if source_path.exists():
                convert_to_webp(source_path, target_path)
            else:
                print(f"Missing: {source_path}")


parser = argparse.ArgumentParser(description="Prepare Grace Hair Beauty image assets.")
parser.add_argument(
    "--hero-assets",
    action="store_true",
    help="Convert art-directed hero PNG assets to WEBP.",
)
args = parser.parse_args()

if args.hero_assets:
    convert_hero_assets()
else:
    convert_logos()
