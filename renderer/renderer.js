// Global state
let selectedFiles = [];
let outputFolder = null;
let isProcessing = false;
let processedCount = 0;
let successCount = 0;
let errorCount = 0;
let processingStartTime = 0;
let currentFileStartTime = 0;
let concurrentLimit = 2; // Default parallel processing

// DOM elements
const dropZone = document.getElementById('dropZone');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const fileListSection = document.getElementById('fileListSection');
const fileList = document.getElementById('fileList');
const fileCount = document.getElementById('fileCount');
const clearFilesBtn = document.getElementById('clearFilesBtn');
const outputSettings = document.getElementById('outputSettings');
const outputFolderInput = document.getElementById('outputFolderInput');
const selectOutputBtn = document.getElementById('selectOutputBtn');
const suffixInput = document.getElementById('suffixInput');
const concurrentInput = document.getElementById('concurrentInput');
const actionButtons = document.getElementById('actionButtons');
const startBtn = document.getElementById('startBtn');
const progressSection = document.getElementById('progressSection');
const progressList = document.getElementById('progressList');
const progressStats = document.getElementById('progressStats');
const resultsSection = document.getElementById('resultsSection');
const resultsSummary = document.getElementById('resultsSummary');
const processMoreBtn = document.getElementById('processMoreBtn');
const ffmpegWarning = document.getElementById('ffmpegWarning');
const closeWarning = document.getElementById('closeWarning');
const donateBtn = document.getElementById('donateBtn');
const checkUpdateBtn = document.getElementById('checkUpdateBtn');
const updateModal = document.getElementById('updateModal');
const closeUpdateModal = document.getElementById('closeUpdateModal');
const downloadUpdateBtn = document.getElementById('downloadUpdateBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');

// Initialize app
async function init() {
  // Check if FFmpeg is available
  const ffmpegCheck = await window.electronAPI.checkFFmpeg();
  if (!ffmpegCheck.available) {
    showFFmpegWarning();
    return;
  }

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  // Load theme preference
  loadTheme();

  // Load recent files
  loadRecentFiles();

  // Initialize version display
  initVersion();

  setupEventListeners();
  setupProgressListener();
}

// Initialize version display from main process
async function initVersion() {
  try {
    const version = await window.electronAPI.getAppVersion();
    const appVersionEl = document.getElementById('appVersion');
    if (appVersionEl) {
      appVersionEl.textContent = `v${version}`;
    }
  } catch (error) {
    console.error('Failed to get app version:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Select files button
  selectFilesBtn.addEventListener('click', handleSelectFiles);

  // Drag and drop
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);

  // Clear files
  clearFilesBtn.addEventListener('click', clearFiles);

  // Select output folder
  selectOutputBtn.addEventListener('click', handleSelectOutputFolder);

  // Start processing
  startBtn.addEventListener('click', startProcessing);

  // Process more
  processMoreBtn.addEventListener('click', resetApp);

  // Close warning
  closeWarning.addEventListener('click', () => {
    ffmpegWarning.style.display = 'none';
  });

  // Donate button
  donateBtn.addEventListener('click', () => {
    window.electronAPI.openExternalLink('https://trakteer.id/limitless7/tip');
  });

  // Check for updates button
  checkUpdateBtn.addEventListener('click', checkForUpdates);

  // Close update modal
  closeUpdateModal.addEventListener('click', () => {
    updateModal.style.display = 'none';
  });

  // Pause processing
  pauseBtn.addEventListener('click', handlePause);

  // Resume processing
  resumeBtn.addEventListener('click', handleResume);

  // Cancel processing
  cancelBtn.addEventListener('click', handleCancel);

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Volume slider
  volumeSlider.addEventListener('input', updateVolumeDisplay);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Update volume display
function updateVolumeDisplay() {
  const volume = parseInt(volumeSlider.value);
  let label = '';

  if (volume === 0) {
    label = 'Mute (0%)';
    suffixInput.value = '_muted';
  } else if (volume === 100) {
    label = 'Original (100%)';
    suffixInput.value = '_original';
  } else if (volume < 100) {
    label = `Reduce (${volume}%)`;
    suffixInput.value = `_${volume}pct`;
  } else {
    label = `Boost (${volume}%)`;
    suffixInput.value = `_boost${volume}pct`;
  }

  volumeValue.textContent = label;
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
  // Ctrl+O: Open files
  if (e.ctrlKey && e.key === 'o') {
    e.preventDefault();
    handleSelectFiles();
  }

  // Ctrl+Enter: Start processing
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    if (!isProcessing && selectedFiles.length > 0) {
      startProcessing();
    }
  }

  // Space: Pause/Resume
  if (e.key === ' ' && isProcessing) {
    e.preventDefault();
    if (pauseBtn.style.display !== 'none') {
      handlePause();
    } else {
      handleResume();
    }
  }

  // Escape: Cancel
  if (e.key === 'Escape' && isProcessing) {
    e.preventDefault();
    handleCancel();
  }

  // Delete: Clear files
  if (e.key === 'Delete' && !isProcessing && selectedFiles.length > 0) {
    e.preventDefault();
    clearFiles();
  }
}

// Setup progress listener
function setupProgressListener() {
  window.electronAPI.onVideoProgress((data) => {
    updateProgress(data);
  });
}

// Handle file selection
async function handleSelectFiles() {
  const files = await window.electronAPI.selectVideos();
  if (files.length > 0) {
    addFiles(files);
  }
}

// Handle drag over
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
}

