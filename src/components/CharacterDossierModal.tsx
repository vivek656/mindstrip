'use client';

import React, { useState } from 'react';
import { ComicCharacter, ComicWorld, CharacterRelationship, CharacterReferenceImage } from '@/types/comic';
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
  Tag,
  Lock,
  Unlock,
  ExternalLink,
  Maximize2,
  Layers,
  AlertCircle,
  CheckCircle2,
  Camera,
  Image as ImageIcon
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

export const VIEW_TYPE_OPTIONS: {
  id: 'model_sheet' | 'portrait' | 'full_body' | 'back_view' | 'action_pose';
  label: string;
  icon: string;
  desc: string;
  aspect: string;
}[] = [
  {
    id: 'model_sheet',
    label: 'Model Sheet',
    icon: '📋',
    desc: 'Multi-angle lineup (Front, 3/4 & side profile turnaround)',
    aspect: '16:9',
  },
  {
    id: 'portrait',
    label: 'Face / Portrait',
    icon: '👤',
    desc: 'Close-up bust: facial features, eye color, expression & hair',
    aspect: '1:1',
  },
  {
    id: 'full_body',
    label: 'Full-Body Concept',
    icon: '🧍',
    desc: 'Head-to-toe standing: torso, legs, boots & outfit silhouette',
    aspect: '3:4',
  },
  {
    id: 'back_view',
    label: 'Back Turnaround',
    icon: '🔄',
    desc: 'Turnaround rear: silhouette from behind, back of hair & coat',
    aspect: '3:4',
  },
  {
    id: 'action_pose',
    label: 'Action Stance',
    icon: '⚔️',
    desc: 'Dynamic heroic combat posture with signature gear/weapon',
    aspect: '3:4',
  },
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

  // Character Visual Model Sheet & Reference Studio State (Character Visual RAG)
  const [lockedImageUrl, setLockedImageUrl] = useState<string>(
    character?.imageUrl || character?.characterSheetUrl || ''
  );
  const [referenceImages, setReferenceImages] = useState<CharacterReferenceImage[]>(
    character?.referenceImages || []
  );
  const [selectedViewType, setSelectedViewType] = useState<
    'model_sheet' | 'portrait' | 'full_body' | 'back_view' | 'action_pose'
  >('model_sheet');
  const [customViewPrompt, setCustomViewPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatingViewType, setGeneratingViewType] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

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

      const initialUrl = character.imageUrl || character.characterSheetUrl || '';
      setLockedImageUrl(initialUrl);

      if (character.referenceImages && character.referenceImages.length > 0) {
        setReferenceImages(character.referenceImages);
      } else if (initialUrl) {
        setReferenceImages([
          {
            id: `ref-initial-${character.id}`,
            viewType: 'model_sheet',
            label: 'Canonical Model Sheet',
            imageUrl: initialUrl,
            prompt: `${character.name} visual reference`,
            createdAt: new Date().toISOString(),
            isLockedCanon: true,
          },
        ]);
      } else {
        setReferenceImages([]);
      }
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
      setLockedImageUrl('');
      setReferenceImages([]);
      setCustomViewPrompt('');
      setGenerationError(null);
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

  const handleLockAsCanon = (imgUrl: string) => {
    setLockedImageUrl(imgUrl);
    setReferenceImages((prev) =>
      prev.map((r) => ({
        ...r,
        isLockedCanon: r.imageUrl === imgUrl,
      }))
    );
  };

  const handleDeleteReference = (refId: string) => {
    const target = referenceImages.find((r) => r.id === refId);
    if (target && target.imageUrl === lockedImageUrl) {
      setLockedImageUrl('');
    }
    setReferenceImages((prev) => prev.filter((r) => r.id !== refId));
  };

  const handleAddManualImage = () => {
    if (!manualUrlInput.trim()) return;
    const viewOpt = VIEW_TYPE_OPTIONS.find((v) => v.id === selectedViewType);
    const newRef: CharacterReferenceImage = {
      id: `ref-manual-${Date.now()}`,
      viewType: selectedViewType,
      label: `Custom ${viewOpt?.label || selectedViewType}`,
      imageUrl: manualUrlInput.trim(),
      prompt: 'Custom user provided reference',
      createdAt: new Date().toISOString(),
      isLockedCanon: !lockedImageUrl,
    };
    setReferenceImages((prev) => [newRef, ...prev]);
    if (!lockedImageUrl) {
      setLockedImageUrl(manualUrlInput.trim());
    }
    setManualUrlInput('');
    setShowUrlInput(false);
  };

  const handleGenerateCharacterArt = async (
    viewType: 'model_sheet' | 'portrait' | 'full_body' | 'back_view' | 'action_pose'
  ) => {
    if (!name.trim()) {
      alert('Please enter a character name before generating concept art.');
      return;
    }
    setIsGeneratingImage(true);
    setGeneratingViewType(viewType);
    setGenerationError(null);

    try {
      const res = await fetch('/api/generate-character-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: name.trim(),
          role,
          gender,
          appearance,
          wardrobe,
          iconicItem,
          viewType,
          customPrompt: customViewPrompt.trim() || undefined,
          artStyle: world.artStyle || 'webcomic',
          apiKey: apiConfig?.apiKey,
          baseUrl: apiConfig?.baseUrl,
          provider: apiConfig?.provider,
          imageModel: world.imageModel || (apiConfig?.provider === 'fireworks' ? 'flux-1-schnell' : 'muse-image-1.0'),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.imageUrl) {
        throw new Error('No image URL returned by the generation engine');
      }

      const viewOpt = VIEW_TYPE_OPTIONS.find((v) => v.id === viewType);
      const newRef: CharacterReferenceImage = {
        id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        viewType,
        label: viewOpt?.label || viewType,
        imageUrl: data.imageUrl,
        prompt: data.prompt || `${name} (${viewType})`,
        createdAt: new Date().toISOString(),
        isLockedCanon: !lockedImageUrl, // auto-lock first generated if none locked
      };

      setReferenceImages((prev) => [newRef, ...prev]);

      if (!lockedImageUrl) {
        setLockedImageUrl(data.imageUrl);
      }
    } catch (err: any) {
      console.error('Character concept art generation error:', err);
      setGenerationError(err.message || 'Failed to generate character concept art');
    } finally {
      setIsGeneratingImage(false);
      setGeneratingViewType(null);
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
      imageUrl: lockedImageUrl || undefined,
      characterSheetUrl: lockedImageUrl || undefined,
      referenceImages: referenceImages.map((ref) => ({
        ...ref,
        isLockedCanon: ref.imageUrl === lockedImageUrl,
      })),
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
            <div className="relative">
              <span className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center text-xl shadow-xs overflow-hidden">
                {lockedImageUrl ? (
                  <img src={lockedImageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  avatarEmoji
                )}
              </span>
              {lockedImageUrl && (
                <span
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"
                  title="Canonical reference locked for Character Visual RAG"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-zinc-950">
                  {name ? `@${name}'s Dossier` : 'New Character Studio'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-700 uppercase">
                  {role}
                </span>
                {lockedImageUrl && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>CANON ART</span>
                  </span>
                )}
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
            {
              id: 'visuals',
              label: `🎨 Visuals & Model Sheet (${referenceImages.length})`,
              icon: Palette,
            },
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
          
          {/* TAB 1: VISUALS, MODEL SHEET & WARDROBE ANCHORS */}
          {activeTab === 'visuals' && (
            <div className="space-y-6 animate-in fade-in duration-150">

              {/* =========================================================================
                  AI CHARACTER VISUAL RAG & MODEL SHEET STUDIO
              ========================================================================= */}
              <div className="bg-gradient-to-br from-indigo-950 via-zinc-900 to-black text-white p-5 rounded-3xl border border-indigo-500/30 shadow-xl space-y-5">
                {/* Studio Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-xl shadow-inner shrink-0">
                      📸
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-white">Character Visual RAG & Model Sheet Studio</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                          Visual Consistency Engine
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Generate individual views (Face, Full-Body, Back, Model Sheet) and lock canonical artwork for zero-drift pipeline consistency.
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  {lockedImageUrl ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 self-start sm:self-auto shrink-0 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Canonical Reference Locked</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 self-start sm:self-auto shrink-0">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>No Reference Locked Yet</span>
                    </div>
                  )}
                </div>

                {/* Active Canonical Reference Showcase (If Locked) */}
                {lockedImageUrl && (
                  <div className="bg-black/50 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group rounded-xl overflow-hidden border border-white/15 shadow-lg bg-zinc-950 shrink-0 w-32 h-32 flex items-center justify-center">
                      <img
                        src={lockedImageUrl}
                        alt={`Canonical model sheet for ${name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setPreviewImageModal(lockedImageUrl)}
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewImageModal(lockedImageUrl)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                        title="Inspect full resolution"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-600 text-white flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          ACTIVE CANONICAL SHEET
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Character Visual RAG Active
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Every episode featuring <strong className="text-white">@{name || 'this character'}</strong> will condition on this exact visual reference, preserving facial bone structure, wardrobe, and silhouette.
                      </p>
                      <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => setPreviewImageModal(lockedImageUrl)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Full-Res</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLockedImageUrl('')}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock Canon</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Selection Buttons */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span>1. Select Reference Angle / View Type:</span>
                    </label>
                    <span className="text-[10px] text-indigo-400">
                      Click view to generate individual angle
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {VIEW_TYPE_OPTIONS.map((opt) => {
                      const isSelected = selectedViewType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedViewType(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm ring-1 ring-indigo-400'
                              : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-lg">{opt.icon}</span>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase">{opt.aspect}</span>
                          </div>
                          <div className="font-bold text-xs leading-snug">{opt.label}</div>
                          <div className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-tight">{opt.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional Custom View Directive Prompt */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase">
                        Optional Prompt Refinements:
                      </label>
                      <span className="text-[10px] text-zinc-500">
                        Auto-augmented with Appearance + Wardrobe
                      </span>
                    </div>
                    <input
                      type="text"
                      value={customViewPrompt}
                      onChange={(e) => setCustomViewPrompt(e.target.value)}
                      placeholder="e.g. Amber glowing eyes, intense focused gaze, high-collared trench coat..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-400"
                    />
                  </div>

                  {/* Error Notification */}
                  {generationError && (
                    <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{generationError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGenerationError(null)}
                        className="text-red-400 hover:text-white text-xs underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Generation Actions Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Instant Preview Engine (Hosted permanently on Vercel Blob CDN)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition-colors cursor-pointer"
                      >
                        {showUrlInput ? 'Hide URL Input' : 'Paste Direct URL...'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGenerateCharacterArt(selectedViewType)}
                        disabled={!name.trim() || isGeneratingImage}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                      >
                        <Sparkles className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                        <span>
                          {isGeneratingImage
                            ? `Generating ${selectedViewType.replace('_', ' ')}...`
                            : `✨ Generate ${VIEW_TYPE_OPTIONS.find((v) => v.id === selectedViewType)?.label || 'View'}`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Direct Image URL input */}
                  {showUrlInput && (
                    <div className="p-3 bg-black/50 border border-white/10 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                      <input
                        type="text"
                        value={manualUrlInput}
                        onChange={(e) => setManualUrlInput(e.target.value)}
                        placeholder="https://... (direct image URL to character artwork)"
                        className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualImage}
                        disabled={!manualUrlInput.trim()}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        Add to Gallery
                      </button>
                    </div>
                  )}
                </div>

                {/* Concept Gallery & Angle Lineup */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-bold text-xs text-white">
                        Concept Gallery & Multi-Angle Lineup ({referenceImages.length})
                      </h4>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Click 'Lock Canon' on any view to set as active pipeline reference
                    </span>
                  </div>

                  {referenceImages.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                      No character reference angles generated yet. Click "Generate Artwork" above to create face, full-body, back, or model sheet views!
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {referenceImages.map((ref) => {
                        const isCanon = lockedImageUrl === ref.imageUrl;
                        return (
                          <div
                            key={ref.id}
                            className={`group relative rounded-2xl overflow-hidden border transition-all flex flex-col justify-between bg-zinc-950 ${
                              isCanon
                                ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            {/* Image Preview */}
                            <div className="relative aspect-square w-full overflow-hidden bg-black flex items-center justify-center">
                              <img
                                src={ref.imageUrl}
                                alt={ref.label || ref.viewType}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* View Type Badge */}
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/75 backdrop-blur-xs text-white uppercase border border-white/10">
                                {ref.viewType?.replace('_', ' ') || 'view'}
                              </div>

                              {/* Canon Badge */}
                              {isCanon && (
                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                                  <Check className="w-3 h-3" />
                                  CANON
                                </div>
                              )}

                              {/* Hover overlay actions */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImageModal(ref.imageUrl)}
                                  className="p-2 rounded-xl bg-white/20 hover:bg-white text-zinc-900 transition-colors cursor-pointer"
                                  title="Zoom full image"
                                >
                                  <Maximize2 className="w-4 h-4 text-white hover:text-zinc-950" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReference(ref.id)}
                                  className="p-2 rounded-xl bg-red-600/30 hover:bg-red-600 text-white transition-colors cursor-pointer"
                                  title="Remove from gallery"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Card Footer: Lock as Canon Button */}
                            <div className="p-2 bg-zinc-900/90 border-t border-white/10 flex items-center justify-between gap-1">
                              <span className="text-[10px] text-zinc-400 truncate max-w-[90px]">
                                {ref.label || ref.viewType}
                              </span>

                              {isCanon ? (
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  Locked
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleLockAsCanon(ref.imageUrl)}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-emerald-600 hover:text-white text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Lock as canonical reference for Character Visual RAG"
                                >
                                  <Lock className="w-3 h-3" />
                                  Lock Canon
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Physical Appearance, Wardrobe & Iconic Item Details */}
              <div className="space-y-4 pt-2">
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

      {/* =========================================================================
          FULL-RESOLUTION CHARACTER ARTWORK INSPECTOR MODAL
      ========================================================================= */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-zinc-950 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">@{name} — Visual Concept Inspection</span>
                {lockedImageUrl === previewImageModal && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active Canon Model Sheet
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {lockedImageUrl !== previewImageModal && (
                  <button
                    type="button"
                    onClick={() => {
                      handleLockAsCanon(previewImageModal);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock as Canonical Reference</span>
                  </button>
                )}
                <a
                  href={previewImageModal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Open original image link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImageModal(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60">
              <img
                src={previewImageModal}
                alt="Character full inspection"
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
