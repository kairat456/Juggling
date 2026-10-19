import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Repeat,
  Zap,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: (active: boolean) => void;
  onMoveRight: (active: boolean) => void;
  onJump: () => void;
  onKick: () => void;
  onHeader: () => void;
  onSpike: () => void;
  onSwitchPlayer: () => void;
  activePlayerName: string;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onJump,
  onKick,
  onHeader,
  onSpike,
  onSwitchPlayer,
  activePlayerName,
}) => {
  return (
    <div className="md:hidden absolute inset-x-0 bottom-3 px-3 pointer-events-none flex items-end justify-between z-30 select-none">
      {/* Left Pad: Move Left & Move Right & Switch Player */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={onSwitchPlayer}
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-sky-600/80 active:bg-sky-500 text-white font-bold text-xs rounded-xl border border-sky-400/50 backdrop-blur-md shadow-lg active:scale-95 transition-transform"
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Сменить ({activePlayerName})</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => onMoveLeft(true)}
            onTouchEnd={() => onMoveLeft(false)}
            onMouseDown={() => onMoveLeft(true)}
            onMouseUp={() => onMoveLeft(false)}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-slate-700/90 text-white border border-slate-700 flex items-center justify-center shadow-lg active:scale-95 transition-all backdrop-blur-md"
            aria-label="Влево"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onTouchStart={() => onMoveRight(true)}
            onTouchEnd={() => onMoveRight(false)}
            onMouseDown={() => onMoveRight(true)}
            onMouseUp={() => onMoveRight(false)}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-slate-700/90 text-white border border-slate-700 flex items-center justify-center shadow-lg active:scale-95 transition-all backdrop-blur-md"
            aria-label="Вправо"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Right Pad: Jump, Kick, Header, Spike */}
      <div className="grid grid-cols-2 gap-2 pointer-events-auto">
        {/* Header / Chest */}
        <button
          onClick={onHeader}
          className="w-14 h-14 rounded-2xl bg-amber-600/80 active:bg-amber-500 text-white border border-amber-400/50 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all backdrop-blur-md"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Голова</span>
        </button>

        {/* Jump */}
        <button
          onClick={onJump}
          className="w-14 h-14 rounded-2xl bg-emerald-600/80 active:bg-emerald-500 text-white border border-emerald-400/50 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all backdrop-blur-md"
        >
          <ArrowUp className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Прыжок</span>
        </button>

        {/* Kick / Bicycle */}
        <button
          onClick={onKick}
          className="w-14 h-14 rounded-2xl bg-blue-600/80 active:bg-blue-500 text-white border border-blue-400/50 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all backdrop-blur-md"
        >
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Удар/Бисик</span>
        </button>

        {/* Spike / Hands */}
        <button
          onClick={onSpike}
          className="w-14 h-14 rounded-2xl bg-rose-600/80 active:bg-rose-500 text-white border border-rose-400/50 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Спайк</span>
        </button>
      </div>
    </div>
  );
};
