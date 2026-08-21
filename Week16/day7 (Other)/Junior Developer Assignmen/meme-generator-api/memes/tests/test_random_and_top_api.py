from rest_framework import status
from rest_framework.test import APITestCase

from .factories import make_meme, make_rating, make_template, make_user


class RandomMemeApiTests(APITestCase):
    def test_random_on_empty_database_returns_404_with_a_clear_message(self):
        """This is also a regression test for a URL-routing hazard: MemeViewSet's
        detail route uses lookup_value_regex = '[0-9]+' specifically so a request for
        /api/memes/random/ can never be mistaken for a detail lookup with pk='random'.
        If that regex were ever removed or loosened, this request could instead 404
        with DRF's generic "Not found." message from a failed pk lookup, rather than
        this view's own "No memes available." — asserting the exact message is what
        actually proves the /random/ action ran, not just that *some* 404 came back.
        """
        response = self.client.get("/api/memes/random/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "No memes available.")

    def test_random_returns_one_existing_meme(self):
        template = make_template()
        user = make_user()
        meme_ids = {make_meme(template=template, created_by=user).pk for _ in range(5)}

        response = self.client.get("/api/memes/random/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(response.data["id"], meme_ids)

    def test_random_does_not_require_authentication(self):
        make_meme()
        response = self.client.get("/api/memes/random/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TopMemesApiTests(APITestCase):
    def test_top_excludes_memes_with_no_ratings(self):
        make_meme(top_text="Unrated")  # never rated -> should not appear at all
        rated = make_meme(top_text="Rated")
        make_rating(meme=rated, score=5)

        response = self.client.get("/api/memes/top/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["top_text"], "Rated")

    def test_top_orders_by_average_rating_descending(self):
        template = make_template()
        user = make_user()

        low = make_meme(template=template, created_by=user, top_text="Low")
        make_rating(meme=low, score=2)

        high = make_meme(template=template, created_by=user, top_text="High")
        make_rating(meme=high, score=5)

        mid = make_meme(template=template, created_by=user, top_text="Mid")
        make_rating(meme=mid, score=3)

        response = self.client.get("/api/memes/top/")

        top_texts = [item["top_text"] for item in response.data]
        self.assertEqual(top_texts, ["High", "Mid", "Low"])

    def test_top_averages_multiple_ratings_correctly(self):
        meme = make_meme()
        make_rating(meme=meme, user=make_user(username="u1"), score=1)
        make_rating(meme=meme, user=make_user(username="u2"), score=5)
        # average = 3.0

        response = self.client.get("/api/memes/top/")

        self.assertEqual(response.data[0]["average_rating"], 3.0)

    def test_top_returns_at_most_10(self):
        template = make_template()
        user = make_user()
        for i in range(15):
            meme = make_meme(template=template, created_by=user, top_text=f"Meme {i}")
            make_rating(meme=meme, user=make_user(username=f"rater{i}"), score=(i % 5) + 1)

        response = self.client.get("/api/memes/top/")

        self.assertEqual(len(response.data), 10)

    def test_top_does_not_require_authentication(self):
        meme = make_meme()
        make_rating(meme=meme)
        response = self.client.get("/api/memes/top/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
