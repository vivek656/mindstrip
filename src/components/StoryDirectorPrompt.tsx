'use client';

import React, { useState } from 'react';
import { ComicWorld, LayoutMode } from '@/types/comic';
import { Sparkles, ArrowRight, LayoutGrid, Columns3, Rows3, Plus, Compass } from 'lucide-react';

interface StoryDirectorPromptProps {
  world: ComicWorld;
  currentEpisodeNumber: number;
  layoutMode: LayoutMode;
  onChangeLayout: (layout: LayoutMode) => void;
  onGenerateEpisode: (storyPremise: string) => void;
  isLoading: boolean;
  onOpenWorldPicker: () => void;
  onOpenCreateWorld: () => void;
}

export function StoryDirectorPrompt({
  world,
  currentEpisodeNumber,
  layoutMode,
  onChangeLayout,
  onGenerateEpisode,
  isLoading,
  onOpenWorldPicker,
  onOpenCreateWorld,
}: StoryDirectorPromptProps) {
  const [prompt, setPrompt] = useState('');

  // Context-aware AI suggestions based on characters in this world
  const aiSuggestions = [
    `Our hero faces a critical decision and the ${world.characters.find(c => c.role === 'antagonist')?.name || 'antagonist'} appears`,
    `A routine task goes completely sideways in unexpected ways`,
    `An urgent message arrives that tests the team's core assumptions`,
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerateEpisode(prompt.trim());
    setPrompt('');
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      {/* World Identity Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-black/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
              Active Universe • {world.genre}
            </span>
            <span className="text-zinc-300">•</span>
            <button
              onClick={onOpenWorldPicker}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Switch World
            </button>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              {world.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-100 text-zinc-700">
              Ep #{currentEpisodeNumber}
            </span>
          </div>

          <p className="text-xs text-zinc-500 mt-0.5">{world.tagline}</p>
        </div>

        {/* Character Roster Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-400 font-medium">Cast:</span>
          {world.characters.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-black/10 text-xs shadow-2xs"
              title={`${c.name} — ${c.description}`}
            >
              <span>{c.avatarEmoji}</span>
              <span className="font-semibold text-zinc-800">{c.name}</span>
            </div>
          ))}

          <button
            onClick={onOpenCreateWorld}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors ml-1"
            title="Create a new universe"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New World</span>
          </button>
        </div>
      </div>

      {/* Director Console & Prompt */}
      <form onSubmit={handleSubmit} className="editorial-sheet rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.06] text-xs">
          <div className="flex items-center gap-1.5 font-medium text-zinc-700">
            <Sparkles className="w-4 h-4 text-zinc-900" />
            <span>AI Story Director — Episode #{currentEpisodeNumber}</span>
          </div>

          {/* Layout Controls */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => onChangeLayout('strip')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                layoutMode === 'strip'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Horizontal 4-Panel Strip"
            >
              <Columns3 className="w-3 h-3" />
              <span>Strip</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeLayout('grid')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                layoutMode === 'grid'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="2x2 Square Grid"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>2x2 Grid</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeLayout('webtoon')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                layoutMode === 'webtoon'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Vertical Feed"
            >
              <Rows3 className="w-3 h-3" />
              <span>Scroll</span>
            </button>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`What happens in this episode? (e.g. "${world.characters[0]?.name || 'Alex'} attempts a quick deployment, but gets sucked into an escalating chain reaction...")`}
          rows={3}
          className="w-full bg-transparent resize-y outline-none text-sm text-zinc-900 placeholder:text-zinc-400 leading-relaxed font-normal"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] mt-2 gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 flex-wrap">
            <span className="font-medium text-zinc-400">Idea prompts:</span>
            {aiSuggestions.slice(0, 2).map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(s)}
                className="text-xs text-zinc-600 hover:text-zinc-900 underline decoration-zinc-300 hover:decoration-zinc-700 transition-colors truncate max-w-[280px]"
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 shadow-sm ${
              !prompt.trim() || isLoading
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Scripting & Drawing...</span>
              </>
            ) : (
              <>
                <span>Generate Episode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
