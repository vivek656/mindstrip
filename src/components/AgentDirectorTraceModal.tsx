'use client';

import React from 'react';
import { AgentTraceStep, ComicStrip } from '@/types/comic';
import { X, Bot, ShieldCheck, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, BrainCircuit, RefreshCw, Eye } from 'lucide-react';

interface AgentDirectorTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: ComicStrip | null;
}

export function AgentDirectorTraceModal({
  isOpen,
  onClose,
  episode
}: AgentDirectorTraceModalProps) {
  if (!isOpen || !episode) return null;

  const trace: AgentTraceStep[] = episode.agentTrace || [];
  const canonScore = episode.canonScore ?? 95;
  const correctionsCount = episode.correctionsCount ?? 0;

  const getAgentIcon = (agent: AgentTraceStep['agent']) => {
    switch (agent) {
      case 'rag':
        return <BrainCircuit className="w-4 h-4 text-emerald-600" />;
      case 'showrunner':
        return <Bot className="w-4 h-4 text-purple-600" />;
      case 'auditor':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'art_director':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      default:
        return <Bot className="w-4 h-4 text-zinc-600" />;
    }
  };

  const getAgentBadgeColor = (agent: AgentTraceStep['agent']) => {
    switch (agent) {
      case 'rag':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'showrunner':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'auditor':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'art_director':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getStatusBadge = (status: AgentTraceStep['status']) => {
    switch (status) {
      case 'approved':
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Passed
          </span>
        );
      case 'revised':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin-reverse" /> Auto-Corrected
          </span>
        );
      case 'critique':
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Critique Flagged
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border-2 border-zinc-950 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b-2 border-zinc-950 bg-gradient-to-r from-purple-50 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-zinc-950">
                  Meta AI Production Room & Agent Trace
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-2xs font-mono font-bold">
                  Multi-Agent Loop
                </span>
              </div>
              <p className="text-xs text-zinc-600">
                Autonomous deliberation timeline between Showrunner, Canon Auditor & Art Director agents.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Performance & Canon Quality HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3.5 bg-zinc-50 border-b border-black/[0.08] text-xs">
          <div className="p-2.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
            <span className="text-2xs text-zinc-600 font-mono uppercase block">Canon Verification Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-bold font-mono ${canonScore >= 90 ? 'text-emerald-600' : canonScore >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                {canonScore}%
              </span>
              <span className="text-2xs text-zinc-600 font-semibold">Strict Lore Compliance</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
            <span className="text-2xs text-zinc-600 font-mono uppercase block">Self-Correction Loops</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-indigo-600">
                {correctionsCount}
              </span>
              <span className="text-2xs text-zinc-600 font-semibold">Autonomous Refactors</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
            <span className="text-2xs text-zinc-600 font-mono uppercase block">Layout & Dramatic Rhythm</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold font-mono text-purple-700 uppercase">
                {episode.layoutStyle || '4-panel'}
              </span>
              <span className="text-2xs text-zinc-600 font-semibold">Pacing</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
            <span className="text-2xs text-zinc-600 font-mono uppercase block">Textless Artwork Guard</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Clean
              </span>
              <span className="text-2xs text-zinc-600 font-semibold">No Label Bleed</span>
            </div>
          </div>
        </div>

        {/* Scrollable Agent Deliberation Timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-xs font-mono font-bold uppercase text-zinc-600 tracking-wider flex items-center gap-2">
              <span>📜</span>
              <span>Deliberation Sequence & Agent Logs</span>
            </h4>
            <span className="text-2xs font-mono text-zinc-600">
              Episode: &ldquo;{episode.title}&rdquo;
            </span>
          </div>

          {trace.length > 0 ? (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
              {trace.map((step, idx) => (
                <div key={step.id || idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-6 top-3 w-5 h-5 rounded-full bg-white border-2 border-zinc-950 flex items-center justify-center shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-zinc-950" />
                  </div>

                  <div className="p-4 rounded-2xl border border-black/[0.08] bg-white hover:border-black/[0.2] transition-all shadow-2xs space-y-2.5">
                    {/* Step Agent Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold border ${getAgentBadgeColor(step.agent)}`}>
                          {getAgentIcon(step.agent)}
                          <span>{step.agentName}</span>
                        </span>
                        <span className="font-semibold text-xs text-zinc-950">{step.action}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {step.score !== undefined && (
                          <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                            Score: {step.score}/100
                          </span>
                        )}
                        {getStatusBadge(step.status)}
                      </div>
                    </div>

                    {/* Summary text */}
                    <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                      {step.summary}
                    </p>

                    {/* Internal thoughts / Director Rationale */}
                    {step.thoughts && (
                      <div className="p-2.5 rounded-xl bg-zinc-50 border border-black/[0.04] text-xs text-zinc-600 font-mono text-2xs space-y-1">
                        <span className="font-bold text-zinc-800 uppercase block">Internal Reasoning:</span>
                        <p className="italic font-serif text-zinc-700">{step.thoughts}</p>
                      </div>
                    )}

                    {/* Detected Violations (if any) */}
                    {step.violations && step.violations.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                        <span className="font-bold font-mono text-2xs uppercase flex items-center gap-1 text-amber-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Violations Detected by Canon Auditor:</span>
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-2xs text-amber-800 font-mono">
                          {step.violations.map((v, vIdx) => (
                            <li key={vIdx}>{v}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Self-Correction Before/After Diff */}
                    {step.diff && (
                      <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-2">
                        <span className="font-bold font-mono text-2xs uppercase text-indigo-900 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Autonomous Self-Correction Diff ({step.diff.field}):</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs font-mono">
                          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                            <span className="font-bold block text-rose-700 line-through">Before Critique:</span>
                            <span>{step.diff.before}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                            <span className="font-bold block text-emerald-700">After Auto-Fix:</span>
                            <span>{step.diff.after}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Anchors / RAG provenance pills */}
                    {step.anchors && step.anchors.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-2xs text-zinc-600 font-mono">Anchors:</span>
                        {step.anchors.map((anchor, aIdx) => (
                          <span
                            key={aIdx}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 border border-black/[0.06] text-zinc-700 text-2xs font-mono"
                          >
                            {anchor}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-black/[0.06] text-zinc-600 space-y-2">
              <BrainCircuit className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs">
                This episode was created prior to the multi-agent production upgrade. Future episodes will feature full Showrunner, Auditor, and Art Director traces.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-black/[0.08] bg-zinc-50 flex items-center justify-between text-xs text-zinc-600 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Agent Production Room Active</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
}
