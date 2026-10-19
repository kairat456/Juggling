import React from 'react';
import { X, Lock, Check, MapPin, Sparkles, Sun, Trees, Trophy, Flame } from 'lucide-react';
import { LocationDef } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface LocationSelectModalProps {
  locations: LocationDef[];
  activeLocationId: string;
  coins: number;
  onSelectLocation: (id: string) => void;
  onUnlockLocation: (id: string, price: number) => void;
  onClose: () => void;
}

export const LocationSelectModal: React.FC<LocationSelectModalProps> = ({
  locations,
  activeLocationId,
  coins,
  onSelectLocation,
  onUnlockLocation,
  onClose,
}) => {
  const getLocationIcon = (id: string) => {
    switch (id) {
      case 'beach':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'lawn':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'stadium':
        return <Trophy className="w-5 h-5 text-rose-400" />;
      case 'arena':
        return <Flame className="w-5 h-5 text-indigo-400" />;
      default:
        return <MapPin className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Уникальные Локации
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Откройте пляж, уличный газон, стадион и волейбольную арену
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          {locations.map((loc) => {
            const isActive = loc.id === activeLocationId;
            const canAfford = coins >= loc.price;

            return (
              <div
                key={loc.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden relative ${
                  isActive
                    ? 'bg-slate-800/90 border-emerald-400 ring-2 ring-emerald-400/20 shadow-lg'
                    : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {/* Visual Top Preview Strip */}
                <div
                  className="h-20 -mx-4 -mt-4 mb-3 rounded-t-2xl flex items-end p-3 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${loc.skyGradient[0]}, ${loc.skyGradient[1]})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm">
                      {getLocationIcon(loc.id)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white drop-shadow-sm">{loc.name}</div>
                      <div className="text-[10px] text-white/80">{loc.category}</div>
                    </div>
                  </div>

                  {isActive && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] shadow-sm flex items-center gap-1">
                      <Check className="w-3 h-3" /> Текущая
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {loc.description}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1.5 px-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Покрытие: <strong className="text-slate-200 capitalize">{loc.groundType}</strong></span>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-4 pt-3 border-t border-slate-700/60">
                  {loc.unlocked ? (
                    <button
                      onClick={() => {
                        soundManager.playSwitchPlayer();
                        onSelectLocation(loc.id);
                      }}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Локация выбрана</span>
                        </>
                      ) : (
                        <span>Выбрать арену</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          onUnlockLocation(loc.id, loc.price);
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Открыть за {loc.price} монет</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Баланс монет: <span className="font-bold font-mono text-amber-400">{coins}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-md"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
