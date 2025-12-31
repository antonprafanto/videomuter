# Troubleshooting - Video Muter

## Issue: "Cannot read properties of undefined (reading 'whenReady')"

Jika Anda mengalami error ini di Windows, berikut solusinya:

### Penyebab
Issue ini terjadi karena masalah dengan Electron package di Windows environment tertentu, khususnya dengan Git Bash atau terminal tertentu.

### Solusi 1: Gunakan Command Prompt atau PowerShell

**Windows CMD:**
```cmd
cd c:\Users\labko\Downloads\Anton\mute
npm start
```

**PowerShell:**
```powershell
cd c:\Users\labko\Downloads\Anton\mute
npm start
```

### Solusi 2: Gunakan Batch File

Double-click file `start-app.bat` yang sudah disediakan.

### Solusi 3: Reinstall Node.js dan Electron

1. Uninstall Node.js dari system Anda
2. Download Node.js LTS dari: https://nodejs.org/
3. Install Node.js
4. Buka CMD atau PowerShell (JANGAN Git Bash)
5. Navigate ke folder project:
   ```
   cd c:\Users\labko\Downloads\Anton\mute
   ```
6. Hapus node_modules dan reinstall:
   ```
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   npm start
   ```

### Solusi 4: Build executable dan jalankan

```cmd
npm run build
```

Lalu jalankan file .exe yang ada di folder `dist/`.

## Issue: FFmpeg not found

### Solusi

1. **Download FFmpeg:**
   - Windows: https://www.gyan.dev/ffmpeg/builds/
   - Download "ffmpeg-release-full.7z"

2. **Extract ke folder:**
   - Extract ke `C:\ffmpeg`

3. **Tambahkan ke PATH:**
   - Tekan Windows + R
   - Ketik: `sysdm.cpl` lalu Enter
   - Klik tab "Advanced"
   - Klik "Environment Variables"
   - Di "System variables", pilih "Path", klik "Edit"
   - Klik "New"
   - Tambahkan: `C:\ffmpeg\bin`
   - Klik OK semua

4. **Restart Terminal dan test:**
   ```
   ffmpeg -version
   ```

## Issue: Aplikasi berjalan tapi tidak memproses video

### Checklist:
- ✓ FFmpeg sudah terinstall dan di PATH?
- ✓ Video format support (MP4, AVI, MOV, etc)?
- ✓ Folder output ada permission write?
- ✓ File video tidak sedang dibuka aplikasi lain?

## Issue: Node.js version terlalu baru

Electron 30 bekerja dengan baik di Node.js v18-v20. Jika Anda menggunakan Node.js v24+, downgrade ke LTS version:

```
nvm install 20
nvm use 20
```

Atau download dari: https://nodejs.org/ (pilih LTS version)

## Kontak Support

Jika masih ada masalah, buka issue di repository dengan informasi:
- OS Version: Windows 11/10
- Node.js version: `node --version`
- npm version: `npm --version`
- Error message lengkap
- Screenshot jika memungkinkan
