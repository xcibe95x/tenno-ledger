// Mastery Rank math. Total XP required for MR n is 2500 * n^2.
// Equipment XP: weapons/amps give 100 XP per rank, frames/companions/
// archwings/necramechs/k-drives give 200 (already baked into item.totalXp).

// Item lifecycle: not started -> hunting the blueprint/parts -> owned and
// gaining affinity -> fully mastered.
export const STATUS = { MISSING: 0, FARMING: 1, OWNED: 2, MASTERED: 3 };
export const STATUS_COUNT = 4;
export const STATUS_LABELS = ['Missing', 'Farming', 'Leveling', 'Mastered'];

export function mrFromXp(xp) {
  return Math.min(40, Math.floor(Math.sqrt(Math.max(0, xp) / 2500)));
}

export function xpForMr(mr) {
  return 2500 * mr * mr;
}

export function mrLabel(mr) {
  return mr > 30 ? `LR ${mr - 30}` : `MR ${mr}`;
}

export function masterySummary(items, status, extraXp = 0, itemXp = {}) {
  let earned = 0;
  let total = 0;
  let masteredCount = 0;
  for (const it of items) {
    total += it.totalXp;
    if (status[it.id] === STATUS.MASTERED) {
      earned += it.totalXp;
      masteredCount++;
    } else {
      // Partially ranked items count their earned ranks, like in-game.
      earned += Math.min(itemXp[it.id] ?? 0, it.totalXp);
    }
  }
  const xp = earned + extraXp;
  const mr = mrFromXp(xp);
  const next = xpForMr(mr + 1);
  const cur = xpForMr(mr);
  return {
    earned, total, xp, mr, masteredCount,
    itemCount: items.length,
    nextPct: Math.min(1, (xp - cur) / (next - cur)),
    toNext: Math.max(0, next - xp),
  };
}
