import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store.jsx';
import { STATUS, STATUS_LABELS } from '../lib/mastery.js';
import { isCraftedPart } from '../lib/farming.js';
import { metaInfo } from '../lib/meta.js';
import { resourceFarm, itemSource } from '../lib/resources.js';
import MrBadge from './MrBadge.jsx';

// Touch devices synthesize a hover on first tap, which can swallow the tap that
// should toggle a part. Only wire the hover tooltip on hover-capable pointers so
// a tap on touch goes straight to togglePart.
const CAN_HOVER = typeof window !== 'undefined'
  && window.matchMedia?.('(hover: hover)').matches;

const IMG = 'https://cdn.warframestat.us/img/';

// The foundry recipe, deduped (recipes needing 2x list the part twice) and
// split in two:
//   parts     — components you acquire one at a time: anything with a drop
//               table, plus the blueprint itself (a discrete step you buy or
//               claim once, even when the dataset lists no drop location).
//               Checkable, with drop tooltips — this is the acquisition checklist.
//   materials — the crafting resources/minerals. Shown for reference with their
//               icons and quantities; not checkable, since you bulk-grind them.
// Items built entirely from materials (market weapons, dojo/quest frames) still
// surface their blueprint chip so you can mark it obtained.
function recipe(item) {
  const parts = new Map();
  const materials = new Map();
  for (const c of item.components ?? []) {
    // Checkable "parts" are the things you acquire one at a time, even when the
    // dataset lists no drop location (e.g. Grendel's frame parts, necramech
    // parts). We treat a component as a part when it is any of:
    //   • the blueprint;
    //   • a crafted component under /Recipes/ (frame Chassis/Systems, weapon Barrel…);
    //   • a necramech part under /Mechs/ (WFCD files these under Resources);
    //   • a bespoke part named after the item itself ("Voidrig Capsule"), which
    //     no shared bulk resource ever is;
    //   • anything with its own drop table.
    // Everything else is a shared bulk resource, shown as a reference material.
    const isBlueprint = /blueprint/i.test(c.name ?? '');
    const farmable = isBlueprint || isCraftedPart(item, c) || (c.type !== 'Resource' && (c.drops ?? []).some(d => d.location));
    const bucket = farmable ? parts : materials;
    const prev = bucket.get(c.uniqueName);
    if (prev) prev.count += c.itemCount ?? 1;
    else bucket.set(c.uniqueName, { id: c.uniqueName, name: c.name, count: c.itemCount ?? 1, imageName: c.imageName ?? null, drops: c.drops ?? [] });
  }
  return { parts: [...parts.values()], materials: [...materials.values()] };
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
  const { parts, materials } = farm ? recipe(item) : { parts: [], materials: [] };
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
            {item.masteryReq > 0 && (
              <span className="card-mr">
                <MrBadge mr={item.masteryReq} size={16} />
                MR {item.masteryReq}
              </span>
            )}
            <span>{item.totalXp.toLocaleString()} XP</span>
          </div>
          <div className="card-badges">
            <span className={`badge badge-st${st}`}>{STATUS_LABELS[st]}</span>
            {metaInfo(item) && <span className="badge badge-meta" title={metaInfo(item)}>★ Meta</span>}
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
              type="button"
              className={`part-chip ${owned[p.id] ? 'part-owned' : ''}`}
              onClick={(e) => { e.stopPropagation(); togglePart(item.id, p.id); }}
              onMouseEnter={CAN_HOVER ? (e) => showTip(e, p) : undefined}
              onMouseLeave={CAN_HOVER ? () => setTip(null) : undefined}
              onFocus={(e) => showTip(e, p)}
              onBlur={() => setTip(null)}
            >
              {owned[p.id]
                ? <span className="chip-check">✓</span>
                : p.imageName && <img className="chip-icon" loading="lazy" src={IMG + p.imageName} alt="" />}
              {p.count > 1 ? `${p.count}× ` : ''}{p.name}
            </button>
          ))}
        </div>
      )}
      {materials.length > 0 && (
        <div className="card-parts card-materials">
          {materials.map(m => {
            const farm = resourceFarm(m.name);
            return (
              <span
                key={m.id}
                className="part-chip part-mat"
                title={`${m.count > 1 ? `${m.count.toLocaleString()}× ` : ''}${m.name}${farm ? ` — ${farm}` : ''}`}
                onMouseEnter={CAN_HOVER ? (e) => showTip(e, { ...m, mat: true, farm }) : undefined}
                onMouseLeave={CAN_HOVER ? () => setTip(null) : undefined}
              >
                {m.imageName && <img className="chip-icon" loading="lazy" src={IMG + m.imageName} alt="" />}
                {m.count > 1 ? `${m.count.toLocaleString()}× ` : ''}{m.name}
              </span>
            );
          })}
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
            {tip.part.count > 1 ? `${(tip.part.mat ? tip.part.count.toLocaleString() : tip.part.count)}× ` : ''}{tip.part.name}
            {tip.part.mat
              ? <span className="tipbox-state"> — build material</span>
              : <span className="tipbox-state">{owned[tip.part.id] ? ' — acquired ✓' : ' — click to mark acquired'}</span>}
          </div>
          {tip.part.drops.length > 0 ? (
            tip.part.drops.map((d, i) => (
              <div key={i} className="tipbox-line">
                {d.location}{d.chance != null && <b> {chancePct(d.chance)}</b>}
              </div>
            ))
          ) : tip.part.farm ? (
            <div className="tipbox-line">{tip.part.farm}</div>
          ) : tip.part.mat ? (
            <div className="tipbox-line">Farm spot not mapped yet — check the wiki for the best node</div>
          ) : itemSource(item.name) ? (
            <div className="tipbox-line">From {itemSource(item.name)}</div>
          ) : (
            <div className="tipbox-line">No drop table — see the wiki for the exact source</div>
          )}
        </div>,
        document.body,
      )}
    </article>
  );
}
