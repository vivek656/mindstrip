'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Check, Sparkles, Shield, Cpu, Zap, Globe, Eye, EyeOff } from 'lucide-react';
import { ApiConfig, META_PRESETS, MetaPreset, ExecutionMode } from '@/lib/meta-models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSaveConfig: (config: ApiConfig) => void;
}

export function SettingsModal({ isOpen, onClose, config, onSaveConfig }: SettingsModalProps) {
  const resolveDefaultModel = (prov: string, currentModel?: string) => {
    if (prov === 'meta-api' && (!currentModel || currentModel === 'llama-3.3-70b-instruct')) {
      return 'muse-spark-1.3';
    }
    return currentModel || 'muse-spark-1.3';
  };

  const [mode, setMode] = useState<ExecutionMode>(config.mode || 'free');
  const [provider, setProvider] = useState<ApiConfig['provider']>(config.provider || 'meta-api');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || 'https://api.meta.ai/v1');
  const [modelName, setModelName] = useState(resolveDefaultModel(config.provider || 'meta-api', config.modelName));
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const prov = config.provider || 'meta-api';
    setMode(config.mode || 'free');
    setProvider(prov);
    setApiKey(config.apiKey || '');
    setBaseUrl(config.baseUrl || 'https://api.meta.ai/v1');
    setModelName(resolveDefaultModel(prov, config.modelName));
  }, [config]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: MetaPreset) => {
    setMode('meta');
    setProvider(preset.provider);
    setBaseUrl(preset.baseUrl);
    setModelName(preset.modelName);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      mode,
      provider: mode === 'free' ? 'simulation' : provider,
      apiKey: apiKey.trim() || undefined,
      baseUrl: baseUrl.trim() || undefined,
      modelName: modelName.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden text-zinc-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.08] bg-zinc-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm">
              M
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-950">
                AI Execution Mode & Meta Presets
              </h3>
              <p className="text-[11px] text-zinc-500">
                Meta Global AI Developer Hackathon Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Top Primary Mode Switcher */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Select Execution Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Free Mode */}
              <button
                type="button"
                onClick={() => setMode('free')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  mode === 'free'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-black/10 bg-white hover:border-black/25'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Free Mode
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    $0.00 Zero Cost
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Open community inference for trial & demo. Instant generation without any API keys or credit cards.
                </p>
              </button>

              {/* Option 2: Meta Mode */}
              <button
                type="button"
                onClick={() => setMode('meta')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  mode === 'meta'
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs'
                    : 'border-black/10 bg-white hover:border-black/25'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                    <span className="text-blue-600 font-bold">♾️</span>
                    Meta API Mode
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Hackathon Preset
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Official Meta Model Suite: Llama 3.3 70B, Muse Spark, and Hackathon partner inference.
                </p>
              </button>
            </div>
          </div>

          {/* META PRESETS CONFIGURATION SECTION */}
          {mode === 'meta' && (
            <div className="space-y-4 pt-2 border-t border-black/[0.08] animate-in fade-in duration-200">
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                    Quick 1-Click Meta Presets
                  </label>
                  <span className="text-[10px] text-zinc-400">Click to auto-configure</span>
                </div>

                {/* Cost Optimization Tip Banner */}
                <div className="mb-3 p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-950">
                  <span className="text-base shrink-0">💡</span>
                  <div className="leading-tight">
                    <span className="font-bold">Lowest Cost Tip:</span> Pair <span className="font-semibold underline">Groq Free Tier</span> or <span className="font-semibold underline">Local Ollama</span> ($0.00) with <span className="font-semibold underline">FLUX.1 Schnell</span> (~$0.003/page) for 330+ episodes per $1!
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {META_PRESETS.map((preset) => {
                    const isSelected = provider === preset.provider && modelName === preset.modelName;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                            : 'border-black/10 hover:border-black/25 bg-zinc-50/80 text-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs truncate">{preset.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-zinc-600'
                          }`}>
                            {preset.badge}
                          </span>
                        </div>
                        <p className={`text-[10px] leading-tight line-clamp-1 ${
                          isSelected ? 'text-zinc-300' : 'text-zinc-500'
                        }`}>
                          {preset.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Endpoint Details Form */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.06] space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                    API Key (Meta / Fireworks / Groq / Partner)
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={
                        META_PRESETS.find((p) => p.provider === provider)?.placeholderKey ||
                        'Paste your API key here (or leave empty if defined in .env.local)'
                      }
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-black/15 text-xs font-mono outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Zero-Secret Policy: Key is kept in browser memory only and never committed to code.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                      Endpoint Base URL
                    </label>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-mono outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                      Model Identifier
                    </label>
                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-mono outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-black/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero-Secret Client Policy Active</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {saved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save & Apply Preset</span>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
