# stoatcord-bot

Discord↔Stoat migration and message bridge bot built with Bun + TypeScript.

## Quick Start

```bash
cp .env.example .env
# Fill in DISCORD_TOKEN and STOAT_TOKEN
bun run start
```

## Commands

- `bun run start` — Run the bot
- `bun run dev` — Run with auto-reload (--watch)
- `bun run typecheck` — TypeScript type checking
- `bun run test` — Run the test suite
- `bun run test:watch` — Run tests in watch mode

## Architecture

```
src/
  index.ts          — Entry point, connects both platforms
  config.ts         — Environment config validation
  stoat/            — Stoat/Revolt REST client + WebSocket
  discord/          — Discord.js v14 client + slash commands
  bridge/           — Bidirectional message relay + format conversion
  migration/        — Channel/role migration wizard + snapshot
    progress.ts     — Dedup-aware executor (create/update/skip, abort, dry-run)
    wizard.ts       — Interactive Discord wizard (auth, preview, 3-button UI)
    snapshot.ts     — Full Discord server data snapshot generator
    channels.ts     — Discord→Stoat channel mapping with topic/nsfw/warnings
    roles.ts        — Discord→Stoat role mapping with hoist/mentionable/warnings
    approval.ts     — In-memory promise management for live migration approval
  db/               — bun:sqlite persistence layer
```

## Key Notes

- Bun automatically loads .env — no dotenv needed
- Database uses `bun:sqlite` (WAL mode, synchronous API)
- Stoat auth uses `x-bot-token` header (bot tokens, not user sessions)
- Discord impersonation via webhooks, Stoat impersonation via masquerade
- Rate limits: 2.5s delay between server-bucket operations (channel/role creation)
- Migration modes: `missing` (create+update), `full` (same), `roles`, `categories`
- Migration supports: dry-run, mid-flight cancel (AbortSignal), emoji/media upload
- Snapshot posts to restricted #migration-log channel in Stoat server
- Autumn CDN uploads for emoji/icons/banners (configurable via STOAT_AUTUMN_URL)
- Install with `bun install --backend=copyfile` on Termux (SELinux blocks hardlinks)

## Bun APIs

- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile

## Testing

- Colocated: `foo.ts` → `foo.test.ts`. No `tests/` directory.
- Pure/deterministic logic only — no mocking discord.js gateway, live network, or `bun:sqlite` beyond `:memory:`.
- `export` a private helper to make it testable if it's pure; don't restructure for it.
- No shared `test-utils.ts` until duplication actually appears.
- Covered: `bridge/format.ts`, `migration/roles.ts`, `migration/channels.ts`, `push/relay.ts`, `db/store.ts`, `archive/import.ts`.
- Out of scope: live-connection modules (`bridge/relay.ts`, `discord/events.ts`, `stoat/websocket.ts`, `migration/wizard.ts`, `api/server.ts`, `push/fcm.ts`, `push/webpush.ts`), `env.ts`.
