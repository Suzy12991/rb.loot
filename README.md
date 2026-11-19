# Arena Breakout Admin Dashboard — Dashboard UI Edition

Versi ini mempertahankan struktur dan fungsi CRUD Supabase dari versi sebelumnya, tetapi UI dirombak menjadi dashboard admin yang lebih umum, bersih, dan mudah dibaca.

### Perubahan UI
- Layout dashboard admin standar: sidebar + topbar + content cards.
- Typography diperbesar dan dibuat lebih mudah dibaca.
- KPI dibuat lebih sederhana dan tidak terlalu dekoratif.
- Tabel, form, tombol, dan spacing dibuat lebih familiar seperti admin dashboard modern.
- Mode Light / Dark.
- Pilihan tema tersimpan di `localStorage`.
- Responsive untuk desktop, tablet, dan mobile.
- Fungsi CRUD akun dan loot tetap dipertahankan.

### Struktur
```text
index.html
css/
  style.css
js/
  app.js
  config.js
  supabase.js
  state.js
  ui.js
  accounts.js
  loot.js
```

### Supabase
Isi `js/config.js` dengan Supabase URL dan anon/publishable key.

Jangan pernah menaruh `service_role` / secret key di frontend atau GitHub.
