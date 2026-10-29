'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Camera, Zap, Volume2 } from 'lucide-react';

interface ComicFlipPreviewProps {
  onOpenStudio?: () => void;
}

export function ComicFlipPreview({ onOpenStudio }: ComicFlipPreviewProps) {
  const [currentSpread, setCurrentSpread] = useState<0 | 1>(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlip = (nextSpread: 0 | 1) => {
    if (isFlipping || nextSpread === currentSpread) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentSpread(nextSpread);
      setIsFlipping(false);
    }, 280);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 3D Comic Spread Container */}
      <div className="relative w-full max-w-xl aspect-[16/10] sm:aspect-[16/9] perspective-[1200px]">
        {/* Subtle drop shadow and book spine depth */}
        <div className="absolute inset-0 bg-black/10 rounded-2xl transform translate-y-3 blur-md -z-10" />

        {/* The Open Comic Book */}
        <div
          className={`w-full h-full bg-[#fdfcf9] rounded-2xl border-2 border-zinc-950 shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
            isFlipping ? 'scale-[0.98] rotate-y-3 opacity-90' : 'scale-100 rotate-y-0 opacity-100'
          }`}
        >
          {/* Comic Spine Header */}
          <div className="h-9 border-b-2 border-zinc-950 bg-zinc-100 px-4 flex items-center justify-between text-[11px] font-mono text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-bold text-zinc-950 uppercase tracking-wider">THE 2 AM DEV LAB</span>
              <span className="text-zinc-500">• Issue #1: Architecture Mirage</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="font-semibold text-zinc-800">{currentSpread === 0 ? 'PANELS 1 & 2' : 'PANELS 3 & 4'}</span>
              <span className="bg-zinc-200 px-1.5 py-0.5 rounded text-[10px] text-zinc-700 font-bold">
                PAGE {currentSpread + 1}/2
              </span>
            </div>
          </div>

          {/* Facing Comic Panels (Clean Graphic Novel Storyboard Cards - Zero Coded SVGs) */}
          <div className="flex-1 p-3.5 sm:p-4 grid grid-cols-2 gap-3 sm:gap-4 relative bg-zinc-50">
            {/* Center Book Fold Crease */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-black/[0.08] to-transparent pointer-events-none z-10" />

            {currentSpread === 0 ? (
              <>
                {/* Panel 1 */}
                <div className="border-2 border-zinc-950 rounded-xl bg-white p-3 flex flex-col justify-between relative shadow-xs group">
                  <div className="flex items-center justify-between text-[10px] font-mono pb-2 border-b border-black/[0.08]">
                    <span className="font-black bg-zinc-950 text-white px-1.5 py-0.5 rounded uppercase">
                      #1 SETUP
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                      BZZZT!
                    </span>
                  </div>

                  {/* Scene Direction */}
                  <div className="my-auto py-1 space-y-1.5">
                    <div className="flex items-start gap-1.5 text-xs font-serif italic text-zinc-800 leading-snug">
                      <Camera className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                      <span>Alex staring at 14 terminal screens in a dark room illuminated only by monitor glow.</span>
                    </div>
                  </div>

                  {/* Speech Bubble */}
                  <div className="bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-[11px] leading-tight text-zinc-900 shadow-2xs">
                    <span className="font-bold text-[9px] uppercase font-mono text-blue-600 block flex items-center gap-1">
                      <span>⚡</span>
                      <span>Alex (Developer):</span>
                    </span>
                    &ldquo;If I don't migrate this to 14 microservices right now, the database dies!&rdquo;
                  </div>
                </div>

                {/* Panel 2 */}
                <div className="border-2 border-zinc-950 rounded-xl bg-white p-3 flex flex-col justify-between relative shadow-xs group">
                  <div className="flex items-center justify-between text-[10px] font-mono pb-2 border-b border-black/[0.08]">
                    <span className="font-black bg-red-600 text-white px-1.5 py-0.5 rounded uppercase">
                      #2 CONFLICT
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-900 font-bold border border-red-300">
                      DOOOM!
                    </span>
                  </div>

                  {/* Scene Direction */}
                  <div className="my-auto py-1 space-y-1.5">
                    <div className="flex items-start gap-1.5 text-xs font-serif italic text-zinc-800 leading-snug">
                      <Camera className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                      <span>The personification of Overthinking manifests as a towering goblin made of architecture diagrams.</span>
                    </div>
                  </div>

                  {/* Speech Bubble */}
                  <div className="bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-[11px] leading-tight text-zinc-900 shadow-2xs">
                    <span className="font-bold text-[9px] uppercase font-mono text-red-600 block flex items-center gap-1">
                      <span>👹</span>
                      <span>Architecture Goblin:</span>
                    </span>
                    &ldquo;Rewrite the entire stack in Rust! Sleep is for the weak!&rdquo;
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Panel 3 */}
                <div className="border-2 border-zinc-950 rounded-xl bg-white p-3 flex flex-col justify-between relative shadow-xs group">
                  <div className="flex items-center justify-between text-[10px] font-mono pb-2 border-b border-black/[0.08]">
                    <span className="font-black bg-cyan-600 text-white px-1.5 py-0.5 rounded uppercase">
                      #3 BREAKTHROUGH
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-900 font-bold border border-cyan-300">
                      AHA!
                    </span>
                  </div>

                  {/* Scene Direction */}
                  <div className="my-auto py-1 space-y-1.5">
                    <div className="flex items-start gap-1.5 text-xs font-serif italic text-zinc-800 leading-snug">
                      <Camera className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                      <span>Maya calmly walks in holding coffee, highlighting a missing index on the database table.</span>
                    </div>
                  </div>

                  {/* Speech Bubble */}
                  <div className="bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-[11px] leading-tight text-zinc-900 shadow-2xs">
                    <span className="font-bold text-[9px] uppercase font-mono text-cyan-700 block flex items-center gap-1">
                      <span>☕</span>
                      <span>Maya (Senior Dev):</span>
                    </span>
                    &ldquo;Alex, look at the query plan. You just forgot to index user_id.&rdquo;
                  </div>
                </div>

                {/* Panel 4 */}
                <div className="border-2 border-zinc-950 rounded-xl bg-white p-3 flex flex-col justify-between relative shadow-xs group">
                  <div className="flex items-center justify-between text-[10px] font-mono pb-2 border-b border-black/[0.08]">
                    <span className="font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded uppercase">
                      #4 RESOLUTION
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                      SHIPPED!
                    </span>
                  </div>

                  {/* Scene Direction */}
                  <div className="my-auto py-1 space-y-1.5">
                    <div className="flex items-start gap-1.5 text-xs font-serif italic text-zinc-800 leading-snug">
                      <Camera className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                      <span>Quiet dawn outside the office window. A single index migration runs; laptop closed.</span>
                    </div>
                  </div>

                  {/* Speech Bubble */}
                  <div className="bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-[11px] leading-tight text-zinc-900 shadow-2xs">
                    <span className="font-bold text-[9px] uppercase font-mono text-emerald-700 block flex items-center gap-1">
                      <span>🎯</span>
                      <span>Core Truth:</span>
                    </span>
                    &ldquo;One SQL index beats 3 weeks of premature distributed architecture.&rdquo;
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Interactive Page Flip Footer */}
          <div className="h-10 border-t-2 border-zinc-950 bg-zinc-100 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleFlip(0)}
                disabled={currentSpread === 0 || isFlipping}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  currentSpread === 0
                    ? 'text-zinc-400 cursor-not-allowed'
                    : 'text-zinc-800 hover:bg-black/5 active:scale-95'
                }`}
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Panels 1-2</span>
              </button>

              <button
                onClick={() => handleFlip(1)}
                disabled={currentSpread === 1 || isFlipping}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  currentSpread === 1
                    ? 'text-zinc-400 cursor-not-allowed'
                    : 'text-zinc-800 hover:bg-black/5 active:scale-95'
                }`}
              >
                <span>Panels 3-4</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                Click to flip comic spread 📖
              </span>
              {onOpenStudio && (
                <button
                  onClick={onOpenStudio}
                  className="px-3 py-1 rounded-md bg-zinc-950 text-white text-[11px] font-bold hover:bg-blue-600 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>Open Full Studio</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
