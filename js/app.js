import { initSupabase, fetchAccounts, fetchLootLogs } from "./supabase.js";
import { state, todayISO } from "./state.js";
import {
  initUI, renderAll, updateConnectionStatus, toast,
  focusAddLoot, resetLootForm, renderAccountModal, closeModal
} from "./ui.js";
import { addAccount, updateActiveAccount, removeActiveAccount } from "./accounts.js";
import { saveLoot, removeLoot, editLootById } from "./loot.js";

const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", async () => {
  initUI();
  bindActions();
  await bootstrap();
});

async function bootstrap() {
  $("#matchDate").value = todayISO();
  $("#dashboardDate").value = todayISO();

  try {
    initSupabase();
    updateConnectionStatus("ONLINE", "online");
    await reloadData();
  } catch (error) {
    console.error(error);
    updateConnectionStatus("CONFIG ERROR", "error");
    toast(error.message, "error");
  }
}

async function reloadData() {
  try {
    const [accounts, lootLogs] = await Promise.all([
      fetchAccounts(),
      fetchLootLogs()
    ]);

    state.accounts = accounts;
    state.lootLogs = lootLogs;
    renderAll();
  } catch (error) {
    console.error(error);
    updateConnectionStatus("DATA ERROR", "error");
    toast(`Gagal memuat data: ${error.message}`, "error");
  }
}

function bindActions() {
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;

    if (action === "focus-add") {
      resetLootForm();
      focusAddLoot();
    }

    if (action === "cancel-edit") {
      resetLootForm();
    }

    if (action === "clear-loot") {
      $("#lootValue").value = "";
      $("#lootValue").focus();
    }

    if (action === "clear-filter") {
      $("#lootFilterDate").value = "";
      renderAll();
    }

    if (action === "close-modal") {
      closeModal();
    }

    if (action === "add-account") {
      const input = $("#newAccountInput");
      const success = await addAccount(input.value);
      if (success) {
        input.value = "";
        await reloadData();
      }
    }

    if (action === "open-account") {
      renderAccountModal(button.dataset.id);
    }

    if (action === "update-account") {
      const success = await updateActiveAccount($("#editAccountNameInput").value);
      if (success) await reloadData();
    }

    if (action === "delete-account") {
      const success = await removeActiveAccount();
      if (success) await reloadData();
    }

    if (action === "edit-loot") {
      editLootById(button.dataset.id);
    }

    if (action === "delete-loot") {
      const success = await removeLoot(button.dataset.id);
      if (success) await reloadData();
    }
  });

  document.addEventListener("click", (event) => {
    const preset = event.target.closest("[data-preset]");
    if (!preset) return;
    const current = Number($("#lootValue").value || 0);
    $("#lootValue").value = current + Number(preset.dataset.preset);
  });

  $("#lootForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const success = await saveLoot({
      account_id: $("#accountSelect").value,
      loot_value: $("#lootValue").value,
      match_date: $("#matchDate").value
    });

    if (success) await reloadData();
  });

  $("#newAccountInput").addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const input = $("#newAccountInput");
    const success = await addAccount(input.value);
    if (success) {
      input.value = "";
      await reloadData();
    }
  });
}
