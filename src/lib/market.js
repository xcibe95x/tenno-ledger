// warframe.market item-page slugs are lowercase, underscore-separated names
// (e.g. "Kuva Bramma" -> "kuva_bramma", "Wisp Prime" -> "wisp_prime"). Prime
// gear is generally traded as its individual parts rather than the whole set,
// but the base name still resolves to the item's overview page, which lists
// every part with live prices.
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function marketUrl(item) {
  // Prime gear itself is never flagged tradable (you can't trade a built
  // Warframe), but its parts are always tradable as a "set" listing.
  if (!item.tradable && !item.isPrime) return null;
  // Prime gear trades as a bundled "set" listing (all parts + blueprint);
  // Vandal/Wraith/syndicate weapons trade as the single finished item.
  const slug = slugify(item.name) + (item.isPrime ? '_set' : '');
  return `https://warframe.market/items/${slug}`;
}
