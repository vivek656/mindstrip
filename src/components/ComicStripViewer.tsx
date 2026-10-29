'use client';

import React, { useRef, useState } from 'react';
import { ComicStrip, ComicPanel, ArtStyle } from '@/types/comic';
import { ComicPanelRenderer } from './ComicPanelRenderer';
import { Download, Share2, Check, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { ViewMode } from './Navbar';

interface ComicStripViewerProps {
  strip: ComicStrip;
  viewMode: ViewMode;
  onInspectSam: (panel: ComicPanel) => void;
  onRegenerateStyle: (style: ArtStyle) => void;
  onUpdateBubbleText?: (panelNumber: number, bubbleId: string, newText: string) => void;
}

export function ComicStripViewer({
  strip,
  viewMode,
  onInspectSam,
  onRegenerateStyle,
  onUpdateBubbleText,
}: ComicStripViewerProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [zoomedPanel, setZoomedPanel] = useState<ComicPanel | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDownloadPng = async () => {
    if (!stripRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(stripRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#fbfbfd',
      });
      const link = document.createElement('a');
      link.download = `mindstrip-${strip.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySummary = () => {
    const text = `MindStrip: ${strip.title}\n\nCore Reality: "${strip.cognitiveAnalysis.coreTruth}"\n\nAction Blueprint:\n${strip.cognitiveAnalysis.actionBlueprint
      .map((a, i) => `${i + 1}. [${a.completed ? 'x' : ' '}] ${a.action} (${a.timeRequired})`)
      .join('\n')}\n\nPowered by Meta Muse Spark & Muse Image`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLayoutClasses = () => {
    if (viewMode === 'webtoon') {
      return 'flex flex-col gap-6 max-w-xl mx-auto';
    }
    if (viewMode === 'strip') {
      return 'grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-2';
    }
    return 'grid grid-cols-1 md:grid-cols-2 gap-5';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <span className="capitalize font-medium text-zinc-600 dark:text-zinc-300">
              {strip.domain} Domain
            </span>
            <span>•</span>
            <span className="capitalize font-normal text-zinc-400">{strip.artStyle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {strip.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Storyboard Container Canvas */}
      <div
        ref={stripRef}
        className="p-5 sm:p-7 rounded-3xl glass-panel shadow-xl shadow-black/[0.02] dark:shadow-black/[0.2] transition-all"
      >
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06] dark:border-white/[0.06] text-xs text-zinc-400">
          <span className="font-mono text-[11px] font-medium tracking-tight">
            MINDSTRIP STORYBOARD #{strip.id.slice(-4)}
          </span>
          <span className="text-[11px] font-normal hidden sm:inline">
            Synthesized with {strip.metaModelUsed}
          </span>
        </div>

        <div className={getLayoutClasses()}>
          {strip.panels.map((panel) => (
            <ComicPanelRenderer
              key={panel.panelNumber}
              panel={panel}
              artStyle={strip.artStyle}
              onInspectSam={onInspectSam}
              onUpdateBubbleText={onUpdateBubbleText}
              onZoomPanel={(p) => setZoomedPanel(p)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {zoomedPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.1]">
            <button
              onClick={() => setZoomedPanel(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mt-2">
              <ComicPanelRenderer
                panel={zoomedPanel}
                artStyle={strip.artStyle}
                onInspectSam={onInspectSam}
                onUpdateBubbleText={onUpdateBubbleText}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
