// Lynk Email Collector - Popup Script

// Storage key
const STORAGE_KEY = 'lynk_collected_emails';

// DOM elements
let emailCountEl, uniqueCountEl, emailListEl, emptyStateEl, statusEl, loadingEl;
let collectBtn, copyBtn, exportBtn, clearBtn;

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    emailCountEl = document.getElementById('emailCount');
    uniqueCountEl = document.getElementById('uniqueCount');
    emailListEl = document.getElementById('emailList');
    emptyStateEl = document.getElementById('emptyState');
    statusEl = document.getElementById('status');
    loadingEl = document.getElementById('loading');
    collectBtn = document.getElementById('collectBtn');
    copyBtn = document.getElementById('copyBtn');
    exportBtn = document.getElementById('exportBtn');
    clearBtn = document.getElementById('clearBtn');

    // Setup event listeners
    collectBtn.addEventListener('click', collectEmails);
    copyBtn.addEventListener('click', copyEmails);
    exportBtn.addEventListener('click', exportEmails);
    clearBtn.addEventListener('click', clearEmails);

    // Load existing emails
    loadEmails();
});

// Load emails from storage
function loadEmails() {
    const emails = getStoredEmails();
    updateUI(emails);
}

// Get stored emails
function getStoredEmails() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save emails to storage
function saveEmails(emails) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
}

// Update UI with emails
function updateUI(emails) {
    const uniqueEmails = [...new Set(emails)];

    emailCountEl.textContent = emails.length;
    uniqueCountEl.textContent = uniqueEmails.length;

    if (uniqueEmails.length === 0) {
        emptyStateEl.style.display = 'block';
        emailListEl.innerHTML = '';
        emailListEl.appendChild(emptyStateEl);
    } else {
        emptyStateEl.style.display = 'none';
        emailListEl.innerHTML = '';

        uniqueEmails.forEach((email, index) => {
            const emailItem = document.createElement('div');
            emailItem.className = 'email-item';
            emailItem.innerHTML = `
        <span class="email">${email}</span>
        <button class="remove-btn" data-index="${index}" title="Hapus">✕</button>
      `;
            emailListEl.appendChild(emailItem);
        });

        // Add remove handlers
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const email = e.target.parentElement.querySelector('.email').textContent;
                removeEmail(email);
            });
        });
    }
}

// Remove specific email
function removeEmail(emailToRemove) {
    let emails = getStoredEmails();
    emails = emails.filter(email => email !== emailToRemove);
    saveEmails(emails);
    updateUI(emails);
    showStatus('Email dihapus', 'success');
}

// Collect emails from current page
async function collectEmails() {
    try {
        loadingEl.classList.add('show');
        collectBtn.disabled = true;

        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Check if we're on lynk.id
        if (!tab.url.includes('lynk.id')) {
            showStatus('Buka halaman order Lynk.id terlebih dahulu!', 'error');
            return;
        }

        // Execute content script to collect emails
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractEmailsFromPage
        });

        if (results && results[0] && results[0].result) {
            const newEmails = results[0].result;

            if (newEmails.length === 0) {
                showStatus('Tidak ditemukan email di halaman ini', 'error');
            } else {
                // Add to existing emails
                let existingEmails = getStoredEmails();
                const beforeCount = [...new Set(existingEmails)].length;

                existingEmails = [...existingEmails, ...newEmails];
                const uniqueEmails = [...new Set(existingEmails)];
                const addedCount = uniqueEmails.length - beforeCount;

                saveEmails(existingEmails);
                updateUI(existingEmails);

                showStatus(`✅ Berhasil! ${newEmails.length} email ditemukan, ${addedCount} email baru ditambahkan`, 'success');
            }
        }
    } catch (error) {
        console.error('Error collecting emails:', error);
        showStatus('Gagal mengumpulkan email: ' + error.message, 'error');
    } finally {
        loadingEl.classList.remove('show');
        collectBtn.disabled = false;
    }
}

// Function to be executed in the page context
function extractEmailsFromPage() {
    const emails = [];

    // Email regex pattern
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    // Method 1: Search in entire page text
    const pageText = document.body.innerText;
    const foundInText = pageText.match(emailRegex) || [];
    emails.push(...foundInText);

    // Method 2: Search in table cells
    document.querySelectorAll('td, th').forEach(cell => {
        const cellEmails = cell.innerText.match(emailRegex) || [];
        emails.push(...cellEmails);
    });

    // Method 3: Search in specific elements that might contain email
    document.querySelectorAll('[data-email], [class*="email"], [id*="email"]').forEach(el => {
        const elEmails = el.innerText.match(emailRegex) || [];
        emails.push(...elEmails);
    });

    // Method 4: Search in anchor tags with mailto
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        const email = link.href.replace('mailto:', '').split('?')[0];
        if (email) emails.push(email);
    });

    // Method 5: Search in input fields
    document.querySelectorAll('input[type="email"], input[name*="email"]').forEach(input => {
        if (input.value && emailRegex.test(input.value)) {
            emails.push(input.value);
        }
    });

    // Filter unique and valid emails, exclude common system emails
    const excludePatterns = [
        'noreply@',
        'no-reply@',
        'admin@lynk',
        'support@lynk',
        'info@lynk',
        '@example.com',
        '@test.com'
    ];

    const uniqueEmails = [...new Set(emails)].filter(email => {
        // Check if email should be excluded
        const shouldExclude = excludePatterns.some(pattern =>
            email.toLowerCase().includes(pattern.toLowerCase())
        );
        return !shouldExclude && email.length > 5;
    });

    return uniqueEmails;
}

// Copy all emails to clipboard
async function copyEmails() {
    const emails = getStoredEmails();
    const uniqueEmails = [...new Set(emails)];

    if (uniqueEmails.length === 0) {
        showStatus('Tidak ada email untuk di-copy', 'error');
        return;
    }

    try {
        const emailText = uniqueEmails.join('\n');
        await navigator.clipboard.writeText(emailText);
        showStatus(`✅ ${uniqueEmails.length} email berhasil di-copy!`, 'success');
    } catch (error) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = uniqueEmails.join('\n');
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showStatus(`✅ ${uniqueEmails.length} email berhasil di-copy!`, 'success');
    }
}

// Export emails to CSV
function exportEmails() {
    const emails = getStoredEmails();
    const uniqueEmails = [...new Set(emails)];

    if (uniqueEmails.length === 0) {
        showStatus('Tidak ada email untuk di-export', 'error');
        return;
    }

    // Create CSV content
    let csvContent = 'Email\n';
    uniqueEmails.forEach(email => {
        csvContent += `${email}\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lynk_emails_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showStatus(`✅ ${uniqueEmails.length} email berhasil di-export!`, 'success');
}

// Clear all emails
function clearEmails() {
    if (confirm('Apakah Anda yakin ingin menghapus semua email?')) {
        saveEmails([]);
        updateUI([]);
        showStatus('Semua email telah dihapus', 'success');
    }
}

// Show status message
function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';

    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}
