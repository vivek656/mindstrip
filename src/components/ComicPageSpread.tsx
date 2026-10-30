'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import { ComicWorld, ComicStrip, ComicPanel, SpeechBubble, ArtStyle, ComicCharacter } from '@/types/comic';
import { ApiConfig } from '@/lib/meta-models';
import { cleanPromptForWordlessArtwork } from '@/lib/agents/art-director';
import { SamVisionOverlay } from './SamVisionOverlay';
import { LiveRagPipelineTracker } from './LiveRagPipelineTracker';
import {
  Sparkles,
  Users,
  RefreshCw,
  AlertCircle,
  Sliders,
  Palette,
  Edit2,
  Check,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Wand2,
  X,
  MessageSquare,
  Volume2,
  Layers,
  Cpu,
  Ratio,
  Scan,
  Maximize2
} from 'lucide-react';

export interface GranularArtworkOptions {
  customPrompt?: string;
  artStyle?: ArtStyle;
  layoutStyle?: 'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel';
  imageModel?: string;
  provider?: string;
  aspectRatio?: string;
}

interface ComicPageSpreadProps {
  world: ComicWorld;
  episode: ComicStrip;
  showBubbles?: boolean;
  onUpdateDialogue?: (panelNumber: number, bubbleId: string, text: string) => void;
  onAddDialogue?: (panelNumber: number, speaker: string, text: string, type: SpeechBubble['type']) => void;
  onDeleteDialogue?: (panelNumber: number, bubbleId: string) => void;
  onUpdatePanelScene?: (panelNumber: number, newDescription: string, newSoundEffect?: string) => void;
  onGenerateArtwork?: (options?: GranularArtworkOptions) => void;
  isGeneratingArtwork?: boolean;
  isLoading?: boolean;
  artworkError?: string | null;
  apiConfig?: ApiConfig;
  className?: string;
  onSelectCharacterForDossier?: (character: ComicCharacter) => void;
  isCinemaTheme?: boolean;
  directorReasoning?: string;
}

