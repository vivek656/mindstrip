'use client';

import React, { useState } from 'react';
import { ComicWorld } from '@/types/comic';
import { 
  Plus, 
  ArrowRight, 
  Settings, 
  Sparkles, 
  Film, 
  Users, 
  Search, 
  BookOpen, 
  Layers, 
  Zap,
  Grid,
  Filter,
  X
} from 'lucide-react';
import { ComicFlipPreview } from './ComicFlipPreview';

import { ApiConfig } from '@/lib/meta-models';

interface ZenLandingProps {
  worlds: ComicWorld[];
  onSelectWorld: (world: ComicWorld) => void;
  onStartNewWorld: () => void;
  onOpenSettings: () => void;
  onQuickGenerate?: (prompt: string) => void;
  onAutoBuildWorld?: (spark: string) => Promise<void>;
  isAutoBuilding?: boolean;
  apiConfig?: ApiConfig;
  onToggleMode?: () => void;
}

export function ZenLanding({
  worlds,
  onSelectWorld,
  onStartNewWorld,
  onOpenSettings,
  onQuickGenerate,
  onAutoBuildWorld,
  isAutoBuilding = false,
  apiConfig,
  onToggleMode,
}: ZenLandingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [sparkInput, setSparkInput] = useState('');
  const [isSubmittingSpark, setIsSubmittingSpark] = useState(false);

  // Extract unique genres
  const genres = ['all', ...Array.from(new Set(worlds.map((w) => w.genre.split('&')[0].trim())))];

  // Filter worlds by search and genre
  const filteredWorlds = worlds.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.characters.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre =
      selectedGenre === 'all' ||
      w.genre.toLowerCase().includes(selectedGenre.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  const totalCharacters = worlds.reduce((acc, w) => acc + w.characters.length, 0);
  const totalEpisodes = worlds.reduce((acc, w) => acc + w.episodes.length, 0);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    if (onQuickGenerate) {
      onQuickGenerate(quickPrompt.trim());
    } else if (worlds.length > 0) {
      onSelectWorld(worlds[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#181716] flex flex-col justify-between selection:bg-zinc-200 w-full">
      
      {/* =========================================================================
          WIDESCREEN TOP NAVIGATION BAR
      ========================================================================= */}
      <header className="w-full border-b border-black/[0.08] bg-white/75 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white font-bold text-base flex items-center justify-center shadow-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-zinc-950">MindStrip</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-mono font-semibold uppercase tracking-wider">
                  Studio v1.2
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-zinc-400 font-normal">
                Comic Universe & Serialized Story Platform
              </p>
            </div>
          </div>

          {/* Quick Search & Genre Filter Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search universes, characters, storylines..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-zinc-100/80 border border-black/[0.06] text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all"
              />
            </div>
          </div>

          {/* Header Action Controls & Dual Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Mode Switcher (Free vs Meta API Preset) */}
            {apiConfig?.mode === 'meta' ? (
              <div className="flex items-center gap-1 p-1 rounded-full bg-blue-50/80 border border-blue-200">
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
                  title="Switch to Free Mode ($0.00 Zero Cost)"
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
                  title="Meta AI Mode Active (Click to view Meta presets)"
                >
                  <span>♾️</span>
                  <span>Meta AI Mode</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 p-1 rounded-full bg-zinc-100 border border-black/[0.08]">
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs transition-all cursor-pointer"
                  title="Free Mode Active ($0.00 Zero Cost)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span>Free ($0.00)</span>
                </button>
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-zinc-600 hover:text-blue-600 transition-all cursor-pointer"
                  title="Switch to Meta AI Mode (Hackathon Preset)"
                >
                  <span>♾️</span>
                  <span>Meta AI</span>
                </button>
              </div>
            )}

            <button
              onClick={onStartNewWorld}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Universe</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full border border-black/10 hover:bg-black/[0.04] text-zinc-700 transition-colors cursor-pointer"
              title="Meta Models & API Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN EXPANSIVE DESKTOP CANVAS
      ========================================================================= */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 py-8 lg:py-12 flex flex-col gap-12">
        
        {/* =======================================================================
            HERO SPOTLIGHT: 2-COLUMN WIDESCREEN SECTION (HERO + 3D FLIPBOOK)
        ======================================================================= */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white/60 border border-black/[0.07] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
          
          {/* Left Column: Confident Platform Narrative & Quick Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
              <span>Persistent AI Comic Continuity</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.12]">
              Build your comic world. <br />
              <span className="text-zinc-500 font-normal">One episode at a time.</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed max-w-xl">
              MindStrip is a serialized comic creation studio. Define your recurring characters, 
              pick your visual aesthetic, and direct multi-episode storylines with an intelligent Meta AI Co-Director.
            </p>

            {/* Quick Stats Pill Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-black/[0.06] text-xs">
                <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-bold text-zinc-900">{worlds.length}</span>
                <span className="text-zinc-500">Active Universes</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-black/[0.06] text-xs">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-bold text-zinc-900">{totalCharacters}</span>
                <span className="text-zinc-500">Recurring Characters</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-black/[0.06] text-xs">
                <Film className="w-3.5 h-3.5 text-zinc-500" />
                <span className="font-bold text-zinc-900">{totalEpisodes}</span>
                <span className="text-zinc-500">Episodes Created</span>
              </div>
            </div>

            {/* Fast Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => setIsAutoModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                <span>Auto-Architect with Meta AI</span>
              </button>

              <button
                onClick={onStartNewWorld}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-sm active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Custom Universe Studio</span>
              </button>

              {worlds.length > 0 && (
                <button
                  onClick={() => onSelectWorld(worlds[0])}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-black/15 text-zinc-800 hover:bg-zinc-50 hover:border-black/30 transition-all shadow-2xs cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Featured Universe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Comic Flipbook Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full">
              <ComicFlipPreview
                onOpenStudio={() => {
                  if (worlds.length > 0) onSelectWorld(worlds[0]);
                }}
              />
            </div>
          </div>

        </section>

        {/* =======================================================================
            UNIVERSE GALLERY & WORKSPACE SECTION
        ======================================================================= */}
        <section className="w-full space-y-6">
          
          {/* Section Bar: Category Filter Chips & Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.08]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-zinc-900">Your Comic Universes</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700 text-xs font-mono font-semibold">
                {filteredWorlds.length}
              </span>
            </div>

            {/* Genre Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-zinc-400 font-mono text-[11px] mr-1 hidden md:inline">FILTER:</span>
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    selectedGenre === g
                      ? 'bg-zinc-950 text-white shadow-2xs'
                      : 'bg-white border border-black/10 text-zinc-600 hover:border-black/20'
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Expansive Responsive Desktop Grid: 3 Columns on Desktop, 2 on Tablet, 1 on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {filteredWorlds.map((world) => {
              const latestEpisode = world.episodes[world.episodes.length - 1];
              return (
                <div
                  key={world.id}
                  onClick={() => onSelectWorld(world)}
                  className="editorial-sheet rounded-3xl p-6 bg-white hover:border-black/30 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group h-full min-h-[360px]"
                >
                  {/* Top Header Row */}
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-medium font-mono uppercase tracking-wider">
                        {world.genre}
                      </span>
                      <span className="font-mono text-xs font-semibold text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded-md border border-black/[0.04]">
                        {world.episodes.length} {world.episodes.length === 1 ? 'Episode' : 'Episodes'}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl text-zinc-950 group-hover:text-blue-600 transition-colors leading-snug">
                      {world.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {world.tagline}
                    </p>
                  </div>

                  {/* Visual Miniature Comic Strip Preview (3-Panel Micro Showcase) */}
                  <div className="my-5 p-3 rounded-2xl bg-[#faf9f6] border border-black/[0.08] group-hover:border-black/15 transition-all">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="font-semibold text-zinc-600">Latest: {latestEpisode?.title || 'Episode #1'}</span>
                      <span className="text-[9px]">4-PANEL</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 aspect-[3/1] w-full">
                      {/* Mini Panel 1 */}
                      <div className="rounded-lg bg-white border border-black/[0.08] p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs">
                        <div className="w-full flex-1 flex items-center justify-center">
                          <svg viewBox="0 0 60 40" className="w-full h-full opacity-80">
                            <rect x="5" y="28" width="50" height="2" fill="#181716" />
                            <circle cx="25" cy="18" r="7" fill="#ffffff" stroke="#181716" strokeWidth="1.5" />
                            <rect x="35" y="16" width="12" height="12" rx="2" fill="#e5e5ea" stroke="#181716" strokeWidth="1" />
                          </svg>
                        </div>
                        <div className="text-[8px] font-mono text-zinc-400 text-center truncate">#1 Setup</div>
                      </div>

                      {/* Mini Panel 2 */}
                      <div className="rounded-lg bg-white border border-black/[0.08] p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs">
                        <div className="w-full flex-1 flex items-center justify-center">
                          <svg viewBox="0 0 60 40" className="w-full h-full opacity-80">
                            <circle cx="30" cy="18" r="9" fill="#181716" />
                            <circle cx="27" cy="16" r="1.5" fill="#facc15" />
                            <circle cx="33" cy="16" r="1.5" fill="#facc15" />
                          </svg>
                        </div>
                        <div className="text-[8px] font-mono text-red-500 text-center truncate">#2 Conflict</div>
                      </div>

                      {/* Mini Panel 3 */}
                      <div className="rounded-lg bg-white border border-black/[0.08] p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs">
                        <div className="w-full flex-1 flex items-center justify-center">
                          <svg viewBox="0 0 60 40" className="w-full h-full opacity-80">
                            <circle cx="30" cy="18" r="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
                            <path d="M 26 18 L 29 21 L 34 15" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="text-[8px] font-mono text-emerald-600 text-center truncate">#3 Fix</div>
                      </div>
                    </div>
                  </div>

                  {/* Cast Row & Studio Launch Action */}
                  <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1.5">
                        {world.characters.map((char) => (
                          <span
                            key={char.id}
                            className="w-7 h-7 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-xs shadow-xs"
                            title={`${char.name} (${char.role})`}
                          >
                            {char.avatarEmoji}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        {world.characters.length} cast
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800 group-hover:text-zinc-950 transition-colors">
                      <span>Open Studio</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* "Create New Universe" Large Creative Canvas Card */}
            <div
              onClick={onStartNewWorld}
              className="rounded-3xl border-2 border-dashed border-black/15 hover:border-black/40 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/40 hover:bg-white min-h-[360px] group shadow-2xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white transition-all flex items-center justify-center text-zinc-700 mb-4 shadow-xs">
                <Plus className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-zinc-950 mb-1">
                Start a New Universe
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed mb-4">
                Define your world premise, create recurring characters, and let Meta AI illustrate serialized episodes.
              </p>
              <span className="px-4 py-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors">
                + Launch World Builder
              </span>
            </div>

          </div>
        </section>

        {/* =======================================================================
            QUICK COMIC PROMPT DOCK (INSTANT STRIP GENERATION)
        ======================================================================= */}
        <section className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-left max-w-md">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-sm text-zinc-900">Instant Comic Idea?</span>
            </div>
            <p className="text-xs text-zinc-500">
              Type what happened today or your story concept to immediately generate a 4-panel comic strip.
            </p>
          </div>

          <form onSubmit={handleQuickSubmit} className="flex-1 w-full max-w-xl flex items-center gap-2">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="e.g. Spent 4 hours debugging only to realize the WiFi was turned off..."
              className="flex-1 px-4 py-2.5 rounded-full bg-zinc-100 border border-black/[0.08] text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-900 transition-all"
            />
            <button
              type="submit"
              disabled={!quickPrompt.trim()}
              className="px-5 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 transition-all shrink-0 shadow-xs"
            >
              Generate Strip
            </button>
          </form>
        </section>

      </main>

      {/* =========================================================================
          FOOTER
      ========================================================================= */}
      <footer className="w-full border-t border-black/[0.06] bg-white/40 py-6 mt-12">
        <div className="w-full max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-700">MindStrip</span>
            <span>• Meta Global AI Developer Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <span>Theme: "Build for Your World"</span>
            <span>Meta Muse Spark + Llama 3.3 + SAM 3.1</span>
            <button onClick={onOpenSettings} className="hover:text-zinc-700 underline underline-offset-2">
              API Settings
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          META AI AUTO-ARCHITECT UNIVERSE MODAL
      ========================================================================= */}
      {isAutoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white border-2 border-zinc-950 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-base">
                  ⚡
                </span>
                <div>
                  <h3 className="font-bold text-lg text-zinc-950">Meta AI World Architect</h3>
                  <p className="text-xs text-zinc-500">Autonomous world-building, character design & lore synthesis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!sparkInput.trim() || isSubmittingSpark || !onAutoBuildWorld) return;
                setIsSubmittingSpark(true);
                try {
                  await onAutoBuildWorld(sparkInput.trim());
                  setIsAutoModalOpen(false);
                  setSparkInput('');
                } finally {
                  setIsSubmittingSpark(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800">
                  Enter your creative spark or world concept:
                </label>
                <textarea
                  value={sparkInput}
                  onChange={(e) => setSparkInput(e.target.value)}
                  placeholder="e.g. A sleepy nighttime barista fighting cosmic coffee demons with a sarcastic AI cat..."
                  rows={3}
                  required
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs sm:text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              {/* Quick Inspiration Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-500 font-bold block">
                  Quick Sparks (Click to load):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Late night ER doctor teaming up with a retired street vigilante',
                    'Two founders running a quantum startup in an abandoned subway station',
                    'A weary space mechanic who accidentally adopts an alien shapeshifter',
                    'Vampire accountant doing tax audits in a sunny beach town'
                  ].map((spark) => (
                    <button
                      key={spark}
                      type="button"
                      onClick={() => setSparkInput(spark)}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors text-left cursor-pointer"
                    >
                      {spark}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAutoModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!sparkInput.trim() || isSubmittingSpark || isAutoBuilding}
                  className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingSpark || isAutoBuilding ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Inventing Universe & Characters...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Build Universe with Meta AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
