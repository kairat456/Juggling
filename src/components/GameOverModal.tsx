import React from 'react';
import { Trophy, RotateCcw, Coins, Sparkles, Zap, Award, Users } from 'lucide-react';
import { MatchStats, GameMode } from '../types/game';

interface GameOverModalProps {
  stats: MatchStats;
  gameMode: GameMode;
  onPlayAgain: () => void;
  onOpenCharacters: () => void;
  onOpenLocations: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  gameMode,
  onPlayAgain,
  onOpenCharacters,
  onOpenLocations,
}) => {
  const isWin = stats.winner === 'LEFT';
  const isEndless = gameMode === 'ENDLESS_JUGGLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col text-center">
        {/* Victory Icon / Banner */}
        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg mb-3 ${
              isWin || isEndless
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 ring-4 ring-amber-400/30'
                : 'bg-gradient-to-tr from-rose-600 to-rose-400 text-white ring-4 ring-rose-500/30'
            }`}
          >
            {isWin || isEndless ? (
              <Trophy className="w-8 h-8 fill-current" />
            ) : (
              <Award className="w-8 h-8" />
            )}
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {isEndless
              ? 'Серия Чеканки Завершена!'
              : isWin
              ? 'ПОБЕДА В МАТЧЕ!'
              : 'ПОРАЖЕНИЕ'}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            {isEndless
              ? `Отличная чеканка! Мяч удержан ${stats.keepUpCombo} раз в воздухе.`
              : isWin
              ? `Поздравляем! Ваш дуэт переиграл соперников со счетом ${stats.leftScore}:${stats.rightScore}`
              : `Соперники выиграли сет ${stats.rightScore}:${stats.leftScore}. Возьмите реванш!`}
          </p>
        </div>

        {/* Big Score Block */}
        {!isEndless ? (
          <div className="flex items-center justify-center gap-6 my-4 py-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <div>
              <div className="text-[10px] font-bold text-sky-400 uppercase">Ваш дуэт</div>
              <div className="text-3xl font-black font-mono text-white tabular-nums">{stats.leftScore}</div>
            </div>
            <div className="text-xl font-bold text-slate-600">:</div>
            <div>
              <div className="text-[10px] font-bold text-rose-400 uppercase">Соперник</div>
              <div className="text-3xl font-black font-mono text-white tabular-nums">{stats.rightScore}</div>
            </div>
          </div>
        ) : (
          <div className="my-4 py-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-amber-400 uppercase">Серия чеканки</div>
            <div className="text-4xl font-black font-mono text-white tabular-nums">
              {stats.keepUpCombo} <span className="text-sm font-semibold text-slate-400">ударов</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-left text-xs mb-4">
          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 block text-[10px]">Макс комбо ралли:</span>
            <span className="font-extrabold font-mono text-amber-400 text-sm">
              {stats.maxCombo}x
            </span>
          </div>

          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 block text-[10px]">Удары через себя:</span>
            <span className="font-extrabold font-mono text-pink-400 text-sm">
              {stats.bicycleKicks}
            </span>
          </div>

          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 block text-[10px]">Волейбольные спайки:</span>
            <span className="font-extrabold font-mono text-rose-400 text-sm">
              {stats.spikes}
            </span>
          </div>

          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-slate-400 block text-[10px]">Головой & Грудью:</span>
            <span className="font-extrabold font-mono text-emerald-400 text-sm">
              {stats.headers + stats.chestControls}
            </span>
          </div>
        </div>

        {/* Coins Reward */}
        <div className="mb-4 flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Заработано монет:</span>
          </div>
          <span className="font-mono font-black text-amber-400 text-base">
            +{stats.coinsEarned}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Сыграть снова</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenCharacters}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Состав команды</span>
            </button>
            <button
              onClick={onOpenLocations}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Сменить арену</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
