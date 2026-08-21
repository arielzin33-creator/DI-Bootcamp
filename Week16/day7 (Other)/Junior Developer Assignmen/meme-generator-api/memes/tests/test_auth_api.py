from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .factories import make_meme, make_template, make_user


class TokenAuthTests(APITestCase):
    def setUp(self):
        self.user = make_user(username="alice", password="testpass123")

    def test_obtaining_a_token_with_valid_credentials(self):
        response = self.client.post(
            "/api/auth-token/", {"username": "alice", "password": "testpass123"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["token"], Token.objects.get(user=self.user).key)

    def test_obtaining_a_token_with_wrong_password_fails(self):
        response = self.client.post(
            "/api/auth-token/", {"username": "alice", "password": "wrong-password"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_the_returned_token_actually_authenticates_a_real_request(self):
        """Exercises the real TokenAuthentication code path end-to-end — via the
        Authorization header exactly as a real client would send it — rather than
        DRF test client's force_authenticate() shortcut used elsewhere, which
        bypasses the authentication backend entirely."""
        token_response = self.client.post(
            "/api/auth-token/", {"username": "alice", "password": "testpass123"}
        )
        token = token_response.data["token"]
        template = make_template()

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        response = self.client.post("/api/memes/", {"template": template.pk, "top_text": "Hi"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_a_bogus_token_is_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token not-a-real-token")
        template = make_template()

        response = self.client.post("/api/memes/", {"template": template.pk, "top_text": "Hi"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class SchemaSmokeTests(APITestCase):
    """Not exhaustive schema validation — just confirms the Swagger/OpenAPI wiring
    (drf-spectacular) doesn't crash trying to introspect the actual views/serializers
    in this project, which is the failure mode that actually matters here (a typo'd
    schema decorator or an unintrospectable field silently breaking /api/docs/)."""

    def test_openapi_schema_endpoint_returns_200(self):
        response = self.client.get("/api/schema/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_swagger_ui_page_returns_200(self):
        response = self.client.get("/api/docs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
