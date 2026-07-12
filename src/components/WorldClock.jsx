import { useEffect, useState } from 'react';

// Open-world cycle timers + Baro, from api.warframestat.us (PC worldstate).
const API = 'https://api.warframestat.us/pc';
const ENDPOINTS = ['cetusCycle', 'vallisCycle', 'cambionCycle', 'zarimanCycle', 'duviriCycle', 'voidTrader'];
const REFRESH_MS = 5 * 60 * 1000;

function timeLeft(expiry) {
  const ms = Date.parse(expiry) - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function buildChips(ws) {
  const chips = [];
  const cetus = ws.cetusCycle;
  if (cetus?.expiry) {
    chips.push({
      key: 'cetus', hot: !cetus.isDay,
      label: `Cetus ${cetus.isDay ? '☀ day' : '☾ night'}`,
      left: timeLeft(cetus.expiry),
      title: cetus.isDay ? 'Eidolon hunts open at night' : 'Eidolon hunting time!',
    });
  }
  const vallis = ws.vallisCycle;
  if (vallis?.expiry) {
    chips.push({
      key: 'vallis', hot: vallis.isWarm,
      label: `Vallis ${vallis.isWarm ? '♨ warm' : '❄ cold'}`,
      left: timeLeft(vallis.expiry),
      title: 'Fortuna fishing/conservation spawns change with the temperature',
    });
  }
  const cambion = ws.cambionCycle;
  if (cambion?.expiry) {
    const active = cambion.active ?? cambion.state;
    chips.push({
      key: 'cambion', hot: active === 'fass',
      label: `Deimos ${active === 'fass' ? 'Fass' : 'Vome'}`,
      left: timeLeft(cambion.expiry),
      title: 'Cambion Drift fish and conservation depend on Fass/Vome',
    });
  }
  const zariman = ws.zarimanCycle;
  if (zariman?.state && zariman?.expiry) {
    chips.push({
      key: 'zariman', hot: false,
      label: `Zariman: ${zariman.state}`,
      left: timeLeft(zariman.expiry),
      title: 'Current faction controlling the Zariman (bounties/spawns)',
    });
  }
  const duviri = ws.duviriCycle;
  if (duviri?.state) {
    chips.push({
      key: 'duviri', hot: false,
      label: `Duviri: ${duviri.state}`,
      left: duviri.expiry ? timeLeft(duviri.expiry) : null,
      title: 'Current Duviri spiral emotion',
    });
  }
  const baro = ws.voidTrader;
  if (baro?.activation && baro?.expiry) {
    // Trust the timestamps, not the `active` flag — it lags around transitions.
    const now = Date.now();
    const arrives = Date.parse(baro.activation);
    const leaves = Date.parse(baro.expiry);
    if (now < arrives) {
      chips.push({
        key: 'baro', hot: false,
        label: 'Baro in', left: timeLeft(baro.activation),
        title: "Baro Ki'Teer sells mastery weapons (Mara Detron, Prisma gear)",
      });
    } else if (now < leaves) {
      chips.push({
        key: 'baro', hot: true,
        label: `Baro at ${baro.location ?? 'a relay'}`, left: timeLeft(baro.expiry),
        title: "Baro Ki'Teer is here — check his stock for mastery items!",
      });
    }
  }
  return chips;
}

export default function WorldClock() {
  const [chips, setChips] = useState([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const results = await Promise.allSettled(
          ENDPOINTS.map(e => fetch(`${API}/${e}`).then(r => r.json())),
        );
        if (!alive) return;
        const ws = {};
        ENDPOINTS.forEach((e, i) => { if (results[i].status === 'fulfilled') ws[e] = results[i].value; });
        setChips(buildChips(ws));
      } catch { /* worldstate down — strip simply stays hidden */ }
    };
    load();
    const fetchTimer = setInterval(load, REFRESH_MS);
    // re-render countdowns every 30s without refetching
    const tick = setInterval(() => setChips(c => [...c]), 30000);
    return () => { alive = false; clearInterval(fetchTimer); clearInterval(tick); };
  }, []);

  if (!chips.length) return null;
  return (
    <div className="worldclock" aria-label="World cycles">
      {chips.map(c => (
        <span key={c.key} className={`wc-chip ${c.hot ? 'wc-hot' : ''}`} title={c.title}>
          {c.label}{c.left ? <b> {c.left}</b> : null}
        </span>
      ))}
    </div>
  );
}
