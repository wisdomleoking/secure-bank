// Global variables
let token = null;
let currentUser = null;

// API Base URL
const API_BASE = '/api';

// Utility Functions
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

// Dummy Data for Demo
const dummyData = {
    user: {
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@securebank.com',
        phone: '+1 (555) 123-4567',
        two_factor_enabled: 0,
        biometric_enabled: 0
    },
    accounts: [
        {
            id: 1,
            account_name: 'Primary Checking',
            account_type: 'Checking',
            balance: 15420.50,
            account_number: '****4521',
            status: 'Active',
            created_at: '2024-01-15',
            color: 'from-blue-600 to-blue-800'
        },
        {
            id: 2,
            account_name: 'Savings Account',
            account_type: 'Savings',
            balance: 87500.00,
            account_number: '****7892',
            status: 'Active',
            created_at: '2023-06-20',
            color: 'from-green-600 to-green-800'
        },
        {
            id: 3,
            account_name: 'Investment Account',
            account_type: 'Investment',
            balance: 125000.00,
            account_number: '****3456',
            status: 'Active',
            created_at: '2023-12-10',
            color: 'from-purple-600 to-purple-800'
        }
    ],
    transactions: [
        {
            id: 1,
            description: 'Salary Deposit',
            amount: 5200.00,
            transaction_type: 'credit',
            category: 'Income',
            created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 2,
            description: 'Amazon Purchase',
            amount: 156.99,
            transaction_type: 'debit',
            category: 'Shopping',
            created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 3,
            description: 'Netflix Subscription',
            amount: 15.99,
            transaction_type: 'debit',
            category: 'Entertainment',
            created_at: new Date(Date.now() - 259200000).toISOString()
        },
        {
            id: 4,
            description: 'Restaurant',
            amount: 45.50,
            transaction_type: 'debit',
            category: 'Food',
            created_at: new Date(Date.now() - 345600000).toISOString()
        },
        {
            id: 5,
            description: 'Freelance Payment',
            amount: 850.00,
            transaction_type: 'credit',
            category: 'Income',
            created_at: new Date(Date.now() - 432000000).toISOString()
        },
        {
            id: 6,
            description: 'Gas Station',
            amount: 52.30,
            transaction_type: 'debit',
            category: 'Transport',
            created_at: new Date(Date.now() - 518400000).toISOString()
        },
        {
            id: 7,
            description: 'Electric Bill',
            amount: 125.00,
            transaction_type: 'debit',
            category: 'Bills',
            created_at: new Date(Date.now() - 604800000).toISOString()
        },
        {
            id: 8,
            description: 'Investment Return',
            amount: 2340.50,
            transaction_type: 'credit',
            category: 'Investment',
            created_at: new Date(Date.now() - 691200000).toISOString()
        }
    ],
    transfers: [
        {
            id: 1,
            from_account_id: 1,
            to_account_number: '****1234',
            amount: 500.00,
            status: 'completed',
            created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 2,
            from_account_id: 1,
            to_account_id: 2,
            amount: 1000.00,
            status: 'completed',
            created_at: new Date(Date.now() - 432000000).toISOString()
        }
    ],
    cards: [
        {
            id: 1,
            card_name: 'Platinum Card',
            card_type: 'Visa',
            last_four: '4521',
            expiry_date: '12/27',
            status: 'active'
        },
        {
            id: 2,
            card_name: 'Gold Card',
            card_type: 'Mastercard',
            last_four: '7892',
            expiry_date: '08/26',
            status: 'active'
        }
    ],
    investments: [
        {
            id: 1,
            name: 'Apple Inc.',
            symbol: 'AAPL',
            investment_type: 'Stock',
            quantity: 50,
            current_value: 9500.00,
            change_percent: 12.5,
            is_esg: true
        },
        {
            id: 2,
            name: 'Tesla',
            symbol: 'TSLA',
            investment_type: 'Stock',
            quantity: 25,
            current_value: 6250.00,
            change_percent: -5.2,
            is_esg: true
        },
        {
            id: 3,
            name: 'Vanguard S&P 500',
            symbol: 'VOO',
            investment_type: 'ETF',
            quantity: 40,
            current_value: 18000.00,
            change_percent: 8.3,
            is_esg: false
        },
        {
            id: 4,
            name: 'Microsoft',
            symbol: 'MSFT',
            investment_type: 'Stock',
            quantity: 35,
            current_value: 12250.00,
            change_percent: 15.7,
            is_esg: true
        }
    ],
    statements: [
        {
            id: 1,
            account_name: 'Primary Checking',
            statement_period_start: new Date(Date.now() - 2592000000).toISOString(),
            statement_period_end: new Date(Date.now() - 259200000).toISOString(),
            ending_balance: 15420.50
        },
        {
            id: 2,
            account_name: 'Savings Account',
            statement_period_start: new Date(Date.now() - 2592000000).toISOString(),
            statement_period_end: new Date(Date.now() - 259200000).toISOString(),
            ending_balance: 87500.00
        }
    ]
};

