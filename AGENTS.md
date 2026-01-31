# Agent Guide: Euro Coin E-commerce Project

## High-Level Architecture

- **Tech Stack**: Express, TypeScript, EJS (Server-Side Rendering), MongoDB.
- **Data Flow**: On startup, [src/app.ts](src/app.ts) fetches major collections (`Countries`, `Years`, `Coins`, `Issues`) and caches them in a `data` object exported globally. Most routes rely on this cache rather than direct DB queries for read operations.
- **Frontend Strategy**: Hybrid approach using EJS for the initial page shell and injecting data via `<script>` tags (see [src/views/browseItems.ejs](src/views/browseItems.ejs)). Complex UI interactions (sorting, cart) are handled by client-side TS in [public/ts/](public/ts/).

## Core Patterns & Conventions

- **Shared State**: Always prefer using the `data` object imported from [src/app.ts](src/app.ts) for reading coin/country metadata.
- **Client-Side Modules**: Client-side TS is compiled from [public/ts/](public/ts/) to `public/js/`. When adding new frontend logic, work in `.ts` files and ensure `npm run build-client` is executed.
- **Modular Routing**:
  - `GET` routes: [src/routes/](src/routes/)
  - `POST` routes: [src/routes/posts/](src/routes/posts/)
  - `PUT` routes: [src/routes/puts/](src/routes/puts/)
- **Type Safety**: Use types defined in [types.d.ts](types.d.ts) across both client and server code. Note that `Issue` has `amount` as `string` and `pending` as `number`.

## Key Files

- [src/app.ts](src/app.ts): Entry point & Global Cache initialization.
- [public/ts/cart.ts](public/ts/cart.ts): Centralized cart logic (add/remove/send order).
- [src/routes/coins.ts](src/routes/coins.ts): Primary API for filtered coin data.
- [public/ts/browseItems/browseItemsScript.ts](public/ts/browseItems/browseItemsScript.ts): Main frontend entry point for item browsing.

## Critical Workflows

- **Running Dev**: `npm run dev` (uses `tsx` to run [src/app.ts](src/app.ts)).
- **Environment**: Requires `MONGO_URI` to be set.
- **Asset Naming**: Coin images must match `/public/images/coins/${coin.code}.jpg`. 404 fallback is handled in EJS templates.
- **Deployment**: `npm run build` for server, `npm run build-client` for frontend, followed by `npm run copy-ejs`.
