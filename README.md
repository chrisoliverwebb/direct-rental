# Direct Rental Monorepo

This repository uses Turborepo with npm workspaces.

## Apps

- `@repo/public-web`: Vite marketing site in `apps/public-web`
- `@repo/dashboard`: Next.js dashboard app in `apps/dashboard`

## Packages

- `@repo/api-contracts`: shared API DTOs and Zod schemas
- `@repo/auth`: shared auth helpers
- `@repo/marketing`: shared marketing query keys and helpers
- `@repo/shared`: shared utility functions and common types
- `@repo/eslint-config`: shared ESLint presets
- `@repo/typescript-config`: shared TypeScript presets

## Workspace commands

From repo root:

```sh
npm install
npm run dev
npm run build
npm run lint
npm run check-types
npm run test
```

## Node version

This repo requires Node `22.13.1`.

With `nvm-windows`:

```sh
nvm install 22.13.1
nvm use 22.13.1
```

The repo also enforces this via:

- root `package.json` `engines.node`
- root `.nvmrc`
- root `.npmrc` with `engine-strict=true`

Filter to a single app when needed:

```sh
npx turbo run dev --filter=@repo/public-web
npx turbo run dev --filter=@repo/dashboard
```

## Notes

- `apps/public-web` is wired into Turbo with `dev`, `build`, `lint`, and `check-types` scripts.
- Turbo caches both Next.js `.next` output and Vite `dist` output.
- The dashboard MSW worker lives at `apps/dashboard/public/mockServiceWorker.js`.