// Handle drop
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');

  const files = [];
  if (e.dataTransfer.items) {
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      if (e.dataTransfer.items[i].kind === 'file') {
        const file = e.dataTransfer.items[i].getAsFile();
        files.push(file.path);
      }
    }
  } else {
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      files.push(e.dataTransfer.files[i].path);
    }
  }

  if (files.length > 0) {
    addFiles(files);
  }
}

// Add files to list
function addFiles(files) {
  // Filter video files
  const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm', '.m4v'];
  const videoFiles = files.filter(file => {
    const ext = file.toLowerCase().substring(file.lastIndexOf('.'));
    return videoExtensions.includes(ext);
  });

  // Add to selected files (avoid duplicates)
  videoFiles.forEach(file => {
    if (!selectedFiles.includes(file)) {
      selectedFiles.push(file);
    }
  });

  updateFileList();
  showSections();
}

// Update file list display
async function updateFileList() {
  fileList.innerHTML = '';
  fileCount.textContent = selectedFiles.length;

  for (let index = 0; index < selectedFiles.length; index++) {
    const file = selectedFiles[index];
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';

    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = getFileName(file);

    const filePath = document.createElement('div');
    filePath.className = 'file-path';

    // Get file size
    const sizeInfo = await window.electronAPI.getFileSize(file);
    let sizeText = '';
    if (sizeInfo.success) {
      const sizeMB = (sizeInfo.size / (1024 * 1024)).toFixed(2);
      sizeText = ` • ${sizeMB} MB`;
    }

    filePath.textContent = file + sizeText;

    fileInfo.appendChild(fileName);
    fileInfo.appendChild(filePath);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove';
    removeBtn.textContent = '✕ Remove';
    removeBtn.addEventListener('click', () => removeFile(index));

    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeBtn);
    fileList.appendChild(fileItem);
  }
}

// Remove file from list
function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateFileList();

  if (selectedFiles.length === 0) {
    hideSections();
  }
}

// Clear all files
function clearFiles() {
  selectedFiles = [];
  updateFileList();
  hideSections();
}

// Show sections when files are added
function showSections() {
  fileListSection.style.display = 'block';
  outputSettings.style.display = 'block';
  actionButtons.style.display = 'block';
}

// Hide sections when no files
function hideSections() {
  fileListSection.style.display = 'none';
  outputSettings.style.display = 'none';
  actionButtons.style.display = 'none';
}

// Handle output folder selection
async function handleSelectOutputFolder() {
  const folder = await window.electronAPI.selectOutputFolder();
  if (folder) {
    outputFolder = folder;
    outputFolderInput.value = folder;
  }
}

