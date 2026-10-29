'use client';

import React, { useState, useRef } from 'react';
import { ComicStrip, ComicPanel } from '@/types/comic';
import { soundManager } from '@/lib/audio-effects';
import {
  ArrowRight,
  Download,
  Sparkles,
  Edit3,
  Share2,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toPng } from 'html-to-image';

interface ComicBookStageProps {
  strip: ComicStrip;
  onGenerateNew: (prompt: string) => void;
  isLoading: boolean;
  onUpdateDialogue?: (panelIndex: number, bubbleId: string, text: string) => void;
}

const INK = '#16130e';

export function ComicBookStage({
  strip,
  onGenerateNew,
  isLoading,
  onUpdateDialogue,
}: ComicBookStageProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [bubbleTextDraft, setBubbleTextDraft] = useState<string>('');
  const [promptInput, setPromptInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const bookRef = useRef<HTMLDivElement>(null);

  const flipPage = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    if (soundEnabled) soundManager.playPageTurn();
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((prev) => (direction === 'next' ? (prev === 1 ? 2 : 1) : (prev === 2 ? 1 : 2)));
      setIsFlipping(false);
    }, 450);
  };

  const handleStartEdit = (bubbleId: string, currentText: string) => {
    setEditingBubbleId(bubbleId);
    setBubbleTextDraft(currentText);
  };

  const handleSaveEdit = (panelIndex: number, bubbleId: string) => {
    if (onUpdateDialogue && bubbleTextDraft.trim()) {
      onUpdateDialogue(panelIndex, bubbleId, bubbleTextDraft.trim());
    }
    setEditingBubbleId(null);
  };

  const handleExportPng = async () => {
    if (!bookRef.current) return;
    try {
      if (soundEnabled) soundManager.playInkSnap();
      const dataUrl = await toPng(bookRef.current, {
        pixelRatio: 2,
        backgroundColor: '#fff8ea',
      });
      const link = document.createElement('a');
      link.download = `mindstrip-${strip.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  const handleShare = () => {
    const text = `MindStrip — "${strip.title}"\n\n"${strip.cognitiveAnalysis.coreTruth}"\n\nGenerated with Meta Muse AI.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isLoading) return;
    if (soundEnabled) soundManager.playPageTurn();
    onGenerateNew(promptInput.trim());
    setPromptInput('');
  };

  // Bold panel artwork: thick ink, halftone print, loud accent shapes per mood.
  const renderPanelVisual = (panel: ComicPanel) => {
    const mood = panel.mood;
    return (
      <div className="relative w-full aspect-[4/3] bg-paper border-4 border-ink overflow-hidden">
        <div className="absolute inset-0 halftone pointer-events-none" />
        <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full">
          {mood === 'chaotic' && (
            <g>
              <rect width="400" height="300" fill="#ffc907" />
              <g opacity="0.5">
                {Array.from({ length: 24 }).map((_, i) => {
                  const a = (i * 15 * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={200 + Math.cos(a) * 40}
                      y1={140 + Math.sin(a) * 40}
                      x2={200 + Math.cos(a) * 220}
                      y2={140 + Math.sin(a) * 220}
                      stroke={INK}
                      strokeWidth="3"
                    />
                  );
                })}
              </g>
              {/* Looming antagonist blob */}
              <path
                d="M 250 260 Q 260 80 340 70 Q 400 90 380 260 Z"
                fill="#e33629"
                stroke={INK}
                strokeWidth="6"
              />
              <circle cx="315" cy="140" r="10" fill="#fff" stroke={INK} strokeWidth="4" />
              <circle cx="355" cy="140" r="10" fill="#fff" stroke={INK} strokeWidth="4" />
              <circle cx="317" cy="142" r="4" fill={INK} />
              <circle cx="357" cy="142" r="4" fill={INK} />
              <path d="M 310 185 Q 335 200 360 185" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* Small hero looking up */}
              <circle cx="130" cy="200" r="24" fill="#fff" stroke={INK} strokeWidth="5" />
              <path d="M 100 260 L 112 222 L 148 222 L 160 260 Z" fill="#2456e0" stroke={INK} strokeWidth="5" />
            </g>
          )}

          {mood === 'epiphany' && (
            <g>
              <rect width="400" height="300" fill="#fff" />
              <g opacity="0.85">
                {Array.from({ length: 16 }).map((_, i) => {
                  const a = (i * 22.5 * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1="200"
                      y1="110"
                      x2={200 + Math.cos(a) * 260}
                      y2={110 + Math.sin(a) * 260}
                      stroke="#ffc907"
                      strokeWidth="10"
                    />
                  );
                })}
              </g>
              <circle cx="200" cy="110" r="58" fill="#fff" stroke={INK} strokeWidth="6" />
              <circle cx="200" cy="110" r="26" fill="#2456e0" stroke={INK} strokeWidth="5" />
              {/* Shrinking gremlin */}
              <ellipse cx="200" cy="235" rx="26" ry="20" fill="#e33629" stroke={INK} strokeWidth="5" />
              <circle cx="191" cy="230" r="4" fill="#fff" />
              <circle cx="209" cy="230" r="4" fill="#fff" />
              {/* Calm hero */}
              <circle cx="90" cy="215" r="22" fill="#fff" stroke={INK} strokeWidth="5" />
              <path d="M 62 268 L 74 234 L 106 234 L 118 268 Z" fill="#16130e" />
            </g>
          )}

          {mood === 'stressed' && (
            <g>
              <rect width="400" height="300" fill="#2456e0" />
              <g fill="none" stroke="#fff" strokeWidth="3" opacity="0.7">
                <circle cx="200" cy="150" r="110" strokeDasharray="10 8" />
                <circle cx="200" cy="150" r="78" strokeDasharray="6 8" />
                <circle cx="200" cy="150" r="48" strokeDasharray="4 6" />
              </g>
              {/* Swamped hero */}
              <circle cx="200" cy="150" r="30" fill="#fff" stroke={INK} strokeWidth="6" />
              <path d="M 160 230 L 178 178 L 222 178 L 240 230 Z" fill="#e33629" stroke={INK} strokeWidth="6" />
              <path d="M 168 130 L 150 108 M 232 130 L 250 108" stroke={INK} strokeWidth="6" strokeLinecap="round" />
              {/* Flying task shards */}
              <g stroke={INK} strokeWidth="4">
                <rect x="52" y="60" width="70" height="34" rx="4" fill="#ffc907" transform="rotate(-12 87 77)" />
                <rect x="280" y="52" width="70" height="34" rx="4" fill="#fff" transform="rotate(10 315 69)" />
                <rect x="296" y="216" width="60" height="30" rx="4" fill="#ffc907" transform="rotate(-8 326 231)" />
              </g>
            </g>
          )}

          {(mood === 'serene' || mood === 'determined' || mood === 'humorous') && (
            <g>
              <rect width="400" height="300" fill="#fff" />
              <rect x="0" y="0" width="400" height="300" fill="none" />
              <line x1="40" y1="225" x2="360" y2="225" stroke={INK} strokeWidth="5" />
              {/* Checklist with big check */}
              <g transform="rotate(-4 250 190)">
                <rect x="210" y="160" width="90" height="64" rx="6" fill="#ffc907" stroke={INK} strokeWidth="5" />
                <path d="M 224 192 L 238 205 L 262 178" stroke={INK} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              {/* Coffee cup */}
              <rect x="318" y="196" width="24" height="29" rx="5" fill="#e33629" stroke={INK} strokeWidth="4" />
              <path d="M 342 202 Q 352 202 352 212 Q 352 221 342 221" stroke={INK} strokeWidth="4" fill="none" />
              {/* Relaxed hero */}
              <circle cx="120" cy="185" r="26" fill="#fff" stroke={INK} strokeWidth="6" />
              <path d="M 122 178 Q 128 178 128 184 M 108 178 Q 114 178 114 184" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 108 200 Q 120 210 132 200" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 86 250 L 100 208 L 140 208 L 154 250 Z" fill="#2456e0" stroke={INK} strokeWidth="6" />
            </g>
          )}
        </svg>

        {/* SFX burst */}
        {panel.soundEffect && (
          <div
            className="burst absolute bg-comic-red text-paper font-display flex items-center justify-center text-center leading-none w-20 h-20 rotate-12"
            style={{
              left: `${panel.soundEffectPosition?.x ?? 78}%`,
              top: `${panel.soundEffectPosition?.y ?? 12}%`,
            }}
          >
            <span className="text-sm px-4">{panel.soundEffect}</span>
          </div>
        )}

        {/* Dialogue balloons */}
        <div className="absolute inset-0 p-2.5 pointer-events-none flex flex-col justify-between gap-2">
          {panel.bubbles.map((b) => {
            const isEditing = editingBubbleId === b.id;
            const isRight = b.position.includes('right');
            if (b.type === 'caption') {
              return (
                <div key={b.id} className="flex pointer-events-auto">
                  <div className="caption-box px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide max-w-[90%]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={bubbleTextDraft}
                        onChange={(e) => setBubbleTextDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(panel.panelNumber - 1, b.id)}
                        autoFocus
                        className="bg-transparent outline-none w-full border-b-2 border-ink"
                      />
                    ) : (
                      <span onClick={() => handleStartEdit(b.id, b.text)} className="cursor-pointer">
                        {b.text}
                      </span>
                    )}
                  </div>
                </div>
              );
            }
            const balloonClass =
              b.type === 'thought'
                ? 'balloon balloon-thought'
                : b.type === 'shout'
                  ? 'balloon balloon-shout'
                  : 'balloon';
            return (
              <div key={b.id} className={`flex pointer-events-auto ${isRight ? 'justify-end' : 'justify-start'}`}>
                <div className={`${balloonClass} ${isRight ? 'balloon-right' : ''} px-2.5 py-1.5 max-w-[88%]`}>
                  <div className="flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-widest">
                    <span>{b.speaker}</span>
                    <button
                      type="button"
                      onClick={() => (isEditing ? handleSaveEdit(panel.panelNumber - 1, b.id) : handleStartEdit(b.id, b.text))}
                      className="opacity-50 hover:opacity-100"
                      title="Edit text"
                    >
                      {isEditing ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                    </button>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={bubbleTextDraft}
                      onChange={(e) => setBubbleTextDraft(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(panel.panelNumber - 1, b.id)}
                      autoFocus
                      className="bg-transparent outline-none w-full text-xs font-semibold border-b-2 border-ink"
                    />
                  ) : (
                    <p onClick={() => handleStartEdit(b.id, b.text)} className="text-xs font-semibold leading-snug cursor-pointer">
                      {b.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel number burst */}
        <div className="burst absolute bottom-1.5 right-1.5 bg-comic-yellow text-ink font-display w-10 h-10 flex items-center justify-center text-base -rotate-12 border-2 border-ink">
          {panel.panelNumber}
        </div>
      </div>
    );
  };
  const leftPage = currentPage === 1 ? [strip.panels[0], strip.panels[1]] : [strip.panels[2], strip.panels[3]];
  const rightPage = currentPage === 1 ? [strip.panels[2], strip.panels[3]] : [strip.panels[0], strip.panels[1]];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col items-center select-none">
      {/* Studio controls */}
      <div className="w-full flex items-center justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="caption-box px-2.5 py-1 text-[11px] font-black uppercase tracking-widest">
            Issue #{strip.id.slice(-4)}
          </span>
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">
            {strip.domain} saga • {strip.artStyle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="comic-btn bg-paper rounded-full p-2"
            title="Toggle paper audio effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={handleExportPng}
            className="comic-btn bg-comic-blue text-paper rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export spread</span>
          </button>
          <button
            onClick={handleShare}
            className="comic-btn bg-paper rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Physical comic spread */}
      <div className="perspective-stage w-full flex justify-center">
        <div
          ref={bookRef}
          className="relative w-full max-w-5xl comic-frame bg-paper flex overflow-hidden"
          style={{
            transform: isFlipping ? 'rotateX(4deg) scale(0.98)' : 'rotateX(0deg) scale(1)',
          }}
        >
          {/* LEFT PAGE */}
          <div className="w-1/2 p-4 sm:p-6 flex flex-col gap-3 border-r-4 border-ink relative">
            <div className="border-b-[3px] border-ink pb-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                MindStrip comics • Page {currentPage * 2 - 1}
              </p>
              <h1 className="font-display text-2xl sm:text-4xl leading-none mt-1">
                {strip.title}
              </h1>
            </div>

            {leftPage.map((p) => (
              <div key={p.panelNumber}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                  Panel {p.panelNumber} • {p.title}
                </p>
                {renderPanelVisual(p)}
              </div>
            ))}

            <p className="caption-box px-2.5 py-1.5 text-xs font-bold mt-auto">
              Antagonist: {strip.cognitiveAnalysis.antagonistPersonified} — {strip.cognitiveAnalysis.primaryDistortion}
            </p>
          </div>

          {/* RIGHT PAGE */}
          <div className="w-1/2 p-4 sm:p-6 flex flex-col gap-3">
            <div className="border-b-[3px] border-ink pb-2 flex items-baseline justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                Resolution & momentum
              </p>
              <p className="text-[10px] font-black">Page {currentPage * 2}</p>
            </div>

            {rightPage.map((p) => (
              <div key={p.panelNumber}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                  Panel {p.panelNumber} • {p.title}
                </p>
                {renderPanelVisual(p)}
              </div>
            ))}

            <div className="mt-auto flex items-center justify-between gap-2">
              <p className="text-xs font-bold truncate">
                Core reality: <span className="italic">“{strip.cognitiveAnalysis.coreTruth}”</span>
              </p>
              <button
                onClick={() => flipPage('next')}
                className="comic-btn bg-comic-red text-paper rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0"
                title="Turn the page"
              >
                <span>Turn page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[11px] font-bold uppercase tracking-widest opacity-70">
        Synthesized with {strip.metaModelUsed}
      </p>

      {/* New-strip console */}
      <div className="w-full max-w-2xl mt-6">
        <p className="font-display text-2xl mb-2 text-center">GOT BRAIN CHAOS? DUMP IT HERE!</p>
        <form
          onSubmit={handlePromptSubmit}
          className="comic-frame bg-paper rounded-2xl p-2 flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 ml-2 shrink-0" />
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Type the mess in your head… press STRIP IT!"
            className="w-full bg-transparent text-sm font-semibold placeholder:text-ink/40 outline-none"
          />
          <button
            type="submit"
            disabled={!promptInput.trim() || isLoading}
            className="comic-btn bg-comic-red text-paper rounded-xl px-5 py-2 text-sm font-display tracking-wider shrink-0"
          >
            {isLoading ? 'INKING…' : 'STRIP IT!'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-3 text-xs font-bold flex-wrap">
          <span className="uppercase tracking-widest">Try:</span>
          {[
            'My co-founder wants a 5-year TAM model',
            'Over-engineering a Redis lock at 2 AM',
            'Managing medical care routine while exhausted',
            'ADHD executive dysfunction opening tax PDF',
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                if (soundEnabled) soundManager.playPageTurn();
                onGenerateNew(suggestion);
              }}
              className="underline decoration-[3px] underline-offset-2 hover:bg-comic-yellow px-1"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
