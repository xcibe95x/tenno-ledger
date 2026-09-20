import { mrLabel } from '../lib/mastery.js';

// Official in-game mastery sigils from the WARFRAME wiki. Special:FilePath is
// the stable canonical endpoint (it 302s to the current hashed file path), so
// these URLs survive wiki re-uploads. Ranks 1-40 (31-40 are the Legendary
// ranks) are all IconRank{n}.png. MR 0 has no in-game sigil at all — both
// wiki placeholders for it ("Unranked.png", "IconRank0.png") are essentially
// blank, so it gets a plain drawn ring instead of a fetched image.
const WIKI = 'https://wiki.warframe.com/w/Special:FilePath/';

export default function MrBadge({ mr, size = 40, className = '' }) {
  const n = Math.max(0, Math.min(40, mr | 0));
  if (n === 0) {
    return (
      <span
        className={`mr-badge mr-badge-zero ${className}`}
        style={{ width: size, height: size }}
        title={`Mastery ${mrLabel(0)}`}
        aria-label={`Mastery ${mrLabel(0)}`}
      >
        0
      </span>
    );
  }
  return (
    <img
      className={`mr-badge ${className}`}
      width={size} height={size} loading="lazy"
      src={`${WIKI}IconRank${n}.png`}
      alt={`Mastery ${mrLabel(mr)}`}
      title={`Mastery ${mrLabel(mr)}`}
    />
  );
}
