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
  CustomWorldAttribute,
  ArtStyle,
  SpeechBubble,
} from '@/types/comic';
import { ApiConfig } from '@/lib/meta-models';
import { CoDirectorPitchResult } from '@/app/api/co-director-pitch/route';
import { ComicPageSpread, GranularArtworkOptions } from './ComicPageSpread';
import { CharacterDossierModal } from './CharacterDossierModal';
import { AgentDirectorTraceModal } from './AgentDirectorTraceModal';
import { BranchTimelineModal } from './BranchTimelineModal';
import { LiveRagPipelineTracker } from './LiveRagPipelineTracker';
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
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Bot,
  ShieldCheck,
  GitBranch,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Moon,
  Sun,
  Maximize2,
  Sliders,
  MessageSquare,
  Eye,
  HelpCircle,
  Wand2,
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
  onForkBranch?: (episodeNumber: number, branchTitle?: string, divergencePrompt?: string) => void;
  onRollback?: (episodeNumber: number) => void;
}

const STUDIO_ART_STYLES: { id: ArtStyle; name: string; icon: string; desc: string }[] = [
  { id: 'webcomic', name: 'Webcomic', icon: '🎨', desc: 'Vibrant flat digital' },
  { id: 'manga', name: 'Manga', icon: '⚡', desc: 'B&W dynamic screentone' },
  { id: 'noir', name: 'Noir', icon: '🕵️', desc: 'Moody deep shadows' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🤖', desc: 'Neon rain reflections' },
  { id: 'newspaper', name: 'Vintage', icon: '📰', desc: 'Warm paper & nostalgic ink' },
  { id: 'minimalist', name: 'Minimalist', icon: '✒️', desc: 'Crisp editorial linework' },
];

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
  onForkBranch,
  onRollback,
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
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchTargetEpisode, setBranchTargetEpisode] = useState<ComicStrip | null>(null);

  // Studio Reading Experience States (Unified Single Light Theme)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [readerTheme, setReaderTheme] = useState<'cinema' | 'studio'>('studio');
  const [readerWidth, setReaderWidth] = useState<'standard' | 'wide' | 'cinema'>('wide');

  // Dedicated Desktop Right Studio Panel States
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'next' | 'current'>('next');
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'sidebar' | 'studio'>('sidebar');

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

  // Dedicated Character Dossier Studio state
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [selectedCharForDossier, setSelectedCharForDossier] = useState<ComicCharacter | null>(null);

  const handleOpenDossier = (char?: ComicCharacter) => {
    setSelectedCharForDossier(char || null);
    setIsDossierOpen(true);
  };

  const handleSaveCharacterDossier = (updatedChar: ComicCharacter) => {
    if (!onUpdateWorld) return;
    const oldChar = world.characters.find((c) => c.id === updatedChar.id);
    const exists = Boolean(oldChar);
    const updatedChars = exists
      ? world.characters.map((c) => (c.id === updatedChar.id ? updatedChar : c))
      : [...world.characters, updatedChar];

    // If existing character was renamed, propagate new name across episodes
    let updatedEpisodes = world.episodes;
    if (oldChar && oldChar.name !== updatedChar.name) {
      updatedEpisodes = (world.episodes || []).map((ep) => {
        const updatedPanels = (ep.panels || []).map((p) => {
          const updatedPanelChars = (p.characters || []).map((cn) =>
            cn.toLowerCase() === oldChar.name.toLowerCase() ? updatedChar.name : cn
          );
          const updatedBubbles = (p.bubbles || []).map((b) => {
            if (b.speaker.toLowerCase() === oldChar.name.toLowerCase()) {
              return { ...b, speaker: updatedChar.name };
            }
            return b;
          });
          return {
            ...p,
            characters: updatedPanelChars,
            bubbles: updatedBubbles,
          };
        });
        return {
          ...ep,
          panels: updatedPanels,
        };
      });
    }

    const updatedWorld: ComicWorld = {
      ...world,
      characters: updatedChars,
      episodes: updatedEpisodes,
    };
    onUpdateWorld(updatedWorld);
  };

  const handleDeleteCharacter = (charId: string) => {
    if (!onUpdateWorld) return;
    const deletedChar = world.characters.find((c) => c.id === charId);
    const updatedChars = world.characters.filter((c) => c.id !== charId);

    // Propagate character deletion across existing episodes: purge deleted character from panels & speech bubbles
    const updatedEpisodes = (world.episodes || []).map((ep) => {
      const updatedPanels = (ep.panels || []).map((p) => {
        const cleanedChars = (p.characters || []).filter((name) =>
          deletedChar ? !name.toLowerCase().includes(deletedChar.name.toLowerCase()) : true
        );
        const cleanedBubbles = (p.bubbles || []).map((b) => {
          if (deletedChar && b.speaker.toLowerCase().includes(deletedChar.name.toLowerCase())) {
            return {
              ...b,
              speaker: updatedChars[0]?.name || 'Narrator',
            };
          }
          return b;
        });
        return {
          ...p,
          characters: cleanedChars.length > 0 ? cleanedChars : [updatedChars[0]?.name || 'Protagonist'],
          bubbles: cleanedBubbles,
        };
      });

      return {
        ...ep,
        panels: updatedPanels,
      };
    });

    const updatedWorld: ComicWorld = {
      ...world,
      characters: updatedChars,
      episodes: updatedEpisodes,
    };
    onUpdateWorld(updatedWorld);
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

  // Dynamic Guest Character Promotion State & Handler
  const [promotedGuestIds, setPromotedGuestIds] = useState<string[]>([]);

  const handlePromoteGuestCharacter = (guest: ComicCharacter) => {
    if (!onUpdateWorld) return;
    const exists = world.characters.some(
      (c) => c.name.toLowerCase() === guest.name.toLowerCase()
    );
    if (exists) return;

    const promotedChar: ComicCharacter = {
      id: guest.id || `char-promoted-${Date.now()}`,
      name: guest.name,
      role: (guest.role as any) || 'supporting',
      gender: guest.gender || 'unspecified',
      appearance: guest.appearance || 'Sharp contemporary attire',
      description: guest.description || `Promoted from episodic guest character in "${episode?.title || 'Episode'}".`,
      avatarEmoji: guest.avatarEmoji || '💼',
      traits: guest.traits && guest.traits.length > 0 ? guest.traits : ['Introduced as episodic guest', 'Key scene partner'],
    };

    const updatedEpisodes = (world.episodes || []).map((ep) => {
      if (ep.id === episode?.id) {
        return {
          ...ep,
          guestCharacters: (ep.guestCharacters || []).filter(
            (g) => g.name.toLowerCase() !== guest.name.toLowerCase()
          ),
        };
      }
      return ep;
    });

    const updatedWorld: ComicWorld = {
      ...world,
      characters: [...world.characters, promotedChar],
      episodes: updatedEpisodes,
    };

    setPromotedGuestIds((prev) => [...prev, guest.id || guest.name]);
    onUpdateWorld(updatedWorld);
  };

  // AI Co-Director Alignment & Interactive Brainstorming
  const [isAligningPitch, setIsAligningPitch] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);
  const [coDirectorPitch, setCoDirectorPitch] = useState<CoDirectorPitchResult | null>(null);
  const [selectedBeatForks, setSelectedBeatForks] = useState<{ [questionId: string]: string }>({});

  const handleFetchCoDirectorPitch = async () => {
    const clean = prompt.trim();
    if (!clean) return;
    setIsAligningPitch(true);
    setPitchError(null);
    try {
      const res = await fetch('/api/co-director-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          premise: clean,
          characters: world.characters,
          worldTitle: world.title,
          genre: world.genre,
          apiKey: apiConfig?.apiKey,
          baseUrl: apiConfig?.baseUrl,
          provider: apiConfig?.provider,
          modelName: apiConfig?.modelName,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Pitch API returned status ${res.status}`);
      }
      const data: CoDirectorPitchResult = await res.json();
      setCoDirectorPitch(data);
      setSelectedBeatForks({});
    } catch (err: any) {
      console.error('Co-Director pitch failed:', err);
      setPitchError(err.message || 'Failed to brainstorm with Co-Director.');
    } finally {
      setIsAligningPitch(false);
    }
  };

  const handleDrawWithCoDirectorDirection = () => {
    if (!prompt.trim() && !coDirectorPitch) return;
    const chosenBeats = Object.values(selectedBeatForks).filter(Boolean);
    let finalPremise = prompt.trim();
    if (chosenBeats.length > 0) {
      finalPremise += `\n\n[Director Direction & Beats]:\n${chosenBeats.map((b) => `• ${b}`).join('\n')}`;
    }
    onGenerateNextEpisode(finalPremise, selectedLayout, selectedLens);
    setPrompt('');
    setCoDirectorPitch(null);
    setSelectedBeatForks({});
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
        <div className="pb-4 border-b border-black/[0.08] flex items-start justify-between gap-2">
          <div>
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
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-black/5 transition-colors cursor-pointer shrink-0"
            title="Collapse Sidebar (Cinema Mode)"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
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
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onForkBranch && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBranchTargetEpisode(ep);
                            setIsBranchModalOpen(true);
                          }}
                          className={`p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity ${
                            isSelected ? 'hover:bg-zinc-800 text-emerald-300' : 'hover:bg-zinc-200 text-emerald-700'
                          }`}
                          title={`Fork story branch from Episode #${ep.episodeNumber || idx + 1}`}
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
                    </div>
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
                className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-black/[0.06] transition-all flex items-center justify-between shadow-2xs group"
              >
                <div
                  onClick={() => handleInsertBeat(`@${char.name}`)}
                  className="flex items-center gap-2 truncate cursor-pointer flex-1"
                  title={`Click to tag @${char.name} in prompt`}
                >
                  {char.imageUrl || char.portraitRefUrl ? (
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-black/10">
                      <img src={char.portraitRefUrl || char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                    </div>
                  ) : (
                    <span className="text-lg">{char.avatarEmoji}</span>
                  )}
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-zinc-900 block truncate">@{char.name}</span>
                      {(char.imageUrl || char.portraitRefUrl) && (
                        <span className="text-[9px] font-mono px-1 rounded bg-emerald-100 text-emerald-800 font-bold">RAG</span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 capitalize">{char.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDossier(char);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="Open Visual Character Generator & Model Sheet Studio"
                  >
                    <Palette className="w-3 h-3" />
                    <span>Visuals</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertBeat(`@${char.name}`)}
                    className="text-[10px] text-zinc-400 font-mono hover:text-zinc-900 cursor-pointer"
                  >
                    + Tag
                  </button>
                </div>
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

  // Dedicated Desktop Right Studio Panel (Co-Director & Page Controls)
  const renderRightStudioPanel = () => (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* 1. STUDIO HEADER */}
      <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
        readerTheme === 'cinema' && activeTab === 'comic'
          ? 'border-white/10 bg-zinc-900/60'
          : 'border-black/[0.08] bg-zinc-50/70'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs uppercase tracking-wider font-mono">
                Co-Director Studio
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                readerTheme === 'cinema' && activeTab === 'comic'
                  ? 'bg-zinc-800 text-zinc-300 border-white/15'
                  : 'bg-white text-zinc-700 border-black/10'
              }`}>
                {episode ? `Ep #${episode.episodeNumber || 1}` : 'Ep #1'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Next Episode vs Current Page */}
        <div className="flex items-center gap-1">
          <div className={`flex items-center p-0.5 rounded-lg border text-xs font-bold ${
            readerTheme === 'cinema' && activeTab === 'comic'
              ? 'bg-zinc-900 border-white/10'
              : 'bg-zinc-200/80 border-black/5'
          }`}>
            <button
              type="button"
              onClick={() => setRightPanelTab('next')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                rightPanelTab === 'next'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : readerTheme === 'cinema' && activeTab === 'comic'
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
              title="Direct Next Episode & Story Continuation"
            >
              <Sparkles className="w-3 h-3" />
              <span>Next Ep</span>
            </button>
            <button
              type="button"
              onClick={() => setRightPanelTab('current')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                rightPanelTab === 'current'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : readerTheme === 'cinema' && activeTab === 'comic'
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
              title="Current Episode Artwork, Script & Style"
            >
              <Sliders className="w-3 h-3" />
              <span>Current Ep</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsRightPanelOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ml-1"
            title="Collapse Co-Director Panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE STUDIO BODY */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {rightPanelTab === 'next' ? (
          /* =========================================================
             TAB 1: NEXT EPISODE CO-DIRECTOR
          ========================================================= */
          <div className="space-y-5 select-text">
            {/* Episode Target Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-500">
                  Story Progression
                </span>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                  {episode ? `Direct Episode #${(episode.episodeNumber || 1) + 1}` : 'Direct Episode #1: Origin'}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {selectedLayout.toUpperCase()} • {selectedLens.toUpperCase()}
              </span>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Edit2 className="w-3 h-3 text-blue-500" />
                  <span>Story Premise / Scene Beat</span>
                </label>
                {prompt.trim() && (
                  <button
                    type="button"
                    onClick={() => setPrompt('')}
                    className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-mono cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={
                  episode
                    ? `Describe what happens next for @${world.characters[0]?.name || 'the cast'}...`
                    : `How does the story begin for @${world.characters[0]?.name || 'our hero'}?...`
                }
                className={`w-full p-3 rounded-2xl text-xs sm:text-sm font-medium border resize-none transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                  readerTheme === 'cinema' && activeTab === 'comic'
                    ? 'bg-zinc-900 border-white/15 text-white placeholder:text-zinc-500'
                    : 'bg-white border-black/15 text-zinc-900 placeholder:text-zinc-400 shadow-2xs'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    if (prompt.trim() && !isLoading) {
                      onGenerateNextEpisode(prompt.trim(), selectedLayout, selectedLens);
                      setPrompt('');
                    }
                  }
                }}
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>Tip: Press ⌘/Ctrl + Enter to draw</span>
                <span>{prompt.length} chars</span>
              </div>
            </div>

            {/* AI Co-Director Brainstorming Action */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleFetchCoDirectorPitch}
                disabled={!prompt.trim() || isAligningPitch}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Brainstorm cast scoping, guest characters, and tone options with AI Co-Director"
              >
                <Brain className={`w-3.5 h-3.5 ${isAligningPitch ? 'animate-spin' : 'text-purple-500'}`} />
                <span>{isAligningPitch ? 'Analyzing Cast & Scene...' : '🎬 Brainstorm with AI Co-Director'}</span>
              </button>

              {pitchError && (
                <div className="text-[11px] text-red-500 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  {pitchError}
                </div>
              )}
            </div>

            {/* Interactive Co-Director Pitch Alignment Card */}
            {coDirectorPitch && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-blue-500/10 border-2 border-purple-500/30 space-y-3 shadow-xs animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-purple-700 dark:text-purple-300">
                    <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
                    <span>AI Co-Director Alignment</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoDirectorPitch(null);
                      setSelectedBeatForks({});
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer rounded"
                    title="Dismiss alignment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Logline Summary */}
                <div className="text-xs text-zinc-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 p-2.5 rounded-xl border border-purple-500/20 leading-relaxed font-medium">
                  <span className="font-bold text-purple-900 dark:text-purple-200 mr-1">Logline:</span>
                  {coDirectorPitch.premiseSummary}
                </div>

                {/* Scoped Cast Breakdown */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                    Episode Cast Scoping
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {coDirectorPitch.focusedCharacters.map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 font-semibold flex items-center gap-1"
                      >
                        <span>🎯 Spotlight:</span>
                        <span>{name}</span>
                      </span>
                    ))}
                    {coDirectorPitch.detectedGuestCharacters.map((guest, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 font-semibold flex items-center gap-1"
                        title={guest.description || guest.appearance}
                      >
                        <span>💼 Guest:</span>
                        <span>{guest.name}</span>
                        {guest.role && <span className="opacity-80 font-normal">({guest.role})</span>}
                      </span>
                    ))}
                    {coDirectorPitch.excludedCharacters.map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 line-through text-[11px]"
                        title="Off-scene for this episode to prevent hero intrusion"
                      >
                        🚫 {name} (Off-Scene)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Directorial Questions */}
                {coDirectorPitch.directorialQuestions.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-purple-500/20">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                      Directorial Choices (Click to Align Tone & Strategy)
                    </span>
                    {coDirectorPitch.directorialQuestions.map((q) => (
                      <div key={q.id} className="space-y-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {q.question}
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedBeatForks[q.id] === opt.beatAddition;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => {
                                  setSelectedBeatForks((prev) => ({
                                    ...prev,
                                    [q.id]: isSelected ? '' : opt.beatAddition,
                                  }));
                                }}
                                className={`w-full text-left p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                    : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-black/10 dark:border-white/10 hover:border-purple-300'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold text-[11px]">
                                  <span>{opt.label}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-purple-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                  {opt.description}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Primary Draw Page Button */}
                <button
                  type="button"
                  onClick={handleDrawWithCoDirectorDirection}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>🚀 Draw Page with Co-Director Direction</span>
                </button>
              </div>
            )}

            {/* Interactive Meta AI Director Question / Choice Forks */}
            {episode?.directorQuestion && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-purple-500/15 border border-purple-500/30 space-y-2.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-purple-400">
                    <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    <span>AI Co-Director Choice</span>
                  </div>
                  <span className="text-[10px] text-purple-400/80 font-mono">Click to branch</span>
                </div>

                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {episode.directorQuestion.question}
                </p>

                <div className="space-y-1.5">
                  {episode.directorQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(opt.beat)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-start gap-2 shadow-2xs group ${
                        prompt === opt.beat
                          ? 'bg-purple-600 text-white border-purple-500 ring-2 ring-purple-400/50'
                          : readerTheme === 'cinema' && activeTab === 'comic'
                          ? 'bg-zinc-900/90 hover:bg-purple-950/60 text-zinc-200 border-white/10'
                          : 'bg-white hover:bg-purple-50 text-zinc-800 border-purple-200/80'
                      }`}
                    >
                      <span className="text-purple-400 group-hover:text-purple-300 font-bold shrink-0">↳</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs">{opt.label}</div>
                        <div className={`text-[11px] line-clamp-2 mt-0.5 ${
                          prompt === opt.beat ? 'text-purple-100' : 'text-zinc-500 dark:text-zinc-400'
                        }`}>{opt.beat}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Cast Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                  <span>Insert Cast (@mention)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsMidStoryIntro(true);
                    setIsAddCharOpen(true);
                  }}
                  className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold cursor-pointer flex items-center gap-0.5"
                  title="Introduce new character mid-story"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Character</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {world.characters.map((c) => (
                  <div key={c.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleInsertBeat(`@${c.name}`)}
                      className={`px-2.5 py-1 rounded-l-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                        readerTheme === 'cinema' && activeTab === 'comic'
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-white/10'
                          : 'bg-white hover:bg-zinc-50 text-zinc-800 border-black/10'
                      }`}
                      title={`Click to insert @${c.name} into prompt`}
                    >
                      {c.portraitRefUrl || c.imageUrl ? (
                        <img src={c.portraitRefUrl || c.imageUrl} alt={c.name} className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                      ) : (
                        <span>{c.avatarEmoji}</span>
                      )}
                      <span className="font-bold">@{c.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDossier(c)}
                      className={`px-1.5 py-1 rounded-r-xl text-xs font-semibold border border-l-0 transition-all cursor-pointer ${
                        readerTheme === 'cinema' && activeTab === 'comic'
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-purple-400 border-white/10'
                          : 'bg-white hover:bg-purple-50 text-purple-600 border-black/10'
                      }`}
                      title={`Open Visual Character Generator & RAG Studio for @${c.name}`}
                    >
                      <Palette className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Format Preference */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Next Episode Layout:
              </span>
              <div className="grid grid-cols-5 gap-1">
                {(
                  [
                    { id: 'auto', label: 'Auto' },
                    { id: '1-panel', label: '1-Pan' },
                    { id: '2-panel', label: '2-Pan' },
                    { id: '3-panel', label: '3-Pan' },
                    { id: '4-panel', label: '4-Pan' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedLayout(opt.id)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer border ${
                      selectedLayout === opt.id
                        ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs'
                        : readerTheme === 'cinema' && activeTab === 'comic'
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/10'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 border-black/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Narrative Tone / Lens Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Narrative Tone / Lens:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
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
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold truncate text-center transition-all cursor-pointer border ${
                      selectedLens === opt.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                        : readerTheme === 'cinema' && activeTab === 'comic'
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/10'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 border-black/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Beat Suggestions */}
            {((episode?.nextSuggestions && episode.nextSuggestions.length > 0) || (dynamicSuggestions && dynamicSuggestions.length > 0)) && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-indigo-400" />
                    <span>Story Beat Ideas:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRollNewBeatIdeas}
                    className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Roll</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(dynamicSuggestions || episode?.nextSuggestions || []).slice(0, 3).map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sug)}
                      className={`w-full text-left p-2 rounded-xl text-[11px] border transition-all cursor-pointer line-clamp-2 ${
                        readerTheme === 'cinema' && activeTab === 'comic'
                          ? 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border-white/10'
                          : 'bg-zinc-50 hover:bg-indigo-50/60 text-zinc-700 border-black/5 hover:border-indigo-200'
                      }`}
                      title={sug}
                    >
                      <span className="text-indigo-400 font-bold mr-1">&ldquo;</span>
                      <span>{sug}</span>
                      <span className="text-indigo-400 font-bold ml-1">&rdquo;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onGenerateNextEpisode(prompt.trim() || world.tagline, selectedLayout, selectedLens)}
                disabled={isLoading}
                className={`w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isLoading
                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Directing with Meta AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {episode
                        ? `Draw Episode #${(episode.episodeNumber || 1) + 1} →`
                        : 'Draw Episode #1: Origin →'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================
             TAB 2: CURRENT EPISODE STUDIO & SCRIPT
          ========================================================= */
          <div className="select-text">
            {episode ? (
              <div className="space-y-5">
                {/* Current Episode Header */}
                <div className="pb-3 border-b border-black/[0.06] dark:border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                      Issue #{episode.episodeNumber || 1}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono capitalize">
                      {world.artStyle} style
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {episode.title}
                  </h3>
                </div>

                {/* Primary Episode Action Buttons */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                    Page Art & Story Actions
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Re-draw Page Artwork */}
                    {onGenerateArtwork && (
                      <button
                        type="button"
                        onClick={() => onGenerateArtwork()}
                        disabled={isGeneratingArtwork}
                        className="p-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingArtwork ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingArtwork ? 'Drawing Art...' : '🎨 Clean Re-Draw'}</span>
                      </button>
                    )}

                    {/* Quick Regenerate Story & Art */}
                    {onRegenerateEpisode && (
                      <button
                        type="button"
                        onClick={onRegenerateEpisode}
                        disabled={isLoading}
                        className="p-2.5 rounded-xl text-xs font-bold border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Re-script Story</span>
                      </button>
                    )}

                    {/* Multiverse Branch */}
                    {onForkBranch && (
                      <button
                        type="button"
                        onClick={() => {
                          setBranchTargetEpisode(episode);
                          setIsBranchModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Branch Story</span>
                      </button>
                    )}

                    {/* Multi-Agent Trace Modal */}
                    <button
                      type="button"
                      onClick={() => setIsTraceModalOpen(true)}
                      className="p-2.5 rounded-xl text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Agent Trace</span>
                    </button>
                  </div>

                  {/* Export PNG button */}
                  <button
                    type="button"
                    onClick={handleExportPng}
                    disabled={isExporting}
                    className="w-full p-2.5 rounded-xl text-xs font-bold border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? 'Exporting...' : 'Export High-Res PNG'}</span>
                  </button>
                </div>

                {/* Episode Cast & Guest Character Promotions */}
                {((episode.pageCharacters && episode.pageCharacters.length > 0) || (episode.guestCharacters && episode.guestCharacters.length > 0)) && (
                  <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/10">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                      Characters on this Page
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {episode.pageCharacters?.map((char) => (
                        <button
                          key={char.id}
                          type="button"
                          onClick={() => handleOpenDossier(char)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-black/5 flex items-center gap-1.5 cursor-pointer font-medium"
                          title="Open character dossier"
                        >
                          <span>{char.avatarEmoji || '👤'}</span>
                          <span>{char.name}</span>
                        </button>
                      ))}
                      {episode.guestCharacters?.map((guest, idx) => {
                        const isPromoted = promotedGuestIds.includes(guest.id || guest.name) ||
                          world.characters.some((c) => c.name.toLowerCase() === guest.name.toLowerCase());
                        return (
                          <div
                            key={guest.id || idx}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold flex items-center gap-1">
                                <span>💼</span>
                                <span>{guest.name}</span>
                                {guest.role && <span className="font-normal opacity-80 text-[10px]">({guest.role})</span>}
                              </div>
                              {guest.description && (
                                <div className="text-[10px] opacity-75 line-clamp-1 mt-0.5">{guest.description}</div>
                              )}
                            </div>
                            {isPromoted ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                                ✓ Core Cast
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePromoteGuestCharacter(guest)}
                                className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-all shadow-2xs shrink-0 flex items-center gap-1"
                                title="Promote to permanent Core Cast in World Bible"
                              >
                                <span>⭐</span>
                                <span>Promote</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Art Style Quick Switcher */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-purple-400" />
                      <span>Art Style:</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono capitalize">
                      {world.artStyle}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {STUDIO_ART_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          if (onUpdateWorld) {
                            onUpdateWorld({ ...world, artStyle: style.id });
                          }
                          if (onGenerateArtwork) {
                            onGenerateArtwork({ artStyle: style.id });
                          }
                        }}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                          world.artStyle === style.id
                            ? 'bg-purple-600 text-white border-purple-500 ring-2 ring-purple-400/50 shadow-xs'
                            : readerTheme === 'cinema' && activeTab === 'comic'
                            ? 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-white/10'
                            : 'bg-white hover:bg-zinc-50 text-zinc-800 border-black/10'
                        }`}
                      >
                        <span className="text-base">{style.icon}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs leading-none">{style.name}</div>
                          <div className={`text-[9px] truncate mt-0.5 ${
                            world.artStyle === style.id ? 'text-purple-100' : 'text-zinc-500'
                          }`}>{style.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dialogue & Bubbles Quick Editor */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-blue-400" />
                    <span>Script & Dialogue Editor ({episode.panels.reduce((sum, p) => sum + (p.bubbles?.length || 0), 0)} bubbles)</span>
                  </span>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {episode.panels.map((p) => (
                      <div
                        key={p.panelNumber}
                        className={`p-3 rounded-xl border space-y-2 ${
                          readerTheme === 'cinema' && activeTab === 'comic'
                            ? 'bg-zinc-900/70 border-white/10'
                            : 'bg-zinc-50 border-black/[0.06]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-500">
                          <span>Panel #{p.panelNumber}</span>
                          <span className="italic truncate max-w-[170px] text-[10px]">{p.sceneDescription}</span>
                        </div>

                        {(p.bubbles || []).map((bubble: SpeechBubble) => (
                          <div key={bubble.id} className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                @{bubble.speaker} <span className="text-zinc-400">({bubble.type})</span>
                              </span>
                              {onDeleteDialogue && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteDialogue(p.panelNumber, bubble.id)}
                                  className="text-red-400 hover:text-red-500 cursor-pointer"
                                  title="Delete bubble"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={bubble.text}
                              onChange={(e) => onUpdateDialogue(p.panelNumber, bubble.id, e.target.value)}
                              className={`w-full text-xs p-2 rounded-lg border outline-none focus:ring-1 focus:ring-blue-500 ${
                                readerTheme === 'cinema' && activeTab === 'comic'
                                  ? 'bg-zinc-950 border-white/15 text-white'
                                  : 'bg-white border-black/10 text-zinc-900'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Director Pacing Rationale */}
                {episode.directorReasoning && (
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                    <span className="font-mono text-[10px] font-bold uppercase text-purple-400">
                      Director Pacing Rationale:
                    </span>
                    <p className="italic text-zinc-300">
                      &ldquo;{episode.directorReasoning}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 space-y-2">
                <span className="text-2xl">📖</span>
                <p className="text-xs">No active episode. Draw Episode 1 to view page controls!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col selection:bg-zinc-200 w-full transition-colors duration-300 ${
      readerTheme === 'cinema' && activeTab === 'comic'
        ? 'bg-[#0c0d12] text-zinc-100'
        : 'bg-[#faf8f5] text-[#181716]'
    }`}>
      {/* =========================================================================
          TOP NAVIGATION BAR (FULL WIDTH WIDESCREEN)
      ========================================================================= */}
      <header className={`w-full border-b sticky top-0 z-30 transition-colors backdrop-blur-md ${
        readerTheme === 'cinema' && activeTab === 'comic'
          ? 'border-white/10 bg-zinc-950/85 text-white'
          : 'border-black/[0.08] bg-white/80 text-zinc-900'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onBackToWorlds}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors py-1.5 px-2.5 rounded-lg cursor-pointer ${
                readerTheme === 'cinema' && activeTab === 'comic'
                  ? 'text-zinc-400 hover:text-white hover:bg-white/10'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-black/[0.04]'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Universes</span>
            </button>

            <span className="text-zinc-400">/</span>

            <span className={`font-bold text-sm truncate max-w-[140px] sm:max-w-xs ${
              readerTheme === 'cinema' && activeTab === 'comic' ? 'text-white' : 'text-zinc-950'
            }`}>
              {world.title}
            </span>

            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold hidden md:inline border ${
              readerTheme === 'cinema' && activeTab === 'comic'
                ? 'bg-zinc-900 text-zinc-300 border-white/15'
                : 'bg-zinc-100 text-zinc-700 border-black/10'
            }`}>
              {episode ? `Ep #${episode.episodeNumber || 1}` : 'World Bible Mode'}
            </span>

            {/* Sidebar Toggle / Cinema Mode Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                isSidebarOpen
                  ? readerTheme === 'cinema' && activeTab === 'comic'
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-white/20'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-black/10'
                  : 'bg-blue-600 text-white border-blue-500 shadow-sm'
              }`}
              title={isSidebarOpen ? 'Hide Sidebar (Full-Width Cinema Mode)' : 'Show Studio Sidebar'}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5 text-white" />}
              <span>{isSidebarOpen ? 'Cinema' : 'Sidebar'}</span>
            </button>
          </div>

          {/* Center Studio View Switcher */}
          <div className={`hidden sm:flex items-center gap-1 p-1 rounded-full border ${
            readerTheme === 'cinema' && activeTab === 'comic'
              ? 'bg-zinc-900 border-white/10'
              : 'bg-zinc-100 border-black/[0.06]'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('comic')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'comic'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : readerTheme === 'cinema'
                  ? 'text-zinc-400 hover:text-white'
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
                  : readerTheme === 'cinema'
                  ? 'text-zinc-400 hover:text-white'
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
                  : readerTheme === 'cinema'
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Director Brain</span>
            </button>
          </div>

          {/* Action Buttons & Dual Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Reading Width Controls (Only in Comic view) */}
            {activeTab === 'comic' && (
              <div className={`hidden xl:flex items-center gap-0.5 p-0.5 rounded-full border ${
                readerTheme === 'cinema' ? 'bg-zinc-900 border-white/10' : 'bg-zinc-100 border-black/10'
              }`}>
                <button
                  type="button"
                  onClick={() => setReaderWidth('standard')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                    readerWidth === 'standard'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : readerTheme === 'cinema'
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="Standard Width (896px)"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setReaderWidth('wide')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                    readerWidth === 'wide'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : readerTheme === 'cinema'
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="Wide View (1150px) — Eliminates Side Margins"
                >
                  Wide
                </button>
                <button
                  type="button"
                  onClick={() => setReaderWidth('cinema')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                    readerWidth === 'cinema'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : readerTheme === 'cinema'
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="Full Cinema Canvas (1400px)"
                >
                  Cinema
                </button>
              </div>
            )}

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

            {/* Multiverse Story Branch Button (ChatGPT-Style Branching) */}
            {episode && onForkBranch && (
              <button
                type="button"
                onClick={() => {
                  setBranchTargetEpisode(episode);
                  setIsBranchModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 transition-all cursor-pointer shadow-2xs"
                title="Fork an alternate timeline branch from this episode"
              >
                <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
                <span>Branch Story</span>
              </button>
            )}

            {/* Meta AI Production Room & Canon Score Pill */}
            {episode && (
              <button
                type="button"
                onClick={() => setIsTraceModalOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all cursor-pointer shadow-2xs"
                title="Inspect Autonomous Multi-Agent Production Room Trace"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                <span>Production Room</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-900 font-mono text-[10px]">
                  {episode.canonScore ?? 95}%
                </span>
                {(episode.correctionsCount ?? 0) > 0 && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" title="Auto-corrections applied" />
                )}
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

            {/* Desktop Right Co-Director Studio Toggle */}
            {activeTab === 'comic' && (
              <button
                type="button"
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  isRightPanelOpen
                    ? readerTheme === 'cinema'
                      ? 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border-purple-500/30'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                    : 'bg-purple-600 text-white border-purple-500 shadow-sm'
                }`}
                title={isRightPanelOpen ? 'Hide Right Co-Director Studio' : 'Show Right Co-Director Studio'}
              >
                {isRightPanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5 text-white" />}
                <span>{isRightPanelOpen ? 'Studio Deck' : 'Open Studio'}</span>
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
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* DESKTOP STUDIO SIDEBAR (Collapsible for Cinema Full-Width Mode) */}
        <aside className={`hidden lg:block transition-all duration-300 border-r shrink-0 overflow-y-auto ${
          readerTheme === 'cinema' && activeTab === 'comic'
            ? 'border-white/10 bg-zinc-950/90 text-zinc-100'
            : 'border-black/[0.08] bg-white/70 text-zinc-900'
        } ${
          isSidebarOpen ? 'w-72 xl:w-80 p-5' : 'w-0 p-0 overflow-hidden border-r-0'
        }`}>
          {renderSidebarContent()}
        </aside>

        {/* Floating Quick Re-open Sidebar Button when Collapsed */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="hidden lg:flex fixed left-0 top-24 z-30 px-3 py-2 bg-white/95 hover:bg-zinc-50 text-zinc-900 rounded-r-xl border-y border-r border-zinc-300 shadow-md text-xs font-bold items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
            title="Open Studio Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 text-purple-600" />
            <span>Cast & Ep</span>
          </button>
        )}

        {/* MAIN STUDIO STAGE (CHANGES ACCORDING TO ACTIVE TAB) */}
        <main className={`flex-1 min-w-0 flex flex-col justify-start overflow-y-auto h-[calc(100vh-4rem)] transition-all ${
          readerWidth === 'cinema' ? 'px-2 sm:px-4 py-4' : 'px-3 sm:px-6 py-5'
        }`}>
          {/* TAB 1: COMIC SPREAD VIEW */}
          {activeTab === 'comic' && (
            <div className={`w-full mx-auto flex flex-col items-center transition-all ${
              readerWidth === 'standard'
                ? 'max-w-4xl'
                : readerWidth === 'wide'
                ? 'max-w-5xl xl:max-w-6xl'
                : 'max-w-6xl 2xl:max-w-7xl'
            }`}>
              {episode ? (
                <>
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
                    isLoading={isLoading}
                    artworkError={artworkError}
                    apiConfig={apiConfig}
                    onSelectCharacterForDossier={handleOpenDossier}
                    isCinemaTheme={readerTheme === 'cinema'}
                    directorReasoning={episode.directorReasoning}
                    onPromoteGuestCharacter={handlePromoteGuestCharacter}
                  />

                  {/* Minimal Core Truth Reflection Banner */}
                  {episode.cognitiveAnalysis?.coreTruth && (
                    <div className="mt-6 text-center text-xs sm:text-sm text-zinc-500 font-serif italic max-w-2xl mx-auto">
                      &ldquo;{episode.cognitiveAnalysis.coreTruth}&rdquo;
                    </div>
                  )}
                </>
              ) : isLoading ? (
                /* Live RAG Pipeline Telemetry when generating Episode 1 */
                <div className="w-full max-w-4xl mx-auto my-4 sm:my-8">
                  <LiveRagPipelineTracker
                    world={world}
                    isLoading={true}
                    isGeneratingArtwork={false}
                    premise={prompt.trim() || world.tagline}
                    layoutPreference={selectedLayout}
                  />
                </div>
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
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Recurring Cast & Character Dossiers ({world.characters.length})</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDossier()}
                      className="px-3.5 py-1.5 rounded-full bg-zinc-950 hover:bg-purple-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>+ Create Detailed Character</span>
                    </button>
                    <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                      Visual anchors locked across all AI episodes
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {world.characters.map((char) => (
                    <div
                      key={char.id}
                      className="bg-white rounded-2xl border-2 border-zinc-950 p-5 shadow-xs flex flex-col justify-between space-y-4 relative group hover:border-purple-600 transition-colors"
                    >
                      <div className="space-y-3">
                        {/* Header: Avatar, Name, Role */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {char.imageUrl ? (
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-black/15 shadow-2xs group-hover:border-purple-600 transition-colors bg-zinc-100 shrink-0">
                                <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 right-0 text-[10px] bg-black/70 backdrop-blur-xs px-1 rounded-tl text-white">
                                  {char.avatarEmoji}
                                </span>
                              </div>
                            ) : (
                              <span className="w-12 h-12 rounded-xl bg-zinc-100 border border-black/10 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                                {char.avatarEmoji}
                              </span>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-bold text-base text-zinc-950 leading-snug">{char.name}</h3>
                                {char.imageUrl && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>CANON RAG</span>
                                  </span>
                                )}
                              </div>
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

                        {/* Deep-dive Badges (Wardrobe, Motivation, Ties) */}
                        {(char.imageUrl || char.wardrobe || char.motivation || char.flaws || (char.relationships && char.relationships.length > 0)) && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {char.imageUrl && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
                                📸 Model Sheet Canon
                              </span>
                            )}
                            {char.wardrobe && (
                              <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-mono text-zinc-700">
                                👔 Wardrobe Locked
                              </span>
                            )}
                            {char.motivation && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-mono text-blue-700">
                                🎯 Motive
                              </span>
                            )}
                            {char.relationships && char.relationships.length > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[10px] font-mono text-purple-700">
                                👥 {char.relationships.length} Ties
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons: Deep Dossier & Tag */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/[0.06]">
                        <button
                          type="button"
                          onClick={() => handleOpenDossier(char)}
                          className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          title="Open detailed character dossier studio"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>{char.imageUrl ? '📸 Dossier & Sheet' : 'Deep Dossier'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleInsertBeat(`@${char.name}`);
                            setActiveTab('comic');
                          }}
                          className="py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-950 hover:text-white text-xs font-bold text-zinc-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Tag in Scene</span>
                        </button>
                      </div>
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
                        <h2 className="font-bold text-lg text-zinc-950">Autonomous Meta AI Production Room</h2>
                        <p className="text-xs text-zinc-500">Multi-agent loop: Showrunner Agent, Canon Auditor & Visual Art Director.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsTraceModalOpen(true)}
                        className="px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <BrainCircuit className="w-3.5 h-3.5" />
                        <span>Inspect Deliberation Trace</span>
                      </button>

                      <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono text-xs font-bold">
                        {episode.metaModelUsed}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Agent Production Architecture Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-2xs font-mono font-bold text-purple-800 uppercase">
                          <Bot className="w-3.5 h-3.5" /> Showrunner Agent
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 font-bold">
                          Muse Spark 1.3
                        </span>
                      </div>
                      <p className="text-xs text-purple-950 leading-relaxed">
                        Formulates dramatic arcs, autonomously selects dynamic panel layouts ({episode.layoutStyle || '4-panel'}), and scripts dialogue cadence.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-2xs font-mono font-bold text-blue-800 uppercase">
                          <ShieldCheck className="w-3.5 h-3.5" /> Canon Auditor Agent
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900 font-bold">
                          {episode.canonScore ?? 95}% Verified
                        </span>
                      </div>
                      <p className="text-xs text-blue-950 leading-relaxed">
                        Continuity verification: strictly enforces antagonist hostility & opposition rules, universal laws, and textless prompt standards.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-2xs font-mono font-bold text-amber-800 uppercase">
                          <Sparkles className="w-3.5 h-3.5" /> Art Director Agent
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold">
                          Muse Image 1.0
                        </span>
                      </div>
                      <p className="text-xs text-amber-950 leading-relaxed">
                        Extracts visual consistency anchors from character dossiers and injects textless negative prompts preventing label bleed.
                      </p>
                    </div>
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

          {/* MOBILE ONLY CO-DIRECTOR DOCK (Hidden on desktop because desktop has the dedicated Right Panel) */}
          <div className="lg:hidden sticky bottom-3 w-full px-2 z-20 mt-auto pt-4">
            <form
              onSubmit={handleSubmit}
              className={`flex items-center border-2 rounded-full p-1.5 shadow-2xl transition-all ${
                readerTheme === 'cinema' && activeTab === 'comic'
                  ? 'bg-zinc-900 border-white/20'
                  : 'bg-white border-zinc-950'
              }`}
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  episode
                    ? `Direct Ep #${(episode.episodeNumber || 1) + 1}...`
                    : `Direct Ep #1: Origin...`
                }
                className={`flex-1 bg-transparent px-3 text-xs outline-none font-medium ${
                  readerTheme === 'cinema' && activeTab === 'comic'
                    ? 'text-white placeholder:text-zinc-500'
                    : 'text-zinc-900 placeholder:text-zinc-400'
                }`}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="px-4 py-2 rounded-full text-xs font-bold bg-blue-600 text-white disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </div>
        </main>

        {/* DESKTOP RIGHT CO-DIRECTOR STUDIO PANEL (Visible when activeTab === 'comic') */}
        {activeTab === 'comic' && (
          <aside className={`hidden lg:flex flex-col transition-all duration-300 border-l shrink-0 h-[calc(100vh-4rem)] overflow-hidden ${
            readerTheme === 'cinema'
              ? 'border-white/10 bg-zinc-950/95 text-zinc-100'
              : 'border-black/[0.08] bg-white/90 text-zinc-900'
          } ${
            isRightPanelOpen ? 'w-88 xl:w-96 2xl:w-[420px]' : 'w-0 overflow-hidden border-l-0 p-0'
          }`}>
            {renderRightStudioPanel()}
          </aside>
        )}

        {/* Floating Quick Re-open Right Studio Button when Collapsed */}
        {!isRightPanelOpen && activeTab === 'comic' && (
          <button
            type="button"
            onClick={() => setIsRightPanelOpen(true)}
            className="hidden lg:flex fixed right-0 top-24 z-30 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-l-xl border-y border-l border-white/20 shadow-xl text-xs font-bold items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
            title="Open Co-Director Studio"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Studio Deck</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OUT DRAWER (UNIVERSE & CO-DIRECTOR STUDIO)
      ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/10 mb-4">
              <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMobileDrawerTab('sidebar')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    mobileDrawerTab === 'sidebar'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  World Bible & Ep
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawerTab('studio')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    mobileDrawerTab === 'studio'
                      ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Co-Director Deck
                </button>
              </div>

              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {mobileDrawerTab === 'sidebar' ? renderSidebarContent() : renderRightStudioPanel()}
          </div>
        </div>
      )}
      {/* =========================================================================
          DEDICATED CHARACTER DOSSIER & DEVELOPMENT STUDIO WINDOW
      ========================================================================= */}
      <CharacterDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        character={selectedCharForDossier}
        world={world}
        onSaveCharacter={handleSaveCharacterDossier}
        onDeleteCharacter={handleDeleteCharacter}
        apiConfig={apiConfig}
      />
      {/* =========================================================================
          DEDICATED MULTI-AGENT PRODUCTION ROOM TRACE MODAL
      ========================================================================= */}
      <AgentDirectorTraceModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        episode={episode || null}
      />
      {/* =========================================================================
          MULTIVERSE STORY BRANCHING MODAL (CHATGPT-STYLE TIMELINE SPLIT)
      ========================================================================= */}
      <BranchTimelineModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        world={world}
        episode={branchTargetEpisode || episode || null}
        onForkBranch={(epNum, branchTitle, divPrompt) => {
          if (onForkBranch) onForkBranch(epNum, branchTitle, divPrompt);
        }}
        onRollback={(epNum) => {
          if (onRollback) onRollback(epNum);
        }}
      />
    </div>
  );
}