// Start processing videos
async function startProcessing() {
  if (isProcessing || selectedFiles.length === 0) return;

  // Check disk space first
  const diskCheck = await window.electronAPI.checkDiskSpace(selectedFiles, outputFolder);
  if (diskCheck.success && !diskCheck.hasEnoughSpace) {
    const availableGB = (diskCheck.available / (1024 * 1024 * 1024)).toFixed(2);
    const requiredGB = (diskCheck.required / (1024 * 1024 * 1024)).toFixed(2);
    alert(`Disk space tidak cukup!\n\nDrive: ${diskCheck.drive}\nTersedia: ${availableGB} GB\nDibutuhkan: ${requiredGB} GB\n\nSilakan kosongkan disk space atau pilih output folder yang berbeda.`);
    return;
  }

  // Reset processing status
  await window.electronAPI.resetProcessingStatus();

  // Get concurrent limit from settings
  concurrentLimit = parseInt(concurrentInput.value) || 2;

  isProcessing = true;
  processedCount = 0;
  successCount = 0;
  errorCount = 0;
  processingStartTime = Date.now();

  // Hide other sections
  dropZone.style.display = 'none';
  fileListSection.style.display = 'none';
  outputSettings.style.display = 'none';
  actionButtons.style.display = 'none';
  resultsSection.style.display = 'none';

  // Show progress section
  progressSection.style.display = 'block';
  progressList.innerHTML = '';

  // Create progress items for each file
  selectedFiles.forEach(file => {
    createProgressItem(file);
  });

  // Process files with concurrency limit
  const queue = [...selectedFiles];
  const activeProcesses = [];

  while (queue.length > 0 || activeProcesses.length > 0) {
    // Check if cancelled
    let status = await window.electronAPI.getProcessingStatus();
    if (status.isCancelled) {
      console.log('Processing cancelled by user');
      break;
    }

    // Wait while paused
    while (status.isPaused) {
      await new Promise(resolve => setTimeout(resolve, 500));
      status = await window.electronAPI.getProcessingStatus();
      if (status.isCancelled) break;
    }

    if (status.isCancelled) break;

    // Start new processes up to concurrent limit
    while (queue.length > 0 && activeProcesses.length < concurrentLimit) {
      const file = queue.shift();
      const processPromise = processFile(file).then(() => {
        // Remove from active processes when done
        const index = activeProcesses.indexOf(processPromise);
        if (index > -1) activeProcesses.splice(index, 1);
      });
      activeProcesses.push(processPromise);
    }

    // Wait for at least one process to complete
    if (activeProcesses.length > 0) {
      await Promise.race(activeProcesses);
    }
  }

  // Show results
  setTimeout(() => {
    showResults();
  }, 1000);
}

