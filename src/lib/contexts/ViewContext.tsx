import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '~/lib/contexts/AuthContext';

interface ViewContextType {
  currentView: string;
  setCurrentView: React.Dispatch<React.SetStateAction<string>>;
  viewOrder: string[];
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(user ? 'welcome' : 'SignIn');
  const viewOrder = ['activityPlannerWeekly', 'activityPlanner', 'welcome', 'countdown','checklist', 'notes', 'logs'];

  return (
    <ViewContext.Provider value={{ currentView, setCurrentView, viewOrder }}>
      {children}
    </ViewContext.Provider>
  );
};
