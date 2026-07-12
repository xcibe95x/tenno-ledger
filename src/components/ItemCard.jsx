import { useStore } from '../store.jsx';
import { STATUS, STATUS_LABELS } from '../lib/mastery.js';

const IMG = 'https://cdn.warframestat.us/img/';

// Trackable parts: components that aren't generic crafting resources,
// deduped (recipes needing 2x list the part twice).
function trackableParts(item) {
  const byId = new Map();
  for (const c of item.components ?? []) {
    if (c.type === 'Resource') continue;
    const prev = byId.get(c.uniqueName);
    if (prev) prev.count += c.itemCount ?? 1;
    else byId.set(c.uniqueName, { id: c.uniqueName, name: c.name, count: c.itemCount ?? 1, drops: c.drops ?? [] });
  }
  return [...byId.values()];
}

function partTooltip(p) {
  if (!p.drops.length) return `${p.name} — see the wiki for sources`;
  const locs = p.drops.map(d => {
    const chance = d.chance != null ? ` (${((d.chance > 1 ? d.chance / 100 : d.chance) * 100).toFixed(1)}%)` : '';
    return `${d.location}${chance}`;
  });
  return `${p.name} drops from:\n${locs.join('\n')}`;
}

export default function ItemCard({ item, farm }) {
  const { progress, cycleStatus, togglePart } = useStore();
  const st = progress.status[item.id] ?? STATUS.MISSING;
  const parts = farm ? trackableParts(item) : [];
  const owned = progress.parts?.[item.id] ?? {};
  // Once the crafted weapon is owned (built or bought), the ingredient has
  // already served its purpose — only unowned recipes keep the flag alive.
  const keepFor = (item.ingredientFor ?? []).filter(f => (progress.status[f.id] ?? 0) < STATUS.OWNED);

  return (
    <article className={`card st-${st}`}>
      <button
        className="card-hit"
        onClick={() => cycleStatus(item.id)}
        title={`${item.name}: ${STATUS_LABELS[st]} — tap to change (missing → farming → leveling → mastered)`}
      >
        <div className="card-img">
          {item.imageName && <img loading="lazy" src={IMG + item.imageName} alt="" />}
        </div>
        <div className="card-body">
          <div className="card-name">{item.name}</div>
          <div className="card-meta">
            <span>{item.type ?? item.category}</span>
            {item.masteryReq > 0 && <span>MR {item.masteryReq}</span>}
            <span>{item.totalXp.toLocaleString()} XP</span>
          </div>
          <div className="card-badges">
            <span className={`badge badge-st${st}`}>{STATUS_LABELS[st]}</span>
            {item.isPrime && <span className="badge badge-prime">Prime</span>}
            {item.vaulted && <span className="badge badge-vault">Vaulted</span>}
            {item.unobtainable && <span className="badge badge-vault">Founders</span>}
            {keepFor.length > 0 && st >= STATUS.OWNED && (
              <span className="badge badge-keep" title={keepFor.map(f => `${f.count}× needed for ${f.name}`).join('\n')}>
                Keep · {keepFor.map(f => f.name).join(', ')}
              </span>
            )}
          </div>
        </div>
      </button>
      {farm && (
        <div className="card-farm">
          <p>
            {farm.reason}
            {farm.where && <span className="farm-where">{farm.where}</span>}
          </p>
          {item.wikiaUrl && <a href={item.wikiaUrl} target="_blank" rel="noreferrer">wiki ↗</a>}
        </div>
      )}
      {parts.length > 0 && (
        <div className="card-parts">
          {parts.map(p => (
            <button
              key={p.id}
              className={`part-chip ${owned[p.id] ? 'part-owned' : ''}`}
              onClick={(e) => { e.stopPropagation(); togglePart(item.id, p.id); }}
              title={partTooltip(p)}
            >
              {owned[p.id] ? '✓ ' : ''}{p.count > 1 ? `${p.count}× ` : ''}{p.name}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
