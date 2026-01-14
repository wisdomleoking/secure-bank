const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database').getDB();
const PDFDocument = require('pdfkit');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken, checkUserStatus);

// Get all statements for user
router.get('/', async (req, res) => {
    try {
        const statements = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    s.id,
                    s.statement_type,
                    s.statement_period_start,
                    s.statement_period_end,
                    s.account_id,
                    s.total_credits,
                    s.total_debits,
                    s.starting_balance,
                    s.ending_balance,
                    s.file_path,
                    s.created_at,
                    a.account_number,
                    a.account_type,
                    a.account_name
                FROM statements s
                JOIN accounts a ON s.account_id = a.id
                WHERE a.user_id = ?
                ORDER BY s.statement_period_end DESC
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            statements
        });
    } catch (error) {
        console.error('Error fetching statements:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get statement by ID
router.get('/:statementId', async (req, res) => {
    try {
        const statement = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    s.*,
                    a.account_number,
                    a.account_type,
                    a.account_name,
                    a.user_id
                FROM statements s
                JOIN accounts a ON s.account_id = a.id
                WHERE s.id = ? AND a.user_id = ?
            `, [req.params.statementId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!statement) {
            return res.status(404).json({
                success: false,
                message: 'Statement not found'
            });
        }

        // Get transactions for statement period
        const transactions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    t.id,
                    t.transaction_type,
                    t.amount,
                    t.description,
                    t.category,
                    t.created_at
                FROM transactions t
                WHERE t.account_id = ?
                    AND t.created_at >= ?
                    AND t.created_at <= ?
                ORDER BY t.created_at DESC
            `, [statement.account_id, statement.statement_period_start, statement.statement_period_end], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            statement,
            transactions
        });
    } catch (error) {
        console.error('Error fetching statement:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Generate new statement
router.post('/generate', [
    body('accountId').isInt(),
    body('periodStart').isISO8601(),
    body('periodEnd').isISO8601()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { accountId, periodStart, periodEnd, statementType = 'monthly' } = req.body;

        // Verify account ownership
        const account = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [accountId, req.user.userId], (err, row) => {
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

        // Get transactions for period
        const transactions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM transactions
                WHERE account_id = ?
                    AND created_at >= ?
                    AND created_at <= ?
                ORDER BY created_at ASC
            `, [accountId, periodStart, periodEnd], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Calculate totals
        const totalCredits = transactions
            .filter(t => t.transaction_type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalDebits = transactions
            .filter(t => t.transaction_type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const startingBalance = account.balance - totalCredits + totalDebits;
        const endingBalance = account.balance;

        // Create statement record
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO statements (
                    account_id, statement_type, statement_period_start, statement_period_end,
                    total_credits, total_debits, starting_balance, ending_balance, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'generated')
            `, [
                accountId,
                statementType,
                periodStart,
                periodEnd,
                totalCredits,
                totalDebits,
                startingBalance,
                endingBalance
            ], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });

        const newStatement = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM statements WHERE id = ?', [result.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.status(201).json({
            success: true,
            message: 'Statement generated successfully',
            statement: newStatement,
            transactions
        });
    } catch (error) {
        console.error('Error generating statement:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Download statement as PDF
router.get('/:statementId/download', async (req, res) => {
    try {
        const statement = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    s.*,
                    a.account_number,
                    a.account_type,
                    a.account_name,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.address,
                    u.city,
                    u.state,
                    u.zip
                FROM statements s
                JOIN accounts a ON s.account_id = a.id
                JOIN users u ON a.user_id = u.id
                WHERE s.id = ? AND a.user_id = ?
            `, [req.params.statementId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!statement) {
            return res.status(404).json({
                success: false,
                message: 'Statement not found'
            });
        }

        // Get transactions for statement
        const transactions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM transactions
                WHERE account_id = ?
                    AND created_at >= ?
                    AND created_at <= ?
                ORDER BY created_at ASC
            `, [statement.account_id, statement.statement_period_start, statement.statement_period_end], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Generate PDF
        const doc = new PDFDocument();
        const filename = `statement_${statement.id}_${Date.now()}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('Bank Statement', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Statement Period: ${statement.statement_period_start} to ${statement.statement_period_end}`);
        doc.text(`Account: ${statement.account_name} (${statement.account_number})`);
        doc.text(`Account Type: ${statement.account_type}`);
        doc.moveDown();
        doc.text(`Account Holder: ${statement.first_name} ${statement.last_name}`);
        doc.text(`Email: ${statement.email}`);
        if (statement.address) {
            doc.text(`Address: ${statement.address}, ${statement.city}, ${statement.state} ${statement.zip}`);
        }
        doc.moveDown();

        // Summary
        doc.fontSize(14).text('Summary');
        doc.fontSize(12);
        doc.text(`Starting Balance: $${statement.starting_balance.toFixed(2)}`);
        doc.text(`Total Credits: $${statement.total_credits.toFixed(2)}`);
        doc.text(`Total Debits: $${statement.total_debits.toFixed(2)}`);
        doc.text(`Ending Balance: $${statement.ending_balance.toFixed(2)}`);
        doc.moveDown();

        // Transactions table
        doc.fontSize(14).text('Transactions');
        doc.fontSize(10);

        let y = doc.y;
        doc.text('Date', 50, y);
        doc.text('Description', 150, y);
        doc.text('Type', 350, y);
        doc.text('Amount', 450, y, { align: 'right' });
        y += 20;

        transactions.forEach(t => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
            doc.text(new Date(t.created_at).toLocaleDateString(), 50, y);
            doc.text(t.description.substring(0, 30), 150, y);
            doc.text(t.transaction_type, 350, y);
            const amountStr = `$${t.amount.toFixed(2)}`;
            doc.text(amountStr, 500, y, { align: 'right' });
            y += 20;
        });

        doc.end();
    } catch (error) {
        console.error('Error downloading statement:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get transaction categories summary for statement period
router.get('/summary/categories', async (req, res) => {
    try {
        const { accountId, startDate, endDate } = req.query;

        // Verify account ownership
        const account = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM accounts WHERE id = ? AND user_id = ?', [accountId, req.user.userId], (err, row) => {
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

        const categorySummary = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    category,
                    SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_spent,
                    SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as total_received,
                    COUNT(*) as transaction_count
                FROM transactions
                WHERE account_id = ?
                    AND created_at >= ?
                    AND created_at <= ?
                GROUP BY category
                ORDER BY total_spent DESC
            `, [accountId, startDate, endDate], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            summary: categorySummary
        });
    } catch (error) {
        console.error('Error fetching category summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
