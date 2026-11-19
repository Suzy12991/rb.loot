import { state, accountById, logsForAccount, totalLoot, formatKoen, formatDate } from "./state.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

export function initUI() {
  $("#currentDateLabel").textContent = new Intl.DateTimeFormat("id-ID", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric"
  }).format(new Date());

  $("#dashboardDate").value = new Date().toISOString().slice(0, 10);
  $("#matchDate").value = new Date().toISOString().slice(0, 10);

  initTheme();

  $$(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  $$(".btn[data-view]").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $("#dashboardDate").addEventListener("change", renderDashboardDaily);
  $("#lootFilterDate").addEventListener("change", renderLootTable);

  $("#themeToggle")?.addEventListener("click", toggleTheme);
  $("#themeToggleTop")?.addEventListener("click", toggleTheme);
}

function initTheme() {
  const saved = localStorage.getItem("ab-admin-theme");
  const preferred = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(saved || preferred);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("ab-admin-theme", theme);
  const icon = $("#themeIcon");
  const label = $("#themeLabel");
  if (icon) icon.textContent = theme === "dark" ? "☾" : "☀";
  if (label) label.textContent = theme === "dark" ? "Dark mode" : "Light mode";
}

function toggleTheme() {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
}

export function switchView(view) {
  state.currentView = view;
  $$(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  $$(".view").forEach(panel => panel.classList.toggle("active", panel.dataset.viewPanel === view));

  const titles = { overview: "Overview", loot: "Loot Records", accounts: "Accounts" };
  $("#pageTitle").textContent = titles[view] ?? "Overview";
  $("#sidebar").classList.remove("open");

  if (view === "loot") renderLootTable();
  if (view === "accounts") renderAccountTable();
}

export function updateConnectionStatus(text, type = "pending") {
  $("#connectionStatus").textContent = text;
  const dot = $("#connectionDot");
  dot.className = `status-dot ${type}`;
}

export function toast(message, type = "success") {
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;
  $("#toastContainer").appendChild(item);
  setTimeout(() => item.remove(), 3200);
}

export function renderAll() {
  renderStats();
  renderDashboardDaily();
  renderTopAccounts();
  renderRecentLoots();
  renderAccountSelect();
  renderLootTable();
  renderAccountTable();
  if (state.activeAccountId) renderAccountModal(state.activeAccountId);
}

function renderStats() {
  const total = totalLoot();
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = state.lootLogs.filter(log => log.match_date === today);
  const todayTotal = totalLoot(todayLogs);
  const average = state.lootLogs.length ? total / state.lootLogs.length : 0;

  $("#statTotalLoot").textContent = formatKoen(total);
  $("#statTodayLoot").textContent = formatKoen(todayTotal);
  $("#statTodayMeta").textContent = `${todayLogs.length} raid`;
  $("#statAccounts").textContent = state.accounts.length.toLocaleString("id-ID");
  $("#statAverage").textContent = formatKoen(Math.round(average));
}

function renderDashboardDaily() {
  const selected = $("#dashboardDate").value;
  const container = $("#dailyLogContainer");

  if (!state.accounts.length) {
    container.innerHTML = emptyState("Belum ada akun.");
    return;
  }

  container.innerHTML = state.accounts.map(account => {
    const logs = state.lootLogs.filter(log =>
      String(log.account_id) === String(account.id) && log.match_date === selected
    );
    const total = totalLoot(logs);
    const played = logs.length > 0;

    return `
      <div class="operator-card ${played ? "played" : ""}">
        <div class="operator-top">
          <div class="operator-name">${escapeHtml(account.account_name)}</div>
          <div class="operator-status ${played ? "done" : "missing"}">${played ? "✓ ACTIVE" : "✕ NO DATA"}</div>
        </div>
        ${played
          ? `<div class="operator-value">${formatKoen(total)}</div>`
          : `<div class="operator-missing">Belum ada input untuk tanggal ini.</div>`}
      </div>
    `;
  }).join("");
}

function renderTopAccounts() {
  const container = $("#topAccountsContainer");
  const ranked = state.accounts.map(account => ({
    ...account,
    total: totalLoot(logsForAccount(account.id))
  })).sort((a,b) => b.total - a.total);

  if (!ranked.length) {
    container.innerHTML = emptyState("Belum ada data operator.");
    return;
  }

  container.innerHTML = ranked.slice(0, 5).map((account, index) => `
    <div class="rank-row">
      <div class="rank-number">0${index + 1}</div>
      <div class="rank-name">${escapeHtml(account.account_name)}</div>
      <div class="rank-value">${formatKoen(account.total)}</div>
    </div>
  `).join("");
}

function renderRecentLoots() {
  const container = $("#recentLoots");
  const recent = [...state.lootLogs]
    .sort((a,b) => new Date(b.match_date) - new Date(a.match_date))
    .slice(0, 8);

  if (!recent.length) {
    container.innerHTML = emptyState("Belum ada riwayat loot.");
    return;
  }

  container.innerHTML = tableMarkup(recent);
}

function tableMarkup(logs) {
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Account</th>
          <th>Loot</th>
          <th>Date</th>
          <th class="right">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${logs.map(log => {
          const account = accountById(log.account_id);
          return `
            <tr>
              <td><strong>${escapeHtml(account?.account_name ?? "UNKNOWN")}</strong></td>
              <td class="money">${formatKoen(log.loot_value)}</td>
              <td class="date">${formatDate(log.match_date)}</td>
              <td>
                <div class="actions">
                  <button class="table-btn edit" data-action="edit-loot" data-id="${log.id}">EDIT</button>
                  <button class="table-btn delete" data-action="delete-loot" data-id="${log.id}">DELETE</button>
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

function renderLootTable() {
  const container = $("#lootTable");
  const filter = $("#lootFilterDate").value;
  const logs = [...state.lootLogs]
    .filter(log => !filter || log.match_date === filter)
    .sort((a,b) => new Date(b.match_date) - new Date(a.match_date));

  container.innerHTML = logs.length ? tableMarkup(logs) : emptyState("Tidak ada record yang cocok.");
}

function renderAccountSelect() {
  const select = $("#accountSelect");
  const previous = select.value;

  if (!state.accounts.length) {
    select.innerHTML = `<option value="">Belum ada akun</option>`;
    return;
  }

  select.innerHTML = state.accounts.map(account =>
    `<option value="${account.id}">${escapeHtml(account.account_name)}</option>`
  ).join("");

  if (state.accounts.some(a => String(a.id) === String(previous))) {
    select.value = previous;
  }
}

function renderAccountTable() {
  const container = $("#accountTable");
  $("#accountCountLabel").textContent = `${state.accounts.length} account${state.accounts.length === 1 ? "" : "s"}`;

  if (!state.accounts.length) {
    container.innerHTML = emptyState("Belum ada akun operator.");
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Account</th>
          <th>Raids</th>
          <th>Total loot</th>
          <th>Latest raid</th>
          <th class="right">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${state.accounts.map(account => {
          const logs = logsForAccount(account.id);
          const latest = [...logs].sort((a,b) => new Date(b.match_date) - new Date(a.match_date))[0];
          return `
            <tr>
              <td><strong>🪖 ${escapeHtml(account.account_name)}</strong></td>
              <td>${logs.length}</td>
              <td class="money">${formatKoen(totalLoot(logs))}</td>
              <td class="date">${formatDate(latest?.match_date)}</td>
              <td>
                <div class="actions">
                  <button class="table-btn" data-action="open-account" data-id="${account.id}">MANAGE</button>
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

export function renderAccountModal(accountId) {
  const account = accountById(accountId);
  if (!account) return;

  state.activeAccountId = accountId;
  $("#modalAccountName").textContent = `OPERATOR: ${account.account_name}`;
  $("#editAccountNameInput").value = account.account_name;

  const logs = logsForAccount(accountId)
    .sort((a,b) => new Date(b.match_date) - new Date(a.match_date));

  $("#modalLootHistory").innerHTML = logs.length ? logs.map(log => `
    <div class="history-row">
      <div>
        <div class="history-money">${formatKoen(log.loot_value)}</div>
        <div class="history-date">${formatDate(log.match_date)}</div>
      </div>
      <div class="actions">
        <button class="table-btn edit" data-action="edit-loot" data-id="${log.id}">EDIT</button>
        <button class="table-btn delete" data-action="delete-loot" data-id="${log.id}">DELETE</button>
      </div>
    </div>
  `).join("") : emptyState("Belum ada riwayat extraction.");

  $("#accountModal").classList.remove("hidden");
}

export function closeModal() {
  $("#accountModal").classList.add("hidden");
  state.activeAccountId = null;
}

export function startEditLoot(log) {
  state.editingLootId = log.id;
  switchView("loot");
  $("#accountSelect").value = log.account_id;
  $("#lootValue").value = log.loot_value;
  $("#matchDate").value = log.match_date;
  $("#formKicker").textContent = "EDIT RECORD";
  $("#formTitle").textContent = "Update extraction result";
  $("#submitLootBtn").textContent = "Update loot record";
  $("#submitLootBtn").className = "btn btn-secondary btn-block";
  $("#cancelEditBtn").classList.remove("hidden");
  $("#lootFormPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  toast("Edit mode aktif.", "info");
}

export function resetLootForm() {
  state.editingLootId = null;
  $("#lootForm").reset();
  $("#matchDate").value = new Date().toISOString().slice(0, 10);
  $("#formKicker").textContent = "NEW RECORD";
  $("#formTitle").textContent = "Add extraction result";
  $("#submitLootBtn").textContent = "Save loot record";
  $("#submitLootBtn").className = "btn btn-success btn-block";
  $("#cancelEditBtn").classList.add("hidden");
}

export function focusAddLoot() {
  switchView("loot");
  $("#lootFormPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => $("#accountSelect").focus(), 250);
}

function emptyState(text) {
  return `<div class="empty">${escapeHtml(text)}</div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}
