'use client';

import React, { useState } from 'react';
import { CognitiveAnalysis } from '@/types/comic';
import { Check, CheckCircle2, Circle, Clock, TrendingDown, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActionBlueprintProps {
  analysis: CognitiveAnalysis;
}

export function ActionBlueprint({ analysis }: ActionBlueprintProps) {
  const [actions, setActions] = useState(analysis.actionBlueprint);
  const [copied, setCopied] = useState(false);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.completed;
          if (next) {
            confetti({
              particleCount: 40,
              spread: 50,
              origin: { y: 0.85 },
              colors: ['#0071e3', '#34c759', '#5856d6'],
            });
          }
          return { ...item, completed: next };
        }
        return item;
      })
    );
  };

  const handleCopy = () => {
    const text = `MindStrip Action Plan:\n\nGrounding Reality: "${analysis.coreTruth}"\n\nSteps:\n${actions
      .map((a, i) => `${i + 1}. [${a.completed ? 'x' : ' '}] ${a.action} (${a.timeRequired})`)
      .join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const completedCount = actions.filter((a) => a.completed).length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/[0.02] dark:shadow-black/[0.2] space-y-7">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Cognitive Insight & Next Steps
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Action Blueprint
            </h3>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-zinc-700 dark:text-zinc-300 transition-colors self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Plan'}</span>
          </button>
        </div>

        {/* Apple-style Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Cognitive Friction Shift */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-zinc-400 tracking-tight flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
              <span>Cognitive Burden Shift</span>
            </span>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-2xl font-light text-zinc-400 line-through">
                {analysis.initialBurdenScore}%
              </span>
              <span className="text-4xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                {analysis.finalBurdenScore}%
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>+{analysis.mentalSpaceFreedMinutes} mins mental bandwidth</span>
            </span>
          </div>

          {/* Primary Distortion */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-zinc-400 tracking-tight">
              Deconstructed Distortion
            </span>
            <div className="my-2">
              <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {analysis.primaryDistortion}
              </div>
              <p className="mt-1 text-xs text-zinc-400 font-normal leading-relaxed">
                The automatic distortion that amplified perceived stakes.
              </p>
            </div>
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
              Resolved in narrative
            </span>
          </div>

          {/* Personified Conflict */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-zinc-400 tracking-tight">
              Identified Antagonist
            </span>
            <div className="my-2">
              <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {analysis.antagonistPersonified}
              </div>
              <p className="mt-1 text-xs text-zinc-400 font-normal leading-relaxed">
                Externalized from identity into a manageable variable.
              </p>
            </div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Deflated in panel #3
            </span>
          </div>
        </div>

        {/* The Core Reality Quote */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/[0.04] border border-blue-500/10">
          <span className="text-[11px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Grounding Reality
          </span>
          <p className="mt-1.5 text-base sm:text-lg font-normal text-zinc-800 dark:text-zinc-200 leading-snug">
            "{analysis.coreTruth}"
          </p>
        </div>

        {/* 3-Step Action Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-zinc-400 font-medium">
            <span>Friction-Free Momentum (Under 5 mins each)</span>
            <span>{completedCount} of {actions.length} completed</span>
          </div>

          <div className="space-y-2">
            {actions.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => toggleAction(item.id)}
                className={`px-4 py-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  item.completed
                    ? 'border-emerald-500/20 bg-emerald-500/[0.03] text-zinc-400 line-through'
                    : 'border-black/[0.06] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-zinc-400">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    <span className="text-zinc-400 font-mono mr-2">0{idx + 1}.</span>
                    {item.action}
                  </span>
                </div>

                <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-zinc-400 bg-black/[0.04] dark:bg-white/[0.06]">
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
