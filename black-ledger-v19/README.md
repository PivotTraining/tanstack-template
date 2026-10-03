# Black Ledger V19 — Production Architecture

V19 moves Black Ledger onto Next.js + Vercel while preserving the proven V18 academy engine during staged migration.

## Architecture
- Next.js App Router for public site, authenticated shell, routing, and APIs.
- Supabase-ready authentication and Postgres schema. If Supabase env vars are absent, login falls back to a temporary browser-local transitional account.
- Vercel route handler for Market Intelligence provider calls. Provider keys stay server-side.
- V18 academy is restored during build from compressed source chunks so 800 lessons, exams, Practice Desk, Journal, and Decision Intelligence remain available during migration.
- Stripe environment placeholders are included. Checkout is intentionally not enabled until pricing and entitlements are finalized.

## Vercel root directory
Set the project root directory to `black-ledger-v19`.

## Required production environment
See `.env.example`.

## Migration order
1. Deploy V19 shell to Vercel.
2. Connect Supabase and run `supabase/schema.sql`.
3. Migrate profile and inventory state to Postgres.
4. Migrate progress, assessments, and journal state.
5. Move curriculum from static JS to relational/CMS-backed content.
6. Replace legacy academy screens with native Next.js routes while preserving behavior.
7. Add Stripe entitlements after product tiers are finalized.

## Safety
Market feeds never fabricate data. Missing provider keys produce an `unconfigured` response rather than demo prices or headlines.
