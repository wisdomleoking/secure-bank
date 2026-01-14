
import React from 'react';
import { UserData, Page } from '../types';

interface AccountsProps {
  user: UserData;
  onNavigate: (page: Page) => void;
}

const Accounts: React.FC<AccountsProps> = ({ user, onNavigate }) => {
  return (
    <div className="max-w-8xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Wealth Portfolio</h1>
          <p className="text-gray-600 mt-2 font-medium">Neural multi-ledger management across 4 active accounts</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all">
          <i className="fas fa-plus mr-3"></i>Deploy New Capital Node
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {user.accounts.map(account => (
          <div key={account.id} className={`bg-gradient-to-br from-${account.color}-600 to-${account.color}-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className={`text-${account.color}-100 text-xs font-bold uppercase tracking-widest mb-1`}>{account.type} Intelligence</p>
                <p className="text-2xl font-black">{account.accountNum}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <i className={`fas ${account.type === 'Credit Card' ? 'fa-credit-card' : 'fa-vault'} text-2xl`}></i>
              </div>
            </div>
            <div className="mb-10">
              <p className={`text-${account.color}-100 text-xs font-bold uppercase tracking-widest mb-1`}>Available Liquidity</p>
              <p className="text-4xl font-black">${Math.abs(account.balance).toLocaleString()}</p>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 bg-white/20 py-3 rounded-xl font-bold backdrop-blur-md hover:bg-white/30 transition-all">Transfer</button>
              <button className="flex-1 bg-white/20 py-3 rounded-xl font-bold backdrop-blur-md hover:bg-white/30 transition-all">Audit</button>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10">
        <h2 className="text-2xl font-black mb-10">Neural Ledger Audit</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-xs font-black uppercase tracking-[0.2em] border-b border-gray-50 pb-6">
                <th className="pb-6">Timestamp</th>
                <th className="pb-6">Interaction Node</th>
                <th className="pb-6">Neural Category</th>
                <th className="pb-6">Flow Intensity</th>
                <th className="pb-6">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {user.recentTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-all">
                  <td className="py-6 font-bold text-gray-500">{tx.date}</td>
                  <td className="py-6 font-black text-gray-900">{tx.description}</td>
                  <td className="py-6">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold text-xs uppercase">{tx.category}</span>
                  </td>
                  <td className={`py-6 font-black text-lg ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Accounts;
