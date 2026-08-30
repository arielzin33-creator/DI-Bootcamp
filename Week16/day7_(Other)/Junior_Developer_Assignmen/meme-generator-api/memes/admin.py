from django.contrib import admin

from .models import Meme, MemeTemplate, Rating


@admin.register(MemeTemplate)
class MemeTemplateAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "default_top_text", "default_bottom_text")
    search_fields = ("name",)


@admin.register(Meme)
class MemeAdmin(admin.ModelAdmin):
    list_display = ("id", "template", "top_text", "bottom_text", "created_by", "created_at")
    list_filter = ("template",)
    search_fields = ("top_text", "bottom_text")


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("id", "meme", "user", "score", "created_at")
    list_filter = ("score",)
