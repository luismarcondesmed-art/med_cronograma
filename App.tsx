import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StudyView } from './components/StudyView';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Autenticação Anônima para satisfazer regras do Firebase (request.auth != null)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Erro na autenticação anônima:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  // Sync theme with HTML root for global styles
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onChangeView={setCurrentView} />;
      case 'study':
        return <StudyView />;
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView}
      isDark={isDark}
      toggleTheme={toggleTheme}
    >
      {renderView()}
    </Layout>
  );
};