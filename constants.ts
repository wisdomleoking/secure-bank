
import { UserData } from './types';

export const INITIAL_USER_DATA: UserData = {
    name: 'Jennifer Aniston',
    email: 'john.anderson@email.com',
    profilePic: 'JA',
    securityScore: 85,
    accounts: [
        { id: 1, type: 'Checking', balance: 1250487.63, accountNum: '****7892', color: 'blue' },
        { id: 2, type: 'Savings', balance: 12350.75, accountNum: '****4521', color: 'green' },
        { id: 3, type: 'Credit Card', balance: 0.25, accountNum: '****9103', color: 'purple' },
        { id: 4, type: 'Investment', balance: 24500.00, accountNum: '****6734', color: 'orange' }
    ],
    recentTransactions: [
        { id: 1, date: '2024-12-17', description: 'Amazon Purchase', amount: -45.99, category: 'Shopping', status: 'completed' },
        { id: 2, date: '2024-12-16', description: 'Salary Deposit', amount: 3500.00, category: 'Income', status: 'completed' },
        { id: 3, date: '2024-12-15', description: 'Grocery Store', amount: -120.45, category: 'Food', status: 'completed' },
        { id: 4, date: '2024-12-14', description: 'Electric Bill', amount: -85.00, category: 'Utilities', status: 'pending' },
        { id: 5, date: '2024-12-13', description: 'ATM Withdrawal', amount: -200.00, category: 'Cash', status: 'completed' },
        { id: 6, date: '2024-12-12', description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', status: 'completed' },
        { id: 7, date: '2024-12-11', description: 'Restaurant Dinner', amount: -78.50, category: 'Dining', status: 'completed' },
        { id: 8, date: '2024-12-10', description: 'Stock Dividend', amount: 245.00, category: 'Investment', status: 'completed' }
    ],
    savingsGoals: [
        { id: 1, name: 'Tahiti Trip', target: 5000, current: 3200, color: 'teal' },
        { id: 2, name: 'New Laptop', target: 1500, current: 800, color: 'blue' },
        { id: 3, name: 'Emergency Fund', target: 10000, current: 7500, color: 'green' }
    ],
    aiInsights: [
        { id: 1, type: 'spending', message: 'You spent 20% more on dining this month. Want to set a budget?', date: '2024-12-17' },
        { id: 2, type: 'savings', message: 'Based on your income, you could save $300 more this month by reducing subscriptions.', date: '2024-12-16' },
        { id: 3, type: 'security', message: 'Your security score improved! Enable 2FA for maximum protection.', date: '2024-12-15' }
    ],
    cards: [
        { id: 1, type: 'Visa', number: '**** 4532', expiry: '06/26', status: 'active', frozen: false },
        { id: 2, type: 'Mastercard', number: '**** 8891', expiry: '09/27', status: 'active', frozen: false },
        { id: 3, type: 'Debit', number: '**** 1234', expiry: '12/25', status: 'active', frozen: false }
    ],
    esgData: {
        carbonFootprint: 342,
        sustainableSpending: 428,
        greenInvestments: 12500,
        monthlyTrend: -12
    }
};
