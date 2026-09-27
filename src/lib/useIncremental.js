import { useEffect, useRef, useState } from 'react';

// Renders a long list a slice at a time: `limit` starts small and grows as the
// sentinel scrolls into view, so landing on a tab never mounts 800+ cards at
// once. Everything stays in the DOM once rendered — no windowing, so ctrl+F,
// anchors and scroll restoration keep working.
export function useIncremental(total, { initial = 60, step = 40, resetKey = null } = {}) {
  const [limit, setLimit] = useState(initial);
  const sentinelRef = useRef(null);

  // A new filter/search means a different list — start from the top again.
  useEffect(() => { setLimit(initial); }, [resetKey, initial]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || limit >= total) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Grow ahead of the viewport so the next slice is ready before the
        // user reaches the end of the current one.
        if (entry.isIntersecting) setLimit(l => Math.min(l + step, total));
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [limit, total, step]);

  return { limit, sentinelRef, done: limit >= total };
}

// Trims grouped lists ([{ mods: [...] }, ...]) to the first `limit` entries
// overall, dropping groups that fall entirely past the cut.
export function sliceGroups(groups, limit, key = 'mods') {
  const out = [];
  let budget = limit;
  for (const g of groups) {
    const rows = g[key];
    // Empty groups (a collapsed section) cost nothing and must stay visible
    // past the cut — otherwise their headers disappear mid-scroll.
    if (rows.length === 0) { out.push(g); continue; }
    if (budget <= 0) break;
    out.push(rows.length <= budget ? g : { ...g, [key]: rows.slice(0, budget) });
    budget -= rows.length;
  }
  return out;
}
