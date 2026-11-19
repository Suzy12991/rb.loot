import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

let client = null;

export function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY belum diisi di js/config.js");
  }
  client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export function getSupabase() {
  if (!client) throw new Error("Supabase belum diinisialisasi.");
  return client;
}

export async function fetchAccounts() {
  const { data, error } = await getSupabase()
    .from("game_accounts")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchLootLogs() {
  const { data, error } = await getSupabase()
    .from("loot_logs")
    .select("*")
    .order("match_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertAccount(account_name) {
  const { error } = await getSupabase()
    .from("game_accounts")
    .insert([{ account_name }]);
  if (error) throw error;
}

export async function updateAccount(id, account_name) {
  const { error } = await getSupabase()
    .from("game_accounts")
    .update({ account_name })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAccount(id) {
  const { error } = await getSupabase()
    .from("game_accounts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function insertLoot(payload) {
  const { error } = await getSupabase().from("loot_logs").insert([payload]);
  if (error) throw error;
}

export async function updateLoot(id, payload) {
  const { error } = await getSupabase()
    .from("loot_logs")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteLoot(id) {
  const { error } = await getSupabase()
    .from("loot_logs")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
