from django.contrib.auth.models import User
from django.db import models


class MemeTemplate(models.Model):
    """A reusable base image (e.g. 'Drake', 'Distracted Boyfriend') that memes are
    generated from."""

    name = models.CharField(max_length=100)
    image_url = models.URLField()
    default_top_text = models.CharField(max_length=100, blank=True)
    default_bottom_text = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Meme(models.Model):
    """A concrete meme: a template with specific top/bottom text, created by a user."""

    template = models.ForeignKey(
        MemeTemplate, on_delete=models.CASCADE, related_name="memes"
    )
    top_text = models.CharField(max_length=100, blank=True)
    bottom_text = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"{self.template.name}: {self.top_text} / {self.bottom_text}"


class Rating(models.Model):
    """A single user's 1-5 score for a meme. `unique_together` is what makes 'a user
    can only rate a meme once' an actual database-enforced guarantee rather than just
    an application-level convention that a bug (or a second, less careful client)
    could quietly violate."""

    meme = models.ForeignKey(Meme, on_delete=models.CASCADE, related_name="ratings")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ratings")
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("meme", "user")

    def __str__(self):
        return f"{self.user} rated {self.meme_id}: {self.score}"
