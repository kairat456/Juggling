import React, { useState } from 'react';
import { X, Lock, Check, Zap, ArrowUp, Activity, Crosshair, Sparkles, RotateCw, Play } from 'lucide-react';
import { CharacterDef } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { CharacterPreview3D } from './CharacterPreview3D';

interface CharacterSelectModalProps {
  characters: CharacterDef[];
  p1CharId: string;
  p2CharId: string;
  coins: number;
  onSelectP1: (id: string) => void;
  onSelectP2: (id: string) => void;
  onUnlockCharacter: (id: string, price: number) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  characters,
  p1CharId,
  p2CharId,
  coins,
  onSelectP1,
  onSelectP2,
  onUnlockCharacter,
  onClose,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<'P1' | 'P2'>('P1');
  const [inspectedCharId, setInspectedCharId] = useState<string>(p1CharId);
  const [previewAction, setPreviewAction] = useState<'IDLE' | 'KICK' | 'BICYCLE' | 'SPIKE'>('IDLE');

  const inspectedChar = characters.find((c) => c.id === inspectedCharId) || characters[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              Выбор 3D Персонажей Команды
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Сформируйте свой звездный 3D дуэт и осмотрите модели в 360°
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Model Interactive Showcase Turntable */}
        <div className="my-3 p-3 sm:p-4 rounded-3xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Left: 3D Canvas */}
          <div className="md:col-span-5 flex flex-col items-center">
            <CharacterPreview3D character={inspectedChar} actionState={previewAction} />
            <div className="flex items-center gap-1.5 mt-2">
              {(['IDLE', 'KICK', 'BICYCLE', 'SPIKE'] as const).map((act) => (
                <button
                  key={act}
                  onClick={() => setPreviewAction(act)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    previewAction === act
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {act === 'IDLE' ? 'Стойка' : act === 'KICK' ? 'Удар' : act === 'BICYCLE' ? 'Бисиклета' : 'Спайк'}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Inspected Character Info & Direct Slot Assign */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    3D Просмотр · {inspectedChar.sport.toUpperCase()}
                  </span>
                  <h3 className="text-2xl font-black text-white">{inspectedChar.name}</h3>
                  <p className="text-xs font-semibold text-slate-300">{inspectedChar.title}</p>
                </div>

                <div className="text-right">
                  {inspectedChar.id === p1CharId && (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/40">
                      Игрок 1
                    </span>
                  )}
                  {inspectedChar.id === p2CharId && (
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40">
                      Игрок 2
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {inspectedChar.description}
              </p>

              {/* Special Move */}
              <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Особый прием: {inspectedChar.specialMove}</span>
              </div>
            </div>

            {/* Quick Assign Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => {
                  soundManager.playSwitchPlayer();
                  onSelectP1(inspectedChar.id);
                }}
                disabled={!inspectedChar.unlocked}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  inspectedChar.id === p1CharId
                    ? 'bg-sky-500 text-white shadow-md'
                    : inspectedChar.unlocked
                    ? 'bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700'
                    : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Назначить как Игрок 1</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playSwitchPlayer();
                  onSelectP2(inspectedChar.id);
                }}
                disabled={!inspectedChar.unlocked}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  inspectedChar.id === p2CharId
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : inspectedChar.unlocked
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                    : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Назначить как Игрок 2</span>
              </button>
            </div>
          </div>
        </div>

        {/* Slot Selector: Player 1 or Player 2 */}
        <div className="grid grid-cols-2 gap-3 my-2">
          <button
            onClick={() => {
              setSelectedSlot('P1');
              setInspectedCharId(p1CharId);
            }}
            className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between ${
              selectedSlot === 'P1'
                ? 'bg-sky-500/10 border-sky-400 ring-2 ring-sky-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Игрок 1 (Основа)</div>
              <div className="text-base font-extrabold text-white">
                {characters.find((c) => c.id === p1CharId)?.name}
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300">
              Выбрать
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSlot('P2');
              setInspectedCharId(p2CharId);
            }}
            className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between ${
              selectedSlot === 'P2'
                ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/20'
                : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Игрок 2 (Напарник)</div>
              <div className="text-base font-extrabold text-white">
                {characters.find((c) => c.id === p2CharId)?.name}
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300">
              Выбрать
            </span>
          </button>
        </div>

        {/* Character Roster Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-2">
          {characters.map((char) => {
            const isP1 = char.id === p1CharId;
            const isP2 = char.id === p2CharId;
            const isInspected = char.id === inspectedCharId;
            const canAfford = coins >= char.price;

            return (
              <div
                key={char.id}
                onClick={() => setInspectedCharId(char.id)}
                className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                  isInspected
                    ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-400/30 shadow-md'
                    : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {/* Character Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
                        style={{ backgroundColor: char.jerseyColor }}
                      >
                        {char.name[0]}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm leading-tight">
                          {char.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">{char.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isP1 && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/30">
                          P1
                        </span>
                      )}
                      {isP2 && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30">
                          P2
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats Bars */}
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 mt-2.5 pt-2 border-t border-slate-700/50 text-[10px]">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Скорость</span>
                        <span className="font-bold text-white font-mono">{char.speed}</span>
                      </div>
                      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${char.speed * 10}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Прыжок</span>
                        <span className="font-bold text-white font-mono">{char.jumpPower}</span>
                      </div>
                      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${char.jumpPower * 10}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Сила удара</span>
                        <span className="font-bold text-white font-mono">{char.kickPower}</span>
                      </div>
                      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400 rounded-full" style={{ width: `${char.kickPower * 10}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Контроль</span>
                        <span className="font-bold text-white font-mono">{char.control}</span>
                      </div>
                      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full" style={{ width: `${char.control * 10}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection or Unlock Button */}
                <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                  {char.unlocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playSwitchPlayer();
                        if (selectedSlot === 'P1') {
                          onSelectP1(char.id);
                        } else {
                          onSelectP2(char.id);
                        }
                      }}
                      className={`w-full py-1.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        (selectedSlot === 'P1' && isP1) || (selectedSlot === 'P2' && isP2)
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      <span>Назначить на {selectedSlot}</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canAfford) {
                          onUnlockCharacter(char.id, char.price);
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-1.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{char.price} монет</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Баланс: <span className="font-bold font-mono text-amber-400 text-sm">{coins}</span> монет
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-md"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
