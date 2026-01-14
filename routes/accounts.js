const express = require('express');
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database').getDB();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken, checkUserStatus);

// Get all accounts for authenticated user
router.get('/', async (req, res) => {
    try {
        const accounts = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    id,
                    account_type,
                    account_number,
                    routing_number,
                    balance,
                    available_balance,
                    currency,
                    status,
                    account_name,
                    is_primary,
                    color,
                    created_at
                FROM accounts 
                WHERE user_id = ? AND status = 'active'
                ORDER BY is_primary DESC, created_at ASC
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Calculate total balance
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        res.json({
            success: true,
            accounts,
            totalBalance
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get account details by ID
router.get('/:accountId', async (req, res) => {
    try {
        const account = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    id,
                    user_id,
                    account_type,
                    account_number,
                    routing_number,
                    balance,
                    available_balance,
                    currency,
                    status,
                    account_name,
                    is_primary,
                    color,
                    created_at
                FROM accounts 
                WHERE id = ? AND user_id = ?
            `, [req.params.accountId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        res.json({
            success: true,
            account
        });
    } catch (error) {
        console.error('Error fetching account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get primary account
router.get('/primary/details', async (req, res) => {
    try {
        const account = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    id,
                    account_type,
                    account_number,
                    routing_number,
                    balance,
                    available_balance,
                    currency,
                    status,
                    account_name,
                    is_primary,
                    color,
                    created_at
                FROM accounts 
                WHERE user_id = ? AND is_primary = 1
            `, [req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Primary account not found'
            });
        }

        res.json({
            success: true,
            account
        });
    } catch (error) {
        console.error('Error fetching primary account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Create new account (savings goal wrapper)
router.post('/', async (req, res) => {
    try {
        const { accountType, accountName, color } = req.body;

        // Generate account number
        const accountNumber = '****' + Math.floor(1000 + Math.random() * 9000);

        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, available_balance, account_name, is_primary, color)
                VALUES (?, ?, ?, '121000248', 0.00, 0.00, ?, 0, ?)
            `, [req.user.userId, accountType, accountName, color], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });

        const newAccount = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM accounts WHERE id = ?', [result.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            account: newAccount
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update account details
router.put('/:accountId', async (req, res) => {
    try {
        const { accountName, color } = req.body;

        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE accounts 
                SET account_name = ?, color = ?
                WHERE id = ? AND user_id = ?
            `, [accountName, color, req.params.accountId, req.user.userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const updatedAccount = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM accounts WHERE id = ?', [req.params.accountId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.json({
            success: true,
            message: 'Account updated successfully',
            account: updatedAccount
        });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete account (with checks)
router.delete('/:accountId', async (req, res) => {
    try {
        // Check if account has balance
        const account = await new Promise((resolve, reject) => {
            db.get('SELECT balance FROM accounts WHERE id = ? AND user_id = ?', [req.params.accountId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        if (account.balance !== 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete account with non-zero balance'
            });
        }

        await new Promise((resolve, reject) => {
            db.run('DELETE FROM accounts WHERE id = ? AND user_id = ?', [req.params.accountId, req.user.userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
