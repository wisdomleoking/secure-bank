// Global variables
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// API Base URL
const API_BASE = '/api';

// Utility Functions
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 fade-in`;

    switch (type) {
        case 'success':
            toast.classList.add('bg-green-600', 'text-white');
            break;
        case 'error':
            toast.classList.add('bg-red-600', 'text-white');
            break;
        default:
            toast.classList.add('bg-gray-800', 'text-white');
    }

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Auth Functions
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');

            updateUserInfo();
            loadDashboard();
            showToast('Welcome back!', 'success');
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
        console.error('Login error:', error);
    }
}

async function register(firstName, lastName, email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Account created successfully!', 'success');
            showLogin();
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Registration failed. Please try again.', 'error');
        console.error('Registration error:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    token = null;
    currentUser = null;

    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    showToast('Logged out successfully', 'info');
}

function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = `${currentUser.first_name} ${currentUser.last_name}`;
        document.getElementById('userEmail').textContent = currentUser.email;
    }
}

// Page Navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.add('hidden');
    });

    // Remove active class from all nav links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected page
    const page = document.getElementById(`page-${pageName}`);
    if (page) {
        page.classList.remove('hidden');
    }

    // Add active class to nav link
    const navLink = document.getElementById(`nav-${pageName}`);
    if (navLink) {
        navLink.classList.add('active');
    }

    // Update page title
    const titles = {
        'dashboard': { title: 'Dashboard', subtitle: 'Welcome back!' },
        'accounts': { title: 'Accounts', subtitle: 'Manage your accounts' },
        'transactions': { title: 'Transactions', subtitle: 'View your transaction history' },
        'transfers': { title: 'Transfers', subtitle: 'Send and receive money' },
        'cards': { title: 'Cards', subtitle: 'Manage your cards' },
        'investments': { title: 'Investments', subtitle: 'Track your portfolio' },
        'statements': { title: 'Statements', subtitle: 'Download your statements' },
        'ai-assistant': { title: 'AI Assistant', subtitle: 'Get financial insights' },
        'settings': { title: 'Settings', subtitle: 'Manage your account' }
    };

    if (titles[pageName]) {
        document.getElementById('pageTitle').textContent = titles[pageName].title;
        document.getElementById('pageSubtitle').textContent = titles[pageName].subtitle;
    }

    // Load page-specific data
    switch (pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'accounts':
            loadAccounts();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'transfers':
            loadTransferAccounts();
            break;
        case 'cards':
            loadCards();
            break;
        case 'investments':
            loadInvestments();
            break;
        case 'statements':
            loadStatements();
            break;
        case 'ai-assistant':
            loadAIInsights();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/users/dashboard`, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success) {
            const { dashboard } = data;

            document.getElementById('totalBalance').textContent = formatCurrency(dashboard.totalBalance);
            document.getElementById('totalIncome').textContent = formatCurrency(dashboard.totalIncome);
            document.getElementById('totalExpenses').textContent = formatCurrency(dashboard.totalExpenses);
            document.getElementById('savingsGoalsCount').textContent = dashboard.savingsGoals.length;

            // Load recent transactions
            if (dashboard.recentTransactions && dashboard.recentTransactions.length > 0) {
                const container = document.getElementById('recentTransactions');
                container.innerHTML = dashboard.recentTransactions.slice(0, 5).map(tx => `
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center ${tx.transaction_type === 'credit' ? 'bg-green-100' : 'bg-red-100'}">
                                <i class="fas ${tx.transaction_type === 'credit' ? 'fa-arrow-down text-green-600' : 'fa-arrow-up text-red-600'}"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-800">${tx.description}</p>
                                <p class="text-sm text-gray-500">${formatDate(tx.created_at)}</p>
                            </div>
                        </div>
                        <p class="font-semibold ${tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}">
                            ${tx.transaction_type === 'credit' ? '+' : '-'}${formatCurrency(tx.amount)}
                        </p>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Accounts Functions
async function loadAccounts() {
    try {
        const response = await fetch(`${API_BASE}/accounts`, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success) {
            const container = document.getElementById('accountsGrid');

            if (data.accounts.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-wallet text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">No accounts found. Create your first account!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = data.accounts.map(account => `
                <div class="bg-gradient-to-br ${account.color || 'from-blue-600 to-blue-800'} rounded-xl p-6 text-white card-hover">
                    <div class="flex justify-between items-start mb-8">
                        <div>
                            <p class="text-white/80 text-sm">${account.account_type}</p>
                            <p class="font-semibold">${account.account_name}</p>
                        </div>
                        <i class="fas fa-${account.account_type === 'Checking' ? 'credit-card' : 'piggy-bank'} text-2xl text-white/80"></i>
                    </div>
                    <div class="mb-4">
                        <p class="text-3xl font-bold">${formatCurrency(account.balance)}</p>
                        <p class="text-white/80 text-sm">**** **** **** ${account.account_number.slice(-4)}</p>
                    </div>
                    <div class="flex justify-between items-center text-sm text-white/80">
                        <span>${account.status}</span>
                        <span>${formatDate(account.created_at)}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
    }
}

function openAccountModal() {
    document.getElementById('modalTitle').textContent = 'Create New Account';
    document.getElementById('modalContent').innerHTML = `
        <form id="createAccountForm" class="space-y-4">
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Account Type</label>
                <select id="accountType" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Checking">Checking Account</option>
                    <option value="Savings">Savings Account</option>
                </select>
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Account Name</label>
                <input type="text" id="accountName" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="My Account">
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Initial Balance</label>
                <div class="relative">
                    <span class="absolute left-4 top-3 text-gray-500">$</span>
                    <input type="number" id="initialBalance" class="w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" min="0" step="0.01">
                </div>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold">
                Create Account
            </button>
        </form>
    `;

    document.getElementById('modal').classList.remove('hidden');

    document.getElementById('createAccountForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const accountType = document.getElementById('accountType').value;
        const accountName = document.getElementById('accountName').value;
        const initialBalance = parseFloat(document.getElementById('initialBalance').value) || 0;

        try {
            const response = await fetch(`${API_BASE}/accounts`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ accountType, accountName, balance: initialBalance })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Account created successfully!', 'success');
                closeModal();
                loadAccounts();
            } else {
                showToast(data.message || 'Failed to create account', 'error');
            }
        } catch (error) {
            showToast('Failed to create account', 'error');
            console.error('Error creating account:', error);
        }
    });
}

