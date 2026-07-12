# Tenno Ledger — Warframe mastery & farming tracker

Tracks every mastery-giving item in Warframe (813 warframes, weapons, companions,
archwings, amps, zaw/kitgun/k-drive parts), tells you **what to farm next from
easiest to hardest**, and warns you **which weapons to keep** because they are
crafting ingredients for other weapons (Bronco → Akbronco, Galatine → Paracesis, …).

## Run it

```
npm install
npm run dev      # open the printed localhost URL
```

Progress is saved in your browser automatically (Settings tab has file
export/import for backups).

## Refresh game data after updates

```
npm run data
```

Downloads the latest community dataset ([WFCD/warframe-items](https://github.com/WFCD/warframe-items),
same data as api.warframestat.us) and rebuilds `public/data/items.json`.

## Optional: cloud sync (free)

Two providers are supported; each stays completely hidden until configured
in `.env` (see `.env.example`).

**Google Drive (recommended)** — progress lives in a private file in the
player's own Drive (`appDataFolder`), no database at all:

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a
   project, enable the **Google Drive API**
2. APIs & Services → OAuth consent screen → configure (External, add yourself
   as test user or publish)
3. Credentials → Create credentials → **OAuth client ID** → Web application →
   add your site origins (e.g. `http://localhost:5173` and your deployed URL)
4. Put the client id in `.env` as `VITE_GOOGLE_CLIENT_ID`, restart

**Supabase** — hosted Postgres with Google login: create a free project at
supabase.com, enable the Google auth provider, run `supabase.sql` in the SQL
editor, and fill `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env`.

Progress syncs automatically after each change; the newest copy wins across
devices.

## How the numbers work

- Weapons and amps: 100 mastery XP per rank (3,000 at rank 30, 4,000 for
  rank-40 Kuva/Tenet weapons). Frames, companions, archwings, necramechs,
  k-drives: 200 per rank.
- MR formula: total XP for rank *n* is `2500 × n²`. Star chart nodes,
  junctions and intrinsics aren't itemized here — enter that XP once in
  Settings so your rank matches in-game.
- Farm difficulty is a heuristic: market blueprints < farmed drops (weighted
  by drop chance) < quest/vendor/dojo < Prime relics < vaulted Primes.
