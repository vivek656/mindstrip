'use client';

import React, { useState, useEffect } from 'react';
import { SegmentedElement, ComicWorld, ComicStrip, ComicCharacter } from '@/types/comic';
import { Scan, X, Check, Edit2, MessageSquare, Layers, Eye, EyeOff, Sparkles, UserCheck, ShieldAlert, Cpu } from 'lucide-react';

interface SamVisionOverlayProps {
  world: ComicWorld;
  episode: ComicStrip;
  isActive: boolean;
  onClose: () => void;
  onSelectCharacterForDossier?: (character: ComicCharacter) => void;
  onUpdateDialogue?: (panelNumber: number, bubbleId: string, text: string) => void;
}

export function SamVisionOverlay({
  world,
  episode,
  isActive,
  onClose,
  onSelectCharacterForDossier,
  onUpdateDialogue,
}: SamVisionOverlayProps) {
  const [segments, setSegments] = useState<SegmentedElement[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<SegmentedElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'character' | 'speech_bubble' | 'prop'>('all');
  const [isIsolated, setIsIsolated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBubbleText, setEditingBubbleText] = useState('');
  const [isEditingBubble, setIsEditingBubble] = useState(false);

  // Fetch or generate SAM 3.1 segmentation map on activation
  useEffect(() => {
    if (!isActive) {
      setSelectedSegment(null);
      setIsIsolated(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch('/api/sam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        layoutStyle: episode.layoutStyle || '4-panel',
        characters: world.characters,
        worldTitle: world.title,
        panels: episode.panels
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.segments) {
          setSegments(data.segments);
        }
      })
      .catch((err) => {
        console.warn('SAM 3.1 segmentation fetch warning:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isActive, episode.layoutStyle, episode.panels, world.characters, world.title]);

  if (!isActive) return null;

  // Filter segments by active category
  const visibleSegments = segments.filter((seg) => {
    if (activeCategory === 'all') return true;
    return seg.category === activeCategory;
  });

  // Handle clicking arbitrary canvas point to run point-prompt SAM segmentation
  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicked on an existing segment, let segment onClick handle it
    if ((e.target as HTMLElement).closest('.sam-segment-mask')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    try {
      const res = await fetch('/api/sam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointX: x,
          pointY: y,
          characters: world.characters,
          layoutStyle: episode.layoutStyle || '4-panel'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.segment) {
          setSegments((prev) => [...prev, data.segment]);
          setSelectedSegment(data.segment);
        }
      }
    } catch (err) {
      console.warn('SAM point click error:', err);
    }
  };

  // Find linked character dossier if segment is a character
  const linkedCharacter = selectedSegment?.category === 'character'
    ? world.characters.find((c) =>
        selectedSegment.label.toLowerCase().includes(c.name.toLowerCase())
      )
    : null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-auto select-none overflow-hidden">
      {/* Dimmed Isolation Backdrop when a subject is isolated */}
      {isIsolated && selectedSegment && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300 pointer-events-none" />
      )}

      {/* SAM 3.1 Floating Control HUD Banner */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 z-40 flex flex-wrap items-center justify-between gap-2 p-2.5 sm:px-4 rounded-2xl bg-zinc-950/90 text-white backdrop-blur-md border border-white/20 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Scan className="w-4 h-4 animate-pulse text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">
                Meta SAM 3.1 Vision Inspector
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 font-mono text-[10px] font-bold">
                Zero-Shot Segmenter
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Zero-shot segmentation on full comic spread. Click any mask to isolate or inspect.
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
          {(['all', 'character', 'speech_bubble', 'prop'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-2xs font-mono font-bold capitalize transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? `All (${segments.length})` : cat === 'speech_bubble' ? 'Balloons' : cat === 'character' ? 'Cast' : 'Props'}
            </button>
          ))}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Exit SAM 3.1 Inspector Mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Visual Canvas with Click-to-Segment */}
      <div
        onClick={handleCanvasClick}
        className="w-full h-full relative cursor-crosshair"
      >
        {visibleSegments.map((seg) => {
          const isSelected = selectedSegment?.id === seg.id;
          const [x, y, w, h] = seg.box;

          return (
            <div
              key={seg.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSegment(isSelected ? null : seg);
              }}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${w}%`,
                height: `${h}%`,
                borderColor: seg.maskColor,
                backgroundColor: isSelected
                  ? `${seg.maskColor}35`
                  : isIsolated
                  ? 'transparent'
                  : `${seg.maskColor}15`,
                boxShadow: isSelected ? `0 0 20px ${seg.maskColor}80` : undefined,
              }}
              className={`sam-segment-mask absolute rounded-xl border-2 transition-all duration-200 flex flex-col justify-between p-2 cursor-pointer group ${
                isSelected
                  ? 'ring-2 ring-white z-30 scale-[1.01]'
                  : isIsolated
                  ? 'opacity-20'
                  : 'hover:scale-[1.005] hover:border-white z-10'
              }`}
            >
              {/* Top Tag */}
              <div className="flex items-center justify-between gap-1">
                <span
                  style={{ backgroundColor: seg.maskColor }}
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-white shadow-md uppercase tracking-wider flex items-center gap-1"
                >
                  <Scan className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[140px]">{seg.label}</span>
                </span>

                <span className="text-[10px] font-mono font-bold text-white bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/20">
                  {Math.round(seg.confidence * 100)}%
                </span>
              </div>

              {/* Bottom Cue on Hover/Selected */}
              {isSelected && (
                <span className="self-end px-2 py-0.5 rounded-full bg-white text-zinc-950 font-bold font-mono text-[9px] shadow-md uppercase">
                  Inspected Element
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          SELECTED SEGMENT INSPECTION CARD (BOTTOM DOCK)
      ========================================================================= */}
      {selectedSegment && (
        <div className="absolute bottom-4 inset-x-3 sm:inset-x-8 z-40 p-4 sm:p-5 rounded-2xl bg-zinc-950/95 text-white backdrop-blur-md border-2 border-white/20 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                style={{ backgroundColor: selectedSegment.maskColor }}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 font-bold text-lg shadow-md"
              >
                {selectedSegment.category === 'character' ? (
                  linkedCharacter?.avatarEmoji || '👤'
                ) : selectedSegment.category === 'speech_bubble' ? (
                  '💬'
                ) : (
                  '⚡'
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">
                    {selectedSegment.label}
                  </h4>
                  <span
                    style={{ backgroundColor: `${selectedSegment.maskColor}30`, color: selectedSegment.maskColor }}
                    className="px-2 py-0.5 rounded-full text-2xs font-mono font-bold border border-current capitalize"
                  >
                    {selectedSegment.category.replace('_', ' ')}
                  </span>
                  <span className="text-2xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    SAM 3.1: {(selectedSegment.confidence * 100).toFixed(1)}% match
                  </span>
                </div>

                {linkedCharacter ? (
                  <p className="text-xs text-zinc-300 font-sans line-clamp-1">
                    <span className="text-zinc-500 font-mono">Anchor:</span> {linkedCharacter.appearance || linkedCharacter.description || 'Core Universe Cast'}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 font-mono text-[11px]">
                    Bounding Box Coordinates: [X: {selectedSegment.box[0]}%, Y: {selectedSegment.box[1]}%, W: {selectedSegment.box[2]}%, H: {selectedSegment.box[3]}%]
                  </p>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {/* Isolate Mask Layer */}
              <button
                type="button"
                onClick={() => setIsIsolated(!isIsolated)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isIsolated
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
              >
                {isIsolated ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isIsolated ? 'Restore Spread' : 'Isolate Subject'}</span>
              </button>

              {/* Character Dossier Studio Action */}
              {linkedCharacter && onSelectCharacterForDossier && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectCharacterForDossier(linkedCharacter);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Dossier Studio</span>
                </button>
              )}

              {/* Close Segment Card */}
              <button
                type="button"
                onClick={() => {
                  setSelectedSegment(null);
                  setIsIsolated(false);
                }}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
