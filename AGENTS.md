# Agent Guide: Euro Coin E-commerce

## Why this repo exists

This is a server-rendered e-commerce-style app for browsing euro coins and managing inventory/issues, with an admin area for edits and order handling. Only the admin actually uses this app.

## What it’s built with (map of the codebase)

- **Server**: Express + TypeScript in [src/](src/)
- **Views (SSR)**: EJS templates in [src/views/](src/views/)
- **Database**: MongoDB
- **Client-side UI logic**: TypeScript in [public/ts/](public/ts/) compiled to JS in `public/js/`
- **Static assets**: images/fonts/styles under [public/](public/)

### Data flow / shared state

On startup, [src/app.ts](src/app.ts) loads core collections (Countries/Years/Coins/Issues) and caches them in a globally exported `data` object. Read paths typically use this cache rather than querying Mongo directly.

## How to work in this repo (universally useful)

- **Prefer the cache for reads**: if you need coin/country metadata in a route/view, import and use the `data` object from [src/app.ts](src/app.ts) unless there’s a strong reason not to.
- **Client-side changes live in TS**: edit files in [public/ts/](public/ts/), then rebuild client output.
- **Shared types**: use [types.d.ts](types.d.ts) for types shared across server + client. (Reminder: `Issue.amount` is `string`, `Issue.pending` is `number`.)
- **Routing layout**:
  - GET routes: [src/routes/](src/routes/)
  - POST routes: [src/routes/posts/](src/routes/posts/)
  - PUT routes: [src/routes/puts/](src/routes/puts/)

### Run / build / verify

- **Dev**: `npm run dev` (runs [src/app.ts](src/app.ts) via `tsx`)
- **Requires**: `MONGO_URI`
- **Server build**: `npm run build`
- **Client build**: `npm run build-client`
- **Copy views to dist**: `npm run copy-ejs`

Note: the `build` / `build-client` scripts are configured to not fail CI on TS errors (they print an error and exit 0). If you need strict failure behavior locally, run `npx tsc -p tsconfig.json` (and/or `npx tsc -p public/tsconfig.json`) directly.

### Assets

Coin images are resolved by code: `public/images/coins/${coin.code}.jpg`.

## Where to look first (common tasks)

- **App startup, DB connection, cache population**: [src/app.ts](src/app.ts)
- **Browse/search coin data route**: [src/routes/coins.ts](src/routes/coins.ts)
- **Browse page shell + injected data**: [src/views/browseItems.ejs](src/views/browseItems.ejs)
- **Browse client entrypoint**: [public/ts/browseItems/browseItemsScript.ts](public/ts/browseItems/browseItemsScript.ts)
- **Cart logic**: [public/ts/cart.ts](public/ts/cart.ts)
- **Admin edit UI**: [src/routes/edit.ts](src/routes/edit.ts) and [public/ts/edit/](public/ts/edit/)
- **Orders UI + scripts**: [src/routes/orders.ts](src/routes/orders.ts) and [public/ts/orders/](public/ts/orders/)
