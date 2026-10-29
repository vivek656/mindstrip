'use client';

import React, { useState, useRef } from 'react';
import {
  ComicWorld,
  ComicStrip,
  ComicCharacter,
  PerspectiveLens,
  CreatorProfile,
  WorldLaw,
  WorldLocation,
  CustomWorldAttribute
} from '@/types/comic';
import { ApiConfig } from '@/lib/meta-models';
import { ComicPageSpread, GranularArtworkOptions } from './ComicPageSpread';
import {
  ArrowLeft,
  Menu,
  Download,
  Share2,
  Send,
  X,
  Settings,
  Sparkles,
  Users,
  Film,
  RefreshCw,
  Cpu,
  BookOpen,
  Globe,
  Brain,
  Plus,
  Compass,
  Palette,
  Check,
  Layout,
  Layers,
  Shield,
  Zap,
  Scale,
  MapPin,
  Tag,
  Scroll,
  Edit2,
  Trash2,
} from 'lucide-react';
import { toPng } from 'html-to-image';

interface ZenComicReaderProps {
  world: ComicWorld;
  episode?: ComicStrip | null;
  onBackToWorlds: () => void;
  onGenerateNextEpisode: (
    storyPremise: string,
    layoutPreference?: 'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel',
    lens?: PerspectiveLens
  ) => void;
  isLoading: boolean;
  onUpdateDialogue: (panelNumber: number, bubbleId: string, text: string) => void;
  onAddDialogue?: (panelNumber: number, speaker: string, text: string, type: 'speech' | 'thought' | 'shout' | 'caption' | (string & {})) => void;
  onDeleteDialogue?: (panelNumber: number, bubbleId: string) => void;
  onUpdatePanelScene?: (panelNumber: number, newDescription: string, newSoundEffect?: string) => void;
  onOpenSettings: () => void;
  onSelectEpisode?: (episode: ComicStrip) => void;
  onUpdatePanelPrompt?: (panelNumber: number, newPrompt: string) => void;
  onRegenerateEpisode?: () => void;
  onGenerateArtwork?: (options?: GranularArtworkOptions) => void;
  isGeneratingArtwork?: boolean;
  artworkError?: string | null;
  onUpdateWorld?: (updatedWorld: ComicWorld) => void;
  apiConfig?: ApiConfig;
  onToggleMode?: () => void;
  currentProfile?: CreatorProfile | null;
  isDbConnected?: boolean;
  onOpenAuth?: () => void;
}

