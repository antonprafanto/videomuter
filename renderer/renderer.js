// Global state
let selectedFiles = [];
let outputFolder = null;
let isProcessing = false;
let processedCount = 0;
let successCount = 0;
let errorCount = 0;

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

// Initialize app
async function init() {
  // Check if FFmpeg is available
  const ffmpegCheck = await window.electronAPI.checkFFmpeg();
  if (!ffmpegCheck.available) {
    showFFmpegWarning();
    return;
  }

  setupEventListeners();
  setupProgressListener();
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
function updateFileList() {
  fileList.innerHTML = '';
  fileCount.textContent = selectedFiles.length;

  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';

    const fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.textContent = getFileName(file);

    const filePath = document.createElement('div');
    filePath.className = 'file-path';
    filePath.textContent = file;

    fileInfo.appendChild(fileName);
    fileInfo.appendChild(filePath);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-remove';
    removeBtn.textContent = '✕ Remove';
    removeBtn.addEventListener('click', () => removeFile(index));

    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeBtn);
    fileList.appendChild(fileItem);
  });
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

  isProcessing = true;
  processedCount = 0;
  successCount = 0;
  errorCount = 0;

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

  // Process each file
  for (const file of selectedFiles) {
    try {
      const outputPath = getOutputPath(file);
      await window.electronAPI.muteVideo(file, outputPath);
      successCount++;
    } catch (error) {
      console.error('Error processing:', file, error);
      errorCount++;
    }
    processedCount++;
    updateProgressStats();
  }

  // Show results
  setTimeout(() => {
    showResults();
  }, 1000);
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
    progressItem.appendChild(errorMsg);
  }
}

// Update progress stats
function updateProgressStats() {
  progressStats.textContent = `${processedCount} / ${selectedFiles.length} completed`;
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

// Check for updates
async function checkForUpdates() {
  try {
    checkUpdateBtn.disabled = true;
    checkUpdateBtn.textContent = 'Checking...';

    const updateInfo = await window.electronAPI.checkForUpdates();

    if (updateInfo.error) {
      alert('Failed to check for updates. Please check your internet connection.');
      return;
    }

    if (updateInfo.hasUpdate) {
      // Show update available modal
      document.getElementById('updateTitle').textContent = '🎉 Update Available!';
      document.getElementById('currentVersion').textContent = `v${updateInfo.currentVersion}`;
      document.getElementById('latestVersion').textContent = `v${updateInfo.latestVersion}`;

      // Format release notes
      const releaseNotes = document.getElementById('releaseNotes');
      releaseNotes.innerHTML = `<p><strong>What's New:</strong></p><pre style="white-space: pre-wrap; color: #a0a0a0;">${updateInfo.releaseNotes || 'No release notes available.'}</pre>`;

      // Set download link
      downloadUpdateBtn.href = updateInfo.downloadUrl;

      updateModal.style.display = 'flex';
    } else {
      // No update available
      document.getElementById('updateTitle').textContent = '✅ You\'re Up to Date!';
      document.getElementById('updateContent').innerHTML = `
        <p>You are using the latest version.</p>
        <p><strong>Current version:</strong> v${updateInfo.currentVersion}</p>
      `;
      downloadUpdateBtn.style.display = 'none';
      updateModal.style.display = 'flex';
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    alert('Failed to check for updates. Please try again later.');
  } finally {
    checkUpdateBtn.disabled = false;
    checkUpdateBtn.innerHTML = `
      <svg class="update-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
      </svg>
      Check for Updates
    `;
  }
}

// Initialize app when DOM is ready
init();
