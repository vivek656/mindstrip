'use client';

import React, { useState, forwardRef } from 'react';
import { ComicWorld, ComicStrip, ComicPanel, SpeechBubble } from '@/types/comic';
import { Sparkles, Users, RefreshCw, AlertCircle, Image as ImageIcon, Camera, Edit2, Check, ZoomIn, ZoomOut, ChevronDown, ChevronUp, Palette } from 'lucide-react';

interface ComicPageSpreadProps {
  world: ComicWorld;
  episode: ComicStrip;
  showBubbles?: boolean;
  onUpdateDialogue?: (panelNumber: number, bubbleId: string, text: string) => void;
  onGenerateArtwork?: () => void;
  isGeneratingArtwork?: boolean;
  artworkError?: string | null;
  className?: string;
}

export const ComicPageSpread = forwardRef<HTMLDivElement, ComicPageSpreadProps>(function ComicPageSpread(
  {
    world,
    episode,
    showBubbles = true,
    onUpdateDialogue,
    onGenerateArtwork,
    isGeneratingArtwork = false,
    artworkError = null,
    className = '',
  },
  ref
) {
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);

  // 4 narrative frames of the comic episode
  const p1: ComicPanel = episode.panels[0] || {
    panelNumber: 1,
    title: 'The Setup',
    sceneDescription: 'The opening scene begins.',
    visualMetaphor: 'Initial friction and establishment of context',
    characters: [world.characters[0]?.name || 'Protagonist'],
    bubbles: [],
    mood: 'stressed',
    soundEffect: 'FOCUS',
    imagePrompt: 'Establishing shot, character faces the opening dilemma.',
  };

  const p2: ComicPanel = episode.panels[1] || {
    panelNumber: 2,
    title: 'Rising Tension',
    sceneDescription: 'Conflict intensifies as pressure mounts.',
    visualMetaphor: 'Friction point testing conviction',
    characters: [world.characters[1]?.name || world.characters[0]?.name || 'Rival'],
    bubbles: [],
    mood: 'chaotic',
    soundEffect: 'CLASH!',
    imagePrompt: 'High-tension confrontation scene.',
  };

  const p3: ComicPanel = episode.panels[2] || {
    panelNumber: 3,
    title: 'The Breakthrough',
    sceneDescription: 'A critical move turns the tide.',
    visualMetaphor: 'Breakthrough discovery and collaboration',
    characters: [world.characters[0]?.name || 'Protagonist'],
    bubbles: [],
    mood: 'epiphany',
    soundEffect: 'STRIKE!',
    imagePrompt: 'Dynamic breakthrough action angle.',
  };

  const p4: ComicPanel = episode.panels[3] || {
    panelNumber: 4,
    title: 'The Resolution',
    sceneDescription: 'The immediate conflict resolves with forward momentum.',
    visualMetaphor: 'Equilibrium restored for the next chapter',
    characters: [world.characters[0]?.name || 'Protagonist'],
    bubbles: [],
    mood: 'serene',
    soundEffect: 'RESOLVE',
    imagePrompt: 'Cinematic wide angle aftermath and resolution.',
  };

  const panels = [p1, p2, p3, p4];

  // Pure AI image check: only accept real image URLs or base64 data URIs
  const pageImage =
    episode.pageImageUrl && !episode.pageImageUrl.includes('pollinations.ai')
      ? episode.pageImageUrl
      : undefined;

  const handleStartEdit = (bubbleId: string, currentText: string) => {
    setEditingBubbleId(bubbleId);
    setDraftText(currentText);
  };

  const handleSaveEdit = (panelNumber: number, bubbleId: string) => {
    if (onUpdateDialogue && draftText.trim()) {
      onUpdateDialogue(panelNumber, bubbleId, draftText.trim());
    }
    setEditingBubbleId(null);
  };

  const getCharacterEmoji = (speakerName: string) => {
    const matched = world.characters.find(
      (c) => c.name.toLowerCase() === speakerName.toLowerCase()
    );
    return matched?.avatarEmoji || '👤';
  };

  return (
    <div
      ref={ref}
      className={`w-full max-w-5xl xl:max-w-6xl mx-auto bg-white rounded-3xl p-6 sm:p-9 border-2 border-zinc-950 shadow-2xl relative select-none ${className}`}
    >
      {/* =========================================================================
          COMIC BOOK PAGE MASTHEAD
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b-2 border-zinc-950 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1 rounded-md bg-zinc-950 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-widest shadow-xs">
            {world.title}
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded border border-black/10">
            ISSUE #{episode.episodeNumber || 1}
          </span>
          <h2 className="text-base sm:text-xl font-bold font-serif text-zinc-950 truncate max-w-md">
            &ldquo;{episode.title}&rdquo;
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200 uppercase">
            {world.artStyle}
          </span>
          <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest hidden md:inline">
            COMIC STRIP
          </span>
        </div>
      </div>

      {/* Premise Subtitle Banner */}
      {episode.rawBrainDump && (
        <div className="mb-5 -mt-2 flex items-center gap-2 text-xs sm:text-sm text-zinc-700 font-serif italic bg-zinc-50 border border-black/[0.06] rounded-xl px-4 py-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-sans font-bold text-zinc-900 not-italic text-xs uppercase tracking-wider shrink-0">Premise:</span>
          <span className="truncate">&ldquo;{episode.rawBrainDump}&rdquo;</span>
        </div>
      )}

      {/* =========================================================================
          PAGE CONTENT: REAL META AI IMAGE OR CLEAN COMIC DRAFTING STAGE
      ========================================================================= */}
      {pageImage ? (
        /* Real Meta AI Generated Full-Page Comic Spread */
        <div className="space-y-4">
          <div className="relative group w-full rounded-2xl overflow-hidden border-2 border-zinc-950 shadow-md bg-zinc-950">
            <img
              src={pageImage}
              alt={`${world.title} — ${episode.title}`}
              className={`w-full h-auto block object-cover transition-all duration-200 ${
                isFullscreenZoom ? 'max-h-none' : 'max-h-[1100px]'
              }`}
              loading="eager"
            />

            {/* Quick Action Overlay on Hover */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setIsFullscreenZoom(!isFullscreenZoom)}
                className="px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-medium backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-md cursor-pointer"
                title={isFullscreenZoom ? 'Normal view' : 'Expand full height'}
              >
                {isFullscreenZoom ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                <span>{isFullscreenZoom ? 'Fit' : 'Full Height'}</span>
              </button>

              {onGenerateArtwork && (
                <button
                  type="button"
                  onClick={onGenerateArtwork}
                  disabled={isGeneratingArtwork}
                  className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
                  title="Re-synthesize artwork with Meta Muse Image"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingArtwork ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingArtwork ? 'Drawing...' : 'Re-draw Art'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Authentic Blank Comic Canvas Ready to Draw */
        <div className="space-y-6">
          {/* Main Drafting Hero Canvas */}
          <div className="w-full min-h-[420px] rounded-2xl border-2 border-dashed border-zinc-300 bg-gradient-to-b from-zinc-50 to-zinc-100/60 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Subtle Comic Grid Lines Background Effect */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }}
            />

            <div className="relative z-10 max-w-md mx-auto space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-zinc-950 shadow-md flex items-center justify-center text-3xl">
                {isGeneratingArtwork ? (
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                ) : (
                  <span>🎨</span>
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black font-serif text-zinc-950 tracking-tight">
                  {isGeneratingArtwork ? 'Meta AI is Drawing Your Comic...' : 'Comic Story Ready to Draw'}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                  {isGeneratingArtwork
                    ? 'Meta Muse Image is synthesizing all 4 sequential comic frames into a high-res graphic novel page. This takes ~12 seconds...'
                    : `The dialogue and 4-scene story have been written. Click below to paint the full visual comic strip with Meta Muse Image.`}
                </p>
              </div>

              {(artworkError || episode.generationError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2 max-w-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span className="text-left font-medium">{artworkError || episode.generationError}</span>
                </div>
              )}

              {onGenerateArtwork && (
                <button
                  type="button"
                  onClick={onGenerateArtwork}
                  disabled={isGeneratingArtwork}
                  className="px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-blue-600 text-white font-bold text-sm shadow-xl flex items-center gap-2.5 cursor-pointer transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {isGeneratingArtwork ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Comic Art...</span>
                    </>
                  ) : (
                    <>
                      <Palette className="w-4 h-4" />
                      <span>Generate Comic with Meta AI</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Story & Dialogue Script Accordion */}
          <div className="border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setIsScriptExpanded(!isScriptExpanded)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">📝</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900">
                  Written Story Script & Dialogue (4 Scenes)
                </span>
                <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                  • Click to preview or edit speech
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                <span>{isScriptExpanded ? 'Hide Script' : 'View Script'}</span>
                {isScriptExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isScriptExpanded && (
              <div className="p-5 border-t border-zinc-100 bg-zinc-50/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                {panels.map((p, idx) => {
                  const sceneNum = idx + 1;
                  const sceneTitle =
                    idx === 0 ? 'Scene 1: The Inciting Dilemma' :
                    idx === 1 ? 'Scene 2: Conflict Escalation' :
                    idx === 2 ? 'Scene 3: The Breakthrough' :
                    'Scene 4: The Outcome';

                  return (
                    <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                        <span className="text-xs font-bold text-zinc-900 font-mono">
                          {sceneTitle}
                        </span>
                        {p.soundEffect && (
                          <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                            {p.soundEffect}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-600 font-serif italic leading-relaxed">
                        &ldquo;{p.sceneDescription}&rdquo;
                      </p>

                      {p.bubbles && p.bubbles.length > 0 && (
                        <div className="space-y-2 pt-1 border-t border-zinc-100">
                          {p.bubbles.map((b: SpeechBubble) => {
                            const isEditing = editingBubbleId === b.id;
                            const charEmoji = getCharacterEmoji(b.speaker);

                            return (
                              <div key={b.id} className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs">
                                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1">
                                  <span className="font-bold text-zinc-900 flex items-center gap-1">
                                    <span>{charEmoji}</span>
                                    <span>{b.speaker}</span>
                                  </span>

                                  {onUpdateDialogue && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        isEditing
                                          ? handleSaveEdit(p.panelNumber, b.id)
                                          : handleStartEdit(b.id, b.text)
                                      }
                                      className="text-zinc-400 hover:text-zinc-900 p-0.5 cursor-pointer"
                                      title={isEditing ? 'Save' : 'Edit'}
                                    >
                                      {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                </div>

                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={draftText}
                                    onChange={(e) => setDraftText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(p.panelNumber, b.id)}
                                    autoFocus
                                    className="w-full bg-white border border-blue-500 rounded px-2 py-1 text-xs text-zinc-900 font-medium outline-none"
                                  />
                                ) : (
                                  <p
                                    onClick={() => onUpdateDialogue && handleStartEdit(b.id, b.text)}
                                    className="text-zinc-800 leading-snug cursor-pointer hover:text-blue-600"
                                  >
                                    &ldquo;{b.text}&rdquo;
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          COMIC BOOK FOOTER
      ========================================================================= */}
      <div className="mt-6 pt-4 border-t-2 border-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-zinc-950 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-zinc-600" />
            <span>Cast in this Issue:</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {world.characters.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1 rounded-full bg-zinc-100 border border-black/10 text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-2xs"
              >
                <span>{c.avatarEmoji}</span>
                <span>{c.name}</span>
                <span className="text-[11px] text-zinc-500 capitalize">({c.role})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-zinc-500 flex items-center gap-2">
          <span>PAGE 1 OF 1</span>
          <span>•</span>
          <span className="font-semibold text-zinc-900">
            {pageImage ? 'Meta AI Synthesized Comic Page' : 'Story Draft'}
          </span>
        </div>
      </div>
    </div>
  );
});
