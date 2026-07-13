import { useEffect, useState } from 'react';

// Open-world cycle timers + Baro, from api.warframestat.us (PC worldstate).
const API = 'https://api.warframestat.us/pc';
const ENDPOINTS = ['cetusCycle', 'vallisCycle', 'cambionCycle', 'zarimanCycle', 'duviriCycle', 'voidTrader'];
const REFRESH_MS = 5 * 60 * 1000;

const CAN_HOVER = typeof window !== 'undefined'
  && window.matchMedia?.('(hover: hover)').matches;

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
      do: cetus.isDay
        ? 'Plains of Eidolon: Konzu bounties, mining ore/gems and fishing. Eidolons return at night.'
        : 'Eidolon hunts are live — capture Teralyst → Gantulyst → Hydrolyst on the Plains.',
      pro: 'Arcanes, Focus, Sentient Cores and Quills standing — the main Eidolon payoff.',
    });
  }
  const vallis = ws.vallisCycle;
  if (vallis?.expiry) {
    chips.push({
      key: 'vallis', hot: vallis.isWarm,
      label: `Vallis ${vallis.isWarm ? '♨ warm' : '❄ cold'}`,
      left: timeLeft(vallis.expiry),
      do: vallis.isWarm
        ? 'Orb Vallis is warm — warm-only fish and certain Avichaea spawn. Short window!'
        : 'Orb Vallis is cold — cold-water fishing and most conservation. Toroid farming any time.',
      pro: 'Warm lasts only ~6 min — grab warm-only fish/conservation before it flips back.',
    });
  }
  const cambion = ws.cambionCycle;
  if (cambion?.expiry) {
    const active = cambion.active ?? cambion.state;
    const fass = active === 'fass';
    chips.push({
      key: 'cambion', hot: fass,
      label: `Deimos ${fass ? 'Fass' : 'Vome'}`,
      left: timeLeft(cambion.expiry),
      do: fass
        ? 'Fass is active — Fass-gated fish spawn and Fass Residue drops from Vitreospina.'
        : 'Vome is active — Vome-gated fish and Vome Residue. Isolation Vaults run any time.',
      pro: 'Fass Residue for Son/Entrati standing and Fass-only fish & mining gems.',
    });
  }
  const zariman = ws.zarimanCycle;
  if (zariman?.state && zariman?.expiry) {
    chips.push({
      key: 'zariman', hot: false,
      label: `Zariman: ${zariman.state}`,
      left: timeLeft(zariman.expiry),
      do: `${zariman.state} controls the Zariman now — sets which Angels of the Zariman bounties and enemy spawns are up (Voidplume farming).`,
    });
  }
  const duviri = ws.duviriCycle;
  if (duviri?.state) {
    chips.push({
      key: 'duviri', hot: false,
      label: `Duviri: ${duviri.state}`,
      left: duviri.expiry ? timeLeft(duviri.expiry) : null,
      do: `The Duviri spiral mood is ${duviri.state} — it shifts The Circuit's enemies and which incarnon/Kullervo rewards are emphasised.`,
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
        do: "Baro Ki'Teer inbound. His stock rotates — often mastery gear like Prisma weapons and Mara Detron. Stockpile Ducats now.",
      });
    } else if (now < leaves) {
      chips.push({
        key: 'baro', hot: true,
        label: `Baro at ${baro.location ?? 'a relay'}`, left: timeLeft(baro.expiry),
        do: "Baro Ki'Teer is at the relay — spend Ducats + credits.",
        pro: 'Grab any mastery-worthy weapons you still need before he leaves.',
      });
    }
  }
  return chips;
}

export default function WorldClock() {
  const [chips, setChips] = useState([]);
  // The active chip whose detail is shown. Kept as just the chip so the detail
  // panel sits in one fixed spot and only its text changes as you move across
  // chips — no jumping, repositioning, or scroll-detaching tooltip.
  const [active, setActive] = useState(null);
  // Tap toggles on touch (no hover); tapping the open chip closes it.
  const toggle = (chip) => setActive(a => (a?.key === chip.key ? null : chip));

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
    <div className="worldclock-wrap" onMouseLeave={CAN_HOVER ? () => setActive(null) : undefined}>
      <div className="worldclock" aria-label="World cycles">
        {chips.map(c => (
          <button
            key={c.key}
            type="button"
            className={`wc-chip ${c.hot ? 'wc-hot' : ''} ${active?.key === c.key ? 'wc-active' : ''}`}
            aria-label={`${c.label}. ${c.do}`}
            onClick={() => toggle(c)}
            onMouseEnter={CAN_HOVER ? () => setActive(c) : undefined}
          >
            {c.label}{c.left ? <b> {c.left}</b> : null}
          </button>
        ))}
      </div>
      {active && (
        <div className="wc-detail" role="status">
          <div className="wc-detail-head">
            {active.label}
            {active.hot && <span className="wc-detail-live">active now</span>}
          </div>
          <div className="wc-detail-do">{active.do}</div>
          {active.pro && (
            <div className={`wc-pro ${active.hot ? 'on' : ''}`}>
              ✦ {active.hot ? 'While active: ' : 'When active: '}{active.pro}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
