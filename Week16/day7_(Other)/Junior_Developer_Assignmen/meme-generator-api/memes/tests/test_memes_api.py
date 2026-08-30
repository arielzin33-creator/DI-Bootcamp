from rest_framework import status
from rest_framework.test import APITestCase

from memes.models import Meme

from .factories import make_meme, make_template, make_user


class MemeListApiTests(APITestCase):
    def test_list_memes_is_public(self):
        make_meme()
        make_meme()

        response = self.client.get("/api/memes/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_list_is_paginated(self):
        template = make_template()
        user = make_user()
        for i in range(15):
            make_meme(template=template, created_by=user, top_text=f"Meme {i}")

        response = self.client.get("/api/memes/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("next", response.data)
        self.assertEqual(len(response.data["results"]), 10)  # PAGE_SIZE from settings
        self.assertEqual(response.data["count"], 15)


class MemeRetrieveApiTests(APITestCase):
    def test_retrieve_includes_average_rating_and_count(self):
        meme = make_meme()

        response = self.client.get(f"/api/memes/{meme.pk}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["average_rating"])  # no ratings yet
        self.assertEqual(response.data["ratings_count"], 0)

    def test_retrieve_nonexistent_meme_returns_404(self):
        response = self.client.get("/api/memes/999999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class MemeCreateApiTests(APITestCase):
    def setUp(self):
        self.template = make_template(
            default_top_text="Default Top", default_bottom_text="Default Bottom"
        )
        self.user = make_user()

    def test_unauthenticated_user_cannot_create_a_meme(self):
        response = self.client.post(
            "/api/memes/", {"template": self.template.pk, "top_text": "Hi"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Meme.objects.count(), 0)

    def test_authenticated_user_can_create_a_meme_with_explicit_text(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            "/api/memes/",
            {"template": self.template.pk, "top_text": "Custom Top", "bottom_text": "Custom Bottom"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        meme = Meme.objects.get(pk=response.data["id"])
        self.assertEqual(meme.top_text, "Custom Top")
        self.assertEqual(meme.bottom_text, "Custom Bottom")
        self.assertEqual(meme.created_by, self.user)

    def test_omitted_top_and_bottom_text_fall_back_to_template_defaults(self):
        self.client.force_authenticate(self.user)

        response = self.client.post("/api/memes/", {"template": self.template.pk})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        meme = Meme.objects.get(pk=response.data["id"])
        self.assertEqual(meme.top_text, "Default Top")
        self.assertEqual(meme.bottom_text, "Default Bottom")

    def test_blank_string_top_text_also_falls_back_to_default(self):
        """An explicitly-sent empty string is a different wire value than an omitted
        key — both are supposed to trigger the same fallback behavior."""
        self.client.force_authenticate(self.user)

        response = self.client.post(
            "/api/memes/", {"template": self.template.pk, "top_text": "", "bottom_text": ""}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        meme = Meme.objects.get(pk=response.data["id"])
        self.assertEqual(meme.top_text, "Default Top")
        self.assertEqual(meme.bottom_text, "Default Bottom")

    def test_partial_text_only_falls_back_for_the_omitted_field(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            "/api/memes/", {"template": self.template.pk, "top_text": "Only Top Set"}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        meme = Meme.objects.get(pk=response.data["id"])
        self.assertEqual(meme.top_text, "Only Top Set")
        self.assertEqual(meme.bottom_text, "Default Bottom")

    def test_creating_with_a_nonexistent_template_fails_validation(self):
        self.client.force_authenticate(self.user)

        response = self.client.post("/api/memes/", {"template": 999999, "top_text": "Hi"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
