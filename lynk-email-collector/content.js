// Lynk Email Collector - Content Script
// This script runs on lynk.id/admin/orders/* pages

(function () {
    'use strict';

    // Add floating button to easily trigger collection
    function addFloatingButton() {
        // Check if button already exists
        if (document.getElementById('lynk-email-collector-btn')) return;

        const button = document.createElement('button');
        button.id = 'lynk-email-collector-btn';
        button.innerHTML = '📧';
        button.title = 'Klik untuk mengumpulkan email dari halaman ini (Lynk Email Collector)';
        button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      z-index: 999999;
      transition: all 0.3s ease;
    `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        });

        button.addEventListener('click', () => {
            showNotification('Buka popup extension untuk mengumpulkan email!');
        });

        document.body.appendChild(button);
    }

    // Show notification
    function showNotification(message) {
        // Remove existing notification
        const existing = document.getElementById('lynk-collector-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.id = 'lynk-collector-notification';
        notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">📧</span>
        <span>${message}</span>
      </div>
    `;
        notification.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 999998;
      animation: slideIn 0.3s ease;
    `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addFloatingButton);
    } else {
        addFloatingButton();
    }

    console.log('Lynk Email Collector: Content script loaded');
})();
