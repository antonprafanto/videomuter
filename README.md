# 🎬 Video Muter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-30.0.0-blue?style=flat&logo=electron)](https://www.electronjs.org/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Bundled-green?style=flat&logo=ffmpeg)](https://ffmpeg.org/)
[![GitHub release](https://img.shields.io/github/v/release/antonprafanto/videomuter)](https://github.com/antonprafanto/videomuter/releases)
[![GitHub stars](https://img.shields.io/github/stars/antonprafanto/videomuter)](https://github.com/antonprafanto/videomuter/stargazers)

**Free & Open Source** desktop application untuk mute banyak video sekaligus dengan mudah. Dibuat dengan Electron dan FFmpeg.

## ✨ Fitur

- ✅ **Batch Processing** - Mute banyak video sekaligus
- ✅ **Drag & Drop** - Mudah drag file video langsung ke aplikasi
- ✅ **Multiple Formats** - Support MP4, AVI, MOV, MKV, FLV, WMV, WebM, M4V
- ✅ **Progress Tracking** - Real-time progress untuk setiap video
- ✅ **Custom Output** - Pilih folder output dan custom suffix nama file
- ✅ **Modern UI** - Interface modern dengan dark theme
- ✅ **Fast Processing** - Menggunakan stream copy (tidak re-encode video)

## 📋 Prasyarat

### ✨ TIDAK PERLU INSTALL FFMPEG!

**FFmpeg sudah ter-bundle langsung di dalam aplikasi!** 🎉

Aplikasi ini sudah include FFmpeg binary, jadi Anda tidak perlu install atau setting FFmpeg secara manual. Tinggal download dan langsung pakai!

### Untuk Development (Optional)

Jika Anda ingin modifikasi atau build dari source code:

1. **Install Node.js** dari: https://nodejs.org/

## 🚀 Cara Install

1. Clone atau download repository ini
2. Buka terminal di folder project
3. Install dependencies:

```bash
npm install
```

## 🎯 Cara Menggunakan

### Development Mode

Jalankan aplikasi dalam mode development:

```bash
npm start
```

### Build Executable

Build aplikasi menjadi file .exe (Windows):

```bash
npm run build
```

File executable akan ada di folder `dist/`.

## 📖 Cara Pakai Aplikasi

### Untuk User (Tanpa Coding)

1. **Download file .exe** dari folder `dist/` setelah build
2. **Jalankan aplikasi** - Double click file Video Muter.exe
3. **Tambahkan video:**
   - Drag & drop file video ke area drop zone, ATAU
   - Klik tombol "Pilih File Video"
4. **Atur output (opsional):**
   - Klik "Browse" untuk pilih folder output (default: sama dengan folder source)
   - Ubah suffix nama file (default: `_muted`)
5. **Mulai proses:**
   - Klik tombol "Mulai Mute Videos"
   - Tunggu sampai semua video selesai diproses
   - Lihat hasil summary
6. **Video hasil:**
   - Video tanpa audio akan tersimpan dengan nama: `namafile_muted.mp4`
   - Lokasi: folder yang Anda pilih, atau folder yang sama dengan video asli
7. **💬 Punya kritik atau saran?** Klik tombol untuk hubungi developer!

## 🎨 Screenshot

### Drop Zone
![Drop Zone](docs/screenshot-dropzone.png)

### Processing
![Processing](docs/screenshot-processing.png)

### Results
![Results](docs/screenshot-results.png)

## ⚙️ Teknologi

- **Electron** - Framework desktop cross-platform
- **FFmpeg** - Video processing engine
- **Node.js** - Runtime environment
- **HTML/CSS/JavaScript** - UI modern

## 📝 Technical Details

### Cara Kerja Mute Video

Aplikasi menggunakan FFmpeg dengan parameter:
```bash
ffmpeg -i input.mp4 -c:v copy -an output.mp4
```

- `-c:v copy`: Copy video stream tanpa re-encode (cepat!)
- `-an`: Remove audio stream

Ini berarti:
- ✅ **Cepat** - Tidak re-encode video
- ✅ **Kualitas sama** - Video tidak berkurang kualitasnya
- ✅ **Ukuran lebih kecil** - File output lebih kecil karena tanpa audio

## 🔧 Development

### Struktur Project

```
mute/
├── main.js                 # Electron main process
├── preload.js             # IPC bridge (security)
├── package.json           # Dependencies & config
├── renderer/
│   ├── index.html         # UI layout
│   ├── styles.css         # Styling
│   └── renderer.js        # UI logic
├── tasks/
│   └── todo.md           # Development plan
└── README.md             # Documentation
```

### Build Configuration

Edit `package.json` untuk customize build settings:

```json
"build": {
  "appId": "com.anton.videomuter",
  "productName": "Video Muter",
  "win": {
    "target": "nsis",
    "icon": "assets/icon.ico"
  }
}
```

## 🤝 Contributing

This is an **open source project** and contributions are welcome!

### How to Contribute:
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Bug Reports & Feature Requests:
- 🐛 Found a bug? [Open an issue](https://github.com/antonprafanto/videomuter/issues)
- 💡 Have an idea? [Submit a feature request](https://github.com/antonprafanto/videomuter/issues/new)

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 💬 Support & Feedback

- **Issues**: [GitHub Issues](https://github.com/antonprafanto/videomuter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/antonprafanto/videomuter/discussions)
- **Contact**: [Trakteer - limitless7](https://trakteer.id/limitless7/tip)

## ⭐ Show Your Support

If you find this project useful, please consider:
- ⭐ **Star** this repository
- 🍴 **Fork** and contribute
- 📢 **Share** with others
- 💝 **Sponsor** via [Trakteer](https://trakteer.id/limitless7/tip)

## ❗ Troubleshooting

### Video tidak mau diproses

**Solusi:**
1. Pastikan format video didukung (MP4, AVI, MOV, dll)
2. Cek apakah file video corrupt
3. Cek permission folder output
4. Lihat log error di console (Development Mode)

### Aplikasi tidak bisa dibuka

**Solusi:**
1. Jalankan dari terminal untuk lihat error: `npm start`
2. Reinstall dependencies: `npm install`
3. Update Node.js ke versi terbaru

## 📄 License

MIT License - Bebas digunakan untuk personal atau komersial.

## 👨‍💻 Author

**Anton**

## 🙏 Credits

- [Electron](https://www.electronjs.org/)
- [FFmpeg](https://ffmpeg.org/)
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

## 📧 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.

---

**Made with ❤️ for batch video processing**
