# Trading Dashboard

A vibe-coded trading dashboard web app for monitoring and evaluating trading performance.

- **Almost entirely client-side.** Trades are seeded on first load and persisted only in `localStorage`. No login, no accounts.
- **One server touchpoint:** `app/api/quote/route.ts`, a stateless proxy for live public stock quotes (Yahoo Finance). It relays prices only — it never sees or stores trade data.
- **Dark theme** (near-black background, blue accent), fully responsive, no horizontal page scroll.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS v4, Recharts, Zustand (`persist`), SWR, Framer Motion, date-fns, Vitest.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run test      # run the unit tests (lib/ pure logic)
npm run build     # production build
```

Open [http://localhost:3000](http://localhost:3000). Data seeds automatically on first load — use "Reset demo" in the filter bar to regenerate it.

## Deploy

Requires a Node/Edge runtime for the price-proxy route (`app/api/quote`), so it deploys to **Vercel**, not a static export.
