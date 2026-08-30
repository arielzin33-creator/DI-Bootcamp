# Post JSON data demo

## Setup
```
npm install
npm run dev
```
Build: `npm run build`

## Before running

1. Go to https://webhook.site — it gives you a fresh "Your unique URL"
   every time you visit. Copy it.
2. Open "Edit" / CORS settings there and enable CORS, or the browser
   will block the request as cross-origin.
3. Paste your URL into `WEBHOOK_URL` at the top of `src/App.jsx`,
   replacing the placeholder.

## What it does
Clicking "Send data" calls an `async` function that:
- `fetch`es your webhook URL with `method: "POST"`
- sets `Content-Type: application/json` in the headers
- sends the hardcoded object (`key1`, `email`, `name`, `lastname`,
  `age`) as the body, via `JSON.stringify`
- awaits the response, parses it with `.json()`, and logs it to the
  console

Refresh the webhook.site page afterward and you should see the same
request logged there, with your payload in its body.

## Note on file naming
Same as the earlier exercises: `App.jsx` rather than `App.js`, since
this project uses Vite. Rename to `.js` with no code changes if using
`create-react-app` instead.
