const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

let db;

// Initialize database connection
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Use in-memory database for Vercel/serverless environments
        // Use file-based database for local development
        const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

        if (isVercel) {
            console.log('🚀 Detected Vercel environment - using in-memory database');
            db = new sqlite3.Database(':memory:', (err) => {
                if (err) {
                    console.error('Error opening in-memory database:', err);
                    reject(err);
                } else {
                    console.log('✅ Connected to in-memory SQLite database');
                    createTables()
                        .then(() => seedInitialData())
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        } else {
            // Local development - use file-based database
            const dbPath = path.join(__dirname, '../data/securebank.db');
            console.log('💻 Local development - using file-based database');
            db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database file');
                    createTables()
                        .then(() => seedInitialData())
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        }
    });
}

// Create all necessary tables
function createTables() {
    return new Promise((resolve, reject) => {
        const tables = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                phone TEXT,
                date_of_birth TEXT,
                address TEXT,
                city TEXT,
                state TEXT,
                zip TEXT,
                country TEXT DEFAULT 'USA',
                profile_pic TEXT,
                security_score INTEGER DEFAULT 85,
                is_active INTEGER DEFAULT 1,
                is_verified INTEGER DEFAULT 0,
                two_factor_enabled INTEGER DEFAULT 0,
                biometric_enabled INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Accounts table
            `CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                account_type TEXT NOT NULL,
                account_number TEXT UNIQUE NOT NULL,
                routing_number TEXT,
                balance REAL DEFAULT 0.00,
                available_balance REAL DEFAULT 0.00,
                currency TEXT DEFAULT 'USD',
                status TEXT DEFAULT 'active',
                account_name TEXT,
                is_primary INTEGER DEFAULT 0,
                color TEXT DEFAULT 'blue',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // Transactions table
            `CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL,
                transaction_type TEXT NOT NULL,
                amount REAL NOT NULL,
                balance_after REAL,
                description TEXT,
                category TEXT,
                merchant_name TEXT,
                merchant_category TEXT,
                reference_number TEXT UNIQUE,
                status TEXT DEFAULT 'completed',
                is_recurring INTEGER DEFAULT 0,
                recurring_frequency TEXT,
                location TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(id)
            )`,

            // Cards table
            `CREATE TABLE IF NOT EXISTS cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL,
                card_number_encrypted TEXT NOT NULL,
                card_type TEXT NOT NULL,
                card_brand TEXT NOT NULL,
                expiry_date TEXT NOT NULL,
                cvv_encrypted TEXT,
                cardholder_name TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                is_frozen INTEGER DEFAULT 0,
                daily_limit REAL DEFAULT 1000.00,
                online_enabled INTEGER DEFAULT 1,
                international_enabled INTEGER DEFAULT 1,
                atm_enabled INTEGER DEFAULT 1,
                virtual_card_available INTEGER DEFAULT 0,
                pin_set INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(id)
            )`,

            // Transfers table
            `CREATE TABLE IF NOT EXISTS transfers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_account_id INTEGER NOT NULL,
                to_account_id INTEGER,
                to_account_number TEXT,
                to_routing_number TEXT,
                to_bank_name TEXT,
                to_account_holder_name TEXT,
                amount REAL NOT NULL,
                transfer_type TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                scheduled_date DATETIME,
                completed_date DATETIME,
                reference_number TEXT UNIQUE,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (from_account_id) REFERENCES accounts(id)
            )`,

            // Investments table
            `CREATE TABLE IF NOT EXISTS investments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                investment_type TEXT NOT NULL,
                symbol TEXT,
                name TEXT NOT NULL,
                quantity REAL,
                average_cost REAL,
                current_price REAL,
                current_value REAL,
                change_percent REAL,
                change_value REAL,
                is_esg INTEGER DEFAULT 0,
                sector TEXT,
                asset_class TEXT,
                risk_level TEXT DEFAULT 'moderate',
                purchased_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // Savings goals table
            `CREATE TABLE IF NOT EXISTS savings_goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                target_amount REAL NOT NULL,
                current_amount REAL DEFAULT 0.00,
                target_date TEXT,
                color TEXT DEFAULT 'blue',
                icon TEXT,
                status TEXT DEFAULT 'active',
                auto_contribute INTEGER DEFAULT 0,
                auto_contribute_amount REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // Subscriptions table
            `CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                frequency TEXT NOT NULL,
                next_charge_date TEXT,
                category TEXT,
                logo_url TEXT,
                is_active INTEGER DEFAULT 1,
                auto_renew INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // AI insights table
            `CREATE TABLE IF NOT EXISTS ai_insights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                insight_type TEXT NOT NULL,
                message TEXT NOT NULL,
                priority TEXT DEFAULT 'medium',
                action_taken INTEGER DEFAULT 0,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // Notifications table
            `CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                action_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // Login history table
            `CREATE TABLE IF NOT EXISTS login_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                location TEXT,
                login_method TEXT,
                success INTEGER NOT NULL,
                failure_reason TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // Security events table
            `CREATE TABLE IF NOT EXISTS security_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                description TEXT,
                severity TEXT DEFAULT 'low',
                ip_address TEXT,
                user_agent TEXT,
                resolved INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // ESG data table
            `CREATE TABLE IF NOT EXISTS esg_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                carbon_footprint REAL DEFAULT 0,
                sustainable_spending REAL DEFAULT 0,
                green_investments REAL DEFAULT 0,
                monthly_trend REAL DEFAULT 0,
                esg_score REAL DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,

            // Recipients table (for quick transfers)
            `CREATE TABLE IF NOT EXISTS recipients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                account_number TEXT NOT NULL,
                routing_number TEXT,
                bank_name TEXT,
                transfer_method TEXT DEFAULT 'ach',
                email TEXT,
                phone TEXT,
                is_favorite INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`
        ];

        let completed = 0;
        tables.forEach((tableSql, index) => {
            db.run(tableSql, (err) => {
                if (err) {
                    console.error(`Error creating table ${index + 1}:`, err);
                    reject(err);
                } else {
                    completed++;
                    if (completed === tables.length) {
                        console.log(`✅ Created ${completed} database tables`);
                        resolve();
                    }
                }
            });
        });
    });
}

// Seed initial demo data
function seedInitialData() {
    return new Promise((resolve, reject) => {
        // Check if data already exists
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
            if (err) return reject(err);

            if (row.count > 0) {
                console.log('✅ Database already seeded');
                return resolve();
            }

            // Hash demo password
            bcrypt.hash('demo2025', 10, (err, hashedPassword) => {
                if (err) return reject(err);

                // Insert demo user
                const userInsert = `
                    INSERT INTO users (email, password, first_name, last_name, phone, address, city, state, zip, profile_pic, is_verified)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.run(userInsert, [
                    'john.anderson@email.com',
                    hashedPassword,
                    'John',
                    'Anderson',
                    '+1 (555) 123-4567',
                    '123 Main Street, Apt 4B',
                    'San Francisco',
                    'CA',
                    '94102',
                    'JA',
                    1
                ], function (err) {
                    if (err) return reject(err);

                    const userId = this.lastID;

                    // Insert demo accounts
                    const accounts = [
                        [userId, 'Checking', '****7892', '121000248', 5420.50, 5420.50, 'My Checking', 1, 'blue'],
                        [userId, 'Savings', '****4521', '121000248', 12350.75, 12350.75, 'Emergency Fund', 0, 'green'],
                        [userId, 'Credit Card', '****9103', '121000248', -850.25, 4649.75, 'Visa Platinum', 0, 'purple'],
                        [userId, 'Investment', '****6734', '121000248', 24500.00, 24500.00, 'Brokerage', 0, 'orange']
                    ];

                    const accountInsert = `
                        INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, available_balance, account_name, is_primary, color)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    let accountsInserted = 0;
                    accounts.forEach(account => {
                        db.run(accountInsert, account, function (err) {
                            if (err) return reject(err);
                            accountsInserted++;

                            if (accountsInserted === accounts.length) {
                                // Insert demo transactions
                                seedTransactions(userId, accountsInserted)
                                    .then(() => seedCards(userId))
                                    .then(() => seedInvestments(userId))
                                    .then(() => seedSavingsGoals(userId))
                                    .then(() => seedSubscriptions(userId))
                                    .then(() => seedAIInsights(userId))
                                    .then(() => seedESGData(userId))
                                    .then(() => {
                                        console.log('✅ Database seeded with demo data');
                                        resolve();
                                    })
                                    .catch(reject);
                            }
                        });
                    });
                });
            });
        });
    });
}

function seedTransactions(userId, accountId) {
    return new Promise((resolve, reject) => {
        const transactions = [
            [1, 'debit', 45.99, 5374.51, 'Amazon Purchase', 'Shopping', 'Amazon.com'],
            [1, 'credit', 3500.00, 8874.51, 'Salary Deposit', 'Income', 'ABC Corp'],
            [2, 'debit', 120.45, 12230.30, 'Grocery Store', 'Food', 'Whole Foods'],
            [1, 'debit', 85.00, 5289.51, 'Electric Bill', 'Utilities', 'PG&E'],
            [1, 'debit', 200.00, 5089.51, 'ATM Withdrawal', 'Cash', 'Chase ATM'],
            [1, 'debit', 15.99, 5073.52, 'Netflix Subscription', 'Entertainment', 'Netflix'],
            [1, 'debit', 78.50, 4995.02, 'Restaurant Dinner', 'Dining', 'Italian Bistro'],
            [4, 'credit', 245.00, 24745.00, 'Stock Dividend', 'Investment', 'VOO ETF']
        ];

        const transactionInsert = `
            INSERT INTO transactions (account_id, transaction_type, amount, balance_after, description, category, merchant_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        let inserted = 0;
        transactions.forEach(t => {
            db.run(transactionInsert, t, (err) => {
                if (err) return reject(err);
                inserted++;
                if (inserted === transactions.length) resolve();
            });
        });
    });
}

