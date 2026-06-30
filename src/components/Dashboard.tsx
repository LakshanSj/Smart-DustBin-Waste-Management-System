import React, { useState, useEffect } from 'react';
import { DustbinData } from '../types';
import StatsCards from './StatsCards';
import DustbinCard from './DustbinCard';
import BinMap from './BinMap';
import { Bus, Utensils, RefreshCw } from 'lucide-react';

interface DashboardProps {
  dustbins: DustbinData[];
  sector?: 'public' | 'industrial';
}

const Dashboard: React.FC<DashboardProps> = ({ dustbins, sector }) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    setLastRefresh(new Date());
  }, [dustbins]);

  const isPublic = sector === 'public';
  const sectorLabel = isPublic ? 'Public Bus Halt' : 'Hotel & Industrial';
  const SectorIcon = isPublic ? Bus : Utensils;
  const accentColor = isPublic ? 'text-sky-600 dark:text-sky-400' : 'text-emerald-600 dark:text-emerald-400';
  const accentBg = isPublic
    ? 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20'
    : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20';

  const pad = (n: number) => String(n).padStart(2, '0');
  const t = lastRefresh;
  const refreshStr = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">

      {/* Sector Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${accentBg}`}>
            <SectorIcon className={`w-5 h-5 ${accentColor}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{sectorLabel} Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-500 text-xs">{dustbins.length} bins monitored in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg px-3 py-1.5 shadow-sm dark:shadow-none">
          <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
          <span>Refreshed at {refreshStr}</span>
        </div>
      </div>

      {/* Stats */}
      <StatsCards dustbins={dustbins} sector={sector} />

      {/* Bin Cards Grid */}
      {dustbins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-600">
          <div className="text-6xl mb-4">🗑️</div>
          <p className="text-lg font-semibold">No bins found for this sector.</p>
          <p className="text-sm mt-1">Try changing the selected sector.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {dustbins.map((bin, i) => (
            <div
              key={bin.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <DustbinCard dustbin={bin} />
            </div>
          ))}
        </div>
      )}

      {sector === 'public' && <BinMap dustbins={dustbins} />}
    </main>
  );
};

export default Dashboard;
