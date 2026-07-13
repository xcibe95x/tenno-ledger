import { useStore } from '../store.jsx';
import { masterySummary, mrLabel } from '../lib/mastery.js';
import { signInWithGoogle, signOut } from '../lib/supabase.js';
import MrBadge from './MrBadge.jsx';

const SEGMENTS = 24;

export default function Header() {
  const { items, progress, user, syncState, supabaseEnabled, driveEnabled, driveState, connectAndSyncDrive } = useStore();
  const sum = masterySummary(items ?? [], progress.status, progress.extraXp, progress.itemXp);
  const filled = Math.round(sum.nextPct * SEGMENTS);

  return (
    <header className="hdr">
      <div className="hdr-title">
        <h1>Tenno&nbsp;Ledger</h1>
        <p className="hdr-sub">mastery · farming · keep-list</p>
      </div>

      <div className="hdr-mr">
        <MrBadge mr={sum.mr} size={52} className="hdr-mr-badge" />
        <div className="hdr-mr-body">
          <div className="mr-rank">
            <span className={`mr-num ${sum.mr > 30 ? 'mr-legendary' : ''}`}>{mrLabel(sum.mr)}</span>
            <span className="mr-next">{sum.toNext.toLocaleString()} XP to {mrLabel(sum.mr + 1)}</span>
          </div>
          <div className="mr-bar" role="progressbar" aria-valuenow={Math.round(sum.nextPct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next mastery rank">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span key={i} className={`mr-seg ${i < filled ? 'on' : ''}`} />
            ))}
          </div>
          <div className="mr-stats">
            <span>{sum.masteredCount} / {sum.itemCount} mastered</span>
            <span>{sum.xp.toLocaleString()} XP tracked</span>
          </div>
        </div>
      </div>

      <div className="hdr-auth">
        {supabaseEnabled ? (
          user ? (
            <>
              <span className={`sync sync-${syncState}`}>
                {syncState === 'syncing' ? 'Syncing…' : syncState === 'synced' ? 'Synced' : syncState === 'error' ? 'Sync failed' : ''}
              </span>
              <button className="btn" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <button className="btn btn-gold" onClick={signInWithGoogle}>Sign in with Google</button>
          )
        ) : driveEnabled ? (
          driveState === 'synced' || driveState === 'syncing' ? (
            <span className={`sync ${driveState === 'synced' ? 'sync-synced' : ''}`}>
              {driveState === 'syncing' ? 'Syncing…' : 'Drive synced'}
            </span>
          ) : (
            <button className="btn btn-gold" onClick={() => connectAndSyncDrive().catch(() => {})}>
              {driveState === 'reconnect' ? 'Reconnect Drive' : 'Connect Drive'}
            </button>
          )
        ) : (
          <span className="sync sync-off" title="Progress is saved in this browser. Use Settings to back up.">Saved on this device</span>
        )}
      </div>
    </header>
  );
}
