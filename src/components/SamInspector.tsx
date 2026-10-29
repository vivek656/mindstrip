'use client';

import React, { useState } from 'react';
import { ComicPanel } from '@/types/comic';
import { X, Scan, Eye, EyeOff, Layers } from 'lucide-react';

interface SamInspectorProps {
  panel: ComicPanel | null;
  onClose: () => void;
}

export function SamInspector({ panel, onClose }: SamInspectorProps) {
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [hiddenSegments, setHiddenSegments] = useState<string[]>([]);

  if (!panel) return null;

  const segments = panel.segmentedElements || [];

  const toggleHide = (id: string) => {
    setHiddenSegments((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-2xl animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.08] text-blue-500">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  Meta SAM 3.1 Inspector
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  Zero-Shot Segmentation
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Panel 0{panel.panelNumber} • {panel.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Matrix */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="relative aspect-[16/10] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center">
              
              {/* Subtle Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

              {/* Masks */}
              {segments.map((seg) => {
                const isHidden = hiddenSegments.includes(seg.id);
                if (isHidden) return null;
                const isActive = activeSegmentId === seg.id;
                const [x, y, w, h] = seg.box;

                return (
                  <div
                    key={seg.id}
                    onMouseEnter={() => setActiveSegmentId(seg.id)}
                    onMouseLeave={() => setActiveSegmentId(null)}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${w}%`,
                      height: `${h}%`,
                      borderColor: seg.maskColor,
                      backgroundColor: isActive ? `${seg.maskColor}30` : `${seg.maskColor}10`,
                    }}
                    className={`absolute rounded-xl border transition-all flex flex-col justify-between p-2 cursor-pointer ${
                      isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                  >
                    <span
                      style={{ backgroundColor: seg.maskColor }}
                      className="inline-block px-2 py-0.5 rounded-full text-[9px] font-medium text-white self-start tracking-wider uppercase"
                    >
                      {seg.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300 bg-black/60 px-1.5 py-0.5 rounded-full self-end">
                      {(seg.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}

              <div className="text-zinc-600 text-xs font-mono select-none pointer-events-none">
                [SAM 3.1 Mask Matrix Active]
              </div>
            </div>

            <div className="mt-2.5 text-xs text-zinc-400 flex items-center justify-between">
              <span>Hover over layer to highlight boundaries</span>
              <span className="font-mono text-[11px] text-zinc-500">{segments.length} masks identified</span>
            </div>
          </div>

          {/* Sidebar Layer Stack */}
          <div className="flex flex-col space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Segmented Elements</span>
            </span>

            <div className="space-y-1.5 overflow-y-auto max-h-[320px]">
              {segments.map((seg) => {
                const isHidden = hiddenSegments.includes(seg.id);
                const isActive = activeSegmentId === seg.id;

                return (
                  <div
                    key={seg.id}
                    onMouseEnter={() => setActiveSegmentId(seg.id)}
                    onMouseLeave={() => setActiveSegmentId(null)}
                    className={`px-3 py-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      isActive
                        ? 'border-blue-500 bg-blue-500/[0.04]'
                        : 'border-black/[0.06] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.maskColor }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {seg.label}
                        </div>
                        <div className="text-[10px] text-zinc-400 capitalize">
                          {seg.category.replace('_', ' ')} • {(seg.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleHide(seg.id)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
