import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { STATUS, STATUS_COUNT } from './lib/mastery.js';
import { supabase, fetchCloudProgress, pushCloudProgress } from './lib/supabase.js';
import { driveEnabled, driveConnected, wasDriveConnected, connectDrive, disconnectDrive, pullDrive, pushDrive } from './lib/drive.js';

const KEY = 'wfh-progress-v1';
const VERSION = 2;
const StoreContext = createContext(null);

// v1 saves had 3 states (0 missing / 1 leveling / 2 mastered); v2 inserts
// FARMING at 1, shifting leveling->2 and mastered->3.
function migrate(p) {
  if (!p || typeof p !== 'object' || typeof p.status !== 'object') return null;
  const out = { status: { ...(p.status ?? {}) }, itemXp: p.itemXp ?? {}, parts: p.parts ?? {}, extraXp: p.extraXp ?? 0, updatedAt: p.updatedAt ?? 0, v: VERSION };
  if ((p.v ?? 1) < 2) {
    for (const [id, s] of Object.entries(out.status)) {
      if (s === 1) out.status[id] = STATUS.OWNED;
      else if (s === 2) out.status[id] = STATUS.MASTERED;
    }
  }
  return out;
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const migrated = migrate(JSON.parse(raw));
      if (migrated) return migrated;
    }
  } catch { /* corrupted save — start fresh */ }
  return { status: {}, itemXp: {}, parts: {}, extraXp: 0, updatedAt: 0, v: VERSION };
}

