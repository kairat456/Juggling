import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Keyboard, Trophy, Shield } from 'lucide-react';
import { AIDifficulty, GameMode } from '../types/game';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onSelectMode: (mode: GameMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  difficulty: AIDifficulty;
  onChangeDifficulty: (diff: AIDifficulty) => void;
  gameMode: GameMode;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onSelectMode,
  soundEnabled,
  onToggleSound,
  difficulty,
  onChangeDifficulty,
  gameMode,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col">
        {/* Title */}
        <div className="text-center pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-black text-white tracking-tight">
            ПАУЗА
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Игра приостановлена. Настройте параметры или повторите управление.
          </p>
        </div>

        {/* Controls Cheatsheet */}
        <div className="my-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-200 mb-2.5">
            <Keyboard className="w-4 h-4 text-sky-400" />
            <span>Управление клавиатурой:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
              <span>Движение:</span>
              <span className="font-mono font-bold text-sky-300">A / D или ← / →</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
              <span>Прыжок:</span>
              <span className="font-mono font-bold text-emerald-300">W или ↑</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
              <span>Удар ногой / Бисиклета:</span>
              <span className="font-mono font-bold text-amber-300">J / Z / F</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
              <span>Голова / Грудь:</span>
              <span className="font-mono font-bold text-amber-300">K / X</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
              <span>Волейбольный Спайк:</span>
              <span className="font-mono font-bold text-rose-300">L / C</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg col-span-2">
              <span>Смена активного игрока дуэта:</span>
              <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/30">
                ПРОБЕЛ / Q
              </span>
            </div>
          </div>
        </div>

        {/* Mode / Difficulty switcher */}
        {gameMode === 'MATCH_2V2' && (
          <div className="mb-4">
            <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Сложность соперников-ботов:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['EASY', 'NORMAL', 'HARD'] as AIDifficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => onChangeDifficulty(d)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    difficulty === d
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d === 'EASY' ? 'Новичок' : d === 'NORMAL' ? 'Профи' : 'Легенда'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Продолжить игру</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRestart}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Перезапустить</span>
            </button>

            <button
              onClick={onToggleSound}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{soundEnabled ? 'Звук: Вкл' : 'Звук: Выкл'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
