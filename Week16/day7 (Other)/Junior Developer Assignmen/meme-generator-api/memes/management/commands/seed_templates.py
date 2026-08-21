from django.core.management.base import BaseCommand

from memes.models import MemeTemplate

# A handful of well-known, stable meme template images (imgflip's public template
# CDN — the same source the site itself serves these from) so the API has real,
# working `image_url` values to demo the /rate/, /random/, /top/, and the bonus
# /image/ (Pillow rendering) endpoints against, without requiring manual setup.
SEED_TEMPLATES = [
    {
        "name": "Drake Hotline Bling",
        "image_url": "https://i.imgflip.com/30b1gx.jpg",
        "default_top_text": "Doing it the hard way",
        "default_bottom_text": "Doing it the easy way",
    },
    {
        "name": "Distracted Boyfriend",
        "image_url": "https://i.imgflip.com/1ur9b0.jpg",
        "default_top_text": "Me",
        "default_bottom_text": "New shiny framework",
    },
    {
        "name": "Two Buttons",
        "image_url": "https://i.imgflip.com/1g8my4.jpg",
        "default_top_text": "Write tests",
        "default_bottom_text": "Ship it now",
    },
    {
        "name": "Change My Mind",
        "image_url": "https://i.imgflip.com/24y43o.jpg",
        "default_top_text": "This meme API is pretty solid",
        "default_bottom_text": "",
    },
    {
        "name": "Expanding Brain",
        "image_url": "https://i.imgflip.com/1jwhww.jpg",
        "default_top_text": "print debugging",
        "default_bottom_text": "a real debugger",
    },
]


class Command(BaseCommand):
    help = "Seed the database with a handful of starter MemeTemplates."

    def handle(self, *args, **options):
        created_count = 0
        for template_data in SEED_TEMPLATES:
            _template, created = MemeTemplate.objects.get_or_create(
                name=template_data["name"], defaults=template_data
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {created_count} new template(s); "
                f"{len(SEED_TEMPLATES) - created_count} already existed."
            )
        )