function seedCards(userId) {
    return new Promise((resolve, reject) => {
        const cards = [
            [1, '****4532', 'Debit', 'Visa', '06/26', 'JOHN ANDERSON'],
            [2, '****8891', 'Credit', 'Mastercard', '09/27', 'JOHN ANDERSON'],
            [1, '****1234', 'Debit', 'Visa', '12/25', 'JOHN ANDERSON']
        ];

        const cardInsert = `
            INSERT INTO cards (account_id, card_number_encrypted, card_type, card_brand, expiry_date, cardholder_name)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        let inserted = 0;
        cards.forEach(card => {
            db.run(cardInsert, card, (err) => {
                if (err) return reject(err);
                inserted++;
                if (inserted === cards.length) resolve();
            });
        });
    });
}

function seedInvestments(userId) {
    return new Promise((resolve, reject) => {
        const investments = [
            [userId, 'ETF', 'VOO', 'S&P 500 ETF', 50, 220.00, 270.50, 13525.00, 15.2, 1750.00, 1, 'Large Cap', 'Stock'],
            [userId, 'Mutual Fund', 'TGF', 'Tech Growth Fund', 100, 85.00, 104.25, 10425.00, 22.5, 1925.00, 0, 'Technology', 'Stock'],
            [userId, 'Stock', 'AAPL', 'Apple Inc.', 10, 150.00, 178.50, 1785.00, 8.7, 150.00, 0, 'Technology', 'Stock'],
            [userId, 'ETF', 'ICLN', 'Green Energy ETF', 50, 36.00, 35.16, 1758.00, -2.3, -42.00, 1, 'Energy', 'Stock']
        ];

        const investmentInsert = `
            INSERT INTO investments (user_id, investment_type, symbol, name, quantity, average_cost, current_price, current_value, change_percent, change_value, is_esg, sector, asset_class)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let inserted = 0;
        investments.forEach(inv => {
            db.run(investmentInsert, inv, (err) => {
                if (err) return reject(err);
                inserted++;
                if (inserted === investments.length) resolve();
            });
        });
    });
}

