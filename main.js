const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

let mainWindow;
let currentFFmpegProcess = null;
let isPaused = false;
let isCancelled = false;

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

  // Uncomment untuk debug
  // mainWindow.webContents.openDevTools();
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

// Handle muting single video
ipcMain.handle('mute-video', async (event, inputPath, outputPath) => {
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

    const command = ffmpeg(inputPath)
      .outputOptions([
        '-c:v copy',  // Copy video stream without re-encoding
        '-an'         // Remove audio stream
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
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
        console.log('Finished processing:', path.basename(inputPath));
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
        console.error('Error processing:', path.basename(inputPath), err);
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

// Check for updates from GitHub releases
ipcMain.handle('check-for-updates', async () => {
  try {
    const { net } = require('electron');
    const currentVersion = app.getVersion();

    const request = net.request({
      method: 'GET',
      url: 'https://api.github.com/repos/antonprafanto/videomuter/releases/latest'
    });

    return new Promise((resolve, reject) => {
      request.on('response', (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const release = JSON.parse(data);
            const latestVersion = release.tag_name.replace('v', '');
            const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

            resolve({
              hasUpdate,
              currentVersion,
              latestVersion,
              downloadUrl: release.html_url,
              releaseNotes: release.body
            });
          } catch (error) {
            reject(error);
          }
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.end();
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    return {
      hasUpdate: false,
      error: error.message
    };
  }
});

// Compare version numbers (semver)
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}
