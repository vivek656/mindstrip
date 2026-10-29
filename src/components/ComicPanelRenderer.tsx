'use client';

import React, { useState } from 'react';
import { ComicPanel, ArtStyle, SpeechBubble } from '@/types/comic';
import { Scan, ZoomIn, Check, Edit2 } from 'lucide-react';

interface ComicPanelRendererProps {
  panel: ComicPanel;
  artStyle: ArtStyle;
  onInspectSam: (panel: ComicPanel) => void;
  onUpdateBubbleText?: (panelNumber: number, bubbleId: string, newText: string) => void;
  onZoomPanel?: (panel: ComicPanel) => void;
}

export function ComicPanelRenderer({
  panel,
  artStyle,
  onInspectSam,
  onUpdateBubbleText,
  onZoomPanel,
}: ComicPanelRendererProps) {
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');

  const handleStartEdit = (bubble: SpeechBubble) => {
    setEditingBubbleId(bubble.id);
    setDraftText(bubble.text);
  };

  const handleSaveEdit = (bubble: SpeechBubble) => {
    if (onUpdateBubbleText && draftText.trim()) {
      onUpdateBubbleText(panel.panelNumber, bubble.id, draftText.trim());
    }
    setEditingBubbleId(null);
  };

  // Minimalist, architectural vector artwork tailored for Apple-grade aesthetic
  const renderMinimalistArtwork = () => {
    if (panel.mood === 'stressed') {
      // Panel 1: Cognitive Density / Overload
      return (
        <svg viewBox="0 0 500 320" className="w-full h-full object-cover">
          <defs>
            <linearGradient id={`p1-grad-${panel.panelNumber}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f4f4f6" />
              <stop offset="100%" stopColor="#e5e5ea" />
            </linearGradient>
            <linearGradient id={`p1-grad-dark-${panel.panelNumber}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1c1e" />
              <stop offset="100%" stopColor="#0a0a0c" />
            </linearGradient>
          </defs>

          {/* Clean minimal background */}
          <rect width="500" height="320" className="fill-zinc-100 dark:fill-zinc-900/60" />

          {/* Minimalist grid lines */}
          <g stroke="currentColor" className="text-zinc-300/60 dark:text-zinc-800/80" strokeWidth="0.75" strokeDasharray="4 4">
            <line x1="80" y1="0" x2="80" y2="320" />
            <line x1="250" y1="0" x2="250" y2="320" />
            <line x1="420" y1="0" x2="420" y2="320" />
            <line x1="0" y1="160" x2="500" y2="160" />
          </g>

          {/* Floating translucent constraint blocks */}
          <g opacity="0.85">
            <rect x="70" y="50" width="110" height="40" rx="10" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <line x1="85" y1="65" x2="140" y2="65" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" strokeLinecap="round" />
            <line x1="85" y1="75" x2="160" y2="75" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" strokeLinecap="round" />

            <rect x="320" y="60" width="120" height="45" rx="10" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <circle cx="340" cy="82" r="4" fill="#ef4444" opacity="0.8" />
            <line x1="352" y1="82" x2="415" y2="82" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" strokeLinecap="round" />

            <rect x="60" y="220" width="95" height="35" rx="8" className="fill-white/80 dark:fill-zinc-800/80 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
            <line x1="75" y1="237" x2="135" y2="237" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Clean architectural protagonist silhouette */}
          <g transform="translate(250, 205)">
            <ellipse cx="0" cy="50" rx="42" ry="24" className="fill-zinc-900/10 dark:fill-zinc-100/10" />
            <path d="M -30 65 L -15 20 L 15 20 L 30 65 Z" className="fill-zinc-800 dark:fill-zinc-200" />
            <circle cx="0" cy="-6" r="22" className="fill-zinc-800 dark:fill-zinc-200" />
            {/* Minimalist hands to temple */}
            <path d="M -18 2 Q -24 -2 -20 -10" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 18 2 Q 24 -2 20 -10" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      );
    }

    if (panel.mood === 'chaotic') {
      // Panel 2: The Magnified Fear / Antagonist
      return (
        <svg viewBox="0 0 500 320" className="w-full h-full object-cover">
          <rect width="500" height="320" className="fill-zinc-100 dark:fill-zinc-900/60" />

          {/* Deep atmospheric ambient shadow form */}
          <path
            d="M 230 320 Q 280 40 440 60 Q 500 120 480 320 Z"
            className="fill-zinc-300/70 dark:fill-zinc-800/80"
          />

          {/* Abstract geometric tension lines */}
          <g className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1" opacity="0.6">
            <line x1="280" y1="90" x2="160" y2="210" strokeDasharray="3 3" />
            <line x1="330" y1="120" x2="180" y2="210" strokeDasharray="3 3" />
            <circle cx="380" cy="110" r="14" className="fill-zinc-900 dark:fill-white" opacity="0.15" />
          </g>

          {/* Protagonist looking back at towering complexity */}
          <g transform="translate(150, 215)">
            <ellipse cx="0" cy="50" rx="36" ry="20" className="fill-zinc-900/10 dark:fill-zinc-100/10" />
            <path d="M -25 60 L -12 20 L 16 20 L 22 60 Z" className="fill-zinc-800 dark:fill-zinc-200" />
            <circle cx="2" cy="-6" r="20" className="fill-zinc-800 dark:fill-zinc-200" />
          </g>
        </svg>
      );
    }

    if (panel.mood === 'epiphany') {
      // Panel 3: The De-Biasing Aperture / Shift
      return (
        <svg viewBox="0 0 500 320" className="w-full h-full object-cover">
          <rect width="500" height="320" className="fill-zinc-100 dark:fill-zinc-900/60" />

          {/* Clean radial lens of clarity */}
          <circle cx="250" cy="140" r="90" className="fill-white dark:fill-zinc-800/70 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1.5" />
          <circle cx="250" cy="140" r="50" className="fill-blue-500/10 dark:fill-blue-400/15" />
          <circle cx="250" cy="140" r="14" className="fill-blue-500 dark:fill-blue-400" />

          {/* Subtle divergent rays */}
          <g className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1" strokeDasharray="2 2">
            <line x1="160" y1="140" x2="50" y2="140" />
            <line x1="340" y1="140" x2="450" y2="140" />
            <line x1="250" y1="50" x2="250" y2="10" />
          </g>

          {/* Protagonist standing in poise */}
          <g transform="translate(180, 210)">
            <path d="M -22 60 L -12 20 L 16 20 L 20 60 Z" className="fill-zinc-800 dark:fill-zinc-200" />
            <circle cx="0" cy="-6" r="20" className="fill-zinc-800 dark:fill-zinc-200" />
          </g>
        </svg>
      );
    }

    // Default serene / actionable (Panel 4)
    return (
      <svg viewBox="0 0 500 320" className="w-full h-full object-cover">
        <rect width="500" height="320" className="fill-zinc-100 dark:fill-zinc-900/60" />

        {/* Minimalist desk & morning horizon */}
        <line x1="60" y1="230" x2="440" y2="230" className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth="1.5" />

        {/* Crisp notepad with single verified mark */}
        <g transform="translate(240, 205)">
          <rect x="0" y="0" width="75" height="48" rx="6" className="fill-white dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700" strokeWidth="1" />
          <circle cx="16" cy="18" r="4" className="fill-emerald-500" />
          <line x1="26" y1="18" x2="62" y2="18" className="stroke-zinc-700 dark:stroke-zinc-300" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="32" x2="55" y2="32" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Minimalist ceramic cup */}
        <g transform="translate(340, 212)">
          <rect x="0" y="0" width="20" height="24" rx="4" className="fill-zinc-800 dark:fill-zinc-200" />
          <path d="M 20 6 Q 26 6 26 14 Q 26 20 20 20" className="stroke-zinc-800 dark:stroke-zinc-200" strokeWidth="1.5" fill="none" />
        </g>

        {/* Serene protagonist seated peacefully */}
        <g transform="translate(160, 205)">
          <path d="M -22 60 L -12 20 L 16 20 L 20 60 Z" className="fill-zinc-800 dark:fill-zinc-200" />
          <circle cx="0" cy="-6" r="20" className="fill-zinc-800 dark:fill-zinc-200" />
        </g>
      </svg>
    );
  };

  return (
    <div className="group relative flex flex-col h-full rounded-2xl overflow-hidden glass-panel shadow-sm hover:shadow-md transition-all duration-200">
      
      {/* Panel Minimal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-zinc-400">
            0{panel.panelNumber}
          </span>
          <span className="font-medium tracking-tight text-zinc-800 dark:text-zinc-200 truncate max-w-[190px]">
            {panel.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {onZoomPanel && (
            <button
              onClick={() => onZoomPanel(panel)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title="Expand view"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onInspectSam(panel)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Inspect elements via Meta SAM 3.1"
          >
            <Scan className="w-3 h-3 text-blue-500" />
            <span>SAM 3.1</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="relative w-full aspect-[16/10] overflow-hidden">
        {renderMinimalistArtwork()}

        {/* Minimal Dialogue Cards Overlay */}
        <div className="absolute inset-0 p-3.5 pointer-events-none flex flex-col justify-between">
          {panel.bubbles.map((bubble) => {
            const isEditing = editingBubbleId === bubble.id;
            const isRight = bubble.position.includes('right');

            return (
              <div
                key={bubble.id}
                className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}
              >
                <div className="pointer-events-auto max-w-[85%] px-3 py-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] shadow-sm text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 transition-all">
                  
                  {/* Speaker Label */}
                  <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-0.5">
                    <span>{bubble.speaker}</span>
                    <button
                      type="button"
                      onClick={() => (isEditing ? handleSaveEdit(bubble) : handleStartEdit(bubble))}
                      className="opacity-40 hover:opacity-100 p-0.5 text-zinc-600 dark:text-zinc-300"
                    >
                      {isEditing ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Edit2 className="w-2.5 h-2.5" />}
                    </button>
                  </div>

                  {/* Bubble Text or Edit Mode */}
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(bubble)}
                        autoFocus
                        className="w-full bg-transparent border-b border-blue-500 text-xs outline-none py-0.5 text-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(bubble)}
                        className="px-2 py-0.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded text-[10px] font-medium"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <p
                      onClick={() => handleStartEdit(bubble)}
                      className="cursor-pointer hover:text-blue-500 transition-colors"
                      title="Click to edit text"
                    >
                      {bubble.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle Caption Footer */}
      <div className="px-4 py-2.5 border-t border-black/[0.04] dark:border-white/[0.04] text-[12px] text-zinc-500 dark:text-zinc-400 leading-snug">
        <span className="font-medium text-zinc-700 dark:text-zinc-300 mr-1.5">Metaphor:</span>
        <span>{panel.visualMetaphor}</span>
      </div>
    </div>
  );
}
