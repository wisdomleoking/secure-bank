const express = require('express');
const { authenticateToken, checkUserStatus } = require('../middleware/auth');
const db = require('../config/database').getDB();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken, checkUserStatus);

// Get AI insights and recommendations
router.get('/insights', async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const daysAgo = parseInt(period);

        // Get user's spending patterns
        const spendingData = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    category,
                    SUM(amount) as total_spent,
                    COUNT(*) as transaction_count,
                    AVG(amount) as avg_transaction
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                WHERE a.user_id = ? 
                    AND t.transaction_type = 'debit'
                    AND t.created_at >= date('now', '-${daysAgo} days')
                GROUP BY category
                ORDER BY total_spent DESC
            `, [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Get total income and expenses
        const financialSummary = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_expenses,
                    COUNT(CASE WHEN transaction_type = 'credit' THEN 1 END) as income_transactions,
                    COUNT(CASE WHEN transaction_type = 'debit' THEN 1 END) as expense_transactions
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                WHERE a.user_id = ? 
                    AND t.created_at >= date('now', '-${daysAgo} days')
            `, [req.user.userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        // Get savings goals
        const savingsGoals = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM savings_goals WHERE user_id = ? AND status = "active"', [req.user.userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Generate insights
        const insights = [];
        const recommendations = [];

        // Spending insights
        if (spendingData.length > 0) {
            const topCategory = spendingData[0];
            insights.push({
                type: 'spending',
                category: 'Top Spending Category',
                message: `Your highest spending category is "${topCategory.category}" with $${topCategory.total_spent.toFixed(2)} spent over the last ${daysAgo} days.`,
                severity: 'info'
            });

            // Check for unusually high spending in any category
            spendingData.forEach(cat => {
                if (cat.total_spent > financialSummary.total_income * 0.3) {
                    recommendations.push({
                        type: 'spending',
                        category: 'Spending Alert',
                        message: `Consider reviewing your ${cat.category} expenses. It accounts for ${((cat.total_spent / financialSummary.total_income) * 100).toFixed(1)}% of your income.`,
                        action: 'Review spending in ' + cat.category
                    });
                }
            });
        }

        // Income vs expenses
        if (financialSummary.total_income > 0) {
            const savingsRate = ((financialSummary.total_income - financialSummary.total_expenses) / financialSummary.total_income) * 100;

            insights.push({
                type: 'savings',
                category: 'Savings Rate',
                message: `Your savings rate is ${savingsRate.toFixed(1)}% over the last ${daysAgo} days.`,
                severity: savingsRate > 20 ? 'success' : savingsRate > 10 ? 'info' : 'warning'
            });

            if (savingsRate < 10) {
                recommendations.push({
                    type: 'savings',
                    category: 'Savings Recommendation',
                    message: 'Your savings rate is below 10%. Consider setting up automatic transfers to a savings account.',
                    action: 'Set up automatic savings'
                });
            }
        }

        // Savings goals progress
        savingsGoals.forEach(goal => {
            const progress = (goal.current_amount / goal.target_amount) * 100;

            if (progress < 25) {
                recommendations.push({
                    type: 'goal',
                    category: 'Savings Goal',
                    message: `Your "${goal.goal_name}" goal is only ${progress.toFixed(1)}% complete. Consider increasing your monthly contributions.`,
                    action: 'Increase contributions to ' + goal.goal_name
                });
            } else if (progress >= 75) {
                insights.push({
                    type: 'goal',
                    category: 'Goal Milestone',
                    message: `Great progress! Your "${goal.goal_name}" goal is ${progress.toFixed(1)}% complete!`,
                    severity: 'success'
                });
            }
        });

        // Transaction frequency insights
        if (financialSummary.expense_transactions > 100) {
            recommendations.push({
                type: 'spending',
                category: 'Transaction Frequency',
                message: `You made ${financialSummary.expense_transactions} expense transactions. Consider consolidating purchases to track spending better.`,
                action: 'Review transaction patterns'
            });
        }

        // Daily spending average
        const dailyAvg = financialSummary.total_expenses / daysAgo;
        insights.push({
            type: 'spending',
            category: 'Daily Average',
            message: `Your average daily spending is $${dailyAvg.toFixed(2)} over the last ${daysAgo} days.`,
            severity: 'info'
        });

        res.json({
            success: true,
            insights,
            recommendations,
            summary: {
                totalIncome: financialSummary.total_income || 0,
                totalExpenses: financialSummary.total_expenses || 0,
                netSavings: (financialSummary.total_income || 0) - (financialSummary.total_expenses || 0),
                savingsRate: financialSummary.total_income > 0
                    ? (((financialSummary.total_income - financialSummary.total_expenses) / financialSummary.total_income) * 100).toFixed(1)
                    : 0,
                period: daysAgo
            }
        });
    } catch (error) {
        console.error('Error fetching AI insights:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Chat with AI assistant
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // Analyze the user's message and provide relevant responses
        const response = await generateAIResponse(req.user.userId, message);

        res.json({
            success: true,
            response
        });
    } catch (error) {
        console.error('Error processing AI chat:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Generate AI response based on user query
async function generateAIResponse(userId, message) {
    const lowerMessage = message.toLowerCase();

    // Get relevant data based on query type
    if (lowerMessage.includes('balance') || lowerMessage.includes('money')) {
        const accounts = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM accounts WHERE user_id = ? AND status = "active"', [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        return {
            type: 'balance',
            message: `Your total balance across all accounts is $${totalBalance.toFixed(2)}. You have ${accounts.length} active account(s).`,
            data: {
                totalBalance,
                accountCount: accounts.length,
                accounts: accounts.map(a => ({ name: a.account_name, balance: a.balance }))
            }
        };
    }

    if (lowerMessage.includes('spending') || lowerMessage.includes('spent')) {
        const spending = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_spent
                FROM transactions t
                JOIN accounts a ON t.account_id = a.id
                WHERE a.user_id = ? 
                    AND t.created_at >= date('now', '-30 days')
            `, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        return {
            type: 'spending',
            message: `You've spent $${(spending.total_spent || 0).toFixed(2)} in the last 30 days.`,
            data: {
                totalSpent: spending.total_spent || 0,
                period: '30 days'
            }
        };
    }

    if (lowerMessage.includes('transfer') || lowerMessage.includes('send')) {
        return {
            type: 'transfer',
            message: 'To make a transfer, please provide the following details: source account, destination account, and amount.',
            data: {
                actionRequired: true,
                fields: ['fromAccount', 'toAccount', 'amount']
            }
        };
    }

    if (lowerMessage.includes('goal') || lowerMessage.includes('save')) {
        const goals = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM savings_goals WHERE user_id = ? AND status = "active"', [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const goalInfo = goals.map(g => ({
            name: g.goal_name,
            current: g.current_amount,
            target: g.target_amount,
            progress: ((g.current_amount / g.target_amount) * 100).toFixed(1)
        }));

        return {
            type: 'goals',
            message: goals.length > 0
                ? `You have ${goals.length} active savings goal(s). Here's your progress:`
                : 'You don\'t have any active savings goals. Would you like to create one?',
            data: {
                goals: goalInfo
            }
        };
    }

    if (lowerMessage.includes('investment') || lowerMessage.includes('invest')) {
        const investments = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM investments WHERE user_id = ?', [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
        const totalReturn = investments.reduce((sum, inv) => sum + (inv.change_value || 0), 0);

        return {
            type: 'investments',
            message: investments.length > 0
                ? `Your investment portfolio is worth $${totalValue.toFixed(2)} with a total return of $${totalReturn.toFixed(2)}.`
                : 'You don\'t have any investments yet. Would you like to start investing?',
            data: {
                totalValue,
                totalReturn,
                investmentCount: investments.length
            }
        };
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        return {
            type: 'help',
            message: 'I can help you with: checking balances, reviewing spending, making transfers, tracking savings goals, viewing investments, and getting financial insights. Just ask me anything!',
            data: {
                capabilities: [
                    'Check account balances',
                    'Review spending patterns',
                    'Make transfers',
                    'Track savings goals',
                    'View investment portfolio',
                    'Get financial insights'
                ]
            }
        };
    }

    // Default response
    return {
        type: 'general',
        message: 'I\'m here to help! You can ask me about your balance, spending, transfers, savings goals, or investments. For a full list of what I can do, type "help".',
        data: null
    };
}

module.exports = router;
