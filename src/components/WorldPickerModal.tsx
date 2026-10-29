'use client';

import React from 'react';
import { ComicWorld } from '@/types/comic';
import { X, Plus, BookOpen, ArrowRight } from 'lucide-react';

interface WorldPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  worlds: ComicWorld[];
  activeWorldId: string;
  onSelectWorld: (world: ComicWorld) => void;
  onOpenCreateNew: () => void;
}

export function WorldPickerModal({
  isOpen,
  onClose,
  worlds,
  activeWorldId,
  onSelectWorld,
  onOpenCreateNew,
}: WorldPickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-black/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-zinc-900" />
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                Continue a Comic Universe
              </h3>
              <p className="text-xs text-zinc-500">Pick up an existing series or build a new one</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Worlds Grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {worlds.map((w) => {
              const isActive = w.id === activeWorldId;
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    onSelectWorld(w);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-zinc-900 bg-zinc-50/90 ring-1 ring-zinc-900'
                      : 'border-black/10 hover:border-black/30 bg-white hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        {w.genre}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-600">
                        {w.episodes.length} {w.episodes.length === 1 ? 'Ep' : 'Eps'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-900 mb-1">
                      {w.title}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {w.tagline}
                    </p>
                  </div>

                  {/* Character Avatars */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/[0.06]">
                    <div className="flex items-center -space-x-1">
                      {w.characters.map((c) => (
                        <span
                          key={c.id}
                          className="w-6 h-6 rounded-full bg-zinc-100 border border-white flex items-center justify-center text-xs shadow-xs"
                          title={`${c.name} (${c.role})`}
                        >
                          {c.avatarEmoji}
                        </span>
                      ))}
                    </div>

                    <span className="text-[11px] font-medium text-zinc-700 flex items-center gap-1">
                      <span>Open World</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-black/[0.08] bg-zinc-50/60 flex items-center justify-between">
          <span className="text-xs text-zinc-500">Want a fresh storyline?</span>
          <button
            onClick={() => {
              onClose();
              onOpenCreateNew();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start a New World</span>
          </button>
        </div>

      </div>
    </div>
  );
}
