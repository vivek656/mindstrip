'use client';

import React, { useState, useEffect } from 'react';
import { CognitiveAnalysis } from '@/types/comic';
import { Check, CheckCircle2, Circle, Clock, TrendingDown, Copy, X, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActionBlueprintProps {
  analysis: CognitiveAnalysis;
  isCinemaTheme?: boolean;
  onClose?: () => void;
}

export function ActionBlueprint({ analysis, isCinemaTheme = false, onClose }: ActionBlueprintProps) {
  const getInitialActions = () => {
    if (analysis.actionBlueprint && analysis.actionBlueprint.length > 0) {
      return analysis.actionBlueprint;
    }
    return [
      {
        id: 'act-1',
        action: `Isolate the single variable within your control from this dilemma.`,
        timeRequired: '3 mins',
        completed: false
      },
      {
        id: 'act-2',
        action: `Execute one micro-countermeasure to defuse the perceived threat.`,
        timeRequired: '4 mins',
        completed: false
      },
      {
        id: 'act-3',
        action: `Log the grounding takeaway into your personal lore notes.`,
        timeRequired: '2 mins',
        completed: false
      }
    ];
  };

  const [actions, setActions] = useState(getInitialActions);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActions(getInitialActions());
  }, [analysis]);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.completed;
          if (next) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
            });
          }
          return { ...item, completed: next };
        }
        return item;
      })
    );
  };

  const handleCopy = () => {
    const text = `MindStrip Cognitive Action Blueprint:\n\nGrounding Reality: "${analysis.coreTruth}"\nPrimary Distortion: ${analysis.primaryDistortion}\nPersonified Antagonist: ${analysis.antagonistPersonified}\nCognitive Burden Shift: ${analysis.initialBurdenScore}% -> ${analysis.finalBurdenScore}% (+${analysis.mentalSpaceFreedMinutes} mins mental bandwidth)\n\nFriction-Free Momentum Steps:\n${actions
      .map((a, i) => `${i + 1}. [${a.completed ? 'x' : ' '}] ${a.action} (${a.timeRequired})`)
      .join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = actions.filter((a) => a.completed).length;
  const burdenReduction = Math.max(0, analysis.initialBurdenScore - analysis.finalBurdenScore);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-3">
      <div className={`rounded-3xl p-5 sm:p-7 shadow-xl border transition-all ${
        isCinemaTheme
          ? 'bg-zinc-900/90 text-white border-zinc-700/60 shadow-black/40'
          : 'bg-white/95 text-zinc-900 border-zinc-200/80 shadow-zinc-200/50'
      }`}>
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${
                  isCinemaTheme ? 'text-zinc-100' : 'text-zinc-900'
                }`}>
                  Cognitive Relief & Action Blueprint
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  -{burdenReduction}% Burden
                </span>
              </div>
              <p className={`text-xs ${isCinemaTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Deconstruct cognitive friction and convert narrative insight into physical momentum.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : isCinemaTheme
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
              }`}
              title="Copy markdown action plan to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Plan'}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isCinemaTheme
                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                    : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
                }`}
                title="Collapse Action Blueprint"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Apple-style Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          {/* Cognitive Friction Shift */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isCinemaTheme
              ? 'bg-zinc-800/40 border-zinc-700/60'
              : 'bg-blue-50/40 border-blue-100'
          }`}>
            <span className={`text-[11px] font-semibold tracking-tight flex items-center gap-1 ${
              isCinemaTheme ? 'text-blue-400' : 'text-blue-700'
            }`}>
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Cognitive Burden Shift</span>
            </span>
            <div className="my-2.5 flex items-baseline gap-2">
              <span className={`text-2xl font-light line-through ${
                isCinemaTheme ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                {analysis.initialBurdenScore}%
              </span>
              <span className={`text-3xl font-extrabold tracking-tight ${
                isCinemaTheme ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {analysis.finalBurdenScore}%
              </span>
            </div>
            <span className={`text-[11px] flex items-center gap-1 font-medium ${
              isCinemaTheme ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>+{analysis.mentalSpaceFreedMinutes || 90} mins mental bandwidth</span>
            </span>
          </div>

          {/* Primary Distortion */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isCinemaTheme
              ? 'bg-zinc-800/40 border-zinc-700/60'
              : 'bg-purple-50/40 border-purple-100'
          }`}>
            <span className={`text-[11px] font-semibold tracking-tight ${
              isCinemaTheme ? 'text-purple-400' : 'text-purple-700'
            }`}>
              Deconstructed Distortion
            </span>
            <div className="my-2">
              <div className={`text-sm font-bold tracking-tight line-clamp-2 ${
                isCinemaTheme ? 'text-zinc-100' : 'text-zinc-900'
              }`}>
                {analysis.primaryDistortion || 'Narrative Framing & Resolution'}
              </div>
              <p className={`mt-1 text-[11px] leading-relaxed ${
                isCinemaTheme ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                The cognitive distortion defused in this chapter.
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Resolved in narrative</span>
            </span>
          </div>

          {/* Personified Antagonist */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isCinemaTheme
              ? 'bg-zinc-800/40 border-zinc-700/60'
              : 'bg-emerald-50/40 border-emerald-100'
          }`}>
            <span className={`text-[11px] font-semibold tracking-tight ${
              isCinemaTheme ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              Externalized Antagonist
            </span>
            <div className="my-2">
              <div className={`text-sm font-bold tracking-tight line-clamp-2 ${
                isCinemaTheme ? 'text-zinc-100' : 'text-zinc-900'
              }`}>
                {analysis.antagonistPersonified || 'The Central Obstacle'}
              </div>
              <p className={`mt-1 text-[11px] leading-relaxed ${
                isCinemaTheme ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Externalized from identity into a manageable obstacle.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Deflated in panel #3
            </span>
          </div>
        </div>

        {/* The Core Reality Quote */}
        {analysis.coreTruth && (
          <div className={`mt-4 p-4 rounded-2xl border ${
            isCinemaTheme
              ? 'bg-blue-950/20 border-blue-900/40 text-blue-200'
              : 'bg-blue-50/60 border-blue-200/80 text-blue-950'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Grounding Reality
            </span>
            <p className="text-sm sm:text-base font-serif italic leading-snug">
              &ldquo;{analysis.coreTruth}&rdquo;
            </p>
          </div>
        )}

        {/* 3-Step Action Tasks */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5 text-xs font-semibold">
            <span className={isCinemaTheme ? 'text-zinc-300' : 'text-zinc-700'}>
              Friction-Free Momentum (Under 5 mins each)
            </span>
            <span className={`font-mono text-[11px] ${
              completedCount === actions.length && actions.length > 0
                ? 'text-emerald-500 font-bold'
                : isCinemaTheme ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              {completedCount} of {actions.length} completed
            </span>
          </div>

          <div className="space-y-2">
            {actions.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => toggleAction(item.id)}
                className={`px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.completed
                    ? isCinemaTheme
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-zinc-400 line-through'
                      : 'border-emerald-500/30 bg-emerald-50/60 text-zinc-400 line-through'
                    : isCinemaTheme
                    ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800/70 text-zinc-200'
                    : 'border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100 text-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className={`w-4 h-4 ${isCinemaTheme ? 'text-zinc-600' : 'text-zinc-300'}`} />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-medium leading-tight">
                    <span className="font-mono text-zinc-400 mr-2 text-xs">0{idx + 1}.</span>
                    {item.action}
                  </span>
                </div>

                <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isCinemaTheme ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200/70 text-zinc-600'
                }`}>
                  {item.timeRequired}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
