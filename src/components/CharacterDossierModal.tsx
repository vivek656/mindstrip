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
  Image as ImageIcon,
  Target,
  Briefcase
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

const EMOJI_PRESETS = ['⚡', '🕵️', '🔥', '🛡️', '🧠', '🗡️', '🤖', '👑', '🌌', '💥', '🐺', '🌙', '💀', '🎯', '🚀', '🥷', '☕', '🎨', '📷', '🎸', '📖'];

const ROLE_PRESETS: { id: ComicCharacter['role']; label: string; desc: string }[] = [
  { id: 'protagonist', label: 'Protagonist', desc: 'Central character driving the story' },
  { id: 'sidekick', label: 'Ally / Partner / Friend', desc: 'Trusted companion, best friend, or partner' },
  { id: 'antagonist', label: 'Antagonist / Rival', desc: 'Foil, opponent, rival, or competing force' },
  { id: 'supporting', label: 'Supporting Cast', desc: 'Family, mentor, coworker, or acquaintance' },
];

export type GearLensId = 'slice-of-life' | 'detective' | 'scifi' | 'fantasy' | 'action';

export interface GenreLensContent {
  id: GearLensId;
  label: string;
  icon: string;
  skillLabel: string;
  skillHelper: string;
  skillPlaceholder: string;
  skillPills: string[];
  itemLabel: string;
  itemHelper: string;
  itemPlaceholder: string;
  itemPills: string[];
}

