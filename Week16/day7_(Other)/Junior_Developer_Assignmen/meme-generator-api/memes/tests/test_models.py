from django.db import IntegrityError, transaction
from django.test import TestCase

from .factories import make_meme, make_rating, make_template, make_user


class MemeTemplateModelTests(TestCase):
    def test_str_returns_name(self):
        template = make_template(name="Distracted Boyfriend")
        self.assertEqual(str(template), "Distracted Boyfriend")


class MemeModelTests(TestCase):
    def test_str_includes_template_and_texts(self):
        template = make_template(name="Drake")
        meme = make_meme(template=template, top_text="Old way", bottom_text="New way")
        self.assertEqual(str(meme), "Drake: Old way / New way")

    def test_default_ordering_is_newest_first(self):
        older = make_meme()
        newer = make_meme(template=older.template, created_by=older.created_by)
        memes = list(type(older).objects.all())
        self.assertEqual(memes[0].pk, newer.pk)
        self.assertEqual(memes[1].pk, older.pk)


class RatingModelTests(TestCase):
    def test_str_includes_user_and_score(self):
        rating = make_rating(score=4)
        self.assertIn(str(rating.score), str(rating))

    def test_a_user_can_only_have_one_rating_per_meme_at_the_db_level(self):
        """The unique_together constraint is what actually enforces 'a user can only
        rate a meme once' — this test proves that guarantee holds even if some future
        code path bypasses the API view entirely (e.g. a data migration, a management
        command, direct ORM use) and tries to create a second Rating row directly."""
        meme = make_meme()
        user = make_user()
        make_rating(meme=meme, user=user, score=3)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                make_rating(meme=meme, user=user, score=5)

    def test_score_choices_are_1_through_5(self):
        from memes.models import Rating

        self.assertEqual(
            [choice[0] for choice in Rating._meta.get_field("score").choices],
            [1, 2, 3, 4, 5],
        )
