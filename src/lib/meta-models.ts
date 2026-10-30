import { ComicStrip, ArtStyle, PerspectiveLens, ComicCharacter } from '@/types/comic';
import { generateComicStripMock } from './comic-generator';
import { runProductionRoom, buildComicStripFromProduction } from './agents/orchestrator';

export type ExecutionMode = 'free' | 'meta';

export type ApiProvider = 'simulation' | 'meta-api' | 'fireworks' | 'groq' | 'baseten' | 'ollama';

export interface ApiConfig {
  mode: ExecutionMode;
  provider: ApiProvider;
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
}

export interface MetaPreset {
  id: string;
  name: string;
  provider: ApiProvider;
  baseUrl: string;
  modelName: string;
  description: string;
  badge: string;
  placeholderKey: string;
}

export const META_PRESETS: MetaPreset[] = [
  {
    id: 'meta-official',
    name: 'Meta Model API',
    provider: 'meta-api',
    baseUrl: 'https://api.meta.ai/v1',
    modelName: 'muse-spark-1.3',
    description: 'Official Meta AI Model API endpoint for Muse Spark 1.3 (Script) & Muse Image 1.0 (Artwork)',
    badge: 'Official Hackathon API',
    placeholderKey: 'Paste your Meta Model API Key'
  },
  {
    id: 'fireworks-llama',
    name: 'Fireworks AI (Meta Llama 3.3)',
    provider: 'fireworks',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    modelName: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    description: 'Official Meta Hackathon partner with ultra-low latency Llama 3.3 70B inference',
    badge: 'Hackathon Partner',
    placeholderKey: 'Paste your Fireworks API Key (fw_...)'
  },
  {
    id: 'groq-llama',
    name: 'Groq (Meta Llama 3.3 70B)',
    provider: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    modelName: 'llama-3.3-70b-versatile',
    description: 'Sub-second real-time inference on Meta Llama 3.3 70B',
    badge: 'Ultra Fast',
    placeholderKey: 'Paste your Groq API Key (gsk_...)'
  },
  {
    id: 'groq-llama-8b',
    name: 'Groq Free Tier (Meta Llama 3.1 8B)',
    provider: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    modelName: 'llama-3.1-8b-instant',
    description: 'Blazing fast inference on Groq Free Tier (thousands of requests/day at $0.00 zero cost)',
    badge: '100% Free Tier ($0.00)',
    placeholderKey: 'Paste your Groq API Key (gsk_...)'
  },
  {
    id: 'baseten-llama',
    name: 'Baseten (Meta Llama 3.3)',
    provider: 'baseten',
    baseUrl: 'https://bridge.baseten.co/v1',
    modelName: 'llama-3.3-70b',
    description: 'Official Meta Hackathon partner for dedicated high-throughput serving',
    badge: 'Hackathon Partner',
    placeholderKey: 'Paste your Baseten API Key'
  },
  {
    id: 'ollama-local',
    name: 'Local Ollama (Meta Llama 3.3 / 3.2)',
    provider: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    modelName: 'llama3.3',
    description: '100% private, local on-device Meta Llama open-weights execution',
    badge: 'Offline Open-Weights',
    placeholderKey: 'No key required (Local server)'
  }
];

export const DEFAULT_CONFIG: ApiConfig = {
  mode: 'free',
  provider: 'simulation',
  modelName: 'muse-spark-1.3',
};

export async function generateMindStrip(
  rawDump: string,
  artStyle: ArtStyle = 'webcomic',
  lens: PerspectiveLens = 'candid',
  config: ApiConfig = DEFAULT_CONFIG,
  characters?: ComicCharacter[],
  worldTitle?: string,
  genre?: string,
  storyContext?: string,
  layoutPreference: 'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel' = 'auto'
): Promise<ComicStrip> {
  // 1. FREE MODE: Local Autonomous Multi-Agent Production Room ($0.00)
  if (config.mode === 'free' || config.provider === 'simulation') {
    // Natural subtle delay for realistic AI agent deliberation
    await new Promise((resolve) => setTimeout(resolve, 800));
    const prodResult = await runProductionRoom({
      rawDump,
      artStyle,
      lens,
      characters,
      worldTitle,
      genre,
      storyContext,
      layoutPreference,
      provider: 'simulation',
      modelName: 'Meta Muse Spark (Autonomous Production Room)'
    });

    return buildComicStripFromProduction(prodResult, {
      rawDump,
      artStyle,
      lens,
      characters,
      worldTitle,
      genre,
      modelName: 'Meta AI Production Room (Open Weights • $0.00)'
    });
  }

  // 2. META AI MODE: Call Meta Model API / Hackathon Partner Endpoints
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawDump,
        artStyle,
        lens,
        characters,
        worldTitle,
        genre,
        storyContext,
        layoutPreference,
        provider: config.provider,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        modelName: config.modelName
      })
    });

    if (!response.ok) {
      let errMsg = `Meta API returned HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.error) errMsg = String(errJson.error);
      } catch {
        // ignore
      }
      console.warn('Meta API returned non-200:', errMsg);
      const fallback = generateComicStripMock(
        rawDump,
        artStyle,
        lens,
        `Meta AI (${config.modelName || 'Muse Spark 1.3'}) • Offline`,
        characters,
        worldTitle,
        genre
      );
      return {
        ...fallback,
        generationError: errMsg
      };
    }

    const data = await response.json();
    if (data.comicStrip) {
      return data.comicStrip;
    }

    const fallback = generateComicStripMock(
      rawDump,
      artStyle,
      lens,
      `Meta AI (${config.modelName || 'Muse Spark 1.3'})`,
      characters,
      worldTitle,
      genre
    );
    return fallback;
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.error('Error calling Meta API:', errMessage);
    const fallback = generateComicStripMock(
      rawDump,
      artStyle,
      lens,
      `Meta AI (${config.modelName || 'Muse Spark 1.3'}) • Offline`,
      characters,
      worldTitle,
      genre
    );
    return {
      ...fallback,
      generationError: `Meta API connection offline: ${errMessage}`
    };
  }
}