export function ZenComicReader({
  world,
  episode,
  onBackToWorlds,
  onGenerateNextEpisode,
  isLoading,
  onUpdateDialogue,
  onAddDialogue,
  onDeleteDialogue,
  onUpdatePanelScene,
  onOpenSettings,
  onSelectEpisode,
  onRegenerateEpisode,
  onGenerateArtwork,
  isGeneratingArtwork = false,
  artworkError = null,
  onUpdateWorld,
  apiConfig,
  onToggleMode,
  currentProfile,
  isDbConnected = false,
  onOpenAuth,
}: ZenComicReaderProps) {
  const [activeTab, setActiveTab] = useState<'comic' | 'universe' | 'agent'>(episode ? 'comic' : 'universe');
  const [selectedLayout, setSelectedLayout] = useState<'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel'>('auto');
  const [selectedLens, setSelectedLens] = useState<PerspectiveLens>('candid');
  const [prompt, setPrompt] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAddCharOpen, setIsAddCharOpen] = useState(false);
  const [isMidStoryIntro, setIsMidStoryIntro] = useState(false);

  // New character form state for Universe Hub
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState<ComicCharacter['role']>('sidekick');
  const [isCustomCharRole, setIsCustomCharRole] = useState(false);
  const [customCharRoleText, setCustomCharRoleText] = useState('');
  const [newCharGender, setNewCharGender] = useState<ComicCharacter['gender']>('female');
  const [isCustomCharGender, setIsCustomCharGender] = useState(false);
  const [customCharGenderText, setCustomCharGenderText] = useState('');
  const [newCharEmoji, setNewCharEmoji] = useState('⚡');
  const [newCharAppearance, setNewCharAppearance] = useState('');
  const [newCharPersonality, setNewCharPersonality] = useState('');
  const [newCharCatchphrase, setNewCharCatchphrase] = useState('');

  // World Laws state
  const [isAddLawOpen, setIsAddLawOpen] = useState(false);
  const [newLawTitle, setNewLawTitle] = useState('');
  const [newLawRule, setNewLawRule] = useState('');
  const [newLawCategory, setNewLawCategory] = useState<'physics' | 'magic' | 'social' | 'taboo' | 'custom'>('physics');
  const [isCustomLawCat, setIsCustomLawCat] = useState(false);
  const [customLawCatText, setCustomLawCatText] = useState('');

  // World Locations state
  const [isAddLocOpen, setIsAddLocOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [newLocSig, setNewLocSig] = useState('');

  // Custom World Attributes state
  const [isAddAttrOpen, setIsAddAttrOpen] = useState(false);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrVal, setNewAttrVal] = useState('');

  // Lore editing state
  const [isEditingLore, setIsEditingLore] = useState(false);
  const [draftLore, setDraftLore] = useState(world.lore || '');

  // Dynamic plot beat suggestions state
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[] | null>(null);

  const handleRollNewBeatIdeas = () => {
    const chars = world.characters;
    const hero = chars[0]?.name || 'Hero';
    const sidekick = chars[1]?.name || 'Ally';
    const villain = chars.find((c) => c.role === 'villain')?.name || 'Nemesis';
    const loc = world.locations?.[0]?.name || 'the perimeter';
    const law = world.laws?.[0]?.title || 'the ancient law';

    const ideas = [
      `@${hero} discovers an anomaly in ${loc} that tests ${law}`,
      `@${villain} forces @${sidekick} into an impossible moral choice`,
      `A sudden blackout across ${loc} unites @${hero} and @${villain} against a greater threat`,
      `@${hero} risks violating ${law} to rescue @${sidekick}`,
      `An encrypted message from ${loc} changes everything @${hero} believed`,
    ];
    // Pick 3 random ideas
    const shuffled = [...ideas].sort(() => 0.5 - Math.random()).slice(0, 3);
    setDynamicSuggestions(shuffled);
  };

  const stripRef = useRef<HTMLDivElement>(null);

  const handleExportPng = async () => {
    if (!stripRef.current || !episode) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(stripRef.current, {
        pixelRatio: 2,
        backgroundColor: '#faf8f5',
      });
      const link = document.createElement('a');
      link.download = `${world.title.toLowerCase().replace(/\s+/g, '-')}-ep${episode.episodeNumber || 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (!episode) {
      navigator.clipboard.writeText(`${world.title} • ${world.tagline}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    const text = `${world.title} • Episode #${episode.episodeNumber || 1}: "${episode.title}"\n\n"${episode.cognitiveAnalysis?.coreTruth || ''}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerateNextEpisode(prompt.trim(), selectedLayout, selectedLens);
    setPrompt('');
  };

  const handleInsertBeat = (beatText: string) => {
    setPrompt((prev) => (prev ? `${prev} ${beatText}` : beatText));
  };

  const handleSaveNewCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim() || !onUpdateWorld) return;

    const finalRole = isCustomCharRole && customCharRoleText.trim() ? customCharRoleText.trim() : newCharRole;
    const finalGender = isCustomCharGender && customCharGenderText.trim() ? customCharGenderText.trim() : newCharGender;

    const newChar: ComicCharacter = {
      id: `char-${Date.now()}`,
      name: newCharName.trim(),
      role: finalRole,
      gender: finalGender,
      avatarEmoji: newCharEmoji || '⚡',
      appearance: newCharAppearance.trim() || 'Distinctive comic attire with expressive features',
      personality: newCharPersonality.trim() || 'Resourceful ally',
      catchphrase: newCharCatchphrase.trim() || undefined,
      description: `${finalRole} in ${world.title}`,
      traits: [finalRole, finalGender || 'unspecified']
    };

    const updatedWorld: ComicWorld = {
      ...world,
      characters: [...world.characters, newChar]
    };

    onUpdateWorld(updatedWorld);

    // If this was introduced mid-story from the co-director dock, automatically insert into prompt!
    if (isMidStoryIntro) {
      setPrompt((prev) => {
        const introBeat = `@${newChar.name} arrives on the scene — `;
        return prev ? `${prev} ${introBeat}` : introBeat;
      });
    }

    setIsAddCharOpen(false);
    setIsMidStoryIntro(false);
    setNewCharName('');
    setNewCharAppearance('');
    setNewCharPersonality('');
    setNewCharCatchphrase('');
    setIsCustomCharRole(false);
    setCustomCharRoleText('');
    setIsCustomCharGender(false);
    setCustomCharGenderText('');
  };

  const handleSaveLaw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLawTitle.trim() || !newLawRule.trim() || !onUpdateWorld) return;
    const finalCategory = isCustomLawCat && customLawCatText.trim() ? customLawCatText.trim() : newLawCategory;
    const newLaw: WorldLaw = {
      id: `law-${Date.now()}`,
      title: newLawTitle.trim(),
      rule: newLawRule.trim(),
      category: finalCategory,
    };
    onUpdateWorld({
      ...world,
      laws: [...(world.laws || []), newLaw],
    });
    setIsAddLawOpen(false);
    setNewLawTitle('');
    setNewLawRule('');
    setIsCustomLawCat(false);
    setCustomLawCatText('');
  };

  const handleDeleteLaw = (id: string) => {
    if (!onUpdateWorld) return;
    onUpdateWorld({
      ...world,
      laws: (world.laws || []).filter((l) => l.id !== id),
    });
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocDesc.trim() || !onUpdateWorld) return;
    const newLoc: WorldLocation = {
      id: `loc-${Date.now()}`,
      name: newLocName.trim(),
      description: newLocDesc.trim(),
      significance: newLocSig.trim() || undefined,
    };
    onUpdateWorld({
      ...world,
      locations: [...(world.locations || []), newLoc],
    });
    setIsAddLocOpen(false);
    setNewLocName('');
    setNewLocDesc('');
    setNewLocSig('');
  };

  const handleDeleteLocation = (id: string) => {
    if (!onUpdateWorld) return;
    onUpdateWorld({
      ...world,
      locations: (world.locations || []).filter((loc) => loc.id !== id),
    });
  };

  const handleSaveCustomAttr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttrKey.trim() || !newAttrVal.trim() || !onUpdateWorld) return;
    const newAttr: CustomWorldAttribute = {
      id: `attr-${Date.now()}`,
      key: newAttrKey.trim(),
      value: newAttrVal.trim(),
    };
    onUpdateWorld({
      ...world,
      customAttributes: [...(world.customAttributes || []), newAttr],
    });
    setIsAddAttrOpen(false);
    setNewAttrKey('');
    setNewAttrVal('');
  };

  const handleDeleteCustomAttr = (id: string) => {
    if (!onUpdateWorld) return;
    onUpdateWorld({
      ...world,
      customAttributes: (world.customAttributes || []).filter((a) => a.id !== id),
    });
  };

  const handleSaveLore = () => {
    if (!onUpdateWorld) return;
    onUpdateWorld({
      ...world,
      lore: draftLore.trim(),
    });
    setIsEditingLore(false);
  };

  // Reusable Sidebar Content
  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* World Header Info */}
        <div className="pb-4 border-b border-black/[0.08]">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-xs font-mono font-bold uppercase tracking-wider">
              {world.genre}
            </span>
            <span className="text-xs text-zinc-500 capitalize font-medium">• {world.artStyle} style</span>
          </div>
          <h2 className="font-black text-xl text-zinc-950 leading-tight">
            {world.title}
          </h2>
          <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed font-sans">
            {world.tagline}
          </p>
        </div>

        {/* Studio View Selector */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1.5 block">
            Studio Views
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl border border-black/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab('comic')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'comic'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Comic</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('universe')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'universe'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Lore</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('agent')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'agent'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Brain</span>
            </button>
          </div>
        </div>

        {/* Episodes Archive Navigator */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
              <Film className="w-4 h-4 text-zinc-700" />
              <span>Episodes ({world.episodes.length})</span>
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {world.episodes.length === 0 ? (
              <div className="p-3 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-center">
                <span className="text-[11px] text-zinc-500 font-mono">No episodes drawn yet</span>
              </div>
            ) : (
              world.episodes.map((ep, idx) => {
                const isSelected = episode ? ep.id === episode.id : false;
                return (
                  <div
                    key={ep.id}
                    onClick={() => onSelectEpisode && onSelectEpisode(ep)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-950 text-white font-bold shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-black/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`font-mono text-xs ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        #{idx + 1}
                      </span>
                      <span className="truncate">{ep.title}</span>
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Character Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-zinc-700" />
              <span>Cast ({world.characters.length})</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsMidStoryIntro(true);
                  setIsAddCharOpen(true);
                }}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                title="Introduce new character mid-story"
              >
                + Intro
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('universe')}
                className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Dossiers &rarr;
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {world.characters.map((char) => (
              <div
                key={char.id}
                onClick={() => handleInsertBeat(`@${char.name}`)}
                className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-black/[0.06] cursor-pointer transition-all flex items-center justify-between shadow-2xs"
                title={`Click to tag @${char.name} in director prompt`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-lg">{char.avatarEmoji}</span>
                  <div className="truncate">
                    <span className="font-bold text-xs text-zinc-900 block truncate">{char.name}</span>
                    <span className="text-[10px] text-zinc-500 capitalize">{char.role}</span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">+ Tag</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-zinc-500" />
          <span>Meta API Settings</span>
        </button>

        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          <Cpu className="w-3.5 h-3.5" />
          <span>Meta Muse</span>
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#181716] flex flex-col selection:bg-zinc-200 w-full">
      {/* =========================================================================
          TOP NAVIGATION BAR (FULL WIDTH WIDESCREEN)
      ========================================================================= */}
      <header className="w-full border-b border-black/[0.08] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToWorlds}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-black/[0.04] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Universes</span>
            </button>

            <span className="text-zinc-300">/</span>

            <span className="font-bold text-sm text-zinc-950 truncate max-w-[160px] sm:max-w-xs">
              {world.title}
            </span>

            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-mono font-semibold hidden md:inline border border-black/10">
              {episode ? `Ep #${episode.episodeNumber || 1}` : 'World Bible Mode'}
            </span>
          </div>

          {/* Center Studio View Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-zinc-100 border border-black/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab('comic')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'comic'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Comic Spread</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('universe')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'universe'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>World Bible & Cast ({world.characters.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('agent')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'agent'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Director Brain</span>
            </button>
          </div>

          {/* Action Buttons & Dual Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Dual Mode Switcher */}
            {apiConfig?.mode === 'meta' ? (
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-blue-50/90 border border-blue-200">
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
                  title="Switch to Local Mode"
                >
                  Local
                </button>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
                  title="Meta AI Mode Active (Click to configure)"
                >
                  <span>♾️</span>
                  <span>Meta AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-zinc-100 border border-black/[0.08]">
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white shadow-xs transition-all cursor-pointer"
                  title="Local Mode Active"
                >
                  <span>Local</span>
                </button>
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-zinc-600 hover:text-blue-600 transition-all cursor-pointer"
                  title="Switch to Meta AI Mode"
                >
                  <span>♾️</span>
                  <span>Meta AI</span>
                </button>
              </div>
            )}

            {/* Direct Page Art Generation Button if Episode has no page image */}
            {onGenerateArtwork && episode && !episode.pageImageUrl && (
              <button
                type="button"
                onClick={() => onGenerateArtwork()}
                disabled={isGeneratingArtwork}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Synthesize comic page artwork with Meta Muse Image"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingArtwork ? 'animate-spin' : ''}`} />
                <span>{isGeneratingArtwork ? 'Drawing...' : 'Draw Comic'}</span>
              </button>
            )}

            {/* Quick Regenerate Story & Art Button */}
            {onRegenerateEpisode && episode && (
              <button
                type="button"
                onClick={onRegenerateEpisode}
                disabled={isLoading}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-black/10 text-zinc-700 hover:bg-black/[0.04] transition-all cursor-pointer"
                title="Regenerate this episode with Meta AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Re-draw</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-black/10 text-zinc-700 hover:bg-black/[0.04] transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Creator Profile & Storage Status Badge */}
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-zinc-100 border border-black/15 shadow-2xs transition-all cursor-pointer"
                title={isDbConnected ? 'Synced to MongoDB Atlas' : 'Saved locally in browser'}
              >
                <span>{currentProfile?.avatarEmoji || '👤'}</span>
                <span className="font-mono text-[11px] font-bold text-zinc-900">
                  @{currentProfile?.handle || 'guest'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 shadow-xs' : 'bg-amber-400'}`}
                />
              </button>
            )}

            {episode && (
              <button
                onClick={handleExportPng}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
            )}

            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-full border border-black/10 hover:bg-black/[0.04] text-zinc-700 cursor-pointer"
              title="Universe Roster and Settings"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          STUDIO WORKSPACE LAYOUT (PERSISTENT DESKTOP SIDEBAR + EXPANSIVE CANVAS)
      ========================================================================= */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* DESKTOP PERMANENT STUDIO SIDEBAR (Visible on lg+ screens) */}
        <aside className="hidden lg:block w-80 xl:w-88 border-r border-black/[0.08] bg-white/70 p-6 shrink-0 overflow-y-auto">
          {renderSidebarContent()}
        </aside>

        {/* MAIN STUDIO STAGE (CHANGES ACCORDING TO ACTIVE TAB) */}
        <main className="flex-1 flex flex-col justify-between overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 min-h-[calc(100vh-4rem)]">
          {/* TAB 1: COMIC SPREAD VIEW */}
          {activeTab === 'comic' && (
            <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex flex-col items-center">
              {episode ? (
                <>
                  {/* AI Director Pacing Rationale Badge */}
                  {episode.directorReasoning && (
                    <div className="w-full mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/80 rounded-2xl px-5 py-3 flex items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-mono font-bold text-[10px] uppercase tracking-wider shrink-0">
                          Episode #{episode.episodeNumber || 1} Pacing
                        </span>
                        <span className="text-zinc-800 font-medium italic">
                          &ldquo;{episode.directorReasoning}&rdquo;
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-white border border-purple-200 font-mono text-[10px] font-bold text-purple-700 uppercase shrink-0">
                        {episode.layoutStyle || '4-panel'}
                      </span>
                    </div>
                  )}

                  {/* The Expansive Comic Spread */}
                  <ComicPageSpread
                    ref={stripRef}
                    world={world}
                    episode={episode}
                    showBubbles={true}
                    onUpdateDialogue={onUpdateDialogue}
                    onAddDialogue={onAddDialogue}
                    onDeleteDialogue={onDeleteDialogue}
                    onUpdatePanelScene={onUpdatePanelScene}
                    onGenerateArtwork={onGenerateArtwork}
                    isGeneratingArtwork={isGeneratingArtwork}
                    artworkError={artworkError}
                    apiConfig={apiConfig}
                  />

                  {/* Minimal Core Truth Reflection Banner */}
                  {episode.cognitiveAnalysis?.coreTruth && (
                    <div className="mt-6 text-center text-xs sm:text-sm text-zinc-500 font-serif italic max-w-2xl mx-auto">
                      &ldquo;{episode.cognitiveAnalysis.coreTruth}&rdquo;
                    </div>
                  )}
                </>
              ) : (
                /* World Bible Mode Screen when world has 0 episodes */
                <div className="w-full max-w-3xl bg-white rounded-3xl p-8 sm:p-12 border-2 border-zinc-950 shadow-md text-center space-y-6 my-8">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-black/10 flex items-center justify-center mx-auto text-3xl">
                    🎨
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-950">
                      Welcome to {world.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      You are in World Setup & Bible Mode. Review laws, locations, and characters in the <strong>World Bible</strong> tab, or direct Episode #1 whenever you're ready!
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('universe')}
                      className="px-5 py-2.5 rounded-full bg-white border border-black/15 text-xs font-bold text-zinc-800 hover:bg-zinc-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Explore World Bible & Laws</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onGenerateNextEpisode(prompt.trim() || world.tagline, selectedLayout, selectedLens)}
                      disabled={isLoading}
                      className="px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isLoading ? 'Generating Episode 1...' : 'Draw Episode 1: Origin'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNIVERSE BIBLE & CHARACTER VISUAL DOSSIER */}
          {activeTab === 'universe' && (
            <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
              {/* Universe Header & Core Lore Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-zinc-950 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/[0.08] gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono font-bold text-xs uppercase tracking-wider">
                        {world.genre}
                      </span>
                      <span className="px-3 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-mono text-xs font-semibold uppercase">
                        {world.artStyle} Art Style
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-serif">
                      {world.title}
                    </h1>
                    <p className="text-sm text-zinc-600 mt-1 font-sans">{world.tagline}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddCharOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 text-white font-bold text-xs hover:bg-blue-600 transition-all shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Character</span>
                  </button>
                </div>

                {/* Lore Backstory & Conflict */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                      Universe Lore & Ongoing Conflict
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingLore(!isEditingLore);
                        setDraftLore(world.lore || '');
                      }}
                      className="text-xs font-mono text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isEditingLore ? 'Cancel' : 'Edit Lore'}</span>
                    </button>
                  </div>

                  {isEditingLore ? (
                    <div className="space-y-2">
                      <textarea
                        value={draftLore}
                        onChange={(e) => setDraftLore(e.target.value)}
                        rows={3}
                        className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 font-serif leading-relaxed outline-none focus:border-zinc-950"
                        placeholder="Describe the universe setting, history, and core ongoing friction..."
                      />
                      <button
                        type="button"
                        onClick={handleSaveLore}
                        className="px-4 py-1.5 rounded-full bg-zinc-950 text-white font-bold text-xs hover:bg-blue-600 cursor-pointer"
                      >
                        Save Lore Changes
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-800 leading-relaxed font-serif">
                      {world.lore || `${world.title} is an ongoing episodic universe where recurring characters confront evolving challenges in a distinctive ${world.artStyle} world.`}
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION: UNIVERSAL LAWS & CONSTRAINTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-indigo-600" />
                      <span>Universal Laws & Physics Rules ({(world.laws || []).length})</span>
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Canon rules strictly obeyed by Meta AI across all episodes and conflicts
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddLawOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-zinc-50 text-zinc-900 border border-black/15 font-bold text-xs shadow-2xs cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Law / Rule</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(world.laws || []).map((law) => {
                    const badgeBg =
                      law.category === 'physics' ? 'bg-blue-100 text-blue-900' :
                      law.category === 'magic' ? 'bg-purple-100 text-purple-900' :
                      law.category === 'taboo' ? 'bg-red-100 text-red-900' :
                      law.category === 'social' ? 'bg-amber-100 text-amber-900' :
                      'bg-zinc-100 text-zinc-900';

                    return (
                      <div
                        key={law.id}
                        className="bg-white border-2 border-zinc-950 rounded-2xl p-4 shadow-2xs space-y-2 relative group hover:border-indigo-600 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${badgeBg}`}>
                              {law.category}
                            </span>
                            <h3 className="font-bold text-sm text-zinc-950">{law.title}</h3>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteLaw(law.id)}
                            className="text-zinc-400 hover:text-red-600 p-1 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                            title="Delete law"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                          {law.rule}
                        </p>
                      </div>
                    );
                  })}

                  {(world.laws || []).length === 0 && (
                    <div className="col-span-full p-6 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-xs">
                      No custom laws defined yet. Click &ldquo;Add Law / Rule&rdquo; to define physics, magic constraints, or societal taboos for this world.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: CANON LOCATIONS & STAGING LANDMARKS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <span>Canon Locations & Landmarks ({(world.locations || []).length})</span>
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Visual environments and recurring staging sets used by the AI Director
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddLocOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-zinc-50 text-zinc-900 border border-black/15 font-bold text-xs shadow-2xs cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Location</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(world.locations || []).map((loc) => (
                    <div
                      key={loc.id}
                      className="bg-white border-2 border-zinc-950 rounded-2xl p-4 shadow-2xs space-y-2 relative group hover:border-emerald-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📍</span>
                          <h3 className="font-bold text-sm text-zinc-950">{loc.name}</h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="text-zinc-400 hover:text-red-600 p-1 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                          title="Delete location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed font-serif italic">
                        &ldquo;{loc.description}&rdquo;
                      </p>

                      {loc.significance && (
                        <div className="pt-1">
                          <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Role: {loc.significance}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {(world.locations || []).length === 0 && (
                    <div className="col-span-full p-6 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-xs">
                      No landmarks defined yet. Click &ldquo;Add Location&rdquo; to give your characters distinct environments to inhabit.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: CUSTOM WORLD PARAMETERS & QUIRKS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-amber-600" />
                      <span>Custom World Parameters & Quirks ({(world.customAttributes || []).length})</span>
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Arbitrary lore parameters (currency, tech level, weather anomalies, sacred items)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddAttrOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-zinc-50 text-zinc-900 border border-black/15 font-bold text-xs shadow-2xs cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Parameter</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(world.customAttributes || []).map((attr) => (
                    <div
                      key={attr.id}
                      className="bg-white border-2 border-zinc-950 rounded-2xl p-3.5 shadow-2xs flex items-start justify-between gap-2 group hover:border-amber-600 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                          {attr.key}
                        </span>
                        <span className="text-xs font-bold text-zinc-900 block">
                          {attr.value}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCustomAttr(attr.id)}
                        className="text-zinc-400 hover:text-red-600 p-1 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                        title="Delete parameter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {(world.customAttributes || []).length === 0 && (
                    <div className="col-span-full p-6 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-xs">
                      No custom parameters defined yet. Add currency, climate anomalies, or sacred items.
                    </div>
                  )}
                </div>
              </div>

              {/* Characters Visual Dossiers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Recurring Cast & Visual Continuity Anchors ({world.characters.length})</span>
                  </h2>
                  <span className="text-xs text-zinc-400 font-mono">
                    Visual anchors locked across all AI episodes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {world.characters.map((char) => (
                    <div
                      key={char.id}
                      className="bg-white rounded-2xl border-2 border-zinc-950 p-5 shadow-xs flex flex-col justify-between space-y-4 relative group hover:border-blue-600 transition-colors"
                    >
                      <div className="space-y-3">
                        {/* Header: Avatar, Name, Role */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="w-12 h-12 rounded-xl bg-zinc-100 border border-black/10 flex items-center justify-center text-2xl shadow-2xs">
                              {char.avatarEmoji}
                            </span>
                            <div>
                              <h3 className="font-bold text-base text-zinc-950 leading-snug">{char.name}</h3>
                              {char.gender && (
                                <span className="text-xs text-zinc-500 capitalize">{char.gender}</span>
                              )}
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider bg-zinc-950 text-white">
                            {char.role}
                          </span>
                        </div>

                        {/* Visual Appearance Anchor (CRITICAL) */}
                        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 space-y-1">
                          <span className="font-mono text-[10px] font-bold uppercase text-amber-900 block flex items-center gap-1">
                            <span>🎨</span>
                            <span>Visual Look & Wardrobe Anchor:</span>
                          </span>
                          <p className="text-xs text-zinc-800 leading-relaxed font-sans">
                            {char.appearance || 'Distinctive everyday attire with expressive styling.'}
                          </p>
                        </div>

                        {/* Personality & Backstory */}
                        {char.personality && (
                          <div className="text-xs text-zinc-600 space-y-0.5">
                            <span className="font-bold text-zinc-900 block">Personality:</span>
                            <p>{char.personality}</p>
                          </div>
                        )}

                        {/* Catchphrase */}
                        {char.catchphrase && (
                          <div className="bg-zinc-50 border border-black/[0.04] rounded-lg p-2.5 text-xs text-zinc-700 italic font-serif">
                            &ldquo;{char.catchphrase}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Tag in Prompt Button */}
                      <button
                        type="button"
                        onClick={() => {
                          handleInsertBeat(`@${char.name}`);
                          setActiveTab('comic');
                        }}
                        className="w-full py-2 rounded-xl bg-zinc-100 hover:bg-zinc-950 hover:text-white text-xs font-bold text-zinc-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Tag @{char.name} in Next Episode</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Character Modal Overlay */}
              {isAddCharOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="relative w-full max-w-lg bg-white border-2 border-zinc-950 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
                      <div>
                        <h3 className="font-bold text-lg text-zinc-950">
                          {isMidStoryIntro ? '✨ Introduce Character into Scene & Canon' : `Add New Character to ${world.title}`}
                        </h3>
                        {isMidStoryIntro && (
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Introduce a new person or ally mid-story. Automatically added to Canon and inserted into your current prompt!
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddCharOpen(false);
                          setIsMidStoryIntro(false);
                        }}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveNewCharacter} className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-bold text-zinc-800">Character Name *</label>
                          <input
                            type="text"
                            value={newCharName}
                            onChange={(e) => setNewCharName(e.target.value)}
                            placeholder="e.g. Inspector Vance"
                            required
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-800">Avatar Emoji</label>
                          <input
                            type="text"
                            value={newCharEmoji}
                            onChange={(e) => setNewCharEmoji(e.target.value)}
                            placeholder="⚡"
                            maxLength={2}
                            className="w-full text-center bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-lg text-zinc-900 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-800">Role</label>
                          <select
                            value={isCustomCharRole ? '__custom__' : newCharRole}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setIsCustomCharRole(true);
                              } else {
                                setIsCustomCharRole(false);
                                setNewCharRole(e.target.value as ComicCharacter['role']);
                              }
                            }}
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                          >
                            <option value="protagonist">Protagonist (Hero)</option>
                            <option value="antagonist">Antagonist (Rival / Villain)</option>
                            <option value="sidekick">Sidekick / Partner</option>
                            <option value="supporting">Supporting Character</option>
                            <option value="__custom__">✨ Custom Story Role...</option>
                          </select>
                          {isCustomCharRole && (
                            <input
                              type="text"
                              value={customCharRoleText}
                              onChange={(e) => setCustomCharRoleText(e.target.value)}
                              placeholder="e.g. Rival Detective, Sentient AI, Deity"
                              className="w-full mt-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-900 outline-none font-medium"
                              autoFocus
                            />
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-800">Gender / Form</label>
                          <select
                            value={isCustomCharGender ? '__custom__' : newCharGender}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setIsCustomCharGender(true);
                              } else {
                                setIsCustomCharGender(false);
                                setNewCharGender(e.target.value as ComicCharacter['gender']);
                              }
                            }}
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                          >
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="non-binary">Non-Binary</option>
                            <option value="robot-ai">Robot / AI Chassis</option>
                            <option value="creature-other">Creature / Monster</option>
                            <option value="__custom__">✨ Custom Form / Identity...</option>
                          </select>
                          {isCustomCharGender && (
                            <input
                              type="text"
                              value={customCharGenderText}
                              onChange={(e) => setCustomCharGenderText(e.target.value)}
                              placeholder="e.g. Cyborg Hivemind, Formless Spirit"
                              className="w-full mt-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-900 outline-none font-medium"
                              autoFocus
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800">
                          Visual Appearance & Wardrobe (Crucial for AI Image Continuity) *
                        </label>
                        <textarea
                          value={newCharAppearance}
                          onChange={(e) => setNewCharAppearance(e.target.value)}
                          placeholder="e.g. Red leather aviator jacket, goggles on forehead, spiky black hair, silver cybernetic left arm..."
                          rows={2}
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-800">Personality</label>
                          <input
                            type="text"
                            value={newCharPersonality}
                            onChange={(e) => setNewCharPersonality(e.target.value)}
                            placeholder="e.g. Sarcastic, quick-witted"
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-800">Catchphrase</label>
                          <input
                            type="text"
                            value={newCharCatchphrase}
                            onChange={(e) => setNewCharCatchphrase(e.target.value)}
                            placeholder="e.g. Never bet against me."
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddCharOpen(false);
                            setIsMidStoryIntro(false);
                          }}
                          className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newCharName.trim()}
                          className="px-6 py-2 rounded-full bg-zinc-950 text-white font-bold text-xs hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isMidStoryIntro ? 'Introduce & Enter Scene' : 'Save Character'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add Universal Law Modal Overlay */}
              {isAddLawOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="relative w-full max-w-lg bg-white border-2 border-zinc-950 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚖️</span>
                        <h3 className="font-bold text-lg text-zinc-950">Add Universal Law or Rule</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddLawOpen(false)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveLaw} className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-bold text-zinc-800">Law / Rule Title *</label>
                          <input
                            type="text"
                            value={newLawTitle}
                            onChange={(e) => setNewLawTitle(e.target.value)}
                            placeholder="e.g. Law of Gravitational Shift"
                            required
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-800">Category</label>
                          <select
                            value={isCustomLawCat ? '__custom__' : newLawCategory}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setIsCustomLawCat(true);
                              } else {
                                setIsCustomLawCat(false);
                                setNewLawCategory(e.target.value as any);
                              }
                            }}
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2 py-2 text-xs text-zinc-900 outline-none"
                          >
                            <option value="physics">Physics ⚛️</option>
                            <option value="magic">Magic / Super 🔮</option>
                            <option value="social">Social Law ⚖️</option>
                            <option value="taboo">Strict Taboo 🚫</option>
                            <option value="custom">Custom Quirk 📜</option>
                            <option value="__custom__">✨ Custom Category Name...</option>
                          </select>
                          {isCustomLawCat && (
                            <input
                              type="text"
                              value={customLawCatText}
                              onChange={(e) => setCustomLawCatText(e.target.value)}
                              placeholder="e.g. Cosmic Curse, Economic Order"
                              className="w-full mt-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-900 outline-none font-medium"
                              autoFocus
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800">
                          Rule Description & Consequence (Strictly Obeyed by AI) *
                        </label>
                        <textarea
                          value={newLawRule}
                          onChange={(e) => setNewLawRule(e.target.value)}
                          placeholder="e.g. Every day at sunset, gravity is cut by 50% across the city. Violating this law causes instant physical anomaly..."
                          rows={3}
                          required
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setIsAddLawOpen(false)}
                          className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newLawTitle.trim() || !newLawRule.trim()}
                          className="px-6 py-2 rounded-full bg-zinc-950 text-white font-bold text-xs hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Save Universal Law
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add Location Modal Overlay */}
              {isAddLocOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="relative w-full max-w-lg bg-white border-2 border-zinc-950 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📍</span>
                        <h3 className="font-bold text-lg text-zinc-950">Add Canon Landmark / Location</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddLocOpen(false)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveLocation} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800">Location Name *</label>
                        <input
                          type="text"
                          value={newLocName}
                          onChange={(e) => setNewLocName(e.target.value)}
                          placeholder="e.g. The Neon Citadel / Dialysis Bay 4"
                          required
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800">
                          Visual Environment Description (Used in Comic Panel Prompts) *
                        </label>
                        <textarea
                          value={newLocDesc}
                          onChange={(e) => setNewLocDesc(e.target.value)}
                          placeholder="e.g. Towering black glass spire wrapped in magenta holographic rain, steam vents at street level..."
                          rows={2}
                          required
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800">Story Role or Significance</label>
                        <input
                          type="text"
                          value={newLocSig}
                          onChange={(e) => setNewLocSig(e.target.value)}
                          placeholder="e.g. Primary headquarters / Safe haven"
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 outline-none"
                        />
                      </div>

                      <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setIsAddLocOpen(false)}
                          className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newLocName.trim() || !newLocDesc.trim()}
                          className="px-6 py-2 rounded-full bg-zinc-950 text-white font-bold text-xs hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Save Location
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add Custom Attribute Modal Overlay */}
              {isAddAttrOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="relative w-full max-w-md bg-white border-2 border-zinc-950 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏷️</span>
                        <h3 className="font-bold text-lg text-zinc-950">Add Custom World Parameter</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddAttrOpen(false)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCustomAttr} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800">Parameter Key / Name *</label>
                        <input
                          type="text"
                          value={newAttrKey}
                          onChange={(e) => setNewAttrKey(e.target.value)}
                          placeholder="e.g. Currency, Forbidden Weapon, Weather"
                          required
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-800">Parameter Value / Rule *</label>
                        <input
                          type="text"
                          value={newAttrVal}
                          onChange={(e) => setNewAttrVal(e.target.value)}
                          placeholder="e.g. Nitro Cold Brew, Perpetual Electric Fog"
                          required
                          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setIsAddAttrOpen(false)}
                          className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newAttrKey.trim() || !newAttrVal.trim()}
                          className="px-6 py-2 rounded-full bg-zinc-950 text-white font-bold text-xs hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Save Parameter
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: META AI DIRECTOR BRAIN & CANON MEMORY */}
          {activeTab === 'agent' && (
            <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
              {episode ? (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-zinc-950 shadow-md space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-black/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        🧠
                      </div>
                      <div>
                        <h2 className="font-bold text-lg text-zinc-950">Meta AI Director & Canon Memory</h2>
                        <p className="text-xs text-zinc-500">How the autonomous Meta AI agent directs story continuity and pacing.</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono text-xs font-bold">
                      {episode.metaModelUsed}
                    </span>
                  </div>

                  {/* AI Director Pacing & Layout Rationale */}
                  <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🎬</span>
                        <span>Episode #{episode.episodeNumber || 1} Pacing Rationale</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-200/80 text-purple-900 font-mono text-xs font-bold uppercase">
                        Layout: {episode.layoutStyle || '4-panel'}
                      </span>
                    </div>
                    <p className="text-sm text-purple-950 font-serif italic">
                      &ldquo;{episode.directorReasoning || 'The AI Director analyzed the dramatic beats and optimized this chapter into a sequential narrative arc.'}&rdquo;
                    </p>
                  </div>

                  {/* Canon Continuity Memory Chain */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Canon Facts Introduced */}
                    <div className="bg-zinc-50 border border-black/[0.08] rounded-2xl p-5 space-y-3">
                      <span className="font-mono text-xs font-bold uppercase text-zinc-800 tracking-wider flex items-center gap-1.5">
                        <span>📜</span>
                        <span>Canon Facts Established in this Episode</span>
                      </span>
                      {episode.newFacts && episode.newFacts.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-zinc-700">
                          {episode.newFacts.map((fact, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="font-bold text-emerald-600 font-mono">•</span>
                              <span>{fact}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">Established world continuity and recurring cast presence.</p>
                      )}
                    </div>

                    {/* Open Narrative Threads */}
                    <div className="bg-zinc-50 border border-black/[0.08] rounded-2xl p-5 space-y-3">
                      <span className="font-mono text-xs font-bold uppercase text-zinc-800 tracking-wider flex items-center gap-1.5">
                        <span>🪝</span>
                        <span>Unresolved Narrative Hooks & Cliffhangers</span>
                      </span>
                      {episode.openThreads && episode.openThreads.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-zinc-700">
                          {episode.openThreads.map((thread, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="font-bold text-amber-600 font-mono">•</span>
                              <span>{thread}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">Open threads will carry forward into the next directed episode.</p>
                      )}
                    </div>

                    {/* AI Co-Director Fork & Next Beat Branches */}
                    {episode.directorQuestion && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 space-y-3">
                        <span className="font-mono text-xs font-bold uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
                          <span>✨</span>
                          <span>Director Branch: {episode.directorQuestion.question}</span>
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {episode.directorQuestion.options.map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setPrompt(opt.beat);
                                setActiveTab('comic');
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-purple-600 hover:text-white text-zinc-800 border border-purple-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer text-left"
                            >
                              <span className="text-purple-600 font-bold">↳</span>
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stamped Continuity Recap */}
                  {episode.recap && (
                    <div className="p-4 bg-zinc-100 rounded-xl border border-black/[0.06] text-xs text-zinc-700 flex items-start gap-3">
                      <span className="font-bold font-mono uppercase text-zinc-900 shrink-0">Continuity Recap:</span>
                      <span className="italic">{episode.recap}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-zinc-950 shadow-md text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-3xl mx-auto">
                    🧠
                  </div>
                  <h3 className="font-bold text-lg text-zinc-950">Meta AI Director Ready</h3>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Once Episode 1 is generated, the Meta AI Director will log the pacing rationale, canon facts established, and unresolved hooks right here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              BOTTOM CO-DIRECTOR COMMAND DOCK (WITH DYNAMIC LAYOUT SELECTOR)
          ===================================================================== */}
          <div className="sticky bottom-4 w-full max-w-4xl mx-auto pt-6 z-20">
            {/* Quick Character & Plot Beat Suggestions + Layout Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 py-1">
              {/* Dynamic Layout Selector Pills */}
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md border border-black/15 rounded-full p-1 shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 px-2">Layout:</span>
                {(
                  [
                    { id: 'auto', label: '🤖 Auto' },
                    { id: '1-panel', label: '1-Panel' },
                    { id: '2-panel', label: '2-Panel' },
                    { id: '3-panel', label: '3-Panel' },
                    { id: '4-panel', label: '4-Panel' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedLayout(opt.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      selectedLayout === opt.id
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Tone / Narrative Lens Selector Pills */}
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md border border-black/15 rounded-full p-1 shadow-2xs">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 px-2">Tone:</span>
                {(
                  [
                    { id: 'candid', label: '🎯 Candid' },
                    { id: 'empathetic', label: '🤝 Empathetic' },
                    { id: 'satirical', label: '🎭 Satirical' },
                    { id: 'stoic', label: '🏛️ Stoic' },
                    { id: 'engineer', label: '⚙️ Engineer' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedLens(opt.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      selectedLens === opt.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Character Quick-Tags & Mid-Story Intro Button */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {world.characters.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleInsertBeat(`@${c.name}`)}
                    className="px-2.5 py-1 rounded-full text-xs bg-white border border-black/10 hover:border-black/30 text-zinc-900 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>{c.avatarEmoji}</span>
                    <span className="font-bold">@{c.name}</span>
                  </button>
                ))}

                {/* Introduce Character Mid-Story Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMidStoryIntro(true);
                    setIsAddCharOpen(true);
                  }}
                  className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:border-indigo-400 text-indigo-700 hover:text-indigo-950 transition-all shadow-2xs flex items-center gap-1.5 font-bold cursor-pointer"
                  title="Introduce a new character or faction mid-story directly into the scene"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Introduce Character</span>
                </button>
              </div>
            </div>

            {/* Interactive Creative Fork / Meta AI Co-Director Question */}
            {episode?.directorQuestion && (
              <div className="mb-2 p-3 sm:p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50/70 to-purple-50 border border-purple-200/90 rounded-2xl shadow-2xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-purple-700">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                    </span>
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Co-Director Fork</span>
                  </div>
                  <span className="text-[10px] text-purple-600/70 font-mono">Select a path or type custom beat</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 mb-2">
                  {episode.directorQuestion.question}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {episode.directorQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(opt.beat)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-purple-600 hover:text-white text-zinc-800 border border-purple-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer text-left group"
                    >
                      <span className="text-purple-600 group-hover:text-white font-bold">↳</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Next Beat Suggestions & Roll Ideas */}
            {((episode?.nextSuggestions && episode.nextSuggestions.length > 0) || (dynamicSuggestions && dynamicSuggestions.length > 0)) && (
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-zinc-400 shrink-0">
                  <Compass className="w-3 h-3 text-indigo-500" />
                  <span>Next Beats:</span>
                </div>
                {(dynamicSuggestions || episode?.nextSuggestions || []).map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(sug)}
                    className="px-2.5 py-1 rounded-full text-xs bg-indigo-50/80 hover:bg-indigo-100 hover:border-indigo-300 border border-indigo-200/60 text-indigo-950 transition-all shadow-2xs flex items-center gap-1 cursor-pointer truncate max-w-[280px] sm:max-w-md"
                    title={sug}
                  >
                    <span className="text-indigo-400 font-serif">“</span>
                    <span className="truncate">{sug}</span>
                    <span className="text-indigo-400 font-serif">”</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleRollNewBeatIdeas}
                  className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 transition-all shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                  title="Roll new context-aware narrative beats"
                >
                  <RefreshCw className="w-3 h-3 text-zinc-500" />
                  <span>Roll Ideas</span>
                </button>
              </div>
            )}

            {/* Prompt Input Form */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center bg-white border-2 border-zinc-950 rounded-full p-2 shadow-2xl focus-within:ring-2 focus-within:ring-blue-600 transition-all"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  episode
                    ? `Direct Episode #${(episode.episodeNumber || 1) + 1} (e.g. @${world.characters[0]?.name || 'Hero'} faces an unexpected twist)...`
                    : `Direct Episode #1: Origin (e.g. How does the story begin for @${world.characters[0]?.name || 'Hero'}?)...`
                }
                className="flex-1 bg-transparent px-5 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 outline-none font-medium"
              />

              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className={`px-6 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  !prompt.trim() || isLoading
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-950 text-white hover:bg-blue-600 shadow-md'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Directing with Meta AI...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {episode
                        ? `Generate Episode #${(episode.episodeNumber || 1) + 1}`
                        : 'Draw Episode #1: Origin'}
                    </span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OUT DRAWER
      ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] mb-4">
              <h3 className="font-bold text-base text-zinc-950">Universe Studio</h3>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </div>
  );
}