export const GENRE_LENSES: GenreLensContent[] = [
  {
    id: 'slice-of-life',
    label: '☕ Slice of Life & Daily',
    icon: '☕',
    skillLabel: 'Profession, Talents & Everyday Skills',
    skillHelper: 'What is their trade, job, specialty, or passion? (e.g. barista craft, programming, illustration, athletics)',
    skillPlaceholder: 'e.g. Specialty coffee barista, keen graphic illustrator, empathetic active listener, amateur marathon runner.',
    skillPills: ['☕ Specialty Barista', '💻 Full-Stack Dev', '🎨 Freelance Illustrator', '🎸 Acoustic Songwriter', '🍳 Gourmet Home Chef', '🩺 Resident Doctor', '📚 Rare Book Archivist', '🏃 Marathon Runner'],
    itemLabel: 'Personal Belongings, Carried Items & Tools',
    itemHelper: 'Signature everyday items they always carry (e.g. messenger bag, vintage camera, thermos, sketchbook)',
    itemPlaceholder: 'e.g. Vintage 35mm film camera, beat-up leather messenger bag, thermal travel mug, dog-eared moleskine sketchbook with fountain pens.',
    itemPills: ['📷 Vintage 35mm Camera', '🎒 Leather Messenger Bag', '☕ Thermal Coffee Tumbler', '📓 Moleskine Sketchbook', '📱 Dual-SIM Smartphone', '🚲 Fixed-Gear Bicycle', '🎧 Studio Headphones', '🕶️ Tortoiseshell Glasses'],
  },
  {
    id: 'detective',
    label: '🕵️ Mystery & Detective',
    icon: '🕵️',
    skillLabel: 'Investigative Skills, Tradecraft & Deduction',
    skillHelper: 'How they uncover secrets or solve mysteries (e.g. forensic observation, interrogation, lockpicking, memory)',
    skillPlaceholder: 'e.g. Photographic recall, forensic crime scene analysis, subtle micro-expression polygraph reading, lockpicking.',
    skillPills: ['🔍 Forensic Analysis', '🗝️ Master Lockpicker', '🧠 Photographic Memory', '🎙️ Interrogation Specialist', '🥋 Close-Quarters Disarm', '🚗 Tactical Getaway Driver'],
    itemLabel: 'Detective Field Equipment & Key Tools',
    itemHelper: 'Investigation kit, surveillance tools, recorders, or carried gear',
    itemPlaceholder: 'e.g. Audio bug frequency scanner, brass zippo lighter, pocket magnifying loupe, encrypted satellite burner phone.',
    itemPills: ['📡 Frequency Bug Scanner', '🕵️ Tailored Trenchcoat', '🔦 UV Blacklight Pen', '📱 Encrypted Burner Phone', '🧤 Kevlar Field Gloves', '📷 Telephoto Spycam'],
  },
  {
    id: 'scifi',
    label: '🚀 Sci-Fi & Cyberpunk',
    icon: '🚀',
    skillLabel: 'Technical Specialties, Cyberware & Disciplines',
    skillHelper: 'Hacking, piloting, cybernetic augmentation, or scientific expertise',
    skillPlaceholder: 'e.g. Sub-neural ICE breaker, zero-G orbital navigation, cybernetic reaction reflex booster, drone piloting.',
    skillPills: ['💾 Neural ICE Breaker', '🚀 Zero-G Pilot', '👁️ Optical Cyber-HUD', '⚡ Kinetic Reflex Booster', '🦾 Bionic Prosthetic Arm', '🤖 Micro-Drone Commander'],
    itemLabel: 'High-Tech Hardware, Cyberdecks & Implants',
    itemHelper: 'Portable hardware, cybernetic decks, and exotic energy tools',
    itemPlaceholder: 'e.g. Portable sub-ether cyberdeck with optical tap, monomolecular cutting wire, personal EMP dampener.',
    itemPills: ['💻 Cyberdeck Terminal', '🕶️ Augmented HUD Shades', '🔋 Plasma Torch Cutter', '🦿 Anti-Grav Boots', '🛡️ EMP Personal Field', '🛸 Micro-Recon Drone'],
  },
  {
    id: 'fantasy',
    label: '🪄 Fantasy & Supernatural',
    icon: '🪄',
    skillLabel: 'Magic Disciplines, Spells & Martial Arts',
    skillHelper: 'Arcane schools, divine gifts, alchemy, or blade mastery',
    skillPlaceholder: 'e.g. Frost invocation, beast-speech communion, shadow-stepping, apothecary herbalism, dual-rapier dueling.',
    skillPills: ['❄️ Frost Invocation', '🐺 Beast-Speech', '🌑 Shadow-Stepping', '🌿 Apothecary Herbalist', '⚔️ Dual-Blade Master', '✨ Light Manipulation'],
    itemLabel: 'Enchanted Relics, Grimoires & Heirloom Arms',
    itemHelper: 'Spellbooks, enchanted relics, talismans, and heirloom arms',
    itemPlaceholder: 'e.g. Ancient leather-bound grimoire of forgotten wardings, carved rowan-wood wand, Damascus steel hunting blade.',
    itemPills: ['📖 Ancient Grimoire', '🪄 Carved Rowan Wand', '🗡️ Damascus Steel Blade', '🧿 Warding Talisman', '🧪 Satchel of Potions', '🏹 Yew Longbow'],
  },
  {
    id: 'action',
    label: '⚡ Action & Superhero',
    icon: '⚡',
    skillLabel: 'Special Abilities, Powers or Combat Style',
    skillHelper: 'Metahuman powers, superhuman physical feats, or combat mastery',
    skillPlaceholder: 'e.g. Kinetic energy absorption, hypersonic acrobatics, peak-human marksmanship, telekinetic forcefields.',
    skillPills: ['⚡ Kinetic Shockwave', '🛡️ Forcefield Shield', '🏃 Hypersonic Speed', '🎯 Peak Marksmanship', '🦅 Flight & Gliding', '🥋 Krav Maga Mastery'],
    itemLabel: 'Costume Tech, Signature Gadgets & Arms',
    itemHelper: 'Iconic gadgets, tactical suit tech, and signature weapon',
    itemPlaceholder: 'e.g. Electrified collapsible kali batons, carbon-fiber grapple launcher, thermoptic gliding cape.',
    itemPills: ['🦇 Grapple Launcher', '⚡ Shock Batons', '🦹 Armored Nomex Suit', '🪃 Boomerang Darts', '🥽 Night-Vision Cowl', '🛡️ Vibranium Shield'],
  },
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
  id: 'portrait' | 'full_body' | 'back_view' | 'action_pose' | 'model_sheet';
  label: string;
  icon: string;
  desc: string;
  aspect: string;
}[] = [
  {
    id: 'portrait',
    label: 'Face / Portrait',
    icon: '👤',
    desc: 'Close-up bust: facial features, eyes & expression',
    aspect: '1:1',
  },
  {
    id: 'full_body',
    label: 'Full-Body & Legs',
    icon: '🧍',
    desc: 'Head-to-toe: torso, legs, boots & outfit silhouette',
    aspect: '3:4',
  },
  {
    id: 'back_view',
    label: 'Back Turnaround',
    icon: '🔄',
    desc: 'Rear turnaround: coat, hair & silhouette from behind',
    aspect: '3:4',
  },
  {
    id: 'action_pose',
    label: 'Action Stance',
    icon: '⚔️',
    desc: 'Dynamic heroic combat posture with signature gear',
    aspect: '3:4',
  },
  {
    id: 'model_sheet',
    label: 'Model Sheet',
    icon: '📋',
    desc: 'Multi-angle turnaround lineup (Front, 3/4 & side profile)',
    aspect: '16:9',
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

  // Skills & Belongings
  const [abilities, setAbilities] = useState(character?.abilities || '');
  const [gear, setGear] = useState(character?.gear || '');

  const resolveDefaultLens = (): GearLensId => {
    const g = (world.genre || '').toLowerCase();
    if (g.includes('slice') || g.includes('daily') || g.includes('comedy') || g.includes('romance') || g.includes('office') || g.includes('drama')) return 'slice-of-life';
    if (g.includes('detective') || g.includes('mystery') || g.includes('noir') || g.includes('crime') || g.includes('investigat')) return 'detective';
    if (g.includes('cyber') || g.includes('sci-fi') || g.includes('space') || g.includes('tech')) return 'scifi';
    if (g.includes('fantasy') || g.includes('magic') || g.includes('myth') || g.includes('supernatural')) return 'fantasy';
    return 'action';
  };
  const [selectedGearLens, setSelectedGearLens] = useState<GearLensId>(resolveDefaultLens);

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
  const [portraitRefUrl, setPortraitRefUrl] = useState<string>(character?.portraitRefUrl || '');
  const [fullBodyRefUrl, setFullBodyRefUrl] = useState<string>(character?.fullBodyRefUrl || '');
  const [backViewRefUrl, setBackViewRefUrl] = useState<string>(character?.backViewRefUrl || '');
  const [actionPoseRefUrl, setActionPoseRefUrl] = useState<string>(character?.actionPoseRefUrl || '');

  const [selectedViewType, setSelectedViewType] = useState<
    'model_sheet' | 'portrait' | 'full_body' | 'back_view' | 'action_pose'
  >('portrait');
  const [customViewPrompt, setCustomViewPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatingViewType, setGeneratingViewType] = useState<string | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; label: string } | null>(null);
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

      // Automatically filter out any stale pollinations or rate-limited placeholder images
      const isCleanUrl = (u?: string) => Boolean(u && !u.includes('pollinations.ai'));
      const initialUrl = isCleanUrl(character.imageUrl)
        ? character.imageUrl!
        : (isCleanUrl(character.characterSheetUrl) ? character.characterSheetUrl! : '');

      setLockedImageUrl(initialUrl);
      setPortraitRefUrl(isCleanUrl(character.portraitRefUrl) ? character.portraitRefUrl! : '');
      setFullBodyRefUrl(isCleanUrl(character.fullBodyRefUrl) ? character.fullBodyRefUrl! : '');
      setBackViewRefUrl(isCleanUrl(character.backViewRefUrl) ? character.backViewRefUrl! : '');
      setActionPoseRefUrl(isCleanUrl(character.actionPoseRefUrl) ? character.actionPoseRefUrl! : '');

      if (character.referenceImages && character.referenceImages.length > 0) {
        const cleanRefs = character.referenceImages.filter((r) => isCleanUrl(r.imageUrl));
        setReferenceImages(cleanRefs);
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
      setPortraitRefUrl('');
      setFullBodyRefUrl('');
      setBackViewRefUrl('');
      setActionPoseRefUrl('');
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
          provider: apiConfig?.provider === 'fireworks' ? 'fireworks' : 'meta-api',
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
        isLockedCanon: true,
      };

      const updatedRefList = [newRef, ...referenceImages.filter((r) => r.viewType !== viewType)];
      setReferenceImages(updatedRefList);

      let newPortrait = portraitRefUrl;
      let newFullBody = fullBodyRefUrl;
      let newBack = backViewRefUrl;
      let newAction = actionPoseRefUrl;
      let newMaster = lockedImageUrl;

      if (viewType === 'portrait') newPortrait = data.imageUrl;
      if (viewType === 'full_body') newFullBody = data.imageUrl;
      if (viewType === 'back_view') newBack = data.imageUrl;
      if (viewType === 'action_pose') newAction = data.imageUrl;
      if (viewType === 'model_sheet' || !newMaster) newMaster = data.imageUrl;

      setPortraitRefUrl(newPortrait);
      setFullBodyRefUrl(newFullBody);
      setBackViewRefUrl(newBack);
      setActionPoseRefUrl(newAction);
      setLockedImageUrl(newMaster);

      // Instant auto-save to world database & RAG pipeline
      const updatedChar: ComicCharacter = {
        id: character?.id || `char-${Date.now()}`,
        name: name.trim(),
        role: role as any,
        gender: gender as any,
        appearance: appearance.trim(),
        personality: personality.trim(),
        catchphrase: catchphrase.trim() || undefined,
        avatarEmoji: avatarEmoji || '⚡',
        traits,
        wardrobe: wardrobe.trim() || undefined,
        iconicItem: iconicItem.trim() || undefined,
        backstory: backstory.trim() || undefined,
        motivation: motivation.trim() || undefined,
        flaws: flaws.trim() || undefined,
        secret: secret.trim() || undefined,
        abilities: abilities.trim() || undefined,
        gear: gear.trim() || undefined,
        voiceTone: voiceTone.trim() || undefined,
        relationships,
        description: backstory.trim() || `${role} in ${world.title}`,
        imageUrl: newMaster,
        characterSheetUrl: newMaster,
        referenceImages: updatedRefList,
        portraitRefUrl: newPortrait,
        fullBodyRefUrl: newFullBody,
        backViewRefUrl: newBack,
        actionPoseRefUrl: newAction,
        modelSheetRefUrl: newMaster,
      };
      onSaveCharacter(updatedChar);
    } catch (err: any) {
      console.error('Character concept art generation error:', err);
      setGenerationError(err.message || 'Failed to generate character concept art');
    } finally {
      setIsGeneratingImage(false);
      setGeneratingViewType(null);
    }
  };

  const handleToggleAngleLock = (
    viewType: 'model_sheet' | 'portrait' | 'full_body' | 'back_view' | 'action_pose',
    imgUrl: string
  ) => {
    let newPortrait = portraitRefUrl;
    let newFullBody = fullBodyRefUrl;
    let newBack = backViewRefUrl;
    let newAction = actionPoseRefUrl;
    let newMaster = lockedImageUrl;

    if (viewType === 'portrait') newPortrait = newPortrait === imgUrl ? '' : imgUrl;
    if (viewType === 'full_body') newFullBody = newFullBody === imgUrl ? '' : imgUrl;
    if (viewType === 'back_view') newBack = newBack === imgUrl ? '' : imgUrl;
    if (viewType === 'action_pose') newAction = newAction === imgUrl ? '' : imgUrl;
    if (viewType === 'model_sheet') newMaster = newMaster === imgUrl ? '' : imgUrl;

    if (!newMaster) newMaster = newPortrait || newFullBody || newBack || newAction || imgUrl;

    setPortraitRefUrl(newPortrait);
    setFullBodyRefUrl(newFullBody);
    setBackViewRefUrl(newBack);
    setActionPoseRefUrl(newAction);
    setLockedImageUrl(newMaster);

    const updatedChar: ComicCharacter = {
      id: character?.id || `char-${Date.now()}`,
      name: name.trim(),
      role: role as any,
      gender: gender as any,
      appearance: appearance.trim(),
      personality: personality.trim(),
      catchphrase: catchphrase.trim() || undefined,
      avatarEmoji: avatarEmoji || '⚡',
      traits,
      wardrobe: wardrobe.trim() || undefined,
      iconicItem: iconicItem.trim() || undefined,
      backstory: backstory.trim() || undefined,
      motivation: motivation.trim() || undefined,
      flaws: flaws.trim() || undefined,
      secret: secret.trim() || undefined,
      abilities: abilities.trim() || undefined,
      gear: gear.trim() || undefined,
      voiceTone: voiceTone.trim() || undefined,
      relationships,
      description: backstory.trim() || `${role} in ${world.title}`,
      imageUrl: newMaster,
      characterSheetUrl: newMaster,
      referenceImages,
      portraitRefUrl: newPortrait,
      fullBodyRefUrl: newFullBody,
      backViewRefUrl: newBack,
      actionPoseRefUrl: newAction,
      modelSheetRefUrl: newMaster,
    };
    onSaveCharacter(updatedChar);
  };

  const handleGenerateAllAngles = async () => {
    if (!name.trim()) {
      alert('Please enter a character name before generating concept art.');
      return;
    }
    setIsBatchGenerating(true);
    setGenerationError(null);

    const views: { id: 'portrait' | 'full_body' | 'back_view' | 'action_pose' | 'model_sheet'; label: string }[] = [
      { id: 'portrait', label: 'Face / Portrait' },
      { id: 'full_body', label: 'Full-Body & Legs' },
      { id: 'back_view', label: 'Back Turnaround' },
      { id: 'action_pose', label: 'Action Stance' },
      { id: 'model_sheet', label: 'Master Model Sheet' },
    ];

    let currentImages = [...referenceImages];
    let newPortrait = portraitRefUrl;
    let newFullBody = fullBodyRefUrl;
    let newBack = backViewRefUrl;
    let newAction = actionPoseRefUrl;
    let newMaster = lockedImageUrl;

    for (let i = 0; i < views.length; i++) {
      const v = views[i];
      setBatchProgress({ current: i + 1, total: views.length, label: v.label });
      setGeneratingViewType(v.id);

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
            viewType: v.id,
            customPrompt: customViewPrompt.trim() || undefined,
            artStyle: world.artStyle || 'webcomic',
            apiKey: apiConfig?.apiKey,
            baseUrl: apiConfig?.baseUrl,
            provider: apiConfig?.provider === 'fireworks' ? 'fireworks' : 'meta-api',
            imageModel: world.imageModel || (apiConfig?.provider === 'fireworks' ? 'flux-1-schnell' : 'muse-image-1.0'),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            const newRef: CharacterReferenceImage = {
              id: `ref-${Date.now()}-${v.id}`,
              viewType: v.id,
              label: v.label,
              imageUrl: data.imageUrl,
              prompt: data.prompt || `${name} (${v.id})`,
              createdAt: new Date().toISOString(),
              isLockedCanon: true,
            };

            currentImages = [newRef, ...currentImages.filter((r) => r.viewType !== v.id)];
            if (v.id === 'portrait') newPortrait = data.imageUrl;
            if (v.id === 'full_body') newFullBody = data.imageUrl;
            if (v.id === 'back_view') newBack = data.imageUrl;
            if (v.id === 'action_pose') newAction = data.imageUrl;
            if (v.id === 'model_sheet' || !newMaster) newMaster = data.imageUrl;

            setReferenceImages(currentImages);
            setPortraitRefUrl(newPortrait);
            setFullBodyRefUrl(newFullBody);
            setBackViewRefUrl(newBack);
            setActionPoseRefUrl(newAction);
            setLockedImageUrl(newMaster);
          }
        }
      } catch (e) {
        console.warn(`Batch angle generation error (${v.label}):`, e);
      }
    }

    setIsBatchGenerating(false);
    setGeneratingViewType(null);
    setBatchProgress(null);

    const updatedChar: ComicCharacter = {
      id: character?.id || `char-${Date.now()}`,
      name: name.trim(),
      role: role as any,
      gender: gender as any,
      appearance: appearance.trim(),
      personality: personality.trim(),
      catchphrase: catchphrase.trim() || undefined,
      avatarEmoji: avatarEmoji || '⚡',
      traits,
      wardrobe: wardrobe.trim() || undefined,
      iconicItem: iconicItem.trim() || undefined,
      backstory: backstory.trim() || undefined,
      motivation: motivation.trim() || undefined,
      flaws: flaws.trim() || undefined,
      secret: secret.trim() || undefined,
      abilities: abilities.trim() || undefined,
      gear: gear.trim() || undefined,
      voiceTone: voiceTone.trim() || undefined,
      relationships,
      description: backstory.trim() || `${role} in ${world.title}`,
      imageUrl: newMaster,
      characterSheetUrl: newMaster,
      referenceImages: currentImages,
      portraitRefUrl: newPortrait,
      fullBodyRefUrl: newFullBody,
      backViewRefUrl: newBack,
      actionPoseRefUrl: newAction,
      modelSheetRefUrl: newMaster,
    };
    onSaveCharacter(updatedChar);
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
      referenceImages,
      portraitRefUrl: portraitRefUrl || undefined,
      fullBodyRefUrl: fullBodyRefUrl || undefined,
      backViewRefUrl: backViewRefUrl || undefined,
      actionPoseRefUrl: actionPoseRefUrl || undefined,
      modelSheetRefUrl: lockedImageUrl || undefined,
    };

    onSaveCharacter(updatedChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border-2 border-zinc-950 rounded-3xl shadow-2xl overflow-hidden text-zinc-900 my-auto max-h-[92vh] flex flex-col">
        
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
              label: `🎨 Character Image Studio & RAG (${referenceImages.length})`,
              icon: Palette,
            },
            { id: 'lore', label: '🧠 Psychology & Lore', icon: Brain },
            { id: 'voice', label: '💬 Voice & Dialogue', icon: MessageSquare },
            { id: 'gear', label: '🎯 Skills & Belongings', icon: Target },
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
              {(() => {
                const matchingRefForSelected = referenceImages.find((r) => r.viewType === selectedViewType);
                const currentDisplayImage = matchingRefForSelected?.imageUrl || lockedImageUrl || referenceImages[0]?.imageUrl;
                const currentDisplayOpt = VIEW_TYPE_OPTIONS.find((v) => v.id === selectedViewType) || VIEW_TYPE_OPTIONS[0];
                const isCurrentCanon = Boolean(
                  (selectedViewType === 'portrait' && portraitRefUrl === currentDisplayImage) ||
                  (selectedViewType === 'full_body' && fullBodyRefUrl === currentDisplayImage) ||
                  (selectedViewType === 'back_view' && backViewRefUrl === currentDisplayImage) ||
                  (selectedViewType === 'action_pose' && actionPoseRefUrl === currentDisplayImage) ||
                  (selectedViewType === 'model_sheet' && (lockedImageUrl === currentDisplayImage || character?.modelSheetRefUrl === currentDisplayImage)) ||
                  (lockedImageUrl === currentDisplayImage)
                );

                return (
                  <div className="bg-gradient-to-br from-indigo-950 via-zinc-900 to-black text-white p-5 sm:p-6 rounded-3xl border-2 border-indigo-500/40 shadow-2xl space-y-6">
                    {/* Studio Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                          📸
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-base text-white tracking-tight">Character Visual Generator & Multi-Angle Studio</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                              Zero-Drift Pipeline RAG
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 mt-0.5">
                            Generate individual reference angles (Face, Legs/Full-Body, Back, Action, Model Sheet) to anchor @{name || 'this character'} across all comic episodes.
                          </p>
                        </div>
                      </div>

                      {/* Batch Generator CTA */}
                      <button
                        type="button"
                        onClick={handleGenerateAllAngles}
                        disabled={!name.trim() || isGeneratingImage || isBatchGenerating}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 shrink-0 self-start sm:self-auto"
                        title="Generate all 5 reference views (Face, Full-Body, Back, Action, Model Sheet) in one click"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isBatchGenerating ? 'animate-spin' : ''}`} />
                        <span>{isBatchGenerating ? (batchProgress ? `Drawing ${batchProgress.label} (${batchProgress.current}/${batchProgress.total})...` : 'Generating Pack...') : '⚡ Generate All 5 Angles at Once'}</span>
                      </button>
                    </div>

                    {/* =========================================================================
                        HERO PREVIEW CANVAS STAGE (ALWAYS PROMINENT!)
                    ========================================================================= */}
                    {currentDisplayImage ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-black shadow-2xl flex flex-col items-center justify-center min-h-[360px] max-h-[460px] group">
                        <img
                          src={currentDisplayImage}
                          alt={`Reference art for ${name}`}
                          className="max-h-[440px] w-auto object-contain mx-auto transition-transform duration-300"
                        />

                        {/* Floating Header Badges on Image */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/80 backdrop-blur-md text-white border border-white/20 uppercase shadow-md flex items-center gap-1.5">
                            <span>{currentDisplayOpt?.icon || '📸'}</span>
                            <span>{currentDisplayOpt?.label || selectedViewType}</span>
                          </span>
                          {isCurrentCanon && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                              <Lock className="w-3 h-3" />
                              <span>ACTIVE CANONICAL RAG</span>
                            </span>
                          )}
                        </div>

                        {/* Floating Action Toolbar on Image */}
                        <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewImageModal(currentDisplayImage)}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Inspect Full-Res</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleToggleAngleLock(selectedViewType, currentDisplayImage)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                isCurrentCanon
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-white/10 hover:bg-emerald-600 text-white'
                              }`}
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>{isCurrentCanon ? 'Locked for RAG' : 'Lock as Canon Reference'}</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleGenerateCharacterArt(selectedViewType)}
                            disabled={isGeneratingImage || isBatchGenerating}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                            <span>{isGeneratingImage ? 'Re-drawing...' : 'Re-draw this View'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Blank Concept Studio Canvas with Big Generator CTA */
                      <div className="relative rounded-2xl border-2 border-dashed border-indigo-400/40 bg-gradient-to-b from-indigo-950/40 to-black p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-3xl shadow-lg animate-pulse">
                          🎨
                        </div>
                        <div className="max-w-md space-y-1">
                          <h4 className="font-bold text-base sm:text-lg text-white">
                            Visual Concept Canvas Ready for @{name || 'Character'}
                          </h4>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            No reference images generated yet. Click below to synthesize authentic concept artwork. You can generate individual angles (Face, Full-Body, Back) or the complete 5-angle model pack!
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => handleGenerateCharacterArt(selectedViewType)}
                            disabled={!name.trim() || isGeneratingImage || isBatchGenerating}
                            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 active:scale-95"
                          >
                            <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                            <span>
                              {isGeneratingImage
                                ? `Drawing ${selectedViewType.replace('_', ' ')}...`
                                : `✨ Generate ${VIEW_TYPE_OPTIONS.find((v) => v.id === selectedViewType)?.label || 'Character Artwork'}`}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={handleGenerateAllAngles}
                            disabled={!name.trim() || isGeneratingImage || isBatchGenerating}
                            className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                          >
                            <span>⚡ Generate All 5 Angles at Once</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* =========================================================================
                        2. MULTI-ANGLE CARDS SELECTOR (FACE, FULL-BODY / LEGS, BACK, ACTION, MODEL SHEET)
                    ========================================================================= */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                          <span>Multi-Angle Reference Lineup & Pipeline RAG Selectors:</span>
                        </label>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          Click any view to preview on canvas or generate
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {VIEW_TYPE_OPTIONS.map((opt) => {
                          const matchingRef = referenceImages.find((r) => r.viewType === opt.id);
                          const isSelected = selectedViewType === opt.id;
                          const isLockedAngle = (
                            (opt.id === 'portrait' && portraitRefUrl === matchingRef?.imageUrl) ||
                            (opt.id === 'full_body' && fullBodyRefUrl === matchingRef?.imageUrl) ||
                            (opt.id === 'back_view' && backViewRefUrl === matchingRef?.imageUrl) ||
                            (opt.id === 'action_pose' && actionPoseRefUrl === matchingRef?.imageUrl) ||
                            (opt.id === 'model_sheet' && (lockedImageUrl === matchingRef?.imageUrl || character?.modelSheetRefUrl === matchingRef?.imageUrl))
                          );

                          return (
                            <div
                              key={opt.id}
                              onClick={() => setSelectedViewType(opt.id)}
                              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-indigo-600/25 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                                  : 'bg-zinc-900/60 border-white/10 hover:bg-zinc-800 hover:border-white/20'
                              }`}
                            >
                              {/* Thumbnail Preview if exists */}
                              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/60 mb-2 border border-white/10 flex items-center justify-center">
                                {matchingRef ? (
                                  <>
                                    <img
                                      src={matchingRef.imageUrl}
                                      alt={opt.label}
                                      className="w-full h-full object-cover"
                                    />
                                    {isLockedAngle && (
                                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500 text-white flex items-center gap-0.5 shadow-sm">
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>RAG</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-zinc-500 space-y-1">
                                    <span className="text-2xl opacity-60">{opt.icon}</span>
                                    <span className="text-[9px] font-mono uppercase text-zinc-500">Not drawn</span>
                                  </div>
                                )}
                              </div>

                              {/* Label & Details */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-white truncate">{opt.label}</span>
                                  <span className="text-[9px] font-mono text-zinc-400 uppercase">{opt.aspect}</span>
                                </div>
                                <p className="text-[10px] text-zinc-400 line-clamp-1 leading-tight">{opt.desc}</p>
                              </div>

                              {/* Action button inside card */}
                              <div className="pt-2">
                                {matchingRef ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleAngleLock(opt.id, matchingRef.imageUrl);
                                    }}
                                    className={`w-full py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                      isLockedAngle
                                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50'
                                        : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                                    }`}
                                  >
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>{isLockedAngle ? 'RAG Active' : 'Lock for RAG'}</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedViewType(opt.id);
                                      handleGenerateCharacterArt(opt.id);
                                    }}
                                    disabled={isGeneratingImage || isBatchGenerating}
                                    className="w-full py-1 rounded-lg text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>Generate</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* =========================================================================
                        3. RAG PIPELINE STATUS BAR
                    ========================================================================= */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase text-indigo-400">
                          RAG Continuity Memory:
                        </span>
                        <span className="text-zinc-300">
                          {referenceImages.length} views generated • {
                            [portraitRefUrl, fullBodyRefUrl, backViewRefUrl, actionPoseRefUrl, lockedImageUrl].filter(Boolean).length
                          } active pipeline anchors
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${portraitRefUrl ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-zinc-500'}`}>
                          Face {portraitRefUrl ? '✓' : '—'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${fullBodyRefUrl ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-zinc-500'}`}>
                          Full-Body / Legs {fullBodyRefUrl ? '✓' : '—'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${backViewRefUrl ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-zinc-500'}`}>
                          Back {backViewRefUrl ? '✓' : '—'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${lockedImageUrl ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-zinc-500'}`}>
                          Master Sheet {lockedImageUrl ? '✓' : '—'}
                        </span>
                      </div>
                    </div>

                    {/* =========================================================================
                        4. PROMPT REFINEMENTS & DIRECT URL INPUT
                    ========================================================================= */}
                    <div className="pt-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase">
                          Optional Prompt Refinements for View:
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                        >
                          {showUrlInput ? 'Hide Custom URL' : 'Or Paste Custom URL'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customViewPrompt}
                          onChange={(e) => setCustomViewPrompt(e.target.value)}
                          placeholder="e.g. Amber glowing eyes, intense focused gaze, high-collared trench coat..."
                          className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-400"
                        />

                        <button
                          type="button"
                          onClick={() => handleGenerateCharacterArt(selectedViewType)}
                          disabled={!name.trim() || isGeneratingImage || isBatchGenerating}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate View</span>
                        </button>
                      </div>

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
                    </div>
                  </div>
                );
              })()}

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
                    rows={3}
                    value={appearance}
                    onChange={(e) => setAppearance(e.target.value)}
                    placeholder="e.g. Angular jawline, observant amber eyes, messy cropped silver hair, lean athletic build with an alert posture."
                    className="w-full p-3.5 bg-white border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-colors leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                      Signature Wardrobe & Color Palette
                    </label>
                    <textarea
                      rows={3}
                      value={wardrobe}
                      onChange={(e) => setWardrobe(e.target.value)}
                      placeholder="e.g. Faded charcoal trench coat with roll-up sleeves over an indigo combat tunic and reinforced knee-boots."
                      className="w-full p-3.5 bg-white border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-colors leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                      <span>Iconic Accessory / Silhouette Item</span>
                      <span className="text-[10px] text-purple-600 font-mono">(Key Prop)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={iconicItem}
                      onChange={(e) => setIconicItem(e.target.value)}
                      placeholder="e.g. Cracked holographic wrist-chronometer, vintage 35mm film camera, chipped mechanical katana, glowing neon cyber-goggles."
                      className="w-full p-3.5 bg-white border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-colors leading-relaxed"
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
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                  Origin & Formative Backstory
                </label>
                <textarea
                  rows={5}
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder={`Who was @${name || 'this character'} before the story began? What formative events, background, or life experience shaped their worldview?`}
                  className="w-full p-4 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm sm:text-base font-medium text-zinc-950 outline-none transition-all leading-relaxed shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                    <span>Core Motivation / Driving Desire</span>
                    <span className="text-[10px] text-blue-600 font-mono">(What they want)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="e.g. To open their own independent bakery, redeem their family's name, or uncover the truth behind the lost expedition."
                    className="w-full p-3.5 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm font-medium text-zinc-950 outline-none transition-all leading-relaxed shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                    <span>Fatal Flaw / Blindspot</span>
                    <span className="text-[10px] text-amber-600 font-mono">(What trips them up)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={flaws}
                    onChange={(e) => setFlaws(e.target.value)}
                    placeholder="e.g. Chronic perfectionism; avoids confrontation until a breaking point; holds grudges; impulsive overconfidence."
                    className="w-full p-3.5 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm font-medium text-zinc-950 outline-none transition-all leading-relaxed shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                  <span>Classified Secret / Hidden Truth</span>
                  <span className="text-[10px] text-purple-600 font-mono">(Plot Twist Fuel)</span>
                </label>
                <textarea
                  rows={2}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="e.g. Secretly the anonymous author of the city's viral blog, or harbors an unpaid debt to an old rival."
                  className="w-full p-3.5 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm font-medium text-zinc-950 outline-none transition-all leading-relaxed shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* TAB 3: VOICE & DIALOGUE */}
          {activeTab === 'voice' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Dialogue Cadence & Voice Tone
                  </label>
                  <input
                    type="text"
                    value={voiceTone}
                    onChange={(e) => setVoiceTone(e.target.value)}
                    placeholder="e.g. Fast-paced dry sarcasm, thoughtful warmth, cryptic brevity, excitable rambler"
                    className="w-full p-3.5 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm font-medium text-zinc-950 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Signature Catchphrase or Motto
                  </label>
                  <input
                    type="text"
                    value={catchphrase}
                    onChange={(e) => setCatchphrase(e.target.value)}
                    placeholder='e.g. "Order up!" or "The truth never stays buried."'
                    className="w-full p-3.5 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm font-serif italic text-zinc-950 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Personality Summary
                </label>
                <textarea
                  rows={3}
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="e.g. Empathetic yet stubborn, values punctuality above all else, secretly a romantic who deflects with humor."
                  className="w-full p-3.5 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm font-medium text-zinc-950 outline-none transition-all leading-relaxed shadow-2xs"
                />
              </div>

              {/* Character Traits Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                  Personality & Archetype Traits
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {TRAIT_SUGGESTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToggleTrait(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        traits.includes(t)
                          ? 'bg-zinc-950 text-white shadow-xs'
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
                    className="px-3.5 py-2 bg-white border-2 border-zinc-200 focus:border-zinc-950 rounded-xl text-xs font-medium text-zinc-900 outline-none flex-1 max-w-xs"
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
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white cursor-pointer transition-colors"
                  >
                    + Add Trait
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS & BELONGINGS (GENRE-AWARE CO-DIRECTOR) */}
          {activeTab === 'gear' && (() => {
            const currentLens = GENRE_LENSES.find((l) => l.id === selectedGearLens) || GENRE_LENSES[0];
            return (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Genre Lens Selector Bar */}
                <div className="p-4 bg-zinc-50 border border-black/[0.08] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      Active Genre Lens (Comics are for all stories — not just superheroes!):
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Universe: {world.genre || 'General'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {GENRE_LENSES.map((lens) => (
                      <button
                        key={lens.id}
                        type="button"
                        onClick={() => setSelectedGearLens(lens.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedGearLens === lens.id
                            ? 'bg-zinc-950 text-white shadow-xs scale-102'
                            : 'bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}
                      >
                        <span>{lens.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field 1: Skills, Profession or Abilities */}
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label className="block text-sm font-bold text-zinc-950">
                      {currentLens.skillLabel}
                    </label>
                    <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                      {currentLens.skillHelper}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={abilities}
                    onChange={(e) => setAbilities(e.target.value)}
                    placeholder={currentLens.skillPlaceholder}
                    className="w-full p-4 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm sm:text-base font-medium text-zinc-950 outline-none transition-all leading-relaxed shadow-2xs"
                  />
                  {/* 1-Click Quick Add Inspiration Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mr-1">
                      Quick Add:
                    </span>
                    {currentLens.skillPills.map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => {
                          const cleanPill = pill.replace(/^[^\s]+\s+/, '');
                          setAbilities((prev) => (prev ? `${prev}, ${cleanPill}` : cleanPill));
                        }}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                      >
                        + {pill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field 2: Signature Items, Belongings, Tools or Gear */}
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label className="block text-sm font-bold text-zinc-950">
                      {currentLens.itemLabel}
                    </label>
                    <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                      {currentLens.itemHelper}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={gear}
                    onChange={(e) => setGear(e.target.value)}
                    placeholder={currentLens.itemPlaceholder}
                    className="w-full p-4 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm sm:text-base font-medium text-zinc-950 outline-none transition-all leading-relaxed shadow-2xs"
                  />
                  {/* 1-Click Quick Add Inspiration Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mr-1">
                      Quick Add:
                    </span>
                    {currentLens.itemPills.map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => {
                          const cleanPill = pill.replace(/^[^\s]+\s+/, '');
                          setGear((prev) => (prev ? `${prev}, ${cleanPill}` : cleanPill));
                        }}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                      >
                        + {pill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

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