// Auth Functions
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

function logout() {
    showToast('Logged out successfully (Demo Mode)', 'info');
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
function loadDashboard() {
    const totalBalance = dummyData.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const income = dummyData.transactions
        .filter(tx => tx.transaction_type === 'credit')
        .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = dummyData.transactions
        .filter(tx => tx.transaction_type === 'debit')
        .reduce((sum, tx) => sum + tx.amount, 0);

    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
    document.getElementById('savingsGoalsCount').textContent = '3';

    // Load recent transactions
    const container = document.getElementById('recentTransactions');
    container.innerHTML = dummyData.transactions.slice(0, 5).map(tx => `
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

// Accounts Functions
function loadAccounts() {
    const container = document.getElementById('accountsGrid');

    container.innerHTML = dummyData.accounts.map(account => `
        <div class="bg-gradient-to-br ${account.color} rounded-xl p-6 text-white card-hover">
            <div class="flex justify-between items-start mb-8">
                <div>
                    <p class="text-white/80 text-sm">${account.account_type}</p>
                    <p class="font-semibold">${account.account_name}</p>
                </div>
                <i class="fas fa-${account.account_type === 'Checking' ? 'credit-card' : account.account_type === 'Savings' ? 'piggy-bank' : 'chart-line'} text-2xl text-white/80"></i>
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

    document.getElementById('createAccountForm').addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Account created successfully! (Demo Mode)', 'success');
        closeModal();
    });
}

