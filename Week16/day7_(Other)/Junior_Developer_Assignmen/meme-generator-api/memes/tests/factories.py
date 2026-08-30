"""Small, dependency-free test helpers (no factory_boy) — enough object-creation
boilerplate is shared across the test modules that it's worth centralizing, but the
project doesn't otherwise need an extra dependency just for this."""

import itertools

from django.contrib.auth.models import User

from memes.models import Meme, MemeTemplate, Rating

# Auto-incrementing so that two calls with no explicit name/username (e.g. two
# make_meme() calls in the same test, each implicitly creating its own user and
# template) never collide on a unique constraint. Tests that care about a specific
# name/username still pass one explicitly.
_user_counter = itertools.count(1)
_template_counter = itertools.count(1)


def make_user(username=None, password="testpass123"):
    if username is None:
        username = f"user{next(_user_counter)}"
    return User.objects.create_user(username=username, password=password)


def make_template(
    name=None,
    image_url="https://example.com/drake.jpg",
    default_top_text="Old way",
    default_bottom_text="New way",
):
    if name is None:
        name = f"Template {next(_template_counter)}"
    return MemeTemplate.objects.create(
        name=name,
        image_url=image_url,
        default_top_text=default_top_text,
        default_bottom_text=default_bottom_text,
    )


def make_meme(template=None, top_text="Top", bottom_text="Bottom", created_by=None):
    template = template or make_template()
    created_by = created_by or make_user()
    return Meme.objects.create(
        template=template, top_text=top_text, bottom_text=bottom_text, created_by=created_by
    )


def make_rating(meme=None, user=None, score=5):
    meme = meme or make_meme()
    user = user or make_user()
    return Rating.objects.create(meme=meme, user=user, score=score)
