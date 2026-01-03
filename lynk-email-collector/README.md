# 📧 Lynk Email Collector

Chrome Extension untuk mengumpulkan email pelanggan dari halaman order Lynk.id.

## ✨ Fitur

- 🔍 **Kumpulkan Email** - Ekstrak email dari halaman order dengan sekali klik
- 📋 **Copy ke Clipboard** - Salin semua email untuk di-paste ke email client
- 💾 **Export CSV** - Download daftar email sebagai file CSV
- 🗑️ **Hapus Data** - Bersihkan semua email yang tersimpan
- 🎨 **UI Modern** - Tampilan yang bersih dan mudah digunakan

## 🚀 Cara Install

### Langkah 1: Buka Chrome Extensions
1. Buka Google Chrome
2. Ketik `chrome://extensions` di address bar
3. Tekan Enter

### Langkah 2: Aktifkan Developer Mode
1. Di pojok kanan atas, aktifkan toggle **"Developer mode"**

### Langkah 3: Load Extension
1. Klik tombol **"Load unpacked"**
2. Pilih folder `lynk-email-collector` ini
3. Extension akan muncul di daftar

### Langkah 4: Pin Extension (Opsional)
1. Klik icon puzzle 🧩 di toolbar Chrome
2. Klik pin 📌 di samping "Lynk Email Collector"

## 📖 Cara Pakai

1. **Buka halaman order Lynk.id**
   - Login ke https://lynk.id/admin/orders/home

2. **Klik icon extension** di toolbar Chrome
   
3. **Klik "Kumpulkan Email dari Halaman"**
   - Extension akan scan halaman dan mengumpulkan semua email

4. **Navigasi ke halaman berikutnya** (jika ada)
   - Ulangi langkah 3 untuk setiap halaman
   - Email akan terakumulasi

5. **Copy atau Export**
   - Klik "Copy Semua Email" untuk copy ke clipboard
   - Klik "Export ke CSV" untuk download file

## 📋 Format Output

### Copy (untuk paste ke BCC email):
```
email1@gmail.com
email2@yahoo.com
email3@outlook.com
```

### CSV Export:
```csv
Email
email1@gmail.com
email2@yahoo.com
email3@outlook.com
```

## ⚠️ Catatan Penting

- Email disimpan di browser Anda (localStorage)
- Data tidak dikirim ke server manapun
- Jangan lupa hapus data setelah selesai mengirim email (untuk keamanan)
- Extension hanya bekerja di domain `lynk.id`

## 🔒 Privasi

Extension ini:
- ✅ Bekerja 100% offline
- ✅ Tidak mengirim data ke server eksternal
- ✅ Menyimpan data hanya di browser lokal Anda
- ✅ Open source dan transparan

---

Made with ❤️ for Berkah Produk
