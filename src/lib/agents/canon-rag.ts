import { ComicWorld, ComicCharacter, ComicStrip } from '@/types/comic';
import { RagItem } from './types';

/**
 * Canon RAG Engine (Episodic Vector & Keyword Memory Retrieval)
 * 
 * Computes semantic & token relevance between the creator's current episode premise
 * and the universe's accumulated lore:
 * - Past episode beats, takeaways & unresolved threads
 * - Canonical world laws & taboos
 * - Staging locations
 * - Character backstories, motivations, secrets, and relationship ties
 */
export function queryCanonRag(
  premise: string,
  world?: ComicWorld,
  characters?: ComicCharacter[],
  pastEpisodes?: ComicStrip[]
): RagItem[] {
  if (!world && !characters && !pastEpisodes) return [];

  const queryTerms = premise
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const calculateScore = (text: string, boost = 1.0): number => {
    if (!text) return 0;
    const lower = text.toLowerCase();
    let hits = 0;
    for (const term of queryTerms) {
      if (lower.includes(term)) hits++;
    }
    // Normalized score between 0.1 and 1.0
    const raw = (hits / Math.max(queryTerms.length, 1)) * boost;
    return Math.min(1.0, Math.max(0.15, raw));
  };

  const results: RagItem[] = [];

  // 1. Index and score past episodes (recaps, takeaways, open threads)
  const episodes = pastEpisodes !== undefined ? pastEpisodes : (world?.episodes || []);
  episodes.forEach((ep, idx) => {
    const epNum = ep.episodeNumber || idx + 1;
    const combined = `${ep.title} ${ep.rawBrainDump} ${ep.recap || ''} ${(ep.openThreads || []).join(' ')} ${(ep.newFacts || []).join(' ')}`;
    const score = calculateScore(combined, 1.2);
    if (score > 0.25 || idx === episodes.length - 1) {
      results.push({
        id: `rag-ep-${ep.id || idx}`,
        type: 'past_episode',
        title: `Episode #${epNum}: ${ep.title}`,
        content: ep.recap || ep.rawBrainDump || `Scene with ${ep.panels.length} panels`,
        relevanceScore: Math.round(score * 100) / 100
      });
    }

    // Index unresolved open threads
    (ep.openThreads || []).forEach((thread, tIdx) => {
      const tScore = calculateScore(thread, 1.4);
      if (tScore > 0.3) {
        results.push({
          id: `rag-thread-${ep.id}-${tIdx}`,
          type: 'open_thread',
          title: `Unresolved Thread from Ep #${epNum}`,
          content: thread,
          relevanceScore: Math.round(tScore * 100) / 100
        });
      }
    });
  });

  // 2. Index and score Universal Laws
  (world?.laws || []).forEach((law) => {
    const combined = `${law.title} ${law.rule} ${law.category}`;
    const score = calculateScore(combined, 1.3);
    if (score > 0.25) {
      results.push({
        id: `rag-law-${law.id}`,
        type: 'world_law',
        title: `[Law: ${law.category.toUpperCase()}] ${law.title}`,
        content: law.rule,
        relevanceScore: Math.round(score * 100) / 100
      });
    }
  });

  // 3. Index and score Canonical Locations
  (world?.locations || []).forEach((loc) => {
    const combined = `${loc.name} ${loc.description} ${loc.significance || ''}`;
    const score = calculateScore(combined, 1.1);
    if (score > 0.25) {
      results.push({
        id: `rag-loc-${loc.id}`,
        type: 'location',
        title: `Location: ${loc.name}`,
        content: `${loc.description}${loc.significance ? ` (${loc.significance})` : ''}`,
        relevanceScore: Math.round(score * 100) / 100
      });
    }
  });

  // 4. Index and score Character Lore (dossier secrets, motivations, relationships)
  const cast = characters || world?.characters || [];
  cast.forEach((char) => {
    const combined = `${char.name} ${char.role} ${char.motivation || ''} ${char.flaws || ''} ${char.secret || ''} ${char.personality || ''}`;
    const score = calculateScore(combined, 1.25);
    if (score > 0.3) {
      const details = [
        char.motivation ? `Drive: ${char.motivation}` : null,
        char.secret ? `Secret: ${char.secret}` : null,
        char.flaws ? `Flaw: ${char.flaws}` : null,
        char.relationships && char.relationships.length > 0
          ? `Ties: ${char.relationships.map((r) => `${r.relationType} to ${r.targetCharacterName}`).join(', ')}`
          : null
      ].filter(Boolean).join(' | ');

      results.push({
        id: `rag-char-${char.id}`,
        type: 'character_lore',
        title: `Character Dossier: ${char.name} (${char.role})`,
        content: details || char.description || char.appearance || 'Core character',
        relevanceScore: Math.round(score * 100) / 100
      });
    }

    // Index locked visual reference images (Character Visual RAG - Multi-Angle)
    if (char.imageUrl) {
      results.push({
        id: `rag-char-vis-${char.id}`,
        type: 'character_visual_ref',
        title: `Visual Reference: @${char.name} (Canonical Master)`,
        content: `Master canonical reference image. Features: ${char.appearance || 'Standard'}. Wardrobe: ${char.wardrobe || 'Standard'}. Props: ${char.iconicItem || 'None'}. Visual URL: ${char.imageUrl}`,
        imageUrl: char.imageUrl,
        relevanceScore: 0.99
      });
    }

    if (char.portraitRefUrl && char.portraitRefUrl !== char.imageUrl) {
      results.push({
        id: `rag-char-face-${char.id}`,
        type: 'character_visual_ref',
        title: `Face & Expression Reference: @${char.name}`,
        content: `Close-up bust reference for facial anatomy, eye color, and facial expression consistency. Features: ${char.appearance || 'Standard'}. Face URL: ${char.portraitRefUrl}`,
        imageUrl: char.portraitRefUrl,
        relevanceScore: 0.97
      });
    }

    if (char.fullBodyRefUrl && char.fullBodyRefUrl !== char.imageUrl) {
      results.push({
        id: `rag-char-body-${char.id}`,
        type: 'character_visual_ref',
        title: `Full-Body Outfit & Legs Reference: @${char.name}`,
        content: `Head-to-toe full body reference for costume silhouette, torso, legs, and boots consistency. Wardrobe: ${char.wardrobe || 'Standard'}. Full Body URL: ${char.fullBodyRefUrl}`,
        imageUrl: char.fullBodyRefUrl,
        relevanceScore: 0.96
      });
    }

    if (char.backViewRefUrl && char.backViewRefUrl !== char.imageUrl) {
      results.push({
        id: `rag-char-back-${char.id}`,
        type: 'character_visual_ref',
        title: `Back Turnaround Reference: @${char.name}`,
        content: `Rear angle turnaround reference for hair from behind, coat back, and rear silhouette. Back URL: ${char.backViewRefUrl}`,
        imageUrl: char.backViewRefUrl,
        relevanceScore: 0.95
      });
    }

    if (char.actionPoseRefUrl && char.actionPoseRefUrl !== char.imageUrl) {
      results.push({
        id: `rag-char-act-${char.id}`,
        type: 'character_visual_ref',
        title: `Signature Pose Reference: @${char.name}`,
        content: `Signature posture and attitude reference for character posture consistency. Action/Pose URL: ${char.actionPoseRefUrl}`,
        imageUrl: char.actionPoseRefUrl,
        relevanceScore: 0.95
      });
    }
  });

  // Sort descending by relevance score and take the top 5
  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}

export function formatRagContextBlock(memories: RagItem[]): string {
  if (memories.length === 0) return '';
  const lines = memories.map(
    (m) => `• [RAG Citation: ${m.title} (Relevance: ${Math.round(m.relevanceScore * 100)}%)] -> ${m.content}`
  );
  return `CANON RAG RETRIEVED MEMORIES (Incorporate into narrative continuity):\n${lines.join('\n')}`;
}
