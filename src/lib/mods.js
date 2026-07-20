// Meta overlay for the mod roster. The full list of equippable mods (with
// images, slots, rarity and drop tables) is generated into public/data/mods.json
// by scripts/fetch-data.mjs. This file adds the editorial layer on top: which
// mods are the community-consensus "must-own" staples, what tier they belong to,
// a one-line reason, and — where the raw drop table is confusing — a cleaner
// source note. Everything not listed here is still shown (that's the whole
// roster), just without the gold Meta treatment; the "Meta only" toggle hides
// them. Editorial by nature; trim or extend as balance patches land.

export const IMG = 'https://cdn.warframestat.us/img/';

export const MOD_TIERS = [
  { key: 'core', label: '① Core progression — grab these first', hint: 'Cheap, universal, and they make every build function. Most cost a handful of Platinum in trade chat if the drop is slow.' },
  { key: 'damage', label: '② Weapon damage — crit, status & multishot', hint: 'The multipliers that turn a leveled weapon into a Steel Path weapon. Galvanized mods stack on kill and have largely replaced the old flat-damage staples in serious builds.' },
  { key: 'ability', label: '③ Warframe ability power', hint: 'Strength / range / duration / efficiency — the corrupted and Umbral/Archon mods that define caster builds. Corrupted mods come from Orokin Vaults in the Deimos Derelict.' },
  { key: 'survival', label: '④ Survivability — stay alive in the Steel Path', hint: 'Damage reduction, shield-gating and knockdown immunity. Bigger grinds, but they are what keep you standing past level 100.' },
  { key: 'primed', label: '⑤ Baro & primed upgrades — long-term chase', hint: "Straight upgrades to core mods, mostly sold by Baro Ki'Teer for ducats + credits on his biweekly relay visits. Not urgent, but permanent power." },
];

// name -> [tier, effect, whereOverride?]. whereOverride is optional; when
// omitted the card falls back to the best drop location from the dataset.
const M = (tier, effect, where) => ({ tier, effect, where });

