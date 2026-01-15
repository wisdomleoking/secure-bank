
import React, { useState, useRef, useEffect } from 'react';
import { UserData } from '../types';
import { getAIResponse } from '../services/geminiService';

interface AIChatModalProps {
  user: UserData | null;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ user, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hello! I'm your Helious Bank Neural Assistant. How can I help you optimize your wealth today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const responseText = await getAIResponse(userMsg, user);
    setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-8 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20">
              <i className="fas fa-robot text-3xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black">Neural Assistant</h2>
              <p className="text-white/60 font-bold text-sm tracking-widest uppercase">SecureVault Engine v4.2</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-4 rounded-2xl transition-all">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        <div ref={scrollRef} className="flex-grow p-8 overflow-y-auto space-y-6 no-scrollbar bg-gray-50/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-[1.5rem] font-medium leading-relaxed shadow-sm
                ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-6 rounded-[1.5rem] rounded-tl-none border border-gray-100 shadow-sm flex space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t bg-white shrink-0">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me to analyze your spending or optimize your portfolio..."
              className="flex-grow px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl font-bold outline-none"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-indigo-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-indigo-200 transition-all disabled:opacity-50"
            >
              <i className="fas fa-paper-plane text-xl"></i>
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-5">
            Neural sessions are AES-256 encrypted • AI cannot execute unauthorized transfers
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
