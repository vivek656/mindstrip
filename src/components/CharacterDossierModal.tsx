'use client';

import React, { useState } from 'react';
import { ComicCharacter, ComicWorld, CharacterRelationship } from '@/types/comic';
import { ApiConfig } from '@/lib/meta-models';
import {
  X,
  Sparkles,
  Palette,
  Brain,
  MessageSquare,
  Zap,
  Users,
  Shield,
  Trash2,
  Check,
  Plus,
  RefreshCw,
  HelpCircle,
  Eye,
  Tag
} from 'lucide-react';

interface CharacterDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: ComicCharacter | null;
  world: ComicWorld;
  onSaveCharacter: (updatedCharacter: ComicCharacter) => void;
  onDeleteCharacter?: (characterId: string) => void;
  apiConfig?: ApiConfig;
}

const EMOJI_PRESETS = ['⚡', '🕵️', '🔥', '🛡️', '🧠', '🗡️', '🤖', '👑', '🌌', '💥', '🐺', '🌙', '💀', '🎯', '🚀', '🥷'];

const ROLE_PRESETS: { id: ComicCharacter['role']; label: string; desc: string }[] = [
  { id: 'protagonist', label: 'Protagonist', desc: 'Central hero driving the conflict' },
  { id: 'sidekick', label: 'Sidekick / Ally', desc: 'Trusted confidant or loyal partner' },
  { id: 'antagonist', label: 'Antagonist', desc: 'Primary opposition or rival' },
  { id: 'supporting', label: 'Supporting', desc: 'Recurring figure or mentor' },
];

const GENDER_PRESETS: { id: ComicCharacter['gender']; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'non-binary', label: 'Non-Binary' },
  { id: 'robot-ai', label: 'Robot / AI' },
  { id: 'creature-other', label: 'Creature / Alien' },
];

const TRAIT_SUGGESTIONS = [
  'Hyper-analytical',
  'Deadpan sarcasm',
  'Protective guilt',
  'Relentless optimist',
  'Ruthless strategist',
  'Impulsive daredevil',
  'Haunted by the past',
  'Technologically obsessed',
  'Quiet observer',
  'Unwavering moral code'
];

