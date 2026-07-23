import { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { STATUS } from '../lib/mastery.js';
import ItemCard from './ItemCard.jsx';

const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name),
  xp: (a, b) => b.totalXp - a.totalXp,
  mr: (a, b) => a.masteryReq - b.masteryReq,
};

export default function Collection() {
  const { items, progress } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [st, setSt] = useState('all');
  const [variant, setVariant] = useState('all');
  const [sort, setSort] = useState('name');

  const cats = useMemo(
    () => [...new Set((items ?? []).map(i => i.category))].sort(),
    [items],
  );

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (items ?? [])
      .filter(i =>
        (cat === 'all' || i.category === cat) &&
        (st === 'all' || (progress.status[i.id] ?? STATUS.MISSING) === Number(st)) &&
        (variant === 'all' || (variant === 'prime' ? i.isPrime : !i.isPrime)) &&
        (!needle || i.name.toLowerCase().includes(needle)))
      .sort(SORTS[sort]);
  }, [items, q, cat, st, variant, sort, progress.status]);

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
        <select className="inp" value={st} onChange={e => setSt(e.target.value)} aria-label="Status">
          <option value="all">Any status</option>
          <option value="0">Missing</option>
          <option value="1">Farming</option>
          <option value="2">Leveling</option>
          <option value="3">Mastered</option>
        </select>
        <select className="inp" value={variant} onChange={e => setVariant(e.target.value)} aria-label="Prime variant">
          <option value="all">All gear</option>
          <option value="prime">Prime only</option>
          <option value="standard">Non-Prime</option>
        </select>
        <select className="inp" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort by">
          <option value="name">Sort: name</option>
          <option value="xp">Sort: mastery XP</option>
          <option value="mr">Sort: MR requirement</option>
        </select>
        <span className="filters-count">{shown.length} items · tap a card to cycle missing → farming → leveling → mastered</span>
      </div>
      {shown.length === 0
        ? <p className="empty">No equipment matches these filters.</p>
        : (
          <div className="grid">
            {shown.map(i => <ItemCard key={i.id} item={i} />)}
          </div>
        )}
    </section>
  );
}
