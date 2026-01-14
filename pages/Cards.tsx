
import React from 'react';
import { UserData } from '../types';

interface CardsProps {
  user: UserData;
  onToggleFreeze: (id: number) => void;
  onOpenControls: (id: number) => void;
}

const Cards: React.FC<CardsProps> = ({ user, onToggleFreeze, onOpenControls }) => {
  return (
    <div className="max-w-8xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Neural Interface Cards</h1>
          <p className="text-gray-600 mt-2 font-medium">Manage your biometric-linked payment nodes</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl transition-all">
          <i className="fas fa-plus mr-3"></i>Issue New Digital Node
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {user.cards.map(card => (
          <div key={card.id} className="bg-gradient-to-br from-gray-800 to-black rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-6 right-6 w-3 h-3 rounded-full ${card.frozen ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'}`}></div>
            
            <div className="mb-12">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{card.type} Network</p>
                  <p className="text-2xl font-black tracking-[0.2em]">{card.number}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                  <i className={`fab fa-cc-${card.type.toLowerCase()} text-2xl`}></i>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Node Operator</p>
                  <p className="text-lg font-black">{user.name.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Expiry</p>
                  <p className="font-black">{card.expiry}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => onToggleFreeze(card.id)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${card.frozen ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {card.frozen ? 'Reactivate' : 'Deactivate'}
              </button>
              <button onClick={() => onOpenControls(card.id)} className="flex-1 bg-white/10 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">Security</button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <section className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 p-10 mb-8">
            <h2 className="text-2xl font-black mb-8">Neural Protection Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <CardPolicy icon="fa-lock" title="Biometric Shielding" status="Active" />
              <CardPolicy icon="fa-globe" title="Geo-Fenced Nodes" status="Regional Only" />
              <CardPolicy icon="fa-store" title="Neural Merchant Filter" status="Active" />
              <CardPolicy icon="fa-plane" title="Travel Neural Link" status="Standby" />
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 p-10">
            <h2 className="text-2xl font-black mb-8">Real-time Card Ledger</h2>
            <div className="space-y-4">
              {user.recentTransactions.filter(t => t.category !== 'Income').slice(0, 4).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-all">
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center"><i className="fas fa-shopping-bag text-gray-400"></i></div>
                    <div>
                      <p className="font-black text-gray-900">{tx.description}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{tx.date} • {tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-red-600">-${Math.abs(tx.amount).toFixed(2)}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Visa node • 4532</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-50">
            <h3 className="text-xl font-black mb-6">Node Status</h3>
            <div className="space-y-4">
              <StatusRow label="Neural Matching" status="Synced" />
              <StatusRow label="Neural Fraud AI" status="Shielding" />
              <StatusRow label="Virtual Tokenization" status="Active" />
            </div>
          </section>

          <section className="bg-gradient-to-br from-red-600 to-pink-700 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="bg-white/20 p-3 rounded-2xl mr-4"><i className="fas fa-exclamation-triangle text-xl"></i></div>
              <div>
                <h3 className="text-xl font-bold">Node Compromise?</h3>
                <p className="text-red-100 text-sm">Instant emergency lockdown</p>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-white/20 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white/30 transition-all">Report Compromised Node</button>
              <button className="w-full bg-white/20 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white/30 transition-all">Order Replacement</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const CardPolicy: React.FC<{ icon: string, title: string, status: string }> = ({ icon, title, status }) => (
  <div className="p-6 border-2 border-gray-50 rounded-3xl flex items-center space-x-5">
    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl"><i className={`fas ${icon}`}></i></div>
    <div>
      <p className="font-black text-gray-900 leading-none">{title}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2">{status}</p>
    </div>
  </div>
);

const StatusRow: React.FC<{ label: string, status: string }> = ({ label, status }) => (
  <div className="flex justify-between items-center py-2">
    <span className="font-bold text-gray-500 text-sm">{label}</span>
    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{status}</span>
  </div>
);

export default Cards;
