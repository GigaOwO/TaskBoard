# Repository Guidelines

## Project Structure & Module Organization
- Monorepo layout: `apps/web` holds the Next.js App Router, `apps/api` serves the Hono edge handlers, and shared logic lives in `packages/` with barrel `index.ts` exports.
- Each feature slice under `apps/web/features/{task|auth|...}` contains `components`, `hooks`, `services`, `usecases`, `types`, `constants`, and `utils`. Keep server actions in `services`.
- Maintain Prisma schema files in `prisma/` and generated Supabase types in `packages/database`. Secrets stay in `.env.local`; never commit generated environment files.

## Build, Test, and Development Commands
- `npm install` bootstraps all workspaces—use npm.
- `npm run dev:web` launches Next.js on http://localhost:3000; `npm run dev:api` starts the Hono API gateway.
- `npm run lint` / `npm run format` call Biome to enforce the shared two-space format; `npm test` executes Vitest suites.
- `npm run prisma:migrate` applies migrations to Supabase; follow up with `npm run prisma:generate` after schema edits.

## Coding Style & Naming Conventions
- TypeScript runs in strict mode; declare explicit return types on exports and implement components, hooks, and handlers with `function` declarations (avoid arrow exports).
- Add JSDoc to every exported function or hook describing parameters, side effects, and return values.
- Use PascalCase component files (`TaskBoard.tsx`), camelCase hooks (`useColumnOrder.ts`), and UPPER_SNAKE_CASE constants. Use the `@/` alias.
- Favor Tailwind 4 design tokens from `globals.css`; avoid ad-hoc inline styles when a token or utility exists.

## Testing Guidelines
- Co-locate tests inside `__tests__` folders (e.g., `apps/web/features/task/__tests__/Board.test.tsx`) and suffix files with `*.test.ts[x]`.
- Use Vitest with React Testing Library; mock Supabase and Prisma through service adapters to keep tests deterministic.
- Ensure smoke coverage for UI surfaces and branch coverage for critical usecases; note temporary gaps in PR descriptions.

## Commit & Pull Request Guidelines
- Write imperative, ≤72 character commit subjects (`Add Hono task routes`) with contextual bodies when schemas or APIs shift.
- Keep commits review-sized, rebase before opening PRs, and avoid mixing schema, API, and UI changes in a single commit.
- PRs must summarize intent, link issues, list migrations, and include UI artifacts. Confirm `npm run lint`, `npm test`, and Prisma commands before requesting review.

## API & Data Layer Practices
- Validate every request with shared Zod schemas before Prisma access, and enforce Supabase Auth through Hono middleware.
- After editing `schema.prisma`, run `npx prisma format`, regenerate types, and check in migration files.
- Keep seed scripts idempotent so preview deployments can be recreated safely.
