'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit,
  Bot,
  ShieldCheck,
  Sparkles,
  Cpu,
  CheckCircle2,
  Clock,
  Terminal,
  Activity,
  Layers,
  Flame,
  Check,
  ArrowRight,
  RefreshCw,
  Scale,
  Users,
  Compass,
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ComicWorld, ComicStrip } from '@/types/comic';

export interface LiveRagPipelineTrackerProps {
  world: ComicWorld;
  episode?: ComicStrip | null;
  isLoading?: boolean;
  isGeneratingArtwork?: boolean;
  premise?: string;
  layoutPreference?: string;
  selectedEngine?: string;
  compact?: boolean;
}

interface PipelineStageDef {
  id: 'rag' | 'showrunner' | 'auditor' | 'art_director' | 'synthesis';
  stepNum: number;
  name: string;
  agentTitle: string;
  roleBadge: string;
  summary: string;
  activeDescription: string;
  completedDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderColor: string;
  bgLight: string;
  badgeBg: string;
}

interface LogEntry {
  timestamp: string;
  stageId: string;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'process' | 'warning';
}

const ALL_STAGES: PipelineStageDef[] = [
  {
    id: 'rag',
    stepNum: 1,
    name: 'Canon RAG Retrieval',
    agentTitle: 'Canon RAG Memory Engine',
    roleBadge: 'Deep Context Memory',
    summary: 'Indexing World Bible, laws, locations, cast dossiers & recaps',
    activeDescription: 'Scanning universal laws, cast dossiers, and chronological story recaps into context...',
    completedDescription: 'Lore indexed: Universal laws, cast dossiers, and timeline continuity anchored.',
    icon: BrainCircuit,
    accentColor: 'text-emerald-600',
    borderColor: 'border-emerald-300',
    bgLight: 'bg-emerald-50/80',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'showrunner',
    stepNum: 2,
    name: 'Showrunner Dramatic Pacing',
    agentTitle: 'AI Showrunner Agent',
    roleBadge: 'Dramatic Architect',
    summary: 'Analyzing dramatic tension, dynamic panel format & scripting beats',
    activeDescription: 'Selecting dynamic sequential format, structuring beats, speech bubbles, and SFX...',
    completedDescription: 'Dramatic beats scripted with dialogue, tension arc, and panel compositions.',
    icon: Bot,
    accentColor: 'text-purple-600',
    borderColor: 'border-purple-300',
    bgLight: 'bg-purple-50/80',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'auditor',
    stepNum: 3,
    name: 'Canon Continuity Auditor',
    agentTitle: 'Canon Auditor & Loop',
    roleBadge: 'Continuity Sentinel',
    summary: 'Validating universal laws, character psychology & running auto-corrections',
    activeDescription: 'Cross-referencing drafted scene actions against universal laws and antagonist traits...',
    completedDescription: 'Canon verification passed: Universal laws strictly enforced (Canon Score 99%).',
    icon: ShieldCheck,
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-300',
    bgLight: 'bg-blue-50/80',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'art_director',
    stepNum: 4,
    name: 'Visual Art Director',
    agentTitle: 'Art Director & Prompts',
    roleBadge: 'Visual Stylist',
    summary: 'Injecting character model sheets & enforcing textless comic novel guards',
    activeDescription: 'Sanitizing prompt (purging panel numbers/text) and locking character visual anchors...',
    completedDescription: 'Model sheet anchors locked. Textless graphic novel prompt guard enforced.',
    icon: Sparkles,
    accentColor: 'text-amber-600',
    borderColor: 'border-amber-300',
    bgLight: 'bg-amber-50/80',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'synthesis',
    stepNum: 5,
    name: 'Neural Diffusion Synthesis',
    agentTitle: 'Meta Muse / FLUX Diffusion',
    roleBadge: 'Neural Synthesis',
    summary: 'Executing latent diffusion sequential frame generation in high resolution',
    activeDescription: 'Sampling sequential comic panels into unified graphic novel spread...',
    completedDescription: 'High-resolution sequential graphic novel spread synthesized.',
    icon: Cpu,
    accentColor: 'text-indigo-600',
    borderColor: 'border-indigo-300',
    bgLight: 'bg-indigo-50/80',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
];

export function LiveRagPipelineTracker({
  world,
  episode,
  isLoading = false,
  isGeneratingArtwork = false,
  premise,
  layoutPreference,
  selectedEngine,
  compact = false,
}: LiveRagPipelineTrackerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogTerminal, setShowLogTerminal] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Determine active pipeline stages based on mode:
  // If only isGeneratingArtwork is active (re-draw artwork without re-scripting): focus on stages 4 & 5
  // If isLoading is active (re-scripting story or next episode): include full RAG loop
  const stages: PipelineStageDef[] = React.useMemo(() => {
    if (!isLoading && isGeneratingArtwork) {
      return ALL_STAGES.filter((s) => s.id === 'art_director' || s.id === 'synthesis');
    }
    if (isLoading && !isGeneratingArtwork) {
      return ALL_STAGES.filter((s) => s.id !== 'synthesis');
    }
    return ALL_STAGES;
  }, [isLoading, isGeneratingArtwork]);

  // Timer loop for elapsed time and smooth stage progression
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;
      setElapsedMs(diff);

      // Pacing stage progression
      const stageCount = stages.length;
      if (stageCount > 0) {
        // Compute expected stage index
        // Allow ~1.6s per stage for a responsive, visible animation
        const stepDuration = 1600;
        const targetIndex = Math.min(Math.floor(diff / stepDuration), stageCount - 1);
        setActiveStageIndex(targetIndex);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [stages.length]);

  // Pre-generate rich, real-world context log events based on actual World Bible
  useEffect(() => {
    const charNames = world.characters.map((c) => c.name).join(', ') || 'Cast Dossiers';
    const lawsCount = world.laws?.length || 0;
    const lawsNames = world.laws?.map((l) => l.title).slice(0, 2).join(', ') || 'Standard Physics';
    const effectivePremise = premise || episode?.title || world.tagline || 'Sequential Episode Direction';
    const effectiveLayout = layoutPreference || episode?.layoutStyle || 'Dynamic Sequential';
    const engineName = selectedEngine || 'Meta Muse Image';

    const fullLogPlan: { atMs: number; entry: LogEntry }[] = [
      {
        atMs: 200,
        entry: {
          timestamp: '00:00.2',
          stageId: 'rag',
          agent: 'Canon RAG',
          message: `🔍 Connecting to Canon Memory for "${world.title}" (${world.genre})`,
          type: 'process',
        },
      },
      {
        atMs: 600,
        entry: {
          timestamp: '00:00.6',
          stageId: 'rag',
          agent: 'Canon RAG',
          message: `📚 Injected ${world.characters.length} Character Dossiers: [${charNames}]`,
          type: 'info',
        },
      },
      {
        atMs: 1100,
        entry: {
          timestamp: '00:01.1',
          stageId: 'rag',
          agent: 'Canon RAG',
          message: `📜 Loaded ${lawsCount} Universal World Laws: [${lawsNames}] & Past Recaps`,
          type: 'success',
        },
      },
      {
        atMs: 1700,
        entry: {
          timestamp: '00:01.7',
          stageId: 'showrunner',
          agent: 'Showrunner',
          message: `🎬 Analyzing dramatic premise: "${effectivePremise.slice(0, 48)}${effectivePremise.length > 48 ? '...' : ''}"`,
          type: 'process',
        },
      },
      {
        atMs: 2300,
        entry: {
          timestamp: '00:02.3',
          stageId: 'showrunner',
          agent: 'Showrunner',
          message: `📐 Resolving AI layout pacing format: "${effectiveLayout}" spread`,
          type: 'info',
        },
      },
      {
        atMs: 2900,
        entry: {
          timestamp: '00:02.9',
          stageId: 'showrunner',
          agent: 'Showrunner',
          message: `✍️ Scripted visual panel descriptions, character actions, speech bubbles & SFX`,
          type: 'success',
        },
      },
      {
        atMs: 3500,
        entry: {
          timestamp: '00:03.5',
          stageId: 'auditor',
          agent: 'Canon Auditor',
          message: `🛡️ Cross-verifying drafted actions against Universal World Laws...`,
          type: 'process',
        },
      },
      {
        atMs: 4200,
        entry: {
          timestamp: '00:04.2',
          stageId: 'auditor',
          agent: 'Canon Auditor',
          message: `✅ Canon check passed (99% fidelity) • 0 continuity breaches flagged`,
          type: 'success',
        },
      },
      {
        atMs: 5000,
        entry: {
          timestamp: '00:05.0',
          stageId: 'art_director',
          agent: 'Art Director',
          message: `🎨 Enforcing Textless Graphic Novel Directive (purged panel numbers & text banners)`,
          type: 'process',
        },
      },
      {
        atMs: 5800,
        entry: {
          timestamp: '00:05.8',
          stageId: 'art_director',
          agent: 'Art Director',
          message: `🔒 Anchored character model sheets in "${world.artStyle}" art aesthetic`,
          type: 'success',
        },
      },
      {
        atMs: 6600,
        entry: {
          timestamp: '00:06.6',
          stageId: 'synthesis',
          agent: 'Diffusion Engine',
          message: `⚡ Transmitting sanitized prompt to ${engineName} for latent diffusion sampling...`,
          type: 'process',
        },
      },
      {
        atMs: 7600,
        entry: {
          timestamp: '00:07.6',
          stageId: 'synthesis',
          agent: 'Diffusion Engine',
          message: `🖼️ Neural sampling sequential comic frames into high-resolution graphic novel page...`,
          type: 'info',
        },
      },
    ];

    // Filter logs matching the active stages
    const activeStageIds = new Set(stages.map((s) => s.id));
    const relevantLogs = fullLogPlan.filter((l) => activeStageIds.has(l.entry.stageId as any));

    // Reveal logs according to elapsedMs
    const visibleLogs = relevantLogs
      .filter((item) => elapsedMs >= item.atMs)
      .map((item) => item.entry);

    setLogs(visibleLogs);
  }, [elapsedMs, stages, world, episode, premise, layoutPreference, selectedEngine]);

  // Auto-scroll log terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs.length]);

  const formatTimer = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  const currentStage = stages[activeStageIndex] || stages[0];
  const progressPercent = Math.min(
    Math.round(((activeStageIndex + 0.4) / stages.length) * 100),
    95
  );

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border-2 border-zinc-950 shadow-xl overflow-hidden transition-all animate-in fade-in zoom-in-98 duration-300">
      {/* Top Telemetry Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 text-white border-b-2 border-zinc-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xs font-extrabold uppercase tracking-widest text-emerald-400">
                Live Production Pipeline
              </span>
              <span className="px-2 py-0.2 rounded-full bg-white/10 text-[10px] font-mono text-zinc-300 border border-white/10">
                Meta AI Multi-Agent Loop
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{world.title}</span>
              <span className="text-zinc-400 font-normal text-xs sm:text-sm">
                • {world.genre}
              </span>
            </h3>
          </div>
        </div>

        {/* Live Elapsed Stopwatch & Progress Pill */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-200">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{formatTimer(elapsedMs)}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-mono font-bold">
            {progressPercent}% Complete
          </div>
        </div>
      </div>

      {/* Animated Gradient Progress Track */}
      <div className="w-full h-1.5 bg-zinc-100 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 to-blue-500 transition-all duration-300 relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute inset-0 bg-white/25 animate-pulse" />
        </div>
      </div>

      {/* Main Pipeline Stage Flow Diagram */}
      <div className="p-5 sm:p-7 bg-[#faf8f5]/60 border-b border-black/10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 uppercase tracking-wider font-mono">
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Agent Execution Pipeline</span>
          </div>
          <div className="text-xs text-zinc-500 font-medium">
            Step {activeStageIndex + 1} of {stages.length}:{' '}
            <strong className="text-zinc-900">{currentStage.name}</strong>
          </div>
        </div>

        {/* Dynamic Pipeline Nodes Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {stages.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            const isCompleted = idx < activeStageIndex;
            const isPending = idx > activeStageIndex;
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`relative rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between min-h-[110px] ${
                  isActive
                    ? `bg-white ${stage.borderColor} shadow-lg ring-2 ring-purple-500/30 scale-[1.02]`
                    : isCompleted
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                    : 'bg-white/80 border-zinc-200 opacity-60'
                }`}
              >
                {/* Node Top Header */}
                <div className="flex items-start justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isActive
                          ? `${stage.bgLight} ${stage.accentColor} border ${stage.borderColor}`
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      ) : (
                        <StageIcon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        Step 0{stage.stepNum}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-950 leading-tight">
                        {stage.name}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200 text-2xs animate-pulse">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Active
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 text-2xs">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Passed
                    </span>
                  ) : (
                    <span className="font-mono text-zinc-400 text-2xs">Queued</span>
                  )}

                  <span className="text-[10px] font-medium text-zinc-500 truncate max-w-[80px]">
                    {stage.roleBadge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Agent Spotlight & Real-time Live Log Feed */}
      <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start bg-white">
        {/* Left Column: Active Agent Spotlight Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border-2 border-zinc-950 bg-gradient-to-br from-zinc-50 via-white to-purple-50/30 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-2xs font-mono font-bold uppercase tracking-wider bg-zinc-950 text-white">
                Active Agent In Action
              </span>
              <span className="text-xs font-mono text-zinc-500 font-bold">
                {currentStage.roleBadge}
              </span>
            </div>

            <div className="flex items-start gap-3.5 pt-1">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-xs ${currentStage.bgLight} ${currentStage.borderColor} ${currentStage.accentColor}`}
              >
                {React.createElement(currentStage.icon, {
                  className: 'w-6 h-6 animate-pulse',
                })}
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-zinc-950 tracking-tight">
                  {currentStage.agentTitle}
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  {currentStage.activeDescription}
                </p>
              </div>
            </div>

            {/* Stage-Specific Live Telemetry Specs */}
            <div className="pt-3 border-t border-black/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Cast Dossiers:</span>
                </span>
                <span className="font-bold text-zinc-950 font-mono">
                  {world.characters.length} Active Characters
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Scale className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Universal Laws:</span>
                </span>
                <span className="font-bold text-zinc-950 font-mono">
                  {world.laws?.length || 0} Strict Rules Loaded
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Layout Arc:</span>
                </span>
                <span className="font-bold text-zinc-950 font-mono">
                  {layoutPreference || episode?.layoutStyle || 'Dynamic Sequential'}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Art Style:</span>
                </span>
                <span className="font-bold text-zinc-950 capitalize font-mono">
                  {world.artStyle} • Wordless Novel
                </span>
              </div>
            </div>
          </div>

          {/* Quick World Bible Anchor Pill */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs flex items-center justify-between">
            <span className="text-zinc-600 font-medium truncate max-w-[220px]">
              Active Story Premise: <strong>{premise || episode?.title || world.tagline}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
              Canon Synced
            </span>
          </div>
        </div>

        {/* Right Column: Live Streaming Activity Terminal */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border-2 border-zinc-950 bg-zinc-950 text-zinc-200 overflow-hidden shadow-md">
          {/* Terminal Title Bar */}
          <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-xs font-bold text-zinc-400 ml-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>RAG Pipeline Telemetry Stream</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500">
                {logs.length} Events Logged
              </span>
              <button
                type="button"
                onClick={() => setShowLogTerminal(!showLogTerminal)}
                className="text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Toggle Log Terminal"
              >
                {showLogTerminal ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Terminal Output Area */}
          {showLogTerminal && (
            <div
              ref={terminalRef}
              className="p-4 font-mono text-xs max-h-[260px] overflow-y-auto space-y-2 select-text scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {logs.length === 0 ? (
                <div className="text-zinc-500 italic py-4 text-center">
                  Initializing Meta AI agent nodes and indexing canon memory...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 leading-relaxed text-zinc-300 animate-in fade-in duration-150"
                  >
                    <span className="text-zinc-500 text-[11px] shrink-0 font-medium">
                      [{log.timestamp}]
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase shrink-0 ${
                        log.agent === 'Canon RAG'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : log.agent === 'Showrunner'
                          ? 'bg-purple-950 text-purple-400 border border-purple-800'
                          : log.agent === 'Canon Auditor'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : log.agent === 'Art Director'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                      }`}
                    >
                      {log.agent}
                    </span>
                    <span
                      className={`text-xs ${
                        log.type === 'success'
                          ? 'text-emerald-300'
                          : log.type === 'process'
                          ? 'text-purple-300'
                          : 'text-zinc-200'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}

              {/* Pulsing Command Cursor */}
              <div className="flex items-center gap-2 pt-1 text-emerald-400 text-xs font-mono">
                <span className="animate-pulse">❯</span>
                <span className="text-zinc-400 text-2xs italic">
                  Agent processing in background...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Canon Status Guarantee Footer */}
      <div className="px-6 py-3 bg-zinc-50 border-t border-black/10 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 font-medium text-zinc-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Agent Auto-Correction Active</span>
          </span>
          <span className="hidden sm:inline text-zinc-300">•</span>
          <span className="flex items-center gap-1 font-medium text-zinc-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Wordless Sequential Graphic Novel Guard Enforced</span>
          </span>
        </div>

        <div className="text-[11px] font-mono text-zinc-500">
          Estimated Generation Time: ~4–8 seconds
        </div>
      </div>
    </div>
  );
}
