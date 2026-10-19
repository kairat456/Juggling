import React from 'react';
import { X, Lock, Check, Sparkles, Flame, Coins, Zap } from 'lucide-react';
import { BallDef } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface ShopModalProps {
  balls: BallDef[];
  activeBallId: string;
  coins: number;
  onSelectBall: (id: string) => void;
  onUnlockBall: (id: string, price: number) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  balls,
  activeBallId,
  coins,
  onSelectBall,
  onUnlockBall,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Коллекция Мячей
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Выбирайте мячи с уникальными эффектами и бонусами к заработку монет
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
          {balls.map((b) => {
            const isActive = b.id === activeBallId;
            const canAfford = coins >= b.price;

            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/20'
                    : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    {/* Visual Ball Icon Preview */}
                    <div
                      className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center shadow-lg relative shrink-0"
                      style={{
                        backgroundColor: b.primaryColor,
                        boxShadow:
                          b.pattern === 'fire'
                            ? '0 0 16px rgba(239, 68, 68, 0.7)'
                            : b.pattern === 'neon'
                            ? '0 0 16px rgba(6, 182, 212, 0.7)'
                            : b.pattern === 'gold'
                            ? '0 0 14px rgba(245, 158, 11, 0.6)'
                            : 'none',
                      }}
                    >
                      {b.pattern === 'gold' && <Sparkles className="w-5 h-5 text-amber-900" />}
                      {b.pattern === 'fire' && <Flame className="w-6 h-6 text-yellow-300" />}
                      {b.pattern === 'neon' && <Zap className="w-5 h-5 text-fuchsia-300" />}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-extrabold text-white text-sm truncate">
                        {b.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          +{Math.round((b.bonusCoinMultiplier - 1) * 100)}% Монет
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* Button */}
                <div className="mt-4 pt-3 border-t border-slate-700/60">
                  {b.unlocked ? (
                    <button
                      onClick={() => {
                        soundManager.playCoin();
                        onSelectBall(b.id);
                      }}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Мяч выбран</span>
                        </>
                      ) : (
                        <span>Выбрать этот мяч</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          onUnlockBall(b.id, b.price);
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
                      <span>Купить за {b.price} монет</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Баланс: <strong className="font-mono text-amber-400 text-sm">{coins}</strong></span>
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
