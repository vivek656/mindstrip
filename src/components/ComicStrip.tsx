'use client';

import React, { useState, useRef } from 'react';
import { ComicStrip as ComicStripType, ComicPanel, LayoutMode } from '@/types/comic';
import { Download, Share2, Check, Edit2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ComicStripProps {
  strip: ComicStripType;
  layoutMode?: LayoutMode;
  worldTitle?: string;
  onUpdateBubbleText?: (panelNumber: number, bubbleId: string, newText: string) => void;
}

export function ComicStrip({
  strip,
  layoutMode = 'strip',
  worldTitle = 'MindStrip',
  onUpdateBubbleText,
}: ComicStripProps) {
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const handleStartEdit = (bubbleId: string, currentText: string) => {
    setEditingBubbleId(bubbleId);
    setDraftText(currentText);
  };

  const handleSaveEdit = (panelNumber: number, bubbleId: string) => {
    if (onUpdateBubbleText && draftText.trim()) {
      onUpdateBubbleText(panelNumber, bubbleId, draftText.trim());
    }
    setEditingBubbleId(null);
  };

  const handleExportPng = async () => {
    if (!stripRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(stripRef.current, {
        pixelRatio: 2,
        backgroundColor: '#faf8f5',
      });
      const link = document.createElement('a');
      link.download = `${worldTitle.toLowerCase().replace(/\s+/g, '-')}-ep${strip.episodeNumber || 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    const text = `${worldTitle} • Episode #${strip.episodeNumber || 1}: "${strip.title}"\n\n"${strip.cognitiveAnalysis.coreTruth}"\n\nCreated with MindStrip AI`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGridClasses = () => {
    if (layoutMode === 'webtoon') {
      return 'flex flex-col gap-6 max-w-xl mx-auto';
    }
    if (layoutMode === 'grid') {
      return 'grid grid-cols-1 sm:grid-cols-2 gap-4';
    }
    // Default 4-panel horizontal strip
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
  };

  // Sophisticated editorial line-art for each panel
  const renderPanelIllustration = (panel: ComicPanel) => {
    const idx = panel.panelNumber;

    if (idx === 1) {
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full object-cover">
          <rect width="320" height="240" fill="#faf9f6" />
          <line x1="0" y1="180" x2="320" y2="180" stroke="#e5e2dc" strokeWidth="1" />
          <line x1="30" y1="180" x2="290" y2="180" stroke="#181716" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="180" x2="40" y2="240" stroke="#181716" strokeWidth="1.5" />
          <line x1="270" y1="180" x2="280" y2="240" stroke="#181716" strokeWidth="1.5" />

          <path d="M 120 180 L 135 155 L 185 155 L 200 180 Z" fill="#ffffff" stroke="#181716" strokeWidth="1.5" />
          <line x1="130" y1="155" x2="190" y2="155" stroke="#181716" strokeWidth="1.5" />
          
          <rect x="220" y="165" width="12" height="15" rx="3" fill="#ffffff" stroke="#181716" strokeWidth="1.5" />
          <path d="M 232 170 Q 237 170 237 174 Q 237 178 232 178" stroke="#181716" strokeWidth="1.2" fill="none" />

          <g transform="translate(100, 105)">
            <path d="M -15 75 Q 0 45 15 75" fill="#f0ede6" stroke="#181716" strokeWidth="1.8" />
            <circle cx="0" cy="22" r="18" fill="#ffffff" stroke="#181716" strokeWidth="1.8" />
            <path d="M -14 18 Q 0 6 12 14 Q 16 10 10 4 Q -2 0 -16 10 Z" fill="#181716" />
            <path d="M 2 20 Q 8 18 12 21" stroke="#181716" strokeWidth="1.2" fill="none" />
            <path d="M 6 38 Q 12 36 10 48" stroke="#181716" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>

          <g stroke="#9c978f" strokeWidth="1" strokeDasharray="2 3" opacity="0.7">
            <path d="M 140 90 Q 180 60 220 85" fill="none" />
            <path d="M 170 70 Q 210 40 250 65" fill="none" />
          </g>
        </svg>
      );
    }

    if (idx === 2) {
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full object-cover">
          <rect width="320" height="240" fill="#faf9f6" />
          <g stroke="#181716" strokeWidth="1.2">
            <rect x="35" y="75" width="60" height="28" rx="6" fill="#ffffff" />
            <text x="65" y="93" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fill="#5c5953">Step 1</text>

            <rect x="130" y="40" width="70" height="28" rx="6" fill="#ffffff" />
            <text x="165" y="58" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fill="#5c5953">Complication</text>

            <rect x="130" y="110" width="70" height="28" rx="6" fill="#ffffff" />
            <text x="165" y="128" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fill="#5c5953">Doubt</text>

            <rect x="225" y="75" width="65" height="28" rx="6" fill="#f0ede6" />
            <text x="257" y="93" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fill="#181716" fontWeight="bold">???</text>

            <path d="M 95 89 L 130 54" fill="none" />
            <path d="M 95 89 L 130 124" fill="none" />
            <path d="M 200 54 L 225 89" fill="none" strokeDasharray="3 3" />
            <path d="M 200 124 L 225 89" fill="none" strokeDasharray="3 3" />
          </g>

          <g transform="translate(65, 175)">
            <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#181716" strokeWidth="1.5" />
            <path d="M -10 25 L 0 14 L 10 25" stroke="#181716" strokeWidth="1.5" fill="#ffffff" />
            <circle cx="4" cy="-1" r="1.5" fill="#181716" />
          </g>
        </svg>
      );
    }

    if (idx === 3) {
      return (
        <svg viewBox="0 0 320 240" className="w-full h-full object-cover">
          <rect width="320" height="240" fill="#faf9f6" />
          <circle cx="160" cy="110" r="48" fill="#ffffff" stroke="#181716" strokeWidth="1.5" />
          <circle cx="160" cy="110" r="42" fill="none" stroke="#e5e2dc" strokeWidth="1" strokeDasharray="3 3" />
          
          <path d="M 148 110 L 157 119 L 175 101" stroke="#181716" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          <g transform="translate(160, 185)">
            <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#181716" strokeWidth="1.8" />
            <path d="M -4 -2 Q 0 -6 4 -2" stroke="#181716" strokeWidth="1.5" fill="none" />
            <path d="M -14 30 L 0 16 L 14 30" stroke="#181716" strokeWidth="1.8" fill="#ffffff" />
          </g>
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 320 240" className="w-full h-full object-cover">
        <rect width="320" height="240" fill="#faf9f6" />
        <line x1="30" y1="180" x2="290" y2="180" stroke="#181716" strokeWidth="1.8" strokeLinecap="round" />

        <g transform="translate(195, 150)">
          <rect x="0" y="0" width="55" height="35" rx="4" fill="#ffffff" stroke="#181716" strokeWidth="1.5" />
          <line x1="10" y1="12" x2="45" y2="12" stroke="#181716" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="10" y1="22" x2="35" y2="22" stroke="#a8a6a1" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        <g transform="translate(110, 130)">
          <circle cx="0" cy="18" r="18" fill="#ffffff" stroke="#181716" strokeWidth="1.8" />
          <path d="M -6 16 Q -2 12 2 16" stroke="#181716" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 6 16 Q 10 12 14 16" stroke="#181716" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 0 25 Q 4 29 8 25" stroke="#181716" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          
          <rect x="18" y="22" width="14" height="16" rx="3" fill="#ffffff" stroke="#181716" strokeWidth="1.5" />
          <path d="M 32 26 Q 36 26 36 30 Q 36 34 32 34" stroke="#181716" strokeWidth="1.2" fill="none" />
          <path d="M 23 16 Q 21 10 25 6" stroke="#9c978f" strokeWidth="1" fill="none" strokeLinecap="round" />
          
          <path d="M -15 65 Q 2 36 22 65" fill="#f0ede6" stroke="#181716" strokeWidth="1.8" />
        </g>
      </svg>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-black/[0.08]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
            {worldTitle}
          </span>
          <span className="text-zinc-300">•</span>
          <span className="text-xs font-medium text-zinc-500">
            Episode #{strip.episodeNumber || 1}: "{strip.title}"
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export Strip'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-black/10 hover:bg-black/[0.04] text-zinc-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* The Printable Comic Sheet */}
      <div
        ref={stripRef}
        className="editorial-sheet rounded-2xl p-6 sm:p-8 bg-white transition-all shadow-sm"
      >
        {/* Strip Header Branding */}
        <div className="flex items-baseline justify-between pb-3 mb-5 border-b border-black/[0.08] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-zinc-900 uppercase">{worldTitle}</span>
            <span className="text-zinc-300">•</span>
            <span className="font-serif italic text-zinc-500">Episode #{strip.episodeNumber || 1}: "{strip.title}"</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-400">MindStrip Engine</span>
        </div>

        {/* Dynamic Panels Layout */}
        <div className={getGridClasses()}>
          {strip.panels.map((panel) => (
            <div
              key={panel.panelNumber}
              className="editorial-panel rounded-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Panel Top Header */}
              <div className="px-3.5 py-2 border-b border-black/[0.07] bg-zinc-50/70 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-zinc-400">0{panel.panelNumber}</span>
                <span className="font-semibold text-zinc-700 truncate max-w-[150px]">{panel.title}</span>
              </div>

              {/* Panel Canvas Area */}
              <div className="relative aspect-[4/3] w-full bg-[#faf9f6]">
                {renderPanelIllustration(panel)}

                {/* Speech Balloons */}
                <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between">
                  {panel.bubbles.map((b) => {
                    const isEditing = editingBubbleId === b.id;
                    const isRight = b.position.includes('right');

                    return (
                      <div
                        key={b.id}
                        className={`pointer-events-auto flex flex-col ${isRight ? 'items-end' : 'items-start'}`}
                      >
                        <div className="editorial-bubble max-w-[92%] px-2.5 py-1.5 text-xs text-zinc-900 leading-snug">
                          <div className="flex items-center justify-between gap-2 text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-0.5">
                            <span>{b.speaker}</span>
                            <button
                              type="button"
                              onClick={() =>
                                isEditing
                                  ? handleSaveEdit(panel.panelNumber, b.id)
                                  : handleStartEdit(b.id, b.text)
                              }
                              className="text-zinc-400 hover:text-zinc-900 p-0.5"
                              title="Edit text"
                            >
                              {isEditing ? (
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <Edit2 className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>

                          {isEditing ? (
                            <input
                              type="text"
                              value={draftText}
                              onChange={(e) => setDraftText(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === 'Enter' && handleSaveEdit(panel.panelNumber, b.id)
                              }
                              autoFocus
                              className="w-full bg-transparent border-b border-zinc-900 outline-none text-xs text-zinc-900 py-0.5"
                            />
                          ) : (
                            <p
                              onClick={() => handleStartEdit(b.id, b.text)}
                              className="cursor-pointer hover:text-blue-600 transition-colors"
                              title="Click to edit text"
                            >
                              {b.text}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panel Caption */}
              <div className="px-3.5 py-2.5 border-t border-black/[0.07] bg-white text-[11px] text-zinc-500 font-serif leading-snug">
                {panel.visualMetaphor}
              </div>
            </div>
          ))}
        </div>

        {/* Reality Takeaway */}
        <div className="mt-6 pt-4 border-t border-black/[0.08] flex items-center justify-between text-xs text-zinc-500">
          <div className="truncate max-w-md">
            <span className="font-semibold text-zinc-900">Takeaway: </span>
            <span className="italic">"{strip.cognitiveAnalysis.coreTruth}"</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">MindStrip Comics</span>
        </div>
      </div>
    </div>
  );
}
