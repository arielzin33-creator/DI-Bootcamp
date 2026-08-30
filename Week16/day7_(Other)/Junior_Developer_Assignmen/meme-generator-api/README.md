# Meme Generator API

A Django REST Framework backend for creating, rating, and browsing memes built
from a fixed set of templates. Built for the "Junior Python Backend Developer"
assignment.

## Project overview

- **Stack:** Django 5, Django REST Framework, PostgreSQL, token authentication.
- **Models:** `MemeTemplate`, `Meme`, `Rating` (plus Django's built-in `User`).
- **Business rules implemented:**
  - Creating a meme without `top_text`/`bottom_text` (or with them blank)
    falls back to the template's `default_top_text` / `default_bottom_text`.
  - A user can rate a given meme only once; rating it again updates the
    existing score instead of creating a duplicate row (enforced at the DB
    level via a `unique_together` constraint on `(meme, user)`).
  - `GET /api/memes/random/` picks a random meme efficiently — `COUNT()` +
    a random `OFFSET/LIMIT`, instead of `ORDER BY RANDOM()` which forces a
    full-table sort.
  - `GET /api/memes/top/` returns the 10 highest-rated memes (average score,
    descending), excluding memes with no ratings yet.
- **Bonus features implemented:**
  - `GET /api/memes/<id>/image/` — server-side meme image generation with
    Pillow (fetches the template image, overlays top/bottom captions, saves
    to media storage, returns the URL).
  - `POST /api/memes/surprise-me/` — creates a meme from a random template
    and two random funny phrases.
  - `GET /api/docs/` — Swagger UI (via drf-spectacular), `GET /api/schema/`
    for the raw OpenAPI schema.

## Running the project (single command)

Requires Docker and Docker Compose.

```bash
docker-compose up --build
```

That single command:
1. Builds the Django image.
2. Starts PostgreSQL and waits until it reports healthy.
3. Applies migrations.
4. Seeds 5 meme templates (`seed_templates` management command).
5. Creates a superuser (`admin` / `admin12345` by default — see
   `docker-compose.yml` / `.env.example` to override).
6. Starts the dev server at **http://localhost:8000**.

No `.env` file is required — every variable has a working default baked into
`docker-compose.yml`. Copy `.env.example` to `.env` only if you want to
override something (a real secret key, different admin credentials, etc).

Admin site: http://localhost:8000/admin/
Swagger UI: http://localhost:8000/api/docs/

## Running tests

Inside the running `web` container (or any environment with the same
dependencies and a reachable Postgres instance):

```bash
docker-compose exec web python manage.py test
```

## API documentation

All endpoints are under `/api/`. Endpoints that mutate data require a token
(`Authorization: Token <token>`), obtained from `POST /api/auth-token/` with
`username`/`password`. Django's built-in `IsAuthenticatedOrReadOnly` means
every `GET` below is public; every `POST` requires auth.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth-token/` | Exchange username/password for an auth token |
| GET | `/api/templates/` | List meme templates |
| GET | `/api/templates/<id>/` | Retrieve one template |
| GET | `/api/memes/` | List memes (paginated, 10/page) |
| POST | `/api/memes/` | Create a meme (`template`, optional `top_text`/`bottom_text`) |
| GET | `/api/memes/<id>/` | Retrieve one meme, with `average_rating` / `ratings_count` |
| POST | `/api/memes/<id>/rate/` | Rate a meme, 1-5 (create or update your own rating) |
| GET | `/api/memes/random/` | Fetch one random meme |
| GET | `/api/memes/top/` | Top 10 memes by average rating |
| POST | `/api/memes/surprise-me/` | Bonus: create a meme from random template + phrases |
| GET | `/api/memes/<id>/image/` | Bonus: generate/return a rendered meme image URL |
| GET | `/api/docs/` | Bonus: Swagger UI |
| GET | `/api/schema/` | Bonus: raw OpenAPI schema |

## Implementation notes

- `Meme.top_text` / `Meme.bottom_text` are `blank=True` at the model level so
  DRF treats them as optional input fields, which is what makes the
  template-default fallback logic in `MemeSerializer.create()` possible.
- `MemeViewSet.get_queryset()` always annotates `avg_rating` and
  `ratings_count_annotated` with `.annotate(Avg(...), Count(...))` so listing,
  retrieving, and ranking memes never triggers N+1 rating queries.
- `MemeViewSet.lookup_value_regex = "[0-9]+"` restricts the detail route to
  numeric IDs, so custom list routes (`/memes/random/`, `/memes/top/`,
  `/memes/surprise-me/`) can never be misrouted as `pk="random"` etc.
- Rating uses `Rating.objects.update_or_create(...)`, matching the "rate once,
  then update" requirement; the DB-level `unique_together` constraint is the
  actual source of truth, not just application logic.
- Pillow image generation is isolated in `memes/services.py` and is unit
  tested with `requests.get` mocked, so tests don't depend on outbound
  network access.

## Project structure

```
memegen/          Django project package (settings, root urls, wsgi)
memes/            The single app: models, serializers, views, services, tests
memes/tests/      Test suite (models, each API surface, bonus features, auth)
Dockerfile        App image (Python 3.12-slim + Pillow build deps)
entrypoint.sh     Wait-for-Postgres, migrate, seed, createsuperuser, runserver
docker-compose.yml   db (Postgres 16) + web (Django) services
```
