
export type AccountColor = 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'emerald';

export interface Account {
  id: number;
  type: string;
  balance: number;
  accountNum: string;
  color: AccountColor;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'completed' | 'pending';
}

export interface SavingsGoal {
  id: number;
  name: string;
  target: number;
  current: number;
  color: AccountColor;
}

export interface Card {
  id: number;
  type: string;
  number: string;
  expiry: string;
  status: string;
  frozen: boolean;
}

export interface AIInsight {
  id: number;
  type: 'spending' | 'savings' | 'security';
  message: string;
  date: string;
}

export interface UserData {
  name: string;
  email: string;
  profilePic: string;
  securityScore: number;
  accounts: Account[];
  recentTransactions: Transaction[];
  savingsGoals: SavingsGoal[];
  aiInsights: AIInsight[];
  cards: Card[];
  esgData: {
    carbonFootprint: number;
    sustainableSpending: number;
    greenInvestments: number;
    monthlyTrend: number;
  };
}

export type Page = 'home' | 'login' | 'dashboard' | 'accounts' | 'transfers' | 'investments' | 'cards' | 'settings';
