"""Bonus feature: render a meme's top/bottom text onto its template image with
Pillow, and save the result under MEDIA_ROOT so it's servable as a normal URL.
"""

from io import BytesIO
from pathlib import Path

import requests
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont


class MemeImageGenerationError(Exception):
    """Raised when the template image can't be fetched or processed. Kept as its own
    exception type (rather than letting requests/PIL exceptions bubble up raw) so the
    view has one thing to catch and turn into a clean 502, instead of needing to know
    about every possible underlying library's exception classes."""


def _load_font(size):
    # ImageFont.load_default(size=...) only accepts a size argument from Pillow 10.1+;
    # older Pillow silently ignores it. Falling back to the truly-default (fixed,
    # small) bitmap font keeps this working across Pillow versions rather than
    # crashing outright if a bundled TTF isn't available in the container.
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def _draw_caption(draw, image_size, text, font, y):
    if not text:
        return
    width, _height = image_size
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=2)
    text_width = bbox[2] - bbox[0]
    x = max((width - text_width) // 2, 0)
    draw.text(
        (x, y),
        text,
        font=font,
        fill="white",
        stroke_width=2,
        stroke_fill="black",
    )


def generate_meme_image(meme):
    """Fetch the meme's template image, overlay top/bottom text, save it under
    MEDIA_ROOT/generated/, and return the path relative to MEDIA_ROOT.
    """
    try:
        response = requests.get(meme.template.image_url, timeout=10)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content)).convert("RGB")
    except requests.RequestException as exc:
        raise MemeImageGenerationError(
            f"Could not fetch template image: {exc}"
        ) from exc
    except Exception as exc:  # Pillow raises its own errors for a non-image response
        raise MemeImageGenerationError(f"Could not process template image: {exc}") from exc

    draw = ImageDraw.Draw(image)
    font_size = max(image.width // 12, 18)
    font = _load_font(font_size)

    _draw_caption(draw, image.size, meme.top_text, font, y=10)
    bottom_bbox = draw.textbbox((0, 0), meme.bottom_text or "", font=font, stroke_width=2)
    bottom_text_height = bottom_bbox[3] - bottom_bbox[1]
    _draw_caption(
        draw, image.size, meme.bottom_text, font, y=image.height - bottom_text_height - 20
    )

    output_dir = Path(settings.MEDIA_ROOT) / "generated"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"meme_{meme.id}.png"
    image.save(output_path, format="PNG")

    return f"generated/meme_{meme.id}.png"