function seedSavingsGoals(userId) {
    return new Promise((resolve, reject) => {
        const goals = [
            [userId, 'Tahiti Trip', 5000.00, 3200.00, '2025-06-01', 'teal'],
            [userId, 'New Laptop', 1500.00, 800.00, '2025-03-01', 'blue'],
            [userId, 'Emergency Fund', 10000.00, 7500.00, null, 'green']
        ];

        const goalInsert = `
            INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date, color)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        let inserted = 0;
        goals.forEach(goal => {
            db.run(goalInsert, goal, (err) => {
                if (err) return reject(err);
                inserted++;
                if (inserted === goals.length) resolve();
            });
        });
    });
}

function seedSubscriptions(userId) {
    return new Promise((resolve, reject) => {
        const subscriptions = [
            [userId, 'Netflix', 'Streaming service', 15.99, 'USD', 'monthly', '2025-01-15', 'Entertainment', 1, 1],
            [userId, 'Spotify', 'Music streaming', 10.99, 'USD', 'monthly', '2025-01-15', 'Entertainment', 1, 1],
            [userId, 'Amazon Prime', 'Prime membership', 12.99, 'USD', 'yearly', '2025-02-15', 'Shopping', 1, 1],
            [userId, 'Adobe Creative', 'Creative suite', 52.99, 'USD', 'monthly', '2025-01-15', 'Software', 0, 1]
        ];

        const subInsert = `
            INSERT INTO subscriptions (user_id, name, description, price, currency, frequency, next_charge_date, category, is_active, auto_renew)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let inserted = 0;
        subscriptions.forEach(sub => {
            db.run(subInsert, sub, (err) => {
                if (err) return reject(err);
                inserted++;
                if (inserted === subscriptions.length) resolve();
            });
        });
    });
}

function seedAIInsights(userId) {
    return new Promise((resolve, reject) => {
        const insights = [
            [userId, 'spending', 'You spent 20% more on dining this month. Want to set a budget?', 'medium', 0, 0],
            [userId, 'savings', 'Based on your income, you could save $300 more this month by reducing subscriptions.', 'high', 0, 0],
            [userId, 'security', 'Your security score improved! Enable 2FA for maximum protection.', 'high', 0, 0]
        ];

        const insightInsert = `
            INSERT INTO ai_insights (user_id, insight_type, message, priority, action_taken, is_read)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        let inserted = 0;
        insights.forEach(insight => {
            db.run(insightInsert, insight, (err) => {
                if (err) return reject(err);
                inserted++;
                if (inserted === insights.length) resolve();
            });
        });
    });
}

function seedESGData(userId) {
    return new Promise((resolve, reject) => {
        const esgInsert = `
            INSERT INTO esg_data (user_id, carbon_footprint, sustainable_spending, green_investments, monthly_trend, esg_score)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(esgInsert, [userId, 342.00, 428.00, 12500.00, -12.00, 8.2], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

// Get database instance
function getDB() {
    return db;
}

module.exports = {
    initializeDatabase,
    getDB
};
