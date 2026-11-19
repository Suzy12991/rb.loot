import {
  insertLoot, updateLoot, deleteLoot
} from "./supabase.js";
import { state } from "./state.js";
import {
  renderAll, startEditLoot, resetLootForm, closeModal, toast
} from "./ui.js";

export function findLoot(id) {
  return state.lootLogs.find(log => String(log.id) === String(id));
}

export async function saveLoot(form) {
  const account_id = form.account_id;
  const loot_value = Number(form.loot_value);
  const match_date = form.match_date;

  if (!account_id) return toast("Pilih akun terlebih dahulu.", "warning");
  if (!Number.isFinite(loot_value) || loot_value < 0) {
    return toast("Nilai loot tidak valid.", "warning");
  }
  if (!match_date) return toast("Pilih tanggal raid.", "warning");

  const payload = { account_id, loot_value, match_date };

  try {
    if (state.editingLootId) {
      await updateLoot(state.editingLootId, payload);
      toast("Record berhasil diperbarui.");
    } else {
      await insertLoot(payload);
      toast("Loot berhasil disimpan.");
    }

    resetLootForm();
    return true;
  } catch (error) {
    toast(`Gagal menyimpan loot: ${error.message}`, "error");
    return false;
  }
}

export async function removeLoot(id) {
  const log = findLoot(id);
  if (!log) return;

  if (!window.confirm("Hapus record loot ini?")) return;

  try {
    await deleteLoot(id);
    if (String(state.activeAccountId) === String(log.account_id)) {
      closeModal();
    }
    toast("Record loot dihapus.");
    return true;
  } catch (error) {
    toast(`Gagal menghapus record: ${error.message}`, "error");
    return false;
  }
}

export function editLootById(id) {
  const log = findLoot(id);
  if (!log) return;
  closeModal();
  startEditLoot(log);
}
