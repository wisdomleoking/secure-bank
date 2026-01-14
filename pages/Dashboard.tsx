
import React from 'react';
import { UserData, Page, Transaction, Account } from '../types';

interface DashboardProps {
  user: UserData;
  onOpenAI: () => void;
  onQuickTransfer: () => void;
  onCardControls: (id: number) => void;
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onOpenAI, onQuickTransfer, onCardControls, onNavigate }) => {
  const totalBalance = user.accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="max-w-8xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-600">SecureVault session: Active • Neural shielding: 100%</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onQuickTransfer} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-xl transition-all">
            <i className="fas fa-paper-plane mr-2"></i>Quick Transfer
          </button>
          <button onClick={onOpenAI} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-xl transition-all">
            <i className="fas fa-robot mr-2"></i>AI Assistant
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Net Worth" value={`$${totalBalance.toLocaleString()}`} icon="fa-wallet" color="blue" trend="+2.5% vs Dec" />
        <StatCard title="Security" value={`${user.securityScore}%`} icon="fa-shield-alt" color="green" trend="Optimal Profile" />
        <StatCard title="ESG Impact" value="8.2/10" icon="fa-leaf" color="emerald" trend="-12% Carbon" />
        <StatCard title="Insights" value={`${user.aiInsights.length} Pending`} icon="fa-robot" color="purple" trend="Next-Gen Engine" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>
              <button onClick={() => onNavigate('accounts')} className="text-blue-600 font-bold text-sm hover:underline">View Intelligence Dashboard →</button>
            </div>
            <div className="p-2">
              {user.accounts.map(acc => (
                <AccountRow key={acc.id} account={acc} />
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <button className="text-blue-600 font-bold text-sm hover:underline">Neural Audit History →</button>
            </div>
            <div className="p-2">
              {user.recentTransactions.slice(0, 5).map(tx => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Neural Savings</h2>
              <button className="text-blue-600 font-bold text-sm">+ Add Goal</button>
            </div>
            <div className="space-y-8">
              {user.savingsGoals.map(goal => (
                <div key={goal.id}>
                  <div className="flex justify-between mb-3">
                    <span className="font-bold text-gray-700">{goal.name}</span>
                    <span className="font-bold text-gray-900">${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full bg-gradient-to-r from-${goal.color}-500 to-${goal.color}-400`} style={{ width: `${(goal.current / goal.target) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center mb-8">
              <div className="bg-white/20 p-3 rounded-2xl mr-4"><i className="fas fa-robot text-2xl"></i></div>
              <div>
                <h2 className="text-2xl font-bold">AI Prediction</h2>
                <p className="text-white/70 text-sm">Neural Finance Engine</p>
              </div>
            </div>
            <div className="space-y-5">
              {user.aiInsights.slice(0, 2).map(insight => (
                <div key={insight.id} className="bg-white/10 p-5 rounded-2xl border border-white/10">
                  <p className="font-medium text-white mb-3">{insight.message}</p>
                  <button onClick={onOpenAI} className="text-white text-xs font-bold uppercase tracking-widest hover:text-purple-200">Engage AI Assistant →</button>
                </div>
              ))}
            </div>
            <button onClick={onOpenAI} className="w-full mt-10 bg-white text-indigo-700 py-4 rounded-2xl font-bold shadow-xl hover:bg-gray-50 transition-all">
              Neural Finance Dashboard
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: string, color: string, trend: string }> = ({ title, value, icon, color, trend }) => (
  <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-50 flex items-center space-x-5 hover:shadow-2xl transition-all cursor-default">
    <div className={`bg-${color}-100 w-16 h-16 rounded-2xl flex items-center justify-center text-${color}-600 text-2xl`}><i className={`fas ${icon}`}></i></div>
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-bold text-green-500 mt-1 uppercase">{trend}</p>
    </div>
  </div>
);

const AccountRow: React.FC<{ account: Account }> = ({ account }) => (
  <div className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer">
    <div className="flex items-center space-x-5">
      <div className={`w-14 h-14 bg-gradient-to-br from-${account.color}-500 to-${account.color}-700 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
        <i className={`fas ${account.type === 'Credit Card' ? 'fa-credit-card' : 'fa-wallet'} text-xl`}></i>
      </div>
      <div>
        <p className="font-black text-gray-900">{account.type} Account</p>
        <p className="text-sm text-gray-500 font-bold tracking-widest">{account.accountNum}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-2xl font-black ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>${Math.abs(account.balance).toLocaleString()}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Credit</p>
    </div>
  </div>
);

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
  <div className="flex items-center justify-between p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-2xl transition-all">
    <div className="flex items-center space-x-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
        <i className={`fas ${transaction.amount > 0 ? 'fa-arrow-down' : 'fa-shopping-bag'}`}></i>
      </div>
      <div>
        <p className="font-bold text-gray-900">{transaction.description}</p>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{transaction.date} • {transaction.category}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-lg font-black ${transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
      </p>
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {transaction.status}
      </span>
    </div>
  </div>
);

export default Dashboard;
