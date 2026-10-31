export type ArtStyle = 
  | 'webcomic'      // Modern flat digital webtoon
  | 'manga'         // Dynamic black & white screentone
  | 'newspaper'     // Classic warm vintage newspaper
  | 'noir'          // High contrast moody graphic novel
  | 'minimalist'    // Crisp editorial ink linework
  | 'cyberpunk'     // Glowing neon cyber
  | (string & {});  // Fully open for creator-defined custom art styles!

export type PerspectiveLens = 'candid' | 'stoic' | 'satirical' | 'empathetic' | 'engineer';

export type LayoutMode = 'page' | 'strip' | 'grid' | 'webtoon';

export interface CharacterRelationship {
  targetCharacterId?: string;
  targetCharacterName: string;
  relationType: 'ally' | 'rival' | 'mentor' | 'nemesis' | 'family' | 'romantic' | 'subordinate' | 'frenemy' | (string & {});
  dynamicDescription: string;
}

export interface CharacterReferenceImage {
  id: string;
  viewType: 'portrait' | 'full_body' | 'back_view' | 'model_sheet' | 'action_pose';
  label: string; // e.g. "Portrait / Face", "Full-Body Outfit", "Back Turnaround", "Model Sheet"
  imageUrl: string;
  prompt: string;
  createdAt: string;
  isLockedCanon?: boolean;
}

export interface ComicCharacter {
  id: string;
  name: string;
  role: 'protagonist' | 'sidekick' | 'antagonist' | 'supporting' | 'love-interest' | 'colleague' | (string & {}); // Custom roles allowed!
  gender?: 'male' | 'female' | 'non-binary' | 'robot-ai' | 'creature-other' | 'unspecified' | (string & {}); // Custom entities allowed!
  appearance?: string; // Visual details: hair, clothing, signature accessories, physical style
  personality?: string; // Archetype or emotional vibe (e.g. sarcastic, hyper-focused, stoic)
  catchphrase?: string; // Signature quote or catchphrase
  description: string; // Backstory or role in the narrative
  avatarEmoji: string;
  traits: string[];
  // Deep-dive fields for dedicated Character Studio / Dossier
  backstory?: string; // Deep origin story, formative history, traumas
  motivation?: string; // Core desire, driving ambition, what they want most
  flaws?: string; // Fatal flaw, psychological vulnerability, blindspot
  secret?: string; // Hidden truth or classified knowledge
  abilities?: string; // Powers, combat style, martial arts, special skills
  gear?: string; // Signature weapons, gadgets, vehicles, artifacts
  voiceTone?: string; // Dialogue cadence, vocabulary quirks, speaking habits
  wardrobe?: string; // Detailed everyday clothing and color scheme
  iconicItem?: string; // Signature silhouette accessory (e.g. cracked goggles, robotic arm)
  relationships?: CharacterRelationship[]; // Cast relationship dynamics
  // Character Visual Model Sheet & Reference Studio (Character Visual RAG)
  imageUrl?: string; // Primary locked canonical reference image
  characterSheetUrl?: string; // Multi-angle model sheet
  referenceImages?: CharacterReferenceImage[]; // Angle/view gallery (face, full-body, back, etc.)
  portraitRefUrl?: string; // Dedicated Face & portrait reference (for close-up shots)
  fullBodyRefUrl?: string; // Dedicated Full-Body & legs/costume reference (for wide/standing shots)
  backViewRefUrl?: string; // Dedicated Back turnaround reference (for rear shots)
  actionPoseRefUrl?: string; // Dedicated Action stance reference (for combat/action shots)
  modelSheetRefUrl?: string; // Dedicated Turnaround model sheet reference
}

