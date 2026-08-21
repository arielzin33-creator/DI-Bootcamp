from rest_framework import status
from rest_framework.test import APITestCase

from memes.models import Rating

from .factories import make_meme, make_user


class RateMemeApiTests(APITestCase):
    def setUp(self):
        self.meme = make_meme()
        self.user = make_user()

    def test_unauthenticated_user_cannot_rate(self):
        response = self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 5})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_first_rating_creates_and_returns_201(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 4})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rating.objects.count(), 1)
        self.assertEqual(Rating.objects.get().score, 4)

    def test_rating_again_updates_in_place_rather_than_duplicating(self):
        self.client.force_authenticate(self.user)
        self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 2})

        response = self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 5})

        self.assertEqual(response.status_code, status.HTTP_200_OK)  # updated, not created
        self.assertEqual(Rating.objects.count(), 1)  # still exactly one row
        self.assertEqual(Rating.objects.get().score, 5)  # holding the NEW value

    def test_two_different_users_can_each_rate_the_same_meme(self):
        other_user = make_user(username="carol")
        self.client.force_authenticate(self.user)
        self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 3})

        self.client.force_authenticate(other_user)
        response = self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 5})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rating.objects.count(), 2)

    def test_score_of_zero_is_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 0})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_score_of_six_is_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 6})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_score_is_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(f"/api/memes/{self.meme.pk}/rate/", {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rating_a_nonexistent_meme_returns_404(self):
        self.client.force_authenticate(self.user)
        response = self.client.post("/api/memes/999999/rate/", {"score": 5})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieved_meme_reflects_its_average_rating_after_rating(self):
        self.client.force_authenticate(self.user)
        self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 4})
        other_user = make_user(username="dave")
        self.client.force_authenticate(other_user)
        self.client.post(f"/api/memes/{self.meme.pk}/rate/", {"score": 2})

        response = self.client.get(f"/api/memes/{self.meme.pk}/")

        self.assertEqual(response.data["average_rating"], 3.0)
        self.assertEqual(response.data["ratings_count"], 2)
