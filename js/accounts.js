import {
  insertAccount, updateAccount, deleteAccount
} from "./supabase.js";
import { state } from "./state.js";
import { renderAll, renderAccountModal, closeModal, toast } from "./ui.js";

export async function addAccount(name) {
  if (!name.trim()) return toast("Isi nama akun terlebih dahulu.", "warning");

  try {
    await insertAccount(name.trim());
    toast("Akun berhasil ditambahkan.");
    return true;
  } catch (error) {
    toast(`Gagal menambahkan akun: ${error.message}`, "error");
    return false;
  }
}

export async function updateActiveAccount(name) {
  if (!state.activeAccountId || !name.trim()) {
    return toast("Nama akun tidak boleh kosong.", "warning");
  }

  try {
    await updateAccount(state.activeAccountId, name.trim());
    toast("Nama akun diperbarui.");
    closeModal();
    return true;
  } catch (error) {
    toast(`Gagal update akun: ${error.message}`, "error");
    return false;
  }
}

export async function removeActiveAccount() {
  if (!state.activeAccountId) return;
  const account = state.accounts.find(a => String(a.id) === String(state.activeAccountId));
  if (!account) return;

  const confirmed = window.confirm(
    `Hapus akun "${account.account_name}"? Semua riwayat loot yang terkait akan ikut terhapus jika database relation/trigger Anda mengaturnya demikian.`
  );
  if (!confirmed) return;

  try {
    await deleteAccount(state.activeAccountId);
    toast("Akun dihapus.");
    closeModal();
    return true;
  } catch (error) {
    toast(`Gagal menghapus akun: ${error.message}`, "error");
    return false;
  }
}

export function openAccount(accountId) {
  renderAccountModal(accountId);
}
