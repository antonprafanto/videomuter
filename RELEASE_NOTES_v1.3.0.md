# 🚀 Video Muter v1.3.0 - Bug Fixes & Improvements

## 🐛 Bug Fixes

### Fixed: Check for Updates Not Working
- **Problem**: "Check for Updates" button wasn't working on portable builds
- **Error**: `ENOENT: no such file or directory, open '...\resources\app-update.yml'`
- **Solution**: Replaced `electron-updater` with GitHub API-based version checking

### Fixed: Incorrect Version Display
- **Problem**: App was showing `v1.2.0` instead of correct version
- **Solution**: Now dynamically fetches version from `package.json`

## ✨ Improvements

- 🔄 **New Update System**: Uses GitHub API to check for latest releases
- 📱 **Better UX**: Shows clear update modal with version info and download link
- 🛠️ **Cleaner Code**: Removed unused auto-update code that doesn't work with portable apps

## 📋 Technical Notes

Since Video Muter is a **portable application**, automatic updates are not possible. When a new version is available:
1. Click "Check for Updates" button
2. Download the new `.exe` from GitHub Releases
3. Replace your old portable executable with the new one

## 📦 Download

Download `VideoMuter-Portable.exe` below and run it directly - no installation required!

---

**Full Changelog**: https://github.com/antonprafanto/videomuter/compare/v1.2.0...v1.3.0
