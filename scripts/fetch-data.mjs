// Downloads item data from WFCD/warframe-items (the community dataset behind
// api.warframestat.us and the wiki drop tables), trims it to the fields the
// app needs, and writes public/data/items.json.
//
// Run with: npm run data

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const BASE = 'https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json';
const FILES = [
  'Warframes.json', // warframes + necramechs
  'Primary.json',
  'Secondary.json',
  'Melee.json',
  'Archwing.json',
  'Arch-Gun.json',
  'Arch-Melee.json',
  'Sentinels.json',
  'SentinelWeapons.json',
  'Pets.json',
  'Misc.json', // amps, k-drives and other stray masterables
];

// Founders / permanently unobtainable gear — shown in the checklist but
// excluded from the farm planner.
const UNOBTAINABLE = new Set([
  'Excalibur Prime', 'Lato Prime', 'Skana Prime',
]);

// These give mastery in-game but are flagged masterable:false in the WFCD
// data (amps: 100 XP/rank per prism; Sporelacer/Vermisplicer kitgun chambers).
const MASTERABLE_OVERRIDES = new Set([
  'Mote Prism', 'Raplak Prism', 'Shwaak Prism', 'Granmu Prism', 'Rahn Prism',
  'Lega Prism', 'Klamora Prism', 'Cantic Prism',
  'Sporelacer', 'Vermisplicer',
  'Venari', 'Venari Prime', // Khora's kavat grants 6000 mastery
]);

// 200 XP per rank for "vehicle/companion/frame"-type product categories,
// 100 XP per rank for weapons and amps.
const XP200 = new Set(['Suits', 'SpaceSuits', 'MechSuits', 'Sentinels', 'KubrowPets', 'Hoverboards']);

function xpInfo(item) {
  const perRank = XP200.has(item.productCategory) || item.uniqueName?.includes('/Khora/Kavat/') ? 200 : 100;
  const maxRank = item.maxLevelCap ?? 30;
  return { perRank, maxRank, totalXp: perRank * maxRank };
}

function trimDrop(d) {
  return {
    location: d.location,
    type: d.type,
    chance: d.chance != null ? Math.round(d.chance * 10000) / 10000 : null,
    rarity: d.rarity ?? null,
  };
}

function bestDrops(drops, n = 4) {
  if (!Array.isArray(drops) || drops.length === 0) return [];
  return [...drops]
    .sort((a, b) => (b.chance ?? 0) - (a.chance ?? 0))
    .slice(0, n)
    .map(trimDrop);
}

function trimComponent(c) {
  return {
    uniqueName: c.uniqueName,
    name: c.name,
    itemCount: c.itemCount ?? 1,
    type: c.type ?? null,
    imageName: c.imageName ?? null,
    drops: bestDrops(c.drops, 3),
  };
}

async function fetchJson(file) {
  const res = await fetch(`${BASE}/${file}`);
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  return res.json();
}

console.log('Fetching item data from WFCD/warframe-items ...');
const raw = (await Promise.all(FILES.map(fetchJson))).flat();
console.log(`Fetched ${raw.length} raw items`);

// Entries that duplicate another mastery item. The Orion/Sirius twins are one
// warframe in-game (6000 mastery once, tracked on the Sirius suit).
const EXCLUDED_IDS = new Set([
  '/Lotus/Powersuits/SiriusOrion/OrionSuit',
]);

const seen = new Set();
const items = [];
for (const it of raw) {
  if (!it.masterable && !MASTERABLE_OVERRIDES.has(it.name)) continue;
  if (EXCLUDED_IDS.has(it.uniqueName)) continue;
  if (seen.has(it.uniqueName)) continue;
  seen.add(it.uniqueName);
  const { perRank, maxRank, totalXp } = xpInfo(it);
  items.push({
    id: it.uniqueName,
    name: it.name,
    category: it.type === 'Amp' ? 'Amp' : it.category,
    type: it.type === 'Pistol' && it.category === 'Misc' ? 'Kitgun Component' : (it.type ?? null),
    productCategory: it.productCategory ?? null,
    masteryReq: it.masteryReq ?? 0,
    maxRank,
    perRank,
    totalXp,
    isPrime: !!it.isPrime,
    vaulted: !!it.vaulted,
    tradable: !!it.tradable,
    marketCost: it.marketCost ?? null,
    bpCost: it.bpCost ?? null,
    imageName: it.imageName ?? null,
    wikiaUrl: it.wikiaUrl ?? null,
    releaseDate: it.releaseDate ?? null,
    unobtainable: UNOBTAINABLE.has(it.name),
    drops: bestDrops(it.drops, 4),
    components: Array.isArray(it.components) ? it.components.map(trimComponent) : [],
  });
}
// The railjack Plexus grants mastery but is absent from the WFCD dataset.
items.push({
  id: '/Lotus/Types/Game/CrewShip/RailJack/DefaultHarness',
  name: 'Plexus',
  category: 'Misc',
  type: 'Plexus',
  productCategory: 'CrewShipHarnesses',
  masteryReq: 0,
  maxRank: 30,
  perRank: 200,
  totalXp: 6000,
  isPrime: false,
  vaulted: false,
  tradable: false,
  marketCost: null,
  bpCost: null,
  imageName: null,
  wikiaUrl: 'https://wiki.warframe.com/w/Plexus',
  releaseDate: '2021-03-19',
  unobtainable: false,
  drops: [],
  components: [],
});

