import { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { STATUS, masterySummary } from '../lib/mastery.js';
import { farmInfo, TIER_ORDER, TIER_LABELS } from '../lib/farming.js';
import ItemCard from './ItemCard.jsx';

export default function FarmPlanner() {
  const { items, progress } = useStore();
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

  const cats = useMemo(
    () => [...new Set((items ?? []).map(i => i.category))].sort(),
    [items],
  );

  const { farming, leveling, tiers, totalLeft, mr } = useMemo(() => {
    const { mr } = masterySummary(items ?? [], progress.status, progress.extraXp, progress.itemXp);
    const needle = q.trim().toLowerCase();
    const inCat = (items ?? []).filter(i =>
      !i.unobtainable
      && (cat === 'all' || i.category === cat)
      && (!needle || i.name.toLowerCase().includes(needle)));

    // Easiest first; ties broken by mastery value so 6000 XP frames outrank
    // 3000 XP weapons of equal effort.
    const byPayoff = (a, b) => a.farm.score - b.farm.score || b.item.totalXp - a.item.totalXp;

    // Items you actively marked as being hunted right now — the to-do list.
    const farming = inCat
      .filter(i => (progress.status[i.id] ?? STATUS.MISSING) === STATUS.FARMING)
      .map(i => ({ item: i, farm: farmInfo(i, mr) }))
      .sort(byPayoff);

    // Owned items you're currently ranking up — surfaced here so once a farm
    // finishes you can jump straight to marking it mastered. No farm info: it's
    // already in your inventory. Highest mastery payoff first.
    const leveling = inCat
      .filter(i => (progress.status[i.id] ?? STATUS.MISSING) === STATUS.OWNED)
      .map(i => ({ item: i }))
      .sort((a, b) => b.item.totalXp - a.item.totalXp || a.item.name.localeCompare(b.item.name));

    // Everything not yet acquired, easiest first. Leveling/mastered items are
    // already in your inventory, so they no longer need farming.
    const scored = inCat
      .filter(i => (progress.status[i.id] ?? STATUS.MISSING) === STATUS.MISSING)
      .map(i => ({ item: i, farm: farmInfo(i, mr) }))
      .sort(byPayoff);
    const tiers = new Map(TIER_ORDER.map(t => [t, []]));
    for (const s of scored) tiers.get(s.farm.tier)?.push(s);

    return { farming, leveling, tiers, totalLeft: scored.length, mr };
  }, [items, progress.status, progress.extraXp, progress.itemXp, cat, q]);

  return (
    <section>
      <div className="filters">
        <input
          className="inp inp-search" type="search" placeholder="Search equipment…"
          value={q} onChange={e => setQ(e.target.value)} aria-label="Search equipment"
        />
        <select className="inp" value={cat} onChange={e => setCat(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="filters-count">
          {totalLeft} items left to hunt, easiest first for MR {mr}. Items above your rank sink lower — you couldn't claim them yet.
          Tap a card and set it to "Farming" to pin it to your to-do list.
        </span>
      </div>

      {farming.length > 0 && (
        <div className="tier tier-farming">
          <h2 className="tier-title">Now farming <span className="tier-count">{farming.length}</span></h2>
          <div className="grid">
            {farming.map(({ item, farm }) => <ItemCard key={item.id} item={item} farm={farm} />)}
          </div>
        </div>
      )}

      {leveling.length > 0 && (
        <div className="tier tier-leveling">
          <h2 className="tier-title">Now leveling <span className="tier-count">{leveling.length}</span></h2>
          <div className="grid">
            {leveling.map(({ item }) => <ItemCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {TIER_ORDER.map(t => {
        const group = tiers.get(t) ?? [];
        if (!group.length) return null;
        return (
          <div key={t} className={`tier tier-${t}`}>
            <h2 className="tier-title">{TIER_LABELS[t]} <span className="tier-count">{group.length}</span></h2>
            <div className="grid">
              {group.map(({ item, farm }) => <ItemCard key={item.id} item={item} farm={farm} />)}
            </div>
          </div>
        );
      })}
      {totalLeft === 0 && farming.length === 0 && leveling.length === 0 && (
        <p className="empty">
          {q.trim()
            ? `No unacquired items match “${q.trim()}”.`
            : 'Nothing left to hunt here — everything is acquired or mastered. Go touch grass, Tenno.'}
        </p>
      )}
    </section>
  );
}
