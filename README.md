# Polysia

Full-stack React + Vite starter with an optional Express API.

## Scripts

- `pnpm dev` - Start dev server
- `pnpm build` - Build client and server
- `pnpm build:client` - Build client only
- `pnpm start` - Run production server
- `pnpm typecheck` - TypeScript checks
- `pnpm test` - Run tests

## Deploy (Vercel)

- Build command: `pnpm build:client`
- Output directory: `dist/spa`
- SPA routing: handled by `vercel.json`

## Deploy (Netlify)

- Build command: `npm run build:client`
- Publish directory: `dist/spa`
- Functions directory: `netlify/functions`