export function CharacterDossierModal({
  isOpen,
  onClose,
  character,
  world,
  onSaveCharacter,
  onDeleteCharacter,
  apiConfig,
}: CharacterDossierModalProps) {
  const isEditing = !!character?.id;

  const [activeTab, setActiveTab] = useState<'visuals' | 'lore' | 'voice' | 'gear' | 'relationships'>('visuals');

  // Core identifiers
  const [name, setName] = useState(character?.name || '');
  const [role, setRole] = useState<string>(character?.role || 'protagonist');
  const [isCustomRole, setIsCustomRole] = useState(
    character?.role ? !ROLE_PRESETS.some((r) => r.id === character.role) : false
  );
  const [gender, setGender] = useState<string>(character?.gender || 'female');
  const [isCustomGender, setIsCustomGender] = useState(
    character?.gender ? !GENDER_PRESETS.some((g) => g.id === character.gender) : false
  );
  const [avatarEmoji, setAvatarEmoji] = useState(character?.avatarEmoji || '⚡');

  // Visual Anchors
  const [appearance, setAppearance] = useState(character?.appearance || '');
  const [wardrobe, setWardrobe] = useState(character?.wardrobe || '');
  const [iconicItem, setIconicItem] = useState(character?.iconicItem || '');

  // Lore & Psychology
  const [backstory, setBackstory] = useState(character?.backstory || character?.description || '');
  const [motivation, setMotivation] = useState(character?.motivation || '');
  const [flaws, setFlaws] = useState(character?.flaws || '');
  const [secret, setSecret] = useState(character?.secret || '');

  // Voice & Personality
  const [voiceTone, setVoiceTone] = useState(character?.voiceTone || '');
  const [personality, setPersonality] = useState(character?.personality || '');
  const [catchphrase, setCatchphrase] = useState(character?.catchphrase || '');
  const [traits, setTraits] = useState<string[]>(character?.traits || []);
  const [newTraitInput, setNewTraitInput] = useState('');

  // Powers & Gear
  const [abilities, setAbilities] = useState(character?.abilities || '');
  const [gear, setGear] = useState(character?.gear || '');

  // Relationships
  const [relationships, setRelationships] = useState<CharacterRelationship[]>(
    character?.relationships || []
  );

  // AI expansion state
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandNotice, setExpandNotice] = useState<string | null>(null);

  // Reset when character prop changes
  React.useEffect(() => {
    if (character) {
      setName(character.name || '');
      setRole(character.role || 'protagonist');
      setIsCustomRole(!ROLE_PRESETS.some((r) => r.id === character.role));
      setGender(character.gender || 'female');
      setIsCustomGender(!GENDER_PRESETS.some((g) => g.id === character.gender));
      setAvatarEmoji(character.avatarEmoji || '⚡');
      setAppearance(character.appearance || '');
      setWardrobe(character.wardrobe || '');
      setIconicItem(character.iconicItem || '');
      setBackstory(character.backstory || character.description || '');
      setMotivation(character.motivation || '');
      setFlaws(character.flaws || '');
      setSecret(character.secret || '');
      setVoiceTone(character.voiceTone || '');
      setPersonality(character.personality || '');
      setCatchphrase(character.catchphrase || '');
      setTraits(character.traits || []);
      setAbilities(character.abilities || '');
      setGear(character.gear || '');
      setRelationships(character.relationships || []);
    } else {
      setName('');
      setRole('sidekick');
      setIsCustomRole(false);
      setGender('female');
      setIsCustomGender(false);
      setAvatarEmoji('⚡');
      setAppearance('');
      setWardrobe('');
      setIconicItem('');
      setBackstory('');
      setMotivation('');
      setFlaws('');
      setSecret('');
      setVoiceTone('');
      setPersonality('');
      setCatchphrase('');
      setTraits([]);
      setAbilities('');
      setGear('');
      setRelationships([]);
    }
  }, [character, isOpen]);

  if (!isOpen) return null;

  const otherCharacters = world.characters.filter(
    (c) => c.name.toLowerCase() !== name.toLowerCase() && c.id !== character?.id
  );

  const handleToggleTrait = (trait: string) => {
    setTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  const handleAddCustomTrait = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraitInput.trim()) return;
    if (!traits.includes(newTraitInput.trim())) {
      setTraits([...traits, newTraitInput.trim()]);
    }
    setNewTraitInput('');
  };

  const handleUpdateRelationship = (
    targetName: string,
    relationType: string,
    dynamicDescription: string
  ) => {
    setRelationships((prev) => {
      const filtered = prev.filter((r) => r.targetCharacterName !== targetName);
      if (!dynamicDescription.trim() && !relationType) return filtered;
      return [
        ...filtered,
        {
          targetCharacterName: targetName,
          relationType: (relationType || 'ally') as any,
          dynamicDescription: dynamicDescription.trim(),
        },
      ];
    });
  };

  const handleFleshOutWithAi = async () => {
    if (!name.trim()) return;
    setIsExpanding(true);
    setExpandNotice(null);

    try {
      const res = await fetch('/api/expand-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: {
            name: name.trim(),
            role,
            gender,
            appearance,
            personality,
            wardrobe,
            iconicItem,
            backstory,
            motivation,
            flaws,
            secret,
            abilities,
            gear,
            voiceTone,
            catchphrase,
          },
          worldTitle: world.title,
          genre: world.genre,
          existingCharacters: world.characters.map((c) => c.name),
          apiKey: apiConfig?.apiKey,
          baseUrl: apiConfig?.baseUrl,
          provider: apiConfig?.provider,
        }),
      });

      if (!res.ok) throw new Error('Expansion call failed');
      const data = await res.json();

      if (data.appearance && !appearance) setAppearance(data.appearance);
      if (data.wardrobe && !wardrobe) setWardrobe(data.wardrobe);
      if (data.iconicItem && !iconicItem) setIconicItem(data.iconicItem);
      if (data.backstory && !backstory) setBackstory(data.backstory);
      if (data.motivation && !motivation) setMotivation(data.motivation);
      if (data.flaws && !flaws) setFlaws(data.flaws);
      if (data.secret && !secret) setSecret(data.secret);
      if (data.abilities && !abilities) setAbilities(data.abilities);
      if (data.gear && !gear) setGear(data.gear);
      if (data.voiceTone && !voiceTone) setVoiceTone(data.voiceTone);
      if (data.catchphrase && !catchphrase) setCatchphrase(data.catchphrase);

      if (data.suggestedRelationships && relationships.length === 0) {
        setRelationships(data.suggestedRelationships);
      }

      setExpandNotice(`Fleshed out with ${data.provider || 'Meta AI'}!`);
      setTimeout(() => setExpandNotice(null), 3500);
    } catch (e) {
      console.error(e);
      setExpandNotice('Could not reach AI, using heuristic suggestions.');
    } finally {
      setIsExpanding(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedChar: ComicCharacter = {
      id: character?.id || `char-${Date.now()}`,
      name: name.trim(),
      role: role as any,
      gender: gender as any,
      avatarEmoji,
      appearance: appearance.trim(),
      wardrobe: wardrobe.trim(),
      iconicItem: iconicItem.trim(),
      description: backstory.trim() || `${name} plays the ${role} in ${world.title}.`,
      backstory: backstory.trim(),
      motivation: motivation.trim(),
      flaws: flaws.trim(),
      secret: secret.trim(),
      voiceTone: voiceTone.trim(),
      personality: personality.trim(),
      catchphrase: catchphrase.trim(),
      traits,
      abilities: abilities.trim(),
      gear: gear.trim(),
      relationships,
    };

    onSaveCharacter(updatedChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border-2 border-zinc-950 rounded-3xl shadow-2xl overflow-hidden text-zinc-900 my-auto max-h-[92vh] flex flex-col">
        
        {/* =====================================================================
            TOP TITLE BAR
        ===================================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] bg-zinc-50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center text-xl shadow-xs">
              {avatarEmoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-zinc-950">
                  {name ? `@${name}'s Dossier` : 'New Character Studio'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-700 uppercase">
                  {role}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Visual continuity anchors & deep-dive canon for {world.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Click Meta AI Character Flesh-Out Button */}
            <button
              type="button"
              onClick={handleFleshOutWithAi}
              disabled={!name.trim() || isExpanding}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              title="Auto-flesh out backstory, flaws, wardrobe, and ties using Meta AI"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isExpanding ? 'animate-spin' : ''}`} />
              <span>{isExpanding ? 'Fleshing Out...' : 'Flesh Out with Meta AI'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.05] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {expandNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{expandNotice}</span>
          </div>
        )}

        {/* =====================================================================
            HEADER IDENTIFIER STRIP (NAME, ROLE, GENDER, EMOJI)
        ===================================================================== */}
        <div className="px-6 py-4 bg-zinc-100/70 border-b border-black/[0.06] shrink-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Avatar Emoji Selector */}
            <div className="sm:col-span-2 flex items-center gap-2">
              <div className="relative group">
                <input
                  type="text"
                  value={avatarEmoji}
                  onChange={(e) => setAvatarEmoji(e.target.value.slice(0, 2))}
                  className="w-12 h-12 text-2xl text-center rounded-2xl bg-white border-2 border-zinc-950 font-bold outline-none shadow-xs"
                  title="Type any emoji"
                />
              </div>
              <div className="flex flex-wrap gap-1 max-w-[80px]">
                {EMOJI_PRESETS.slice(0, 6).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setAvatarEmoji(em)}
                    className="w-5 h-5 text-xs hover:scale-125 transition-transform cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Character Name */}
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Character Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kaelen Vex, Dr. Aris"
                className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl font-bold text-sm text-zinc-900 outline-none focus:border-zinc-950"
                required
              />
            </div>

            {/* Role Selector */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Narrative Role
              </label>
              {!isCustomRole ? (
                <select
                  value={role}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomRole(true);
                      setRole('');
                    } else {
                      setRole(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-zinc-950"
                >
                  {ROLE_PRESETS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                  <option value="__custom__">✨ Custom Role...</option>
                </select>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Rogue Detective"
                    className="flex-1 px-3 py-2 bg-white border border-black/15 rounded-xl text-xs font-bold text-zinc-900 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomRole(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-700 text-xs"
                    title="Return to preset roles"
                  >
                    ↺
                  </button>
                </div>
              )}
            </div>

            {/* Form / Gender Selector */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Identity / Form
              </label>
              {!isCustomGender ? (
                <select
                  value={gender}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomGender(true);
                      setGender('');
                    } else {
                      setGender(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-zinc-950"
                >
                  {GENDER_PRESETS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                  <option value="__custom__">✨ Custom Entity...</option>
                </select>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    placeholder="e.g. Sentient Android"
                    className="flex-1 px-3 py-2 bg-white border border-black/15 rounded-xl text-xs font-bold text-zinc-900 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomGender(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-700 text-xs"
                    title="Return to preset identities"
                  >
                    ↺
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================================
            STUDIO TABS NAVIGATION
        ===================================================================== */}
        <div className="px-6 pt-2 border-b border-black/[0.08] bg-white flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'visuals', label: '🎨 Visuals & Wardrobe', icon: Palette },
            { id: 'lore', label: '🧠 Psychology & Lore', icon: Brain },
            { id: 'voice', label: '💬 Voice & Dialogue', icon: MessageSquare },
            { id: 'gear', label: '⚡ Powers & Gear', icon: Zap },
            { id: 'relationships', label: `👥 Cast Ties (${relationships.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'border-zinc-950 text-zinc-950 bg-zinc-50/50 rounded-t-lg'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =====================================================================
            TAB PANELS CONTENT (SCROLLABLE BODY)
        ===================================================================== */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: VISUALS & WARDROBE ANCHORS */}
          {activeTab === 'visuals' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                <span className="text-xl">🎨</span>
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-bold block text-amber-950">AI Visual Continuity Anchors:</strong>
                  These details are embedded directly into every Meta Muse Image generation prompt so @{name || 'Character'} maintains identical clothing, hair, and silhouette across every episode!
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center justify-between">
                  <span>Physical Appearance (Face, Hair, Build)</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Image Anchor</span>
                </label>
                <textarea
                  rows={2}
                  value={appearance}
                  onChange={(e) => setAppearance(e.target.value)}
                  placeholder="e.g. Angular jawline, observant amber eyes, messy cropped silver hair, lean athletic build with an alert posture."
                  className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                    Signature Wardrobe & Color Palette
                  </label>
                  <textarea
                    rows={2}
                    value={wardrobe}
                    onChange={(e) => setWardrobe(e.target.value)}
                    placeholder="e.g. Faded charcoal trench coat with roll-up sleeves over an indigo combat tunic and reinforced knee-boots."
                    className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                    <span>Iconic Accessory / Silhouette Item</span>
                    <span className="text-[10px] text-purple-600 font-mono">(Key Prop)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={iconicItem}
                    onChange={(e) => setIconicItem(e.target.value)}
                    placeholder="e.g. Cracked holographic wrist-chronometer, chipped mechanical katana, glowing neon cyber-goggles."
                    className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                  />
                </div>
              </div>

              {/* Live Meta Image Prompt Fragment Preview */}
              <div className="p-3.5 bg-zinc-900 text-zinc-200 rounded-xl font-mono text-[11px] space-y-1">
                <span className="text-zinc-500 uppercase text-[9px] tracking-wider block">
                  Meta Muse Image Injected Continuity Token:
                </span>
                <p className="text-emerald-400">
                  {name || 'Hero'} ({role}): {appearance || 'Expressive look'}, wearing {wardrobe || 'signature attire'} with {iconicItem || 'distinctive accessories'}.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PSYCHOLOGY & LORE */}
          {activeTab === 'lore' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                  Origin & Formative Backstory
                </label>
                <textarea
                  rows={3}
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder={`Who was @${name || 'this character'} before the story began? What formative event shaped their worldview?`}
                  className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                    <span>Core Motivation / Driving Desire</span>
                    <span className="text-[10px] text-blue-600 font-mono">What they want</span>
                  </label>
                  <textarea
                    rows={2}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="e.g. To redeem their family's name before the syndicate annexes their sector."
                    className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                    <span>Fatal Flaw / Psychological Blindspot</span>
                    <span className="text-[10px] text-amber-600 font-mono">What trips them up</span>
                  </label>
                  <textarea
                    rows={2}
                    value={flaws}
                    onChange={(e) => setFlaws(e.target.value)}
                    placeholder="e.g. Paralyzing fear of failure; refuses to delegate until it's too late."
                    className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                  <span>Classified Secret / Hidden Truth</span>
                  <span className="text-[10px] text-purple-600 font-mono">(Plot Twist Fuel)</span>
                </label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="e.g. Possesses the only encryption key capable of deactivating the city shield."
                  className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                />
              </div>
            </div>
          )}

          {/* TAB 3: VOICE & DIALOGUE */}
          {activeTab === 'voice' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                    Dialogue Cadence & Voice Tone
                  </label>
                  <input
                    type="text"
                    value={voiceTone}
                    onChange={(e) => setVoiceTone(e.target.value)}
                    placeholder="e.g. Fast-paced technical jargon, understated dry sarcasm, poetic riddles"
                    className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                    Signature Catchphrase or Motto
                  </label>
                  <input
                    type="text"
                    value={catchphrase}
                    onChange={(e) => setCatchphrase(e.target.value)}
                    placeholder='e.g. "The law bends when survival is on the line."'
                    className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors font-serif italic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                  Personality Summary
                </label>
                <textarea
                  rows={2}
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="e.g. Fiercely loyal, skeptical of authority, keeps emotion tightly under wraps."
                  className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                />
              </div>

              {/* Character Traits Tags */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-2">
                  Personality & Archetype Traits
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {TRAIT_SUGGESTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToggleTrait(t)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                        traits.includes(t)
                          ? 'bg-zinc-950 text-white font-bold'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTraitInput}
                    onChange={(e) => setNewTraitInput(e.target.value)}
                    placeholder="Add custom trait..."
                    className="px-3 py-1.5 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none flex-1 max-w-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTrait(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTrait}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-800 cursor-pointer"
                  >
                    + Add Trait
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POWERS & GEAR */}
          {activeTab === 'gear' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                  Special Abilities, Powers or Combat Style
                </label>
                <textarea
                  rows={2}
                  value={abilities}
                  onChange={(e) => setAbilities(e.target.value)}
                  placeholder="e.g. Master deducer, kinetic shockwave generation, rapid parkour, drone pilot."
                  className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                  Signature Gear, Weapons & Technology
                </label>
                <textarea
                  rows={2}
                  value={gear}
                  onChange={(e) => setGear(e.target.value)}
                  placeholder="e.g. Electromagnetic grapple launcher, custom suppressed plasma sidearm, encrypted field datapad."
                  className="w-full p-3 bg-zinc-50 border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:bg-white focus:border-zinc-950 transition-colors"
                />
              </div>
            </div>
          )}

          {/* TAB 5: CAST RELATIONSHIPS */}
          {activeTab === 'relationships' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-purple-50 border border-purple-200/80 rounded-2xl flex items-start gap-3">
                <span className="text-xl">👥</span>
                <div className="text-xs text-purple-950 leading-relaxed">
                  <strong className="font-bold block">Interpersonal Cast Dynamics:</strong>
                  Define how @{name || 'Character'} interacts with the other members of {world.title}. These friction points and loyalties fuel Meta AI dialogue and conflict!
                </div>
              </div>

              {otherCharacters.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  No other characters exist in this world yet. Add more characters to establish relationship ties!
                </div>
              ) : (
                <div className="space-y-3">
                  {otherCharacters.map((other) => {
                    const existingRel = relationships.find(
                      (r) => r.targetCharacterName === other.name
                    );

                    return (
                      <div
                        key={other.id}
                        className="p-4 bg-zinc-50 border border-black/[0.08] rounded-2xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{other.avatarEmoji}</span>
                            <span className="font-bold text-sm text-zinc-900">@{other.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 uppercase">
                              {other.role}
                            </span>
                          </div>

                          <select
                            value={existingRel?.relationType || 'ally'}
                            onChange={(e) =>
                              handleUpdateRelationship(
                                other.name,
                                e.target.value,
                                existingRel?.dynamicDescription || ''
                              )
                            }
                            className="px-2.5 py-1 bg-white border border-black/15 rounded-lg text-xs font-bold text-zinc-900 outline-none"
                          >
                            <option value="ally">🤝 Ally / Partner</option>
                            <option value="rival">⚔️ Rival / Competitor</option>
                            <option value="mentor">🧙 Mentor / Guide</option>
                            <option value="nemesis">💀 Nemesis / Arch-Enemy</option>
                            <option value="frenemy">🎭 Frenemy</option>
                            <option value="family">🧬 Family / Kin</option>
                            <option value="romantic">❤️ Romantic Tension</option>
                            <option value="subordinate">💼 Superior / Subordinate</option>
                          </select>
                        </div>

                        <input
                          type="text"
                          value={existingRel?.dynamicDescription || ''}
                          onChange={(e) =>
                            handleUpdateRelationship(
                              other.name,
                              existingRel?.relationType || 'ally',
                              e.target.value
                            )
                          }
                          placeholder={`Dynamic with @${other.name} (e.g. Loyal friend, but secretly resents their impulsive decisions)...`}
                          className="w-full p-2.5 bg-white border border-black/10 rounded-xl text-xs text-zinc-900 outline-none focus:border-zinc-950"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              MODAL FOOTER ACTIONS
          ===================================================================== */}
          <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between gap-3 shrink-0">
            {isEditing && onDeleteCharacter ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to remove @${name} from the cast?`)) {
                    onDeleteCharacter(character!.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Character</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!name.trim()}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-blue-600 text-white shadow-md transition-all cursor-pointer disabled:opacity-40"
              >
                {isEditing ? 'Save Dossier' : 'Add to Universe Cast'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