const ART_STYLES: { id: ArtStyle; name: string; desc: string; icon: string }[] = [
  { id: 'webcomic', name: 'Modern Webcomic', desc: 'Vibrant flat digital cel-shaded', icon: '🎨' },
  { id: 'manga', name: 'Dynamic Manga', desc: 'Dynamic B&W ink & screentones', icon: '⚡' },
  { id: 'noir', name: 'Noir Graphic Novel', desc: 'Deep shadows & dramatic rimlight', icon: '🕵️' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Glowing neon lights & rain reflections', icon: '🤖' },
  { id: 'newspaper', name: 'Vintage Newspaper', desc: 'Warm paper texture & nostalgic ink', icon: '📰' },
  { id: 'minimalist', name: 'Minimalist Indie', desc: 'Crisp editorial linework & refined tone', icon: '✒️' },
];

const LAYOUT_FORMATS: { id: 'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel'; name: string; desc: string; aspect: string }[] = [
  { id: 'auto', name: '🤖 Auto (AI Decides)', desc: 'AI analyzes dramatic stakes and chooses optimal layout', aspect: 'Smart' },
  { id: '1-panel', name: '1-Panel Splash', desc: 'Single cinematic panoramic frame', aspect: '16:9' },
  { id: '2-panel', name: '2-Panel Faceoff', desc: 'Dual confrontation & reaction split', aspect: '3:4' },
  { id: '3-panel', name: '3-Panel Strip', desc: 'Sequential 3-beat webtoon flow', aspect: '3:4' },
  { id: '4-panel', name: '4-Panel Spread', desc: 'Classic 2x2 graphic novel grid', aspect: '3:4' },
];

const MODEL_ENGINES = [
  { id: 'muse-image-1.0', provider: 'meta-api', name: 'Meta Muse Image', badge: 'Official Meta AI' },
  { id: 'flux-1-schnell', provider: 'fireworks', name: 'FLUX.1 Schnell', badge: 'Fireworks AI • ~$0.003' },
];

const PROMPT_TAGS = [
  '🌧️ Cinematic Rain & Storm',
  '🌆 Neon Night Reflections',
  '☀️ Golden Sunset Rimlight',
  '⚡ Action Speed Lines',
  '💥 Chiaroscuro High Contrast',
  '☕ Cozy Warm Palette',
  '🔍 Extreme Dramatic Close-Up',
  '🦅 Epic Bird\'s Eye View',
];

export const ComicPageSpread = forwardRef<HTMLDivElement, ComicPageSpreadProps>(function ComicPageSpread(
  {
    world,
    episode,
    showBubbles = true,
    onUpdateDialogue,
    onAddDialogue,
    onDeleteDialogue,
    onUpdatePanelScene,
    onGenerateArtwork,
    isGeneratingArtwork = false,
    isLoading = false,
    artworkError = null,
    apiConfig,
    className = '',
    onSelectCharacterForDossier,
    isCinemaTheme = false,
    directorReasoning = '',
  },
  ref
) {
  // Granular panel toggle
  const [isGranularOpen, setIsGranularOpen] = useState(false);
  // Meta SAM 3.1 Vision Inspector Toggle
  const [isSamActive, setIsSamActive] = useState(false);
  // Expandable director pacing reasoning drawer
  const [showPacingDrawer, setShowPacingDrawer] = useState(false);

  // Granular state controls
  const [selectedArtStyle, setSelectedArtStyle] = useState<ArtStyle>(world.artStyle || 'webcomic');
  const [selectedLayout, setSelectedLayout] = useState<'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel'>(
    'auto'
  );
  const resolveInitialEngine = () => {
    if (episode.imageModel) return episode.imageModel;
    if (apiConfig?.provider === 'fireworks') return 'flux-1-schnell';
    return 'muse-image-1.0';
  };
  const [selectedEngine, setSelectedEngine] = useState<string>(resolveInitialEngine);
  const [selectedAspect, setSelectedAspect] = useState<string>(
    episode.layoutStyle === '1-panel' ? '16:9' : '3:4'
  );

  // 4 narrative frames of the comic episode
  const p1: ComicPanel = episode.panels[0] || {
    panelNumber: 1,
    title: 'The Setup',
    sceneDescription: 'The opening scene begins.',
    visualMetaphor: 'Initial friction and establishment of context',
    characters: [world.characters[0]?.name || 'Protagonist'],
    bubbles: [],
    mood: 'stressed',
    soundEffect: 'FOCUS',
    imagePrompt: 'Establishing shot, character faces the opening dilemma.',
  };

  const p2: ComicPanel = episode.panels[1] || {
    panelNumber: 2,
    title: 'Rising Tension',
    sceneDescription: 'Conflict intensifies as pressure mounts.',
    visualMetaphor: 'Friction point testing conviction',
    characters: [world.characters[1]?.name || world.characters[0]?.name || 'Rival'],
    bubbles: [],
    mood: 'chaotic',
    soundEffect: 'CLASH!',
    imagePrompt: 'High-tension confrontation scene.',
  };

  const p3: ComicPanel = episode.panels[2] || {
    panelNumber: 3,
    title: 'The Breakthrough',
    sceneDescription: 'A critical move turns the tide.',
    visualMetaphor: 'Breakthrough discovery and collaboration',
    characters: [world.characters[0]?.name || 'Protagonist'],
    bubbles: [],
    mood: 'epiphany',
    soundEffect: 'STRIKE!',
    imagePrompt: 'Dynamic breakthrough action angle.',
  };

  const p4: ComicPanel = episode.panels[3] || {
    panelNumber: 4,
    title: 'The Resolution',
    sceneDescription: 'The immediate conflict resolves with forward momentum.',
    visualMetaphor: 'Equilibrium restored for the next chapter',
    characters: [world.characters[0]?.name || 'Protagonist'],
    bubbles: [],
    mood: 'serene',
    soundEffect: 'RESOLVE',
    imagePrompt: 'Cinematic wide angle aftermath and resolution.',
  };

  const panels = episode.panels && episode.panels.length > 0 ? episode.panels : [p1];

  // View mode switcher: 'page' (full-page AI spread) vs 'panels' (sequential comic strip)
  const [spreadViewMode, setSpreadViewMode] = useState<'page' | 'panels'>('page');

  // Default seed prompt for granular editing (purged of all panel labels, numbers & timestamps)
  const charsSummary = world.characters.map((c) => `${c.name} (${c.appearance || c.role})`).join(' and ');

  const buildSequentialPrompt = () => {
    const layout = selectedLayout || episode.layoutStyle || (panels.length === 1 ? '1-panel' : panels.length === 2 ? '2-panel' : panels.length === 3 ? '3-panel' : '4-panel');

    if ((layout === '1-panel' || panels.length === 1) && panels[0]) {
      const s1 = cleanPromptForWordlessArtwork(panels[0]?.imagePrompt || panels[0]?.sceneDescription || '');
      return `${selectedArtStyle} full-page cinematic graphic novel splash illustration depicting ${charsSummary}. Climax scene: ${s1}. Panoramic dramatic composition, cinematic lighting, wordless visual storytelling.`;
    }
    if ((layout === '2-panel' || panels.length === 2) && panels.length >= 2) {
      const s1 = cleanPromptForWordlessArtwork(panels[0]?.imagePrompt || panels[0]?.sceneDescription || '');
      const s2 = cleanPromptForWordlessArtwork(panels[1]?.imagePrompt || panels[1]?.sceneDescription || '');
      return `${selectedArtStyle} two-panel comic page spread separated by a clean vertical white comic gutter, depicting ${charsSummary}. Left frame: ${s1}. Right frame: ${s2}. Wordless visual sequential storytelling.`;
    }
    if ((layout === '3-panel' || panels.length === 3) && panels.length >= 3) {
      const s1 = cleanPromptForWordlessArtwork(panels[0]?.imagePrompt || panels[0]?.sceneDescription || '');
      const s2 = cleanPromptForWordlessArtwork(panels[1]?.imagePrompt || panels[1]?.sceneDescription || '');
      const s3 = cleanPromptForWordlessArtwork(panels[2]?.imagePrompt || panels[2]?.sceneDescription || '');
      return `${selectedArtStyle} three-frame vertical comic strip separated by clean white gutters, depicting ${charsSummary}. Top frame: ${s1}. Middle frame: ${s2}. Bottom frame: ${s3}. Wordless visual sequential storytelling.`;
    }
    if (panels.length >= 4) {
      const s1 = cleanPromptForWordlessArtwork(panels[0]?.imagePrompt || panels[0]?.sceneDescription || '');
      const s2 = cleanPromptForWordlessArtwork(panels[1]?.imagePrompt || panels[1]?.sceneDescription || '');
      const s3 = cleanPromptForWordlessArtwork(panels[2]?.imagePrompt || panels[2]?.sceneDescription || '');
      const s4 = cleanPromptForWordlessArtwork(panels[3]?.imagePrompt || panels[3]?.sceneDescription || '');
      return `${selectedArtStyle} four-panel comic page structured in a 2x2 grid with four distinct sequential frames separated by white comic gutters, depicting ${charsSummary}. Top-left frame depicts ${s1}. Top-right frame depicts ${s2}. Bottom-left frame depicts ${s3}. Bottom-right frame depicts ${s4}. Wordless visual sequential storytelling, clean graphic novel publication.`;
    }
    const cleanNarrative = cleanPromptForWordlessArtwork(episode.rawBrainDump || episode.title || '');
    return `${selectedArtStyle} sequential comic art depicting ${charsSummary}. Narrative scene: ${cleanNarrative}. Dynamic composition, expressive graphic novel layout with clean white gutters, wordless visual sequential art, mute comic storytelling, pristine published graphic novel illustration.`;
  };

  const defaultPrompt = buildSequentialPrompt();
  const [customPrompt, setCustomPrompt] = useState<string>(defaultPrompt);

  // Sync customPrompt whenever episode changes or art style is updated
  useEffect(() => {
    setCustomPrompt(buildSequentialPrompt());
  }, [episode.id, selectedArtStyle, charsSummary, selectedLayout]);

  // Script & Dialogue editing state
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [areBubblesVisible, setAreBubblesVisible] = useState(showBubbles);

  // Granular art custom style state
  const [isCustomArtStyle, setIsCustomArtStyle] = useState(false);
  const [customArtStyleText, setCustomArtStyleText] = useState('');

  // Add dialogue form state
  const [addingBubblePanel, setAddingBubblePanel] = useState<number | null>(null);
  const [newSpeaker, setNewSpeaker] = useState(world.characters[0]?.name || 'Protagonist');
  const [isCustomSpeaker, setIsCustomSpeaker] = useState(false);
  const [customSpeakerText, setCustomSpeakerText] = useState('');
  const [newBubbleText, setNewBubbleText] = useState('');
  const [newBubbleType, setNewBubbleType] = useState<SpeechBubble['type']>('speech');
  const [isCustomBubbleType, setIsCustomBubbleType] = useState(false);
  const [customBubbleTypeText, setCustomBubbleTypeText] = useState('');

  // Edit sound effect state
  const [editingSoundPanel, setEditingSoundPanel] = useState<number | null>(null);
  const [soundDraft, setSoundDraft] = useState('');

  // Pure AI image check: only accept real image URLs or base64 data URIs
  const pageImage =
    episode.pageImageUrl && !episode.pageImageUrl.includes('pollinations.ai')
      ? episode.pageImageUrl
      : episode.pageImageUrl;

  const handleStartEdit = (bubbleId: string, currentText: string) => {
    setEditingBubbleId(bubbleId);
    setDraftText(currentText);
  };

  const handleSaveEdit = (panelNumber: number, bubbleId: string) => {
    if (onUpdateDialogue && draftText.trim()) {
      onUpdateDialogue(panelNumber, bubbleId, draftText.trim());
    }
    setEditingBubbleId(null);
    setDraftText('');
  };

  const handleSaveNewBubble = (panelNumber: number) => {
    if (!newBubbleText.trim() || !onAddDialogue) return;
    const finalSpeaker = isCustomSpeaker && customSpeakerText.trim() ? customSpeakerText.trim() : newSpeaker;
    const finalType = isCustomBubbleType && customBubbleTypeText.trim() ? customBubbleTypeText.trim() : newBubbleType;
    onAddDialogue(panelNumber, finalSpeaker, newBubbleText.trim(), finalType);
    setAddingBubblePanel(null);
    setNewBubbleText('');
    setIsCustomSpeaker(false);
    setCustomSpeakerText('');
    setIsCustomBubbleType(false);
    setCustomBubbleTypeText('');
  };

  const handleSaveSoundEffect = (panelNumber: number) => {
    if (onUpdatePanelScene) {
      const panel = episode.panels.find((p) => p.panelNumber === panelNumber);
      onUpdatePanelScene(panelNumber, panel?.sceneDescription || '', soundDraft.trim() || undefined);
    }
    setEditingSoundPanel(null);
  };

  const handleInjectPromptTag = (tag: string) => {
    const cleanTag = tag.replace(/^[^\w\s]+\s*/, ''); // strip leading emoji
    setCustomPrompt((prev) => `${prev.trim()}, ${cleanTag}`);
  };

  const handleExecuteGranularArtwork = () => {
    if (!onGenerateArtwork) return;
    const selectedProvider = MODEL_ENGINES.find((m) => m.id === selectedEngine)?.provider || 'meta-api';
    onGenerateArtwork({
      customPrompt: cleanPromptForWordlessArtwork(customPrompt.trim()),
      artStyle: selectedArtStyle,
      layoutStyle: selectedLayout,
      imageModel: selectedEngine,
      provider: selectedProvider,
      aspectRatio: selectedAspect,
    });
  };

  const getCharacterEmoji = (speakerName: string): string => {
    const found = world.characters.find(
      (c) => c.name.toLowerCase() === speakerName.toLowerCase()
    );
    return found?.avatarEmoji || (speakerName.toLowerCase().includes('narrator') ? '📜' : '💬');
  };

  return (
    <div
      ref={ref}
      className={`w-full mx-auto transition-all ${className}`}
    >
      {/* =========================================================================
          AUTHENTIC GRAPHIC NOVEL ISSUE MASTHEAD & CONSOLIDATED TOOLBAR
      ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl mb-4 border transition-all ${
        isCinemaTheme
          ? 'bg-zinc-900/90 border-white/10 text-white shadow-xl backdrop-blur-md'
          : 'bg-white border-2 border-zinc-950 text-zinc-900 shadow-md'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Issue Eyebrow, Title & Clean Premise */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-2xs ${
                isCinemaTheme ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
              }`}>
                ISSUE #{episode.episodeNumber || 1}
              </span>
              <span className="text-zinc-400 font-mono text-xs">•</span>
              <span className="font-mono text-xs font-bold text-blue-500 uppercase tracking-wider">
                {world.title}
              </span>
              <span className="text-zinc-400 font-mono text-xs">•</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                {selectedArtStyle}
              </span>
              {episode.layoutStyle && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                  {episode.layoutStyle}
                </span>
              )}
              {directorReasoning && (
                <button
                  type="button"
                  onClick={() => setShowPacingDrawer(!showPacingDrawer)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 uppercase transition-colors cursor-pointer flex items-center gap-1"
                  title="View director pacing rationale"
                >
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                  <span>Pacing: {episode.layoutStyle || '4-panel'} {showPacingDrawer ? '▲' : '▼'}</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight leading-tight">
              {episode.title}
            </h1>

            {episode.rawBrainDump && (
              <p className={`text-xs italic line-clamp-2 max-w-3xl ${
                isCinemaTheme ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                &ldquo;{episode.rawBrainDump}&rdquo;
              </p>
            )}
          </div>

          {/* Right: Consolidated Action Toolbar (Zero Overlap on Artwork!) */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Quick Art Style Pill */}
            <button
              type="button"
              onClick={() => setIsGranularOpen(true)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isCinemaTheme
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-black/10'
              }`}
              title="Change Art Style & Rendering Engine"
            >
              <span>🎨</span>
              <span className="capitalize">{selectedArtStyle}</span>
            </button>

            {/* Granular Control Deck Toggle */}
            <button
              type="button"
              onClick={() => setIsGranularOpen(!isGranularOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
                isGranularOpen
                  ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20 ring-1 ring-blue-400'
                  : isCinemaTheme
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-black/10'
              }`}
              title="Fine-tune prompt, layout, engine, and modifiers"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Granular Studio</span>
            </button>

            {/* Meta SAM 3.1 Vision Inspector Toggle */}
            <button
              type="button"
              onClick={() => setIsSamActive(!isSamActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
                isSamActive
                  ? 'bg-cyan-600 text-white border-cyan-500 ring-2 ring-cyan-400/50 shadow-cyan-500/20'
                  : isCinemaTheme
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-black/10'
              }`}
              title="Toggle Meta SAM 3.1 Multi-Modal Visual Segmentation"
            >
              <Scan className={`w-3.5 h-3.5 ${isSamActive ? 'text-white animate-pulse' : 'text-cyan-400'}`} />
              <span>SAM 3.1</span>
            </button>

            {/* Re-draw Page Artwork */}
            {onGenerateArtwork && (
              <button
                type="button"
                onClick={() => handleExecuteGranularArtwork()}
                disabled={isGeneratingArtwork}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Re-draw this comic page with clean wordless artwork (no panel numbers or text labels)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingArtwork ? 'animate-spin' : ''}`} />
                <span>{isGeneratingArtwork ? 'Drawing Art...' : '🎨 Clean Re-Draw'}</span>
              </button>
            )}

            {/* Fullscreen / Height Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreenZoom(!isFullscreenZoom)}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isCinemaTheme
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-black/10'
              }`}
              title={isFullscreenZoom ? 'Fit normal height' : 'Expand full natural height'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Pacing Director Notes Drawer */}
        {showPacingDrawer && directorReasoning && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2.5 text-xs animate-in fade-in duration-150">
            <span className="font-mono text-[10px] font-bold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded shrink-0">
              Pacing Rationale:
            </span>
            <p className="text-zinc-300 italic font-medium leading-relaxed">
              &ldquo;{directorReasoning}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          GRANULAR ART DIRECTOR & MODEL STUDIO DECK (COLLAPSIBLE)
      ========================================================================= */}
      {isGranularOpen && (
        <div className="mb-6 p-5 sm:p-6 bg-white text-zinc-900 rounded-2xl border-2 border-zinc-200 shadow-md space-y-5 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                🎛️
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-950">Granular Art Director & Model Studio</h3>
                <p className="text-[11px] text-zinc-500">Fine-tune artwork prompt, visual layout, model engine, and aesthetic modifiers.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsGranularOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-black/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Control 1: Art Style Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Art Style</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ART_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setSelectedArtStyle(style.id);
                      setIsCustomArtStyle(false);
                      setCustomPrompt((prev) => prev.replace(/^\w+\s/, `${style.id} `));
                    }}
                    className={`p-2.5 rounded-xl text-left border-2 transition-all cursor-pointer ${
                      !isCustomArtStyle && selectedArtStyle === style.id
                        ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-600/10'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>{style.icon}</span>
                      <span>{style.name}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{style.desc}</p>
                  </button>
                ))}

                {/* Custom Art Style Option */}
                <button
                  type="button"
                  onClick={() => setIsCustomArtStyle(true)}
                  className={`p-2.5 rounded-xl text-left border-2 transition-all cursor-pointer ${
                    isCustomArtStyle
                      ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-600/10'
                      : 'bg-zinc-50 border-dashed border-zinc-300 text-zinc-800 hover:bg-white hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>✨</span>
                    <span>Custom Art Style</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">Define your own medium</p>
                </button>
              </div>

              {isCustomArtStyle && (
                <input
                  type="text"
                  value={customArtStyleText}
                  onChange={(e) => {
                    setCustomArtStyleText(e.target.value);
                    if (e.target.value.trim()) {
                      setSelectedArtStyle(e.target.value.trim());
                      setCustomPrompt((prev) => `${e.target.value.trim()} ${prev}`);
                    }
                  }}
                  placeholder="e.g. Charcoal & Pastel, 1980s Retro Anime Cel..."
                  className="w-full mt-1.5 p-2 bg-white border-2 border-zinc-200 rounded-lg text-xs text-zinc-900 font-mono outline-none focus:border-blue-600"
                  autoFocus
                />
              )}
            </div>

            {/* Control 2: Layout Format */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Page Layout Format</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {LAYOUT_FORMATS.map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => {
                      setSelectedLayout(layout.id);
                      if (layout.aspect !== 'Smart') {
                        setSelectedAspect(layout.aspect);
                      }
                    }}
                    className={`p-2.5 rounded-xl text-left border-2 transition-all cursor-pointer ${
                      selectedLayout === layout.id
                        ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-600/10'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{layout.name}</span>
                      <span className="text-[9px] font-mono px-1 rounded bg-zinc-200/80 text-zinc-700 font-bold">{layout.aspect}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{layout.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Control 3: AI Engine & Aspect Ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-black/[0.08]">
            <div>
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5 mb-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>3. Image Engine / Model</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {MODEL_ENGINES.map((eng) => (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => setSelectedEngine(eng.id)}
                    className={`p-2 rounded-xl text-center border-2 text-xs transition-all cursor-pointer ${
                      selectedEngine === eng.id
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold shadow-xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-white'
                    }`}
                  >
                    <div className="truncate font-medium">{eng.name}</div>
                    <div className="text-[9px] text-zinc-500">{eng.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5 mb-1.5">
                <Ratio className="w-3.5 h-3.5 text-blue-600" />
                <span>4. Aspect Ratio</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: '3:4', label: '3:4 (Portrait Page)' },
                  { id: '16:9', label: '16:9 (Cinematic Splash)' },
                  { id: '1:1', label: '1:1 (Square Webcomic)' },
                ].map((asp) => (
                  <button
                    key={asp.id}
                    type="button"
                    onClick={() => setSelectedAspect(asp.id)}
                    className={`p-2 rounded-xl text-center border-2 text-xs transition-all cursor-pointer ${
                      selectedAspect === asp.id
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold shadow-xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-white'
                    }`}
                  >
                    {asp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Control 4: Granular Visual Prompt Editor */}
          <div className="space-y-2 pt-1 border-t border-black/[0.08]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                <span>5. Visual Image Prompt (Editable)</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomPrompt(defaultPrompt)}
                className="text-[10px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
              >
                Reset to Default
              </button>
            </div>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              className="w-full p-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-xs text-zinc-900 font-mono outline-none focus:border-blue-600 focus:bg-white"
              placeholder="Describe exact composition, characters, lighting, camera angles..."
            />

            {/* Quick Aesthetic Enhancer Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-zinc-500">Inject:</span>
              {PROMPT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInjectPromptTag(tag)}
                  className="px-2 py-0.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] border border-zinc-200 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Execute Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsGranularOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteGranularArtwork}
              disabled={isGeneratingArtwork}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {isGeneratingArtwork ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Custom Art...</span>
                </>
              ) : (
                <>
                  <Palette className="w-3.5 h-3.5" />
                  <span>Render Artwork with Granular Controls</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* View Mode Pill Deck: Full Page Spread vs Dynamic Sequential Strip */}
      <div className="flex items-center justify-between gap-3 pb-1 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setSpreadViewMode('page')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                spreadViewMode === 'page'
                  ? 'bg-white text-zinc-950 shadow-xs ring-1 ring-black/5'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="View the completed graphic novel comic page (artwork + dialogue balloons)"
            >
              <span>🖼️</span>
              <span>Full Comic Page</span>
            </button>
            <button
              type="button"
              onClick={() => setSpreadViewMode('panels')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                spreadViewMode === 'panels'
                  ? 'bg-white text-zinc-950 shadow-xs ring-1 ring-black/5'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="View & edit scene scripts, dialogue lines, and character actions"
            >
              <span>📑</span>
              <span>Script & Scene Beats ({panels.length})</span>
            </button>
          </div>

          {spreadViewMode === 'page' && pageImage && (
            <button
              type="button"
              onClick={() => setAreBubblesVisible(!areBubblesVisible)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                areBubblesVisible
                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
              title="Toggle speech bubbles on the comic page image"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              <span>{areBubblesVisible ? 'Speech Bubbles: ON' : 'Speech Bubbles: OFF'}</span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
          <span>Format: <strong className="text-zinc-900 uppercase">{episode.layoutStyle || `${panels.length}-panel`}</strong></span>
          <span>•</span>
          <span>{panels.length} Story {panels.length === 1 ? 'Scene' : 'Scenes'}</span>
        </div>
      </div>

      {/* =========================================================================
          PAGE CONTENT: LIVE RAG PIPELINE TRACKER, REAL IMAGE OR DRAFTING STAGE
      ========================================================================= */}
      {(isGeneratingArtwork || isLoading) ? (
        <div className="w-full">
          <LiveRagPipelineTracker
            world={world}
            episode={episode}
            isLoading={isLoading}
            isGeneratingArtwork={isGeneratingArtwork}
            premise={episode.rawBrainDump || episode.title}
            layoutPreference={selectedLayout}
            selectedEngine={selectedEngine}
          />
        </div>
      ) : spreadViewMode === 'panels' ? (
        /* Sequential Strip / Grid View dynamically adapted to panel count */
        <div className="space-y-4">
          <div className="p-3.5 bg-purple-50/80 border border-purple-200/80 rounded-2xl flex items-center justify-between text-xs text-purple-950 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <span><strong>Script & Scene Beats Studio:</strong> Direct and edit dialogue lines, character emotions, and visual cues. Your edits are dynamically reflected in the <strong>Full Comic Page</strong> view!</span>
            </div>
            <button
              type="button"
              onClick={() => setSpreadViewMode('page')}
              className="px-3 py-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-all shadow-2xs"
            >
              View Full Comic Page →
            </button>
          </div>

          <div className={`grid gap-5 ${
            panels.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
            panels.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            panels.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2'
          }`}>
            {panels.map((p, idx) => {
              const sceneTitle = p.title || (
                idx === 0 ? 'Scene 1: The Inciting Dilemma' :
                idx === 1 ? 'Scene 2: Rising Tension' :
                idx === 2 ? 'Scene 3: The Breakthrough' :
                `Scene ${idx + 1}: Climax & Resolution`
              );

              return (
                <div
                  key={p.panelNumber}
                  className="bg-white border-2 border-zinc-200 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between transition-all hover:border-zinc-300"
                >
                  {/* Panel Header */}
                  <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-900 text-white font-mono text-[10px] font-black flex items-center justify-center">
                        {p.panelNumber}
                      </span>
                      <span className="font-bold text-zinc-900 font-mono text-[11px]">
                        {sceneTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.soundEffect && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-100 text-amber-900 border border-amber-200">
                          ⚡ {p.soundEffect}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-200 text-zinc-700">
                        {p.mood}
                      </span>
                    </div>
                  </div>

                  {/* Panel Canvas Area with Dialogue Overlay */}
                  <div className="relative min-h-[220px] bg-gradient-to-b from-zinc-100 to-zinc-50 p-4 flex flex-col justify-between border-b border-zinc-100 overflow-hidden">
                    {/* Scene Illustration or Graphic Backdrop */}
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={`Scene ${p.panelNumber}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                          backgroundSize: '24px 24px'
                        }}
                      />
                    )}

                    {/* Speech Bubbles floating over the scene */}
                    <div className="relative z-10 space-y-2.5">
                      {p.bubbles && p.bubbles.length > 0 ? (
                        p.bubbles.map((b) => {
                          const isEditing = editingBubbleId === b.id;
                          const charEmoji = getCharacterEmoji(b.speaker);

                          return (
                            <div key={b.id} className="max-w-[85%]">
                              <div className="p-2.5 rounded-xl bg-white/95 border-2 border-zinc-900 shadow-sm text-xs text-zinc-900">
                                <div className="flex items-center justify-between gap-2 text-[10px] font-mono font-bold text-zinc-500 mb-0.5">
                                  <span className="flex items-center gap-1">
                                    <span>{charEmoji}</span>
                                    <span>{b.speaker}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => isEditing ? handleSaveEdit(p.panelNumber, b.id) : handleStartEdit(b.id, b.text)}
                                    className="text-zinc-400 hover:text-zinc-900 cursor-pointer"
                                  >
                                    {isEditing ? <Check className="w-3 h-3 text-emerald-600" /> : <Edit2 className="w-2.5 h-2.5" />}
                                  </button>
                                </div>

                                {isEditing ? (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <input
                                      type="text"
                                      value={draftText}
                                      onChange={(e) => setDraftText(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(p.panelNumber, b.id)}
                                      autoFocus
                                      className="w-full bg-zinc-50 border-b-2 border-blue-600 text-xs py-0.5 outline-none font-medium"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(p.panelNumber, b.id)}
                                      className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <p
                                    onClick={() => handleStartEdit(b.id, b.text)}
                                    className="leading-snug cursor-pointer hover:text-blue-600"
                                    title="Click to edit speech bubble"
                                  >
                                    &ldquo;{b.text}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 bg-white/80 border border-zinc-200 rounded-xl text-xs text-zinc-500 italic text-center">
                          (Pure visual storytelling beat — action pose)
                        </div>
                      )}
                    </div>

                    {/* Bottom Action / Scene Note */}
                    <div className="relative z-10 pt-3">
                      <p className="text-[11px] font-serif italic text-zinc-600 line-clamp-2 bg-white/90 p-2 rounded-lg border border-zinc-200 shadow-2xs">
                        &ldquo;{p.sceneDescription}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Panel Footer: Visual Metaphor & Studio Link */}
                  <div className="px-4 py-2.5 bg-zinc-50 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span className="truncate pr-2">
                      <strong className="text-zinc-700">Metaphor:</strong> {p.visualMetaphor}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsGranularOpen(true);
                        setCustomPrompt(`${selectedArtStyle} comic frame: ${cleanPromptForWordlessArtwork(p.imagePrompt || p.sceneDescription)}. Dynamic composition, textless comic art.`);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-bold text-[10px] underline shrink-0 cursor-pointer"
                    >
                      Focus Frame in Studio
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : pageImage ? (
        /* Real Meta AI Generated Full-Page Comic Spread with Authentic Dialogue Bubbles Overlay */
        <div className="w-full">
          <div className="relative group w-full rounded-2xl overflow-hidden border-2 border-zinc-950 shadow-xl bg-white">
            <img
              src={pageImage}
              alt={`${world.title} — ${episode.title}`}
              className={`w-full h-auto block object-contain mx-auto transition-all duration-200 ${
                isFullscreenZoom ? 'max-h-none' : 'max-h-[1400px]'
              }`}
              loading="eager"
            />

            {/* Authentic Comic Page Dialogue & SFX Quadrant Overlay */}
            {areBubblesVisible && !isSamActive && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {/* Dynamic Panel Grid Overlay matching the layout */}
                <div
                  className={`w-full h-full ${
                    panels.length === 1
                      ? 'p-4 sm:p-8 flex flex-col justify-between'
                      : panels.length === 2
                      ? 'grid grid-cols-2 grid-rows-1'
                      : panels.length === 3
                      ? 'grid grid-cols-1 grid-rows-3'
                      : 'grid grid-cols-2 grid-rows-2'
                  }`}
                >
                  {panels.map((p, pIdx) => {
                    const bubbles = p.bubbles || [];
                    const sound = p.soundEffect;
                    if (bubbles.length === 0 && !sound) return <div key={p.panelNumber || pIdx} />;

                    return (
                      <div
                        key={p.panelNumber || pIdx}
                        className="relative p-2.5 sm:p-4 flex flex-col justify-between pointer-events-none overflow-hidden"
                      >
                        {/* Dialogue Bubbles Stack */}
                        <div className="space-y-1.5 sm:space-y-2 pointer-events-auto max-w-[92%] sm:max-w-[82%]">
                          {bubbles.map((b) => {
                            const isEditing = editingBubbleId === b.id;
                            const charEmoji = getCharacterEmoji(b.speaker);

                            return (
                              <div
                                key={b.id}
                                className="inline-block p-2 sm:p-2.5 rounded-xl bg-white/95 border-1.5 sm:border-2 border-zinc-950 shadow-md backdrop-blur-2xs text-[11px] sm:text-xs text-zinc-950 transition-all hover:scale-[1.01]"
                              >
                                <div className="flex items-center justify-between gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold text-zinc-600 mb-0.5">
                                  <span className="flex items-center gap-1">
                                    <span>{charEmoji}</span>
                                    <span className="truncate max-w-[100px]">{b.speaker}</span>
                                    {b.type === 'thought' && (
                                      <span className="opacity-70 italic text-[9px]">(thought)</span>
                                    )}
                                    {b.type === 'shout' && (
                                      <span className="text-red-600 font-extrabold text-[9px]">!</span>
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      isEditing
                                        ? handleSaveEdit(p.panelNumber, b.id)
                                        : handleStartEdit(b.id, b.text)
                                    }
                                    className="text-zinc-400 hover:text-zinc-900 cursor-pointer ml-1"
                                    title="Edit dialogue"
                                  >
                                    {isEditing ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Edit2 className="w-2.5 h-2.5" />
                                    )}
                                  </button>
                                </div>

                                {isEditing ? (
                                  <div className="flex items-center gap-1.5 mt-1 pointer-events-auto">
                                    <input
                                      type="text"
                                      value={draftText}
                                      onChange={(e) => setDraftText(e.target.value)}
                                      onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSaveEdit(p.panelNumber, b.id)
                                      }
                                      autoFocus
                                      className="w-full bg-zinc-50 border-b-2 border-blue-600 text-[11px] sm:text-xs py-0.5 outline-none font-medium"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(p.panelNumber, b.id)}
                                      className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <p
                                    onClick={() => handleStartEdit(b.id, b.text)}
                                    className="leading-snug font-sans font-medium text-zinc-950 cursor-pointer hover:text-blue-600"
                                    title="Click to edit speech bubble"
                                  >
                                    &ldquo;{b.text}&rdquo;
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Sound Effect Badge in Corner */}
                        {sound && (
                          <div className="self-end pointer-events-auto mt-1">
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-mono font-black uppercase bg-amber-400 text-zinc-950 border border-zinc-950 shadow-md rotate-[-3deg] inline-block tracking-wider">
                              ⚡ {sound}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meta SAM 3.1 Interactive Vision Segmentation Layer */}
            <SamVisionOverlay
              world={world}
              episode={episode}
              isActive={isSamActive}
              onClose={() => setIsSamActive(false)}
              onSelectCharacterForDossier={onSelectCharacterForDossier}
              onUpdateDialogue={onUpdateDialogue}
            />
          </div>
        </div>
      ) : (
        /* Authentic Blank Comic Canvas Ready to Draw */
        <div className="space-y-6">
          {/* Main Drafting Hero Canvas */}
          <div className="w-full min-h-[420px] rounded-2xl border-2 border-dashed border-zinc-300 bg-gradient-to-b from-zinc-50 to-zinc-100/60 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Subtle Comic Grid Lines Background Effect */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }}
            />

            <div className="relative z-10 max-w-md mx-auto space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-zinc-950 shadow-md flex items-center justify-center text-3xl">
                {isGeneratingArtwork ? (
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                ) : (
                  <span>🎨</span>
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black font-serif text-zinc-950 tracking-tight">
                  {isGeneratingArtwork ? 'Meta AI is Drawing Your Comic...' : 'Comic Story Ready to Draw'}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
                  {isGeneratingArtwork
                    ? 'Synthesizing sequential comic frames into a high-res graphic novel page with Meta Muse Image...'
                    : `The dialogue and ${panels.length}-scene narrative have been scripted with ${episode.layoutStyle || 'dynamic'} pacing. Draw using 1-click or customize with Granular Controls.`}
                </p>
              </div>

              {(artworkError || episode.generationError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2 max-w-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span className="text-left font-medium">{artworkError || episode.generationError}</span>
                </div>
              )}

              {/* Cost & Engine Quick Switcher Pill Deck */}
              <div className="flex items-center gap-1.5 p-1 bg-white border border-zinc-200 rounded-full shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 px-2 flex items-center gap-1">
                  <span>Engine:</span>
                </span>
                {MODEL_ENGINES.map((eng) => (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => setSelectedEngine(eng.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedEngine === eng.id
                        ? eng.id === 'simulation'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : eng.id === 'flux-1-schnell'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04]'
                    }`}
                  >
                    <span>{eng.name}</span>
                    <span className="text-[10px] opacity-80 font-mono">({eng.badge.split('•')[1]?.trim() || eng.badge})</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsGranularOpen(true)}
                  className="px-5 py-3 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 border-2 border-zinc-950 font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Granular Studio</span>
                </button>

                {onGenerateArtwork && (
                  <button
                    type="button"
                    onClick={() => handleExecuteGranularArtwork()}
                    disabled={isGeneratingArtwork}
                    className={`px-7 py-3 rounded-full font-bold text-xs shadow-xl flex items-center gap-2.5 cursor-pointer transition-all disabled:opacity-50 hover:scale-105 active:scale-95 ${
                      selectedEngine === 'flux-1-schnell'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                    }`}
                  >
                    {isGeneratingArtwork ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Drawing Art...</span>
                      </>
                    ) : (
                      <>
                        <Palette className="w-4 h-4" />
                        <span>
                          {selectedEngine === 'flux-1-schnell'
                            ? 'Draw with FLUX (~$0.003)'
                            : 'Draw with Meta Muse Image (Official)'}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          COLLAPSIBLE STORY & DIALOGUE SCRIPT ACCORDION (WITH GRANULAR SCRIPT EDITING)
      ========================================================================= */}
      <div className="mt-5 border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setIsScriptExpanded(!isScriptExpanded)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">📝</span>
            <span className="text-xs sm:text-sm font-bold text-zinc-900">
              Written Story Script, Dialogue & Sound Effects ({panels.length} Scenes)
            </span>
            <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
              • Granular dialogue, sound, and scene controls
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <span>{isScriptExpanded ? 'Hide Script' : 'View & Edit Script'}</span>
            {isScriptExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isScriptExpanded && (
          <div className="p-5 border-t border-zinc-100 bg-zinc-50/50 grid grid-cols-1 md:grid-cols-2 gap-4">
            {panels.map((p, idx) => {
              const sceneNum = idx + 1;
              const sceneTitle =
                idx === 0 ? 'Scene 1: The Inciting Dilemma' :
                idx === 1 ? 'Scene 2: Conflict Escalation' :
                idx === 2 ? 'Scene 3: The Breakthrough' :
                'Scene 4: The Outcome';

              const isAddingBubble = addingBubblePanel === p.panelNumber;
              const isEditingSound = editingSoundPanel === p.panelNumber;

              return (
                <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 shadow-2xs">
                  {/* Scene Title & Sound Effect Header */}
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <span className="text-xs font-bold text-zinc-900 font-mono">
                      {sceneTitle}
                    </span>

                    {/* Sound Effect Pill (Clickable / Editable) */}
                    <div className="flex items-center gap-1.5">
                      {isEditingSound ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={soundDraft}
                            onChange={(e) => setSoundDraft(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveSoundEffect(p.panelNumber)}
                            placeholder="e.g. BAM!"
                            autoFocus
                            className="w-20 px-1.5 py-0.5 text-[10px] font-mono border rounded outline-none bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveSoundEffect(p.panelNumber)}
                            className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSoundPanel(p.panelNumber);
                            setSoundDraft(p.soundEffect || '');
                          }}
                          className="text-[10px] font-mono font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="Click to edit sound effect"
                        >
                          <Volume2 className="w-2.5 h-2.5" />
                          <span>{p.soundEffect || '+ SFX'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scene Description */}
                  <p className="text-xs text-zinc-600 font-serif italic leading-relaxed">
                    &ldquo;{p.sceneDescription}&rdquo;
                  </p>

                  {/* Dialogue Bubbles */}
                  {p.bubbles && p.bubbles.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-zinc-100">
                      {p.bubbles.map((b: SpeechBubble) => {
                        const isEditing = editingBubbleId === b.id;
                        const charEmoji = getCharacterEmoji(b.speaker);

                        return (
                          <div key={b.id} className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs group">
                            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1">
                              <span className="font-bold text-zinc-900 flex items-center gap-1">
                                <span>{charEmoji}</span>
                                <span>{b.speaker}</span>
                                {b.type !== 'speech' && (
                                  <span className="text-[9px] uppercase px-1 rounded bg-black/5 text-zinc-500">
                                    {b.type}
                                  </span>
                                )}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {onUpdateDialogue && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      isEditing
                                        ? handleSaveEdit(p.panelNumber, b.id)
                                        : handleStartEdit(b.id, b.text)
                                    }
                                    className="text-zinc-400 hover:text-zinc-900 p-0.5 cursor-pointer"
                                    title={isEditing ? 'Save' : 'Edit text'}
                                  >
                                    {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                                  </button>
                                )}

                                {onDeleteDialogue && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteDialogue(p.panelNumber, b.id)}
                                    className="text-zinc-400 hover:text-red-600 p-0.5 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                                    title="Delete dialogue"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {isEditing ? (
                              <input
                                type="text"
                                value={draftText}
                                onChange={(e) => setDraftText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(p.panelNumber, b.id)}
                                autoFocus
                                className="w-full bg-white border border-blue-500 rounded px-2 py-1 text-xs text-zinc-900 font-medium outline-none"
                              />
                            ) : (
                              <p
                                onClick={() => onUpdateDialogue && handleStartEdit(b.id, b.text)}
                                className="text-zinc-800 leading-snug cursor-pointer hover:text-blue-600"
                              >
                                &ldquo;{b.text}&rdquo;
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Dialogue Form */}
                  {isAddingBubble ? (
                    <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-300 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-800 font-mono text-[11px]">Add Dialogue:</span>
                        <button
                          type="button"
                          onClick={() => setAddingBubblePanel(null)}
                          className="text-zinc-400 hover:text-zinc-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={isCustomSpeaker ? '__custom__' : newSpeaker}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomSpeaker(true);
                            } else {
                              setIsCustomSpeaker(false);
                              setNewSpeaker(e.target.value);
                            }
                          }}
                          className="bg-white border border-zinc-300 rounded px-2 py-1 text-xs font-mono"
                        >
                          {world.characters.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.avatarEmoji} {c.name}
                            </option>
                          ))}
                          <option value="Narrator">📜 Narrator</option>
                          <option value="__custom__">✨ Custom Speaker...</option>
                        </select>

                        <select
                          value={isCustomBubbleType ? '__custom__' : newBubbleType}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomBubbleType(true);
                            } else {
                              setIsCustomBubbleType(false);
                              setNewBubbleType(e.target.value as any);
                            }
                          }}
                          className="bg-white border border-zinc-300 rounded px-2 py-1 text-xs font-mono"
                        >
                          <option value="speech">💬 Speech</option>
                          <option value="thought">💭 Thought</option>
                          <option value="shout">💥 Shout</option>
                          <option value="caption">📜 Caption</option>
                          <option value="whisper">🤫 Whisper</option>
                          <option value="radio">📻 Comm / Radio</option>
                          <option value="__custom__">✨ Custom Type...</option>
                        </select>
                      </div>

                      {isCustomSpeaker && (
                        <input
                          type="text"
                          value={customSpeakerText}
                          onChange={(e) => setCustomSpeakerText(e.target.value)}
                          placeholder="Type custom speaker name..."
                          className="w-full bg-white border border-zinc-300 rounded px-2 py-1 text-xs outline-none font-mono"
                          autoFocus
                        />
                      )}

                      {isCustomBubbleType && (
                        <input
                          type="text"
                          value={customBubbleTypeText}
                          onChange={(e) => setCustomBubbleTypeText(e.target.value)}
                          placeholder="Type custom bubble type (e.g. telepathy, digital-chime)..."
                          className="w-full bg-white border border-zinc-300 rounded px-2 py-1 text-xs outline-none font-mono"
                          autoFocus
                        />
                      )}

                      <input
                        type="text"
                        value={newBubbleText}
                        onChange={(e) => setNewBubbleText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNewBubble(p.panelNumber)}
                        placeholder="Type line of dialogue..."
                        autoFocus
                        className="w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                      />

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setAddingBubblePanel(null)}
                          className="px-2 py-1 text-[11px] text-zinc-500 hover:text-zinc-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNewBubble(p.panelNumber)}
                          className="px-3 py-1 rounded bg-zinc-950 text-white font-bold text-[11px] hover:bg-blue-600"
                        >
                          Add Bubble
                        </button>
                      </div>
                    </div>
                  ) : (
                    onAddDialogue && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingBubblePanel(p.panelNumber);
                          setNewBubbleText('');
                        }}
                        className="w-full py-1.5 border border-dashed border-zinc-300 hover:border-zinc-400 rounded-lg text-zinc-500 hover:text-zinc-800 font-mono text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Dialogue Bubble</span>
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          COMIC BOOK FOOTER
      ========================================================================= */}
      <div className="mt-6 pt-4 border-t-2 border-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-zinc-950 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-zinc-600" />
            <span>Cast in this Issue:</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {world.characters.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1 rounded-full bg-zinc-100 border border-black/10 text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-2xs"
              >
                <span>{c.avatarEmoji}</span>
                <span>{c.name}</span>
                <span className="text-[11px] text-zinc-500 capitalize">({c.role})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-zinc-500 flex items-center gap-2">
          <span>PAGE 1 OF 1</span>
          <span>•</span>
          <span className="font-semibold text-zinc-900">
            {pageImage ? 'Meta AI Synthesized Comic Page' : 'Story Draft'}
          </span>
        </div>
      </div>
    </div>
  );
});
