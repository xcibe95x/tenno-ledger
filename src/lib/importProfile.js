// Import progress from the game's profile-viewing JSON
// (https://api.warframe.com/cdn/getProfileViewingData.php?playerId=ACCOUNTID).
//
// XPInfo lists per-item affinity. Affinity needed to reach rank r:
// 500 * r^2 for weapons/amps (100 mastery XP per rank),
// 1000 * r^2 for frames/companions/archwings/mechs (200 per rank).
// Mission nodes, junctions (1000 each), Steel Path (x2) and intrinsic ranks
// (1500 each) are computed from the same JSON.

import { STATUS, xpForMr } from './mastery.js';

// Game entries that map onto a different item in our list (e.g. the
// Orion/Sirius twins are tracked as a single warframe).
const ALIASES = {
  '/Lotus/Powersuits/SiriusOrion/OrionSuit': '/Lotus/Powersuits/SiriusOrion/SiriusSuit',
};

function collectXp(profile) {
  const root = profile?.Results?.[0];
  if (!root) throw new Error('Not a profile JSON — expected a "Results" array. Copy the whole page.');
  const xpByType = new Map();
  const add = (type, xp) => {
    if (!type || typeof xp !== 'number') return;
    let clean = type.replace(/_Primary$/, '');
    clean = ALIASES[clean] ?? clean;
    xpByType.set(clean, Math.max(xpByType.get(clean) ?? 0, xp));
  };
  for (const e of root.LoadOutInventory?.XPInfo ?? []) add(e.ItemType, e.XP);
  for (const w of root.Stats?.Weapons ?? []) add(w.type, w.xp);
  if (xpByType.size === 0) throw new Error('No XP data found in this profile JSON.');
  return xpByType;
}

function starChartXp(profile, nodes) {
  const root = profile?.Results?.[0];
  let xp = 0;
  let completed = 0;
  // Mission records live both at the root and under Stats; merge by tag,
  // keeping the Steel Path flag (Tier 1) if either record has it.
  const byTag = new Map();
  for (const list of [root?.Missions, root?.Stats?.Missions]) {
    for (const m of list ?? []) {
      if (!m?.Tag) continue;
      const prev = byTag.get(m.Tag);
      byTag.set(m.Tag, { steelPath: (prev?.steelPath ?? false) || m.Tier === 1 });
    }
  }
  for (const [tag, info] of byTag) {
    const nodeXp = nodes[tag];
    if (!nodeXp) continue;
    xp += nodeXp * (info.steelPath ? 2 : 1);
    completed++;
  }
  return { xp, completed };
}

function intrinsicsXp(profile) {
  const skills = profile?.Results?.[0]?.PlayerSkills ?? {};
  let ranks = 0;
  for (const [key, val] of Object.entries(skills)) {
    if (key.startsWith('LPS_') && typeof val === 'number') ranks += val;
  }
  return { xp: ranks * 1500, ranks };
}

export function importFromProfile(profileJson, items, currentStatus, nodes = {}) {
  const xpByType = collectXp(profileJson);
  const status = { ...currentStatus };
  const itemXp = {};
  let mastered = 0;
  let leveling = 0;
  let already = 0;

  for (const item of items) {
    const xp = xpByType.get(item.id);
    if (xp == null || xp <= 0) continue;
    const coef = item.perRank === 200 ? 1000 : 500;
    const rank = Math.min(item.maxRank, Math.floor(Math.sqrt(xp / coef)));
    const imported = rank >= item.maxRank ? STATUS.MASTERED : STATUS.OWNED;
    if (imported !== STATUS.MASTERED && rank > 0) {
      itemXp[item.id] = rank * item.perRank;
    }
    const existing = status[item.id] ?? STATUS.MISSING;
    if (imported > existing) {
      status[item.id] = imported;
      if (imported === STATUS.MASTERED) mastered++; else leveling++;
    } else {
      already++;
    }
  }

  const starChart = starChartXp(profileJson, nodes);
  const intrinsics = intrinsicsXp(profileJson);
  let extraXp = starChart.xp + intrinsics.xp;

  // The profile states the player's true rank (PlayerLevel). DE's endpoint
  // under-reports a sliver of star chart/intrinsic progress, so if our total
  // lands below the XP that rank requires, top up the difference.
  const playerLevel = profileJson?.Results?.[0]?.PlayerLevel;
  let calibrationXp = 0;
  if (typeof playerLevel === 'number' && playerLevel > 0) {
    let earned = extraXp;
    for (const item of items) {
      if (status[item.id] === STATUS.MASTERED) earned += item.totalXp;
      else earned += Math.min(itemXp[item.id] ?? 0, item.totalXp);
    }
    const required = xpForMr(playerLevel);
    if (earned < required) {
      calibrationXp = required - earned;
      extraXp += calibrationXp;
    }
  }

  // Profile entries that matched nothing — surfaced so missing mastery is
  // visible instead of silently dropped. Exalted/NPC gear is expected here.
  const known = new Set(items.map(i => i.id));
  const unmatched = [...xpByType.entries()]
    .filter(([type, xp]) => !known.has(type) && xp >= 100000)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([type, xp]) => ({ name: type.split('/').pop(), xp }));

  const matched = items.filter(i => xpByType.has(i.id)).length;
  return {
    status,
    itemXp,
    extraXp,
    summary: {
      mastered, leveling, already, matched,
      totalInProfile: xpByType.size,
      nodesCompleted: starChart.completed,
      starChartXp: starChart.xp,
      intrinsicRanks: intrinsics.ranks,
      intrinsicsXp: intrinsics.xp,
      playerLevel,
      calibrationXp,
      unmatched,
    },
  };
}
