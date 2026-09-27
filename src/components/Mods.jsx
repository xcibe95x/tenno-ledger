import { useMemo, useState } from "react";
import useSWR from "swr";
import { dataUrl, staticData } from "../lib/swr.js";
import { useIncremental, sliceGroups } from "../lib/useIncremental.js";
import {
  IMG,
  MOD_TIERS,
  META,
  metaInfo,
  modTier,
  dropText,
  wikiUrl,
  SLOT_ORDER,
  RARITY_ORDER,
  TIER_LEGEND,
} from "../lib/mods.js";

const OWNED_KEY = "wfh-mods-owned";
const COLLAPSE_KEY = "wfh-mods-collapsed";
const EMPTY_MODS = [];

function loadSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}
function saveSet(key, set) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

function ModCard({ mod, meta, owned, onToggle }) {
  const where = meta?.where ?? dropText(mod);
  // Only show the compat sub-label when it adds info — many mods list their
  // slot as the compat too (Shotgun Mod → "Shotgun"), which would read
  // "Shotgun · Shotgun".
  const compat =
    mod.compat && mod.compat.toLowerCase() !== mod.slot.toLowerCase()
      ? mod.compat
      : null;
  return (
    <article className={`card mod-card ${owned ? "st-3" : ""}`}>
      <button
        className="card-hit"
        onClick={() => onToggle(mod.name)}
        title={`${mod.name} — ${owned ? "owned" : "not owned"} · tap to toggle`}
      >
        <div
          className={`card-img mod-icon mod-t-${modTier(mod)}`}
          title={mod.rarity ?? ""}
        >
          {mod.image && <img loading="lazy" src={IMG + mod.image} alt="" />}
        </div>
        <div className="card-body">
          <div className="card-name">{mod.name}</div>
          <div className="card-meta">
            <span className="mod-slot">
              {mod.slot}
              {compat ? ` · ${compat}` : ""}
            </span>
            {mod.rarity && (
              <span className={`mod-rarity r-${mod.rarity.toLowerCase()}`}>
                {mod.rarity}
              </span>
            )}
          </div>
          {meta && <p className="mod-effect">{meta.effect}</p>}
          <div className="card-badges">
            <span className={`badge ${owned ? "badge-st3" : ""}`}>
              {owned ? "Owned ✓" : "Not owned"}
            </span>
            {meta && (
              <span
                className="badge badge-meta"
                title="Community-consensus must-own"
              >
                ★ Meta
              </span>
            )}
            {mod.isPrime && <span className="badge badge-prime">Prime</span>}
          </div>
        </div>
      </button>
      <div className="card-farm">
        <p>
          <span className="farm-where">{where}</span>
        </p>
        <a
          href={wikiUrl(mod.name)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          wiki ↗
        </a>
      </div>
    </article>
  );
}

function Section({
  id,
  title,
  hint,
  count,
  className,
  collapsed,
  onToggle,
  children,
}) {
  return (
    <div className={`tier ${className}`}>
      <button
        className={`tier-title ${collapsed ? "is-collapsed" : ""}`}
        onClick={() => onToggle(id)}
        aria-expanded={!collapsed}
      >
        <span className="tier-caret" aria-hidden="true">
          ▾
        </span>
        {title} <span className="tier-count">{count}</span>
      </button>
      {!collapsed && (
        <>
          {hint && <p className="mod-tier-hint">{hint}</p>}
          <div className="grid">{children}</div>
        </>
      )}
    </div>
  );
}

export default function Mods() {
  const [owned, setOwned] = useState(() => loadSet(OWNED_KEY));
  const [collapsed, setCollapsed] = useState(() => loadSet(COLLAPSE_KEY));
  const [q, setQ] = useState("");
  const [slot, setSlot] = useState("all");
  const [tier, setTier] = useState("all");
  const [metaOnly, setMetaOnly] = useState(false);
  const [hideOwned, setHideOwned] = useState(false);
  const { data: modData, error: modsError } = useSWR(
    dataUrl("mods.json"),
    staticData,
  );
  const mods = modData?.mods ?? (modsError ? EMPTY_MODS : null);

  const toggleOwned = (name) =>
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      saveSet(OWNED_KEY, next);
      return next;
    });
  const toggleSection = (id) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet(COLLAPSE_KEY, next);
      return next;
    });

  const { metaGroups, slotGroups, shown, ownedMeta } = useMemo(() => {
    const all = mods ?? [];
    const needle = q.trim().toLowerCase();
    // A search always spans the entire roster — otherwise "Meta only" hides
    // variants (Amalgam/Higasa/Sweeping Serration…) and it looks like they're
    // missing. Meta-only only governs the default browse view.
    const match = (m) => {
      if (slot !== "all" && m.slot !== slot) return false;
      if (tier !== "all" && modTier(m) !== tier) return false;
      if (hideOwned && owned.has(m.name)) return false;
      if (needle) {
        const meta = metaInfo(m.name);
        return (
          m.name.toLowerCase().includes(needle) ||
          (m.compat ?? "").toLowerCase().includes(needle) ||
          (meta?.effect ?? "").toLowerCase().includes(needle)
        );
      }
      if (metaOnly && !META.has(m.name)) return false;
      return true;
    };
    const visible = all.filter(match);
    const ownedMeta = all.filter(
      (m) => META.has(m.name) && owned.has(m.name),
    ).length;

    // Meta view: group into the curated priority tiers.
    const byTier = new Map(MOD_TIERS.map((t) => [t.key, []]));
    for (const m of visible) {
      const meta = metaInfo(m.name);
      if (meta) byTier.get(meta.tier)?.push(m);
    }
    const metaGroups = MOD_TIERS.map((t) => ({
      ...t,
      mods: byTier.get(t.key),
    })).filter((g) => g.mods.length);

    // Full-roster view: group by weapon slot, meta first then by rarity.
    const bySlot = new Map();
    for (const m of visible) {
      if (!bySlot.has(m.slot)) bySlot.set(m.slot, []);
      bySlot.get(m.slot).push(m);
    }
    const slotGroups = SLOT_ORDER.filter((s) => bySlot.has(s)).map((s) => ({
      key: s,
      mods: bySlot
        .get(s)
        .sort(
          (a, b) =>
            META.has(b.name) - META.has(a.name) ||
            (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9) ||
            a.name.localeCompare(b.name),
        ),
    }));

    return { metaGroups, slotGroups, shown: visible.length, ownedMeta };
  }, [mods, q, slot, tier, metaOnly, hideOwned, owned]);

  // Which grouping the body renders — meta tiers or the full slot roster.
  const groups =
    metaOnly && !q.trim() && tier === "all" ? metaGroups : slotGroups;
  const groupKind = groups === metaGroups ? "meta" : "slot";

  // Collapsed sections render nothing, so they must not eat into the budget.
  const renderable = useMemo(
    () =>
      groups.map((g) =>
        collapsed.has(`${groupKind}-${g.key}`) ? { ...g, mods: EMPTY_MODS } : g,
      ),
    [groups, groupKind, collapsed],
  );
  const cardCount = useMemo(
    () => renderable.reduce((n, g) => n + g.mods.length, 0),
    [renderable],
  );
  // 1200+ mod cards at once locks up the tab, so grow the list while scrolling.
  const { limit, sentinelRef, done } = useIncremental(cardCount, {
    resetKey: `${groupKind}|${q}|${slot}|${tier}|${metaOnly}|${hideOwned}`,
  });
  const visibleGroups = sliceGroups(renderable, limit);

  if (mods === null) return <p className="empty">Loading mod roster…</p>;

  return (
    <section>
      <div className="filters">
        <div className="field">
          <label className="field-label" htmlFor="mod-search">
            Search
          </label>
          <input
            id="mod-search"
            className="inp inp-search"
            type="search"
            placeholder="Search mods…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="mod-slot">
            Type
          </label>
          <select
            id="mod-slot"
            className="inp"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          >
            <option value="all">All types</option>
            {SLOT_ORDER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="field-label">Show</span>
          <div className="mod-toggles">
            <label className="mod-toggle">
              <input
                type="checkbox"
                checked={metaOnly}
                onChange={(e) => setMetaOnly(e.target.checked)}
              />
              Meta only
            </label>
            <label className="mod-toggle">
              <input
                type="checkbox"
                checked={hideOwned}
                onChange={(e) => setHideOwned(e.target.checked)}
              />
              Hide owned
            </label>
          </div>
        </div>
        <span className="filters-count">
          {q.trim()
            ? `${shown} of ${mods.length} mods match “${q.trim()}” — search always spans the full roster.`
            : metaOnly
              ? `${ownedMeta} / ${META.size} meta mods owned. Farm the ① tier first, then work down. Turn off “Meta only” to browse all ${mods.length} mods.`
              : `${shown} of ${mods.length} mods shown. Turn on “Meta only” to see just the must-owns. Tap a mod to mark it owned — saved on this device.`}
        </span>
      </div>

      <div className="mod-legend" role="group" aria-label="Filter by mod tier">
        {TIER_LEGEND.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`mod-legend-item mod-t-${t.key} ${tier === t.key ? "is-active" : ""}`}
            aria-pressed={tier === t.key}
            onClick={() => setTier((cur) => (cur === t.key ? "all" : t.key))}
          >
            <span className="mod-legend-swatch" aria-hidden="true" />
            {t.label}
          </button>
        ))}
        {tier !== "all" && (
          <button
            type="button"
            className="mod-legend-clear"
            onClick={() => setTier("all")}
          >
            clear ✕
          </button>
        )}
      </div>

      {visibleGroups.map((g) => (
        <Section
          key={g.key}
          id={`${groupKind}-${g.key}`}
          title={groupKind === "meta" ? g.label : g.key}
          hint={g.hint}
          count={
            (groups.find((x) => x.key === g.key) ?? g).mods.length
          }
          className={groupKind === "meta" ? `tier-mod-${g.key}` : "tier-mod-slot"}
          collapsed={collapsed.has(`${groupKind}-${g.key}`)}
          onToggle={toggleSection}
        >
          {g.mods.map((m) => (
            <ModCard
              key={m.name}
              mod={m}
              meta={metaInfo(m.name)}
              owned={owned.has(m.name)}
              onToggle={toggleOwned}
            />
          ))}
        </Section>
      ))}
      {!done && (
        <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />
      )}

      {shown === 0 && (
        <p className="empty">
          {q.trim()
            ? `No mods match “${q.trim()}”.`
            : "No mods match these filters."}
        </p>
      )}
    </section>
  );
}