console.log(`Kept ${items.length} masterable items`);

// Keep-list relations: item X is an ingredient of item Y when Y's components
// include X's uniqueName (e.g. Akbronco requires 2x Bronco).
// Recipes that need 2 of a weapon list it as two component entries, so
// aggregate counts per (ingredient, parent) pair.
const byId = new Map(items.map(i => [i.id, i]));
for (const item of items) {
  const needed = new Map();
  for (const comp of item.components) {
    const ingredient = byId.get(comp.uniqueName);
    if (ingredient && ingredient.id !== item.id) {
      needed.set(ingredient.id, (needed.get(ingredient.id) ?? 0) + (comp.itemCount ?? 1));
    }
  }
  for (const [ingId, count] of needed) {
    const ingredient = byId.get(ingId);
    (ingredient.ingredientFor ??= []).push({ id: item.id, name: item.name, count });
    (item.weaponIngredients ??= []).push({ id: ingredient.id, name: ingredient.name, count });
  }
}
const keepCount = items.filter(i => i.ingredientFor).length;
console.log(`${keepCount} items are crafting ingredients for other equipment`);

// Star chart node mastery values (browse.wf mirrors the game's region export).
// Junctions (nodeType 7) grant a flat 1000 mastery each.
console.log('Fetching star chart region data ...');
const regionsRes = await fetch('https://browse.wf/warframe-public-export-plus/ExportRegions.json', {
  headers: { 'User-Agent': 'Mozilla/5.0 (TennoLedger data pipeline)' },
});
if (!regionsRes.ok) throw new Error(`ExportRegions: HTTP ${regionsRes.status}`);
const regions = await regionsRes.json();
const nodes = {};
for (const [tag, n] of Object.entries(regions)) {
  if (n.nodeType === 7) nodes[tag] = 1000;
  else if (n.masteryExp > 0) nodes[tag] = n.masteryExp;
}
console.log(`Kept ${Object.keys(nodes).length} mastery-granting nodes/junctions`);

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data');
mkdirSync(outDir, { recursive: true });
const out = { generatedAt: new Date().toISOString(), items, nodes };
const json = JSON.stringify(out);
writeFileSync(path.join(outDir, 'items.json'), json);
console.log(`Wrote public/data/items.json (${(json.length / 1024 / 1024).toFixed(2)} MB)`);

// ---------------------------------------------------------------------------
// Mods — the whole equippable roster (for the Mods page). Same WFCD source.
// Mastery items are gear; mods are their own dataset with weapon-slot
// compatibility, rarity, polarity and drop tables.
// ---------------------------------------------------------------------------
console.log('Fetching mod data from WFCD/warframe-items ...');
const rawMods = await fetchJson('Mods.json');
console.log(`Fetched ${rawMods.length} raw mods`);

// Only real, equippable gear mods. Skips Focus ways, Rivens, Parazon/Plexus/
// K-Drive/Railjack niche mods, Peculiar/Transmutation junk, and the invisible
// set-bonus pseudo-entries.
const MOD_SLOT = {
  'Warframe Mod': 'Warframe',
  'Aura': 'Aura',
  'Primary Mod': 'Primary',
  'Shotgun Mod': 'Shotgun',
  'Secondary Mod': 'Secondary',
  'Melee Mod': 'Melee',
  'Stance Mod': 'Melee',
  'Companion Mod': 'Companion',
  'Arch-Gun Mod': 'Archwing',
  'Arch-Melee Mod': 'Archwing',
  'Archwing Mod': 'Archwing',
  'Necramech Mod': 'Necramech',
};

const seenMods = new Set();
const mods = [];
for (const m of rawMods) {
  // Aura mods carry type "Warframe Mod" but compatName "AURA"; split them out
  // so the slot filter can separate frame mods from auras.
  const slot = m.compatName === 'AURA' ? 'Aura' : MOD_SLOT[m.type];
  if (!slot) continue;
  if (!m.name || seenMods.has(m.name)) continue;
  seenMods.add(m.name);
  mods.push({
    name: m.name,
    slot,
    // The specific compatibility (e.g. "Sniper", "Volt", "Claws") — a useful
    // sub-label under the broad slot bucket. Blank for universal mods.
    compat: m.compatName && m.compatName !== m.type && m.compatName !== 'AURA' ? m.compatName : null,
    rarity: m.rarity ?? null,
    polarity: m.polarity ?? null,
    image: m.imageName ?? null,
    isPrime: !!m.isPrime,
    tradable: !!m.tradable,
    drops: bestDrops(m.drops, 2),
  });
}
mods.sort((a, b) => a.slot.localeCompare(b.slot) || a.name.localeCompare(b.name));
console.log(`Kept ${mods.length} equippable mods`);

const modsOut = { generatedAt: new Date().toISOString(), mods };
const modsJson = JSON.stringify(modsOut);
writeFileSync(path.join(outDir, 'mods.json'), modsJson);
console.log(`Wrote public/data/mods.json (${(modsJson.length / 1024 / 1024).toFixed(2)} MB)`);
