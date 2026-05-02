// ===========================
// Bank Application JavaScript
// ===========================

// Data Storage (using localStorage for persistence)
const storage = {
    getUsers: () => JSON.parse(localStorage.getItem('users')) || {},
    setUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')) || null,
    setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
    clearCurrentUser: () => localStorage.removeItem('currentUser')
};

// Generate unique account number
function generateAccountNumber() {
    return 'ACC' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Show Alert
function showAlert(message) {
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertModal.classList.remove('hidden');
}

// Close Alert
function closeAlert() {
    document.getElementById('alertModal').classList.add('hidden');
}

// ===========================
// Authentication Functions
// ===========================

// Handle Registration
function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;
    const initialDeposit = parseFloat(document.getElementById('initialDeposit').value) || 0;

    const users = storage.getUsers();

    // Validate username
    if (users[username]) {
        showAlert('Username already exists!');
        return;
    }

    // Create new user
    const newUser = {
        username,
        password,
        email,
        accountNumber: generateAccountNumber(),
        balance: initialDeposit,
        transactions: initialDeposit > 0 ? [{
            type: 'deposit',
            amount: initialDeposit,
            date: new Date().toISOString(),
            description: 'Initial Deposit'
        }] : [],
        interestRate: 2.5
    };

    users[username] = newUser;
    storage.setUsers(users);

    showAlert(`Account created successfully! Welcome, ${username}`);

    // Clear form
    document.getElementById('registerForm').reset();
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = password;

    // Switch to login
    document.getElementById('registerBtn').click();
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const users = storage.getUsers();
    const user = users[username];

    if (!user) {
        showAlert('Username not found!');
        return;
    }

    if (user.password !== password) {
        showAlert('Incorrect password!');
        return;
    }

    // Store current user and show dashboard
    storage.setCurrentUser(user);
    showDashboard();
}

// Show Dashboard
function showDashboard() {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateDashboard();
}

// Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        storage.clearCurrentUser();
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('loginForm').reset();
    }
}

// ===========================
// Dashboard Functions
// ===========================

// Update Dashboard Display
function updateDashboard() {
    const user = storage.getCurrentUser();
    if (!user) return;

    document.getElementById('userName').textContent = user.username;
    document.getElementById('balanceDisplay').textContent = formatCurrency(user.balance);
    document.getElementById('accountNumber').textContent = user.accountNumber;
    document.getElementById('accountHolder').textContent = user.username;
    document.getElementById('settingsEmail').textContent = user.email;
    document.getElementById('interestRate').textContent = user.interestRate;

    // Calculate and display monthly interest
    const monthlyInterest = (user.balance * user.interestRate) / 12 / 100;
    document.getElementById('monthlyInterest').textContent = formatCurrency(monthlyInterest);

    // Update transactions
    updateTransactionHistory();
}

