import { useMemo } from 'react';
import { useStore } from '../store.jsx';
import { STATUS } from '../lib/mastery.js';

const IMG = 'https://cdn.warframestat.us/img/';

// Every item that is a crafting ingredient for other equipment, with a
// clear verdict: KEEP while any recipe that needs it is still unmastered.
export default function KeepList() {
  const { items, progress } = useStore();

  const rows = useMemo(() => {
    const byId = new Map((items ?? []).map(i => [i.id, i]));
    // Three real states, not two: you can only be told to "keep" or "sell"
    // something you actually own. Nothing to protect from selling if you
    // haven't built it yet — that's just a heads-up for later, not a verdict.
    const rank = { keep: 0, safe: 1, notOwned: 2 };
    return (items ?? [])
      .filter(i => i.ingredientFor?.length)
      .map(i => {
        const uses = i.ingredientFor.map(f => ({
          ...f,
          // Owned or beyond: the recipe already consumed its ingredient
          satisfied: (progress.status[f.id] ?? STATUS.MISSING) >= STATUS.OWNED,
          item: byId.get(f.id),
        }));
        const pending = uses.filter(u => !u.satisfied);
        const owned = (progress.status[i.id] ?? STATUS.MISSING) >= STATUS.OWNED;
        const state = !owned ? 'notOwned' : pending.length > 0 ? 'keep' : 'safe';
        return { item: i, uses, pending, state };
      })
      .sort((a, b) => rank[a.state] - rank[b.state] || a.item.name.localeCompare(b.item.name));
  }, [items, progress.status]);

  return (
    <section>
      <p className="keep-intro">
        These weapons are ingredients for other weapons. Never sell one marked <strong>KEEP</strong> —
        you will have to re-farm or re-buy it later. Once everything it builds is in your inventory
        (owned, leveling or mastered), it flips to safe. Anything you haven't built yet is just
        listed for a heads-up — there's nothing to protect from selling until you own it.
      </p>
      <div className="keep-table">
        {rows.map(({ item, uses, state }) => (
          <div key={item.id} className={`keep-row keep-${state}`}>
            <div className="keep-img">{item.imageName && <img loading="lazy" src={IMG + item.imageName} alt="" />}</div>
            <div className="keep-main">
              <span className="keep-name">{item.name}</span>
              <span className="keep-uses">
                {uses.map((u, i) => (
                  <span key={u.id + i} className={u.satisfied ? 'use-done' : 'use-pending'}>
                    {u.count}× → {u.name}{u.satisfied ? ' ✓' : ''}{i < uses.length - 1 ? '  ·  ' : ''}
                  </span>
                ))}
              </span>
            </div>
            <span className={`verdict v-${state}`}>
              {state === 'keep' ? 'KEEP' : state === 'safe' ? 'Safe to sell' : 'Not built yet'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
