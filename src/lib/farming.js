// Heuristic farming difficulty. Lower score = easier to obtain.
// Signals: market blueprint (credits) < farmed drops (weighted by best drop
// chances) < quest/vendor/dojo < prime relics < vaulted prime.

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

// Clan dojo research: ClanTech weapons (except invasion-reward Vandals)
// plus the Tenno Lab warframes.
const DOJO_FRAMES = new Set(['Volt', 'Banshee', 'Zephyr', 'Wukong', 'Nezha']);

export function isDojoResearch(item) {
  if (DOJO_FRAMES.has(item.name)) return true;
  return item.id.includes('/ClanTech/') && !item.name.endsWith('Vandal');
}

export function farmInfo(item) {
  if (item.unobtainable) {
    return { score: Infinity, tier: 'unobtainable', tierLabel: 'Unobtainable', reason: 'Founders exclusive — no longer acquirable' };
  }
  let score = (item.masteryReq ?? 0) * 1.5;
  let reason;

  if (item.isPrime) {
    if (item.vaulted) {
      score += 85;
      reason = 'Vaulted Prime — relics only via trading, Prime Resurgence or unvaulting';
    } else {
      score += 55;
      reason = 'Prime — farm the relics listed below and crack them';
    }
  } else if (isDojoResearch(item)) {
    score += 22;
    reason = 'Clan dojo research — replicate the blueprint from your dojo lab';
  } else if (item.bpCost) {
    score += 5;
    reason = `Blueprint on the in-game market for ${item.bpCost.toLocaleString()} credits`;
  } else {
    const chances = [];
    for (const c of item.components ?? []) {
      const best = norm(c.drops?.[0]?.chance);
      if (best != null) chances.push(best);
    }
    const own = norm(item.drops?.[0]?.chance);
    if (own != null) chances.push(own);
    if (chances.length) {
      const avg = chances.reduce((a, b) => a + b, 0) / chances.length;
      score += Math.min(70, (1 - avg) * 55 + chances.length * 2);
      reason = `Farmed from drops — average best chance ${(avg * 100).toFixed(1)}%`;
    } else {
      score += 40;
      reason = 'Quest, vendor, dojo research or bundle — see the wiki page';
    }
  }

  if (item.weaponIngredients?.length) {
    const parts = item.weaponIngredients.map(w => `${w.count}× ${w.name}`).join(', ');
    reason += ` · also needs ${parts} built`;
    score += 6 * item.weaponIngredients.length;
  }

  const tier = TIERS.find(t => score <= t.max);
  return { score, tier: tier.key, tierLabel: tier.label, reason };
}

export const TIER_ORDER = TIERS.map(t => t.key);
export const TIER_LABELS = Object.fromEntries(TIERS.map(t => [t.key, t.label]));
