import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DustbinData } from '../types';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const makeCircleIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 8px ${color}99;"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -12],
  });

const greenIcon = makeCircleIcon('#22c55e');
const amberIcon = makeCircleIcon('#f59e0b');
const redIcon   = makeCircleIcon('#ef4444');

const getMarkerIcon = (fillLevel: number) =>
  fillLevel >= 80 ? redIcon : fillLevel >= 40 ? amberIcon : greenIcon;

interface BinMapProps {
  dustbins: DustbinData[];
}

const BinMap: React.FC<BinMapProps> = ({ dustbins }) => {
  const { theme } = useTheme();
  const centerPosition: [number, number] = [6.9271, 79.8612];

  // Bug fix: deterministic coordinates — no jumping on re-renders
  const binsWithLocation = useMemo(() =>
    dustbins.map((bin, i) => ({
      ...bin,
      lat: 6.9271 + (((i * 7 + 3) % 17) / 17 - 0.5) * 0.025,
      lng: 79.8612 + (((i * 11 + 5) % 13) / 13 - 0.5) * 0.025,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dustbins.map(b => b.id).join(',')]
  );

  const fullBins = binsWithLocation.filter(b => b.fillLevel >= 75);
  const routeCoords = fullBins.map(b => [b.lat, b.lng] as [number, number]);

  // Switch tile based on theme
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const tileAttribution = '&copy; <a href="https://carto.com">CARTO</a>';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden animate-fade-in-up bg-white dark:bg-slate-800/40 transition-colors duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between bg-white dark:bg-transparent">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">🚚 Optimized Collection Route</h3>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">Real-time bin locations &amp; truck path</p>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 animate-pulse" />
          {fullBins.length} Stops Required
        </span>
      </div>

      {/* Legend */}
      <div className="px-5 py-2 flex items-center gap-4 border-b border-slate-100 dark:border-slate-700/40 bg-slate-50 dark:bg-slate-800/30">
        {[{ color: '#22c55e', label: 'Empty' }, { color: '#f59e0b', label: 'Half Full' }, { color: '#ef4444', label: 'Full' }].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full border-2 border-white/60" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ml-2">
          <span className="inline-block w-6 border-t-2 border-dashed border-red-400" />
          Truck Route
        </div>
      </div>

      {/* Map */}
      <div className="h-[380px] w-full relative z-0">
        <MapContainer center={centerPosition} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution={tileAttribution} url={tileUrl} />

          {binsWithLocation.map(bin => (
            <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={getMarkerIcon(bin.fillLevel)}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 160 }}>
                  <strong style={{ display: 'block', color: '#0f172a', marginBottom: 4, fontSize: 13 }}>
                    {bin.id}: {bin.location}
                  </strong>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: bin.fillLevel >= 80 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                      Overall: {Math.round(bin.fillLevel)}% Full
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: '1.4' }}>
                    Chamber Levels:<br />
                    • Plastic/Inorganic: <strong>{bin.inorganicFillLevel ?? 0}%</strong><br />
                    • Organic Waste: <strong>{bin.organicFillLevel ?? 0}%</strong><br />
                    • Methane Level: <strong>{bin.methaneLevel ?? 0}%</strong>
                  </div>
                  {bin.fillLevel >= 75 && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ background: '#ef4444', color: 'white', fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                        Needs Collection
                      </span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {routeCoords.length >= 2 && (
            <Polyline positions={routeCoords} color="#ef4444" dashArray="6, 10" weight={2.5} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default BinMap;