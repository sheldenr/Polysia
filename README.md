# Polysia

Modern web app scaffold for Polysia with a React + Vite frontend and a simple Express backend. This repo is structured as an npm workspaces monorepo for a clean developer experience.

The current codebase provides a functional starting point with routing on the frontend and a basic API on the backend — ready to iterate on and publish as an open-source project.

---

## Overview

- Frontend: React (Vite) app with basic routing (`/` and `/dashboard`).
- Backend: Express server exposing `GET /api/health` and `POST /api/echo`.
- Local dev proxy: Vite proxies `/api` requests to the backend on port `3001`.

---

## Monorepo Layout

- `web/` — React + Vite frontend
- `backend/` — Express API server
- `package.json` — npm workspaces root
- `LICENSE` — MIT License

---

## Getting Started

Prerequisites
- Node.js 18+ and npm 9+

Install dependencies (workspace-aware):

```
npm install
```

Run the backend (port 3001):

```
npm run dev:backend
```

Run the frontend (port 5173, proxies /api to 3001):

```
npm run dev:web
```

Build the frontend for production:

```
npm run build
```

Lint frontend code:

```
npm run lint
```

---

## API

- `GET /api/health` → `{ status: "ok", service: "polysia-backend" }`
- `POST /api/echo` with JSON body → `{ youSent: <body> }`

---

## Scripts (root)

- `dev:web` — Start Vite dev server for the frontend
- `dev:backend` — Start the Express API server
- `build` — Build the frontend app
- `preview` — Preview the production build
- `lint` — Lint the frontend

---

## Contributing

Issues and pull requests are welcome. Before submitting a PR:
- Keep changes focused and include a brief summary.
- Ensure the app builds and lints locally.

---

## License

MIT — see `LICENSE`.

