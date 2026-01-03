const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const https = require('https');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

let mainWindow;
let currentFFmpegProcess = null;
let isPaused = false;
let isCancelled = false;

// GitHub repository info for update checking
const GITHUB_OWNER = 'antonprafanto';
const GITHUB_REPO = 'videomuter';

// Simple logging function
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logData = { timestamp, level, message, ...data };
  console.log(`[${level}] ${timestamp} - ${message}`, data);

  // Send to renderer for display (optional)
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('log-message', logData);
  }
}

// Check for updates via GitHub API
function checkForUpdatesViaGitHub() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      method: 'GET',
      headers: {
        'User-Agent': 'Video-Muter-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const release = JSON.parse(data);
            resolve({
              success: true,
              latestVersion: release.tag_name.replace(/^v/, ''),
              currentVersion: app.getVersion(),
              releaseUrl: release.html_url,
              downloadUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
              releaseNotes: release.body || '',
              publishedAt: release.published_at
            });
          } else if (res.statusCode === 404) {
            resolve({
              success: false,
              error: 'No releases found'
            });
          } else {
            resolve({
              success: false,
              error: `GitHub API returned status ${res.statusCode}`
            });
          }
        } catch (parseError) {
          reject(new Error('Failed to parse GitHub response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Compare semantic versions
function isNewerVersion(latestVersion, currentVersion) {
  const latest = latestVersion.split('.').map(Number);
  const current = currentVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(latest.length, current.length); i++) {
    const l = latest[i] || 0;
    const c = current[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'mute.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Video Muter - Batch Mute Videos',
    backgroundColor: '#1a1a1a',
    autoHideMenuBar: true,
  });

  mainWindow.loadFile('renderer/index.html');
}

app.whenReady().then(() => {
  // Set FFmpeg binary path to bundled version
  try {
    const ffmpegStatic = require('ffmpeg-static');
    const ffmpegPath = ffmpegStatic.replace('app.asar', 'app.asar.unpacked');
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log('FFmpeg path set to:', ffmpegPath);
  } catch (error) {
    console.error('Error setting FFmpeg path:', error);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle file selection dialog
ipcMain.handle('select-videos', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'm4v'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

// Handle output folder selection
ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

// Get file size
ipcMain.handle('get-file-size', async (_event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        success: true,
        size: stats.size
      };
    }
    return {
      success: false,
      error: 'File not found'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Check disk space
ipcMain.handle('check-disk-space', async (_event, filePaths, outputFolder) => {
  try {
    const checkDiskSpace = require('check-disk-space').default;

    // Calculate total size of input files
    let totalInputSize = 0;
    for (const filePath of filePaths) {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        totalInputSize += stats.size;
      }
    }

    // Estimate output size (similar to input since we're copying video stream)
    // Add 10% buffer for safety
    const estimatedOutputSize = totalInputSize * 1.1;

    // Determine which drive to check
    let drivePath;
    if (outputFolder) {
      drivePath = outputFolder;
    } else {
      // Use first file's drive
      drivePath = filePaths[0];
    }

    // Get disk info (Windows-compatible)
    const drive = path.parse(drivePath).root || drivePath.substring(0, 3);
    const diskInfo = await checkDiskSpace(drive);

    return {
      success: true,
      available: diskInfo.free,
      required: estimatedOutputSize,
      hasEnoughSpace: diskInfo.free > estimatedOutputSize,
      drive: drive
    };
  } catch (error) {
    console.error('Error checking disk space:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handle muting/adjusting volume single video
ipcMain.handle('mute-video', async (event, inputPath, outputPath, volumePercent = 0) => {
  return new Promise((resolve, reject) => {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      reject(new Error(`Input file not found: ${inputPath}`));
      return;
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const command = ffmpeg(inputPath);

    // Apply volume adjustment
    if (volumePercent === 0) {
      // Mute: remove audio
      command.outputOptions([
        '-c:v copy',  // Copy video stream without re-encoding
        '-an'         // Remove audio stream
      ]);
    } else {
      // Adjust volume
      const volumeFilter = volumePercent / 100;
      command.outputOptions([
        '-c:v copy',  // Copy video stream without re-encoding
        `-af volume=${volumeFilter}`  // Adjust audio volume
      ]);
    }

    command.output(outputPath)
      .on('start', (commandLine) => {
        log('INFO', 'Started processing', { file: path.basename(inputPath), volume: volumePercent });
        console.log('FFmpeg command:', commandLine);
        event.sender.send('video-progress', {
          file: path.basename(inputPath),
          status: 'processing'
        });
      })
      .on('progress', (progress) => {
        event.sender.send('video-progress', {
          file: path.basename(inputPath),
          percent: progress.percent || 0,
          status: 'processing'
        });
      })
      .on('end', () => {
        log('SUCCESS', 'Completed processing', { file: path.basename(inputPath) });
        currentFFmpegProcess = null;
        event.sender.send('video-progress', {
          file: path.basename(inputPath),
          percent: 100,
          status: 'completed'
        });
        resolve({
          success: true,
          inputPath,
          outputPath
        });
      })
      .on('error', (err) => {
        log('ERROR', 'Failed processing', { file: path.basename(inputPath), error: err.message });
        currentFFmpegProcess = null;

        // Provide more helpful error messages
        let errorMessage = err.message;
        if (err.message.includes('ENOENT')) {
          errorMessage = 'File tidak ditemukan atau tidak dapat diakses.';
        } else if (err.message.includes('ENOSPC')) {
          errorMessage = 'Disk space tidak cukup untuk menyimpan output file.';
        } else if (err.message.includes('EACCES') || err.message.includes('EPERM')) {
          errorMessage = 'Tidak ada izin untuk mengakses file. Pastikan file tidak sedang digunakan aplikasi lain.';
        } else if (err.message.includes('Invalid data found')) {
          errorMessage = 'File video rusak atau format tidak didukung.';
        } else if (err.message.includes('already exists')) {
          errorMessage = 'Output file sudah ada. Hapus file lama atau ubah nama output.';
        }

        event.sender.send('video-progress', {
          file: path.basename(inputPath),
          status: 'error',
          error: errorMessage,
          detailedError: err.message
        });
        reject(new Error(errorMessage));
      });

    // Store current process for pause/resume/cancel
    currentFFmpegProcess = command;
    command.run();
  });
});

// Pause current video processing (NOT SUPPORTED by FFmpeg)
ipcMain.handle('pause-processing', async () => {
  // Note: FFmpeg doesn't support true pause/resume
  // This would require stopping and restarting from a checkpoint
  // which is complex and not well-supported by fluent-ffmpeg
  isPaused = true;
  return { success: true, paused: true, message: 'Processing will pause after current video completes' };
});

// Resume current video processing
ipcMain.handle('resume-processing', async () => {
  isPaused = false;
  return { success: true, paused: false };
});

// Cancel current video processing
ipcMain.handle('cancel-processing', async () => {
  isCancelled = true;
  if (currentFFmpegProcess) {
    try {
      currentFFmpegProcess.kill();
      currentFFmpegProcess = null;
    } catch (error) {
      console.error('Error killing process:', error);
    }
  }
  return { success: true, cancelled: true };
});

// Get pause/cancel status
ipcMain.handle('get-processing-status', async () => {
  return {
    isPaused,
    isCancelled
  };
});

// Reset processing status
ipcMain.handle('reset-processing-status', async () => {
  isPaused = false;
  isCancelled = false;
  currentFFmpegProcess = null;
  return { success: true };
});

// Check if FFmpeg is available
ipcMain.handle('check-ffmpeg', async () => {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        resolve({
          available: false,
          error: 'FFmpeg not found. Please install FFmpeg and add it to your system PATH.'
        });
      } else {
        resolve({ available: true });
      }
    });
  });
});

// Open external link (for donation button)
ipcMain.handle('open-external-link', async (_event, url) => {
  await shell.openExternal(url);
});

// Manual check for updates via GitHub API (triggered by user button)
ipcMain.handle('check-for-updates', async () => {
  try {
    log('INFO', 'Checking for updates via GitHub API...');
    const result = await checkForUpdatesViaGitHub();

    if (result.success) {
      const hasUpdate = isNewerVersion(result.latestVersion, result.currentVersion);

      if (hasUpdate) {
        log('INFO', 'Update available', {
          currentVersion: result.currentVersion,
          latestVersion: result.latestVersion
        });
      } else {
        log('INFO', 'Already on latest version', {
          currentVersion: result.currentVersion
        });
      }

      return {
        success: true,
        hasUpdate,
        currentVersion: result.currentVersion,
        latestVersion: result.latestVersion,
        downloadUrl: result.downloadUrl,
        releaseNotes: result.releaseNotes
      };
    } else {
      return {
        success: false,
        error: result.error,
        currentVersion: app.getVersion()
      };
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    return {
      success: false,
      error: error.message,
      currentVersion: app.getVersion()
    };
  }
});

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
