const express = require('express');
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database').getDB();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken, checkUserStatus);

// Get all transactions for user's accounts
router.get('/', async (req, res) => {
    try {
        const { limit = 50, offset = 0, category, account_id } = req.query;

        let sql = `
            SELECT 
                t.id,
                t.account_id,
                t.transaction_type,
                t.amount,
                t.balance_after,
                t.description,
                t.category,
                t.merchant_name,
                t.merchant_category,
                t.reference_number,
                t.status,
                t.is_recurring,
                t.recurring_frequency,
                t.location,
                t.notes,
                t.created_at,
                a.account_number,
                a.account_type,
                a.color
            FROM transactions t
            JOIN accounts a ON t.account_id = a.id
            WHERE a.user_id = ?
        `;

        const params = [req.user.userId];

        // Add filters
        if (category) {
            sql += ' AND t.category = ?';
            params.push(category);
        }

        if (account_id) {
            sql += ' AND t.account_id = ?';
            params.push(account_id);
        }

        sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const transactions = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Get total count
        let countSql = `
            SELECT COUNT(*) as total
            FROM transactions t
            JOIN accounts a ON t.account_id = a.id
            WHERE a.user_id = ?
        `;

        const countParams = [req.user.userId];
        if (category) {
            countSql += ' AND t.category = ?';
            countParams.push(category);
        }
        if (account_id) {
            countSql += ' AND t.account_id = ?';
            countParams.push(account_id);
        }

        const countResult = await new Promise((resolve, reject) => {
            db.get(countSql, countParams, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Calculate spending by category
        const categorySummary = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    category,
                    SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_spent,
                    COUNT(*) as transaction_count
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                WHERE a.user_id = ? 
                    AND t.transaction_type = 'debit'
                    AND t.created_at >= date('now', '-30 days')
                GROUP BY category
                ORDER BY total_spent DESC
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            transactions,
            total: countResult.total,
            categorySummary
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get transactions for specific account
router.get('/account/:accountId', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        // Verify account ownership
        const account = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM accounts WHERE id = ? AND user_id = ?', [req.params.accountId, req.user.userId], (err, row) => {
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

        const transactions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    id,
                    transaction_type,
                    amount,
                    balance_after,
                    description,
                    category,
                    merchant_name,
                    reference_number,
                    status,
                    is_recurring,
                    created_at
                FROM transactions 
                WHERE account_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `, [req.params.accountId, parseInt(limit), parseInt(offset)], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Error fetching account transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get transaction by ID
router.get('/:transactionId', async (req, res) => {
    try {
        const transaction = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    t.*,
                    a.account_number,
                    a.account_type
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                WHERE t.id = ? AND a.user_id = ?
            `, [req.params.transactionId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get spending analytics
router.get('/analytics/summary', async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const daysAgo = parseInt(period);

        // Total spending
        const totalSpent = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_debit,
                    SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as total_credit
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                WHERE a.user_id = ? 
                    AND t.created_at >= date('now', '-${daysAgo} days')
            `, [req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Spending by category
        const categoryBreakdown = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    category,
                    SUM(amount) as total,
                    COUNT(*) as count
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                WHERE a.user_id = ? 
                    AND t.transaction_type = 'debit'
                    AND t.created_at >= date('now', '-${daysAgo} days')
                GROUP BY category
                ORDER BY total DESC
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Daily spending trend (last 7 days)
        const dailyTrend = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    date(created_at) as date,
                    SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as spending
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                WHERE a.user_id = ? 
                    AND t.transaction_type = 'debit'
                    AND t.created_at >= date('now', '-7 days')
                GROUP BY date(created_at)
                ORDER BY date ASC
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            analytics: {
                period: daysAgo,
                totalDebit: totalSpent.total_debit || 0,
                totalCredit: totalSpent.total_credit || 0,
                netChange: (totalSpent.total_credit || 0) - (totalSpent.total_debit || 0),
                categoryBreakdown,
                dailyTrend
            }
        });
    } catch (error) {
        console.error('Error fetching transaction analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Add note to transaction
router.put('/:transactionId/note', async (req, res) => {
    try {
        const { note } = req.body;

        // Verify transaction ownership
        const transaction = await new Promise((resolve, reject) => {
            db.get(`
                SELECT t.id
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                WHERE t.id = ? AND a.user_id = ?
            `, [req.params.transactionId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        await new Promise((resolve, reject) => {
            db.run('UPDATE transactions SET notes = ? WHERE id = ?', [note, req.params.transactionId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({
            success: true,
            message: 'Note added successfully'
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
