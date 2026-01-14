
import React from 'react';
import { UserData } from '../types';

const Investments: React.FC<{ user: UserData }> = ({ user }) => {
  const holdings = [
    { name: 'S&P 500 ETF', symbol: 'VOO', value: 12500, change: 15.2 },
    { name: 'Tech Growth', symbol: 'TGF', value: 8500, change: 22.5 },
    { name: 'Apple Inc.', symbol: 'AAPL', value: 2500, change: 8.7 },
    { name: 'Green Energy', symbol: 'ICLN', value: 1800, change: -2.3 }
  ];

  return (
    <div className="max-w-8xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Capital Growth Engine</h1>
          <p className="text-gray-600 mt-2 font-medium">Neural asset allocation • Performance: +12.5% YTD</p>
        </div>
        <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition-all">
          <i className="fas fa-rocket mr-3"></i>New Investment Deployment
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 p-10">
            <h2 className="text-2xl font-black mb-10">Portfolio Overview</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-50 p-8 rounded-3xl text-center border border-gray-100">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Total Value</p>
                <p className="text-3xl font-black text-gray-900">$24,500.00</p>
              </div>
              <div className="bg-green-50 p-8 rounded-3xl text-center border border-green-100">
                <p className="text-xs font-black uppercase tracking-widest text-green-700 mb-2">Unrealized Gain</p>
                <p className="text-3xl font-black text-green-600">+$3,250.00</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-3xl text-center border border-blue-100">
                <p className="text-xs font-black uppercase tracking-widest text-blue-700 mb-2">Active Nodes</p>
                <p className="text-3xl font-black text-blue-600">4 Holdings</p>
              </div>
            </div>

            <h3 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-sm">Active Holdings</h3>
            <div className="space-y-4">
              {holdings.map(h => (
                <div key={h.symbol} className="flex items-center justify-between p-6 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all group">
                  <div className="flex items-center space-x-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${h.change > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {h.symbol.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900">{h.name}</p>
                      <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">{h.symbol} • Equity Node</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-gray-900">${h.value.toLocaleString()}</p>
                    <p className={`font-black text-sm ${h.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {h.change > 0 ? '+' : ''}{h.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-[2.5rem] shadow-2xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-3xl font-black mb-4">Neural ESG Engine</h2>
              <p className="text-emerald-100 font-medium mb-8">Deploy capital into high-impact sustainable nodes. Your current ESG impact is 12% above average.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <p className="text-3xl font-black">$12,500</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Green Assets</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <p className="text-3xl font-black">-12%</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Carbon Flow</p>
                </div>
              </div>
            </div>
            <button className="bg-white text-emerald-700 px-10 py-5 rounded-2xl font-black shadow-xl hover:bg-gray-100 transition-all">Explore ESG Nodes</button>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-50">
            <div className="flex items-center mb-8">
              <div className="bg-purple-100 p-3 rounded-2xl mr-4 text-purple-600"><i className="fas fa-robot text-2xl"></i></div>
              <h3 className="text-xl font-bold text-gray-900">Neural Advice</h3>
            </div>
            <div className="space-y-4">
              <AdviceCard title="Aggressive Tech Shift" desc="Based on your profile, allocating 5% more into tech nodes could optimize returns." />
              <AdviceCard title="International Pivot" desc="Diversify into emerging Asian nodes to hedge against domestic volatility." />
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-900">Crypto Terminal</h3>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Live Flow</span>
            </div>
            <div className="space-y-6 mb-8">
              <CryptoRow name="Bitcoin" symbol="BTC" price={42350} change={5.2} />
              <CryptoRow name="Ethereum" symbol="ETH" price={2250} change={3.8} />
              <CryptoRow name="Solana" symbol="SOL" price={98.50} change={-1.5} />
            </div>
            <button className="w-full border-2 border-orange-500 text-orange-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-50 transition-all">
              Launch Crypto Deck
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const AdviceCard: React.FC<{ title: string, desc: string }> = ({ title, desc }) => (
  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
    <p className="font-black text-blue-900 mb-1">{title}</p>
    <p className="text-sm text-blue-700 leading-relaxed font-medium">{desc}</p>
  </div>
);

const CryptoRow: React.FC<{ name: string, symbol: string, price: number, change: number }> = ({ name, symbol, price, change }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black">{symbol.charAt(0)}</div>
      <div>
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{symbol}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-black text-gray-900">${price.toLocaleString()}</p>
      <p className={`text-xs font-black ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>{change > 0 ? '+' : ''}{change}%</p>
    </div>
  </div>
);

export default Investments;
