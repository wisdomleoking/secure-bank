const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database').getDB();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken, checkUserStatus);

// Get all transfers for user
router.get('/', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const transfers = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    t.id,
                    t.from_account_id,
                    t.to_account_id,
                    t.to_account_number,
                    t.to_bank_name,
                    t.to_account_holder_name,
                    t.amount,
                    t.transfer_type,
                    t.status,
                    t.scheduled_date,
                    t.completed_date,
                    t.reference_number,
                    t.notes,
                    t.created_at,
                    fa.account_number as from_account_number,
                    ta.account_number as to_account_number_internal
                FROM transfers t
                LEFT JOIN accounts fa ON t.from_account_id = fa.id
                LEFT JOIN accounts ta ON t.to_account_id = ta.id
                WHERE fa.user_id = ?
                ORDER BY t.created_at DESC
                LIMIT ? OFFSET ?
            `, [req.user.userId, parseInt(limit), parseInt(offset)], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            transfers
        });
    } catch (error) {
        console.error('Error fetching transfers:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Create new transfer
router.post('/', [
    body('fromAccountId').isInt(),
    body('amount').isFloat({ min: 0.01 }),
    body('transferType').isIn(['internal', 'external', 'wire', 'instant'])
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

        const {
            fromAccountId,
            toAccountId,
            toAccountNumber,
            toRoutingNumber,
            toBankName,
            toAccountHolderName,
            amount,
            transferType,
            scheduledDate,
            notes
        } = req.body;

        // Verify from account ownership and balance
        const fromAccount = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [fromAccountId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!fromAccount) {
            return res.status(404).json({
                success: false,
                message: 'Source account not found'
            });
        }

        if (fromAccount.available_balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient funds'
            });
        }

        // For internal transfers, verify to account
        let toAccountIdFinal = toAccountId;
        if (transferType === 'internal' && !toAccountIdFinal) {
            return res.status(400).json({
                success: false,
                message: 'Destination account ID is required for internal transfers'
            });
        }

        if (transferType === 'internal') {
            const toAccount = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [toAccountIdFinal, req.user.userId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!toAccount) {
                return res.status(404).json({
                    success: false,
                    message: 'Destination account not found'
                });
            }
        } else {
            // External transfers
            if (!toAccountNumber || !toRoutingNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Account number and routing number are required for external transfers'
                });
            }
        }

        // Generate reference number
        const referenceNumber = 'TXN' + Date.now() + Math.random().toString(36).substring(7);

        // Create transfer record
        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO transfers (
                    from_account_id, to_account_id, to_account_number, to_routing_number,
                    to_bank_name, to_account_holder_name, amount, transfer_type,
                    status, scheduled_date, reference_number, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
            `, [
                fromAccountId,
                toAccountIdFinal,
                toAccountNumber,
                toRoutingNumber,
                toBankName,
                toAccountHolderName,
                amount,
                transferType,
                scheduledDate,
                referenceNumber,
                notes
            ], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });

        // Process transfer immediately if no scheduled date
        if (!scheduledDate) {
            await processTransfer(result.id);
        }

        const transfer = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM transfers WHERE id = ?', [result.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.status(201).json({
            success: true,
            message: 'Transfer created successfully',
            transfer
        });
    } catch (error) {
        console.error('Error creating transfer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Process transfer (internal function)
async function processTransfer(transferId) {
    return new Promise(async (resolve, reject) => {
        try {
            const transfer = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM transfers WHERE id = ?', [transferId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!transfer) {
                return reject(new Error('Transfer not found'));
            }

            if (transfer.status !== 'pending') {
                return resolve();
            }

            // Deduct from source account
            await new Promise((resolve, reject) => {
                db.run(`
                    UPDATE accounts 
                    SET balance = balance - ?, available_balance = available_balance - ?
                    WHERE id = ?
                `, [transfer.amount, transfer.amount, transfer.from_account_id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Create debit transaction for source account
            const refNumber = 'TXN' + Date.now();
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO transactions (
                        account_id, transaction_type, amount, balance_after,
                        description, category, reference_number, status
                    )
                    SELECT id, 'debit', ?, balance,
                           ?, 'Transfer', ?, 'completed'
                    FROM accounts WHERE id = ?
                `, [transfer.amount, `Transfer to ${transfer.to_bank_name || 'account'}`, refNumber, transfer.from_account_id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // For internal transfers, credit destination account
            if (transfer.transfer_type === 'internal' && transfer.to_account_id) {
                await new Promise((resolve, reject) => {
                    db.run(`
                        UPDATE accounts 
                        SET balance = balance + ?, available_balance = available_balance + ?
                        WHERE id = ?
                    `, [transfer.amount, transfer.amount, transfer.to_account_id], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Create credit transaction for destination account
                await new Promise((resolve, reject) => {
                    db.run(`
                        INSERT INTO transactions (
                            account_id, transaction_type, amount, balance_after,
                            description, category, reference_number, status
                        )
                        SELECT id, 'credit', ?, balance,
                               ?, 'Transfer', ?, 'completed'
                        FROM accounts WHERE id = ?
                    `, [transfer.amount, 'Transfer from account', refNumber, transfer.to_account_id], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }

            // Update transfer status
            await new Promise((resolve, reject) => {
                db.run(`
                    UPDATE transfers 
                    SET status = 'completed', completed_date = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [transferId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            resolve();
        } catch (error) {
            console.error('Error processing transfer:', error);
            reject(error);
        }
    });
}

// Get transfer by ID
router.get('/:transferId', async (req, res) => {
    try {
        const transfer = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    t.*,
                    fa.account_number as from_account_number,
                    ta.account_number as to_account_number_internal
                FROM transfers t
                LEFT JOIN accounts fa ON t.from_account_id = fa.id
                LEFT JOIN accounts ta ON t.to_account_id = ta.id
                WHERE t.id = ? AND fa.user_id = ?
            `, [req.params.transferId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!transfer) {
            return res.status(404).json({
                success: false,
                message: 'Transfer not found'
            });
        }

        res.json({
            success: true,
            transfer
        });
    } catch (error) {
        console.error('Error fetching transfer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Cancel pending transfer
router.post('/:transferId/cancel', async (req, res) => {
    try {
        const transfer = await new Promise((resolve, reject) => {
            db.get(`
                SELECT t.*
                FROM transfers t
                JOIN accounts fa ON t.from_account_id = fa.id
                WHERE t.id = ? AND fa.user_id = ?
            `, [req.params.transferId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!transfer) {
            return res.status(404).json({
                success: false,
                message: 'Transfer not found'
            });
        }

        if (transfer.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending transfers can be cancelled'
            });
        }

        await new Promise((resolve, reject) => {
            db.run("UPDATE transfers SET status = 'cancelled' WHERE id = ?", [req.params.transferId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({
            success: true,
            message: 'Transfer cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling transfer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
