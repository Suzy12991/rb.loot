export const state = {
  accounts: [],
  lootLogs: [],
  editingLootId: null,
  activeAccountId: null,
  currentView: "overview"
};

export function accountById(id) {
  return state.accounts.find(account => String(account.id) === String(id));
}

export function logsForAccount(accountId) {
  return state.lootLogs.filter(log => String(log.account_id) === String(accountId));
}

export function totalLoot(logs = state.lootLogs) {
  return logs.reduce((sum, log) => sum + Number(log.loot_value || 0), 0);
}

export function formatKoen(value) {
  return `${Number(value || 0).toLocaleString("id-ID")} K`;
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric"
  }).format(new Date(`${dateString}T00:00:00`));
}

export function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
