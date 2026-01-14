
import React, { useState } from 'react';
import { UserData } from '../types';

interface TransfersProps {
  user: UserData;
  onExecuteTransfer: (amount: number, fromId: number, toId: number) => void;
}

const Transfers: React.FC<TransfersProps> = ({ user, onExecuteTransfer }) => {
  const [fromAccount, setFromAccount] = useState(user.accounts[0].id);
  const [toAccount, setToAccount] = useState(user.accounts[1].id);
  const [amount, setAmount] = useState('500.00');

  const handleInitiate = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    onExecuteTransfer(val, fromAccount, toAccount);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Capital Relocation</h1>
        <p className="text-gray-500 font-medium mt-2">Instant settlements across fiat and neural-linked nodes</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10 mb-12">
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Origin Node</label>
            <select 
              value={fromAccount}
              onChange={(e) => setFromAccount(parseInt(e.target.value))}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none appearance-none cursor-pointer"
            >
              {user.accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.type} ({acc.accountNum}) — ${acc.balance.toLocaleString()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Target Node</label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button className="py-4 rounded-2xl border-2 border-blue-500 bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest">Internal</button>
              <button className="py-4 rounded-2xl border-2 border-gray-100 font-black text-xs uppercase tracking-widest text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all">External</button>
              <button className="py-4 rounded-2xl border-2 border-gray-100 font-black text-xs uppercase tracking-widest text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all">Crypto</button>
            </div>
            <select 
              value={toAccount}
              onChange={(e) => setToAccount(parseInt(e.target.value))}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none appearance-none cursor-pointer"
            >
              {user.accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.type} ({acc.accountNum})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Flow Intensity (Amount)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-gray-400">$</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-black text-2xl outline-none" 
              />
            </div>
          </div>

          <button 
            onClick={handleInitiate}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 rounded-[1.5rem] font-black text-xl shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
          >
            Initiate Capital Flow
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
          <h3 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-sm">Flow Restrictions</h3>
          <div className="space-y-6">
            <LimitMeter label="Daily Relocation" max={5000} current={1000} />
            <LimitMeter label="Monthly Relocation" max={25000} current={11250} />
          </div>
        </section>

        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
          <h3 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-sm">Secure Contacts</h3>
          <div className="space-y-4">
            <ContactRow name="Sarah Anderson" icon="SA" />
            <ContactRow name="Mike Johnson" icon="MJ" />
            <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl font-bold text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all">
              + New Recipient Node
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const LimitMeter: React.FC<{ label: string, max: number, current: number }> = ({ label, max, current }) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">{label}</span>
      <span className="font-black text-gray-900 text-[10px]">${current.toLocaleString()} / ${max.toLocaleString()}</span>
    </div>
    <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(current/max)*100}%` }}></div>
    </div>
  </div>
);

const ContactRow: React.FC<{ name: string, icon: string }> = ({ name, icon }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-gray-100">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black">{icon}</div>
      <div>
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Verified Target</p>
      </div>
    </div>
    <i className="fas fa-chevron-right text-gray-300"></i>
  </div>
);

export default Transfers;
