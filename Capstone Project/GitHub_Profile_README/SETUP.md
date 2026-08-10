# GitHub Profile README — setup

## What this is

`README.md` in this folder is a **profile** README. It renders at the top of your GitHub
profile page, above your repositories.

## How to publish it

1. Create a new repository named **exactly** `arielzin33-creator` — the repo name must
   match your username character for character, or GitHub will not treat it as a profile
   README.
2. Set visibility to **Public**. A private repo will not render.
3. Tick **Add a README file**.
4. Replace its contents with `README.md` from this folder.
5. Commit. Visit `https://github.com/arielzin33-creator` to confirm it renders.

## What I deliberately left out

You asked for a cleaner, minimal version and repo-only links, so this omits the heavier
elements common in profile templates:

| Omitted | Why |
|---|---|
| Profile-views counter | Vanity metric; adds a third-party tracker |
| GitHub stats / streak / trophy cards | Third-party services that break when rate-limited or deprecated |
| Contribution snake animation | Requires a scheduled GitHub Action to maintain |
| Recent-activity / merged-PR automation | Same — a workflow to keep running |
| Jokes / Spotify / quote cards | Noise on a profile aimed at employers |
| Animated GIF headers | Slow to load; dates quickly |
| LinkedIn / email / portfolio links | You specified repo-only |
| Collapsible `<details>` sections | Hide content behind a click; a short profile does not need them |

Everything remaining is static markdown and Shields.io badges — nothing to maintain, and
nothing that breaks silently.

## Editing later

- **Add links:** insert a contact line under the About section.
- **Add a project:** copy the Featured Project block. Keep it to two or three; a long list
  reads as a directory rather than a selection.
- **Badges:** generated at [shields.io](https://shields.io). Logo names come from
  [simpleicons.org](https://simpleicons.org).

## One note on the project description

The featured-project text claims the app renders unsourced figures as *unvalidated*, reports
source conflicts, and computes economics deterministically. Those are design commitments
recorded in the architecture decision records — make sure they are actually implemented
before the README is public, or the profile overstates the work.
