// Shared SWR plumbing. The bundled datasets (items.json, mods.json) are
// static per deploy, so they are fetched once and never revalidated; the
// worldstate endpoints opt back in to polling where they need it.

import { preload } from 'swr';

export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Absolute URL for a file in public/data, honouring the Vite base path.
export const dataUrl = (file) => `${import.meta.env.BASE_URL}data/${file}`;

export const swrConfig = {
  fetcher: fetchJson,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
};

// Static JSON shipped with the build: fetched once on the first mount that
// needs it, then served from cache for the rest of the session. Remounting
// (switching tabs and back) must not re-request it, so nothing here may force
// a revalidation — SWR still fetches when the cache is empty.
export const staticData = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  keepPreviousData: true,
};

// Warm the cache for a dataset a tab will need later, so opening that tab
// renders from cache instead of showing a spinner.
export function prefetch(url) {
  // A failed warm-up is not an error here — the hook that actually needs the
  // data reports it when the tab is opened.
  preload(url, fetchJson).catch(() => {});
}
