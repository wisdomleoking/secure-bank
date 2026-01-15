
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (method: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const simulateBiometric = (type: string) => {
    setIsVerifying(type);
    setTimeout(() => {
      onLogin(type);
      setIsVerifying(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md relative overflow-hidden">
        {isVerifying && (
          <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <i className={`fas ${isVerifying === 'face' ? 'fa-user-circle' : 'fa-fingerprint'} text-blue-600 text-4xl`}></i>
            </div>
            <p className="text-xl font-bold text-gray-900">Verifying Identity...</p>
            <p className="text-gray-500 mt-2">Connecting to SecureVault™</p>
          </div>
        )}

        <div className="text-center mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="fas fa-shield-alt text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Neural Gateway</h2>
          <p className="text-gray-600 mt-2">Welcome back to Helious Bank 2025</p>
        </div>

        <div className="mb-10">
          <p className="text-center text-gray-700 mb-6 font-semibold">Biometric Quick-Access</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => simulateBiometric('face')} className="flex flex-col items-center py-5 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all">
              <i className="fas fa-user-circle text-3xl text-gray-600 mb-2"></i>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Face ID</p>
            </button>
            <button onClick={() => simulateBiometric('fingerprint')} className="flex flex-col items-center py-5 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all">
              <i className="fas fa-fingerprint text-3xl text-gray-600 mb-2"></i>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Touch ID</p>
            </button>
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => setShowPassword(!showPassword)} className="text-blue-600 text-sm font-bold hover:text-blue-800 uppercase tracking-widest">
              {showPassword ? 'Back to Biometrics' : 'Use neural-link password'}
            </button>
          </div>
        </div>

        {showPassword && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Secure Identifier</label>
              <input type="text" className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium" defaultValue="john.anderson@email.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Master Phrase</label>
              <input type="password" placeholder="••••••••" className="w-full px-5 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" defaultValue="password123" />
            </div>
            <button onClick={() => onLogin('password')} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
              Establish Session
            </button>
          </div>
        )}

        <div className="mt-10 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center">
          <i className="fas fa-info-circle text-blue-500 mr-3"></i>
          <p className="text-xs text-blue-800 font-medium leading-relaxed">
            Neural sessions expire in 15 minutes. All data is encrypted with SHA-512 quantum-resilience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
