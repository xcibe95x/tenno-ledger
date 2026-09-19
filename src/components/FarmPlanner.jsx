import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { STATUS, masterySummary } from '../lib/mastery.js';
import { farmInfo, TIER_ORDER, TIER_LABELS } from '../lib/farming.js';
import { metaInfo, TIER_ORDER as META_TIER_ORDER } from '../lib/meta.js';
import { usePersisted } from '../lib/usePersisted.js';
import ItemCard from './ItemCard.jsx';

const COLLAPSE_KEY = 'wfh-collapsed-sections';

// Section headers toggle their body; which ones are collapsed persists so the
// layout you set stays put across visits.
function loadCollapsed() {
  try { return new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '[]')); }
  catch { return new Set(); }
}

function Section({ id, title, count, className, collapsed, onToggle, children }) {
  return (
    <div className={`tier ${className}`}>
      <button
        className={`tier-title ${collapsed ? 'is-collapsed' : ''}`}
        onClick={() => onToggle(id)}
        aria-expanded={!collapsed}
      >
        <span className="tier-caret" aria-hidden="true">▾</span>
        {title} <span className="tier-count">{count}</span>
      </button>
      {!collapsed && <div className="grid">{children}</div>}
    </div>
  );
}

export default function FarmPlanner() {
  const { items, progress } = useStore();
  const [cat, setCat] = usePersisted('wfh-farm-cat', 'all');
  const [variant, setVariant] = usePersisted('wfh-farm-variant', 'all');
  const [tier, setTier] = usePersisted('wfh-farm-tier', 'all');
  const [q, setQ] = useState('');
  const [collapsed, setCollapsed] = useState(loadCollapsed);
  const appliedDefault = useRef(false);

  const toggle = (id) => setCollapsed(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...next]));
    return next;
  });

  const cats = useMemo(
    () => [...new Set((items ?? []).map(i => i.category))].sort(),
    [items],
  );

  const { farming, leveling, metaPicks, tiers, totalLeft, mr, sectionOrder } = useMemo(() => {
    const { mr } = masterySummary(items ?? [], progress.status, progress.extraXp, progress.itemXp);
    const needle = q.trim().toLowerCase();
    const inCat = (items ?? []).filter(i =>
      !i.unobtainable
      && (cat === 'all' || i.category === cat)
      && (variant === 'all' || (variant === 'prime' ? i.isPrime : !i.isPrime))
      && (tier === 'all' || metaInfo(i)?.tier === tier)
      && (!needle || i.name.toLowerCase().includes(needle)));

    // Easiest first; ties broken by mastery value so 6000 XP frames outrank
    // 3000 XP weapons of equal effort.
    const byPayoff = (a, b) => a.farm.score - b.farm.score || b.item.totalXp - a.item.totalXp;
    // Within meta picks, best tier first (S > A > B), then easiest to farm.
    const byTierThenPayoff = (a, b) =>
      META_TIER_ORDER.indexOf(metaInfo(a.item).tier) - META_TIER_ORDER.indexOf(metaInfo(b.item).tier)
      || byPayoff(a, b);

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
    // Meta/OP weapons you don't own yet jump the queue: their own priority
    // section on top, pulled out of the difficulty tiers below.
    const metaPicks = scored.filter(s => metaInfo(s.item)).sort(byTierThenPayoff);
    const tiers = new Map(TIER_ORDER.map(t => [t, []]));
    for (const s of scored) {
      if (!metaInfo(s.item)) tiers.get(s.farm.tier)?.push(s);
    }

    // Render order of sections, filtered to the ones that'll actually show —
    // used to default only the first accordion open on a first-ever visit.
    const sectionOrder = [
      farming.length && 'farming',
      leveling.length && 'leveling',
      metaPicks.length && 'meta',
      ...TIER_ORDER.filter(t => tiers.get(t)?.length),
    ].filter(Boolean);

    return { farming, leveling, metaPicks, tiers, totalLeft: scored.length, mr, sectionOrder };
  }, [items, progress.status, progress.extraXp, progress.itemXp, cat, variant, tier, q]);

  // First-ever visit (nothing saved yet): collapse every section but the
  // first one once we know the real render order. Runs once.
  useEffect(() => {
    if (appliedDefault.current) return;
    if (localStorage.getItem(COLLAPSE_KEY) != null) { appliedDefault.current = true; return; }
    if (sectionOrder.length === 0) return;
    appliedDefault.current = true;
    setCollapsed(new Set(sectionOrder.slice(1)));
  }, [sectionOrder]);

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
        <select className="inp" value={variant} onChange={e => setVariant(e.target.value)} aria-label="Prime variant">
          <option value="all">All gear</option>
          <option value="prime">Prime only</option>
          <option value="standard">Non-Prime</option>
        </select>
        <select className="inp" value={tier} onChange={e => setTier(e.target.value)} aria-label="Meta tier">
          <option value="all">All tiers</option>
          {META_TIER_ORDER.map(t => <option key={t} value={t}>{t}-Tier only</option>)}
        </select>
        <span className="filters-count">
          {totalLeft} items left to hunt, easiest first for MR {mr}. Items above your rank sink lower — you couldn't claim them yet.
          Tap a card and set it to "Farming" to pin it to your to-do list.
        </span>
      </div>

      {farming.length > 0 && (
        <Section id="farming" title="Now farming" count={farming.length} className="tier-farming" collapsed={collapsed.has('farming')} onToggle={toggle}>
          {farming.map(({ item, farm }) => <ItemCard key={item.id} item={item} farm={farm} />)}
        </Section>
      )}

      {leveling.length > 0 && (
        <Section id="leveling" title="Now leveling" count={leveling.length} className="tier-leveling" collapsed={collapsed.has('leveling')} onToggle={toggle}>
          {leveling.map(({ item }) => <ItemCard key={item.id} item={item} />)}
        </Section>
      )}

      {metaPicks.length > 0 && (
        <Section id="meta" title="★ Meta picks (S/A/B) — farm these first" count={metaPicks.length} className="tier-meta" collapsed={collapsed.has('meta')} onToggle={toggle}>
          {metaPicks.map(({ item, farm }) => <ItemCard key={item.id} item={item} farm={farm} />)}
        </Section>
      )}

      {TIER_ORDER.map(t => {
        const group = tiers.get(t) ?? [];
        if (!group.length) return null;
        return (
          <Section key={t} id={t} title={TIER_LABELS[t]} count={group.length} className={`tier-${t}`} collapsed={collapsed.has(t)} onToggle={toggle}>
            {group.map(({ item, farm }) => <ItemCard key={item.id} item={item} farm={farm} />)}
          </Section>
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
