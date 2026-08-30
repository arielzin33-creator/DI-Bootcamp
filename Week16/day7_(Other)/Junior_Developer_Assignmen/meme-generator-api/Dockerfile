FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# libjpeg/zlib dev headers: Pillow's manylinux wheels usually cover this, but
# building from source (which pip silently falls back to if no matching wheel
# exists for a given base-image/arch combination) needs them present.
# netcat: used by entrypoint.sh to wait for Postgres to accept connections before
# running migrations, rather than guessing a fixed sleep duration.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
