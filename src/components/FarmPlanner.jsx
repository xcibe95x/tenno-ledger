import { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { STATUS } from '../lib/mastery.js';
import { farmInfo, TIER_ORDER, TIER_LABELS } from '../lib/farming.js';
import ItemCard from './ItemCard.jsx';

export default function FarmPlanner() {
  const { items, progress } = useStore();
  const [cat, setCat] = useState('all');

  const cats = useMemo(
    () => [...new Set((items ?? []).map(i => i.category))].sort(),
    [items],
  );

  const { farming, tiers, totalLeft } = useMemo(() => {
    const inCat = (items ?? []).filter(i =>
      !i.unobtainable && (cat === 'all' || i.category === cat));

    // Items you actively marked as being hunted right now — the to-do list.
    const farming = inCat
      .filter(i => (progress.status[i.id] ?? STATUS.MISSING) === STATUS.FARMING)
      .map(i => ({ item: i, farm: farmInfo(i) }))
      .sort((a, b) => a.farm.score - b.farm.score);

    // Everything not yet acquired, easiest first. Leveling/mastered items are
    // already in your inventory, so they no longer need farming.
    const scored = inCat
      .filter(i => (progress.status[i.id] ?? STATUS.MISSING) === STATUS.MISSING)
      .map(i => ({ item: i, farm: farmInfo(i) }))
      .sort((a, b) => a.farm.score - b.farm.score);
    const tiers = new Map(TIER_ORDER.map(t => [t, []]));
    for (const s of scored) tiers.get(s.farm.tier)?.push(s);

    return { farming, tiers, totalLeft: scored.length };
  }, [items, progress.status, cat]);

  return (
    <section>
      <div className="filters">
        <select className="inp" value={cat} onChange={e => setCat(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="filters-count">
          {totalLeft} items left to hunt, easiest first. Tap a card and set it to "Farming" to pin it to your to-do list.
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
      {totalLeft === 0 && farming.length === 0 && (
        <p className="empty">Nothing left to hunt here — everything is acquired or mastered. Go touch grass, Tenno.</p>
      )}
    </section>
  );
}
