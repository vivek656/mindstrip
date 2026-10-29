export type ArtStyle = 
  | 'webcomic'      // Modern flat digital webtoon
  | 'manga'         // Dynamic black & white screentone
  | 'newspaper'     // Classic warm vintage newspaper
  | 'noir'          // High contrast moody graphic novel
  | 'minimalist'    // Crisp editorial ink linework
  | 'cyberpunk';

export type PerspectiveLens = 'candid' | 'stoic' | 'satirical' | 'empathetic' | 'engineer';

export type LayoutMode = 'page' | 'strip' | 'grid' | 'webtoon';

export interface ComicCharacter {
  id: string;
  name: string;
  role: 'protagonist' | 'sidekick' | 'antagonist' | 'supporting';
  gender?: 'male' | 'female' | 'non-binary' | 'robot-ai' | 'creature-other' | 'unspecified';
  appearance?: string; // Visual details: hair, clothing, signature accessories, physical style
  personality?: string; // Archetype or emotional vibe (e.g. sarcastic, hyper-focused, stoic)
  catchphrase?: string; // Signature quote or catchphrase
  description: string; // Backstory or role in the narrative
  avatarEmoji: string;
  traits: string[];
}

export interface SpeechBubble {
  id: string;
  speaker: string;
  text: string;
  type: 'speech' | 'thought' | 'whisper' | 'shout' | 'caption';
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

export interface ComicWorld {
  id: string;
  userId?: string; // Creator profile ID owning this universe
  title: string;
  tagline: string;
  genre: string;
  artStyle: ArtStyle;
  imageModel?: string; // Preferred image model for this universe
  characters: ComicCharacter[];
  episodes: ComicStrip[];
  createdAt: string;
  lore?: string; // Rich world backstory & rules
  environmentRules?: string[]; // Physics, magic, or tech rules in this universe
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
