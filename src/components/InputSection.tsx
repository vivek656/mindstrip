'use client';

import React, { useState } from 'react';
import { ArtStyle, PerspectiveLens, PresetScenario } from '@/types/comic';
import { PRESET_SCENARIOS } from '@/lib/presets';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  ArrowRight,
  RotateCcw, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface InputSectionProps {
  onGenerate: (rawDump: string, artStyle: ArtStyle, lens: PerspectiveLens) => void;
  isLoading: boolean;
  activeDomain?: string;
}

export function InputSection({ onGenerate, isLoading }: InputSectionProps) {
  const [rawDump, setRawDump] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>('minimalist');
  const [selectedLens, setSelectedLens] = useState<PerspectiveLens>('candid');
  const [isRecording, setIsRecording] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('healthcare-caregiver');
  const [showOptions, setShowOptions] = useState(false);

  const handleApplyPreset = (preset: PresetScenario) => {
    setRawDump(preset.rawDump);
    setSelectedStyle(preset.recommendedStyle);
    if (preset.recommendedLens) {
      setSelectedLens(preset.recommendedLens);
    }
    setActivePresetId(preset.id);
  };

  const handleSimulateVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    const sampleVoiceText = "I've been staring at this medical care schedule and the 18 pending work tasks for three hours. My head feels like it's going to burst from trying to hold all these variables at once without making a single mistake. I need to get this out of my head right now.";
    let currentIndex = 0;
    setRawDump('');
    
    const interval = setInterval(() => {
      if (currentIndex < sampleVoiceText.length) {
        setRawDump((prev) => prev + sampleVoiceText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 22);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawDump.trim() || isLoading) return;
    onGenerate(rawDump.trim(), selectedStyle, selectedLens);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-6">
      {/* Apple-style Hero Heading */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-4 tracking-tight">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Meta Superintelligence Hackathon</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.15]">
          Clarity from complexity.
        </h1>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">
          Pour raw thoughts, cognitive fatigue, or decision friction into Meta’s newest models. Receive an elegant storyboard narrative and an immediate path forward.
        </p>
      </div>

      {/* Preset Pills: Monochromatic, Refined */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
          <span className="font-medium tracking-tight">Select a scenario to explore:</span>
          {activePresetId && (
            <button
              onClick={() => {
                setActivePresetId(null);
                setRawDump('');
              }}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                    : 'bg-black/[0.03] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.07] dark:hover:bg-white/[0.1]'
                }`}
              >
                {preset.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimalist Input Card */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel rounded-2xl shadow-xl shadow-black/[0.03] dark:shadow-black/[0.2] overflow-hidden transition-all focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600">
          
          {/* Main Textarea */}
          <div className="p-4 sm:p-5">
            <textarea
              value={rawDump}
              onChange={(e) => {
                setRawDump(e.target.value);
                setActivePresetId(null);
              }}
              placeholder="Describe what's weighing on your mind: overwhelming responsibilities, conflicting priorities, or unresolved dilemmas..."
              rows={4}
              className="w-full bg-transparent resize-y outline-none text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 leading-relaxed font-normal"
            />
          </div>

          {/* Action Footer */}
          <div className="px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateVoice}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-black/[0.04] dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.12]'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Listening...' : 'Voice Dictation'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Options</span>
                {showOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!rawDump.trim() || isLoading}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                !rawDump.trim() || isLoading
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Storyboard...</span>
                </>
              ) : (
                <>
                  <span>Synthesize</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Collapsible Options Drawer */}
          {showOptions && (
            <div className="p-4 sm:p-5 bg-black/[0.015] dark:bg-white/[0.015] border-t border-black/[0.06] dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in fade-in duration-150">
              {/* Art Style */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Storyboard Aesthetic
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'minimalist', label: 'Minimalist Line' },
                    { id: 'webcomic', label: 'Modern Editorial' },
                    { id: 'newspaper', label: 'Classic Print' },
                    { id: 'cyberpunk', label: 'Slate Dark' },
                    { id: 'manga', label: 'Cinematic Ink' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStyle(s.id as ArtStyle)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedStyle === s.id
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : 'bg-black/[0.03] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.06]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Perspective Lens */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Cognitive Lens
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'candid', label: 'Objective Realist' },
                    { id: 'stoic', label: 'Stoic Clarity' },
                    { id: 'empathetic', label: 'Empathetic Sage' },
                    { id: 'engineer', label: 'Pragmatic Systems' },
                    { id: 'satirical', label: 'Gentle Wit' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedLens(l.id as PerspectiveLens)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedLens === l.id
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : 'bg-black/[0.03] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.06]'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </form>
    </section>
  );
}
