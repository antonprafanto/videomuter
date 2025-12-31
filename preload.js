const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Select video files
  selectVideos: () => ipcRenderer.invoke('select-videos'),

  // Select output folder
  selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),

  // Mute or adjust volume of a single video
  muteVideo: (inputPath, outputPath, volumePercent) => ipcRenderer.invoke('mute-video', inputPath, outputPath, volumePercent),

  // Check if FFmpeg is available
  checkFFmpeg: () => ipcRenderer.invoke('check-ffmpeg'),

  // Listen to progress updates
  onVideoProgress: (callback) => {
    ipcRenderer.on('video-progress', (event, data) => callback(data));
  },

  // Remove progress listener
  removeVideoProgressListener: () => {
    ipcRenderer.removeAllListeners('video-progress');
  },

  // Open external link
  openExternalLink: (url) => ipcRenderer.invoke('open-external-link', url),

  // Check for updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  // Pause/Resume/Cancel processing
  pauseProcessing: () => ipcRenderer.invoke('pause-processing'),
  resumeProcessing: () => ipcRenderer.invoke('resume-processing'),
  cancelProcessing: () => ipcRenderer.invoke('cancel-processing'),
  getProcessingStatus: () => ipcRenderer.invoke('get-processing-status'),
  resetProcessingStatus: () => ipcRenderer.invoke('reset-processing-status'),

  // Check disk space
  checkDiskSpace: (filePaths, outputFolder) => ipcRenderer.invoke('check-disk-space', filePaths, outputFolder),

  // Get file size
  getFileSize: (filePath) => ipcRenderer.invoke('get-file-size', filePath)
});
