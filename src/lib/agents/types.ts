import { ComicCharacter, ComicWorld, ComicStrip, ComicPanel, AgentTraceStep, ArtStyle, PerspectiveLens } from '@/types/comic';

export interface AgentContext {
  rawDump: string;
  artStyle: ArtStyle;
  lens: PerspectiveLens;
  characters?: ComicCharacter[];
  worldTitle?: string;
  genre?: string;
  storyContext?: string;
  layoutPreference?: 'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel';
  world?: ComicWorld;
  pastEpisodes?: ComicStrip[];
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
}

export interface ShowrunnerDraft {
  title: string;
  layoutStyle: '1-panel' | '2-panel' | '3-panel' | '4-panel';
  directorReasoning: string;
  coreTruth: string;
  recap: string;
  newFacts: string[];
  openThreads: string[];
  nextSuggestions: string[];
  directorQuestion?: {
    question: string;
    options: {
      label: string;
      beat: string;
    }[];
  };
  panels: ComicPanel[];
}

export interface CanonAuditViolation {
  code:
    | 'ANTAGONIST_OPPOSITION_FAILED'
    | 'WORLD_LAW_BREACH'
    | 'VOICE_TONE_MISMATCH'
    | 'TEXT_LABEL_IN_VISUAL'
    | 'CHARACTER_ANOMALY'
    | 'DELETED_OR_UNKNOWN_CHARACTER'
    | 'CIVILIAN_COMBAT_VIOLATION';
  severity: 'critical' | 'warning';
  panelNumber?: number;
  characterName?: string;
  description: string;
  critique: string;
  suggestedFix: string;
}

export interface CanonAuditResult {
  passed: boolean;
  canonScore: number; // 0 - 100
  violations: CanonAuditViolation[];
  critiqueSummary: string;
  suggestedFixes: string[];
}

export interface RagItem {
  id: string;
  type: 'past_episode' | 'world_law' | 'location' | 'character_lore' | 'open_thread' | 'character_visual_ref';
  title: string;
  content: string;
  relevanceScore: number; // 0.0 - 1.0
  imageUrl?: string;
}

export interface ProductionRoomResult {
  draft: ShowrunnerDraft;
  trace: AgentTraceStep[];
  canonScore: number;
  correctionsCount: number;
  ragMemories: RagItem[];
  artDirectorPrompt?: string;
}
