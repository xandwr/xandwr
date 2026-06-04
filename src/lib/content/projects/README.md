# Curated projects

Each project is a folder here: `projects/<slug>/PROJECT.md`. The folder name is
the slug (the URL-ish id). Drop a folder in, it shows up on `/projects`. Delete
it, it's gone. The order on the page is curated, not chronological.

GitHub is the **base layer** (live stars / forks / language / description) and
the PROJECT.md frontmatter is the **override + enrichment layer**. Frontmatter
also doubles as a **fallback cache**: if the GitHub API is down or rate-limited,
the card renders from whatever local values are present instead of erroring.

The single house rule: **every project must be a public GitHub repo.** That's
enforced by the only required field — `repo: owner/name`. A private or missing
repo reads as a 404 and quietly degrades to the local fallback.

## PROJECT.md template

```markdown
---
repo: owner/name          # REQUIRED — the public repo this is built on
title: Display Name       # optional → defaults to the repo name
tagline: one-line pitch   # optional → defaults to the GitHub description
featured: true            # optional → promote onto the landing/hero selection
order: 1                  # optional → explicit sort (ascending); unset sorts last
demo: https://…           # optional → live/demo link (video, deployed app)
cover: /projects/slug/cover.png   # optional → hero media (see note below)
tags: [embedded, firmware]        # optional
writeup: my-build-log     # optional → slug of a long-form post in /blog
hidden: false             # optional → keep the folder but hide the card

# Fallback cache (used only if the GitHub lookup fails):
description: …            # optional cached description
language: TypeScript      # optional cached language
stars: 0                  # optional cached star count
forks: 0                  # optional cached fork count
---

Optional markdown body below the frontmatter renders as a short blurb on the
card (same `marked` + Shiki pipeline as the blog). For a full build log, write
a real /blog post and point `writeup:` at its slug instead.
```

## Media

Small cover images can live in this folder, but reference them by a **`/static`
path** (e.g. `/projects/<slug>/cover.png` with the file under `static/`). Keep
**video and other heavy media in `/static`** so it's served straight off the
Cloudflare assets binding and never bundled.
