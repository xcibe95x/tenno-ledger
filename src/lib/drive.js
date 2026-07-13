// Google Drive sync — the progress JSON lives in the player's own Drive as a
// visible file, no backend involved. Uses the drive.file scope (non-sensitive:
// no Google verification, no unverified-app warning, no user cap), which only
// grants access to files this app created itself. Requires a Google OAuth
// client id in VITE_GOOGLE_CLIENT_ID; the feature is hidden entirely when absent.

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const FILE_NAME = 'tenno-ledger-progress.json';
const CONNECTED_KEY = 'wfh-drive-connected';
const TOKEN_KEY = 'wfh-drive-token';

export const driveEnabled = !!CLIENT_ID;

let accessToken = null;
let tokenExpiry = 0;

// Google hands out an in-memory access token that dies on page unload, so every
// reload otherwise had to re-acquire one (and often show the reconnect button).
// Persisting the token lets a reload within its ~1h life reuse it with no Google
// round-trip at all. It's a narrowly-scoped drive.file bearer token, the same
// trust level as the progress we already keep in localStorage.
try {
  const saved = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
  if (saved && saved.expiry > Date.now()) {
    accessToken = saved.token;
    tokenExpiry = saved.expiry;
  }
} catch { /* corrupt entry — ignore, we'll re-acquire */ }

function setToken(token, expiry) {
  accessToken = token;
  tokenExpiry = expiry;
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiry }));
}

function clearToken() {
  accessToken = null;
  tokenExpiry = 0;
  localStorage.removeItem(TOKEN_KEY);
}

export function driveConnected() {
  return !!accessToken && Date.now() < tokenExpiry;
}

export function wasDriveConnected() {
  return localStorage.getItem(CONNECTED_KEY) === '1';
}

function loadGsi() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Google sign-in'));
    document.head.appendChild(s);
  });
}

export async function connectDrive() {
  await loadGsi();
  await new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.error) return reject(new Error(resp.error));
        setToken(resp.access_token, Date.now() + (resp.expires_in - 60) * 1000);
        localStorage.setItem(CONNECTED_KEY, '1');
        resolve();
      },
      error_callback: (err) => reject(new Error(err?.message ?? 'Google sign-in was closed')),
    });
    // Skips the popup when the grant already exists and the browser allows it.
    client.requestAccessToken({ prompt: wasDriveConnected() ? '' : 'consent' });
  });
}

export function disconnectDrive() {
  clearToken();
  localStorage.removeItem(CONNECTED_KEY);
}

async function api(path, opts = {}) {
  const res = await fetch(`https://www.googleapis.com${path}`, {
    ...opts,
    headers: { ...opts.headers, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    // A persisted token can be revoked or expired server-side before our clock
    // says so; drop it so the next attempt re-acquires instead of looping on it.
    if (res.status === 401) clearToken();
    throw new Error(`Google Drive error ${res.status}`);
  }
  return res;
}

async function findFile() {
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
  const res = await api(`/drive/v3/files?q=${q}&fields=files(id,modifiedTime)`);
  const json = await res.json();
  return json.files?.[0] ?? null;
}

export async function pullDrive() {
  const file = await findFile();
  if (!file) return null;
  const res = await api(`/drive/v3/files/${file.id}?alt=media`);
  return { data: await res.json(), modifiedTime: Date.parse(file.modifiedTime) };
}

export async function pushDrive(progress) {
  const file = await findFile();
  const metadata = { name: FILE_NAME };
  const boundary = 'tenno-ledger-boundary';
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(progress)}\r\n--${boundary}--`;
  await api(`/upload/drive/v3/files${file ? `/${file.id}` : ''}?uploadType=multipart`, {
    method: file ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
}
