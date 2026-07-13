import { mrLabel } from '../lib/mastery.js';

// Official in-game mastery sigils from the WARFRAME wiki. Special:FilePath is
// the stable canonical endpoint (it 302s to the current hashed file path), so
// these URLs survive wiki re-uploads. MR 0 is "Unranked"; ranks 1-40 (31-40 are
// the Legendary ranks) are all IconRank{n}.png.
const WIKI = 'https://wiki.warframe.com/w/Special:FilePath/';

function iconFile(mr) {
  const n = Math.max(0, Math.min(40, mr | 0));
  return n === 0 ? 'Unranked.png' : `IconRank${n}.png`;
}

export default function MrBadge({ mr, size = 40, className = '' }) {
  return (
    <img
      className={`mr-badge ${className}`}
      width={size} height={size} loading="lazy"
      src={WIKI + iconFile(mr)}
      alt={`Mastery ${mrLabel(mr)}`}
      title={`Mastery ${mrLabel(mr)}`}
    />
  );
}
