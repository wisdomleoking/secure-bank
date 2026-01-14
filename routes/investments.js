const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database').getDB();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken, checkUserStatus);

// Get all investments for user
router.get('/', async (req, res) => {
    try {
        const { esg_only } = req.query;

        let sql = 'SELECT * FROM investments WHERE user_id = ?';
        const params = [req.user.userId];

        if (esg_only === 'true') {
            sql += ' AND is_esg = 1';
        }

        sql += ' ORDER BY current_value DESC';

        const investments = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Calculate totals
        const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
        const totalCost = investments.reduce((sum, inv) => sum + ((inv.quantity || 0) * (inv.average_cost || 0)), 0);
        const totalChange = investments.reduce((sum, inv) => sum + (inv.change_value || 0), 0);
        const esgValue = investments.filter(inv => inv.is_esg === 1).reduce((sum, inv) => sum + (inv.current_value || 0), 0);

        res.json({
            success: true,
            investments,
            summary: {
                totalValue,
                totalCost,
                totalChange,
                totalReturn: totalValue - totalCost,
                totalReturnPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost * 100) : 0,
                esgValue,
                esgPercentage: totalValue > 0 ? (esgValue / totalValue * 100) : 0,
                count: investments.length,
                esgCount: investments.filter(inv => inv.is_esg === 1).length
            }
        });
    } catch (error) {
        console.error('Error fetching investments:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get investment by ID
router.get('/:investmentId', async (req, res) => {
    try {
        const investment = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM investments WHERE id = ? AND user_id = ?', [req.params.investmentId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        res.json({
            success: true,
            investment
        });
    } catch (error) {
        console.error('Error fetching investment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Create new investment
router.post('/', [
    body('investmentType').isIn(['Stock', 'ETF', 'Mutual Fund', 'Bond', 'Crypto', 'Real Estate']),
    body('name').trim().isLength({ min: 2 }),
    body('quantity').isFloat({ min: 0 }),
    body('averageCost').isFloat({ min: 0 }),
    body('riskLevel').optional().isIn(['low', 'moderate', 'high'])
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
            investmentType,
            symbol,
            name,
            quantity,
            averageCost,
            isEsg,
            sector,
            assetClass,
            riskLevel
        } = req.body;

        const currentPrice = averageCost; // In production, fetch from real API
        const currentValue = quantity * currentPrice;
        const changeValue = 0;
        const changePercent = 0;

        const result = await new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO investments (
                    user_id, investment_type, symbol, name, quantity,
                    average_cost, current_price, current_value, change_percent,
                    change_value, is_esg, sector, asset_class, risk_level,
                    purchased_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [
                req.user.userId,
                investmentType,
                symbol,
                name,
                quantity,
                averageCost,
                currentPrice,
                currentValue,
                changePercent,
                changeValue,
                isEsg ? 1 : 0,
                sector,
                assetClass,
                riskLevel || 'moderate'
            ], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });

        const newInvestment = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM investments WHERE id = ?', [result.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.status(201).json({
            success: true,
            message: 'Investment added successfully',
            investment: newInvestment
        });
    } catch (error) {
        console.error('Error creating investment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update investment
router.put('/:investmentId', async (req, res) => {
    try {
        const { quantity, averageCost, currentPrice } = req.body;

        // Verify ownership
        const investment = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM investments WHERE id = ? AND user_id = ?', [req.params.investmentId, req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        const updates = [];
        const values = [];

        if (quantity !== undefined) {
            updates.push('quantity = ?');
            values.push(quantity);
        }
        if (averageCost !== undefined) {
            updates.push('average_cost = ?');
            values.push(averageCost);
        }
        if (currentPrice !== undefined) {
            updates.push('current_price = ?');
            values.push(currentPrice);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(req.params.investmentId);

        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE investments 
                SET ${updates.join(', ')}, 
                    current_value = quantity * current_price,
                    change_value = (current_price - average_cost) * quantity,
                    change_percent = ((current_price - average_cost) / average_cost * 100),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, values, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const updatedInvestment = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM investments WHERE id = ?', [req.params.investmentId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.json({
            success: true,
            message: 'Investment updated successfully',
            investment: updatedInvestment
        });
    } catch (error) {
        console.error('Error updating investment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete investment
router.delete('/:investmentId', async (req, res) => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.run('DELETE FROM investments WHERE id = ? AND user_id = ?', [req.params.investmentId, req.user.userId], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        if (result === 0) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        res.json({
            success: true,
            message: 'Investment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting investment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get investment performance analytics
router.get('/analytics/performance', async (req, res) => {
    try {
        const { period = '30' } = req.query;

        // Get investment allocation by type
        const allocationByType = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    investment_type,
                    SUM(current_value) as total_value,
                    COUNT(*) as count
                FROM investments
                WHERE user_id = ?
                GROUP BY investment_type
                ORDER BY total_value DESC
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Get sector allocation
        const allocationBySector = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    sector,
                    SUM(current_value) as total_value
                FROM investments
                WHERE user_id = ? AND sector IS NOT NULL
                GROUP BY sector
                ORDER BY total_value DESC
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Get ESG allocation
        const esgAllocation = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    SUM(CASE WHEN is_esg = 1 THEN current_value ELSE 0 END) as esg_value,
                    SUM(current_value) as total_value
                FROM investments
                WHERE user_id = ?
            `, [req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Get top performers
        const topPerformers = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM investments
                WHERE user_id = ?
                ORDER BY change_percent DESC
                LIMIT 5
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Get worst performers
        const worstPerformers = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM investments
                WHERE user_id = ?
                ORDER BY change_percent ASC
                LIMIT 5
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            success: true,
            analytics: {
                allocationByType,
                allocationBySector,
                esgAllocation: {
                    esgValue: esgAllocation.esg_value || 0,
                    totalValue: esgAllocation.total_value || 0,
                    esgPercentage: esgAllocation.total_value > 0
                        ? (esgAllocation.esg_value / esgAllocation.total_value * 100)
                        : 0
                },
                topPerformers,
                worstPerformers
            }
        });
    } catch (error) {
        console.error('Error fetching investment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
