import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { STATUS } from '../lib/mastery.js';
import { isCraftedPart } from '../lib/farming.js';
import { metaInfo } from '../lib/meta.js';
import { resourceFarm, itemSource } from '../lib/resources.js';
import { marketUrl } from '../lib/market.js';
import MrBadge from './MrBadge.jsx';

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

const STATUS_LABELS = ['Missing', 'Farming', 'Leveling', 'Mastered'];

export default function ItemCard({ item, farm }) {
  const { progress, cycleStatus, setStatus, togglePart } = useStore();
  const st = progress.status[item.id] ?? STATUS.MISSING;
  const keepFor = (item.ingredientFor ?? []).filter(f => (progress.status[f.id] ?? 0) < STATUS.OWNED);
  const isKeep = keepFor.length > 0 && st >= STATUS.OWNED;
  const { parts, materials } = farm ? recipe(item) : { parts: [], materials: [] };
  const owned = progress.parts?.[item.id] ?? {};
  const [activePart, setActivePart] = useState(null);
  const activePartInfo = parts.find(p => p.id === activePart);
  const activeMatInfo = !activePartInfo
    ? materials.filter(m => m.id === activePart).map(m => ({ ...m, farm: resourceFarm(m.name) }))[0]
    : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  return (
    <article className={`card st-${st} ${isKeep ? 'card-keep' : ''}`}>
      {item.masteryReq > 0 && (
        <span className="card-mr-corner" title={`Requires Mastery Rank ${item.masteryReq}`}>
          <MrBadge mr={item.masteryReq} size={14} />
          {item.masteryReq}
        </span>
      )}
      <div
        className="card-hit"
        role="button" tabIndex={0}
        onClick={() => cycleStatus(item.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleStatus(item.id); } }}
        title={`${item.name}: ${STATUS_LABELS[st]} — click to advance to ${STATUS_LABELS[(st + 1) % 4]}`}
      >
        <div className="card-img">
          {item.imageName && <img loading="lazy" src={IMG + item.imageName} alt="" />}
        </div>
        <div className="card-body">
          <div className="card-name">{item.name}</div>
          <div className="card-meta">
            <span>{item.type ?? item.category}</span>
            <span>{item.totalXp.toLocaleString()} XP</span>
          </div>
          <div className="card-badges">
            <span className="status-dropdown-wrap" ref={menuRef}>
              <span
                role="button" tabIndex={0}
                className={`badge badge-st${st} status-pill`}
                title={`${STATUS_LABELS[st]} — click to pick a status`}
                onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setMenuOpen(o => !o); } }}
              >
                {STATUS_LABELS[st]} <span className="status-pill-arrow">▾</span>
              </span>
              {menuOpen && (
                <span className="status-menu" onClick={(e) => e.stopPropagation()}>
                  {STATUS_LABELS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      className={`status-menu-item st-${i} ${st === i ? 'is-active' : ''}`}
                      onClick={() => { setStatus(item.id, i); setMenuOpen(false); }}
                    >
                      {label}
                    </button>
                  ))}
                </span>
              )}
            </span>
            {isKeep && (
              <span className="badge badge-keep" title={keepFor.map(f => `${f.count}× needed for ${f.name}`).join('\n')}>
                ⚠ Keep · {keepFor.map(f => f.name).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
      {(farm || item.wikiaUrl || item.tradable || item.isPrime || item.vaulted || item.unobtainable || metaInfo(item)) && (
        <div className="card-farm">
          <div className="card-farm-left">
            <div className="card-tags">
              {item.isPrime && <span className="tag tag-prime">Prime</span>}
              {item.vaulted && <span className="tag tag-vault">Vaulted</span>}
              {item.unobtainable && <span className="tag tag-vault">Founders</span>}
              {metaInfo(item) && (
                <span className={`tag tag-meta-${metaInfo(item).tier}`} title={metaInfo(item).note}>
                  {metaInfo(item).tier}-Tier
                </span>
              )}
            </div>
            {farm && (
              <p>
                {farm.reason}
                {farm.where && <span className="farm-where">{farm.where}</span>}
              </p>
            )}
          </div>
          <div className="card-links">
            {item.wikiaUrl && <a href={item.wikiaUrl} target="_blank" rel="noreferrer">wiki ↗</a>}
            {item.tradable && <a href={marketUrl(item)} target="_blank" rel="noreferrer">market ↗</a>}
          </div>
        </div>
      )}
      {parts.length > 0 && (
        <div className="card-parts">
          {parts.map(p => (
            <button
              key={p.id}
              type="button"
              className={`part-chip ${owned[p.id] ? 'part-owned' : ''} ${activePart === p.id ? 'is-active' : ''}`}
              title={`${owned[p.id] ? 'Mark not acquired' : 'Mark acquired'} — tap the ⓘ for where to farm`}
              onClick={() => togglePart(item.id, p.id)}
            >
              {owned[p.id]
                ? <span className="chip-check">✓</span>
                : p.imageName && <img className="chip-icon" loading="lazy" src={IMG + p.imageName} alt="" />}
              {p.count > 1 ? `${p.count}× ` : ''}{p.name}
              <span
                className="chip-info"
                role="button" tabIndex={0}
                aria-label={`Where to find ${p.name}`}
                aria-expanded={activePart === p.id}
                onClick={(e) => { e.stopPropagation(); setActivePart(activePart === p.id ? null : p.id); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setActivePart(activePart === p.id ? null : p.id); } }}
              >
                ⓘ
              </span>
            </button>
          ))}
        </div>
      )}
      {activePartInfo && (
        <div className="drop-panel">
          <div className="drop-panel-title">{activePartInfo.name} — where to farm</div>
          {activePartInfo.drops.length > 0 ? (
            activePartInfo.drops.map((d, i) => (
              <div key={i} className="drop-line">
                {d.location}{d.chance != null && <b> {chancePct(d.chance)}</b>}
              </div>
            ))
          ) : itemSource(item.name) ? (
            <div className="drop-line">From {itemSource(item.name)}</div>
          ) : (
            <div className="drop-line">No drop table on record — check the wiki for the exact source</div>
          )}
        </div>
      )}
      {materials.length > 0 && (
        <div className="card-parts card-materials">
          {materials.map(m => (
            <button
              key={m.id}
              type="button"
              className={`part-chip part-mat ${activePart === m.id ? 'is-active' : ''}`}
              aria-expanded={activePart === m.id}
              onClick={() => setActivePart(activePart === m.id ? null : m.id)}
            >
              {m.imageName && <img className="chip-icon" loading="lazy" src={IMG + m.imageName} alt="" />}
              {m.count > 1 ? `${m.count.toLocaleString()}× ` : ''}{m.name}
            </button>
          ))}
        </div>
      )}
      {activeMatInfo && (
        <div className="drop-panel">
          <div className="drop-panel-title">
            {activeMatInfo.count > 1 ? `${activeMatInfo.count.toLocaleString()}× ` : ''}{activeMatInfo.name} — build material
          </div>
          <div className="drop-line">{activeMatInfo.farm ?? 'Farm spot not mapped yet — check the wiki for the best node'}</div>
        </div>
      )}
    </article>
  );
}
