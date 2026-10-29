'use client';

import React, { useState } from 'react';
import {
  ComicWorld,
  ComicCharacter,
  ArtStyle,
  WorldLaw,
  WorldLocation,
  CustomWorldAttribute
} from '@/types/comic';
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Users, 
  Palette, 
  Compass, 
  Check, 
  Shield, 
  Zap,
  HelpCircle,
  Scale,
  MapPin,
  Tag,
  Scroll
} from 'lucide-react';

interface UniverseBuilderStudioProps {
  onBack: () => void;
  onCreateWorld: (newWorld: ComicWorld) => void;
}

const GENRE_OPTIONS = [
  'Superheroes & Vigilantes',
  'Tech Comedy & Startups',
  'Healthcare & Real-Life Drama',
  'Cyberpunk & Sci-Fi Mystery',
  'Cozy Slice of Life',
  'Dark Satire & Absurdist',
];

const ART_STYLE_OPTIONS: { id: ArtStyle; name: string; desc: string; sample: string }[] = [
  { id: 'webcomic', name: 'Modern Webcomic', desc: 'Crisp flat vector linework & expressive palettes', sample: '🎨' },
  { id: 'minimalist', name: 'Minimalist Line Art', desc: 'Monochrome architectural ink & generous whitespace', sample: '✒️' },
  { id: 'manga', name: 'Classic Manga', desc: 'High-contrast ink, speedlines & screentone shading', sample: '⚡' },
  { id: 'newspaper', name: 'Vintage Newspaper', desc: 'Warm paper texture & nostalgic Sunday strip charm', sample: '📰' },
  { id: 'noir', name: 'Cinematic Noir', desc: 'Moody deep shadows, high-contrast graphic novel drama', sample: '🕶️' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Futuristic gritty cyber aesthetics & neon accents', sample: '🌆' },
];

const EMOJI_AVATARS = [
  '👨‍💻', '🦸‍♂️', '👩‍💻', '🦸‍♀️', '🤖', '👾', '🕵️‍♂️', '🥷', 
  '👩‍🔬', '🧙‍♂️', '🐱', '☕', '🩺', '🚀', '💼', '⚡'
];

type GenderType = ComicCharacter['gender'];
type RoleType = ComicCharacter['role'];

export function UniverseBuilderStudio({ onBack, onCreateWorld }: UniverseBuilderStudioProps) {
  // Universe identity state
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [genre, setGenre] = useState('Sci-Fi & Cyberpunk');
  const [artStyle, setArtStyle] = useState<ArtStyle>('webcomic');

  // Character list state - starts completely empty so user defines their own cast
  const [characters, setCharacters] = useState<ComicCharacter[]>([]);

  // Active character draft form state
  const [charName, setCharName] = useState('');
  const [charGender, setCharGender] = useState<GenderType>('female');
  const [charRole, setCharRole] = useState<RoleType>('sidekick');
  const [charEmoji, setCharEmoji] = useState('👩‍💻');
  const [charAppearance, setCharAppearance] = useState('');
  const [charPersonality, setCharPersonality] = useState('');
  const [charCatchphrase, setCharCatchphrase] = useState('');
  const [charDescription, setCharDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Universe lore & ongoing conflict state
  const [worldLore, setWorldLore] = useState('');

  // World laws state
  const [worldLaws, setWorldLaws] = useState<WorldLaw[]>([]);
  const [draftLawTitle, setDraftLawTitle] = useState('');
  const [draftLawRule, setDraftLawRule] = useState('');
  const [draftLawCategory, setDraftLawCategory] = useState<'physics' | 'magic' | 'social' | 'taboo' | 'custom'>('physics');

  // World locations state
  const [worldLocations, setWorldLocations] = useState<WorldLocation[]>([]);
  const [draftLocName, setDraftLocName] = useState('');
  const [draftLocDesc, setDraftLocDesc] = useState('');

  // Custom world parameters state
  const [worldCustomAttrs, setWorldCustomAttrs] = useState<CustomWorldAttribute[]>([]);
  const [draftAttrKey, setDraftAttrKey] = useState('');
  const [draftAttrVal, setDraftAttrVal] = useState('');

  const handleAddLaw = () => {
    if (!draftLawTitle.trim() || !draftLawRule.trim()) return;
    setWorldLaws((prev) => [
      ...prev,
      {
        id: `law-${Date.now()}`,
        title: draftLawTitle.trim(),
        rule: draftLawRule.trim(),
        category: draftLawCategory,
      },
    ]);
    setDraftLawTitle('');
    setDraftLawRule('');
  };

  const handleAddLocation = () => {
    if (!draftLocName.trim() || !draftLocDesc.trim()) return;
    setWorldLocations((prev) => [
      ...prev,
      {
        id: `loc-${Date.now()}`,
        name: draftLocName.trim(),
        description: draftLocDesc.trim(),
      },
    ]);
    setDraftLocName('');
    setDraftLocDesc('');
  };

  const handleAddCustomAttr = () => {
    if (!draftAttrKey.trim() || !draftAttrVal.trim()) return;
    setWorldCustomAttrs((prev) => [
      ...prev,
      {
        id: `attr-${Date.now()}`,
        key: draftAttrKey.trim(),
        value: draftAttrVal.trim(),
      },
    ]);
    setDraftAttrKey('');
    setDraftAttrVal('');
  };

  const handleQuickAddLawPreset = (title: string, rule: string, category: 'physics' | 'magic' | 'social' | 'taboo' | 'custom') => {
    if (worldLaws.some((l) => l.title === title)) return;
    setWorldLaws((prev) => [
      ...prev,
      {
        id: `law-${Date.now()}`,
        title,
        rule,
        category,
      },
    ]);
  };

  const handleAddCharacter = () => {
    if (!charName.trim()) {
      setFormError('Please enter a character name.');
      return;
    }

    const newChar: ComicCharacter = {
      id: `char-${Date.now()}`,
      name: charName.trim(),
      gender: charGender,
      role: charRole,
      appearance: charAppearance.trim() || 'Distinctive everyday comic attire with expressive features',
      personality: charPersonality.trim() || 'Pragmatic and supportive ally',
      catchphrase: charCatchphrase.trim() || undefined,
      description: charDescription.trim() || `${charRole} in this universe`,
      avatarEmoji: charEmoji,
      traits: [charRole, charGender || 'unspecified'].filter(Boolean) as string[],
    };

    setCharacters((prev) => [...prev, newChar]);

    // Reset draft fields
    setCharName('');
    setCharAppearance('');
    setCharPersonality('');
    setCharCatchphrase('');
    setCharDescription('');
    setFormError(null);
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLaunchUniverse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a name for your comic universe.');
      return;
    }
    if (characters.length === 0) {
      alert('Please add at least one recurring character for story continuity.');
      return;
    }

    const newWorld: ComicWorld = {
      id: `world-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || 'A new serialized comic universe in the making',
      genre,
      artStyle,
      characters,
      episodes: [],
      createdAt: new Date().toISOString(),
      lore: worldLore.trim() || tagline.trim(),
      laws: worldLaws,
      locations: worldLocations,
      customAttributes: worldCustomAttrs,
    };

    onCreateWorld(newWorld);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#181716] flex flex-col justify-between selection:bg-zinc-200 w-full">
      
      {/* =========================================================================
          FULL-SCREEN STUDIO HEADER
      ========================================================================= */}
      <header className="w-full border-b border-black/[0.08] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-14 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors py-1.5 px-3 rounded-lg hover:bg-black/[0.04]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Universes</span>
            </button>
            <span className="text-zinc-300">/</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-950">Universe Architect</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-mono font-semibold uppercase">
                Studio Mode
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleLaunchUniverse}
              disabled={!title.trim() || characters.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all shadow-sm active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Build Universe & Draw Episode 1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN EXPANSIVE 2-COLUMN WORKSPACE
      ========================================================================= */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* =====================================================================
              LEFT / CENTER COLUMN: UNIVERSE CONFIGURATION & CHARACTER LAB
          ===================================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Step 1: Universe Identity Card */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-black/[0.06]">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-900 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div>
                  <h2 className="font-bold text-lg text-zinc-950">Universe Premise & Style</h2>
                  <p className="text-xs text-zinc-500">Define the core world, genre, and artistic visual identity.</p>
                </div>
              </div>

              {/* Title & Logline */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
                    Universe Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Late Night Hero, The 2 AM Dev Lab, Mars Colony 9..."
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
                    Premise / Logline *
                  </label>
                  <textarea
                    rows={2}
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Nine-to-five software developer by day, fighting urban chaos at night while juggling Slack pings..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 border border-black/[0.08] text-xs text-zinc-950 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* Genre Selector Pills */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600 mb-2">
                  Genre & Mood
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenre(g)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        genre === g
                          ? 'bg-zinc-950 text-white shadow-2xs font-semibold'
                          : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-700 border border-black/[0.04]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Art Style Selector */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600 mb-2">
                  Visual Art Style (Meta AI Art Engine)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ART_STYLE_OPTIONS.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => setArtStyle(style.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        artStyle === style.id
                          ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                          : 'border-black/[0.08] bg-zinc-50 hover:bg-zinc-100/80 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{style.sample}</span>
                        {artStyle === style.id && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs">{style.name}</div>
                        <div className={`text-[10px] mt-0.5 line-clamp-2 ${artStyle === style.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {style.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Step 2: Character Creation Studio */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-900 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-zinc-950">Recurring Characters Lab</h2>
                    <p className="text-xs text-zinc-500">
                      Configure character gender, visual appearance, and personality for persistent comic continuity.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                  {characters.length} in Cast
                </span>
              </div>

              {/* Character Roster Cards */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                  Current Cast Roster
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {characters.map((char) => (
                    <div
                      key={char.id}
                      className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.06] flex items-start justify-between gap-3 relative group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                          {char.avatarEmoji}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-zinc-950">{char.name}</span>
                            <span className="px-2 py-0.5 rounded-md bg-zinc-200/80 text-zinc-700 text-[10px] font-mono uppercase font-semibold">
                              {char.gender || 'unspecified'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-mono uppercase font-semibold">
                              {char.role}
                            </span>
                          </div>

                          {char.appearance && (
                            <p className="text-[11px] text-zinc-600 line-clamp-2 leading-snug">
                              <span className="font-semibold text-zinc-800">Visuals:</span> {char.appearance}
                            </p>
                          )}

                          {char.personality && (
                            <p className="text-[10px] text-zinc-500 italic line-clamp-1">
                              "{char.personality}"
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCharacter(char.id)}
                        className="text-zinc-400 hover:text-red-600 p-1 rounded-md transition-colors shrink-0"
                        title="Remove character"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Character Creation Form Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#faf9f6] border border-black/[0.08] space-y-5">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-zinc-900" />
                  <span className="font-bold text-sm text-zinc-950">Add Another Character to Universe</span>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {formError}
                  </div>
                )}

                {/* Name, Role & Gender Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                      Character Name *
                    </label>
                    <input
                      type="text"
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      placeholder="e.g. Alex, Inspector Vance, Luna"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                      Gender
                    </label>
                    <select
                      value={charGender}
                      onChange={(e) => setCharGender(e.target.value as GenderType)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    >
                      <option value="female">Female ♀️</option>
                      <option value="male">Male ♂️</option>
                      <option value="non-binary">Non-Binary ⚧️</option>
                      <option value="robot-ai">Robot / AI 🤖</option>
                      <option value="creature-other">Creature / Other 🐾</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                      Role in Story
                    </label>
                    <select
                      value={charRole}
                      onChange={(e) => setCharRole(e.target.value as RoleType)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    >
                      <option value="protagonist">Protagonist 🌟</option>
                      <option value="sidekick">Sidekick / Partner 🤝</option>
                      <option value="antagonist">Antagonist / Foil 😈</option>
                      <option value="supporting">Supporting / Mentor 🧙‍♂️</option>
                    </select>
                  </div>
                </div>

                {/* Avatar Emoji Selector */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1.5">
                    Avatar Token
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCharEmoji(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                          charEmoji === emoji
                            ? 'bg-zinc-950 text-white scale-110 shadow-xs'
                            : 'bg-white border border-black/[0.08] hover:bg-zinc-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Appearance & Clothing Details (Critical for AI Image Continuity) */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                    Visual Appearance & Clothing (For AI Consistency)
                  </label>
                  <input
                    type="text"
                    value={charAppearance}
                    onChange={(e) => setCharAppearance(e.target.value)}
                    placeholder="e.g. Athletic build, red leather trench coat, cybernetic monocle, silver braided hair"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950 placeholder:text-zinc-400"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Meta AI models will preserve these visual anchors across every comic panel and episode.
                  </p>
                </div>

                {/* Personality & Quirk Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                      Personality & Temperament
                    </label>
                    <input
                      type="text"
                      value={charPersonality}
                      onChange={(e) => setCharPersonality(e.target.value)}
                      placeholder="e.g. Sarcastic investigator, hyper-observant"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600 mb-1">
                      Signature Catchphrase (Optional)
                    </label>
                    <input
                      type="text"
                      value={charCatchphrase}
                      onChange={(e) => setCharCatchphrase(e.target.value)}
                      placeholder="e.g. 'Trust the data, not the hype.'"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddCharacter}
                    className="px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Character to Cast</span>
                  </button>
                </div>
              </div>

            </section>

            {/* Step 3: Universal Laws, Locations & Custom Quirks */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-900 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-zinc-950">Universal Laws, Locations & Custom Quirks</h2>
                    <p className="text-xs text-zinc-500">
                      Define the physical laws, magic constraints, staging locations, and arbitrary parameters governing this world.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                  {worldLaws.length} Laws • {worldLocations.length} Sets
                </span>
              </div>

              {/* 3A: Quick Inspiration Pills for Universal Laws */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-semibold uppercase text-zinc-600">
                  Quick Law Inspiration (Click to Add):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { title: '24-Hour Time Loop', rule: 'Every midnight, the timeline resets while only protagonists retain memories.', category: 'physics' as const },
                    { title: 'Law of Equivalent Exchange', rule: 'Any magic or power used requires burning an equivalent tangible resource.', category: 'magic' as const },
                    { title: 'Forbidden AGI Taboo', rule: 'Any autonomous neural computer past 1999 is outlawed under capital penalty.', category: 'taboo' as const },
                    { title: 'Coffee as Currency', rule: 'Global paper currency has collapsed; unground coffee beans are the legal tender.', category: 'social' as const },
                    { title: 'Low-Gravity Skies', rule: 'Atmospheric gravity drops to 0.4G above the second story of any building.', category: 'physics' as const },
                    { title: 'Perpetual Electric Rain', rule: 'Heavy neon-tinged rain falls continuously, powering street grid conduits.', category: 'physics' as const },
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleQuickAddLawPreset(preset.title, preset.rule, preset.category)}
                      className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-black/[0.06] text-zinc-800 text-xs font-medium cursor-pointer transition-colors"
                    >
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3B: Custom Universal Laws Form */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.06] space-y-3">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Define Universal Law or Constraint</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={draftLawTitle}
                      onChange={(e) => setDraftLawTitle(e.target.value)}
                      placeholder="Law Title (e.g. The Silence Decree, The 1000ml Ceiling)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <select
                      value={draftLawCategory}
                      onChange={(e) => setDraftLawCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none"
                    >
                      <option value="physics">Physics ⚛️</option>
                      <option value="magic">Magic / Super 🔮</option>
                      <option value="social">Social Law ⚖️</option>
                      <option value="taboo">Strict Taboo 🚫</option>
                      <option value="custom">Custom Quirk 📜</option>
                    </select>
                  </div>
                </div>

                <textarea
                  value={draftLawRule}
                  onChange={(e) => setDraftLawRule(e.target.value)}
                  placeholder="Describe the exact constraint and what happens if broken (Strictly enforced by Meta AI)..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950 leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddLaw}
                    disabled={!draftLawTitle.trim() || !draftLawRule.trim()}
                    className="px-4 py-1.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    + Add Law
                  </button>
                </div>

                {worldLaws.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-200/80">
                    {worldLaws.map((law) => (
                      <div key={law.id} className="p-2.5 rounded-xl bg-white border border-black/[0.06] flex items-start justify-between gap-2 text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-bold">
                              {law.category}
                            </span>
                            <span className="font-bold text-zinc-900">{law.title}</span>
                          </div>
                          <p className="text-zinc-600 text-[11px] mt-0.5">{law.rule}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWorldLaws((prev) => prev.filter((l) => l.id !== law.id))}
                          className="text-zinc-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3C: Locations & Landmarks Form */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.06] space-y-3">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Canon Locations & Staging Sets</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={draftLocName}
                    onChange={(e) => setDraftLocName(e.target.value)}
                    placeholder="Location Name (e.g. Neon Citadel, Dialysis Bay 4)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                  />
                  <input
                    type="text"
                    value={draftLocDesc}
                    onChange={(e) => setDraftLocDesc(e.target.value)}
                    placeholder="Visual Details (e.g. glass spire with steam vents & magenta rain)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    disabled={!draftLocName.trim() || !draftLocDesc.trim()}
                    className="px-4 py-1.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    + Add Location
                  </button>
                </div>

                {worldLocations.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-200/80">
                    {worldLocations.map((loc) => (
                      <div key={loc.id} className="p-2.5 rounded-xl bg-white border border-black/[0.06] flex items-start justify-between gap-2 text-xs">
                        <div>
                          <span className="font-bold text-zinc-900">📍 {loc.name}</span>
                          <p className="text-zinc-600 text-[11px] italic mt-0.5">&ldquo;{loc.description}&rdquo;</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWorldLocations((prev) => prev.filter((l) => l.id !== loc.id))}
                          className="text-zinc-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3D: Custom World Parameters Form */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.06] space-y-3">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Custom World Parameters (Currency, Weather, Tech Level)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={draftAttrKey}
                    onChange={(e) => setDraftAttrKey(e.target.value)}
                    placeholder="Parameter Name (e.g. Currency, Forbidden Item)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                  />
                  <input
                    type="text"
                    value={draftAttrVal}
                    onChange={(e) => setDraftAttrVal(e.target.value)}
                    placeholder="Value (e.g. Nitro Cold Brew, Ancient SSDs)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs text-zinc-900 outline-none focus:border-zinc-950"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddCustomAttr}
                    disabled={!draftAttrKey.trim() || !draftAttrVal.trim()}
                    className="px-4 py-1.5 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    + Add Parameter
                  </button>
                </div>

                {worldCustomAttrs.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-200/80">
                    {worldCustomAttrs.map((attr) => (
                      <div key={attr.id} className="px-3 py-1.5 rounded-xl bg-white border border-black/[0.06] flex items-center gap-2 text-xs">
                        <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">{attr.key}:</span>
                        <span className="font-bold text-zinc-900">{attr.value}</span>
                        <button
                          type="button"
                          onClick={() => setWorldCustomAttrs((prev) => prev.filter((a) => a.id !== attr.id))}
                          className="text-zinc-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* =====================================================================
              RIGHT COLUMN: LIVE UNIVERSE BIBLE & COMIC SHEET PREVIEW
          ===================================================================== */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-6">
            
            {/* Live Universe Sheet */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Universe Bible Preview
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-semibold">
                  Meta Llama 3.3 Ready
                </span>
              </div>

              {/* Cover Preview */}
              <div className="p-4 rounded-2xl bg-[#faf9f6] border border-black/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-200/80 text-zinc-700 text-[10px] font-mono font-bold uppercase">
                    {genre}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 capitalize">
                    {artStyle} Art
                  </span>
                </div>

                <h3 className="font-bold text-2xl text-zinc-950 leading-tight">
                  {title || 'Untitled Universe'}
                </h3>

                <p className="text-xs text-zinc-600 leading-relaxed italic">
                  "{tagline || 'Your universe premise and story hook will appear here...'}"
                </p>
              </div>

              {/* Cast Snapshot */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2 block">
                  Recurring Characters ({characters.length})
                </span>

                <div className="space-y-2">
                  {characters.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-zinc-50 border border-black/[0.04] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{c.avatarEmoji}</span>
                        <div>
                          <div className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                            <span>{c.name}</span>
                            <span className="text-[9px] font-normal text-zinc-500 capitalize">
                              ({c.gender || 'unspecified'})
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 capitalize">
                            {c.role} • {c.personality ? c.personality.split(',')[0] : 'Cast'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        Locked
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready to Launch Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLaunchUniverse}
                  disabled={!title.trim() || characters.length === 0}
                  className="w-full py-3 rounded-2xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build Universe & Draw Episode 1</span>
                </button>
              </div>
            </div>

            {/* Meta AI Continuity Note */}
            <div className="p-4 rounded-2xl bg-white/60 border border-black/[0.06] text-xs text-zinc-500 flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-800 block">Character Continuity Guarantee</span>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  Character descriptions, genders, and visual anchors are embedded directly into the Meta Muse prompt generator so characters look and act consistently across all episodes.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
