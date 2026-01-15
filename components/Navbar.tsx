
import React, { useState } from 'react';
import { Page, UserData } from '../types';

interface NavbarProps {
  isLoggedIn: boolean;
  currentPage: Page;
  user: UserData | null;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onOpenAI: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, currentPage, user, onNavigate, onLogout, onOpenAI }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', id: 'dashboard' as Page, icon: 'fa-chart-line' },
    { label: 'Accounts', id: 'accounts' as Page, icon: 'fa-wallet' },
    { label: 'Transfers', id: 'transfers' as Page, icon: 'fa-exchange-alt' },
    { label: 'Investments', id: 'investments' as Page, icon: 'fa-chart-pie' },
    { label: 'Cards', id: 'cards' as Page, icon: 'fa-credit-card' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'home')}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
              <i className="fas fa-shield-alt text-white text-lg"></i>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Helious Bank</span>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-2">PRO</span>
            </div>
          </div>

          {isLoggedIn && user ? (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <i className={`fas ${item.icon} mr-2`}></i>{item.label}
                </button>
              ))}

              <div className="relative ml-4">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.profilePic}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">Security: {user.securityScore}%</p>
                  </div>
                  <i className={`fas fa-chevron-down text-gray-400 transform transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <button onClick={() => { onNavigate('settings'); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
                      <i className="fas fa-cog mr-3 text-gray-500 w-5"></i>Settings
                    </button>
                    <button onClick={() => { onOpenAI(); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
                      <i className="fas fa-robot mr-3 text-gray-500 w-5"></i>AI Assistant
                    </button>
                    <div className="border-t my-2"></div>
                    <button onClick={onLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center">
                      <i className="fas fa-sign-out-alt mr-3 w-5"></i>Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <button onClick={() => onNavigate('login')} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">Sign In</button>
              <button onClick={() => onNavigate('login')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all">Open Account</button>
            </div>
          )}

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-gray-700 text-xl`}></i>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden py-4 border-t animate-fadeIn px-4">
          <div className="space-y-2">
            {isLoggedIn ? (
              <>
                {navItems.map(item => (
                  <button key={item.id} onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center">
                    <i className={`fas ${item.icon} mr-3 w-5`}></i>{item.label}
                  </button>
                ))}
                <button onClick={() => { onOpenAI(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center">
                  <i className="fas fa-robot mr-3 w-5"></i>AI Assistant
                </button>
                <button onClick={onLogout} className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 flex items-center">
                  <i className="fas fa-sign-out-alt mr-3 w-5"></i>Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-700 font-medium">Features</a>
                <button onClick={() => onNavigate('login')} className="text-left text-blue-600 font-semibold">Sign In</button>
                <button onClick={() => onNavigate('login')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-center">Open Account</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
