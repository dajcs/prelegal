# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The initial prototype was a frontend-only Next.js app supporting the Mutual NDA document with no AI chat. The V1 foundation (PL-4) built the full backend, Docker container, and fake login screen. PL-5 added AI chat for the Mutual NDA. PL-6 expanded to all 11 supported document types with a generic document creator.

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
- **PL-5**: AI Chat for Mutual NDA — freeform AI chat replaces the static form; AI collects field values conversationally and populates the document live
- **PL-6**: All document types — document catalog home page (`/`), generic AI-guided creator for all 11 supported document types at `/doc/[slug]`; Mutual NDA creator moved to `/nda`

### Routing
- `/` — Document catalog (all 11 supported document types as selectable cards)
- `/nda` — Mutual NDA creator (custom polished implementation from PL-5)
- `/doc/[slug]` — Generic document creator for all other types (csa, sla, dpa, psa, etc.)
- `/login` — Fake login page

### Architecture notes
- `frontend/` — Next.js 14 (App Router, TypeScript, Tailwind). Static export served by FastAPI.
- `backend/` — FastAPI (uv), SQLite at `/data/prelegal.db` via Docker volume. API at `/api/*`.
- Login is currently fake: any email+name succeeds, session stored in `localStorage`.
- `AuthGuard` component in `frontend/components/AuthGuard.tsx` protects all app routes.
- `Dockerfile` is multi-stage: builds Next.js, copies `out/` into FastAPI's `static/` dir, and copies `templates/` into the image at `./templates/`.
- `docker-compose.yml` uses `env_file: .env` to pass `OPENROUTER_API_KEY` into the container.
- `GET /api/template/{filename}` returns template markdown content + field names extracted from `<span class="*_link">` markers.
- AI chat via `POST /api/chat` (LiteLLM → Cerebras/OpenRouter, `gpt-oss-120b`). Returns `{message, updates}`. Accepts optional `doc_type` (template filename) for a document-specific system prompt; omit for the legacy NDA prompt.
- `ChatPanel` handles chat UI for all document types; accepts optional `docType` prop. Tab toggle switches between "AI Chat" and "Edit Fields" (both panels stay mounted to preserve chat history).
- `frontend/lib/catalog.ts` — maps all document types to slugs, routes, and template filenames.
- `frontend/components/DocCreator.tsx` / `DocPreview.tsx` / `DocForm.tsx` — generic document creator components used by `/doc/[slug]`.
- Today's date is injected into the system prompt at request time so the AI resolves "today" correctly.
