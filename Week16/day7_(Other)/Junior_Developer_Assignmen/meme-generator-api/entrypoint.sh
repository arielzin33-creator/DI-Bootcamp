#!/bin/sh
set -e

echo "Waiting for Postgres at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do
  sleep 0.5
done
echo "Postgres is up."

python manage.py migrate --noinput

# With no command override (the plain `docker-compose up` case) run the full
# first-boot sequence. With an override (e.g. `docker-compose run web python
# manage.py makemigrations`) just migrate and exec the given command — seeding
# and superuser creation would be irrelevant, and pointless, for one-off tasks.
if [ "$#" -eq 0 ]; then
    python manage.py seed_templates

    # --noinput reads the password from DJANGO_SUPERUSER_PASSWORD automatically (a
    # feature of Django's own createsuperuser command since Django 3.0 — no need to
    # pass it as a CLI argument, which would otherwise leak into shell history / the
    # container's process list).
    #
    # This command exits non-zero if the user already exists — expected and safe on a
    # container restart against an existing DB volume, so it's explicitly allowed to
    # fail here rather than aborting the whole startup sequence.
    python manage.py createsuperuser --noinput \
        --username "$DJANGO_SUPERUSER_USERNAME" \
        --email "$DJANGO_SUPERUSER_EMAIL" \
        || echo "Superuser already exists, skipping."

    exec python manage.py runserver 0.0.0.0:8000
else
    exec "$@"
fi
