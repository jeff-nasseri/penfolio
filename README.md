<div align="center">

<img src="apps/web/public/favicon.svg" width="76" alt="PenFolio" />

# PenFolio

[![CI](https://github.com/jeff-nasseri/penfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/jeff-nasseri/penfolio/actions/workflows/ci.yml)
[![Docker](https://github.com/jeff-nasseri/penfolio/actions/workflows/docker.yml/badge.svg)](https://github.com/jeff-nasseri/penfolio/actions/workflows/docker.yml)
[![Image](https://img.shields.io/badge/ghcr.io-jeff--nasseri%2Fpenfolio-2496ED?logo=docker&logoColor=white)](https://github.com/jeff-nasseri/penfolio/pkgs/container/penfolio)
[![Version](https://img.shields.io/github/v/tag/jeff-nasseri/penfolio?label=version&color=8B7BFF)](https://github.com/jeff-nasseri/penfolio/tags)
[![License: MIT](https://img.shields.io/badge/License-MIT-8B7BFF.svg)](LICENSE)

</div>

This is a self-hosted CV builder. Since I'm a fan of FlowCV, I tried to support most of the useful features from FlowCV in this project, where you can build your CV/letter + a section for job tracking.

Everything runs on your own machine. There are no accounts to sign up for, no paywalls and no limits. Your résumés, cover letters and job applications live in a single SQLite file that you own.

## What's inside

- **Résumé builder** with 10 starting templates, a live preview and a one click download to PDF. Edit your personal details, drag sections and entries around, and tune the look (template, accent colour, fonts, spacing, layout, header position, photo) without touching your content.
- **Cover letter builder** that can sync your personal details from a résumé, with the same live preview and PDF download.
- **Job tracker** as a kanban board. Create, rename and delete your own columns, drag applications between them, and keep notes, sources and dates per application.
- **Analytics** that turns your tracker into a report: a conversion funnel, a pipeline breakdown, applications over time and where they came from, plus totals for your résumés and cover letters.
- **Settings** to change your password, write an about note, edit your profile (username and picture), export everything to JSON, import a JSON backup (replaces everything), and a danger zone to purge all data. There is also an "Open Swagger API" button.
- **Multi-language UI** in English, Dutch (Nederlands) and Persian (فارسی), with full right-to-left layout for Persian. Switch from the sidebar at any time.
- **Dark and light mode**, and a clean REST API behind everything so a future MCP server can drive PenFolio.

## Run it self-hosted (Docker)

This is the recommended way. You only need Docker.

```bash
git clone https://github.com/jeff-nasseri/penfolio.git
cd penfolio
cp .env.template .env        # then edit JWT_SECRET (and the default login if you like)
docker compose up -d --build
```

Open http://localhost:3000 and sign in with the default credentials:

```
username: admin
password: admin123
```

The database is stored in a named Docker volume (`penfolio-data`) so it survives restarts. Change the port by setting `PORT` in your `.env`.

To stop it:

```bash
docker compose down
```

### Using the pre-built image

Images are published to GitHub Container Registry on every push to `master`:

```bash
docker pull ghcr.io/jeff-nasseri/penfolio:latest
```

The `docker-compose.yml` already points at `ghcr.io/jeff-nasseri/penfolio:latest`, so you can skip the build step once you have pulled the image.

## Run it with Node (development)

You need Node.js 22+. The app is a small monorepo: an Express + SQLite API (`apps/api`) and an Angular UI (`apps/web`).

```bash
git clone https://github.com/jeff-nasseri/penfolio.git
cd penfolio
npm install                  # installs the root tooling
npm run install:all          # installs apps/api and apps/web

npm run dev                  # API on :3000, Angular dev server on :4200
```

Open http://localhost:4200. The dev server proxies `/api` to the API on port 3000.

Other handy scripts:

```bash
npm run build                # build the API bundle and the Angular app
npm run typecheck            # typecheck the API
npm start                    # run the built API (serves the built UI too)
```

## End-to-end tests

The `e2e/` project is a behaviour-driven acceptance suite written with **Reqnroll**
(Gherkin) and **Testcontainers**. When the tests run, Testcontainers builds the
PenFolio image from the `Dockerfile` and starts a throwaway container, then the
scenarios drive the real REST API of that live instance. The feature files read
like a business analyst wrote them, and cover authentication, the job tracker,
résumés, cover letters, analytics and settings.

You need the .NET SDK and a running Docker engine.

```bash
cd e2e
dotnet test
```

## The API and Swagger

Everything in the UI goes through a REST API. The interactive docs live at:

```
http://localhost:3000/api/docs
```

and the raw OpenAPI document is at `http://localhost:3000/api/openapi.json`. You can also reach the docs from **Settings → Open Swagger API**. Authenticate with `POST /api/auth/login`, then send the returned token as a `Bearer` header.

## Configuration

Copy `.env.template` to `.env` and adjust:

| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `3000` | Port the app listens on. |
| `DATABASE_PATH` | `./data/penfolio.sqlite` | Where the SQLite file lives. |
| `JWT_SECRET` | change me | Used to sign session tokens. Set a long random value. |
| `JWT_EXPIRES_IN` | `7d` | Session lifetime. |
| `DEFAULT_USERNAME` | `admin` | Only used the first time the database is created. |
| `DEFAULT_PASSWORD` | `admin123` | Change it from Settings after first login. |

## Tech stack

Node.js, Express and better-sqlite3 on the backend, Angular 20 on the frontend, all in one repo and served by a single container. SQLite is the only datastore.

## License

[MIT](LICENSE).
