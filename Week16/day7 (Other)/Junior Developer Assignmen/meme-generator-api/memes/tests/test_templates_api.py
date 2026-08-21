from rest_framework import status
from rest_framework.test import APITestCase

from .factories import make_template, make_user


class TemplateListApiTests(APITestCase):
    def test_list_templates_is_public(self):
        make_template(name="Drake")
        make_template(name="Distracted Boyfriend")

        response = self.client.get("/api/templates/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {t["name"] for t in response.data["results"]}
        self.assertEqual(names, {"Drake", "Distracted Boyfriend"})

    def test_retrieve_single_template(self):
        template = make_template(name="Two Buttons")

        response = self.client.get(f"/api/templates/{template.pk}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Two Buttons")

    def test_templates_endpoint_is_read_only(self):
        """The brief only asks for GET /api/templates/ — POST should not be a
        supported way to create templates through the public API. Authenticate
        first so this actually exercises "method not allowed" rather than just
        re-proving the separate, already-covered "write needs auth" rule."""
        self.client.force_authenticate(make_user())

        response = self.client.post(
            "/api/templates/",
            {"name": "Hacked In", "image_url": "https://example.com/x.jpg"},
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
