# Black Ledger V19 — Production Architecture

V19 moves Black Ledger onto Next.js + Vercel while preserving the proven V18 academy engine during staged migration.

## Vercel import
- Git repository: `PivotTraining/tanstack-template`
- Root Directory: `black-ledger-v19`
- Framework: Next.js
- Production branch: `main`

## Pinned runtime stack
- Next.js `16.3.8`
- React / React DOM `19.3.0`
- `@supabase/ssr` `0.12.7`
- `@supabase/supabase-js` `2.117.2`

## Architecture
- Next.js App Router for public site, authenticated shell, routing, and APIs.
- Supabase-ready authentication and Postgres schema. If Supabase env vars are absent, login falls back to a temporary browser-local transitional account.
- Vercel route handler for Market Intelligence provider calls. Provider keys stay server-side.
- V18 academy is reconstructed during `prebuild` into `public/legacy/`, preserving 800 lessons, exams, Practice Desk, Journal, and Decision Intelligence during migration.
- Stripe environment placeholders are included. Checkout is intentionally not enabled until pricing and entitlements are finalized.

## Required production environment
See `.env.example`.

Supabase is required before Black Ledger can claim production cross-device authentication and persistence. Without those variables, V19 deliberately uses a transitional browser-local account.

Market provider variables are optional at deploy time. Missing keys return an `unconfigured` state rather than fabricated prices, news, or calendar events.

## Migration order
1. Deploy V19 shell to Vercel.
2. Connect Supabase and run `supabase/schema.sql`.
3. Migrate profile and Trading Inventory state to Postgres.
4. Migrate progress, assessments, and journal state.
5. Move curriculum from static JS to relational/CMS-backed content.
6. Replace legacy academy screens with native Next.js routes while preserving behavior.
7. Add Stripe entitlements only after product tiers are finalized.

## Verification already completed
- Legacy compatibility bundle: 26 chunks / 459,560 base64 characters.
- Reconstructed `member.html` SHA-256 matches the V18 source.
- Reconstructed `curriculum-v12.js` SHA-256 matches the V18 source.
- V18 compatibility output contains 44 files.
- TypeScript source has zero parser/syntax-class diagnostics before dependency installation.
- Market API returns explicit unconfigured states when provider keys are absent.
