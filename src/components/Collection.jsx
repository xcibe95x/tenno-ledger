import { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { STATUS } from '../lib/mastery.js';
import { usePersisted } from '../lib/usePersisted.js';
import ItemCard from './ItemCard.jsx';

const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name),
  xp: (a, b) => b.totalXp - a.totalXp,
  mr: (a, b) => a.masteryReq - b.masteryReq,
};

const QUICK_STATUS = [
  { key: 'all', label: 'All' },
  { key: '0', label: 'Missing' },
  { key: '1', label: 'Farming' },
  { key: '2', label: 'Leveling' },
  { key: '3', label: 'Mastered' },
];

export default function Collection() {
  const { items, progress } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = usePersisted('wfh-collection-cat', 'all');
  const [st, setSt] = usePersisted('wfh-collection-status', 'all');
  const [variant, setVariant] = usePersisted('wfh-collection-variant', 'all');
  const [sort, setSort] = usePersisted('wfh-collection-sort', 'name');
  const [keepOnly, setKeepOnly] = usePersisted('wfh-collection-keeponly', false);

  const cats = useMemo(
    () => [...new Set((items ?? []).map(i => i.category))].sort(),
    [items],
  );

  const keepIds = useMemo(() => {
    const ids = new Set();
    for (const i of items ?? []) {
      const st = progress.status[i.id] ?? STATUS.MISSING;
      const pending = (i.ingredientFor ?? []).some(f => (progress.status[f.id] ?? STATUS.MISSING) < STATUS.OWNED);
      if (pending && st >= STATUS.OWNED) ids.add(i.id);
    }
    return ids;
  }, [items, progress.status]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (items ?? [])
      .filter(i =>
        (cat === 'all' || i.category === cat) &&
        (st === 'all' || (progress.status[i.id] ?? STATUS.MISSING) === Number(st)) &&
        (variant === 'all' || (variant === 'prime' ? i.isPrime : !i.isPrime)) &&
        (!keepOnly || keepIds.has(i.id)) &&
        (!needle || i.name.toLowerCase().includes(needle)))
      .sort(SORTS[sort]);
  }, [items, q, cat, st, variant, sort, keepOnly, keepIds, progress.status]);

  return (
    <section>
      <div className="filters">
        <div className="field">
          <label className="field-label" htmlFor="col-search">Search</label>
          <input
            id="col-search"
            className="inp inp-search" type="search" placeholder="Search equipment…"
            value={q} onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="col-cat">Category</label>
          <select id="col-cat" className="inp" value={cat} onChange={e => setCat(e.target.value)}>
            <option value="all">All categories</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="col-variant">Variant</label>
          <select id="col-variant" className="inp" value={variant} onChange={e => setVariant(e.target.value)}>
            <option value="all">All gear</option>
            <option value="prime">Prime only</option>
            <option value="standard">Non-Prime</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="col-sort">Sort</label>
          <select id="col-sort" className="inp" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="name">Name</option>
            <option value="xp">Mastery XP</option>
            <option value="mr">MR requirement</option>
          </select>
        </div>
        <div className="field">
          <span className="field-label">Status</span>
          <div className="quick-filters" role="group" aria-label="Filter by status">
            {QUICK_STATUS.map(q => (
              <button
                key={q.key} type="button"
                className={`qf ${st === q.key ? 'is-active' : ''}`}
                aria-pressed={st === q.key}
                onClick={() => setSt(q.key)}
              >
                {q.label}
              </button>
            ))}
            <button
              type="button"
              className={`qf ${keepOnly ? 'is-active' : ''}`}
              aria-pressed={keepOnly}
              onClick={() => setKeepOnly(!keepOnly)}
              title="Only show items flagged Keep in the keep-list"
            >
              ⚠ Keep only
            </button>
          </div>
        </div>
        <span className="filters-count">{shown.length} items</span>
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
