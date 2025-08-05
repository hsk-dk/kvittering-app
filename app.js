// App state
let currentScreen = 'home';
let receipts = [];
let settings = {
    treasurerEmail: '',
    accountNumber: '',
    associationName: ''
};

// DOM elements
const screens = {
    home: document.getElementById('home-screen'),
    expense: document.getElementById('expense-screen'),
    settings: document.getElementById('settings-screen')
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    loadRecentExpenses();
    setupEventListeners();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
});

// Event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('settings-btn').addEventListener('click', () => showScreen('settings'));
    document.getElementById('back-btn').addEventListener('click', () => showScreen('home'));
    document.getElementById('settings-back-btn').addEventListener('click', () => showScreen('home'));
    document.getElementById('new-expense-btn').addEventListener('click', () => showScreen('expense'));
    
    // Camera
    document.getElementById('add-photo-btn').addEventListener('click', openCamera);
    document.getElementById('camera-input').addEventListener('change', handlePhotoCapture);
    
    // Settings
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    
    // Send expense
    document.getElementById('send-expense-btn').addEventListener('click', sendExpense);
}

// Screen management
function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    
    // Show selected screen
    screens[screenName].classList.add('active');
    currentScreen = screenName;
    
    // Clear expense data when leaving expense screen
    if (screenName !== 'expense') {
        receipts = [];
        updateReceiptsList();
    }
}

// Camera functionality
function openCamera() {
    document.getElementById('camera-input').click();
}

function handlePhotoCapture(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            receipts.push({
                id: Date.now() + Math.random(),
                image: e.target.result,
                amount: 0,
                filename: file.name
            });
            updateReceiptsList();
        };
        reader.readAsDataURL(file);
    });
}

// Update receipts display
function updateReceiptsList() {
    const container = document.getElementById('receipts-container');
    const summaryCard = document.getElementById('summary-card');
    
    if (receipts.length === 0) {
        container.innerHTML = '';
        summaryCard.style.display = 'none';
        return;
    }
    
    container.innerHTML = receipts.map(receipt => `
        <div class="receipt-item">
            <img src="${receipt.image}" alt="Kvittering" class="receipt-preview">
            <div class="receipt-amount">
                <label>Beløb:</label>
                <input type="number" 
                       step="0.01" 
                       placeholder="0,00" 
                       value="${receipt.amount || ''}"
                       onchange="updateReceiptAmount('${receipt.id}', this.value)">
                <span>kr</span>
            </div>
            <button class="delete-receipt" onclick="deleteReceipt('${receipt.id}')">
                Slet
            </button>
        </div>
    `).join('');
    
    updateSummary();
    summaryCard.style.display = 'block';
}

// Receipt management
function updateReceiptAmount(receiptId, amount) {
    const receipt = receipts.find(r => r.id == receiptId);
    if (receipt) {
        receipt.amount = parseFloat(amount) || 0;
        updateSummary();
    }
}

function deleteReceipt(receiptId) {
    receipts = receipts.filter(r => r.id != receiptId);
    updateReceiptsList();
}

function updateSummary() {
    const total = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    
    const summaryHtml = `
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Bilag</th>
                    <th>Beløb</th>
                </tr>
            </thead>
            <tbody>
                ${receipts.map((receipt, index) => `
                    <tr>
                        <td>Kvittering ${index + 1}</td>
                        <td>${receipt.amount ? receipt.amount.toFixed(2) : '0,00'} kr</td>
                    </tr>
                `).join('')}
                <tr class="summary-total">
                    <td><strong>I alt:</strong></td>
                    <td><strong>${total.toFixed(2)} kr</strong></td>
                </tr>
            </tbody>
        </table>
    `;
    
    document.getElementById('expense-summary').innerHTML = summaryHtml;
}

// Settings management
function loadSettings() {
    const saved = localStorage.getItem('expenseAppSettings');
    if (saved) {
        settings = JSON.parse(saved);
        document.getElementById('treasurer-email').value = settings.treasurerEmail || '';
        document.getElementById('account-number').value = settings.accountNumber || '';
        document.getElementById('association-name').value = settings.associationName || '';
    }
}

function saveSettings() {
    settings = {
        treasurerEmail: document.getElementById('treasurer-email').value,
        accountNumber: document.getElementById('account-number').value,
        associationName: document.getElementById('association-name').value
    };
    
    localStorage.setItem('expenseAppSettings', JSON.stringify(settings));
    alert('Indstillinger gemt!');
}

