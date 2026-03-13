# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The initial prototype was a frontend-only Next.js app supporting the Mutual NDA document with no AI chat. The V1 foundation (PL-4) has since been built: the project now has a full backend, Docker container, and fake login screen.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.
The backend should be in `backend/` and be a uv project, using FastAPI.  \
The frontend should be in `frontend/`.  \
The database uses SQLite at `/data/prelegal.db` (persisted via Docker volume), with a `users` table (id, email, name, created_at).  \
The frontend is statically built (`output: 'export'`) and served via FastAPI `StaticFiles`.
There should be scripts in `scripts/` for:

```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed
- **PL-3**: Mutual NDA Creator — Next.js frontend with live form + document preview, print-to-PDF
- **PL-4**: V1 foundation — FastAPI backend (`backend/`), SQLite DB, Docker container, start/stop scripts, fake login screen

### Architecture notes
- `frontend/` — Next.js 14 (App Router, TypeScript, Tailwind). Static export served by FastAPI.
- `backend/` — FastAPI (uv), SQLite at `/data/prelegal.db` via Docker volume. API at `/api/*`.
- Login is currently fake: any email+name succeeds, session stored in `localStorage`.
- `AuthGuard` component in `frontend/components/AuthGuard.tsx` protects all app routes.
- `Dockerfile` is multi-stage: builds Next.js, then copies `out/` into FastAPI's `static/` dir.
- AI chat not yet implemented.

