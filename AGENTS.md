# Agent Instructions

## Commands

- `npm run dev` — start dev server with HMR
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript (tsc -b)
- `npm run build` — runs `tsc -b && vite build` (CI order: lint → typecheck → build)
- `npm run preview` — preview production build

## Stack

- React 19 + TypeScript + Vite + Tailwind CSS v4
- shadcn/ui (style: radix-nova), components at `@/components/ui`
- openapi-fetch for API calls; API types generated via `openapi-typescript-generator`
- `src/lib/api/` — auth token stored in localStorage as `auth_token`

## Dev Server Proxy

`/api` requests are proxied to `http://13.250.238.51:8080` (via VITE_API_PROXY_URL env var, configured in vite.config.ts)

## Path Aliases

`@/*` maps to `./src` (configured in vite.config.ts and tsconfig.app.json)

## Docs

`opencode.json` instructs reading `docs/*.md` and `docs/**/*.md` for additional context.