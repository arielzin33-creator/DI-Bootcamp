# cURL examples

Assumes the server is running on `http://localhost:8787` with
`MCP_HTTP_TOKEN=dev-test-token-12345` (replace with your own token). All of these were run for
real against a live server while building this project -- see README.md for exact captured
output.

## GET /tools

No auth required -- it's a capability listing, not an action.

```bash
curl -s http://localhost:8787/tools | jq
```

## POST /tools/search_web

```bash
curl -s -X POST http://localhost:8787/tools/search_web \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-test-token-12345" \
  -d '{"query": "renewable energy trends", "k": 5}' | jq
```

## POST /tools/fetch_readable

```bash
curl -s -X POST http://localhost:8787/tools/fetch_readable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-test-token-12345" \
  -d '{"url": "https://en.wikipedia.org/wiki/Web_scraping"}' | jq
```

## POST /tools/summarize_with_citations

```bash
curl -s -X POST http://localhost:8787/tools/summarize_with_citations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-test-token-12345" \
  -d '{
    "topic": "renewable energy trends",
    "docs": [
      {
        "title": "Renewable energy - Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Renewable_energy",
        "text": "Renewable energy is energy made from renewable natural resources..."
      }
    ]
  }' | jq
```

## POST /tools/save_markdown

```bash
curl -s -X POST http://localhost:8787/tools/save_markdown \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-test-token-12345" \
  -d '{"filename": "test.md", "content": "# Hello\n\nThis is a test."}' | jq
```

## Error cases worth trying

```bash
# 401: no Authorization header
curl -s -w "\n%{http_code}\n" -X POST http://localhost:8787/tools/search_web \
  -H "Content-Type: application/json" -d '{"query":"test"}'

# 401: wrong token
curl -s -w "\n%{http_code}\n" -X POST http://localhost:8787/tools/search_web \
  -H "Content-Type: application/json" -H "Authorization: Bearer wrong-token" -d '{"query":"test"}'

# 400: empty query
curl -s -w "\n%{http_code}\n" -X POST http://localhost:8787/tools/search_web \
  -H "Content-Type: application/json" -H "Authorization: Bearer dev-test-token-12345" -d '{"query":""}'

# 400: filename with a path-traversal attempt (rejected, not written)
curl -s -w "\n%{http_code}\n" -X POST http://localhost:8787/tools/save_markdown \
  -H "Content-Type: application/json" -H "Authorization: Bearer dev-test-token-12345" \
  -d '{"filename":"../../etc/evil.md","content":"pwned"}'
```
