import random

from django.db.models import Avg, Count
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.conf import settings

from .models import Meme, MemeTemplate, Rating
from .serializers import (
    MemeSerializer,
    MemeTemplateSerializer,
    RateActionSerializer,
    RatingSerializer,
)
from .services import MemeImageGenerationError, generate_meme_image


class MemeTemplateViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """GET /api/templates/ and GET /api/templates/<id>/ — templates are seed/admin
    data, not something the API is asked to let regular users create or edit."""

    queryset = MemeTemplate.objects.all()
    serializer_class = MemeTemplateSerializer


class MemeViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """GET/POST /api/memes/ and GET /api/memes/<id>/, plus the custom actions below.

    Only List/Create/Retrieve are exposed (not the full ModelViewSet's Update/Delete)
    because that's exactly what the brief asks for — no unadvertised PUT/PATCH/DELETE
    endpoints the brief and its tests never describe.

    `lookup_value_regex` restricts the detail route's <pk> to digits only. Without
    it, Django would try to match a request for one of the custom list actions below
    (e.g. GET /api/memes/random/) against the detail route's `<pk>` pattern too — both
    are technically valid URL shapes, and whichever route the router happens to
    register first would silently win, making the behavior order-dependent instead of
    just correct.
    """

    queryset = Meme.objects.select_related("template", "created_by").all()
    serializer_class = MemeSerializer
    lookup_value_regex = "[0-9]+"

    def get_queryset(self):
        # Annotated once per request for the whole page, not once per meme while
        # serializing — MemeSerializer.get_average_rating/get_ratings_count pick up
        # `avg_rating`/`ratings_count_annotated` directly off each object when
        # present, avoiding an N+1 query pattern across a list of memes.
        # Explicit order_by: annotating with Avg/Count triggers a GROUP BY, which
        # otherwise leaves Django's pagination unsure the result order is stable
        # across pages (UnorderedObjectListWarning) even though Meme.Meta already
        # declares -created_at as the default ordering.
        return (
            super()
            .get_queryset()
            .annotate(
                avg_rating=Avg("ratings__score"),
                ratings_count_annotated=Count("ratings"),
            )
            .order_by("-created_at")
        )

    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        """POST /api/memes/<id>/rate/  body: {"score": 1-5}

        A user can only have one Rating per meme (enforced at the DB level by
        Rating.Meta.unique_together), but they CAN update it — so this is a single
        atomic update_or_create rather than a plain create that would raise an
        IntegrityError on a repeat rating.
        """
        meme = self.get_object()
        input_serializer = RateActionSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        rating, created = Rating.objects.update_or_create(
            meme=meme,
            user=request.user,
            defaults={"score": input_serializer.validated_data["score"]},
        )

        output_serializer = RatingSerializer(rating)
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(output_serializer.data, status=response_status)

    @action(detail=False, methods=["get"])
    def random(self, request):
        """GET /api/memes/random/

        Deliberately NOT `Meme.objects.order_by('?').first()`. In Postgres,
        `ORDER BY RANDOM()` assigns every row a random sort key and then sorts the
        *entire table* before taking one row — an O(n log n) full-table operation
        that gets slower as the memes table grows, no matter how many rows you
        actually wanted.

        Instead: get the row COUNT (an index-only operation, cheap), pick a random
        offset in that range, and use SQL OFFSET/LIMIT to fetch exactly one row.
        Offset-based pagination has its own well-known weaknesses at very large
        offsets, but for a single random row it's a straightforward O(offset) skip
        with no sort — meaningfully cheaper than sorting the whole table for the
        99% case this API is built for.
        """
        count = self.get_queryset().count()
        if count == 0:
            return Response({"detail": "No memes available."}, status=status.HTTP_404_NOT_FOUND)

        random_offset = random.randint(0, count - 1)
        meme = self.get_queryset()[random_offset]
        serializer = self.get_serializer(meme)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def top(self, request):
        """GET /api/memes/top/ — the 10 memes with the highest average rating.

        Memes with zero ratings are excluded rather than sorted to the bottom: an
        unrated meme has no evidence it's "top" anything, and Avg() returns NULL for
        them, not 0, so an unfiltered ordering would put them in an arbitrary
        position relative to each other rather than meaningfully last.
        """
        queryset = self.get_queryset().filter(avg_rating__isnull=False).order_by(
            "-avg_rating", "-ratings_count_annotated"
        )[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get", "post"], url_path="surprise-me", permission_classes=[IsAuthenticated])
    def surprise_me(self, request):
        """GET or POST /api/memes/surprise-me/ (bonus) — creates and returns a new
        meme using a random template and two random phrases from
        settings.SURPRISE_PHRASES.

        Explicit IsAuthenticated override: this action writes on GET too (it always
        creates a Meme), so it can't rely on the viewset-wide IsAuthenticatedOrReadOnly,
        which treats GET as always-safe and would otherwise let an AnonymousUser reach
        the create() call below.

        `order_by('?')` is used here (unlike the /random/ meme endpoint above) because
        MemeTemplate is expected to be a small, admin-curated table — a handful to a
        few dozen rows — where a full sort is genuinely cheap. The efficiency concern
        that rules `order_by('?')` out for /random/ is specifically about the
        potentially-large Meme table, not about the technique itself.
        """
        template = MemeTemplate.objects.order_by("?").first()
        if template is None:
            return Response(
                {"detail": "No meme templates available."}, status=status.HTTP_404_NOT_FOUND
            )

        meme = Meme.objects.create(
            template=template,
            top_text=random.choice(settings.SURPRISE_PHRASES),
            bottom_text=random.choice(settings.SURPRISE_PHRASES),
            created_by=request.user,
        )
        serializer = self.get_serializer(meme)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="image")
    def image(self, request, pk=None):
        """GET /api/memes/<id>/image/ (bonus) — renders the meme's top/bottom text
        onto its template image with Pillow and returns the URL of the result."""
        meme = self.get_object()
        try:
            relative_path = generate_meme_image(meme)
        except MemeImageGenerationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        image_url = request.build_absolute_uri(settings.MEDIA_URL + relative_path)
        return Response({"image_url": image_url})
