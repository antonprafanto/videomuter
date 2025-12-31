const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Select video files
  selectVideos: () => ipcRenderer.invoke('select-videos'),

  // Select output folder
  selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),

  // Mute a single video
  muteVideo: (inputPath, outputPath) => ipcRenderer.invoke('mute-video', inputPath, outputPath),

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
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates')
});
