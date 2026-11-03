'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ComicStrip, ComicPanel, ComicWorld } from '@/types/comic';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  Film,
  Smartphone,
  Tv,
  CheckCircle2,
  Layers,
  Repeat
} from 'lucide-react';

interface MotionComicModalProps {
  world: ComicWorld;
  episode: ComicStrip;
  isOpen: boolean;
  onClose: () => void;
}

export function MotionComicModal({
  world,
  episode,
  isOpen,
  onClose
}: MotionComicModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [panelProgress, setPanelProgress] = useState(0); // 0 to 100 within current panel
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Web Audio ambient synthesizer reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const panels: ComicPanel[] = episode.panels && episode.panels.length > 0 ? episode.panels : [
    {
      panelNumber: 1,
      title: 'Opening Setup',
      sceneDescription: 'The scene begins with dramatic tension.',
      visualMetaphor: 'Initial friction',
      characters: [world.characters[0]?.name || 'Protagonist'],
      bubbles: [{ id: 'b1', speaker: world.characters[0]?.name || 'Protagonist', text: episode.rawBrainDump || 'Everything is happening all at once...', type: 'speech', position: 'top-left' }],
      mood: 'stressed',
      soundEffect: 'FOCUS',
      imagePrompt: 'Opening scene with character'
    }
  ];

  const currentPanel = panels[currentPanelIndex] || panels[0];
  const PANEL_DURATION_MS = (4500 / playbackSpeed);

  // Initialize Web Audio Synth for ambient cinematic soundbed
  const startAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!gainNodeRef.current) {
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.connect(ctx.destination);
        gainNodeRef.current = gain;

        // Warm ambient drone (C-minor cinematic fifth: C2 = 65.4Hz, G2 = 98Hz)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(65.41, ctx.currentTime);
        osc1.connect(gain);
        osc1.start();
        osc1Ref.current = osc1;

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(97.99, ctx.currentTime);
        osc2.connect(gain);
        osc2.start();
        osc2Ref.current = osc2;
      } else {
        gainNodeRef.current.gain.setTargetAtTime(0.08, ctx.currentTime, 0.2);
      }
    } catch (e) {
      console.warn('Web Audio initialization note:', e);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
    }
  }, []);

  // Play chime / whoosh sound effect on panel transition
  const playTransitionSound = useCallback(() => {
    if (!isAudioEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const chimeGain = ctx.createGain();
      chimeGain.gain.setValueAtTime(0.05, ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      chimeGain.connect(ctx.destination);

      const chimeOsc = ctx.createOscillator();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      chimeOsc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.3); // C5
      chimeOsc.connect(chimeGain);
      chimeOsc.start();
      chimeOsc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio cue non-blocking
    }
  }, [isAudioEnabled]);

  // Audio lifecycle
  useEffect(() => {
    if (isOpen && isPlaying && isAudioEnabled) {
      startAudio();
    } else {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isOpen, isPlaying, isAudioEnabled, startAudio, stopAudio]);

  // Main playback timer loop
  useEffect(() => {
    if (!isOpen || !isPlaying || isExporting) return;

    const intervalMs = 50;
    const stepIncrement = (intervalMs / PANEL_DURATION_MS) * 100;

    const interval = setInterval(() => {
      setPanelProgress((prev) => {
        if (prev + stepIncrement >= 100) {
          // Advance to next panel
          setCurrentPanelIndex((currIdx) => {
            const nextIdx = currIdx + 1;
            if (nextIdx >= panels.length) {
              return 0; // Loop back to start
            }
            playTransitionSound();
            return nextIdx;
          });
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, isExporting, PANEL_DURATION_MS, panels.length, playTransitionSound]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentPanelIndex((curr) => (curr + 1) % panels.length);
        setPanelProgress(0);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentPanelIndex((curr) => (curr - 1 + panels.length) % panels.length);
        setPanelProgress(0);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, panels.length, onClose]);

  // Canvas MediaRecorder video export handler
  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    setIsPlaying(false);

    try {
      const width = aspectRatio === '16:9' ? 1280 : 720;
      const height = aspectRatio === '16:9' ? 720 : 1280;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize 2D canvas context');

      const stream = canvas.captureStream(30); // 30 fps video stream
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm'
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindstrip-${world.title.toLowerCase().replace(/\s+/g, '-')}-ep${episode.episodeNumber || 1}-motion.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setIsPlaying(true);
      };

      recorder.start();

      // Load background artwork if available
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      const imgSrc = currentPanel.imageUrl || episode.pageImageUrl;
      if (imgSrc) {
        await new Promise((resolve) => {
          bgImg.onload = resolve;
          bgImg.onerror = resolve;
          bgImg.src = imgSrc;
        });
      }

      const totalFrames = panels.length * 60; // 2 seconds per panel at 30fps
      let frame = 0;

      const renderNextFrame = () => {
        if (frame >= totalFrames) {
          recorder.stop();
          return;
        }

        const pIdx = Math.floor(frame / 60);
        const pFrac = (frame % 60) / 60;
        const panel = panels[pIdx] || panels[0];

        // Background
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, width, height);

        // Draw animated camera zoom image
        if (bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.save();
          const zoomScale = 1 + pFrac * 0.08;
          ctx.translate(width / 2, height / 2);
          ctx.scale(zoomScale, zoomScale);
          ctx.drawImage(bgImg, -width / 2, -height / 2, width, height);
          ctx.restore();
        }

        // Dark gradient vignette
        const grad = ctx.createLinearGradient(0, height * 0.6, 0, height);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw Title & Panel Beat
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(`${world.title} • Beat ${panel.panelNumber}: ${panel.title}`, 40, height - 80);

        // Draw Dialogue Text
        if (panel.bubbles && panel.bubbles.length > 0) {
          const b = panel.bubbles[0];
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.font = 'italic 18px Georgia, serif';
          ctx.fillText(`"${b.speaker}: ${b.text}"`, 40, height - 45);
        }

        // Draw Sound Effect
        if (panel.soundEffect) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = '900 36px Impact, sans-serif';
          ctx.fillText(panel.soundEffect, width - 200, 80);
        }

        frame++;
        setExportProgress(Math.round((frame / totalFrames) * 100));
        requestAnimationFrame(renderNextFrame);
      };

      renderNextFrame();
    } catch (err) {
      console.error('Video export error:', err);
      setIsExporting(false);
      setIsPlaying(true);
    }
  };

  if (!isOpen) return null;

  // Resolve background image
  const resolvedPanelImage = currentPanel.imageUrl || episode.pageImageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-6xl h-full max-h-[92vh] flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        
        {/* =========================================================================
            HEADER TOOLBAR (APPLE-STYLE MINIMALIST)
        ========================================================================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Film className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-white">
                  Motion Comic Reel
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  Meta Movie Gen Preview
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {world.title} • Issue #{episode.episodeNumber || 1}: &ldquo;{episode.title}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Aspect Ratio Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-800/70 border border-zinc-700/60 text-xs">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="16:9 Cinematic Widescreen (Desktop / YouTube)"
              >
                <Tv className="w-3 h-3" />
                <span>16:9</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="9:16 Vertical Reel (Instagram / TikTok / Shorts)"
              >
                <Smartphone className="w-3 h-3" />
                <span>9:16</span>
              </button>
            </div>

            {/* Export Video Button */}
            <button
              type="button"
              onClick={handleExportVideo}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Export as downloadable WebM/MP4 video"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? `Exporting (${exportProgress}%)` : 'Export Video'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close Motion Comic"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            CINEMATIC CANVAS STAGE (KEN BURNS CAMERA MOTION)
        ========================================================================= */}
        <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-radial from-zinc-900 to-black">
          <div
            className={`relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 transition-all duration-300 ${
              aspectRatio === '16:9'
                ? 'w-full max-w-4xl aspect-video'
                : 'h-full max-h-[75vh] aspect-[9/16]'
            }`}
          >
            {/* Background Image with Dynamic Ken Burns Zoom */}
            {resolvedPanelImage ? (
              <div
                style={{
                  backgroundImage: `url(${resolvedPanelImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: `scale(${1 + (panelProgress / 100) * 0.08}) translate(${(panelProgress / 100) * -1.5}%, 0%)`,
                  transition: 'transform 0.1s ease-out'
                }}
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-purple-950/40 to-black flex items-center justify-center">
                <span className="text-zinc-600 font-mono text-sm">Rendering Frame Artwork...</span>
              </div>
            )}

            {/* Vignette & Cinematic Shadow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

            {/* Animated Comic Sound Effect (SFX) Stamp */}
            {currentPanel.soundEffect && (
              <div className="absolute top-6 right-6 z-20 animate-in zoom-in-75 duration-300">
                <div className="px-4 py-1.5 rounded-2xl bg-amber-500 text-black font-black font-mono tracking-widest text-lg sm:text-2xl shadow-2xl border-2 border-white transform rotate-6">
                  {currentPanel.soundEffect}
                </div>
              </div>
            )}

            {/* Top Scene Anchor Tag */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-bold shadow-md">
                BEAT 0{currentPanel.panelNumber} • {currentPanel.title}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                {currentPanel.mood}
              </span>
            </div>

            {/* Animated Dialogue Balloon Overlays */}
            <div className="absolute bottom-6 inset-x-4 sm:inset-x-8 z-20 space-y-2">
              {currentPanel.bubbles && currentPanel.bubbles.length > 0 ? (
                currentPanel.bubbles.map((bubble, bIdx) => (
                  <div
                    key={bubble.id || bIdx}
                    className="p-3 sm:p-4 rounded-2xl bg-white/95 text-zinc-950 backdrop-blur-md shadow-2xl border border-white max-w-xl animate-in slide-in-from-bottom-3 duration-300"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-2xs font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        {bubble.speaker}
                      </span>
                      {bubble.type && bubble.type !== 'speech' && (
                        <span className="text-3xs font-mono font-bold uppercase text-zinc-500">
                          ({bubble.type})
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-serif font-medium leading-snug">
                      &ldquo;{bubble.text}&rdquo;
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs font-serif italic max-w-lg">
                  {currentPanel.sceneDescription}
                </div>
              )}
            </div>

            {/* Beat Progress Bar Overlay */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
              <div
                style={{ width: `${panelProgress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-75"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM TIMELINE & PLAYBACK CONTROLS
        ========================================================================= */}
        <div className="px-4 sm:px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shrink-0 flex flex-col gap-2">
          {/* Panel Beat Selector Dots */}
          <div className="grid grid-cols-4 gap-2 w-full">
            {panels.map((p, idx) => (
              <button
                key={p.panelNumber || idx}
                type="button"
                onClick={() => {
                  setCurrentPanelIndex(idx);
                  setPanelProgress(0);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentPanelIndex === idx
                    ? 'bg-purple-500 ring-2 ring-purple-400/40'
                    : currentPanelIndex > idx
                    ? 'bg-purple-800/80'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
                title={`Jump to Beat ${p.panelNumber}: ${p.title}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 mt-1">
            {/* Left Transport Cluster */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentPanelIndex((curr) => (curr - 1 + panels.length) % panels.length);
                  setPanelProgress(0);
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Previous Beat (←)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all cursor-pointer flex items-center justify-center"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPanelIndex((curr) => (curr + 1) % panels.length);
                  setPanelProgress(0);
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Next Beat (→)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-zinc-400 ml-2">
                0{currentPanelIndex + 1} / 0{panels.length}
              </span>
            </div>

            {/* Center Status / Core Truth Banner */}
            {episode.cognitiveAnalysis?.coreTruth && (
              <div className="hidden md:block text-center text-xs text-zinc-400 font-serif italic truncate max-w-md">
                &ldquo;{episode.cognitiveAnalysis.coreTruth}&rdquo;
              </div>
            )}

            {/* Right Options: Audio & Speed */}
            <div className="flex items-center gap-2">
              {/* Playback Speed Pill */}
              <button
                type="button"
                onClick={() => {
                  const speeds = [0.75, 1, 1.25, 1.5];
                  const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                  setPlaybackSpeed(speeds[nextIdx]);
                }}
                className="px-2.5 py-1 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {/* Ambient Audio Toggle */}
              <button
                type="button"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isAudioEnabled
                    ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
                title={isAudioEnabled ? 'Mute ambient synthesizer' : 'Enable ambient synthesizer'}
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
