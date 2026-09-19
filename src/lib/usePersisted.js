import { useEffect, useState } from 'react';

// A useState that survives reloads under `key`. Search text is intentionally
// left out by callers — filters (category, tier, sort…) are worth keeping
// between visits, a stale search query is usually just confusing.
export function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
