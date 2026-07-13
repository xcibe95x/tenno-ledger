// Best-farm hints for the crafting resources that show up as build materials.
// These aren't in the WFCD per-item drop data (the classic resources drop from
// enemies/tilesets, tracked in the game's drop tables, not on the item), and
// their good farming spots have been stable for years — so a curated map is the
// pragmatic, accurate source. Keyed by the exact component name; each value
// names a concrete planet/mission or open-world activity. Anything not listed
// falls back to a plain label pointing at the wiki.
export const RESOURCE_FARMS = {
  // ---- common planetary drops (enemies/containers) ----
  'Ferrite': 'Common drop on Earth, Mercury & Venus — any early node',
  'Nano Spores': 'Saturn (Helene, dark sector) & Deimos — Infested nodes',
  'Salvage': 'Mars & Phobos — most nodes',
  'Alloy Plate': 'Ceres (Seimeni) & Sedna — Grineer nodes',
  'Polymer Bundle': 'Venus & Uranus — most nodes',
  'Circuits': 'Venus (Tessera, defense) & Ceres',
  'Rubedo': 'Pluto (Hieracon), Sedna & Europa',
  'Plastids': 'Saturn, Phobos & Uranus',
  'Morphics': 'Mars, Mercury & Pluto — uncommon drop',
  'Orokin Cell': 'Saturn (Helene) & Ceres (Gabii) — or Kuva Fortress',
  'Gallium': 'Mars (War) & Uranus — uncommon boss/enemy drop',
  'Neurodes': 'Earth (E Prime/bounties), Lua & Deimos — Infested',
  'Neural Sensors': 'Jupiter (Io, defense) & Kuva Fortress',
  'Control Module': 'Void, Neptune & Europa',
  // ---- gathered / mission-specific ----
  'Cryotic': 'Excavation missions — Hieracon (Pluto), Ophelia (Uranus)',
  'Oxium': 'Corpus Ship nodes (Io, Jupiter) — from Oxium Ospreys',
  'Argon Crystal': 'Void missions only (Ani, Ukko) — decays 24h after pickup',
  'Tellurium': 'Archwing missions & Sedna (Kelpie, dark sector)',
  'Kuva': 'Kuva Siphon & Kuva Flood missions (Kuva Fortress + on the map)',
  // ---- built / event / faction resources ----
  'Forma': 'Not farmed — Void relic reward, daily login, or market',
  'Nitain Extract': 'Nightwave Cred offerings; Sabotage reactor caches',
  'Fieldron': 'Invasion rewards, or build from its blueprint (market)',
  'Detonite Injector': 'Invasion rewards, or build from its blueprint (market)',
  'Mutagen Mass': 'Invasion rewards, or build from its blueprint (market)',
  'Fieldron Sample': 'Corpus faction nodes — enemy/container drop',
  'Detonite Ampule': 'Grineer faction nodes — enemy/container drop',
  'Mutagen Sample': 'Eris & Deimos — Infested nodes',
  'Hexenon': 'Jupiter (Gas City) — Amalgam enemies',
  'Thrax Plasm': 'Zariman — Thrax enemies (Void Cascade/Flood/Armageddon)',
  'Lua Thrax Plasm': 'Lua (Circulus, Alchemy/Disruption) — Thrax enemies',
  'Entrati Lanthorn': 'Zariman bounties & Void Storms (Railjack)',
  'Narmer Isoplast': 'Narmer bounties — Cetus (Konzu) & Fortuna (Eudico)',
  'Rune Marrow': 'Deimos — Isolation Vault (Necramech) enemies',
  'Scrap': 'Duviri — containers & enemies in The Circuit / Duviri',
  'Voidgel Orb': 'Zariman — Void Cascade / caches',
  // ---- Orb Vallis / Fortuna ----
  'Thermal Sludge': 'Orb Vallis (Fortuna) — enemy drop',
  'Gyromag Systems': 'Orb Vallis — Profit-Taker/bounties, or buy from Little Duck',
  'Vega Toroid': 'Orb Vallis — Enrichment Labs (Temple of Profit) enemies',
  'Star Amarast': 'Orb Vallis (Fortuna) — mining (blue veins)',
  'Marquise Veridos': 'Orb Vallis (Fortuna) — rare mining (red veins)',
  'Tear Azurite': 'Orb Vallis (Fortuna) — mining',
  'Heart Noctrul': 'Orb Vallis (Fortuna) — mining',
  'Radiant Zodian': 'Orb Vallis (Fortuna) — mining',
  'Venerdo Alloy': 'Orb Vallis mining → refine at Smokefinger (Fortuna)',
  'Coprite Alloy': 'Orb Vallis mining → refine at Smokefinger (Fortuna)',
  'Axidrol Alloy': 'Orb Vallis mining → refine at Smokefinger (Fortuna)',
  'Hespazym Alloy': 'Orb Vallis mining → refine at Smokefinger (Fortuna)',
  'Tromyzon Entroplasma': 'Orb Vallis — fishing (cut at The Business, Fortuna)',
  'Longwinder Lathe Coagulant': 'Orb Vallis — fishing (cut at The Business)',
  'Charamote Sagan Module': 'Orb Vallis — fishing (cut at The Business)',
  'Kriller Thermal Laser': 'Orb Vallis — fishing (cut at The Business)',
  'Recaster Neural Relay': 'Orb Vallis — fishing (cut at The Business)',
  'Eye-Eye Rotoblade': 'Orb Vallis — fishing (cut at The Business)',
  // ---- Plains of Eidolon / Cetus ----
  'Grokdrul': 'Plains of Eidolon (Cetus) — mining & containers',
  'Iradite': 'Plains of Eidolon (Cetus) — red mining veins',
  'Cetus Wisp': "Plains of Eidolon — wisps at water's edge",
  'Fersteel Alloy': 'Plains of Eidolon mining → refine at Old Man Suumbaat (Cetus)',
  // ---- Cambion Drift / Deimos ----
  'Esher Devar': 'Cambion Drift (Deimos) — blue mining veins',
  'Goblite Tears': 'Cambion Drift (Deimos) — mining',
  'Fate Pearl': 'Cambion Drift (Deimos) — fishing (Son)',
  'Mytocardia Spore': 'Cambion Drift (Deimos) — fishing / spores',
  'Gorgaricus Spore': 'Cambion Drift (Deimos) — spore pods',
  'Silphsela': 'Cambion Drift (Deimos) — fishing (Son)',
  'Scintillant': 'Cambion Drift (Deimos) — Isolation Vaults & rare fishing drop',
  'Seriglass Shard': 'Deimos fishing → refine at Daughter (Necralisk)',
  'Benign Infested Tumor': 'Cambion Drift (Deimos) — conservation (tranq the animals)',
  // ---- Zariman ----
  'Voidplume Pinion': 'Zariman — Voidplume caches (hidden collectibles)',
  'Voidplume Quill': 'Zariman — Voidplume caches (hidden collectibles)',
  'Voidplume Down': 'Zariman — Voidplume caches (hidden collectibles)',
  'Voidplume Vane': 'Zariman — Voidplume caches (hidden collectibles)',
  'Voidplume Crest': 'Zariman — Voidplume caches (hidden collectibles)',
  // ---- misc ----
  'Fish Scales': 'Fishing on any open world — cut fish at the vendor',
  'Intact Sentient Core': 'Lua — Sentient enemies (Disruption, Conjunction Survival)',
  'Spectral Debris': 'Duviri — Undercroft enemies/containers',
  // ---- Duviri ----
  'Pathos Clamp': 'Duviri — Orowyrm fight (Teshin’s Cave) & The Circuit',
  'Nullstones': 'Duviri — containers/enemies in the Undercroft',
};

export function resourceFarm(name) {
  return RESOURCE_FARMS[name] ?? null;
}

// Where to get the parts for items whose components carry no drop table (quest
// frames, necramechs, node-locked or event gear). Curated only where the source
// is unambiguous — anything not listed honestly points at the wiki rather than
// risk a wrong mission. Keyed by item name.
export const ITEM_SOURCES = {
  // necramechs
  'Voidrig': 'Isolation Vault bounties — Cambion Drift (Deimos)',
  'Bonewidow': 'Isolation Vault bounties — Cambion Drift (Deimos)',
  // quest / special frames
  'Yareli': 'the Waverider quest (weekly comic challenges)',
  'Kullervo': "Kullervo's Hold — Duviri (Steel Path)",
  'Vauban': "Nightwave Cred offerings (Nora's shop)",
  'Chroma': 'the New Strange quest',
  'Dagath': 'Grandmother offerings — Entrati tokens (Deimos)',
  'Grendel': 'the three Grendel challenge missions (see wiki)',
  // melee
  'Broken War': 'the Second Dream quest',
};

export function itemSource(name) {
  return ITEM_SOURCES[name] ?? null;
}