// Helper function to validate email addresses
function isValidEmail(email) {
    // Simple email regex for basic validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Send expense
async function sendExpense() {
    const description = document.getElementById('description').value;
    const total = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
    
    if (!description.trim()) {
        alert('Indtast venligst en beskrivelse');
        return;
    }
    
    if (receipts.length === 0) {
        alert('Tilføj venligst mindst én kvittering');
        return;
    }
    
    if (!settings.treasurerEmail) {
        alert('Kassererens e-mail er ikke indstillet. Gå til indstillinger først.');
        return;
    }
    if (!isValidEmail(settings.treasurerEmail)) {
        alert('Kassererens e-mail er ugyldig. Indtast en gyldig e-mailadresse.');
        return;
    }
    
    // Create email content
    const emailSubject = `Udlæg for ${settings.associationName || 'foreningen'}`;
    const emailBody = createEmailBody(description, total);
    
    // Save expense to history
    saveExpenseToHistory(description, total);
    
    // Try to use Web Share API if available and supports files
    if (navigator.share && navigator.canShare) {
        try {
            const files = await convertReceiptsToFiles();
            const shareData = {
                title: emailSubject,
                text: `${emailBody}\n\nTil: ${settings.treasurerEmail}`,
                files: files
            };
            
            // Check if we can share files
            if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return; // Successfully shared, exit function
            }
        } catch (error) {
            console.log('Web Share API failed, falling back to mailto:', error);
        }
    }
    
    // Fallback: use mailto link and offer to download images
    const mailtoLink = `mailto:${encodeURIComponent(settings.treasurerEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    // Provide option to download images for manual attachment
    if (receipts.length > 0) {
        setTimeout(() => {
            const downloadImages = confirm('Vil du downloade kvitteringsbillederne, så du kan vedhæfte dem manuelt i din e-mail app?');
            if (downloadImages) {
                downloadReceiptImages();
            }
        }, 1000);
    }
}

function createEmailBody(description, total) {
    let body = `Hej,\n\nJeg har haft følgende udlæg:\n\n`;
    
    // Add receipts table
    receipts.forEach((receipt, index) => {
        body += `Kvittering ${index + 1}: ${receipt.amount ? receipt.amount.toFixed(2) : '0,00'} kr\n`;
    });
    
    body += `\nSamlet beløb: ${total.toFixed(2)} kr\n\n`;
    body += `Beskrivelse: ${description}\n\n`;
    
    if (settings.accountNumber) {
        body += `Konto: ${settings.accountNumber}\n\n`;
    }
    
    body += `Kvitteringerne er vedhæftet som billeder.\n\nVenlig hilsen`;
    
    return body;
}

// Convert base64 images to File objects for Web Share API
async function convertReceiptsToFiles() {
    const files = [];
    
    for (let i = 0; i < receipts.length; i++) {
        const receipt = receipts[i];
        try {
            const response = await fetch(receipt.image);
            const blob = await response.blob();
            const filename = receipt.filename || `kvittering-${i + 1}.jpg`;
            const file = new File([blob], filename, { type: blob.type });
            files.push(file);
        } catch (error) {
            console.error('Error converting receipt to file:', error);
        }
    }
    
    return files;
}

// Download receipt images as files
function downloadReceiptImages() {
    receipts.forEach((receipt, index) => {
        try {
            const link = document.createElement('a');
            link.href = receipt.image;
            link.download = receipt.filename || `kvittering-${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading receipt:', error);
        }
    });
}

// History management
function saveExpenseToHistory(description, total) {
    let history = JSON.parse(localStorage.getItem('expenseHistory') || '[]');
    
    history.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        description: description,
        total: total,
        receiptsCount: receipts.length,
        received: false
    });
    
    // Keep only last 10 expenses
    history = history.slice(0, 10);
    
    localStorage.setItem('expenseHistory', JSON.stringify(history));
    loadRecentExpenses();
}

// Toggle received status for expense
function toggleReceived(expenseId) {
    let history = JSON.parse(localStorage.getItem('expenseHistory') || '[]');
    const expense = history.find(e => e.id === expenseId);
    
    if (expense) {
        expense.received = !expense.received;
        localStorage.setItem('expenseHistory', JSON.stringify(history));
        loadRecentExpenses();
    }
}

// Utility to escape HTML special characters
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
}

function loadRecentExpenses() {
    const history = JSON.parse(localStorage.getItem('expenseHistory') || '[]');
    const container = document.getElementById('recent-expenses');
    
    if (history.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">Ingen tidligere udlæg</p>';
        return;
    }
    
    container.innerHTML = history.map(expense => {
        const date = new Date(expense.date).toLocaleDateString('da-DK');
        const receivedClass = expense.received ? 'received' : 'pending';
        const statusIcon = expense.received ? '✅' : '🕐';
        const amountStyle = expense.received ? 'text-decoration: line-through;' : '';
        
        return `
            <div class="recent-item ${receivedClass}">
                <div class="recent-header">
                    <div class="recent-description">${escapeHtml(expense.description)}</div>
                    <div class="status-container">
                        <span class="status-icon">${statusIcon}</span>
                        <label class="checkbox-container">
                            <input type="checkbox" 
                                   ${expense.received ? 'checked' : ''} 
                                   onchange="toggleReceived(${expense.id})"
                                   title="Marker som modtaget">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>
                <div class="recent-date">${date} • ${expense.receiptsCount} kvittering${expense.receiptsCount > 1 ? 'er' : ''}</div>
                <div class="recent-amount" style="${amountStyle}">${expense.total.toFixed(2)} kr</div>
            </div>
        `;
    }).join('');
}