export function StoreProvider({ children }) {
  const [items, setItems] = useState(null);
  const [nodes, setNodes] = useState({});
  const [itemsError, setItemsError] = useState(false);
  const [progress, setProgress] = useState(loadLocal);
  const [user, setUser] = useState(null);
  const [syncState, setSyncState] = useState(supabase ? 'idle' : 'off'); // off | idle | syncing | synced | error
  const [driveState, setDriveState] = useState(
    !driveEnabled ? 'off'
      : driveConnected() ? 'syncing' // valid token persisted — sync, don't flash "Reconnect"
        : wasDriveConnected() ? 'reconnect'
          : 'idle',
  );
  const pushTimer = useRef(null);
  const drivePushTimer = useRef(null);

  // Item data
  const loadItems = useCallback(() => {
    setItemsError(false);
    fetch(`${import.meta.env.BASE_URL}data/items.json`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setItems(d.items); setNodes(d.nodes ?? {}); })
      .catch(e => { console.error('failed to load item database', e); setItemsError(true); });
  }, []);
  useEffect(() => { loadItems(); }, [loadItems]);

  // Persist locally on every change
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(progress));
  }, [progress]);

  // Supabase auth session tracking
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Supabase: on login pull cloud copy, newest wins, then push merged result
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setSyncState('syncing');
      try {
        const cloud = await fetchCloudProgress(user.id);
        if (cancelled) return;
        const cloudTime = cloud ? Date.parse(cloud.updated_at) : 0;
        const local = loadLocal();
        if (cloud && cloudTime > (local.updatedAt || 0)) {
          setProgress(migrate(cloud.data) ?? local);
        } else {
          await pushCloudProgress(user.id, local);
        }
        setSyncState('synced');
      } catch (e) {
        console.error('sync failed', e);
        if (!cancelled) setSyncState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const connectAndSyncDrive = useCallback(async () => {
    setDriveState('syncing');
    try {
      await connectDrive();
      const remote = await pullDrive();
      const local = loadLocal();
      if (remote && (remote.data?.updatedAt ?? remote.modifiedTime) > (local.updatedAt || 0)) {
        setProgress(migrate(remote.data) ?? local);
      } else {
        await pushDrive(local);
      }
      setDriveState('synced');
    } catch (e) {
      console.error('drive sync failed', e);
      setDriveState('error');
      throw e;
    }
  }, []);

  const signOutDrive = useCallback(() => {
    disconnectDrive();
    setDriveState('idle');
  }, []);

  // On load the in-memory token is gone, so re-acquire one silently: the grant
  // from a previous session lets Google mint a fresh token with no popup. If
  // that's blocked (revoked grant, partitioned storage), fall back to the
  // visible reconnect button instead of leaving the user disconnected.
  useEffect(() => {
    if (!driveEnabled || !wasDriveConnected()) return;
    let cancelled = false;
    (async () => {
      setDriveState('syncing');
      try {
        // A still-valid token persisted from the last visit means no popup and
        // no silent-auth round-trip — sync straight away.
        if (!driveConnected()) await connectDrive();
        const remote = await pullDrive();
        if (cancelled) return;
        const local = loadLocal();
        if (remote && (remote.data?.updatedAt ?? remote.modifiedTime) > (local.updatedAt || 0)) {
          setProgress(migrate(remote.data) ?? local);
        } else {
          await pushDrive(local);
        }
        if (!cancelled) setDriveState('synced');
      } catch {
        if (!cancelled) setDriveState('reconnect');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Keep the Drive session alive while the page is open: renew the hourly
  // token shortly after it lapses, falling back to a visible reconnect state.
  useEffect(() => {
    if (!driveEnabled) return;
    const timer = setInterval(() => {
      setDriveState(prev => {
        if (prev === 'synced' && !driveConnected()) {
          connectDrive()
            .then(() => setDriveState('synced'))
            .catch(() => setDriveState('reconnect'));
          return 'syncing';
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const update = useCallback((fn) => {
    setProgress(prev => {
      const next = { ...fn(prev), updatedAt: Date.now(), v: VERSION };
      if (user && supabase) {
        clearTimeout(pushTimer.current);
        pushTimer.current = setTimeout(() => {
          setSyncState('syncing');
          pushCloudProgress(user.id, next)
            .then(() => setSyncState('synced'))
            .catch(() => setSyncState('error'));
        }, 1500);
      }
      if (driveEnabled && (driveConnected() || wasDriveConnected())) {
        clearTimeout(drivePushTimer.current);
        drivePushTimer.current = setTimeout(async () => {
          setDriveState('syncing');
          try {
            // Tokens expire hourly; renew silently (the grant already exists).
            if (!driveConnected()) await connectDrive();
            await pushDrive(next);
            setDriveState('synced');
          } catch {
            setDriveState('reconnect');
          }
        }, 2000);
      }
      return next;
    });
  }, [user]);

  const setStatus = useCallback((id, s) => {
    update(prev => ({ ...prev, status: { ...prev.status, [id]: s } }));
  }, [update]);

  const cycleStatus = useCallback((id) => {
    update(prev => {
      const cur = prev.status[id] ?? STATUS.MISSING;
      return { ...prev, status: { ...prev.status, [id]: (cur + 1) % STATUS_COUNT } };
    });
  }, [update]);

  const setAllStatuses = useCallback((statusMap) => {
    update(prev => ({ ...prev, status: statusMap }));
  }, [update]);

  const togglePart = useCallback((itemId, partId) => {
    update(prev => {
      const itemParts = { ...(prev.parts?.[itemId] ?? {}) };
      if (itemParts[partId]) delete itemParts[partId];
      else itemParts[partId] = true;
      return { ...prev, parts: { ...(prev.parts ?? {}), [itemId]: itemParts } };
    });
  }, [update]);

  const applyImport = useCallback(({ status, itemXp, extraXp }) => {
    update(prev => ({
      ...prev,
      status,
      itemXp: { ...(prev.itemXp ?? {}), ...itemXp },
      ...(extraXp != null ? { extraXp } : {}),
    }));
  }, [update]);

  const setExtraXp = useCallback((xp) => {
    update(prev => ({ ...prev, extraXp: Math.max(0, Math.floor(xp) || 0) }));
  }, [update]);

  const importProgress = useCallback((obj) => {
    const migrated = migrate(obj);
    if (!migrated) throw new Error('Not a valid backup file');
    update(() => migrated);
  }, [update]);

  const value = useMemo(() => ({
    items, nodes, itemsError, loadItems, progress, setStatus, cycleStatus, setExtraXp, importProgress, setAllStatuses, applyImport, togglePart,
    user, syncState, supabaseEnabled: !!supabase,
    driveEnabled, driveState, connectAndSyncDrive, signOutDrive,
  }), [items, nodes, itemsError, loadItems, progress, setStatus, cycleStatus, setExtraXp, importProgress, setAllStatuses, applyImport, togglePart, user, syncState, driveState, connectAndSyncDrive, signOutDrive]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
