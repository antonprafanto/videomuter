# 📦 Cara Distribusi Aplikasi Video Muter

## ⚠️ Masalah Build di Windows

Ada known issue dengan electron-builder di Windows terkait permission untuk symbolic links.

## ✅ Solusi Distribusi

### **Option 1: Build sebagai Administrator (Recommended untuk .exe)**

1. **Buka PowerShell/CMD sebagai Administrator**
   - Klik kanan PowerShell/CMD → "Run as Administrator"

2. **Navigate dan build:**
   ```powershell
   cd C:\Users\anton\vibecoding\mute
   npm run build
   ```

3. **File .exe akan ada di:**
   ```
   dist/VideoMuter-Portable.exe
   ```

### **Option 2: Distribusi Folder (Tanpa Build)**

Jika tidak bisa build, distribusikan folder lengkap:

1. **Copy seluruh folder `mute/`** (exclude `node_modules` dan `dist`)

2. **User install dependencies:**
   ```bash
   npm install
   ```

3. **User jalankan aplikasi:**
   ```bash
   npm start
   ```

### **Option 3: Portable Manual**

1. **Jalankan packaging di environment dengan admin rights**

2. **Gunakan `dist/win-unpacked/` folder**
   - Folder ini berisi aplikasi yang sudah siap jalan
   - User bisa langsung run `Video Muter.exe` dari folder tersebut
   - Zip folder `win-unpacked/` dan distribusikan

## 🎯 Untuk User Akhir

### Jika mendapat file .exe:
1. Download `VideoMuter-Portable.exe`
2. Double-click untuk jalankan
3. Selesai!

### Jika mendapat folder zip:
1. Extract folder
2. Double-click `Video Muter.exe`
3. Selesai!

### Jika mendapat source code:
1. Install Node.js dari https://nodejs.org/
2. Buka terminal di folder project
3. Run: `npm install`
4. Run: `npm start`

---

**Note:** FFmpeg sudah ter-bundle, jadi user tidak perlu install apapun!
