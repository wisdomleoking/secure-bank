
import React, { useState, useCallback } from 'react';
import { UserData, Page, Transaction, Account } from './types';
import { INITIAL_USER_DATA } from './constants';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationProvider, { useNotification } from './components/NotificationProvider';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transfers from './pages/Transfers';
import Investments from './pages/Investments';
import Cards from './pages/Cards';
import Settings from './pages/Settings';
import AIChatModal from './components/AIChatModal';
import QuickTransferModal from './components/QuickTransferModal';
import CardControlModal from './components/CardControlModal';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isQuickTransferOpen, setIsQuickTransferOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  
  const { showNotification } = useNotification();

  const handleLogin = (method: string) => {
    setIsLoggedIn(true);
    setCurrentUser(INITIAL_USER_DATA);
    setCurrentPage('dashboard');
    showNotification(`Welcome back, ${INITIAL_USER_DATA.name.split(' ')[0]}! Logged in via ${method}.`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home');
    showNotification('Logged out successfully', 'info');
  };

  const handleTransfer = useCallback((amount: number, fromId: number, toId: number) => {
    if (!currentUser) return;

    setCurrentUser(prev => {
      if (!prev) return null;
      
      const newAccounts = prev.accounts.map(acc => {
        if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
        if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
        return acc;
      });

      const newTx: Transaction = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        description: 'Internal Capital Transfer',
        amount: -amount,
        category: 'Transfer',
        status: 'completed'
      };

      return {
        ...prev,
        accounts: newAccounts,
        recentTransactions: [newTx, ...prev.recentTransactions]
      };
    });
    
    showNotification(`Relocated $${amount.toLocaleString()} between nodes successfully.`, 'success');
  }, [currentUser, showNotification]);

  const toggleCardFreeze = (cardId: number) => {
    if (!currentUser) return;
    const updatedCards = currentUser.cards.map(c => 
      c.id === cardId ? { ...c, frozen: !c.frozen } : c
    );
    setCurrentUser({ ...currentUser, cards: updatedCards });
    const targetCard = updatedCards.find(c => c.id === cardId);
    showNotification(`Card ${targetCard?.frozen ? 'frozen' : 'unfrozen'} successfully`, 'success');
  };

  const renderCurrentPage = () => {
    if (!isLoggedIn && currentPage !== 'home' && currentPage !== 'login') {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'home': return <Home onStartAccount={() => setCurrentPage('login')} onSignIn={() => setCurrentPage('login')} />;
      case 'login': return <Login onLogin={handleLogin} />;
      case 'dashboard': return currentUser ? <Dashboard 
          user={currentUser} 
          onOpenAI={() => setIsAIChatOpen(true)} 
          onQuickTransfer={() => setIsQuickTransferOpen(true)}
          onCardControls={(id) => { setActiveCardId(id); }}
          onNavigate={setCurrentPage}
        /> : null;
      case 'accounts': return currentUser ? <Accounts user={currentUser} onNavigate={setCurrentPage} /> : null;
      case 'transfers': return currentUser ? <Transfers user={currentUser} onExecuteTransfer={handleTransfer} /> : null;
      case 'investments': return currentUser ? <Investments user={currentUser} /> : null;
      case 'cards': return currentUser ? <Cards user={currentUser} onToggleFreeze={toggleCardFreeze} onOpenControls={(id) => setActiveCardId(id)} /> : null;
      case 'settings': return currentUser ? <Settings user={currentUser} /> : null;
      default: return <Home onStartAccount={() => setCurrentPage('login')} onSignIn={() => setCurrentPage('login')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar 
        isLoggedIn={isLoggedIn} 
        currentPage={currentPage} 
        user={currentUser} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout}
        onOpenAI={() => setIsAIChatOpen(true)}
      />
      
      <main className="flex-grow pb-12">
        {renderCurrentPage()}
      </main>

      <Footer />

      {/* Modals */}
      {isAIChatOpen && <AIChatModal user={currentUser} onClose={() => setIsAIChatOpen(false)} />}
      {isQuickTransferOpen && currentUser && (
        <QuickTransferModal 
          user={currentUser} 
          onClose={() => setIsQuickTransferOpen(false)} 
          onTransfer={handleTransfer}
        />
      )}
      {activeCardId !== null && currentUser && (
        <CardControlModal 
          card={currentUser.cards.find(c => c.id === activeCardId) || currentUser.cards[0]} 
          onClose={() => setActiveCardId(null)}
          onToggleFreeze={() => toggleCardFreeze(activeCardId)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;
