from typing import Optional

from django.db.models import Avg
from rest_framework import serializers

from .models import Meme, MemeTemplate, Rating


class MemeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemeTemplate
        fields = ["id", "name", "image_url", "default_top_text", "default_bottom_text"]


class RatingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Rating
        fields = ["id", "meme", "user", "score", "created_at"]
        read_only_fields = ["id", "meme", "user", "created_at"]


class RateActionSerializer(serializers.Serializer):
    """Input-only serializer for POST /api/memes/<id>/rate/ — just validates the
    score; the actual create-or-update logic lives in the view, since it needs the
    request's meme and user."""

    score = serializers.IntegerField(min_value=1, max_value=5)


class MemeSerializer(serializers.ModelSerializer):
    template = serializers.PrimaryKeyRelatedField(queryset=MemeTemplate.objects.all())
    template_name = serializers.CharField(source="template.name", read_only=True)
    created_by = serializers.ReadOnlyField(source="created_by.username")
    average_rating = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()

    class Meta:
        model = Meme
        fields = [
            "id",
            "template",
            "template_name",
            "top_text",
            "bottom_text",
            "created_by",
            "created_at",
            "average_rating",
            "ratings_count",
        ]
        read_only_fields = ["id", "created_by", "created_at"]

    def get_average_rating(self, obj) -> Optional[float]:
        # `top` and `list` views annotate the queryset with `avg_rating` for
        # efficiency (one query for the whole page instead of one extra query per
        # object) — used when present. Falls back to a per-object query so this
        # serializer still works correctly (just less efficiently) for a queryset
        # that wasn't annotated, e.g. the single-object `retrieve` view.
        if hasattr(obj, "avg_rating"):
            return round(obj.avg_rating, 2) if obj.avg_rating is not None else None
        agg = obj.ratings.aggregate(avg=Avg("score"))["avg"]
        return round(agg, 2) if agg is not None else None

    def get_ratings_count(self, obj) -> int:
        if hasattr(obj, "ratings_count_annotated"):
            return obj.ratings_count_annotated
        return obj.ratings.count()

    def create(self, validated_data):
        # Business rule: an omitted (or blank) top_text/bottom_text falls back to the
        # template's default text. Both blank=True on the model AND explicit `.get()`
        # handling here matter — blank=True is what makes DRF treat the fields as
        # optional in the first place; the `or` fallback is what supplies the actual
        # default value once DRF lets an empty/missing value through.
        template = validated_data["template"]
        validated_data["top_text"] = validated_data.get("top_text") or template.default_top_text
        validated_data["bottom_text"] = (
            validated_data.get("bottom_text") or template.default_bottom_text
        )
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
