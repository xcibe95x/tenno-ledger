// Best-farm hints for the crafting resources that show up as build materials.
// These aren't in the WFCD per-item drop data (the classic resources drop from
// enemies/tilesets, tracked in the game's drop tables, not on the item), and
// their good farming spots have been stable for years — so a curated map is the
// pragmatic, accurate source. Keyed by the exact component name. Anything not
// listed simply falls back to a plain label with no hint.
export const RESOURCE_FARMS = {
  // ---- common planetary resources ----
  'Ferrite': 'Abundant on Earth, Mercury & Venus — any early node',
  'Nano Spores': 'Saturn (Helene) & Deimos — Infested nodes',
  'Salvage': 'Mars & Phobos',
  'Alloy Plate': 'Ceres & Sedna',
  'Polymer Bundle': 'Venus & Uranus',
  'Circuits': 'Venus (Tessera) & Ceres',
  'Rubedo': 'Pluto, Sedna & Europa',
  'Plastids': 'Saturn, Phobos & Uranus',
  'Cryotic': 'Excavation — Hieracon (Pluto), Ophelia (Uranus)',
  'Oxium': 'Corpus Ship nodes (Io, Jupiter) — from Oxium Ospreys',
  // ---- uncommon / rare ----
  'Morphics': 'Mars, Mercury & Pluto',
  'Orokin Cell': 'Saturn (Helene) & Ceres (Gabii)',
  'Gallium': 'Mars (War) & Uranus',
  'Neurodes': 'Earth, Lua & Deimos — Infested/Grineer',
  'Neural Sensors': 'Jupiter (Io) & Kuva Fortress',
  'Control Module': 'Void, Neptune & Europa',
  'Argon Crystal': 'Void missions only — decays 24h after pickup',
  'Tellurium': 'Archwing missions & Sedna (Kelpie, dark sector)',
  // ---- built / event resources ----
  'Forma': 'Not farmed — Void relic reward, login, or market',
  'Nitain Extract': 'Nightwave Cred offerings; Sabotage endo caches',
  'Fieldron': 'Invasion rewards, or build from a blueprint',
  'Detonite Injector': 'Invasion rewards, or build from a blueprint',
  'Mutagen Mass': 'Invasion rewards, or build from a blueprint',
  'Fieldron Sample': 'Corpus faction nodes',
  'Detonite Ampule': 'Grineer faction nodes',
  'Mutagen Sample': 'Eris & Deimos — Infested nodes',
  'Kuva': 'Kuva Siphon & Kuva Flood missions',
  // ---- faction / newer content ----
  'Hexenon': 'Jupiter (Gas City) — Amalgam enemies',
  'Thermal Sludge': 'Orb Vallis (Fortuna)',
  'Thrax Plasm': 'Zariman — Thrax enemies',
  'Lua Thrax Plasm': 'Circulus (Lua) — Thrax enemies',
  'Entrati Lanthorn': 'Zariman & Void Storms (Railjack)',
  'Narmer Isoplast': 'Narmer bounties (Cetus & Fortuna)',
  // ---- open-world (region-level: mine/fish there) ----
  'Grokdrul': 'Plains of Eidolon (Cetus) — mining & containers',
  'Iradite': 'Plains of Eidolon (Cetus) — red mining veins',
  'Cetus Wisp': "Plains of Eidolon — water's-edge wisps",
  'Esher Devar': 'Cambion Drift (Deimos) — mining',
  'Goblite Tears': 'Cambion Drift (Deimos) — mining',
  'Thrax': 'Cambion Drift (Deimos) — mining',
  'Star Amarast': 'Orb Vallis (Fortuna) — mining',
  'Marquise Veridos': 'Orb Vallis (Fortuna) — rare mining',
  'Tear Azurite': 'Orb Vallis (Fortuna) — mining',
  'Heart Noctrul': 'Orb Vallis (Fortuna) — mining',
  'Radiant Zodian': 'Orb Vallis (Fortuna) — mining',
};

export function resourceFarm(name) {
  return RESOURCE_FARMS[name] ?? null;
}
