# Changelog

All notable changes to Video Muter will be documented in this file.

## [1.2.0] - 2025-12-31

### Added - Medium Priority Features ⭐

#### 1. ⚡ Parallel Processing
- Process 2-4 videos simultaneously for 2-4x faster speed
- Configurable concurrency level (1, 2, 3, or 4 videos at once)
- Balanced default: 2 videos for optimal speed/CPU usage
- Smart queue management

#### 2. 🌓 Dark/Light Mode Toggle
- Beautiful light mode for daytime use
- Smooth transition animations
- Saves preference in localStorage
- Toggle button in header (🌙/☀️)

#### 3. 🔊 Volume Adjustment (Not Just Mute!)
- Slider from 0% to 200%
- 0% = Mute (remove audio)
- 100% = Keep original volume
- 200% = Boost volume 2x
- Any value in between for custom adjustment
- Auto-updates file suffix based on volume

#### 4. 🔄 Auto-Retry Failed Videos
- Automatically retries failed videos up to 2 times
- Total 3 attempts per video
- 1 second delay between retries
- Significantly improves success rate

#### 5. 📝 Logging System
- Console logging for all operations
- Tracks start, progress, success, and errors
- Helpful for debugging and support
- Timestamps on all log entries

### Technical Improvements
- Enhanced error handling with retry logic
- CSS variables for theming support
- Improved performance with concurrent processing
- Better user feedback with volume slider

## [1.1.0] - 2025-12-31

### Added - High Priority Features ✨

#### 1. Pause/Resume/Cancel Controls
- ⏸️ **Pause button**: Pause processing after current video completes
- ▶️ **Resume button**: Continue paused processing
- ❌ **Cancel button**: Stop all processing with confirmation dialog
- Note: FFmpeg doesn't support mid-video pause, so pause occurs between videos

#### 2. Disk Space Check
- 💾 Automatically checks available disk space before starting
- Calculates required space (input size + 10% buffer)
- Shows alert if space is insufficient with detailed info (drive, available, required)

#### 3. Estimated Time Remaining (ETA)
- ⏱️ Real-time ETA display in format "X minutes Y seconds"
- Calculates based on average processing time per file
- Updates dynamically as files are processed

#### 4. Better Error Messages
- ❌ User-friendly error messages in Indonesian
- Specific messages for common errors:
  - File not found / access denied
  - Disk space insufficient
  - Permission errors
  - Corrupted video files
  - File already exists
- Detailed technical error in tooltip on hover

#### 5. File Size Information
- 📊 Shows file size in MB next to each file in the list
- Helps estimate processing time and disk space needed

#### 6. Desktop Notifications
- 🔔 Windows notification when processing completes
- Shows count of successful and failed videos
- Automatically requests notification permission on first run

#### 7. Recent Files History
- 📁 Remembers last 10 processed files
- Shows 3 most recent files in drop zone
- Uses browser localStorage for persistence

#### 8. Keyboard Shortcuts
- ⌨️ **Ctrl+O**: Open file selection dialog
- ⌨️ **Ctrl+Enter**: Start processing
- ⌨️ **Space**: Pause/Resume processing
- ⌨️ **Esc**: Cancel processing
- ⌨️ **Delete**: Clear file list
- Shortcuts displayed in UI for easy reference

### Technical Changes
- Added `check-disk-space` package for cross-platform disk space checking
- Implemented processing state management (pause/cancel/resume)
- Added IPC handlers for new features
- Improved error handling with localized messages
- Enhanced UI with control buttons and shortcuts

### Known Limitations
- Pause/Resume works between videos, not during individual video processing
- This is a limitation of FFmpeg which doesn't support mid-stream pause

## [1.0.0] - 2025-12-31

### Initial Release
- Basic video muting functionality using FFmpeg
- Batch processing multiple videos
- Drag & drop interface
- Custom output folder selection
- Progress tracking
- Auto-update checker from GitHub releases
- Open source (MIT License)
- Windows portable executable
