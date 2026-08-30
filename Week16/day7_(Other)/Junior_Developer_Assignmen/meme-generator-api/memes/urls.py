from rest_framework.routers import DefaultRouter

from .views import MemeTemplateViewSet, MemeViewSet

router = DefaultRouter()
router.register("templates", MemeTemplateViewSet, basename="template")
router.register("memes", MemeViewSet, basename="meme")

urlpatterns = router.urls
