import React, { useState, useEffect } from 'react';
import { Trash2, LogOut, ArrowLeft, Wifi, Clock, Sun, Moon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onChangeSector?: () => void;
  sector?: 'public' | 'industrial';
}

const Header: React.FC<HeaderProps> = ({ onChangeSector, sector }) => {
  const [time, setTime] = useState(new Date());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const sectorLabel = sector === 'public' ? 'Public Sector' : 'Industrial Sector';
  const sectorColor = sector === 'public' ? 'text-sky-500 dark:text-sky-400' : 'text-emerald-600 dark:text-emerald-400';

  return (
    <header className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/60 px-6 py-3 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Left: Logo + Title */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/30">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>

          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-800 dark:text-white leading-tight truncate">
              Smart Dustbin Monitor
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${sectorColor}`}>{sectorLabel}</span>
              <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Wifi className="w-3 h-3" />
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Clock */}
        <div className="hidden md:flex flex-col items-center flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 transition-colors duration-300">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
            <span className="text-slate-700 dark:text-white font-mono text-sm font-semibold tracking-widest">{timeStr}</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">{dateStr}</span>
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }
          </button>

          {onChangeSector && (
            <button
              onClick={onChangeSector}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg transition-all duration-200"
              title="Go back to sector selection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Change Sector</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/20 hover:border-red-200 dark:hover:border-red-500/40 rounded-lg transition-all duration-200"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;