export const META = new Map([
  // ---------- ① Core ----------
  ['Serration', M('core', '+165% rifle base damage — the single biggest primary multiplier', 'Spy caches / enemy drops · trade chat (cheap)')],
  ['Split Chamber', M('core', '+90% rifle multishot — near-doubles your damage', 'Enemy drop · trade chat')],
  ['Hornet Strike', M('core', '+220% secondary base damage', 'Enemy drop · trade chat (cheap)')],
  ['Barrel Diffusion', M('core', '+120% secondary multishot', 'Enemy drop · trade chat')],
  ['Point Blank', M('core', '+90% shotgun base damage', 'Enemy drop · trade chat (cheap)')],
  ["Hell's Chamber", M('core', '+120% shotgun multishot', 'Enemy drop · trade chat')],
  ['Pressure Point', M('core', '+120% melee base damage', 'Enemy drop · trade chat (cheap)')],
  ['Vitality', M('core', '+440% health — the default survivability mod', 'Chipper (Kahl\'s Garrison) · enemy drop · trade chat')],
  ['Steel Fiber', M('core', '+110% armor for tanky frames', 'Enemy drop · trade chat (cheap)')],
  ['Flow', M('core', '+150% max energy — fuels ability spam')],
  ['Streamline', M('core', '+30% ability efficiency')],
  ['Stretch', M('core', '+45% ability range')],
  ['Intensify', M('core', '+30% ability strength')],
  ['Continuity', M('core', '+30% ability duration')],
  ['Redirection', M('core', '+440% shields — pairs with shield-gating builds', 'Enemy drop · trade chat (cheap)')],

  // ---------- ② Weapon damage ----------
  ['Point Strike', M('damage', '+150% rifle critical chance — mandatory on crit rifles')],
  ['Vital Sense', M('damage', '+120% rifle critical damage')],
  ['Hunter Munitions', M('damage', 'Crits proc bleed — the go-to Steel Path scaling for crit primaries', 'Ghoul bounties (Plains of Eidolon) · Plague Star')],
  ['Vigilante Armaments', M('damage', '+60% rifle multishot + chance to boost crit tier (set bonus)', 'Cetus bounties (Plains of Eidolon) · Thumpers')],
  ['Heavy Caliber', M('damage', '+165% rifle damage (corrupted: adds spread)', 'Orokin Vault — Deimos Derelict')],
  ['Galvanized Chamber', M('damage', 'Multishot that stacks on kill — the Serration successor', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Aptitude', M('damage', 'Status damage that ramps per status type on the target', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Scope', M('damage', 'Crit chance that stacks on headshot kills', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Diffusion', M('damage', 'On-kill stacking multishot for secondaries', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Shot', M('damage', 'Secondary status damage that ramps per status type', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Crosshairs', M('damage', 'Secondary crit chance that stacks on headshot kills', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Hell', M('damage', 'On-kill stacking multishot for shotguns', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Savvy', M('damage', 'Shotgun status damage that ramps per status type', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Acceleration', M('damage', 'Shotgun crit chance that stacks on headshot kills', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Steel', M('damage', 'Melee crit chance that stacks on kill', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Elementalist', M('damage', 'Melee elemental damage that ramps per status type', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Galvanized Reflex', M('damage', 'Melee combo-count gain that stacks on heavy-attack kills', "Teshin's Steel Path Honors (Steel Essence)")],
  ['Blood Rush', M('damage', 'Crit chance scales with your combo counter — core of every crit melee', 'Duviri Circuit · Cambion Drift bounties · Lua Spy · trade chat')],
  ['Weeping Wounds', M('damage', 'Status chance scales with combo — pairs with Condition Overload', 'Duviri Circuit · Cambion Drift bounties · trade chat')],
  ['Condition Overload', M('damage', '+80% melee damage per unique status on the enemy — enormous', 'Deimos / Infested enemy drop · Duviri Circuit · trade chat (cheap)')],
  ['Organ Shatter', M('damage', '+90% melee critical damage', 'Raptor (Europa) · enemy drops · trade chat (cheap)')],
  ['Sacrificial Steel', M('damage', '+220% melee crit chance (Sacrificial set) — top melee crit', 'The Sacrifice quest reward')],
  ['Sacrificial Pressure', M('damage', '+165% melee damage (Sacrificial set)', 'The Sacrifice quest reward')],
  ['Berserker Fury', M('damage', 'Crit-triggered attack speed — melee tempo staple', 'Duviri Circuit · enemy drops · trade chat')],

  // ---------- ③ Ability power ----------
  ['Umbral Intensify', M('ability', '+77% strength alone, more with the Umbral set — top strength mod', 'The Sacrifice quest reward')],
  ['Blind Rage', M('ability', '+99% strength (corrupted: −55% efficiency)', 'Orokin Vault — Deimos Derelict')],
  ['Transient Fortitude', M('ability', '+55% strength (corrupted: −27.5% duration)', 'Orokin Vault — Deimos Derelict')],
  ['Overextended', M('ability', '+90% range (corrupted: −60% strength)', 'Orokin Vault — Deimos Derelict')],
  ['Fleeting Expertise', M('ability', '+60% efficiency (corrupted: −60% duration)', 'Orokin Vault — Deimos Derelict')],
  ['Narrow Minded', M('ability', '+99% duration (corrupted: −66% range)', 'Orokin Vault — Deimos Derelict')],
  ['Archon Intensify', M('ability', 'Strength + on-heal ability-strength surge', "Chipper (Kahl's Garrison) — weekly Break Narmer missions")],
  ['Archon Continuity', M('ability', 'Duration + spreads toxin and boosts status abilities', "Chipper (Kahl's Garrison) — weekly Break Narmer missions")],
  ['Archon Stretch', M('ability', 'Range + energy regen on electric procs', "Chipper (Kahl's Garrison) — weekly Break Narmer missions")],
  ['Augur Secrets', M('ability', 'Ability strength + shield-gate restore (Augur set)', 'Tusk / Narmer Thumpers (Plains) · Cetus bounties · trade chat')],
  ['Augur Message', M('ability', 'Ability duration — completes the Augur shield-gate set', 'Tusk / Narmer Thumpers (Plains) · Cetus bounties · trade chat')],
  ['Augur Reach', M('ability', 'Ability range — completes the Augur shield-gate set', 'Tusk / Narmer Thumpers (Plains) · Cetus bounties · trade chat')],
  ['Precision Intensify', M('ability', '+90% strength to your Helminth-subsumed ability only', 'Deimos Fragmented enemies (Cambion Drift) — rare drop')],

  // ---------- ④ Survivability ----------
  ['Adaptation', M('survival', 'Stacks up to 90% damage reduction vs. the damage types hitting you', 'Arbitrations (Rotation A/B) · trade chat')],
  ['Rolling Guard', M('survival', 'Roll for brief invulnerability + status cleanse — the shield-gate reset', 'Arbitrations (Vitus Essence vendor)')],
  ['Primed Sure Footed', M('survival', '~94% knockdown immunity — huge quality-of-life on AoE frames', 'Daily Tribute login reward (choose at day 700)')],
  ['Brief Respite', M('survival', 'Refills energy equal to shields on shield restore — free energy engine', 'Orphid Specters (Zariman) · trade chat')],
  ['Umbral Vitality', M('survival', 'Big health + Umbral set scaling for armor/strength', 'The Sacrifice quest reward')],
  ['Umbral Fiber', M('survival', 'Big armor + Umbral set scaling', 'The Sacrifice quest reward')],
  ['Quick Thinking', M('survival', 'Lethal damage drains energy instead of health — panic button', 'Duviri Circuit · Corrupted Ancients (Void) · trade chat')],
  ['Catalyzing Shields', M('survival', 'Caps shields low for instant, reliable shield-gating (corrupted)', 'Orokin Vault — Deimos Derelict')],
  ['Equilibrium', M('survival', 'Health orbs give energy and vice-versa — sustain engine', 'Infested Ancients (enemy drop) · trade chat')],
  ['Health Conversion', M('survival', 'Health orbs grant stacking armor', 'Cephalon Simaris (Standing offering)')],

  // ---------- ⑤ Baro & primed ----------
  ['Primed Continuity', M('primed', '+55% duration — straight upgrade over Continuity', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Flow', M('primed', '+275% max energy', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Redirection', M('primed', '+275% shields', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Pressure Point', M('primed', '+165% melee damage — upgrade over Pressure Point', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Point Blank', M('primed', '+165% shotgun damage', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Reach', M('primed', '+165% melee range — transformative on many weapons', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Shred', M('primed', '+55% fire rate + 4.2m punch-through — top rifle utility mod', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Cryo Rounds', M('primed', '+165% cold — a viral-build staple for rifles', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Heated Charge', M('primed', '+165% heat for secondaries — viral/gas builds', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Pistol Gambit', M('primed', '+187% secondary critical chance', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Target Cracker', M('primed', '+165% secondary critical damage', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Fulmination', M('primed', '+90% AoE blast radius for launchers/explosive secondaries', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Fever Strike', M('primed', '+165% melee toxin — feeds viral/gas melee', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Fury', M('primed', '+55% melee attack speed', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Bane Of Grineer', M('primed', '+55% damage to Grineer — one Bane per faction, all top Steel Path picks', "Baro Ki'Teer (Void Trader, biweekly)")],
  ['Primed Sure Footed', M('survival', '~94% knockdown immunity', 'Daily Tribute login reward (day 700)')],
]);

export const SLOT_ORDER = ['Warframe', 'Aura', 'Primary', 'Shotgun', 'Secondary', 'Melee', 'Companion', 'Archwing', 'Necramech'];

export const RARITY_ORDER = { Legendary: 0, Rare: 1, Uncommon: 2, Common: 3 };

export function metaInfo(name) {
  return META.get(name) ?? null;
}

// The mod's visual "tier" for the card border — mirrors the in-game backing:
// Common bronze, Uncommon silver, Rare gold, Legendary platinum, plus the two
// families that read distinctly in-game (Archon crimson, Galvanized gunmetal).
export function modTier(mod) {
  const n = mod.name ?? '';
  if (n.startsWith('Archon ')) return 'archon';
  if (n.startsWith('Galvanized ')) return 'galvanized';
  if (n.startsWith('Amalgam ')) return 'amalgam';
  if (mod.isPrime || n.startsWith('Primed ')) return 'prime';
  return (mod.rarity ?? 'Common').toLowerCase();
}

// Legend entries in display order — drives the little key under the filters.
export const TIER_LEGEND = [
  { key: 'common', label: 'Common' },
  { key: 'uncommon', label: 'Uncommon' },
  { key: 'rare', label: 'Rare' },
  { key: 'legendary', label: 'Umbra' },
  { key: 'prime', label: 'Primed' },
  { key: 'archon', label: 'Archon' },
  { key: 'galvanized', label: 'Galvanized' },
  { key: 'amalgam', label: 'Amalgam' },
];

// Concise "where to get it" from the dataset drop table, best chance first.
export function dropText(mod) {
  const d = (mod.drops ?? [])[0];
  const loc = d?.location?.replace(/\s+/g, ' ').trim();
  if (!loc) return mod.tradable ? 'Tradable — buy in trade chat, or check the wiki for drops' : 'See wiki for the source';
  const pct = d.chance != null ? ` (${d.chance < 1 ? d.chance.toFixed(1) : Math.round(d.chance)}%)` : '';
  return `${loc}${pct}`;
}

export function wikiUrl(name) {
  return `https://wiki.warframe.com/w/${encodeURIComponent(name.replace(/ /g, '_'))}`;
}
