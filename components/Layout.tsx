import React from 'react';
import { LayoutDashboard, GraduationCap, Calendar, Settings, ChevronRight, Moon, Sun, Bug } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const APP_VERSION = "v1.5.0-debug";

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, isDark, toggleTheme }) => {
  
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'study', label: 'Estudos', icon: GraduationCap },
    // { id: 'calendar', label: 'Escala', icon: Calendar }, 
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark' : ''} bg-gray-50 dark:bg-gray-950 transition-colors duration-500`}>
      
      {/* --- DESKTOP TOP BAR --- */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors duration-500">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg">
            <span className="font-bold text-sm tracking-tighter">P</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight leading-none">PediApp</h1>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block -mt-0.5">UFPR</span>
          </div>
        </div>

        {/* Navigation (Centered) */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-full border border-gray-200/50 dark:border-gray-700/30 backdrop-blur-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${currentView === item.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Theme Toggle (Right) */}
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-gray-300 dark:text-gray-700 flex items-center gap-1">
                <Bug className="w-3 h-3" /> {APP_VERSION}
            </span>
            <button 
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pt-6 md:pt-24 pb-32 md:pb-10">
        {children}
      </main>

      {/* --- MOBILE NAVIGATION --- */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 rounded-full shadow-2xl z-50 flex justify-evenly items-center px-2 animate-slide-in">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              currentView === item.id
                ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'
                : 'text-gray-400'
            }`}
          >
            <item.icon className="w-5 h-5" strokeWidth={2.5} />
            {currentView === item.id && (
              <span className="absolute -bottom-1 w-1 h-1 bg-current rounded-full" />
            )}
          </button>
        ))}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-12 h-12 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </nav>
      
      {/* Mobile Version Indicator */}
      <div className="md:hidden fixed bottom-1 left-0 right-0 text-center pointer-events-none z-40">
        <span className="text-[9px] font-mono text-gray-400 bg-white/50 dark:bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
            {APP_VERSION}
        </span>
      </div>
    </div>
  );
};