import { useMemo, useState } from 'react';
import { useStore } from '../store.jsx';
import { STATUS, masterySummary, mrFromXp, xpForMr, mrLabel } from '../lib/mastery.js';
import { farmInfo } from '../lib/farming.js';
import MrBadge from './MrBadge.jsx';

const IMG = 'https://cdn.warframestat.us/img/';

// Greedy plan: rank unmastered items by farm-effort *per XP earned*
// (score / gain, using your *current* MR for the lock check) and keep adding
// the most efficient ones until projected XP clears the target. This is the
// standard fractional-knapsack heuristic — it directly maximizes XP gained
// per unit of farming effort, not just "easiest item first" (a 6000 XP frame
// that's a bit harder than a 3000 XP weapon can still win on efficiency).
// Not a perfect scheduler — a locked item stays sorted by its penalized score
// rather than being excluded outright — but it's a solid approximation since
// the farm-difficulty score already pushes locked/hard gear to the back.
function buildPlan(items, progress, targetMr) {
  const { xp: currentXp, mr: currentMr } = masterySummary(items, progress.status, progress.extraXp, progress.itemXp);
  const targetXp = xpForMr(targetMr);

  const remaining = items
    .filter(i => !i.unobtainable && (progress.status[i.id] ?? STATUS.MISSING) !== STATUS.MASTERED)
    .map(i => {
      const earned = Math.min(progress.itemXp?.[i.id] ?? 0, i.totalXp);
      const gain = i.totalXp - earned;
      const farm = farmInfo(i, currentMr);
      return { item: i, gain, farm, efficiency: farm.score / gain };
    })
    .filter(r => r.gain > 0)
    .sort((a, b) => a.efficiency - b.efficiency || a.farm.score - b.farm.score);

  const plan = [];
  let runningXp = currentXp;
  for (const r of remaining) {
    if (runningXp >= targetXp) break;
    plan.push({ ...r, runningXp: runningXp += r.gain });
  }
  const stillShort = runningXp < targetXp;
  return { currentXp, currentMr, targetXp, plan, stillShort, shortfall: Math.max(0, targetXp - runningXp) };
}

function planToText(plan, target) {
  const lines = [`Warframe MR path to ${mrLabel(target)}:`, ''];
  plan.forEach(({ item, gain, farm }, idx) => {
    lines.push(`${idx + 1}. [ ] ${item.name} — +${gain.toLocaleString()} XP (${farm.reason})`);
  });
  return lines.join('\n');
}

export default function MrPath() {
  const { items, progress } = useStore();
  const { mr: currentMr } = useMemo(
    () => masterySummary(items ?? [], progress.status, progress.extraXp, progress.itemXp),
    [items, progress.status, progress.extraXp, progress.itemXp],
  );
  const [target, setTarget] = useState(() => Math.min(40, currentMr + 1));
  const [copied, setCopied] = useState(false);

  const { currentXp, targetXp, plan, stillShort, shortfall } = useMemo(
    () => buildPlan(items ?? [], progress, target),
    [items, progress, target],
  );

  const copyPlan = () => {
    navigator.clipboard.writeText(planToText(plan, target)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  if (!items) return null;

  return (
    <section>
      <div className="filters">
        <div className="field">
          <label className="field-label" htmlFor="mrpath-target">Reach</label>
          <select id="mrpath-target" className="inp" value={target} onChange={e => setTarget(Number(e.target.value))}>
            {Array.from({ length: 40 }, (_, i) => i + 1).filter(n => n > currentMr).map(n => (
              <option key={n} value={n}>{mrLabel(n)}</option>
            ))}
          </select>
        </div>
        <span className="filters-count">
          You're {mrLabel(currentMr)} ({currentXp.toLocaleString()} XP). {mrLabel(target)} needs {targetXp.toLocaleString()} XP —
          {' '}{plan.length} item{plan.length === 1 ? '' : 's'} below, ranked by XP earned per unit of farming effort.
        </span>
        {plan.length > 0 && (
          <button className="btn btn-gold filters-cta" onClick={copyPlan}>{copied ? 'Copied ✓' : 'Copy plan'}</button>
        )}
      </div>

      {stillShort && (
        <p className="empty">
          Even mastering everything left in the database doesn't clear {mrLabel(target)} — short {shortfall.toLocaleString()} XP.
          Star-chart junctions and nodes also grant mastery once; check the Collection tab's node list.
        </p>
      )}

      {plan.length === 0 && !stillShort && (
        <p className="empty">Nothing to do — {mrLabel(target)} is already within reach from what's mastered.</p>
      )}

      {plan.length > 0 && (
        <ol className="mrpath-list">
          {plan.map(({ item, gain, farm, runningXp }, idx) => (
            <li key={item.id} className="mrpath-row">
              <span className="mrpath-num">{idx + 1}</span>
              <div className="mrpath-img">
                {item.imageName && <img loading="lazy" src={IMG + item.imageName} alt="" />}
              </div>
              <div className="mrpath-info">
                <div className="mrpath-name">
                  {item.name}
                  {item.masteryReq > 0 && (
                    <span className="card-mr">
                      <MrBadge mr={item.masteryReq} size={14} />
                      MR {item.masteryReq}
                    </span>
                  )}
                </div>
                <div className="mrpath-reason">{farm.reason}{farm.where && <span className="farm-where">{farm.where}</span>}</div>
              </div>
              <div className="mrpath-xp">
                <span>+{gain.toLocaleString()} XP</span>
                <span className="mrpath-running">→ {mrLabel(mrFromXp(runningXp))} ({runningXp.toLocaleString()})</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
