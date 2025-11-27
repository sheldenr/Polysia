# Polysia

Modern web app scaffold for Polysia with a React + Vite frontend and a simple Express backend. This repo is structured as an npm workspaces monorepo for a clean developer experience.

The current codebase provides a functional starting point with routing on the frontend and a basic API on the backend â€” ready to iterate on and publish as an open-source project.

# Polysia

Polysia is a React + Vite single-page app (frontend) paired with a small Express backend. This repository is organized as a simple monorepo and includes a landing site and a Learning Hub (dashboard).

Quick highlights
- Frontend: React (Vite) app with client routing and a Learning Hub UI.
- Backend: Express server used for small API endpoints and proxying external services (recommended for securing API keys).

Contents
- `web/` — frontend app (React + Vite)
- `backend/` — Express API server
- `package.json` — workspace scripts
- `README.md`, `LICENSE`

Getting started (local)
1. Prerequisites: Node.js 18+ and npm
2. Install dependencies:

```powershell
npm install
```

3. Start the backend (default port used by this project is `3001`):

```powershell
npm run dev:backend
```

4. Start the frontend dev server (Vite, proxies `/api` to the backend):

```powershell
npm run dev:web
```

Available scripts (root)
- `dev:web` — start Vite dev server for the frontend
- `dev:backend` — start the Express backend
- `build` — build the frontend for production
- `preview` — preview the built frontend
- `lint` — run frontend linters

New pages & routes
- `/about`, `/research`, `/contact` — simple pages matching the landing site's "What we offer" style
- `/learning-hub` — the Learning Hub (dashboard)

Testing & debugging
- Start backend and frontend, open the Reading Mode page and try the mock. If the backend is proxied correctly, requests to `/api/*` from the frontend will be forwarded to the backend.

Security
- Never store API keys in frontend code or commit them to Git. Use server-side environment variables and a proxy endpoint so keys remain secret.

Contributing
- PRs welcome. Keep changes focused and test the dev server locally.

## License
- MIT — see `LICENSE`