// Process single file with retry
async function processFile(file, retryCount = 0) {
  const maxRetries = 2; // Max 2 retries (total 3 attempts)

  try {
    const outputPath = getOutputPath(file);
    const volume = parseInt(volumeSlider.value);
    await window.electronAPI.muteVideo(file, outputPath, volume);
    successCount++;
  } catch (error) {
    console.error(`Error processing (attempt ${retryCount + 1}/${maxRetries + 1}):`, file, error);

    // Retry if attempts remaining
    if (retryCount < maxRetries) {
      console.log(`Retrying ${file}...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      return processFile(file, retryCount + 1); // Recursive retry
    }

    // Max retries reached
    errorCount++;
  }
  processedCount++;
  updateProgressStats();
}

// Create progress item
function createProgressItem(file) {
  const fileName = getFileName(file);

  const progressItem = document.createElement('div');
  progressItem.className = 'progress-item';
  progressItem.id = `progress-${fileName}`;

  const header = document.createElement('div');
  header.className = 'progress-item-header';

  const fileNameEl = document.createElement('div');
  fileNameEl.className = 'progress-file-name';
  fileNameEl.textContent = fileName;

  const status = document.createElement('div');
  status.className = 'progress-status';
  status.textContent = 'Waiting...';

  header.appendChild(fileNameEl);
  header.appendChild(status);

  const barContainer = document.createElement('div');
  barContainer.className = 'progress-bar-container';

  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.style.width = '0%';

  barContainer.appendChild(bar);

  progressItem.appendChild(header);
  progressItem.appendChild(barContainer);

  progressList.appendChild(progressItem);
}

// Update progress
function updateProgress(data) {
  const progressItem = document.getElementById(`progress-${data.file}`);
  if (!progressItem) return;

  const status = progressItem.querySelector('.progress-status');
  const bar = progressItem.querySelector('.progress-bar');

  if (data.status === 'processing') {
    status.className = 'progress-status processing';
    status.textContent = `${Math.round(data.percent || 0)}%`;
    bar.style.width = `${data.percent || 0}%`;
  } else if (data.status === 'completed') {
    status.className = 'progress-status completed';
    status.textContent = '✓ Completed';
    bar.className = 'progress-bar completed';
    bar.style.width = '100%';
  } else if (data.status === 'error') {
    status.className = 'progress-status error';
    status.textContent = '✗ Error';

    const errorMsg = document.createElement('div');
    errorMsg.className = 'progress-error';
    errorMsg.textContent = data.error || 'Unknown error';

    // Add detailed error tooltip if available
    if (data.detailedError && data.detailedError !== data.error) {
      errorMsg.title = `Detail: ${data.detailedError}`;
      errorMsg.style.cursor = 'help';
    }

    progressItem.appendChild(errorMsg);
  }
}

// Update progress stats
function updateProgressStats() {
  const elapsed = Date.now() - processingStartTime;
  const avgTimePerFile = elapsed / Math.max(processedCount, 1);
  const remainingFiles = selectedFiles.length - processedCount;
  const estimatedTimeLeft = avgTimePerFile * remainingFiles;

  let etaText = '';
  if (remainingFiles > 0 && processedCount > 0) {
    const minutes = Math.floor(estimatedTimeLeft / 60000);
    const seconds = Math.floor((estimatedTimeLeft % 60000) / 1000);
    etaText = ` • ETA: ${minutes}m ${seconds}s`;
  }

  progressStats.textContent = `${processedCount} / ${selectedFiles.length} completed${etaText}`;
}

// Show results
function showResults() {
  progressSection.style.display = 'none';
  resultsSection.style.display = 'block';

  resultsSummary.innerHTML = `
    <p>Total videos processed: <strong>${selectedFiles.length}</strong></p>
    <p class="success-count">✓ Success: ${successCount}</p>
    ${errorCount > 0 ? `<p class="error-count">✗ Failed: ${errorCount}</p>` : ''}
    <p style="margin-top: 20px; color: #a0a0a0;">Videos saved ${outputFolder ? `to: ${outputFolder}` : 'to source folders'}</p>
  `;

  isProcessing = false;

  // Save recent files
  saveRecentFiles(selectedFiles);

  // Show desktop notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Video Muter - Proses Selesai!', {
      body: `${successCount} video berhasil dimute${errorCount > 0 ? `, ${errorCount} gagal` : ''}`,
      icon: 'mute.png'
    });
  }
}

// Reset app for new batch
function resetApp() {
  selectedFiles = [];
  outputFolder = null;
  outputFolderInput.value = '';

  dropZone.style.display = 'block';
  resultsSection.style.display = 'none';

  clearFiles();
}

// Show FFmpeg warning
function showFFmpegWarning() {
  ffmpegWarning.style.display = 'flex';
  dropZone.style.display = 'none';
}

// Get file name from path
function getFileName(filePath) {
  return filePath.split(/[\\/]/).pop();
}

// Get output path for file
function getOutputPath(inputPath) {
  const suffix = suffixInput.value || '_muted';
  const fileName = getFileName(inputPath);
  const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  const ext = fileName.substring(fileName.lastIndexOf('.'));
  const newFileName = `${fileNameWithoutExt}${suffix}${ext}`;

  if (outputFolder) {
    // Use backslash for Windows paths
    return `${outputFolder}\\${newFileName}`;
  } else {
    // Save in same directory as source
    const lastSlash = Math.max(inputPath.lastIndexOf('\\'), inputPath.lastIndexOf('/'));
    const dirPath = inputPath.substring(0, lastSlash);
    return `${dirPath}\\${newFileName}`;
  }
}

// Manual check for updates via GitHub API
async function checkForUpdates() {
  try {
    checkUpdateBtn.disabled = true;
    checkUpdateBtn.textContent = 'Checking...';

    const result = await window.electronAPI.checkForUpdates();

    if (result.success) {
      if (result.hasUpdate) {
        // Update available - show download modal
        document.getElementById('updateTitle').textContent = '🎉 Update Available!';
        document.getElementById('updateContent').innerHTML = `
          <p>A new version is available!</p>
          <p><strong>Current version:</strong> v${result.currentVersion}</p>
          <p><strong>Latest version:</strong> v${result.latestVersion}</p>
          ${result.releaseNotes ? `
          <div style="margin: 20px 0; text-align: left; max-height: 150px; overflow-y: auto; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
            <small style="white-space: pre-wrap;">${result.releaseNotes.substring(0, 500)}${result.releaseNotes.length > 500 ? '...' : ''}</small>
          </div>
          ` : ''}
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 15px;">
            Download the new version and replace your current portable executable.
          </p>
        `;
        downloadUpdateBtn.style.display = 'inline-block';
        downloadUpdateBtn.textContent = '⬇️ Download Update';
        downloadUpdateBtn.href = result.downloadUrl;
        downloadUpdateBtn.onclick = (e) => {
          e.preventDefault();
          window.electronAPI.openExternalLink(result.downloadUrl);
        };
      } else {
        // Already up to date
        document.getElementById('updateTitle').textContent = '✅ You\'re Up to Date!';
        document.getElementById('updateContent').innerHTML = `
          <p>You are using the latest version.</p>
          <p><strong>Current version:</strong> v${result.currentVersion}</p>
        `;
        downloadUpdateBtn.style.display = 'none';
      }
      updateModal.style.display = 'flex';
    } else {
      // Error checking
      document.getElementById('updateTitle').textContent = '❌ Check Failed';
      document.getElementById('updateContent').innerHTML = `
        <p>Could not check for updates.</p>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">Error: ${result.error}</p>
        <p>Please check your internet connection or try again later.</p>
      `;
      downloadUpdateBtn.style.display = 'inline-block';
      downloadUpdateBtn.textContent = '🌐 Open GitHub Releases';
      downloadUpdateBtn.onclick = (e) => {
        e.preventDefault();
        window.electronAPI.openExternalLink('https://github.com/antonprafanto/videomuter/releases/latest');
      };
      updateModal.style.display = 'flex';
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    document.getElementById('updateTitle').textContent = '❌ Check Failed';
    document.getElementById('updateContent').innerHTML = `
      <p>An unexpected error occurred.</p>
      <p style="font-size: 0.9rem; color: var(--text-secondary);">Error: ${error.message}</p>
    `;
    downloadUpdateBtn.style.display = 'inline-block';
    downloadUpdateBtn.textContent = '🌐 Open GitHub Releases';
    downloadUpdateBtn.onclick = (e) => {
      e.preventDefault();
      window.electronAPI.openExternalLink('https://github.com/antonprafanto/videomuter/releases/latest');
    };
    updateModal.style.display = 'flex';
  } finally {
    setTimeout(() => {
      checkUpdateBtn.disabled = false;
      checkUpdateBtn.innerHTML = `
        <svg class="update-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        Check for Updates
      `;
    }, 1000);
  }
}

// Handle pause
async function handlePause() {
  const result = await window.electronAPI.pauseProcessing();
  if (result.success) {
    pauseBtn.style.display = 'none';
    resumeBtn.style.display = 'block';
  } else {
    console.error('Failed to pause:', result.error);
  }
}

// Handle resume
async function handleResume() {
  const result = await window.electronAPI.resumeProcessing();
  if (result.success) {
    pauseBtn.style.display = 'block';
    resumeBtn.style.display = 'none';
  } else {
    console.error('Failed to resume:', result.error);
  }
}

// Handle cancel
async function handleCancel() {
  const confirmed = confirm('Apakah Anda yakin ingin membatalkan semua proses?');
  if (!confirmed) return;

  const result = await window.electronAPI.cancelProcessing();
  if (result.success) {
    // Reset UI
    isProcessing = false;
    progressSection.style.display = 'none';
    dropZone.style.display = 'block';
    fileListSection.style.display = 'block';
    outputSettings.style.display = 'block';
    actionButtons.style.display = 'block';

    // Reset buttons
    pauseBtn.style.display = 'block';
    resumeBtn.style.display = 'none';
  } else {
    console.error('Failed to cancel:', result.error);
  }
}

// Recent files management
function saveRecentFiles(files) {
  try {
    let recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]');

    // Add new files to the beginning
    files.forEach(file => {
      // Remove if already exists
      recentFiles = recentFiles.filter(f => f !== file);
      // Add to beginning
      recentFiles.unshift(file);
    });

    // Keep only last 10 files
    recentFiles = recentFiles.slice(0, 10);

    localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
  } catch (error) {
    console.error('Error saving recent files:', error);
  }
}

function loadRecentFiles() {
  try {
    const recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    if (recentFiles.length > 0) {
      // Show recent files hint in drop zone
      const dropZone = document.getElementById('dropZone');
      const recentHint = document.createElement('p');
      recentHint.className = 'drop-hint';
      recentHint.style.marginTop = '20px';
      recentHint.style.fontSize = '0.85rem';
      recentHint.innerHTML = `<strong>Recent:</strong> ${recentFiles.slice(0, 3).map(f => getFileName(f)).join(', ')}${recentFiles.length > 3 ? '...' : ''}`;
      dropZone.appendChild(recentHint);
    }
  } catch (error) {
    console.error('Error loading recent files:', error);
  }
}

// Theme management
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeIcon.textContent = '☀️';
  } else {
    document.body.classList.remove('light-mode');
    themeIcon.textContent = '🌙';
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  themeIcon.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Initialize app when DOM is ready
init();
