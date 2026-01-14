
import React from 'react';
import { Card } from '../types';

interface CardControlModalProps {
  card: Card;
  onClose: () => void;
  onToggleFreeze: () => void;
}

const CardControlModal: React.FC<CardControlModalProps> = ({ card, onClose, onToggleFreeze }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Neural Controls</h2>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">{card.type} • {card.number}</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${card.frozen ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {card.frozen ? 'Offline' : 'Online'}
          </div>
        </div>
        <div className="p-8 space-y-6">
          <ControlToggle title="Neural Lockdown" desc="Temporarily block all interactions" active={card.frozen} onToggle={onToggleFreeze} color="red" />
          <ControlToggle title="Online Nodes" desc="Allow virtual gateway payments" active={!card.frozen} onToggle={() => {}} color="blue" />
          <ControlToggle title="International Link" desc="Allow cross-border settlements" active={!card.frozen} onToggle={() => {}} color="blue" />
          
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="font-black text-xs uppercase tracking-widest text-gray-400">Daily Magnitude Limit</span>
              <span className="font-black text-gray-900">$1,000</span>
            </div>
            <input type="range" min="100" max="5000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">
              <span>$100</span>
              <span>$5,000</span>
            </div>
          </div>

          <button onClick={onClose} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-black transition-all">
            Update Security Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const ControlToggle: React.FC<{ title: string, desc: string, active: boolean, onToggle: () => void, color: string }> = ({ title, desc, active, onToggle, color }) => (
  <div className="flex items-center justify-between group">
    <div>
      <p className="font-black text-gray-900 leading-none mb-1">{title}</p>
      <p className="text-xs text-gray-500 font-medium">{desc}</p>
    </div>
    <div 
      onClick={onToggle}
      className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${active ? `bg-${color === 'red' ? 'red' : 'blue'}-600` : 'bg-gray-200'}`}
    >
      <div className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform ${active ? 'translate-x-5' : ''}`}></div>
    </div>
  </div>
);

export default CardControlModal;
