'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ComicCharacter, ComicWorld, CharacterRelationship, CharacterReferenceImage } from '@/types/comic';
import { ApiConfig } from '@/lib/meta-models';

export interface CharacterChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  questions?: string[];
  quickOptions?: string[];
  suggestedUpdates?: {
    appearance?: string;
    wardrobe?: string;
    iconicItem?: string;
    backstory?: string;
    motivation?: string;
    flaws?: string;
    secret?: string;
    voiceTone?: string;
    catchphrase?: string;
    personality?: string;
    abilities?: string;
    gear?: string;
  };
  applied?: boolean;
  timestamp: string;
}
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
  Briefcase,
  Bot,
  Wand2,
  Send,
  Lightbulb,
  ChevronRight,
  ChevronLeft
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
  { id: 'love-interest', label: '💕 Love Interest / Romantic Lead', desc: 'Romantic partner, crush, spouse, or emotional anchor' },
  { id: 'colleague', label: '💼 Coworker / Colleague', desc: 'Office peer, teammate, coworker, or workplace partner' },
  { id: 'protagonist', label: '⭐ Protagonist / Lead', desc: 'Central character driving the story' },
  { id: 'sidekick', label: '🤝 Ally / Best Friend / Partner', desc: 'Trusted companion, best friend, or partner' },
  { id: 'antagonist', label: '😈 Antagonist / Rival / Boss', desc: 'Opponent, rival, foil, demanding boss, or competing force' },
  { id: 'supporting', label: '☕ Supporting Cast / Family', desc: 'Family member, neighbor, barista, or mentor' },
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
    label: 'Signature Pose',
    icon: '✨',
    desc: 'Expressive body language, poise & signature attitude',
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

  // AI Character Co-Writer Deck State (Directive Side-Panel)
  const [coWriterDirective, setCoWriterDirective] = useState('');
  const [isCoWriterOpen, setIsCoWriterOpen] = useState(true);
  const [fieldFleshing, setFieldFleshing] = useState<string | null>(null);

  // Character Co-Director Chat & Interview Studio State
  const [coWriterMode, setCoWriterMode] = useState<'chat' | 'quick'>('chat');
  const [chatMessages, setChatMessages] = useState<CharacterChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatFocusSection, setChatFocusSection] = useState<'visuals' | 'lore' | 'voice' | 'gear' | 'full'>('visuals');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatSending]);

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

      // Seed initial character co-director conversation
      if (character.name) {
        setChatMessages([
          {
            id: `seed-${Date.now()}`,
            role: 'assistant',
            content: `Hello! I'm your AI Character Co-Director for @${character.name}. Let's make sure her visual style, wardrobe, and backstory are 100% dialled in for "${world.title}".

What would you like to discuss or refine first?`,
            questions: [
              `What is her signature daily power wardrobe and footwear?`,
              `Does she carry an iconic accessory or silhouette prop?`,
              `What hidden emotional truth or ambition drives her in this story?`
            ],
            quickOptions: [
              `👠 Luxury power attire with Louboutin stilettos`,
              `🥻 Designer silk sarees with cape blazers`,
              `📖 Explore her origin backstory & motivation`,
              `💬 Dial in her speech cadence & catchphrase`
            ],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      } else {
        setChatMessages([]);
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
      setChatMessages([]);
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

  const handleExecuteCoWriter = async (
    directiveOverride?: string,
    targetFieldParam?: string,
    overwriteAll: boolean = false
  ) => {
    if (!name.trim()) {
      alert('Please enter a character name first so Meta AI knows who to write for.');
      return;
    }

    const effectiveDirective = directiveOverride !== undefined ? directiveOverride : coWriterDirective;
    if (targetFieldParam) setFieldFleshing(targetFieldParam);
    else setIsExpanding(true);
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
          worldTagline: world.tagline,
          genre: world.genre,
          worldLore: world.lore || '',
          worldLaws: (world.laws || []).map((l) => `${l.title}: ${l.rule}`),
          worldLocations: (world.locations || []).map((loc) => `${loc.name}${loc.significance ? ` (${loc.significance})` : ''}`),
          worldAttributes: (world.customAttributes || []).map((a) => `${a.key}: ${a.value}`),
          existingCharacters: world.characters
            .filter((c) => c.name.toLowerCase() !== name.toLowerCase())
            .map((c) => ({
              name: c.name,
              role: c.role,
              gender: c.gender || '',
              appearance: c.appearance || '',
              personality: c.personality || '',
              backstory: c.backstory || '',
              motivation: c.motivation || '',
              catchphrase: c.catchphrase || '',
            })),
          recentEpisodes: (world.episodes || []).slice(-3).map((ep, idx) => ({
            episodeNumber: ep.episodeNumber || idx + 1,
            title: ep.title,
            recap: ep.recap || ep.rawBrainDump || '',
            newFacts: ep.newFacts || [],
          })),
          apiKey: apiConfig?.apiKey,
          baseUrl: apiConfig?.baseUrl,
          provider: apiConfig?.provider === 'fireworks' ? 'fireworks' : 'meta-api',
          userDirective: effectiveDirective.trim() || backstory.trim() || undefined,
          targetField: targetFieldParam,
        }),
      });

      if (!res.ok) throw new Error('Expansion call failed');
      const data = await res.json();

      if (targetFieldParam) {
        if (targetFieldParam === 'backstory' && data.backstory) setBackstory(data.backstory);
        if (targetFieldParam === 'motivation' && data.motivation) setMotivation(data.motivation);
        if (targetFieldParam === 'flaws' && data.flaws) setFlaws(data.flaws);
        if (targetFieldParam === 'secret' && data.secret) setSecret(data.secret);
        if (targetFieldParam === 'voiceTone' && data.voiceTone) setVoiceTone(data.voiceTone);
        if (targetFieldParam === 'catchphrase' && data.catchphrase) setCatchphrase(data.catchphrase);
        if (targetFieldParam === 'personality' && data.personality) setPersonality(data.personality);
        if (targetFieldParam === 'abilities' && data.abilities) setAbilities(data.abilities);
        if (targetFieldParam === 'gear' && data.gear) setGear(data.gear);
        if (targetFieldParam === 'wardrobe' && data.wardrobe) setWardrobe(data.wardrobe);
        if (targetFieldParam === 'appearance' && data.appearance) setAppearance(data.appearance);
        if (targetFieldParam === 'iconicItem' && data.iconicItem) setIconicItem(data.iconicItem);
        setExpandNotice(`Drafted ${targetFieldParam} with ${data.provider || 'Meta AI'}!`);
      } else {
        if (data.appearance && (overwriteAll || !appearance)) setAppearance(data.appearance);
        if (data.wardrobe && (overwriteAll || !wardrobe)) setWardrobe(data.wardrobe);
        if (data.iconicItem && (overwriteAll || !iconicItem)) setIconicItem(data.iconicItem);
        if (data.backstory && (overwriteAll || !backstory)) setBackstory(data.backstory);
        if (data.motivation && (overwriteAll || !motivation)) setMotivation(data.motivation);
        if (data.flaws && (overwriteAll || !flaws)) setFlaws(data.flaws);
        if (data.secret && (overwriteAll || !secret)) setSecret(data.secret);
        if (data.abilities && (overwriteAll || !abilities)) setAbilities(data.abilities);
        if (data.gear && (overwriteAll || !gear)) setGear(data.gear);
        if (data.voiceTone && (overwriteAll || !voiceTone)) setVoiceTone(data.voiceTone);
        if (data.catchphrase && (overwriteAll || !catchphrase)) setCatchphrase(data.catchphrase);
        if (data.personality && (overwriteAll || !personality)) setPersonality(data.personality);

        if (data.suggestedRelationships && relationships.length === 0) {
          setRelationships(data.suggestedRelationships);
        }

        setExpandNotice(`Populated dossier with ${data.provider || 'Meta AI'}!`);
      }

      setTimeout(() => setExpandNotice(null), 3500);
    } catch (e) {
      console.error(e);
      setExpandNotice('Could not reach AI, using heuristic suggestions.');
    } finally {
      setIsExpanding(false);
      setFieldFleshing(null);
    }
  };

  const handleFleshOutWithAi = () => handleExecuteCoWriter(coWriterDirective, undefined, false);

  const handleStartChatForSection = async (
    section: 'visuals' | 'lore' | 'voice' | 'gear' | 'full',
    initialUserMsg?: string
  ) => {
    setIsCoWriterOpen(true);
    setCoWriterMode('chat');
    setChatFocusSection(section);

    if (initialUserMsg) {
      await handleSendChatMessage(initialUserMsg, section);
      return;
    }

    setIsChatSending(true);
    try {
      const res = await fetch('/api/character-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: {
            name: name.trim() || 'Character',
            role,
            gender,
            appearance,
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
          worldTagline: world.tagline,
          genre: world.genre,
          worldLore: world.lore,
          worldLaws: (world.laws || []).map((l) => `${l.title}: ${l.rule}`),
          chatHistory: chatMessages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: '',
          focusSection: section,
          apiKey: apiConfig?.apiKey,
          baseUrl: apiConfig?.baseUrl,
          provider: apiConfig?.provider,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            questions: data.questions,
            quickOptions: data.quickOptions,
            suggestedUpdates: data.suggestedUpdates,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Character chat section switch failed:', err);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleSendChatMessage = async (
    textToSend?: string,
    sectionOverride?: 'visuals' | 'lore' | 'voice' | 'gear' | 'full'
  ) => {
    const text = (textToSend !== undefined ? textToSend : chatInput).trim();
    if (!text && !chatMessages.length) return;

    const targetSection = sectionOverride || chatFocusSection;
    const userMsg: CharacterChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatInput('');
    setIsChatSending(true);

    try {
      const res = await fetch('/api/character-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: {
            name: name.trim() || 'Character',
            role,
            gender,
            appearance,
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
          worldTagline: world.tagline,
          genre: world.genre,
          worldLore: world.lore,
          worldLaws: (world.laws || []).map((l) => `${l.title}: ${l.rule}`),
          chatHistory: newHistory.map((m) => ({ role: m.role, content: m.content })),
          userMessage: text,
          focusSection: targetSection,
          apiKey: apiConfig?.apiKey,
          baseUrl: apiConfig?.baseUrl,
          provider: apiConfig?.provider,
        }),
      });

      if (!res.ok) throw new Error('Chat API returned error');
      const data = await res.json();

      const assistantMsg: CharacterChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        questions: data.questions,
        quickOptions: data.quickOptions,
        suggestedUpdates: data.suggestedUpdates,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Character chat error:', err);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleApplyChatUpdates = (msgId: string, updates?: any) => {
    if (!updates) return;
    if (updates.appearance) setAppearance(updates.appearance);
    if (updates.wardrobe) setWardrobe(updates.wardrobe);
    if (updates.iconicItem) setIconicItem(updates.iconicItem);
    if (updates.backstory) setBackstory(updates.backstory);
    if (updates.motivation) setMotivation(updates.motivation);
    if (updates.flaws) setFlaws(updates.flaws);
    if (updates.secret) setSecret(updates.secret);
    if (updates.voiceTone) setVoiceTone(updates.voiceTone);
    if (updates.catchphrase) setCatchphrase(updates.catchphrase);
    if (updates.personality) setPersonality(updates.personality);
    if (updates.abilities) setAbilities(updates.abilities);
    if (updates.gear) setGear(updates.gear);

    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    );
    setExpandNotice('✓ Applied Co-Director recommendations directly to character dossier!');
    setTimeout(() => setExpandNotice(null), 3000);
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
          worldTitle: world.title,
          genre: world.genre,
          worldLore: world.lore || '',
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
      { id: 'action_pose', label: 'Signature Pose' },
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
            worldTitle: world.title,
            genre: world.genre,
            worldLore: world.lore || '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className={`relative w-full ${isCoWriterOpen ? 'max-w-6xl xl:max-w-7xl' : 'max-w-5xl'} bg-white border-2 border-zinc-950 rounded-3xl shadow-2xl overflow-hidden text-zinc-900 my-auto max-h-[94vh] flex flex-col transition-all duration-200`}>
        
        {/* =====================================================================
            TOP TITLE BAR
        ===================================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] bg-zinc-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 text-purple-900 flex items-center justify-center text-xl shadow-xs overflow-hidden">
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
            {/* AI Co-Writer Deck Toggle */}
            <button
              type="button"
              onClick={() => setIsCoWriterOpen(!isCoWriterOpen)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isCoWriterOpen
                  ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-2xs'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
              title="Toggle AI Co-Writer side panel"
            >
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">{isCoWriterOpen ? 'Co-Writer Deck' : 'Open Co-Writer'}</span>
              <span className="sm:hidden">AI</span>
            </button>

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
            DUAL-PANE WORKSPACE: TABS FORM (LEFT) + AI CO-WRITER DECK (RIGHT)
        ===================================================================== */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
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
                  <div className="bg-zinc-50 border-2 border-zinc-200 text-zinc-900 p-5 sm:p-6 rounded-3xl space-y-6 shadow-2xs">
                    {/* Studio Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.08]">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-2xl shrink-0">
                          📸
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-zinc-950 tracking-tight">Character Visual Generator & Multi-Angle Studio</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                              Zero-Drift Pipeline RAG
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Generate individual reference angles (Face, Legs/Full-Body, Back, Action, Model Sheet) to anchor @{name || 'this character'} across all comic episodes.
                          </p>
                        </div>
                      </div>

                      {/* Batch Generator CTA */}
                      <button
                        type="button"
                        onClick={handleGenerateAllAngles}
                        disabled={!name.trim() || isGeneratingImage || isBatchGenerating}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 shrink-0 self-start sm:self-auto"
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
                      <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-200 bg-white shadow-xs flex flex-col items-center justify-center min-h-[360px] max-h-[460px] group">
                        <img
                          src={currentDisplayImage}
                          alt={`Reference art for ${name}`}
                          className="max-h-[440px] w-auto object-contain mx-auto transition-transform duration-300"
                        />

                        {/* Floating Header Badges on Image */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/95 backdrop-blur-md text-zinc-900 border border-black/10 uppercase shadow-xs flex items-center gap-1.5">
                            <span>{currentDisplayOpt?.icon || '📸'}</span>
                            <span>{currentDisplayOpt?.label || selectedViewType}</span>
                          </span>
                          {isCurrentCanon && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                              <Lock className="w-3 h-3" />
                              <span>ACTIVE CANONICAL RAG</span>
                            </span>
                          )}
                        </div>

                        {/* Floating Action Toolbar on Image */}
                        <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-black/10 shadow-xs">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewImageModal(currentDisplayImage)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-200"
                            >
                              <Maximize2 className="w-3.5 h-3.5 text-zinc-600" />
                              <span>Inspect Full-Res</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleToggleAngleLock(selectedViewType, currentDisplayImage)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                                isCurrentCanon
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
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
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                            <span>{isGeneratingImage ? 'Re-drawing...' : 'Re-draw this View'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Blank Concept Studio Canvas with Big Generator CTA */
                      <div className="relative rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl shadow-xs">
                          🎨
                        </div>
                        <div className="max-w-md space-y-1">
                          <h4 className="font-bold text-base sm:text-lg text-zinc-950">
                            Visual Concept Canvas Ready for @{name || 'Character'}
                          </h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            No reference images generated yet. Click below to synthesize authentic concept artwork. You can generate individual angles (Face, Full-Body, Back) or the complete 5-angle model pack!
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => handleGenerateCharacterArt(selectedViewType)}
                            disabled={!name.trim() || isGeneratingImage || isBatchGenerating}
                            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 active:scale-95"
                          >
                            <Sparkles className={`w-4 h-4 text-purple-200 ${isGeneratingImage ? 'animate-spin' : ''}`} />
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
                            className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
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
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                          <span>Multi-Angle Reference Lineup & Pipeline RAG Selectors:</span>
                        </label>
                        <span className="text-[10px] text-purple-700 font-mono font-bold">
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
                                  ? 'bg-purple-50 border-2 border-purple-600 text-purple-950 shadow-xs ring-2 ring-purple-600/15'
                                  : 'bg-white border-2 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-800 shadow-2xs'
                              }`}
                            >
                              {/* Thumbnail Preview if exists */}
                              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-100 mb-2 border border-black/[0.08] flex items-center justify-center">
                                {matchingRef ? (
                                  <>
                                    <img
                                      src={matchingRef.imageUrl}
                                      alt={opt.label}
                                      className="w-full h-full object-cover"
                                    />
                                    {isLockedAngle && (
                                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-600 text-white flex items-center gap-0.5 shadow-xs">
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>RAG</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-zinc-400 space-y-1">
                                    <span className="text-2xl opacity-75">{opt.icon}</span>
                                    <span className="text-[9px] font-mono uppercase text-zinc-400">Not drawn</span>
                                  </div>
                                )}
                              </div>

                              {/* Label & Details */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-zinc-950 truncate">{opt.label}</span>
                                  <span className="text-[9px] font-mono text-zinc-500 uppercase px-1 rounded bg-zinc-100 border border-zinc-200 font-bold">{opt.aspect}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 line-clamp-1 leading-tight">{opt.desc}</p>
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
                                    className={`w-full py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                                      isLockedAngle
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                        : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
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
                                    className="w-full py-1 rounded-lg text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 shadow-xs"
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
                    <div className="p-3 rounded-xl bg-white border border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase text-purple-700">
                          RAG Continuity Memory:
                        </span>
                        <span className="text-zinc-600 font-medium">
                          {referenceImages.length} views generated • {
                            [portraitRefUrl, fullBodyRefUrl, backViewRefUrl, actionPoseRefUrl, lockedImageUrl].filter(Boolean).length
                          } active pipeline anchors
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${portraitRefUrl ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                          Face {portraitRefUrl ? '✓' : '—'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${fullBodyRefUrl ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                          Full-Body / Legs {fullBodyRefUrl ? '✓' : '—'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${backViewRefUrl ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                          Back {backViewRefUrl ? '✓' : '—'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${lockedImageUrl ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                          Master Sheet {lockedImageUrl ? '✓' : '—'}
                        </span>
                      </div>
                    </div>

                    {/* =========================================================================
                        4. PROMPT REFINEMENTS & DIRECT URL INPUT
                    ========================================================================= */}
                    <div className="pt-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                          Optional Prompt Refinements for View:
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="text-[10px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
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
                          className="flex-1 px-3.5 py-2 bg-white border-2 border-zinc-200 focus:border-zinc-950 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 outline-none shadow-2xs"
                        />

                        <button
                          type="button"
                          onClick={() => handleGenerateCharacterArt(selectedViewType)}
                          disabled={!name.trim() || isGeneratingImage || isBatchGenerating}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate View</span>
                        </button>
                      </div>

                      {showUrlInput && (
                        <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                          <input
                            type="text"
                            value={manualUrlInput}
                            onChange={(e) => setManualUrlInput(e.target.value)}
                            placeholder="https://... (direct image URL to character artwork)"
                            className="flex-1 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 outline-none focus:border-purple-600"
                          />
                          <button
                            type="button"
                            onClick={handleAddManualImage}
                            disabled={!manualUrlInput.trim()}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            Add to Gallery
                          </button>
                        </div>
                      )}

                      {generationError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{generationError}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setGenerationError(null)}
                            className="text-red-600 hover:text-red-900 text-xs underline cursor-pointer"
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>Physical Appearance (Face, Hair, Build)</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Image Anchor</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartChatForSection('visuals', `Let's discuss and design @${name || 'Character'}'s physical appearance: ${appearance || 'Not set yet'}`)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Chat with AI Co-Director about physical look"
                      >
                        <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                        <span>Chat with AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteCoWriter(coWriterDirective, 'appearance', true)}
                        disabled={fieldFleshing === 'appearance' || isExpanding || !name.trim()}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                        title="AI Quick Fill"
                      >
                        <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'appearance' ? 'animate-spin' : ''}`} />
                        <span>{fieldFleshing === 'appearance' ? '...' : 'Quick Fill'}</span>
                      </button>
                    </div>
                  </div>
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-zinc-900">
                        Signature Wardrobe & Color Palette
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartChatForSection('visuals', `Let's discuss @${name || 'Character'}'s signature wardrobe and styling: ${wardrobe || 'Not set yet'}`)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Chat with AI Co-Director about wardrobe"
                        >
                          <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                          <span>Chat with AI</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExecuteCoWriter(coWriterDirective, 'wardrobe', true)}
                          disabled={fieldFleshing === 'wardrobe' || isExpanding || !name.trim()}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                          title="AI Quick Fill"
                        >
                          <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'wardrobe' ? 'animate-spin' : ''}`} />
                          <span>{fieldFleshing === 'wardrobe' ? '...' : 'Quick Fill'}</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={wardrobe}
                      onChange={(e) => setWardrobe(e.target.value)}
                      placeholder="e.g. Faded charcoal trench coat with roll-up sleeves over an indigo combat tunic and reinforced knee-boots."
                      className="w-full p-3.5 bg-white border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 transition-colors leading-relaxed"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <span>Iconic Accessory / Silhouette Item</span>
                        <span className="text-[10px] text-purple-600 font-mono">(Key Prop)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartChatForSection('visuals', `What iconic accessory or silhouette prop should @${name || 'Character'} carry? Current note: ${iconicItem || 'Not set yet'}`)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Chat with AI Co-Director about signature prop"
                        >
                          <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                          <span>Chat with AI</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExecuteCoWriter(coWriterDirective, 'iconicItem', true)}
                          disabled={fieldFleshing === 'iconicItem' || isExpanding || !name.trim()}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                          title="AI Quick Fill"
                        >
                          <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'iconicItem' ? 'animate-spin' : ''}`} />
                          <span>{fieldFleshing === 'iconicItem' ? '...' : 'Quick Fill'}</span>
                        </button>
                      </div>
                    </div>
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
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl font-mono text-[11px] space-y-1">
                  <span className="text-zinc-500 uppercase text-[9px] font-bold tracking-wider block">
                    Meta Muse Image Injected Continuity Token:
                  </span>
                  <p className="text-purple-700 font-semibold">
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Origin & Formative Backstory
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartChatForSection('lore', `Let's develop @${name || 'Character'}'s origin and formative history. Current note: "${backstory || 'Not set yet'}"`)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Chat with AI Co-Director about origin backstory"
                    >
                      <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                      <span>Chat with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteCoWriter(coWriterDirective, 'backstory', true)}
                      disabled={fieldFleshing === 'backstory' || isExpanding}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                      title="Quick AI Fill"
                    >
                      <Sparkles className={`w-3 h-3 ${fieldFleshing === 'backstory' ? 'animate-spin' : ''}`} />
                      <span>{fieldFleshing === 'backstory' ? 'Writing...' : 'Quick Fill'}</span>
                    </button>
                  </div>
                </div>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>Core Motivation</span>
                      <span className="text-[10px] text-blue-600 font-mono">(What they want)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartChatForSection('lore', `What is @${name || 'Character'}'s core motivation and driving ambition? Current note: "${motivation || 'Not set yet'}"`)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Chat with AI Co-Director about motivation"
                      >
                        <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                        <span>Chat with AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteCoWriter(coWriterDirective, 'motivation', true)}
                        disabled={fieldFleshing === 'motivation' || isExpanding}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                      >
                        <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'motivation' ? 'animate-spin' : ''}`} />
                        <span>{fieldFleshing === 'motivation' ? '...' : 'Quick Fill'}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="e.g. To open their own independent bakery, redeem their family's name, or build a quiet life together away from chaos."
                    className="w-full p-3.5 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm font-medium text-zinc-950 outline-none transition-all leading-relaxed shadow-2xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>Fatal Flaw / Blindspot</span>
                      <span className="text-[10px] text-amber-600 font-mono">(What trips them up)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartChatForSection('lore', `What is @${name || 'Character'}'s fatal flaw or vulnerability? Current note: "${flaws || 'Not set yet'}"`)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Chat with AI Co-Director about fatal flaw"
                      >
                        <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                        <span>Chat with AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteCoWriter(coWriterDirective, 'flaws', true)}
                        disabled={fieldFleshing === 'flaws' || isExpanding}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                      >
                        <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'flaws' ? 'animate-spin' : ''}`} />
                        <span>{fieldFleshing === 'flaws' ? '...' : 'Quick Fill'}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={flaws}
                    onChange={(e) => setFlaws(e.target.value)}
                    placeholder="e.g. Chronic perfectionism; avoids confrontation until a breaking point; overworks to hide vulnerability."
                    className="w-full p-3.5 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm font-medium text-zinc-950 outline-none transition-all leading-relaxed shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <span>Classified Secret / Hidden Truth</span>
                    <span className="text-[10px] text-purple-600 font-mono">(Plot Twist Fuel)</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartChatForSection('lore', `What secret truth or hidden past does @${name || 'Character'} guard? Current note: "${secret || 'Not set yet'}"`)}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Chat with AI Co-Director about secret"
                    >
                      <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                      <span>Chat with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteCoWriter(coWriterDirective, 'secret', true)}
                      disabled={fieldFleshing === 'secret' || isExpanding}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                    >
                      <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'secret' ? 'animate-spin' : ''}`} />
                      <span>{fieldFleshing === 'secret' ? '...' : 'Quick Fill'}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="e.g. Secretly knows his double life after discovering his emergency kit, but keeps quiet to preserve a normal sanctuary."
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Dialogue Cadence & Voice Tone
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartChatForSection('voice', `How does @${name || 'Character'} speak? What is their speech cadence and tone? Current note: "${voiceTone || 'Not set yet'}"`)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Chat with AI Co-Director about dialogue voice"
                      >
                        <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                        <span>Chat with AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteCoWriter(coWriterDirective, 'voiceTone', true)}
                        disabled={fieldFleshing === 'voiceTone' || isExpanding || !name.trim()}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                        title="Quick AI Fill"
                      >
                        <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'voiceTone' ? 'animate-spin' : ''}`} />
                        <span>{fieldFleshing === 'voiceTone' ? '...' : 'Quick Fill'}</span>
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={voiceTone}
                    onChange={(e) => setVoiceTone(e.target.value)}
                    placeholder="e.g. Fast-paced dry sarcasm, thoughtful warmth, cryptic brevity, excitable rambler"
                    className="w-full p-3.5 bg-white border-2 border-zinc-200 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 rounded-2xl text-sm font-medium text-zinc-950 outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                      Signature Catchphrase or Motto
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartChatForSection('voice', `What is @${name || 'Character'}'s signature catchphrase, motto or recurring line? Current note: "${catchphrase || 'Not set yet'}"`)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Chat with AI Co-Director about catchphrase"
                      >
                        <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                        <span>Chat with AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExecuteCoWriter(coWriterDirective, 'catchphrase', true)}
                        disabled={fieldFleshing === 'catchphrase' || isExpanding || !name.trim()}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                        title="Quick AI Fill"
                      >
                        <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'catchphrase' ? 'animate-spin' : ''}`} />
                        <span>{fieldFleshing === 'catchphrase' ? '...' : 'Quick Fill'}</span>
                      </button>
                    </div>
                  </div>
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Personality Summary
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartChatForSection('voice', `What is @${name || 'Character'}'s personality archetype and interpersonal style? Current note: "${personality || 'Not set yet'}"`)}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Chat with AI Co-Director about personality"
                    >
                      <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                      <span>Chat with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteCoWriter(coWriterDirective, 'personality', true)}
                      disabled={fieldFleshing === 'personality' || isExpanding || !name.trim()}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                      title="Quick AI Fill"
                    >
                      <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'personality' ? 'animate-spin' : ''}`} />
                      <span>{fieldFleshing === 'personality' ? '...' : 'Quick Fill'}</span>
                    </button>
                  </div>
                </div>
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
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-bold text-zinc-950">
                        {currentLens.skillLabel}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartChatForSection('gear', `What are @${name || 'Character'}'s core skills, profession, and daily talents? Current note: "${abilities || 'Not set yet'}"`)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Chat with AI Co-Director about skills"
                        >
                          <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                          <span>Chat with AI</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExecuteCoWriter(coWriterDirective, 'abilities', true)}
                          disabled={fieldFleshing === 'abilities' || isExpanding || !name.trim()}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                          title="Quick AI Fill"
                        >
                          <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'abilities' ? 'animate-spin' : ''}`} />
                          <span>{fieldFleshing === 'abilities' ? '...' : 'Quick Fill'}</span>
                        </button>
                      </div>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-bold text-zinc-950">
                        {currentLens.itemLabel}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartChatForSection('gear', `What tools, personal items, or gear does @${name || 'Character'} carry? Current note: "${gear || 'Not set yet'}"`)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Chat with AI Co-Director about belongings"
                        >
                          <MessageSquare className="w-2.5 h-2.5 text-purple-600" />
                          <span>Chat with AI</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExecuteCoWriter(coWriterDirective, 'gear', true)}
                          disabled={fieldFleshing === 'gear' || isExpanding || !name.trim()}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                          title="Quick AI Fill"
                        >
                          <Sparkles className={`w-2.5 h-2.5 ${fieldFleshing === 'gear' ? 'animate-spin' : ''}`} />
                          <span>{fieldFleshing === 'gear' ? '...' : 'Quick Fill'}</span>
                        </button>
                      </div>
                    </div>
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

        {/* =========================================================================
            AI CHARACTER CO-DIRECTOR CHAT & DIRECTIVES STUDIO
        ========================================================================= */}
        {isCoWriterOpen && (
          <aside className="w-full md:w-80 lg:w-[420px] xl:w-[460px] border-t md:border-t-0 md:border-l border-black/[0.08] bg-zinc-50 flex flex-col shrink-0 overflow-hidden max-h-[50vh] md:max-h-none">
            {/* Header */}
            <div className="p-3 bg-purple-50/90 border-b border-purple-200 text-purple-950 shrink-0 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                    <span>AI Character Co-Director</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-200 text-purple-800">
                      Live
                    </span>
                  </h4>
                  <p className="text-[10px] text-purple-700">
                    Interactive back-and-forth character interview
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCoWriterOpen(false)}
                className="p-1 rounded-md text-purple-600 hover:text-purple-950 hover:bg-purple-100 transition-colors cursor-pointer"
                title="Hide side panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Toggle Bar: Co-Director Chat vs Quick Directives */}
            <div className="flex items-center gap-1 p-1.5 bg-purple-100/60 border-b border-purple-200 shrink-0">
              <button
                type="button"
                onClick={() => setCoWriterMode('chat')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  coWriterMode === 'chat'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-900 hover:bg-purple-200/50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Co-Director Interview</span>
              </button>
              <button
                type="button"
                onClick={() => setCoWriterMode('quick')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  coWriterMode === 'quick'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-900 hover:bg-purple-200/50'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Quick Batch Fill</span>
              </button>
            </div>

            {coWriterMode === 'chat' ? (
              <div className="flex-1 flex flex-col min-h-0 bg-zinc-50/50">
                {/* Focus Section Chips */}
                <div className="px-3 py-2 border-b border-zinc-200 bg-white flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 shrink-0 mr-1">Focus:</span>
                  {[
                    { id: 'visuals', label: '🎨 Visuals & Outfit' },
                    { id: 'lore', label: '📖 Lore & Origin' },
                    { id: 'voice', label: '💬 Voice & Tone' },
                    { id: 'gear', label: '💼 Skills & Gear' },
                    { id: 'full', label: '🌟 All' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStartChatForSection(s.id as any)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        chatFocusSection === s.id
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Chat Scroll Area */}
                <div
                  ref={chatScrollRef}
                  className="flex-1 p-3.5 space-y-3.5 overflow-y-auto min-h-0"
                >
                  {chatMessages.length === 0 && !isChatSending && (
                    <div className="p-6 text-center text-xs text-zinc-500 space-y-2">
                      <span className="text-2xl">🎬</span>
                      <p className="font-semibold text-zinc-700">Start brainstorming @{name || 'Character'} with the AI Co-Director!</p>
                      <p className="text-[11px] text-zinc-400">Tell what you need or tap a focus section above to begin the interview.</p>
                    </div>
                  )}

                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-1.5 ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 px-1">
                        <span>{msg.role === 'user' ? '👤 You' : '🎬 AI Co-Director'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[94%] ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-none shadow-xs font-medium'
                            : 'bg-white border border-zinc-200 text-zinc-900 rounded-tl-none shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>

                        {/* Co-Director Questions Box */}
                        {msg.questions && msg.questions.length > 0 && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 space-y-1">
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                              <span>❓</span>
                              <span>Co-Director Questions:</span>
                            </span>
                            <ul className="space-y-1 text-[11px] font-medium">
                              {msg.questions.map((q, qIdx) => (
                                <li key={qIdx} className="flex items-start gap-1.5">
                                  <span className="text-purple-600 font-bold">•</span>
                                  <span>{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Clickable Quick Option Pills */}
                        {msg.quickOptions && msg.quickOptions.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-zinc-100 space-y-1">
                            <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 block">
                              Quick-Answer Shortcuts:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.quickOptions.map((opt, optIdx) => (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSendChatMessage(opt)}
                                  className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-900 font-medium px-2.5 py-1 rounded-full border border-purple-200 transition-all cursor-pointer text-left shadow-2xs"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested Updates Card with 1-Click Apply */}
                        {msg.suggestedUpdates && Object.keys(msg.suggestedUpdates).length > 0 && (
                          <div className="mt-3 p-3 bg-gradient-to-b from-purple-50/50 to-indigo-50/50 border border-purple-200 rounded-xl space-y-2 text-zinc-800">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                <span>Drafted Dossier Updates</span>
                              </span>
                              {msg.applied && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  ✓ Applied
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 text-[11px]">
                              {msg.suggestedUpdates.appearance && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Face & Build:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.appearance}</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.wardrobe && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Wardrobe:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.wardrobe}</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.iconicItem && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Signature Prop:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.iconicItem}</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.backstory && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Backstory:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.backstory}</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.motivation && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Motivation:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.motivation}</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.flaws && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Fatal Flaw:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.flaws}</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.secret && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Secret:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.secret}</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.voiceTone && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Voice:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.voiceTone}</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.catchphrase && (
                                <div className="line-clamp-1">
                                  <strong className="text-zinc-900">Catchphrase:</strong>{' '}
                                  <span className="text-zinc-600">&ldquo;{msg.suggestedUpdates.catchphrase}&rdquo;</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.abilities && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Skills:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.abilities}</span>
                                </div>
                              )}
                              {msg.suggestedUpdates.gear && (
                                <div className="line-clamp-2">
                                  <strong className="text-zinc-900">Belongings:</strong>{' '}
                                  <span className="text-zinc-600">{msg.suggestedUpdates.gear}</span>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApplyChatUpdates(msg.id, msg.suggestedUpdates)}
                              disabled={msg.applied}
                              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                                msg.applied
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                              }`}
                            >
                              {msg.applied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>✓ Synced to Character Dossier</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Apply These Updates to Dossier</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isChatSending && (
                    <div className="flex items-center gap-2 p-3 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-500 shadow-2xs">
                      <Bot className="w-4 h-4 text-purple-600 animate-pulse" />
                      <span>Co-Director is thinking & crafting questions...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="p-3 bg-white border-t border-zinc-200 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Tell the AI what you need for @${name || 'Character'}...`}
                      disabled={isChatSending}
                      className="flex-1 py-2 px-3 text-xs bg-zinc-50 border border-zinc-300 focus:border-purple-600 focus:bg-white rounded-xl outline-none transition-all text-zinc-900"
                    />
                    <button
                      type="submit"
                      disabled={isChatSending || !chatInput.trim()}
                      className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl cursor-pointer disabled:opacity-40 transition-colors shrink-0"
                      title="Send message to AI Co-Director"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                  <p className="text-[10px] text-zinc-400 mt-1 pl-1">
                    💡 Ask questions or tell what you want (e.g. &ldquo;She wears red Louboutin stilettos and silk blazers&rdquo;)
                  </p>
                </div>
              </div>
            ) : (
              /* Quick Directives View (Original batch flow) */
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Directive Text Area */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Character Vision / Directive</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Highest Priority
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={coWriterDirective}
                    onChange={(e) => setCoWriterDirective(e.target.value)}
                    placeholder="e.g. She is an office love of the hero nothing else, she is not a hero that saves earth. Works in marketing, warm, funny, keeps him grounded with filter coffee..."
                    className="w-full p-3 bg-white border-2 border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-xs font-medium text-zinc-900 outline-none leading-relaxed shadow-2xs resize-y"
                  />
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    💡 Type plain instructions here: whether an office romance, schoolteacher, barista, or detective. Meta AI will strictly obey and avoid combat/superhero tropes!
                  </p>
                </div>

                {/* 1-Click Quick Archetype Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                    Quick Story Archetypes:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {[
                      {
                        label: '💕 Office Romance / Love Interest',
                        roleId: 'love-interest',
                        genderId: 'female',
                        directive: 'She is an everyday office love interest of the protagonist at their company. A warm, perceptive marketing colleague who has zero superpowers and saves no worlds, but keeps the hero emotionally grounded through shared coffee breaks, witty banters, and genuine care.',
                      },
                      {
                        label: '💼 Workplace Colleague / Teammate',
                        roleId: 'colleague',
                        genderId: 'female',
                        directive: 'Ambitious, sharp-witted colleague at the company. Professional, pragmatic, works on tight deadlines, drinks espresso, carries a leather portfolio. Grounded everyday corporate reality.',
                      },
                      {
                        label: '☕ Grounded Coffee Shop Confidante',
                        roleId: 'supporting',
                        genderId: 'female',
                        directive: 'Warm neighborhood café owner who serves as a safe haven and emotional anchor away from the city chaos. Observant, witty, makes the best brew in town.',
                      },
                      {
                        label: '🕵️ Tenacious City Reporter',
                        roleId: 'sidekick',
                        genderId: 'female',
                        directive: 'Street-smart investigative journalist digging into municipal corruption. Armed with a pocket notebook, audio recorder, and an uncompromising drive for the truth.',
                      },
                      {
                        label: '⚡ Heroic Tactical Companion',
                        roleId: 'sidekick',
                        genderId: 'female',
                        directive: 'Disciplined tactical ally with martial arts expertise and high-tech combat equipment fighting alongside the protagonist.',
                      },
                    ].map((arch) => (
                      <button
                        key={arch.label}
                        type="button"
                        onClick={() => {
                          setCoWriterDirective(arch.directive);
                          setRole(arch.roleId);
                          setGender(arch.genderId);
                        }}
                        className="px-2.5 py-1.5 text-left text-xs bg-white hover:bg-purple-50 border border-zinc-200 hover:border-purple-300 rounded-xl font-medium text-zinc-800 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span>{arch.label}</span>
                        <span className="text-[10px] text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">Use →</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Execution Actions */}
                <div className="pt-2 space-y-2 border-t border-zinc-200">
                  <button
                    type="button"
                    onClick={() => handleExecuteCoWriter(coWriterDirective, undefined, false)}
                    disabled={!name.trim() || isExpanding}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isExpanding ? 'animate-spin' : ''}`} />
                    <span>{isExpanding ? 'Meta AI Writing...' : '✨ Fill Empty Boxes with Meta AI'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Rewrite all dossier boxes for @${name || 'this character'} using your current directive?`)) {
                        handleExecuteCoWriter(coWriterDirective, undefined, true);
                      }
                    }}
                    disabled={!name.trim() || isExpanding}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw className="w-3 h-3 text-zinc-500" />
                    <span>🔄 Overwrite & Rewrite All Boxes</span>
                  </button>
                </div>

                {/* 1-Click Targeted Field Drafters */}
                <div className="pt-2 space-y-2 border-t border-zinc-200">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                    Draft Individual Fields On-Demand:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'backstory', label: '📖 Origin Lore' },
                      { id: 'motivation', label: '🎯 Motivation' },
                      { id: 'flaws', label: '⚠️ Fatal Flaw' },
                      { id: 'secret', label: '🔒 Secret Truth' },
                      { id: 'appearance', label: '🎨 Face & Body' },
                      { id: 'wardrobe', label: '👔 Outfit / Style' },
                      { id: 'voiceTone', label: '💬 Voice Cadence' },
                      { id: 'personality', label: '🧠 Personality' },
                      { id: 'abilities', label: '💼 Skills / Job' },
                      { id: 'gear', label: '🎒 Belongings' },
                    ].map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => handleExecuteCoWriter(coWriterDirective, field.id, true)}
                        disabled={fieldFleshing === field.id || isExpanding || !name.trim()}
                        className="px-2 py-1.5 text-xs text-left bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-700 font-medium transition-colors flex items-center justify-between cursor-pointer disabled:opacity-40"
                      >
                        <span className="truncate">{field.label}</span>
                        <Sparkles className={`w-2.5 h-2.5 text-purple-600 shrink-0 ${fieldFleshing === field.id ? 'animate-spin' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer status info */}
            <div className="p-3 bg-zinc-100 border-t border-zinc-200 text-[10px] text-zinc-500 flex items-center justify-between shrink-0 font-mono">
              <span>Llama 3.3 70B / Muse Spark</span>
              <span className="text-emerald-700 font-bold">● Active Co-Director</span>
            </div>
          </aside>
        )}
      </div>
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
