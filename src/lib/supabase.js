import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Null when Supabase isn't configured — the app then runs on localStorage only.
export const supabase = url && key ? createClient(url, key) : null;

export async function signInWithGoogle() {
  if (!supabase) return;
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function fetchCloudProgress(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function pushCloudProgress(userId, progress) {
  const { error } = await supabase
    .from('progress')
    .upsert({ user_id: userId, data: progress, updated_at: new Date().toISOString() });
  if (error) throw error;
}
