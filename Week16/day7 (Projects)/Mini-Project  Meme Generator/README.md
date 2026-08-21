# Meme Generator — React Mini Project

```bash
npm install
npm run dev     # http://localhost:5173
```

## Structure

```
Meme/
├── index.html                       # loads the VT323 Google Font
└── src/
    ├── App.jsx                      # imports App.css, composes the two components
    ├── App.css                      # the provided stylesheet (unmodified)
    ├── index.css                    # minimal reset
    ├── assets/trollface.png         # saved locally
    └── components/
        ├── Header.jsx               # function component
        └── MemeGenerator.jsx        # class component
```

## Steps

| Step | Where |
|---|---|
| 1 — app + provided CSS | `src/App.css`, imported in `App.jsx` |
| 2 — two components, own files | `components/Header.jsx` (function), `components/MemeGenerator.jsx` (class) |
| 3 — trollface + "Meme Generator" | `Header.jsx` |
| 4 — state: topText / bottomText / randomImg | `MemeGenerator` constructor |
| 5 — API call + `allMemeImgs`, form + button | `componentDidMount`, `render` |
| 6 — two controlled inputs | `render` (`value` + `onChange` + `name`) |
| 7 — `onChange` handler | `handleChange` |
| 8 — `.meme` div, `.top` / `.bottom` h2s | `render` |
| 9 — random meme on "Gen" | `handleSubmit` |

## Two things worth flagging

**1. The API path in the brief is off by one level.** The brief says to save
`response.data.memes`. Checked against the live endpoint, the JSON body is:

```json
{ "success": true, "data": { "memes": [ /* 100 items */ ] } }
```

Axios puts the *whole body* on `response.data`, so the array is at
**`response.data.data.memes`**. Using `response.data.memes` gives `undefined` — `allMemeImgs`
stays empty and the "Gen" button appears to do nothing, with no error to explain why.
(`response.data.memes` would be correct with `fetch()` + `await res.json()`.)

**2. The provided CSS needs the VT323 font.** It's referenced but not imported anywhere in the
stylesheet, so without a `<link>` the header and form silently fall back to generic monospace.
Loaded in `index.html`.

## Verified

Driven in a real browser, not just written:

- Header gradient, 100px height, VT323 at 50px — all computed correctly.
- Trollface (991×806) and the default meme (568×335) both load.
- Typed into both inputs → state flows to the `<h2>` overlays live (controlled forms).
- "Gen" clicked 8 times → **8 distinct** random memes, text preserved each time.
- `performance` navigation type stayed `navigate`, not `reload` — confirming `preventDefault()`.
- Zero console errors; `npm run build` succeeds.