// Update Transaction History
function updateTransactionHistory() {
    const user = storage.getCurrentUser();
    const transactionList = document.getElementById('transactionList');

    if (!user.transactions || user.transactions.length === 0) {
        transactionList.innerHTML = '<p class="no-transactions">No transactions yet</p>';
        return;
    }

    const sortedTransactions = [...user.transactions].reverse();
    transactionList.innerHTML = sortedTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-details">
                <div class="transaction-type">${capitalizeFirst(transaction.type)}</div>
                <div class="transaction-date">${formatDate(new Date(transaction.date))}</div>
                ${transaction.description ? `<div class="transaction-date">${transaction.description}</div>` : ''}
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'withdrawal' || transaction.type === 'transfer-out' ? '-' : '+'}${formatCurrency(transaction.amount)}
            </div>
        </div>
    `).join('');
}

// Capitalize First Letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}

// ===========================
// Transaction Functions
// ===========================

// Handle Deposit
function handleDeposit(event) {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('depositAmount').value);
    const note = document.getElementById('depositNote').value;

    if (amount <= 0) {
        showAlert('Amount must be greater than 0!');
        return;
    }

    const user = storage.getCurrentUser();
    user.balance += amount;

    user.transactions.push({
        type: 'deposit',
        amount: amount,
        date: new Date().toISOString(),
        description: note || 'Deposit'
    });

    storage.setCurrentUser(user);
    updateDashboard();
    closeModal('depositModal');
    document.getElementById('depositForm').reset();

    showAlert(`Successfully deposited ${formatCurrency(amount)}!`);
}

// Handle Withdrawal
function handleWithdraw(event) {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const note = document.getElementById('withdrawNote').value;

    const user = storage.getCurrentUser();

    if (amount <= 0) {
        showAlert('Amount must be greater than 0!');
        return;
    }

    if (amount > user.balance) {
        showAlert('Insufficient funds!');
        return;
    }

    user.balance -= amount;

    user.transactions.push({
        type: 'withdrawal',
        amount: amount,
        date: new Date().toISOString(),
        description: note || 'Withdrawal'
    });

    storage.setCurrentUser(user);
    updateDashboard();
    closeModal('withdrawModal');
    document.getElementById('withdrawForm').reset();

    showAlert(`Successfully withdrawn ${formatCurrency(amount)}!`);
}

// Handle Transfer
function handleTransfer(event) {
    event.preventDefault();

    const recipientUsername = document.getElementById('transferRecipient').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const note = document.getElementById('transferNote').value;

    const sender = storage.getCurrentUser();
    const users = storage.getUsers();
    const recipient = users[recipientUsername];

    if (!recipient) {
        showAlert('Recipient username not found!');
        return;
    }

    if (recipientUsername === sender.username) {
        showAlert('Cannot transfer to yourself!');
        return;
    }

    if (amount <= 0) {
        showAlert('Amount must be greater than 0!');
        return;
    }

    if (amount > sender.balance) {
        showAlert('Insufficient funds!');
        return;
    }

    // Deduct from sender
    sender.balance -= amount;
    sender.transactions.push({
        type: 'transfer-out',
        amount: amount,
        date: new Date().toISOString(),
        description: `Transfer to ${recipientUsername}: ${note || ''}`
    });

    // Add to recipient
    recipient.balance += amount;
    recipient.transactions.push({
        type: 'transfer-in',
        amount: amount,
        date: new Date().toISOString(),
        description: `Transfer from ${sender.username}: ${note || ''}`
    });

    // Update storage
    users[sender.username] = sender;
    users[recipientUsername] = recipient;
    storage.setUsers(users);
    storage.setCurrentUser(sender);

    updateDashboard();
    closeModal('transferModal');
    document.getElementById('transferForm').reset();

    showAlert(`Successfully transferred ${formatCurrency(amount)} to ${recipientUsername}!`);
}

// Apply Monthly Interest
function applyMonthlyInterest() {
    const user = storage.getCurrentUser();
    const monthlyInterest = (user.balance * user.interestRate) / 12 / 100;

    if (monthlyInterest <= 0) {
        showAlert('No interest to apply!');
        return;
    }

    user.balance += monthlyInterest;
    user.transactions.push({
        type: 'deposit',
        amount: monthlyInterest,
        date: new Date().toISOString(),
        description: `Monthly Interest (${user.interestRate}% APR)`
    });

    storage.setCurrentUser(user);
    updateDashboard();

    showAlert(`Monthly interest of ${formatCurrency(monthlyInterest)} applied!`);
}

// ===========================
// Settings Functions
// ===========================

// Handle Change Password
function handleChangePassword(event) {
    event.preventDefault();

    const user = storage.getCurrentUser();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (oldPassword !== user.password) {
        showAlert('Current password is incorrect!');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match!');
        return;
    }

    if (newPassword.length < 4) {
        showAlert('Password must be at least 4 characters!');
        return;
    }

    user.password = newPassword;
    const users = storage.getUsers();
    users[user.username] = user;
    storage.setUsers(users);
    storage.setCurrentUser(user);

    document.getElementById('changePasswordForm').reset();
    closeModal('settingsModal');

    showAlert('Password changed successfully!');
}

// Handle Delete Account
function handleDeleteAccount() {
    const user = storage.getCurrentUser();

    if (confirm(`Are you sure you want to delete the account "${user.username}"? This action cannot be undone!`)) {
        const users = storage.getUsers();
        delete users[user.username];
        storage.setUsers(users);
        storage.clearCurrentUser();

        closeModal('settingsModal');
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');

        showAlert('Account deleted successfully!');
    }
}

// ===========================
// Modal Functions
// ===========================

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// ===========================
// Event Listeners - Authentication
// ===========================

document.getElementById('loginBtn').addEventListener('click', function() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    this.classList.add('active');
    document.getElementById('registerBtn').classList.remove('active');
});

document.getElementById('registerBtn').addEventListener('click', function() {
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    this.classList.add('active');
    document.getElementById('loginBtn').classList.remove('active');
});

document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('registerForm').addEventListener('submit', handleRegister);

// ===========================
// Event Listeners - Dashboard
// ===========================

document.getElementById('logoutBtn').addEventListener('click', handleLogout);

// Quick Action Buttons
document.getElementById('depositBtn').addEventListener('click', () => openModal('depositModal'));
document.getElementById('withdrawBtn').addEventListener('click', () => openModal('withdrawModal'));
document.getElementById('transferBtn').addEventListener('click', () => openModal('transferModal'));
document.getElementById('settingsBtn').addEventListener('click', () => openModal('settingsModal'));
document.getElementById('applyInterestBtn').addEventListener('click', applyMonthlyInterest);

// Transaction Forms
document.getElementById('depositForm').addEventListener('submit', handleDeposit);
document.getElementById('withdrawForm').addEventListener('submit', handleWithdraw);
document.getElementById('transferForm').addEventListener('submit', handleTransfer);

// Settings Form
document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);
document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);

// ===========================
// Event Listeners - Modals
// ===========================

// Close modals when X is clicked
document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.parentElement.parentElement.classList.add('hidden');
    });
});

// Close alert
document.getElementById('alertOkBtn').addEventListener('click', closeAlert);

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// ===========================
// Initialize App
// ===========================

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', function() {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
        showDashboard();
    }
});