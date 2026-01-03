# 🚀 Video Muter v1.3.1 - Auto-Download Update Feature

## ✨ New Features

### Auto-Download Updates
- Klik "Check for Updates" → Jika ada update, klik "Download & Install"
- **Progress bar** menunjukkan status download secara real-time
- File `.exe` terdownload langsung ke folder **Downloads**
- Folder Downloads **terbuka otomatis** setelah selesai
- User tinggal jalankan file baru - tidak perlu ke GitHub lagi!

## 🔧 Technical Improvements

- Added GitHub release asset parsing untuk mendapatkan direct download URL
- Implemented download with redirect handling (GitHub menggunakan CDN)
- Added progress reporting dari main process ke renderer
- 5 minute timeout untuk download file besar

## 📋 How It Works

1. Klik **"Check for Updates"**
2. Jika ada update, modal muncul dengan tombol **"⬇️ Download & Install"**
3. Progress bar menunjukkan: `Downloading: X MB / Y MB (Z%)`
4. Setelah selesai, folder Downloads terbuka dengan file baru
5. Tutup aplikasi lama, jalankan file baru!

## 📦 Download

Download `VideoMuter-Portable.exe` below and run it directly - no installation required!

---

**Full Changelog**: https://github.com/antonprafanto/videomuter/compare/v1.3.0...v1.3.1
