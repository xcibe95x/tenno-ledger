// Curated community-consensus meta / top-tier gear, keyed by exact item name
// from the WFCD dataset. Each entry carries a tier (S > A > B) and a short
// note. Tiered entries get a gold "Meta" badge everywhere and a priority
// section at the top of the farm planner. Editorial by nature — trim or
// extend as the balance patches roll in.
//
// For Incarnon Genesis weapons the base weapon is what you farm, so the base
// (or its Prime, when the adapter fits it) is listed.
export const META_PICKS = new Map([
  // --- Warframes -----------------------------------------------------------
  ['Wisp', { tier: 'S', note: 'Motes buff the whole squad — near-mandatory in endgame content' }],
  ['Saryn', { tier: 'S', note: 'Spore/Toxic Lash room clear — best AoE damage frame in the game' }],
  ['Mesa', { tier: 'S', note: 'Peacemakers delete rooms; Shatter Shield makes her nearly unkillable' }],
  ['Dante', { tier: 'S', note: 'Overguard, nuke and revive utility all in one kit' }],
  ['Citrine', { tier: 'S', note: 'Crystal buffs + heals + CC — top support pick' }],
  ['Kullervo', { tier: 'S', note: 'Infinite invulnerability windows with absurd melee damage' }],
  ['Protea', { tier: 'A', note: 'Energy/ammo restore, CC and revives — great utility support' }],
  ['Octavia', { tier: 'A', note: 'Passive invisibility + heals + infinite energy loop' }],
  ['Nova', { tier: 'A', note: 'Molecular Prime speeds the squad and nukes at once' }],
  ['Hydroid', { tier: 'A', note: 'Tentacle Swarm CC + loot boost — great for resource farming' }],
  ['Khora', { tier: 'A', note: 'Strangledome CC/damage, top pick for defense/survival' }],
  ['Xaku', { tier: 'A', note: "Void damage scales with mods, strong CC via The Vast Untime" }],
  ['Revenant', { tier: 'A', note: 'Enthrall CC and Mesmer Skin survivability' }],
  ['Styanax', { tier: 'A', note: 'Tanky CC/damage hybrid, great Rathuum/Index frame' }],
  ['Voruna', { tier: 'A', note: 'Strong solo/duo damage with pack synergy' }],
  ['Qorvex', { tier: 'A', note: 'Armor-strip CC and tanky group utility' }],
  ['Jade', { tier: 'A', note: 'Squad-wide damage buffs and CC via light beams' }],
  ['Nekros', { tier: 'B', note: 'Desecrate loot doubling — niche but strong for farming' }],
  ['Mirage', { tier: 'B', note: 'Explosive-damage multiplier, strong burst with the right weapon' }],
  ['Baruuk', { tier: 'B', note: 'Passive CC and heavy-attack burst, solid survivability' }],

  // --- Primaries -------------------------------------------------------------
  ['Torid', { tier: 'S', note: 'Incarnon Genesis — one of the best primaries in the game' }],
  ['Latron', { tier: 'A', note: 'Incarnon Genesis — hits like a truck' }],
  ['Latron Prime', { tier: 'A', note: 'Incarnon Genesis fits the Prime — top-tier semi rifle' }],
  ['Boltor', { tier: 'A', note: 'Incarnon Genesis — shredding auto rifle' }],
  ['Boltor Prime', { tier: 'A', note: 'Incarnon Genesis fits the Prime' }],
  ['Braton', { tier: 'B', note: 'Incarnon Genesis — surprising powerhouse' }],
  ['Braton Prime', { tier: 'B', note: 'Incarnon Genesis fits the Prime' }],
  ['Strun', { tier: 'A', note: 'Incarnon Genesis — top-tier shotgun' }],
  ['Strun Prime', { tier: 'A', note: 'Incarnon Genesis fits the Prime' }],
  ['Burston Prime', { tier: 'A', note: 'Incarnon Genesis fits the Prime — melts with fire rate' }],
  ['Phenmor', { tier: 'A', note: 'Zariman Incarnon — endgame-viable slash rifle' }],
  ['Felarx', { tier: 'S', note: 'Zariman Incarnon — top-tier shotgun' }],
  ['Nataruk', { tier: 'B', note: 'Best bow in the game, no ammo worries' }],
  ['Kuva Bramma', { tier: 'S', note: 'Explosive bow — room-clearing AoE' }],
  ['Kuva Zarr', { tier: 'S', note: 'Top-tier AoE launcher' }],
  ['Kuva Hek', { tier: 'A', note: 'Massive burst with Scattered Justice' }],
  ['Kuva Sobek', { tier: 'B', note: 'Acid Shells AoE shotgun' }],
  ['Kuva Ogris', { tier: 'A', note: 'Strong AoE with Nightwatch Napalm' }],
  ['Tenet Arca Plasmor', { tier: 'A', note: 'Punch-through plasma shotgun' }],
  ['Tenet Envoy', { tier: 'B', note: 'Guided-rocket launcher, great with Ivara/Wisp' }],
  ['Tenet Glaxion', { tier: 'B', note: 'Beam freeze — great status primer' }],
  ['Bubonico', { tier: 'A', note: 'Ammo-free viral shotgun' }],
  ['Cedo', { tier: 'A', note: 'Glaive alt-fire status primer — condition-overload enabler' }],
  ['Cedo Prime', { tier: 'S', note: 'Primed status-primer shotgun — straight upgrade' }],
  ['Phantasma', { tier: 'A', note: 'Beam shotgun — top status' }],
  ['Phantasma Prime', { tier: 'S', note: 'Primed beam shotgun — top status' }],
  ['Ignis Wraith', { tier: 'A', note: 'Effortless room-wide status spread' }],
  ['Acceltra Prime', { tier: 'A', note: 'Rocket rifle, huge DPS' }],
  ['Trumna', { tier: 'A', note: 'Heavy auto + grenade alt fire' }],
  ['Trumna Prime', { tier: 'S', note: 'Primed heavy auto + grenade alt fire' }],
  ['Fulmin', { tier: 'B', note: 'Silent shotgun/rifle hybrid, no ammo' }],
  ['Fulmin Prime', { tier: 'A', note: 'Silent hybrid, no ammo — top-tier' }],
  ['Rubico Prime', { tier: 'B', note: 'The Eidolon-hunting sniper' }],
  ['Perigale', { tier: 'A', note: 'Burst sniper — Voruna signature, very strong' }],
  ['Perigale Prime', { tier: 'S', note: 'Primed burst sniper — very strong' }],
  ['Coda Bubonico', { tier: 'S', note: 'Coda-upgraded Bubonico — highest-DPS shotgun available' }],

  // --- Secondaries -----------------------------------------------------------
  ['Laetum', { tier: 'S', note: 'Zariman Incarnon — arguably the best secondary' }],
  ['Kuva Nukor', { tier: 'S', note: 'Best status primer in the game' }],
  ['Tenet Cycron', { tier: 'B', note: 'Reload-free beam primer' }],
  ['Epitaph', { tier: 'A', note: 'Charge-shot primer + viral slash' }],
  ['Epitaph Prime', { tier: 'S', note: 'Primed charge-shot primer — best-in-slot' }],
  ['Dual Toxocyst', { tier: 'B', note: 'Incarnon Genesis — top-tier hybrid pistol' }],
  ['Lex Prime', { tier: 'B', note: 'Incarnon Genesis fits the Prime — hand cannon' }],
  ['Miter', { tier: 'B', note: 'Incarnon Genesis — sawblade AoE monster' }],
  ['Ocucor', { tier: 'B', note: 'Beam tendrils — strong with Sentient Surge' }],
  ['Grimoire', { tier: 'B', note: 'Tome — strong stat-stick and primer' }],
  ['Sporelacer', { tier: 'A', note: 'Kitgun — toxin AoE, top-tier secondary' }],
  ['Coda Mire', { tier: 'A', note: 'Coda-upgraded pistol — reliable status primer' }],

  // --- Melee -------------------------------------------------------------------
  ['Glaive Prime', { tier: 'A', note: 'Heavy-throw slash explosions — top melee' }],
  ['Kronen Prime', { tier: 'A', note: 'Top-tier tonfas, condition overload' }],
  ['Xoris', { tier: 'S', note: 'Infinite combo glaive — utility + damage' }],
  ['Stropha', { tier: 'A', note: 'Gunblade — massive heavy attacks' }],
  ['Ceramic Dagger', { tier: 'B', note: 'Incarnon Genesis — top finisher/slash dagger' }],
  ['Dual Ichor', { tier: 'A', note: 'Incarnon Genesis — toxin clouds melt everything' }],
  ['Hate', { tier: 'A', note: 'Incarnon Genesis — top-tier heavy slash scythe' }],
  ['Magistar', { tier: 'B', note: 'Incarnon Genesis — heavy-attack impact monster' }],
  ['Innodem', { tier: 'B', note: 'Zariman Incarnon dagger — fast slash' }],
  ['Praedos', { tier: 'S', note: 'Zariman Incarnon — best utility melee, parkour buffs' }],
  ['Syam', { tier: 'B', note: 'Duviri nikana — heavy slash waves' }],
  ['Dual Keres Prime', { tier: 'A', note: 'Top-tier crit/status dual swords' }],
  ['Reaper Prime', { tier: 'B', note: 'Heavy slash scythe' }],
  ['Coda Sporothrix', { tier: 'A', note: 'Coda-upgraded staff — strong slam/status hybrid' }],

  // --- Arch-guns & companion weapons -------------------------------------------
  ['Mausolon', { tier: 'A', note: 'Best all-round arch-gun' }],
  ['Kuva Grattler', { tier: 'B', note: 'Top arch-gun for Profit-Taker' }],
  ['Larkspur Prime', { tier: 'A', note: 'Beam arch-gun — strong and forgiving' }],
  ['Velocitus', { tier: 'B', note: 'Eidolon-limb deleter' }],
  ['Verglas', { tier: 'A', note: 'Best sentinel weapon — priming beam' }],
  ['Verglas Prime', { tier: 'S', note: 'Best sentinel weapon, primed' }],
  ['Helstrum', { tier: 'B', note: 'Reliable status-priming sentinel weapon' }],
]);

export const TIER_ORDER = ['S', 'A', 'B'];

// Manually tracked — bump this (and re-check META_PICKS) whenever a new
// Warframe update ships. Update history: https://www.warframe.com/en/patch-notes
export const GAME_VERSION = 'Update 43.5 — Amir’s Shockwave (2026-08-12)';

export function metaInfo(item) {
  return META_PICKS.get(item.name) ?? null;
}
