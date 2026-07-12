// Heuristic farming difficulty. Lower score = easier to obtain.
// Ordering: market blueprints < guaranteed/likely drops < dojo research <
// vendors/quests < low-chance grinds < Prime relics < vaulted Primes.
//
// The score is the recipe cost (how you get the blueprint) PLUS the part-farm
// cost (how hard the crafted parts are to drop). Part-farm difficulty uses
// estimated runs — sum of 1/chance over the best drop of each part — so one 2%
// part correctly outweighs three 38% parts, and a market blueprint whose parts
// only drop from a rare rotation is NOT treated as a quick pickup.
//
// Two data traps the part-farm cost must ignore, or easy market weapons look
// brutal: (1) the main "Blueprint" component often lists a spurious low-chance
// alt-source even though you just buy it (bpCost) — skip it when buyable; and
// (2) ingredient weapons (Akbronco needs 2× Bronco) appear as components with
// junk drops — they are priced separately via weaponIngredients, not farmed.

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

// Best drop per farmed part. Excludes two false "farms": the main Blueprint
// when it's buyable on the market (bpCost), and ingredient weapons that are
// crafted separately. Falls back to the item's own drops only when nothing is
// buyable, so a directly-purchasable weapon never inherits a junk alt-source.
function collectSources(item) {
  const ingredients = new Set((item.weaponIngredients ?? []).map(w => w.name));
  const sources = [];
  for (const c of item.components ?? []) {
    const d = c.drops?.[0];
    if (!d?.location) continue;
    if (c.name === 'Blueprint' && item.bpCost) continue; // buy it, don't farm it
    if (ingredients.has(c.name)) continue;               // built weapon, priced below
    sources.push({ loc: cleanLoc(d.location), chance: norm(d.chance) });
  }
  if (sources.length === 0 && !item.bpCost) {
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

export function farmInfo(item, userMr = null) {
  if (item.unobtainable) {
    return { score: Infinity, tier: 'unobtainable', tierLabel: 'Unobtainable', reason: 'Founders exclusive — no longer acquirable', where: null };
  }
  let score = (item.masteryReq ?? 0) * 1.5;
  // Above the player's rank it can't be claimed from the foundry yet, so it
  // is never a "quick pickup" no matter how easy the farm is.
  const mrLocked = userMr != null && (item.masteryReq ?? 0) > userMr;
  if (mrLocked) score += 25;
  let reason;
  let where = null;
  const sources = collectSources(item);

  // Part-farm cost: expected runs to see every farmed part drop once. One 2%
  // part outweighs three 40% parts. Zero when the parts are bought or built.
  const chances = sources.map(s => s.chance).filter(c => c != null && c > 0);
  const runs = chances.length ? chances.reduce((sum, c) => sum + 1 / c, 0) : 0;
  const partScore = Math.min(60, runs * 1.1);
  const grindy = chances.length > 0 && runs > chances.length + 0.5;
  const runsTxt = `about ${Math.ceil(runs)} runs to farm the parts`;

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
    score += 22 + partScore;
    reason = 'Clan dojo research — replicate the blueprint from your dojo lab';
    if (grindy) reason += ` · ${runsTxt}`;
    where = whereText(sources);
    if (where) where = `Parts: ${where}`;
  } else if (item.bpCost) {
    score += 5 + partScore;
    reason = `Blueprint on the market for ${item.bpCost.toLocaleString()} credits`;
    if (chances.length) reason += grindy ? ` · ${runsTxt}` : ' · parts drop reliably';
    where = whereText(sources);
    if (where) where = `Parts: ${where}`;
  } else if (chances.length) {
    where = whereText(sources);
    score += 8 + partScore;
    reason = grindy
      ? `Farmed drops — ${runsTxt}`
      : 'Guaranteed drops — one run per part';
  } else {
    score += 40;
    reason = 'Quest, vendor or bundle reward — see the wiki page';
  }

  if (item.weaponIngredients?.length) {
    const parts = item.weaponIngredients.map(w => `${w.count}× ${w.name}`).join(', ');
    reason += ` · also needs ${parts} built`;
    score += 6 * item.weaponIngredients.length;
  }
  if (mrLocked) {
    reason = `Locked until MR ${item.masteryReq} · ${reason}`;
  }

  const tier = TIERS.find(t => score <= t.max);
  return { score, tier: tier.key, tierLabel: tier.label, reason, where };
}

export const TIER_ORDER = TIERS.map(t => t.key);
export const TIER_LABELS = Object.fromEntries(TIERS.map(t => [t.key, t.label]));
