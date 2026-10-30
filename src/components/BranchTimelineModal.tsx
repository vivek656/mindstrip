'use client';

import React, { useState } from 'react';
import { ComicWorld, ComicStrip } from '@/types/comic';
import { GitBranch, X, Sparkles, RotateCcw, ArrowRight, Layers, Film } from 'lucide-react';

interface BranchTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  world: ComicWorld;
  episode: ComicStrip | null;
  onForkBranch: (episodeNumber: number, branchTitle?: string, divergencePrompt?: string) => void;
  onRollback: (episodeNumber: number) => void;
}

export function BranchTimelineModal({
  isOpen,
  onClose,
  world,
  episode,
  onForkBranch,
  onRollback,
}: BranchTimelineModalProps) {
  const currentEpNum = episode?.episodeNumber || world.episodes.length || 1;
  const [branchMode, setBranchMode] = useState<'fork' | 'restart'>('fork');
  const [branchTitle, setBranchTitle] = useState('');
  const [divergencePrompt, setDivergencePrompt] = useState('');

  if (!isOpen) return null;

  const defaultBranchTitle = `${world.title} [Timeline B • from Ep #${currentEpNum}]`;

  const handleExecute = () => {
    if (branchMode === 'fork') {
      onForkBranch(currentEpNum, branchTitle.trim() || defaultBranchTitle, divergencePrompt.trim() || undefined);
    } else {
      onRollback(currentEpNum);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border-2 border-zinc-950 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b-2 border-zinc-950 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <GitBranch className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-950">
                  Multiverse Timeline Branching
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-2xs font-mono font-bold">
                  Branch from Ep #{currentEpNum}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Split reality like ChatGPT branches. Explore alternate story outcomes without losing original canon.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Branch Point Info Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-black/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-7 h-7 rounded-lg bg-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-xs shrink-0">
                #{currentEpNum}
              </span>
              <div className="truncate">
                <span className="font-bold text-zinc-900 block truncate">
                  {episode?.title || `${world.title}: Episode #${currentEpNum}`}
                </span>
                <span className="text-2xs text-zinc-500 font-mono">
                  Preserving World Bible, Cast dossiers & Canon up to this episode
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-zinc-700 font-mono text-2xs font-bold shrink-0">
              Split Point
            </span>
          </div>

          {/* Branching Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-zinc-700 block">
              Choose Branching Mode:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Fork Parallel Universe (Recommended) */}
              <button
                type="button"
                onClick={() => setBranchMode('fork')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  branchMode === 'fork'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-emerald-600" />
                    <span>Fork New Universe</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                    Safe
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Creates an alternate timeline universe (e.g. <i>Timeline B</i>). Your original comic remains completely intact!
                </p>
              </button>

              {/* Option 2: Rollback / Restart from Here */}
              <button
                type="button"
                onClick={() => setBranchMode('restart')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  branchMode === 'restart'
                    ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>Restart from Ep #{currentEpNum}</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono text-[9px] font-bold">
                    Overwrite
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Rolls back the current universe to this episode, removing any subsequent episodes so you can continue freshly.
                </p>
              </button>
            </div>
          </div>

          {/* If Forking: Branch Title */}
          {branchMode === 'fork' && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-zinc-700 block">
                Branch Universe Title:
              </label>
              <input
                type="text"
                value={branchTitle}
                onChange={(e) => setBranchTitle(e.target.value)}
                placeholder={defaultBranchTitle}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-emerald-600 outline-none text-xs font-medium"
              />
            </div>
          )}

          {/* Divergence Prompt (What If?) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-zinc-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>What happens differently in this timeline? (Optional):</span>
              </label>
            </div>
            <textarea
              value={divergencePrompt}
              onChange={(e) => setDivergencePrompt(e.target.value)}
              rows={2}
              placeholder="e.g. 'What if Vico escaped with the core?' or 'What if the villain's ambush succeeded?'"
              className="w-full p-3 rounded-xl border border-zinc-300 focus:border-emerald-600 outline-none text-xs text-zinc-800 font-sans"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/[0.08] bg-zinc-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecute}
            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>
              {branchMode === 'fork' ? 'Launch Multiverse Branch' : `Restart from Ep #${currentEpNum}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
