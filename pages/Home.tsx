
import React from 'react';

interface HomeProps {
  onStartAccount: () => void;
  onSignIn: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartAccount, onSignIn }) => {
  return (
    <div className="animate-fadeIn">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white pt-12 pb-24 px-4">
        <div className="max-w-8xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Banking Reimagined for 2025</h1>
            <p className="text-xl mb-8 text-blue-100 max-w-lg">Your AI-powered financial assistant that learns, adapts, and grows with you. Secure, smart, and social.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={onStartAccount} className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all flex items-center justify-center space-x-2">
                <i className="fas fa-bolt"></i>
                <span>Open Account in 5 Min</span>
              </button>
              <button onClick={onSignIn} className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-900 transition-all">
                Sign In Securely
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-10">
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <i className="fas fa-robot mr-2"></i> AI-Powered
              </span>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <i className="fas fa-fingerprint mr-2"></i> Biometric
              </span>
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <i className="fas fa-bolt mr-2"></i> Instant
              </span>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="glass-card rounded-3xl p-8 shadow-2xl border-white/20">
              <h3 className="text-2xl font-bold mb-8 text-center">Your 2025 Financial Command</h3>
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium">Security Score</p>
                  <p className="text-xl font-bold text-green-400">92%</p>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-sm text-blue-200 mt-3">Neural Link protection active • AI fraud shielding 100%</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-800/60 to-purple-800/60 rounded-2xl p-5 mb-8 border border-white/10">
                <div className="flex items-start">
                  <div className="mr-3 bg-yellow-400/20 p-2 rounded-lg"><i className="fas fa-lightbulb text-yellow-300 text-lg"></i></div>
                  <div>
                    <p className="font-semibold text-white">AI Neural Insight</p>
                    <p className="text-sm text-blue-200">"Your spending on dining is 15% higher this week. I've curated 3 budget options for you."</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/20 transition-all cursor-pointer">
                  <i className="fas fa-coins text-2xl mb-2 text-yellow-300"></i>
                  <p className="text-xs font-semibold">Crypto</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/20 transition-all cursor-pointer">
                  <i className="fas fa-leaf text-2xl mb-2 text-green-400"></i>
                  <p className="text-xs font-semibold">ESG</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/20 transition-all cursor-pointer">
                  <i className="fas fa-vault text-2xl mb-2 text-blue-300"></i>
                  <p className="text-xs font-semibold">Safe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 px-4 bg-gray-50" id="features">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">2025 Banking Features</h2>
            <p className="text-gray-600 text-lg">Integrated intelligence, absolute security, human-centric design.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="fa-robot" 
              color="blue" 
              title="AI Financial Assistant" 
              desc="Deep-learning budgeting that predicts your next 30 days of expenses." 
              points={['Predictive spending alerts', 'Automated savings goals', 'Subscription neural-shield']}
            />
            <FeatureCard 
              icon="fa-fingerprint" 
              color="green" 
              title="Biometric Shield" 
              desc="Multi-factor biometric auth using facial geometry and behavioral patterns." 
              points={['Neural identity mapping', 'Instant card controls', 'Geo-fenced protection']}
            />
            <FeatureCard 
              icon="fa-bolt" 
              color="purple" 
              title="Quantum Transfers" 
              desc="Real-time global settlements across fiat and digital assets instantly." 
              points={['Sub-second settlements', 'Multi-currency support', 'Cross-chain bridging']}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; color: string; title: string; desc: string; points: string[] }> = ({ icon, color, title, desc, points }) => (
  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 group">
    <div className={`bg-${color}-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <i className={`fas ${icon} text-${color}-600 text-2xl`}></i>
    </div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-gray-600 mb-6">{desc}</p>
    <ul className="space-y-3">
      {points.map(p => (
        <li key={p} className="flex items-center text-sm font-medium">
          <i className="fas fa-check-circle text-green-500 mr-3"></i>
          <span>{p}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Home;
