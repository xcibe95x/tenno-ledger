import { useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { importFromProfile } from '../lib/importProfile.js';

export default function Settings() {
  const {
    items, nodes, progress, setExtraXp, importProgress, applyImport,
    supabaseEnabled, driveEnabled, driveState, connectAndSyncDrive, signOutDrive,
  } = useStore();
  const fileRef = useRef(null);
  const profileFileRef = useRef(null);
  const [profileText, setProfileText] = useState('');
  const [importResult, setImportResult] = useState(null);

  const runProfileImport = (text) => {
    try {
      const { status, itemXp, extraXp, summary } = importFromProfile(JSON.parse(text), items ?? [], progress.status, nodes);
      applyImport({ status, itemXp, extraXp });
      setImportResult({ ok: true, ...summary });
      setProfileText('');
    } catch (err) {
      setImportResult({ ok: false, error: err.message });
    }
  };

  const importProfileFile = async (e) => {
    const file = e.target.files?.[0];
    if (file) runProfileImport(await file.text());
    e.target.value = '';
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `warframe-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      importProgress(JSON.parse(await file.text()));
      alert('Progress imported.');
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
    e.target.value = '';
  };

  return (
    <section className="settings">
      <div className="panel">
        <h2>Import from your game profile</h2>
        <p>Marks everything you've already leveled or mastered in one go. You fetch your own data straight from Warframe's servers, so nothing can get rate-limited or flagged:</p>
        <ol>
          <li>Log in at warframe.com, open <a href="https://www.warframe.com/api/user-data" target="_blank" rel="noreferrer">warframe.com/api/user-data</a> and copy the value after <code>"user_id"</code> (letters and numbers only)</li>
          <li>Open <code>https://api.warframe.com/cdn/getProfileViewingData.php?playerId=YOUR_ID</code> in a new tab (PC; consoles/mobile use <code>api-ps4.</code>, <code>api-xb1.</code>, <code>api-swi.</code>, <code>api-mob.</code> or <code>api-and.</code>)</li>
          <li>Select all, copy, and paste below — or save the page as a file and upload it</li>
        </ol>
        <textarea
          className="inp inp-block" rows={4}
          placeholder='Paste the profile JSON here ({"Results":[…]})'
          value={profileText} onChange={e => setProfileText(e.target.value)}
          aria-label="Profile JSON"
        />
        <div className="row">
          <button className="btn btn-gold" disabled={!profileText.trim()} onClick={() => runProfileImport(profileText)}>Import profile</button>
          <button className="btn" onClick={() => profileFileRef.current?.click()}>Upload JSON file</button>
          <input ref={profileFileRef} type="file" accept=".json,.php,application/json,text/plain" hidden onChange={importProfileFile} />
        </div>
        {importResult && (
          importResult.ok ? (
            <p className="import-ok">
              Imported: {importResult.mastered} newly mastered, {importResult.leveling} leveling,{' '}
              {importResult.already} already tracked (matched {importResult.matched} of {importResult.totalInProfile} profile entries).
              Star chart: {importResult.nodesCompleted} nodes/junctions = {importResult.starChartXp.toLocaleString()} XP.
              Intrinsics: {importResult.intrinsicRanks} ranks = {importResult.intrinsicsXp.toLocaleString()} XP.
              {importResult.calibrationXp > 0 && ` Calibrated +${importResult.calibrationXp.toLocaleString()} XP to match your in-game MR ${importResult.playerLevel}.`}
              Partially leveled items count their earned ranks too. Your manual progress is never downgraded.
              {importResult.unmatched?.length > 0 && (
                <>
                  <br />Unmatched profile entries (usually exalted/NPC gear that gives no mastery):{' '}
                  {importResult.unmatched.map(u => `${u.name} (${u.xp.toLocaleString()})`).join(', ')}
                </>
              )}
            </p>
          ) : (
            <p className="import-err">Import failed: {importResult.error}</p>
          )
        )}
      </div>

      {driveEnabled && (
        <div className="panel">
          <h2>Google Drive sync</h2>
          <p>Keeps your progress in a file in your own Google Drive (<code>tenno-ledger-progress.json</code>), so it survives cleared browser data and follows you across devices. The app can only see files it created — nothing else in your Drive, and nothing is stored on our side.</p>
          <div className="row">
            <button className="btn btn-gold" onClick={() => connectAndSyncDrive().catch(() => {})}>
              {driveState === 'synced' ? 'Sync now' : driveState === 'reconnect' ? 'Reconnect Google Drive' : 'Connect Google Drive'}
            </button>
            {(driveState === 'synced' || driveState === 'reconnect') && (
              <button className="btn" onClick={signOutDrive}>Disconnect</button>
            )}
          </div>
          {driveState === 'synced' && <p className="import-ok">Connected — changes save to your Drive automatically.</p>}
          {driveState === 'syncing' && <p className="keep-intro">Syncing…</p>}
          {driveState === 'error' && <p className="import-err">Sync failed — check your connection and try again.</p>}
        </div>
      )}

      {supabaseEnabled && (
        <div className="panel">
          <h2>Cloud account sync</h2>
          <p>Sign in with Google from the header. Your progress syncs automatically a moment after each change.</p>
        </div>
      )}

      <div className="panel">
        <h2>Extra mastery XP</h2>
        <p>Star chart, junction and intrinsic XP — filled in automatically when you import your profile. Adjust manually only if your rank still looks off.</p>
        <input
          className="inp" type="number" min="0" step="500"
          value={progress.extraXp} onChange={e => setExtraXp(Number(e.target.value))}
          aria-label="Extra mastery XP"
        />
      </div>

      <div className="panel">
        <h2>Backup</h2>
        <p>Progress is saved in this browser automatically. Export a file backup, or import one on another device.</p>
        <div className="row">
          <button className="btn" onClick={exportJson}>Export progress</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import progress</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJson} />
        </div>
      </div>

      <div className="panel">
        <h2>About the data</h2>
        <p>
          Item, recipe and drop data comes from the community-maintained{' '}
          <a href="https://github.com/WFCD/warframe-items" target="_blank" rel="noreferrer">WFCD warframe-items</a> dataset,
          the same data behind api.warframestat.us and the wiki drop tables.
        </p>
      </div>
    </section>
  );
}
