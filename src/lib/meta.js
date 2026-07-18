// Curated community-consensus meta / top-tier weapons, keyed by exact item
// name from the WFCD dataset. These get a gold "Meta" badge everywhere and a
// priority section at the top of the farm planner. Editorial by nature — trim
// or extend as the balance patches roll in.
//
// For Incarnon Genesis weapons the base weapon is what you farm, so the base
// (or its Prime, when the adapter fits it) is listed.
export const META_PICKS = new Map([
  // Primaries
  ['Torid', 'Incarnon Genesis — one of the best primaries in the game'],
  ['Latron', 'Incarnon Genesis — hits like a truck'],
  ['Latron Prime', 'Incarnon Genesis fits the Prime — top-tier semi rifle'],
  ['Boltor', 'Incarnon Genesis — shredding auto rifle'],
  ['Boltor Prime', 'Incarnon Genesis fits the Prime'],
  ['Braton', 'Incarnon Genesis — surprising powerhouse'],
  ['Braton Prime', 'Incarnon Genesis fits the Prime'],
  ['Strun', 'Incarnon Genesis — top-tier shotgun'],
  ['Strun Prime', 'Incarnon Genesis fits the Prime'],
  ['Burston Prime', 'Incarnon Genesis fits the Prime — melts with fire rate'],
  ['Phenmor', 'Zariman Incarnon — endgame-viable slash rifle'],
  ['Felarx', 'Zariman Incarnon — top-tier shotgun'],
  ['Nataruk', 'Best bow in the game, no ammo worries'],
  ['Kuva Bramma', 'Explosive bow — room-clearing AoE'],
  ['Kuva Zarr', 'Top-tier AoE launcher'],
  ['Kuva Hek', 'Massive burst with Scattered Justice'],
  ['Kuva Sobek', 'Acid Shells AoE shotgun'],
  ['Kuva Ogris', 'Strong AoE with Nightwatch Napalm'],
  ['Tenet Arca Plasmor', 'Punch-through plasma shotgun'],
  ['Tenet Envoy', 'Guided-rocket launcher, great with Ivara/Wisp'],
  ['Tenet Glaxion', 'Beam freeze — great status primer'],
  ['Bubonico', 'Ammo-free viral shotgun'],
  ['Cedo', 'Glaive alt-fire status primer — condition-overload enabler'],
  ['Cedo Prime', 'Primed status-primer shotgun — straight upgrade'],
  ['Phantasma', 'Beam shotgun — top status'],
  ['Phantasma Prime', 'Primed beam shotgun — top status'],
  ['Ignis Wraith', 'Effortless room-wide status spread'],
  ['Acceltra Prime', 'Rocket rifle, huge DPS'],
  ['Trumna', 'Heavy auto + grenade alt fire'],
  ['Trumna Prime', 'Primed heavy auto + grenade alt fire'],
  ['Fulmin', 'Silent shotgun/rifle hybrid, no ammo'],
  ['Fulmin Prime', 'Silent hybrid, no ammo — top-tier'],
  ['Rubico Prime', 'The Eidolon-hunting sniper'],
  ['Perigale', 'Burst sniper — Voruna signature, very strong'],
  ['Perigale Prime', 'Primed burst sniper — very strong'],

  // Secondaries
  ['Laetum', 'Zariman Incarnon — arguably the best secondary'],
  ['Kuva Nukor', 'Best status primer in the game'],
  ['Tenet Cycron', 'Reload-free beam primer'],
  ['Epitaph', 'Charge-shot primer + viral slash'],
  ['Epitaph Prime', 'Primed charge-shot primer — best-in-slot'],
  ['Dual Toxocyst', 'Incarnon Genesis — top-tier hybrid pistol'],
  ['Lex Prime', 'Incarnon Genesis fits the Prime — hand cannon'],
  ['Miter', 'Incarnon Genesis — sawblade AoE monster'],
  ['Ocucor', 'Beam tendrils — strong with Sentient Surge'],
  ['Grimoire', 'Tome — strong stat-stick and primer'],
  ['Sporelacer', 'Kitgun — toxin AoE, top-tier secondary'],

  // Melee
  ['Glaive Prime', 'Heavy-throw slash explosions — top melee'],
  ['Kronen Prime', 'Top-tier tonfas, condition overload'],
  ['Xoris', 'Infinite combo glaive — utility + damage'],
  ['Stropha', 'Gunblade — massive heavy attacks'],
  ['Ceramic Dagger', 'Incarnon Genesis — top finisher/slash dagger'],
  ['Dual Ichor', 'Incarnon Genesis — toxin clouds melt everything'],
  ['Hate', 'Incarnon Genesis — top-tier heavy slash scythe'],
  ['Magistar', 'Incarnon Genesis — heavy-attack impact monster'],
  ['Innodem', 'Zariman Incarnon dagger — fast slash'],
  ['Praedos', 'Zariman Incarnon — best utility melee, parkour buffs'],
  ['Syam', 'Duviri nikana — heavy slash waves'],
  ['Dual Keres Prime', 'Top-tier crit/status dual swords'],
  ['Reaper Prime', 'Heavy slash scythe'],

  // Arch-guns & companion weapons
  ['Mausolon', 'Best all-round arch-gun'],
  ['Kuva Grattler', 'Top arch-gun for Profit-Taker'],
  ['Larkspur Prime', 'Beam arch-gun — strong and forgiving'],
  ['Velocitus', 'Eidolon-limb deleter'],
  ['Verglas', 'Best sentinel weapon — priming beam'],
  ['Verglas Prime', 'Best sentinel weapon, primed'],
  ['Helstrum', 'Reliable status-priming sentinel weapon'],
]);

export function metaInfo(item) {
  return META_PICKS.get(item.name) ?? null;
}
