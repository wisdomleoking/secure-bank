
import React, { useState } from 'react';
import { UserData } from '../types';

interface QuickTransferModalProps {
  user: UserData;
  onClose: () => void;
  onTransfer: (amount: number, fromId: number, toId: number) => void;
}

const QuickTransferModal: React.FC<QuickTransferModalProps> = ({ user, onClose, onTransfer }) => {
  const [amount, setAmount] = useState('100.00');
  const [fromAccount, setFromAccount] = useState(user.accounts[0].id);
  const [toAccount, setToAccount] = useState(user.accounts[1].id);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransfer = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onTransfer(val, fromAccount, toAccount);
      setIsProcessing(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-2xl font-black text-gray-900">Neural Quick-Flow</h2>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Instant settlement protocol</p>
        </div>
        <div className="p-8 space-y-8">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Relocation Magnitude</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-gray-300">$</span>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-black text-2xl outline-none transition-all" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Origin Node</label>
              <select 
                value={fromAccount}
                onChange={(e) => setFromAccount(parseInt(e.target.value))}
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent outline-none appearance-none cursor-pointer"
              >
                {user.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.type} (${acc.balance.toLocaleString()})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Target Node</label>
              <select 
                value={toAccount}
                onChange={(e) => setToAccount(parseInt(e.target.value))}
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent outline-none appearance-none cursor-pointer"
              >
                {user.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.type} ({acc.accountNum})</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
            <button 
              onClick={handleTransfer}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Settling...' : 'Execute Flow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTransferModal;
