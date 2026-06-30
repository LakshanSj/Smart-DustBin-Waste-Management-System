import React from 'react';
import { MapPin, Clock, Wind, Trash2, AlertTriangle, CheckCircle2, Zap, BatteryCharging, Fan, Lightbulb, Scale, Flame, Landmark } from 'lucide-react';
import { DustbinData } from '../types';
import { getBinStatus, getStatusText, formatLastUpdated } from '../utils/statusHelpers';

interface DustbinCardProps {
  dustbin: DustbinData;
}

const STATUS_STYLES = {
  empty: {
    topBorder: 'border-t-emerald-500',
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  'half-full': {
    topBorder: 'border-t-amber-500',
    badge: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-500/15',
    iconColor: 'text-amber-600 dark:text-amber-400',
    icon: AlertTriangle,
  },
  full: {
    topBorder: 'border-t-red-500',
    badge: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-500/15',
    iconColor: 'text-red-600 dark:text-red-400',
    icon: AlertTriangle,
  },
};

const DustbinCard: React.FC<DustbinCardProps> = ({ dustbin }) => {
  const status = getBinStatus(dustbin.fillLevel);
  const style = STATUS_STYLES[status];
  const StatusIcon = style.icon;
  const isFull = status === 'full';
  const hasGasAlert = dustbin.gasLevel >= 70;

  const isPublic = dustbin.sector === 'public';
  const sectorStyle = isPublic
    ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-400'
    : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400';
  const sectorLabel = isPublic ? 'Public Sector' : 'Industrial Sector';

  return (
    <div
      className={`
        relative rounded-2xl border border-t-4 ${style.topBorder}
        border-slate-200 dark:border-slate-700/60
        bg-white dark:bg-slate-800/60
        hover:shadow-xl dark:hover:shadow-2xl
        hover:-translate-y-0.5
        hover:border-slate-300 dark:hover:border-slate-600/60
        transition-all duration-300 overflow-hidden
        animate-fade-in-up flex flex-col justify-between h-full
      `}
    >
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row */}
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`flex-shrink-0 p-2 rounded-xl ${style.iconBg}`}>
                <Trash2 className={`w-5 h-5 ${style.iconColor}`} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{dustbin.id}</h3>
                <div className="flex items-center gap-1 mt-0.5 text-slate-500 dark:text-slate-400 text-xs">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{dustbin.location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${style.badge}`}>
                <StatusIcon className="w-3 h-3" />
                {getStatusText(status)}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full border text-xs font-medium ${sectorStyle}`}>
                {sectorLabel}
              </span>
            </div>
          </div>

          {/* Render Public Sector (Dual Chamber, Solar & Ancillaries) */}
          {isPublic ? (
            <div className="space-y-4">
              {/* Dual Chambers */}
              <div className="grid grid-cols-2 gap-4">
                {/* Inorganic Chamber */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Inorganic</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{dustbin.inorganicFillLevel ?? 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 bar-animate"
                      style={{ width: `${dustbin.inorganicFillLevel ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Organic Chamber */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Organic</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{dustbin.organicFillLevel ?? 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 bar-animate"
                      style={{ width: `${dustbin.organicFillLevel ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Methane Odor Level */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Wind className="w-3.5 h-3.5" /> Methane / Odor Level
                  </span>
                  <span className={`font-bold ${hasGasAlert ? 'text-orange-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    {dustbin.methaneLevel ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${hasGasAlert ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-500'}`}
                    style={{ width: `${dustbin.methaneLevel ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Solar & Ancillary grid status */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/30">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-slate-400 font-medium">Solar Power</div>
                    <div className="font-bold text-slate-700 dark:text-slate-200">{dustbin.solarPower ?? 0} W</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/30">
                  <BatteryCharging className="w-4 h-4 text-sky-500" />
                  <div>
                    <div className="text-slate-400 font-medium">USB Chargers</div>
                    <div className="font-bold text-slate-700 dark:text-slate-200">{dustbin.chargingPortsActive ?? 0} Active</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/30">
                  <Fan className={`w-4 h-4 ${dustbin.fanStatus !== 'Off' ? 'text-teal-500 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '3s' }} />
                  <div>
                    <div className="text-slate-400 font-medium">Cooling Fan</div>
                    <div className="font-bold text-slate-700 dark:text-slate-200">{dustbin.fanStatus ?? 'Off'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/30">
                  <Lightbulb className={`w-4 h-4 ${dustbin.lightStatus === 'On' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-slate-400 font-medium">Night Light</div>
                    <div className="font-bold text-slate-700 dark:text-slate-200">{dustbin.lightStatus ?? 'Off'}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Render Industrial Sector (Organic Weight, Biogas Reactor Metrics) */
            <div className="space-y-4">
              {/* Organic weight */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Scale className="w-3.5 h-3.5" /> Organic Waste Weight
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{dustbin.organicWeight ?? 0} kg / 300 kg</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 bar-animate"
                    style={{ width: `${Math.round(((dustbin.organicWeight ?? 0) / 300) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Methane volume */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Flame className="w-3.5 h-3.5" /> Methane Gas Yield
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{dustbin.methaneVolume ?? 0} m³</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 bar-animate"
                    style={{ width: `${dustbin.methaneVolume ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Reactor status & savings widgets */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/30">
                  <Flame className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="text-slate-400 font-medium">Reactor Status</div>
                    <div className="font-bold text-slate-700 dark:text-slate-200">{dustbin.reactorStatus ?? 'Idle'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/30">
                  <Landmark className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="text-slate-400 font-medium">Cost Savings</div>
                    <div className="font-bold text-slate-700 dark:text-slate-200">Rs. {dustbin.energySavings ?? 0}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alert banner */}
          {(isFull || hasGasAlert) && (
            <div className={`
              flex items-center gap-2 p-3 rounded-xl text-xs font-semibold mt-4
              ${isFull
                ? 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300'
                : 'bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-300'}
            `}>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
              {isFull
                ? '🚨 Bin is full — immediate collection required!'
                : '⚠️ High gas level detected!'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-600 text-xs border-t border-slate-100 dark:border-slate-700/50 pt-3 mt-4">
          <Clock className="w-3 h-3" />
          <span>Updated {formatLastUpdated(dustbin.lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
};

export default DustbinCard;
