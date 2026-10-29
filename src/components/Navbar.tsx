'use client';

import React from 'react';
import { Settings, LayoutGrid, Columns3, Rows3, Sparkles } from 'lucide-react';
import { ArtStyle } from '@/types/comic';

export type ViewMode = 'grid' | 'strip' | 'webtoon';

interface NavbarProps {
  onOpenSettings: () => void;
  activeModel: string;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  currentStyle: ArtStyle;
  onChangeStyle: (style: ArtStyle) => void;
}

export function Navbar({
  onOpenSettings,
  activeModel,
  viewMode,
  onChangeViewMode,
  currentStyle,
  onChangeStyle,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-black/75 backdrop-blur-2xl transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-semibold text-xs tracking-tight shadow-sm">
            M
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
              MindStrip
            </span>
            <span className="hidden sm:inline-block text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              Meta AI Hackathon
            </span>
          </div>
        </div>

        {/* Center: Apple-style Segmented Control for Layout */}
        <div className="flex items-center apple-segmented text-xs">
          <button
            onClick={() => onChangeViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={() => onChangeViewMode('strip')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              viewMode === 'strip'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storyboard</span>
          </button>

          <button
            onClick={() => onChangeViewMode('webtoon')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              viewMode === 'webtoon'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Rows3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Feed</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Subtle model indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.06] text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="truncate max-w-[120px]">{activeModel}</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors"
            title="Model & Provider Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
