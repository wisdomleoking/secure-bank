
import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: NotificationType = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm w-full">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-xl shadow-2xl border animate-fadeIn flex items-center space-x-3 
            ${n.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
              n.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
              n.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 
              'bg-blue-50 border-blue-200 text-blue-800'}`}>
            <i className={`fas ${n.type === 'success' ? 'fa-check-circle' : n.type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}`}></i>
            <p className="text-sm font-medium">{n.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

export default NotificationProvider;
