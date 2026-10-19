import React from 'react';
import {
  Trophy,
  Coins,
  Volume2,
  VolumeX,
  Pause,
  Repeat,
  Zap,
  Flame,
  Users
} from 'lucide-react';
import { MatchStats, LocationDef, GameMode, CharacterDef } from '../types/game';

interface HUDProps {
  stats: MatchStats;
  location: LocationDef;
  gameMode: GameMode;
  activePlayerIndex: 0 | 1;
  p1Char: CharacterDef;
  p2Char: CharacterDef;
  soundEnabled: boolean;
  coins: number;
  onToggleSound: () => void;
  onPause: () => void;
  onSwitchPlayer: () => void;
  onOpenCharacters: () => void;
  onOpenLocations: () => void;
  onOpenShop: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  location,
  gameMode,
  activePlayerIndex,
  p1Char,
  p2Char,
  soundEnabled,
  coins,
  onToggleSound,
  onPause,
  onSwitchPlayer,
  onOpenCharacters,
  onOpenLocations,
  onOpenShop,
}) => {
  const activeChar = activePlayerIndex === 0 ? p1Char : p2Char;

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none p-3 md:p-4 flex flex-col justify-between z-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 max-w-6xl mx-auto w-full">
        {/* Left: Location & Team Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOpenLocations}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold backdrop-blur-md transition-all shadow-sm active:scale-95"
            title="Выбрать локацию"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[130px]">{location.name}</span>
          </button>

          <button
            onClick={onOpenCharacters}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold backdrop-blur-md transition-all shadow-sm active:scale-95"
            title="Выбрать состав команды"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Дуэт: {p1Char.name} & {p2Char.name}</span>
          </button>
        </div>

        {/* Center: Scoreboard / Jumbotron */}
        <div className="flex flex-col items-center pointer-events-auto">
          {gameMode === 'MATCH_2V2' || gameMode === 'LOCAL_PVP' ? (
            <div className="flex items-center bg-slate-950/90 border border-slate-700/80 rounded-2xl px-4 py-1.5 shadow-xl backdrop-blur-lg gap-4">
              {/* Left Team (User) */}
              <div className="flex items-center gap-2 text-right">
                <div>
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Ваша команда</div>
                  <div className="flex items-center justify-end gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i < stats.leftTouches ? 'bg-sky-400 shadow-sm shadow-sky-400' : 'bg-slate-700'
                        }`}
                        title="Касания (макс 3)"
                      />
                    ))}
                  </div>
                </div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                  {stats.leftScore}
                </span>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center px-1">
                <span className="text-[10px] font-black text-amber-400 tracking-widest">ДО {stats.targetScore}</span>
                <span className="text-xs font-bold text-slate-500">:</span>
              </div>

              {/* Right Team (Opponent) */}
              <div className="flex items-center gap-2 text-left">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                  {stats.rightScore}
                </span>
                <div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    {gameMode === 'LOCAL_PVP' ? 'Игрок 2' : 'Соперник'}
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i < stats.rightTouches ? 'bg-rose-400 shadow-sm shadow-rose-400' : 'bg-slate-700'
                        }`}
                        title="Касания соперника (макс 3)"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Endless Keep-Up Mode
            <div className="flex items-center bg-slate-950/90 border border-slate-700/80 rounded-2xl px-5 py-2 shadow-xl backdrop-blur-lg gap-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Чеканка в воздухе</div>
                  <div className="text-2xl font-black font-mono text-white tabular-nums">
                    {stats.keepUpCombo} <span className="text-xs font-normal text-slate-400">ударов</span>
                  </div>
                </div>
              </div>
              <div className="h-7 w-px bg-slate-800" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Рекорд</div>
                <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                  {stats.maxCombo}
                </div>
              </div>
            </div>
          )}

          {/* Keep-up combo streak banner */}
          {stats.keepUpCombo > 1 && (
            <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 rounded-full text-[11px] font-extrabold text-amber-300 animate-pulse">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Комбо ралли: {stats.keepUpCombo}x</span>
            </div>
          )}
        </div>

        {/* Right: Coins, Shop & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Coins Badge */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold backdrop-blur-md transition-all shadow-sm active:scale-95"
            title="Магазин мячей и улучшений"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono tabular-nums">{coins}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl transition-all shadow-sm active:scale-95"
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl transition-all shadow-sm active:scale-95"
            title="Пауза [ESC]"
          >
            <Pause className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Quick Player Switch Banner for Keyboard users */}
      <div className="pointer-events-auto self-start mt-2 hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-950/75 border border-slate-800 rounded-lg text-xs backdrop-blur-sm">
        <span className="text-slate-400">Управление:</span>
        <button
          onClick={onSwitchPlayer}
          className="flex items-center gap-1.5 font-bold text-sky-400 hover:text-sky-300 transition-colors"
        >
          <span className="bg-sky-500/20 border border-sky-400/40 rounded px-1.5 py-0.5 text-[10px] font-mono">ПРОБЕЛ</span>
          <span>Сменить на {activePlayerIndex === 0 ? p2Char.name : p1Char.name}</span>
          <Repeat className="w-3 h-3 text-sky-400" />
        </button>
      </div>
    </div>
  );
};
