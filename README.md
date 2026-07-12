# Tenno Ledger

**A Warframe mastery & farming tracker.** Track every mastery-giving item in the
game, plan what to farm next from easiest to hardest, and never again sell a
weapon that another recipe needs.

**Live at [tenno.aboveconstraints.com](https://tenno.aboveconstraints.com)**

## Features

- **Collection** — all 816 mastery items (warframes, weapons, companions,
  archwings, necramechs, amps, zaw/kitgun/k-drive parts, Venari, Plexus) with
  search, filters and a four-state lifecycle:
  *Missing → Farming → Leveling → Mastered*
- **Farm planner** — everything you haven't acquired yet, sorted easiest to
  hardest (market blueprints → farmed drops → dojo research → quests/vendors →
  Prime relics → vaulted Primes), with a pinned **"Now farming"** to-do list
- **Keep list** — weapons that are crafting ingredients for other weapons
  (2× Bronco → Akbronco, Galatine → Paracesis, …) flagged **KEEP** until
  everything they build is mastered
- **Profile import** — paste your profile JSON once and the tracker mirrors
  your account exactly: per-item ranks (partial ranks count, like in-game),
  star chart & junctions (Steel Path ×2), intrinsics, calibrated to your true
  Mastery Rank
- **Sync** — progress lives in your browser, with optional Google Drive sync
  (a file in *your own* Drive; the app can only see files it created) and
  file export/import backups

## Run locally

```
npm install
npm run dev      # open the printed localhost URL
```

## Refresh game data after a Warframe update

```
npm run data
```

Rebuilds `public/data/items.json` from the community-maintained
[WFCD/warframe-items](https://github.com/WFCD/warframe-items) dataset and the
star chart region export mirrored by [browse.wf](https://browse.wf).

## Import your account

1. Log in at warframe.com, open `https://www.warframe.com/api/user-data` and
   copy the value after `"user_id"`
2. Open `https://api.warframe.com/cdn/getProfileViewingData.php?playerId=YOUR_ID`
   (PC; consoles/mobile use `api-ps4.` / `api-xb1.` / `api-swi.` / `api-mob.` /
   `api-and.`)
3. Paste the JSON into **Settings → Import from your game profile**

You fetch your own data directly from Warframe's servers — this site never
contacts them.

## Optional: cloud sync

Configure in `.env` (see `.env.example`); each provider's UI stays hidden
until configured.

**Google Drive (recommended)** — each user's progress is saved to a file in
their own Drive via the non-sensitive `drive.file` scope (no verification
review needed to publish):

1. [console.cloud.google.com](https://console.cloud.google.com) → create a
   project → enable the **Google Drive API**
2. OAuth consent screen → configure branding → **Publish app**
3. Credentials → **OAuth client ID** (Web application) → add your origins
   (`http://localhost:5173` + your deployed URL)
4. Set `VITE_GOOGLE_CLIENT_ID` in `.env`

**Supabase (alternative)** — hosted Postgres with Google login: create a free
project, enable the Google auth provider, run `supabase.sql`, set
`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

## How the numbers work

- Weapons and amps give 100 mastery XP per rank; frames, companions,
  archwings, necramechs and k-drives give 200
- Rank-40 items (Kuva/Tenet, Paracesis, necramechs) count partial ranks until
  forma'd to 40, exactly like in-game
- MR formula: total XP for rank *n* is `2500 × n²`
- Star chart nodes award their in-game `masteryExp` (twice with Steel Path),
  junctions 1,000, intrinsics 1,500 per rank

## Credits

- Item, recipe and drop data: [WFCD/warframe-items](https://github.com/WFCD/warframe-items)
- Star chart data: [browse.wf](https://browse.wf) public export
- Item images: [cdn.warframestat.us](https://warframestat.us)

Not affiliated with Digital Extremes. Warframe and all related properties are
trademarks of Digital Extremes Ltd.

## License

[MIT](LICENSE)
