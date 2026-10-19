import React from 'react';
import { Trophy, Flame, Users, Sparkles, Play, ShieldCheck, Heart } from 'lucide-react';
import { GameMode } from '../types/game';

interface ModeSelectModalProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onOpenCharacters: () => void;
  onOpenLocations: () => void;
  onOpenShop: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  currentMode,
  onSelectMode,
  onStartGame,
  onOpenCharacters,
  onOpenLocations,
  onOpenShop,
}) => {
  const modes: { id: GameMode; title: string; subtitle: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'MATCH_2V2',
      title: 'Матч 2v2 (Турнир)',
      subtitle: 'Командная битва через сетку',
      desc: 'Вы управляете дуэтом игроков. До 3 касаний на команду. Забивайте мяч на половину соперника до 5 очков!',
      icon: <Trophy className="w-6 h-6 text-sky-400" />,
      color: 'border-sky-500/60 bg-sky-500/10',
    },
    {
      id: 'ENDLESS_JUGGLE',
      title: 'Чеканка Рекорд',
      subtitle: 'Не дайте мячу упасть!',
      desc: 'Классическая чеканка мяча в воздухе всеми частями тела (ноги, голова, грудь, руки) с перебросом через сетку.',
      icon: <Flame className="w-6 h-6 text-amber-400" />,
      color: 'border-amber-500/60 bg-amber-500/10',
    },
    {
      id: 'LOCAL_PVP',
      title: '2 Игрока (Один экран)',
      subtitle: 'Играйте с другом на клавиатуре',
      desc: 'Игрок 1 управляет левой командой (WASD + F/G), Игрок 2 — правой командой (Стрелки + K/L).',
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      color: 'border-emerald-500/60 bg-emerald-500/10',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Title */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>2D Аркадный Футволей & Чеканка</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            FOOTVOLLEY DUO
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Чеканьте мяч ногами, головой, грудью и руками через волейбольную сетку!
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 gap-3 my-4">
          {modes.map((m) => {
            const isSelected = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? `${m.color} ring-2 ring-sky-400/30 shadow-lg`
                    : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800'
                }`}
              >
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 shrink-0">
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-white text-base leading-tight">
                      {m.title}
                    </h3>
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500 text-white shadow-sm">
                        Выбрано
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">
                    {m.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tricks & Body Parts Quick Guide */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs mb-4">
          <div className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Приемы и части тела в игре:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
            <div className="bg-slate-900/60 p-2 rounded-xl">
              <strong className="text-sky-300 block">Удар ногой:</strong>
              Мощный подъем мяча и чеканка
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl">
              <strong className="text-pink-300 block">Бисиклета:</strong>
              Удар через себя в воздухе
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl">
              <strong className="text-amber-300 block">Голова / Грудь:</strong>
              Высокий навес и мягкий прием
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl">
              <strong className="text-rose-300 block">Спайк руками:</strong>
              Волейбольный сброс под сетку
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={onStartGame}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-sky-600/20 transition-transform active:scale-98"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Начать игру</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onOpenCharacters}
              className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Персонажи</span>
            </button>

            <button
              onClick={onOpenLocations}
              className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Локации (4)</span>
            </button>

            <button
              onClick={onOpenShop}
              className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Мячи</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
