import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store.jsx';
import { STATUS, STATUS_LABELS } from '../lib/mastery.js';

const IMG = 'https://cdn.warframestat.us/img/';

// Trackable parts: only components you actually farm from a drop table, deduped
// (recipes needing 2x list the part twice). A chip's whole job is to check off a
// part you've hunted, so anything without a drop location is skipped — the
// bought/researched Blueprint, and the crafting resources WFCD mislabels as
// components (Forma, Neurodes, Fieldron, Nitain…). Items built entirely from
// those (market weapons, dojo/quest frames) simply show no chips: there's
// nothing to farm, which the card's "where to get it" line already explains.
function trackableParts(item) {
  const byId = new Map();
  for (const c of item.components ?? []) {
    if (c.type === 'Resource') continue;
    if (!(c.drops ?? []).some(d => d.location)) continue;
    const prev = byId.get(c.uniqueName);
    if (prev) prev.count += c.itemCount ?? 1;
    else byId.set(c.uniqueName, { id: c.uniqueName, name: c.name, count: c.itemCount ?? 1, drops: c.drops ?? [] });
  }
  return [...byId.values()];
}

function chancePct(chance) {
  if (chance == null) return null;
  const c = chance > 1 ? chance / 100 : chance;
  return `${(c * 100).toFixed(c < 0.1 ? 1 : 0)}%`;
}

export default function ItemCard({ item, farm }) {
  const { progress, cycleStatus, togglePart } = useStore();
  const st = progress.status[item.id] ?? STATUS.MISSING;
  const keepFor = (item.ingredientFor ?? []).filter(f => (progress.status[f.id] ?? 0) < STATUS.OWNED);
  const parts = farm ? trackableParts(item) : [];
  const owned = progress.parts?.[item.id] ?? {};
  const [tip, setTip] = useState(null);

  const showTip = (e, p) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ x: r.left + r.width / 2, y: r.top - 8, part: p });
  };

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
              onMouseEnter={(e) => showTip(e, p)}
              onMouseLeave={() => setTip(null)}
              onFocus={(e) => showTip(e, p)}
              onBlur={() => setTip(null)}
            >
              {owned[p.id] ? '✓ ' : ''}{p.count > 1 ? `${p.count}× ` : ''}{p.name}
            </button>
          ))}
        </div>
      )}
      {tip && createPortal(
        <div
          className="tipbox"
          style={{
            left: Math.min(Math.max(tip.x, 150), window.innerWidth - 150),
            top: Math.max(tip.y, 60),
          }}
        >
          <div className="tipbox-title">
            {tip.part.count > 1 ? `${tip.part.count}× ` : ''}{tip.part.name}
            <span className="tipbox-state">{owned[tip.part.id] ? ' — acquired ✓' : ' — click to mark acquired'}</span>
          </div>
          {tip.part.drops.length > 0 ? (
            tip.part.drops.map((d, i) => (
              <div key={i} className="tipbox-line">
                {d.location}{d.chance != null && <b> {chancePct(d.chance)}</b>}
              </div>
            ))
          ) : (
            <div className="tipbox-line">Comes with the blueprint or vendor purchase — see the wiki</div>
          )}
        </div>,
        document.body,
      )}
    </article>
  );
}
