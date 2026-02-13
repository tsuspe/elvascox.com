# elvascox-platform

Fullstack web platform for `elvascox.com`: creative portfolio + custom CMS + public read-only API + lightweight semantic search + contextual AI assistant.

The site is also designed for AI-agent readability and navigation, with `llms.txt`, predictable endpoints, and a searchable page index.

Production:
- `https://www.elvascox.com/`

Spanish version:
- `README.md`

## Key features
- `Next.js App Router` frontend with themed sections (`/tattoo`, `/musica`, `/film`, `/arte`, `/dev`, `/journal`).
- Unified archive at `/work` with type filters.
- Private CMS at `/admin` (login, `Work` CRUD, tags/media, reindex actions).
- Public read-only API:
  - `/api/public/meta`
  - `/api/public/works`
  - `/api/public/works/{slug}`
  - `/api/public/search`
  - `/api/public/tags`
- Technical SEO: dynamic metadata, JSON-LD, sitemap, robots, canonical URLs.
- AI-agent friendly layer: `llms.txt` + `SitePageIndex` for contextual retrieval.

## Tech stack
- `Next.js 16` + `React 19` + `TypeScript`
- `Prisma 6` + `PostgreSQL`
- `Tailwind CSS 4`
- `Cloudinary`
- `Vercel` (deployment + analytics)

## Quickstart (copy/paste)
```bash
npm install
cp .env.example .env

# fill DATABASE_URL / DIRECT_URL / ADMIN_PASSWORD in .env

npx prisma migrate deploy
npm run seed
npm run dev
```

## Useful links
- Website: `https://www.elvascox.com/`
- API meta: `https://www.elvascox.com/api/public/meta`
- API works: `https://www.elvascox.com/api/public/works`
- `llms.txt`: `https://www.elvascox.com/llms.txt`

## Screenshots
Regenerate:
```bash
npm run screenshots
```

Desktop (1440x900)

| Home | Work |
|---|---|
| ![Home Desktop](docs/images/home-desktop.png) | ![Work Desktop](docs/images/work-desktop.png) |

| Tattoo | Musica |
|---|---|
| ![Tattoo Desktop](docs/images/tattoo-desktop.png) | ![Musica Desktop](docs/images/musica-desktop.png) |

| Film | Journal |
|---|---|
| ![Film Desktop](docs/images/film-desktop.png) | ![Journal Desktop](docs/images/journal-desktop.png) |

| Bio |
|---|
| ![Bio Desktop](docs/images/bio-desktop.png) |

Mobile (390x844)

| Home | Work |
|---|---|
| ![Home Mobile](docs/images/home-mobile.png) | ![Work Mobile](docs/images/work-mobile.png) |

## What a recruiter can validate here
- End-to-end fullstack delivery of a production web platform.
- Relational content modeling with Prisma (`Work`, `Media`, `Tag`, `WorkTag`, `WorkLink`).
- Internal CMS workflows with server actions and cookie-based admin auth.
- Stable public read-only API design for external consumption.
- AI discoverability patterns (`llms.txt`, clean routing, indexed retrieval).
- Strong SEO foundations for real-world deployment.

## Extended docs
- `docs/SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/API_PUBLIC.md`
- `docs/DEPLOY_VERCEL.md`
- `docs/OPEN_SOURCE_CHECKLIST.md`

## Open source and CI
- CI workflow: `.github/workflows/ci.yml` (`npm ci`, `lint`, `build`).
- Dependabot: `.github/dependabot.yml`.
- License: `LICENSE` (MIT).
- Security policy: `SECURITY.md`.
- Contribution guide: `CONTRIBUTING.md`.
- Code of conduct: `CODE_OF_CONDUCT.md`.

## Open source security notes
- No secrets are committed; use `.env.example` as template.
- If a secret lands in Git history, treat it as compromised and rotate immediately.
- See `SECURITY.md` for responsible disclosure details.

## Disclaimer
This repository is a demo/portfolio project. It does not contain real client data or production credentials.