export interface SpeechBubble {
  id: string;
  speaker: string;
  text: string;
  type: 'speech' | 'thought' | 'whisper' | 'shout' | 'caption' | (string & {}); // Custom speech types!
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export interface SegmentedElement {
  id: string;
  label: string;
  category: 'character' | 'expression' | 'speech_bubble' | 'prop' | 'background';
  box: [number, number, number, number];
  maskColor: string;
  confidence: number;
}

export interface ComicPanel {
  panelNumber: number;
  title: string;
  sceneDescription: string;
  visualMetaphor: string;
  characters: string[];
  bubbles: SpeechBubble[];
  soundEffect?: string;
  soundEffectPosition?: { x: number; y: number };
  mood: 'stressed' | 'chaotic' | 'epiphany' | 'serene' | 'determined' | 'humorous';
  imagePrompt: string;
  imageUrl?: string;
  segmentedElements?: SegmentedElement[];
}

export interface CognitiveAnalysis {
  initialBurdenScore: number;
  finalBurdenScore: number;
  primaryDistortion: string;
  antagonistPersonified: string;
  coreTruth: string;
  mentalSpaceFreedMinutes: number;
  actionBlueprint: {
    id: string;
    action: string;
    timeRequired: string;
    completed: boolean;
  }[];
}

export interface AgentTraceStep {
  id: string;
  agent: 'showrunner' | 'auditor' | 'art_director' | 'rag';
  agentName: string;
  action: string;
  status: 'passed' | 'warning' | 'critique' | 'revised' | 'approved';
  timestamp: string;
  score?: number;
  summary: string;
  thoughts?: string;
  violations?: string[];
  critique?: string;
  diff?: {
    field: string;
    before: string;
    after: string;
    reason: string;
  };
  anchors?: string[];
}

export interface ComicStrip {
  id: string;
  episodeNumber?: number;
  title: string;
  createdAt: string;
  domain: string;
  artStyle: ArtStyle;
  lens?: PerspectiveLens;
  rawBrainDump: string;
  pageImageUrl?: string; // Single full-page comic image containing multiple panels
  panels: ComicPanel[];
  cognitiveAnalysis: CognitiveAnalysis;
  metaModelUsed: string;
  // Continuity chain: written per episode, assembled into every future generation.
  recap?: string; // ≤80-word compressed memory of this episode
  newFacts?: string[]; // Canon facts this episode introduced
  openThreads?: string[]; // Unresolved hooks this episode left open
  generationNotice?: string; // Engine status notice (e.g. Meta Muse Spark 1.3 + Muse Image)
  generationError?: string; // Exact API error if synthesis encountered an issue
  layoutStyle?: '1-panel' | '2-panel' | '3-panel' | '4-panel'; // Dynamic panel format
  directorReasoning?: string; // Meta AI Agent rationale for why this pacing/layout was selected
  imageModel?: string; // Model used to synthesize page artwork (e.g. muse-image-1.0)
  pageCharacters?: ComicCharacter[]; // Characters specifically featured on this comic page
  guestCharacters?: ComicCharacter[]; // Temporary/episodic guest characters introduced on this page
  nextSuggestions?: string[]; // 2-3 proactive story continuation suggestions from the AI Co-Director
  directorQuestion?: {
    question: string; // The creative fork question (e.g. "What should happen next?")
    options: {
      label: string;
      beat: string;
    }[];
  };
  agentTrace?: AgentTraceStep[]; // Multi-Agent production deliberation log
  canonScore?: number; // Quality/continuity score (0-100) from Canon Auditor Agent
  correctionsCount?: number; // Number of self-corrections performed by agent loop
}

export interface CreatorProfile {
  id: string; // e.g. "usr_alex_84f2" or "guest_9x72"
  handle: string; // e.g. "alex"
  displayName: string; // e.g. "Alex"
  avatarEmoji: string; // e.g. "🎨"
  isGuest: boolean;
  pin?: string; // Optional simple passkey/PIN
  createdAt: string;
}

export interface WorldLocation {
  id: string;
  name: string; // e.g. "The Neon Citadel", "Desk 4B", "The Dialysis Suite"
  description: string; // Visual details for comic panels & background setting
  significance?: string; // Story significance or faction hub
}

export interface WorldLaw {
  id: string;
  title: string; // e.g. "Law of Equivalent Exchange", "The Friday Deploy Taboo"
  rule: string; // The exact rule, constraint, physics, or magic law
  category: 'physics' | 'magic' | 'social' | 'taboo' | 'custom' | (string & {});
}

export interface CustomWorldAttribute {
  id: string;
  key: string; // e.g. "Currency", "Weather Quirk", "Forbidden Technology"
  value: string; // e.g. "Cold brew", "Perpetual neon rain", "Uncontrolled AGI"
}

export interface ComicWorld {
  id: string;
  userId?: string; // Creator profile ID owning this universe
  userHandle?: string; // Creator @handle owning this universe
  title: string;
  tagline: string;
  genre: string;
  artStyle: ArtStyle;
  imageModel?: string; // Preferred image model for this universe
  characters: ComicCharacter[];
  guestCharacters?: ComicCharacter[]; // Temporary/episodic characters that can be promoted to core cast
  episodes: ComicStrip[];
  createdAt: string;
  lore?: string; // Rich world backstory & ongoing conflict
  environmentRules?: string[]; // Legacy compatibility
  laws?: WorldLaw[]; // Universal Laws & Constraints (Physics, Magic, Social, Taboo)
  locations?: WorldLocation[]; // Canonical locations & staging landmarks
  customAttributes?: CustomWorldAttribute[]; // Custom world parameters (Currency, Weather, Tech level, etc.)
  parentWorldId?: string; // ID of parent universe if this timeline is branched
  branchPointEpisodeNumber?: number; // Which episode this timeline branched from
  branchName?: string; // e.g. "Timeline B: What If..."
}

export interface PresetScenario {
  id: string;
  domain: 'founder' | 'engineering' | 'healthcare' | 'personal' | 'executive';
  title: string;
  tagline: string;
  icon: string;
  rawDump: string;
  recommendedStyle: ArtStyle;
  recommendedLens?: PerspectiveLens;
}

export interface CoDirectorChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  synthesizedPremise?: string;
  castSpotlight?: string[];
  castExcluded?: string[];
  suggestedPanels?: { panelNumber: number; description: string; dialogue?: string }[];
  quickStarters?: string[];
}