// Transactions Functions
function loadTransactions() {
    const typeFilter = document.getElementById('transactionFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';

    let filteredTransactions = [...dummyData.transactions];

    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => tx.transaction_type === typeFilter);
    }
    if (categoryFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => tx.category === categoryFilter);
    }

    const container = document.getElementById('transactionsList');

    if (filteredTransactions.length === 0) {
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
                ${filteredTransactions.map(tx => `
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

// Transfer Functions
function loadTransferAccounts() {
    const fromSelect = document.getElementById('fromAccount');
    const toSelect = document.getElementById('toAccount');

    const options = dummyData.accounts.map(acc =>
        `<option value="${acc.id}">${acc.account_name} - ${formatCurrency(acc.balance)}</option>`
    ).join('');

    if (fromSelect) fromSelect.innerHTML = options;
    if (toSelect) toSelect.innerHTML = options;

    loadRecentTransfers();
}

function loadRecentTransfers() {
    const container = document.getElementById('recentTransfers');
    container.innerHTML = dummyData.transfers.map(transfer => `
        <div class="p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="font-medium text-gray-800">${transfer.to_account_number || 'Internal Transfer'}</p>
                    <p class="text-sm text-gray-500">${formatDate(transfer.created_at)}</p>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full ${transfer.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${transfer.status}</span>
            </div>
            <p class="font-semibold text-gray-800">${formatCurrency(transfer.amount)}</p>
        </div>
    `).join('');
}

document.getElementById('transferType')?.addEventListener('change', (e) => {
    const externalFields = document.getElementById('externalAccountFields');
    if (e.target.value === 'external') {
        externalFields.classList.remove('hidden');
    } else {
        externalFields.classList.add('hidden');
    }
});

document.getElementById('transferForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const fromAccountId = document.getElementById('fromAccount').value;
    const transferType = document.getElementById('transferType').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const notes = document.getElementById('transferNotes').value;

    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }

    showToast('Transfer initiated successfully! (Demo Mode)', 'success');
    document.getElementById('transferForm').reset();
});

// Cards Functions
function loadCards() {
    const container = document.getElementById('cardsGrid');

    container.innerHTML = dummyData.cards.map(card => `
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
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${card.status === 'active' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}">${card.status}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Investments Functions
function loadInvestments() {
    const totalValue = dummyData.investments.reduce((sum, inv) => sum + inv.current_value, 0);
    const totalReturn = dummyData.investments.reduce((sum, inv) => sum + (inv.current_value * inv.change_percent / 100), 0);
    const esgCount = dummyData.investments.filter(inv => inv.is_esg).length;
    const esgPercentage = (esgCount / dummyData.investments.length) * 100;

    document.getElementById('totalInvestmentValue').textContent = formatCurrency(totalValue);
    document.getElementById('totalInvestmentReturn').textContent = formatCurrency(totalReturn);
    document.getElementById('esgPercentage').textContent = `${esgPercentage.toFixed(1)}%`;

    const container = document.getElementById('investmentsGrid');

    container.innerHTML = dummyData.investments.map(inv => `
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

    document.getElementById('createInvestmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Investment added successfully! (Demo Mode)', 'success');
        closeModal();
    });
}

// Statements Functions
function loadStatements() {
    const container = document.getElementById('statementsList');

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
                ${dummyData.statements.map(stmt => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${formatDate(stmt.statement_period_start)} - ${formatDate(stmt.statement_period_end)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stmt.account_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${formatCurrency(stmt.ending_balance)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <button onclick="showToast('Statement downloaded! (Demo Mode)', 'success')" class="text-blue-600 hover:text-blue-700">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// AI Assistant Functions
function loadAIInsights() {
    const container = document.getElementById('aiInsights');

    const insights = [
        { severity: 'success', category: 'Savings', message: 'Great job! You saved 15% more this month.' },
        { severity: 'info', category: 'Investments', message: 'Your portfolio is performing well above market average.' },
        { severity: 'warning', category: 'Spending', message: 'Consider reducing dining expenses by 10%.' },
        { severity: 'success', category: 'ESG', message: '75% of your investments are ESG-aligned.' }
    ];

    let html = '<div class="mb-6"><h4 class="font-semibold text-gray-800 mb-3">Insights</h4>';

    insights.forEach(insight => {
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

    html += '<h4 class="font-semibold text-gray-800 mb-3">Recommendations</h4>';
    html += `
        <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 mb-2">
            <p class="font-medium text-sm">Diversification</p>
            <p class="text-sm text-gray-600">Consider adding bonds to balance your portfolio risk.</p>
        </div>
        <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 mb-2">
            <p class="font-medium text-sm">Emergency Fund</p>
            <p class="text-sm text-gray-600">Your emergency fund is well-funded at 6 months expenses.</p>
        </div>
    `;

    container.innerHTML = html;
}

document.getElementById('chatForm')?.addEventListener('submit', (e) => {
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

    // Simulate AI response
    setTimeout(() => {
        const responses = [
            "Based on your spending patterns, I recommend setting aside 20% of your income for savings.",
            "Your investments are performing well! Consider diversifying further to minimize risk.",
            "You have a healthy balance between spending and saving. Keep up the good work!",
            "I notice increased spending in the 'Shopping' category. Would you like me to set a budget alert?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        container.innerHTML += `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-robot text-purple-600"></i>
                </div>
                <div class="bg-gray-100 rounded-lg p-4 max-w-md">
                    <p class="text-gray-700">${randomResponse}</p>
                </div>
            </div>
        `;
        container.scrollTop = container.scrollHeight;
    }, 1000);
});

// Settings Functions
function loadSettings() {
    document.getElementById('settingsFirstName').value = dummyData.user.first_name;
    document.getElementById('settingsLastName').value = dummyData.user.last_name;
    document.getElementById('settingsEmail').value = dummyData.user.email;
    document.getElementById('settingsPhone').value = dummyData.user.phone;
    document.getElementById('twoFactorEnabled').checked = dummyData.user.two_factor_enabled === 1;
    document.getElementById('biometricEnabled').checked = dummyData.user.biometric_enabled === 1;
}

document.getElementById('profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Profile updated successfully! (Demo Mode)', 'success');
    updateUserInfo();
});

document.getElementById('passwordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Password changed successfully! (Demo Mode)', 'success');
    document.getElementById('passwordForm').reset();
});

document.getElementById('twoFactorEnabled')?.addEventListener('change', (e) => {
    showToast('Security settings updated (Demo Mode)', 'success');
});

document.getElementById('biometricEnabled')?.addEventListener('change', (e) => {
    showToast('Security settings updated (Demo Mode)', 'success');
});

// Modal Functions
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// Event Listeners for auth forms (kept but won't be used)
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Demo Mode - Login not required!', 'info');
});

document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Demo Mode - Registration not required!', 'info');
});

document.getElementById('transactionFilter')?.addEventListener('change', loadTransactions);
document.getElementById('categoryFilter')?.addEventListener('change', loadTransactions);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set dummy user
    currentUser = dummyData.user;

    // Show app directly (bypass auth)
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    updateUserInfo();
    showPage('dashboard');
});

// Close modal on outside click
document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});
