from io import BytesIO
from unittest.mock import Mock, patch

from django.test import override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from memes.models import Meme

from .factories import make_meme, make_template, make_user


def _fake_jpeg_bytes(width=200, height=200):
    buffer = BytesIO()
    Image.new("RGB", (width, height), color="blue").save(buffer, format="JPEG")
    return buffer.getvalue()


class SurpriseMeApiTests(APITestCase):
    def setUp(self):
        self.template = make_template()
        self.user = make_user()

    def test_unauthenticated_user_cannot_use_surprise_me(self):
        response = self.client.get("/api/memes/surprise-me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_surprise_me_creates_a_real_meme_with_random_phrases(self):
        self.client.force_authenticate(self.user)

        response = self.client.get("/api/memes/surprise-me/")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        meme = Meme.objects.get(pk=response.data["id"])
        self.assertEqual(meme.created_by, self.user)
        self.assertTrue(meme.top_text)  # a phrase was actually chosen, not left blank
        self.assertTrue(meme.bottom_text)

    def test_surprise_me_with_no_templates_returns_404(self):
        self.template.delete()
        self.client.force_authenticate(self.user)

        response = self.client.get("/api/memes/surprise-me/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


@override_settings(MEDIA_ROOT="/tmp/meme_generator_test_media")
class GeneratedImageApiTests(APITestCase):
    def setUp(self):
        self.meme = make_meme()

    @patch("memes.services.requests.get")
    def test_generates_and_returns_an_image_url(self, mock_get):
        # The template's real image_url is never actually fetched over the network in
        # tests — requests.get is mocked to hand back a real, valid in-memory JPEG, so
        # this test is deterministic and doesn't depend on an external host being up.
        mock_response = Mock()
        mock_response.content = _fake_jpeg_bytes()
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        response = self.client.get(f"/api/memes/{self.meme.pk}/image/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("image_url", response.data)
        self.assertTrue(response.data["image_url"].endswith(f"meme_{self.meme.pk}.png"))

    @patch("memes.services.requests.get")
    def test_network_failure_fetching_template_returns_502_not_a_crash(self, mock_get):
        import requests

        mock_get.side_effect = requests.ConnectionError("simulated network failure")

        response = self.client.get(f"/api/memes/{self.meme.pk}/image/")

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertIn("detail", response.data)

    @patch("memes.services.requests.get")
    def test_generated_file_actually_gets_written_to_disk(self, mock_get):
        import os

        mock_response = Mock()
        mock_response.content = _fake_jpeg_bytes()
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        self.client.get(f"/api/memes/{self.meme.pk}/image/")

        from django.conf import settings

        expected_path = os.path.join(settings.MEDIA_ROOT, "generated", f"meme_{self.meme.pk}.png")
        self.assertTrue(os.path.exists(expected_path))
