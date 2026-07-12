import { useStore } from '../store.jsx';
import { STATUS, STATUS_LABELS } from '../lib/mastery.js';

const IMG = 'https://cdn.warframestat.us/img/';

export default function ItemCard({ item, farm }) {
  const { progress, cycleStatus } = useStore();
  const st = progress.status[item.id] ?? STATUS.MISSING;
  const keepFor = (item.ingredientFor ?? []).filter(f => (progress.status[f.id] ?? 0) !== STATUS.MASTERED);

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
          <p>{farm.reason}</p>
          {item.wikiaUrl && <a href={item.wikiaUrl} target="_blank" rel="noreferrer">wiki ↗</a>}
        </div>
      )}
    </article>
  );
}
