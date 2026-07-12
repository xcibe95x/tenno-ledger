// Heuristic farming difficulty. Lower score = easier to obtain.
// Ordering: market blueprints < guaranteed/likely drops < dojo research <
// vendors/quests < low-chance grinds < Prime relics < vaulted Primes.
// Drop-based difficulty uses estimated runs: sum of 1/chance over the best
// drop of each part, so one 2% part correctly outweighs three 38% parts.

const TIERS = [
  { max: 15, key: 'trivial', label: 'Quick pickups' },
  { max: 35, key: 'easy', label: 'Easy farms' },
  { max: 55, key: 'moderate', label: 'Moderate farms' },
  { max: 80, key: 'hard', label: 'Long grinds' },
  { max: Infinity, key: 'brutal', label: 'Vaulted & painful' },
];

function norm(chance) {
  if (chance == null) return null;
  return chance > 1 ? chance / 100 : chance;
}

function cleanLoc(loc = '') {
  return loc
    .replace(/\s*\((?:Intact|Exceptional|Flawless|Radiant)\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Best drop per part (components first, else the item's own drops).
function collectSources(item) {
  const sources = [];
  for (const c of item.components ?? []) {
    const d = c.drops?.[0];
    if (d?.location) sources.push({ loc: cleanLoc(d.location), chance: norm(d.chance) });
  }
  if (sources.length === 0) {
    for (const d of (item.drops ?? []).slice(0, 2)) {
      if (d?.location) sources.push({ loc: cleanLoc(d.location), chance: norm(d.chance) });
    }
  }
  return sources;
}

// Short "where to get it" line: distinct locations, best chance shown, capped.
function whereText(sources, max = 3) {
  const byLoc = new Map();
  for (const s of sources) {
    const prev = byLoc.get(s.loc);
    if (!prev || (s.chance ?? 0) > (prev.chance ?? 0)) byLoc.set(s.loc, s);
  }
  const locs = [...byLoc.values()];
  if (!locs.length) return null;
  const shown = locs.slice(0, max).map(s =>
    s.chance != null ? `${s.loc} (${(s.chance * 100).toFixed(s.chance < 0.1 ? 1 : 0)}%)` : s.loc);
  const more = locs.length - max;
  return shown.join(' · ') + (more > 0 ? ` · +${more} more` : '');
}

// Clan dojo research: ClanTech weapons (except invasion-reward Vandals)
// plus the Tenno Lab warframes.
const DOJO_FRAMES = new Set(['Volt', 'Banshee', 'Zephyr', 'Wukong', 'Nezha']);

export function isDojoResearch(item) {
  if (DOJO_FRAMES.has(item.name)) return true;
  return item.id.includes('/ClanTech/') && !item.name.endsWith('Vandal');
}

// Baro Ki'Teer exclusives — only purchasable during his biweekly visits.
export function isBaroExclusive(item) {
  return /^(Prisma|Mara)\s/.test(item.name);
}

export function farmInfo(item) {
  if (item.unobtainable) {
    return { score: Infinity, tier: 'unobtainable', tierLabel: 'Unobtainable', reason: 'Founders exclusive — no longer acquirable', where: null };
  }
  let score = (item.masteryReq ?? 0) * 1.5;
  let reason;
  let where = null;
  const sources = collectSources(item);

  if (item.isPrime) {
    // Component drop locations for primes are the relics themselves.
    const relics = [...new Set(sources.map(s => s.loc.replace(/\s*Relic.*$/i, '')))];
    where = relics.length ? `Relics: ${relics.slice(0, 4).join(', ')}${relics.length > 4 ? ` +${relics.length - 4} more` : ''}` : null;
    if (item.vaulted) {
      score += 85;
      reason = 'Vaulted Prime — relics only via trading, Prime Resurgence or unvaulting';
    } else {
      score += 55;
      reason = 'Prime — farm and crack the relics';
    }
  } else if (isBaroExclusive(item)) {
    score += 50;
    reason = "Baro Ki'Teer exclusive — buy with ducats + credits when his rotation brings it";
    where = 'Void Trader, every 2 weeks at a relay';
  } else if (isDojoResearch(item)) {
    score += 22;
    reason = 'Clan dojo research — replicate the blueprint from your dojo lab';
  } else if (item.bpCost) {
    score += 5;
    reason = `Blueprint on the market for ${item.bpCost.toLocaleString()} credits`;
    where = whereText(sources.filter(s => s.chance != null), 2);
    if (where) where = `Parts: ${where}`;
  } else {
    const chances = sources.map(s => s.chance).filter(c => c != null && c > 0);
    where = whereText(sources);
    if (chances.length) {
      // Expected total runs to see every part drop once.
      const runs = chances.reduce((sum, c) => sum + 1 / c, 0);
      score += Math.min(70, 8 + runs * 1.1);
      reason = runs <= chances.length + 0.5
        ? 'Guaranteed drops — one run per part'
        : `Farmed drops — roughly ${Math.ceil(runs)} runs for all parts`;
    } else {
      score += 40;
      reason = 'Quest, vendor or bundle reward — see the wiki page';
    }
  }

  if (item.weaponIngredients?.length) {
    const parts = item.weaponIngredients.map(w => `${w.count}× ${w.name}`).join(', ');
    reason += ` · also needs ${parts} built`;
    score += 6 * item.weaponIngredients.length;
  }

  const tier = TIERS.find(t => score <= t.max);
  return { score, tier: tier.key, tierLabel: tier.label, reason, where };
}

export const TIER_ORDER = TIERS.map(t => t.key);
export const TIER_LABELS = Object.fromEntries(TIERS.map(t => [t.key, t.label]));
