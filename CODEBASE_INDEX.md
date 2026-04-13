# Codebase Index

## Workspace Overview
- Type: Nx monorepo (npm workspaces)
- Root package: `@org/source`
- Workspace folders:
  - `apps/` application projects
  - `packages/` shared/workspace packages (currently no package source files indexed)
  - `Requirements/` product and architecture docs

## Projects

### `web` (`apps/web`)
- Stack: Next.js 16 + React 19 + Tailwind CSS
- Primary entry points:
  - `apps/web/src/app/layout.tsx` root layout + metadata
  - `apps/web/src/app/page.tsx` app route entry
  - `apps/web/src/App.tsx` current UI shell (`Hello World`)
- Config files:
  - `apps/web/next.config.js`
  - `apps/web/tailwind.config.js`
  - `apps/web/postcss.config.js`
  - `apps/web/tsconfig.json`
- Nx target declared in package:
  - `serve` -> `next dev --port 4200`

### `api` (`apps/api`)
- Stack: Express + MongoDB driver + Nx esbuild
- Primary entry points:
  - `apps/api/src/main.ts` bootstraps env, DB connection, HTTP server, graceful shutdown
  - `apps/api/src/app.ts` express app and routes
  - `apps/api/src/config/db.ts` Mongo connection lifecycle helpers
- Implemented routes:
  - `GET /` -> hello message
  - `GET /health` -> status + DB connection flag
- Nx targets declared in package:
  - `build` (`@nx/esbuild:esbuild`)
  - `serve` (`@nx/js:node`)
  - `test`
  - `prune-lockfile`
  - `copy-workspace-modules`
  - `prune`

## Root Configuration
- `nx.json`:
  - plugins: `@nx/js/typescript`, `@nx/next/plugin`, `@nx/jest/plugin`
  - target defaults for esbuild and test
- `tsconfig.base.json` root TS settings
- `jest.config.ts` and `jest.preset.js` root test config
- `package.json`:
  - scripts: `web:serve`, `api:serve`
  - workspaces: `apps/*`, `packages/*`

## Requirements & Planning Docs
- `Requirements/SPEC.md`
- `Requirements/ARCHITECTURE.md`
- `Requirements/APP_FLOW.md`
- `Requirements/DATA_API.md`
- `Requirements/PHASE_SCOPE.md`
- `Requirements/schema.md`
- `Requirements/stories.extracted.txt`
- `Requirements/SD-Skrapo user stories-240226-102850.pdf`

## Current State Notes
- `node_modules` is not installed in this workspace at index time, so live Nx graph introspection via CLI is unavailable until dependencies are installed.
- Current codebase is bootstrap-level (basic web shell and API health endpoints) with broader architecture captured in `Requirements/`.
