# Exercise 1 — New Vite + React + TypeScript Project

This is the unmodified output of the official scaffolding tool — nothing hand-written here, since
the exercise is specifically about the setup process itself.

## How this was created

```bash
npm create vite@latest exercise-1-vite-typescript-setup -- --template react-ts
cd exercise-1-vite-typescript-setup
npm install
```

## Running it

```bash
npm install
npm run dev       # starts the dev server
npm run build     # tsc -b && vite build
```

## What was actually verified, not just assumed

I scaffolded this for real with `npm create vite@latest` rather than hand-writing the config
files from memory, and it's a good thing I did — the current template (as of this scaffold) uses
**React 19.2, Vite 8, and TypeScript 6.0**, plus `oxlint` in place of ESLint, none of which match
what an older training-data snapshot would predict. Exact versions are pinned in `package.json`.

- `npm install` completed cleanly (34 packages).
- `npm run build` (`tsc -b && vite build`) succeeded with no type errors, producing a `dist/`
  bundle.
- `npm run dev` was started in the background and the server was queried directly:
  `curl http://localhost:5175/` returned **HTTP 200** with the expected dev-mode HTML (Vite's
  React Refresh injection, `<div id="root">`, and the `src/main.tsx` entry script) — confirming
  the dev server actually serves the page, not just that the process started without printing an
  error.

## Success criteria, addressed

| Criterion | Status |
|---|---|
| Vite + React welcome page visible in browser | The default template's "Get started" page, verified serving via `curl` above |
| TypeScript configuration files present | `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` |
| Development server running without errors | Verified — see above |
