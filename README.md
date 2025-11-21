# Polysia

Modern web app scaffold for Polysia with a React + Vite frontend and a simple Express backend. This repo is structured as an npm workspaces monorepo for a clean developer experience.

The current codebase provides a functional starting point with routing on the frontend and a basic API on the backend â€” ready to iterate on and publish as an open-source project.

---

## Overview

- Frontend: React (Vite) app with basic routing (`/` and `/learning-hub`).
- Backend: Express server exposing `GET /api/health` and `POST /api/echo`.
- Local dev proxy: Vite proxies `/api` requests to the backend on port `3001`.

---

## Monorepo Layout

- `web/` â€” React + Vite frontend
- `backend/` â€” Express API server
- `package.json` â€” npm workspaces root
- `LICENSE` â€” MIT License

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

- `GET /api/health` â†’ `{ status: "ok", service: "polysia-backend" }`
- `POST /api/echo` with JSON body â†’ `{ youSent: <body> }`

---

## Scripts (root)

- `dev:web` â€” Start Vite dev server for the frontend
- `dev:backend` â€” Start the Express API server
- `build` â€” Build the frontend app
- `preview` â€” Preview the production build
- `lint` â€” Lint the frontend

---

## Contributing

Issues and pull requests are welcome. Before submitting a PR:
- Keep changes focused and include a brief summary.
- Ensure the app builds and lints locally.

---

## License

MIT â€” see `LICENSE`.