// Transactions Functions
async function loadTransactions() {
    try {
        const typeFilter = document.getElementById('transactionFilter')?.value || 'all';
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';

        let url = `${API_BASE}/transactions?limit=100`;
        if (typeFilter !== 'all') url += `&type=${typeFilter}`;
        if (categoryFilter !== 'all') url += `&category=${categoryFilter}`;

        const response = await fetch(url, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success) {
            const container = document.getElementById('transactionsList');

            if (data.transactions.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-exchange-alt text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">No transactions found</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.transactions.map(tx => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(tx.created_at)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tx.description}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">${tx.category}</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}">
                                    ${tx.transaction_type === 'credit' ? '+' : '-'}${formatCurrency(tx.amount)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Transfer Functions
async function loadTransferAccounts() {
    try {
        const response = await fetch(`${API_BASE}/accounts`, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success) {
            const fromSelect = document.getElementById('fromAccount');
            const toSelect = document.getElementById('toAccount');

            const options = data.accounts.map(acc =>
                `<option value="${acc.id}">${acc.account_name} - ${formatCurrency(acc.balance)}</option>`
            ).join('');

            if (fromSelect) fromSelect.innerHTML = options;
            if (toSelect) toSelect.innerHTML = options;

            // Load recent transfers
            loadRecentTransfers();
        }
    } catch (error) {
        console.error('Error loading accounts for transfer:', error);
    }
}

async function loadRecentTransfers() {
    try {
        const response = await fetch(`${API_BASE}/transfers`, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success && data.transfers.length > 0) {
            const container = document.getElementById('recentTransfers');
            container.innerHTML = data.transfers.slice(0, 5).map(transfer => `
                <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-medium text-gray-800">${transfer.to_account_number || transfer.to_account_id}</p>
                            <p class="text-sm text-gray-500">${formatDate(transfer.created_at)}</p>
                        </div>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                }">${transfer.status}</span>
                    </div>
                    <p class="font-semibold text-gray-800">${formatCurrency(transfer.amount)}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent transfers:', error);
    }
}

document.getElementById('transferType')?.addEventListener('change', (e) => {
    const externalFields = document.getElementById('externalAccountFields');
    if (e.target.value === 'external') {
        externalFields.classList.remove('hidden');
    } else {
        externalFields.classList.add('hidden');
    }
});

document.getElementById('transferForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fromAccountId = document.getElementById('fromAccount').value;
    const transferType = document.getElementById('transferType').value;
    const toAccountId = document.getElementById('toAccount').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const notes = document.getElementById('transferNotes').value;

    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }

    const transferData = {
        fromAccountId,
        amount,
        description: notes || 'Transfer'
    };

    if (transferType === 'internal') {
        transferData.toAccountId = toAccountId;
    } else {
        transferData.toAccountNumber = document.getElementById('toAccountNumber').value;
        transferData.toRoutingNumber = document.getElementById('toRoutingNumber').value;
    }

    try {
        const response = await fetch(`${API_BASE}/transfers`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(transferData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Transfer initiated successfully!', 'success');
            document.getElementById('transferForm').reset();
            loadRecentTransfers();
        } else {
            showToast(data.message || 'Transfer failed', 'error');
        }
    } catch (error) {
        showToast('Transfer failed', 'error');
        console.error('Error making transfer:', error);
    }
});

// Cards Functions
async function loadCards() {
    try {
        const response = await fetch(`${API_BASE}/cards`, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success) {
            const container = document.getElementById('cardsGrid');

            if (data.cards.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-credit-card text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">No cards found</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = data.cards.map(card => `
                <div class="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white card-hover relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-8">
                            <div>
                                <p class="font-semibold">${card.card_type}</p>
                                <p class="text-white/80 text-sm">${card.card_name || 'My Card'}</p>
                            </div>
                            <i class="fab fa-cc-${card.card_type.toLowerCase()} text-3xl"></i>
                        </div>
                        <p class="text-lg tracking-widest mb-4">**** **** **** ${card.last_four}</p>
                        <div class="flex justify-between items-center text-sm">
                            <div>
                                <p class="text-white/60 text-xs">EXP</p>
                                <p>${card.expiry_date}</p>
                            </div>
                            <div>
                                <span class="px-2 py-1 text-xs font-medium rounded-full ${card.status === 'active' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                }">${card.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

// Investments Functions
async function loadInvestments() {
    try {
        const response = await fetch(`${API_BASE}/investments`, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success) {
            // Update summary
            document.getElementById('totalInvestmentValue').textContent = formatCurrency(data.summary.totalValue);
            document.getElementById('totalInvestmentReturn').textContent = formatCurrency(data.summary.totalReturn);
            document.getElementById('esgPercentage').textContent = `${data.summary.esgPercentage.toFixed(1)}%`;

            const container = document.getElementById('investmentsGrid');

            if (data.investments.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-chart-line text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">No investments found. Start investing today!</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = data.investments.map(inv => `
                <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="font-semibold text-gray-800">${inv.name}</p>
                            <p class="text-sm text-gray-500">${inv.investment_type}</p>
                        </div>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${inv.is_esg ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                            ${inv.is_esg ? 'ESG' : 'Standard'}
                        </span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-500">Value</span>
                            <span class="font-semibold">${formatCurrency(inv.current_value)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Change</span>
                            <span class="font-semibold ${inv.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}">
                                ${inv.change_percent >= 0 ? '+' : ''}${inv.change_percent.toFixed(2)}%
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Quantity</span>
                            <span>${inv.quantity}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading investments:', error);
    }
}

function openInvestmentModal() {
    document.getElementById('modalTitle').textContent = 'Add Investment';
    document.getElementById('modalContent').innerHTML = `
        <form id="createInvestmentForm" class="space-y-4">
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Investment Type</label>
                <select id="investmentType" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Stock">Stock</option>
                    <option value="ETF">ETF</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Bond">Bond</option>
                    <option value="Crypto">Crypto</option>
                </select>
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Name</label>
                <input type="text" id="investmentName" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Apple Inc.">
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Symbol</label>
                <input type="text" id="investmentSymbol" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., AAPL">
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Quantity</label>
                <input type="number" id="investmentQuantity" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="10" min="0" step="0.01">
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Average Cost per Share</label>
                <div class="relative">
                    <span class="absolute left-4 top-3 text-gray-500">$</span>
                    <input type="number" id="investmentCost" class="w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="150.00" min="0" step="0.01">
                </div>
            </div>
            <div>
                <label class="flex items-center">
                    <input type="checkbox" id="investmentESG" class="mr-2">
                    <span class="text-sm text-gray-700">ESG Investment</span>
                </label>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold">
                Add Investment
            </button>
        </form>
    `;

    document.getElementById('modal').classList.remove('hidden');

    document.getElementById('createInvestmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const investmentData = {
            investmentType: document.getElementById('investmentType').value,
            name: document.getElementById('investmentName').value,
            symbol: document.getElementById('investmentSymbol').value,
            quantity: parseFloat(document.getElementById('investmentQuantity').value) || 0,
            averageCost: parseFloat(document.getElementById('investmentCost').value) || 0,
            isEsg: document.getElementById('investmentESG').checked
        };

        try {
            const response = await fetch(`${API_BASE}/investments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(investmentData)
            });

            const data = await response.json();

            if (data.success) {
                showToast('Investment added successfully!', 'success');
                closeModal();
                loadInvestments();
            } else {
                showToast(data.message || 'Failed to add investment', 'error');
            }
        } catch (error) {
            showToast('Failed to add investment', 'error');
            console.error('Error adding investment:', error);
        }
    });
}

// Statements Functions
async function loadStatements() {
    try {
        const response = await fetch(`${API_BASE}/statements`, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success) {
            const container = document.getElementById('statementsList');

            if (data.statements.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">No statements found</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.statements.map(stmt => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${formatDate(stmt.statement_period_start)} - ${formatDate(stmt.statement_period_end)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stmt.account_name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${formatCurrency(stmt.ending_balance)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <a href="${API_BASE}/statements/${stmt.id}/download" target="_blank" class="text-blue-600 hover:text-blue-700">
                                        <i class="fas fa-download"></i> Download
                                    </a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Error loading statements:', error);
    }
}

// AI Assistant Functions
async function loadAIInsights() {
    try {
        const response = await fetch(`${API_BASE}/ai/insights?period=30`, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success) {
            const container = document.getElementById('aiInsights');

            let html = '';

            if (data.insights.length > 0) {
                html += '<div class="mb-6"><h4 class="font-semibold text-gray-800 mb-3">Insights</h4>';
                data.insights.forEach(insight => {
                    const severityColors = {
                        success: 'bg-green-100 border-green-300 text-green-800',
                        info: 'bg-blue-100 border-blue-300 text-blue-800',
                        warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
                        danger: 'bg-red-100 border-red-300 text-red-800'
                    };
                    html += `
                        <div class="p-3 rounded-lg border ${severityColors[insight.severity]} mb-2">
                            <p class="font-medium text-sm">${insight.category}</p>
                            <p class="text-sm">${insight.message}</p>
                        </div>
                    `;
                });
                html += '</div>';
            }

            if (data.recommendations.length > 0) {
                html += '<h4 class="font-semibold text-gray-800 mb-3">Recommendations</h4>';
                data.recommendations.forEach(rec => {
                    html += `
                        <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 mb-2">
                            <p class="font-medium text-sm">${rec.category}</p>
                            <p class="text-sm text-gray-600">${rec.message}</p>
                        </div>
                    `;
                });
            }

            container.innerHTML = html || '<p class="text-gray-500 text-center">No insights available yet</p>';
        }
    } catch (error) {
        console.error('Error loading AI insights:', error);
    }
}

document.getElementById('chatForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    const container = document.getElementById('chatMessages');
    container.innerHTML += `
        <div class="flex items-start space-x-3 justify-end">
            <div class="bg-blue-600 text-white rounded-lg p-4 max-w-md">
                <p>${message}</p>
            </div>
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-white"></i>
            </div>
        </div>
    `;

    input.value = '';
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (data.success) {
            container.innerHTML += `
                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-robot text-purple-600"></i>
                    </div>
                    <div class="bg-gray-100 rounded-lg p-4 max-w-md">
                        <p class="text-gray-700">${data.response.message}</p>
                    </div>
                </div>
            `;
            container.scrollTop = container.scrollHeight;
        }
    } catch (error) {
        console.error('Error chatting with AI:', error);
    }
});

// Settings Functions
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/users/profile`, {
            headers: getHeaders()
        });

        const data = await response.json();

        if (data.success && data.user) {
            document.getElementById('settingsFirstName').value = data.user.first_name || '';
            document.getElementById('settingsLastName').value = data.user.last_name || '';
            document.getElementById('settingsEmail').value = data.user.email || '';
            document.getElementById('settingsPhone').value = data.user.phone || '';
            document.getElementById('twoFactorEnabled').checked = data.user.two_factor_enabled === 1;
            document.getElementById('biometricEnabled').checked = data.user.biometric_enabled === 1;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const profileData = {
        firstName: document.getElementById('settingsFirstName').value,
        lastName: document.getElementById('settingsLastName').value,
        phone: document.getElementById('settingsPhone').value
    };

    try {
        const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Profile updated successfully!', 'success');
            updateUserInfo();
        } else {
            showToast(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showToast('Failed to update profile', 'error');
        console.error('Error updating profile:', error);
    }
});

document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const passwordData = {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value
    };

    if (!passwordData.currentPassword || !passwordData.newPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users/change-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(passwordData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Password changed successfully!', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            showToast(data.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        showToast('Failed to change password', 'error');
        console.error('Error changing password:', error);
    }
});

document.getElementById('twoFactorEnabled')?.addEventListener('change', async (e) => {
    try {
        await fetch(`${API_BASE}/users/security`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ twoFactorEnabled: e.target.checked })
        });
        showToast('Security settings updated', 'success');
    } catch (error) {
        showToast('Failed to update security settings', 'error');
    }
});

document.getElementById('biometricEnabled')?.addEventListener('change', async (e) => {
    try {
        await fetch(`${API_BASE}/users/security`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ biometricEnabled: e.target.checked })
        });
        showToast('Security settings updated', 'success');
    } catch (error) {
        showToast('Failed to update security settings', 'error');
    }
});

// Modal Functions
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// Event Listeners
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    await login(email, password);
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    await register(firstName, lastName, email, password);
});

document.getElementById('transactionFilter')?.addEventListener('change', loadTransactions);
document.getElementById('categoryFilter')?.addEventListener('change', loadTransactions);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        updateUserInfo();
        showPage('dashboard');
    }
});

// Close modal on outside click
document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});
