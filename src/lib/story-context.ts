// Story-context engine: the internals behind continuity.
// UX shows one image per page; THIS is what the AI sees every generation:
// bible first, compressed chain in the middle, full detail on demand, task last.

import { ComicWorld, ComicStrip } from '@/types/comic';

export interface EpisodeRecap {
  recap: string;
  newFacts: string[];
  openThreads: string[];
}

/**
 * Deterministic recap writer. Runs locally on every generated strip (both
 * modes), so continuity never depends on a model call succeeding. When the
 * model already supplied recap fields (Meta mode schema), those win.
 */
export function writeRecap(strip: ComicStrip): EpisodeRecap {
  if (strip.recap) {
    return {
      recap: strip.recap,
      newFacts: strip.newFacts ?? [],
      openThreads: strip.openThreads ?? [],
    };
  }
  const beats = strip.panels.map((p) => p.title).filter(Boolean);
  const core = strip.cognitiveAnalysis?.coreTruth || '';
  const words = `${strip.title}. ${core}`.split(/\s+/).filter(Boolean);
  const recap =
    words.slice(0, 80).join(' ') + (words.length > 80 ? '…' : '');
  return {
    recap,
    newFacts: beats.slice(0, 6),
    // Heuristic pass cannot infer unresolved hooks; Meta mode fills these
    // via the response schema and assembly carries recent ones forward.
    openThreads: [],
  };
}

/** Full episode text for pointer resolution — the whole scene, not a summary. */
export function episodeFullText(ep: ComicStrip): string {
  const beats = ep.panels
    .map((p) => `[${p.title}] ${p.sceneDescription}`)
    .join(' ');
  const takeaway = ep.cognitiveAnalysis?.coreTruth || '';
  return (
    `Episode #${ep.episodeNumber ?? '?'} "${ep.title}": ` +
    `premise: ${ep.rawBrainDump} beats: ${beats} takeaway: ${takeaway}`
  );
}

/**
 * Pointer resolution: "@ep3" / "episode 3" / "ep 3" in the premise pulls the
 * FULL text of the referenced episode into context. An episode mention is a
 * lorebook trigger whose entry is another episode — deterministic, no
 * embeddings needed at this scale.
 */
export function resolvePointers(
  premise: string,
  episodes: ComicStrip[]
): ComicStrip[] {
  const hits = new Set<number>();
  const re = /(?:@ep|episode\s*#?\s*|ep\s*#?\s*)(\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(premise)) !== null) {
    hits.add(parseInt(m[1], 10));
  }
  if (hits.size === 0) return [];
  return episodes.filter((ep) => hits.has(ep.episodeNumber ?? -1));
}

/** Pinned world bible: fixed canon, injected FIRST, never truncated. */
export function buildWorldBible(world: ComicWorld): string {
  const cast = world.characters
    .map((c) => {
      const anchor = (c.appearance || c.description || '').trim();
      const roleAndGender = [c.role, c.gender && c.gender !== 'unspecified' ? c.gender : null]
        .filter(Boolean)
        .join(', ');
      const line = anchor ? `${c.name} (${roleAndGender}): ${anchor}` : `${c.name} (${roleAndGender})`;
      return c.catchphrase ? `${line} Catchphrase: "${c.catchphrase}"` : line;
    })
    .join('\n');

  const lawsList: string[] = [];
  if (world.laws && world.laws.length > 0) {
    world.laws.forEach((l) => {
      lawsList.push(`• [${l.category.toUpperCase()}] ${l.title}: ${l.rule}`);
    });
  }
  if (world.environmentRules && world.environmentRules.length > 0) {
    world.environmentRules.forEach((r) => {
      if (!lawsList.some((existing) => existing.includes(r))) {
        lawsList.push(`• ${r}`);
      }
    });
  }

  const locationsList = (world.locations || [])
    .map((loc) => `• ${loc.name}: ${loc.description}${loc.significance ? ` (${loc.significance})` : ''}`)
    .join('\n');

  const customAttrsList = (world.customAttributes || [])
    .map((attr) => `• ${attr.key}: ${attr.value}`)
    .join('\n');

  const sections = [
    'WORLD BIBLE — canonical, never contradict:',
    `World: ${world.title} (${world.tagline}) | Genre: ${world.genre}`,
    `Art Style: ${world.artStyle} comic art, bold ink outlines.`,
  ];

  if (world.lore) {
    sections.push(`WORLD LORE & BACKSTORY:\n${world.lore.trim()}`);
  }

  if (lawsList.length > 0) {
    sections.push(`UNIVERSAL LAWS & RULES (must strictly govern all physics, logic & plot stakes):\n${lawsList.join('\n')}`);
  }

  if (locationsList) {
    sections.push(`CANON LOCATIONS (stage scenes & backgrounds in these settings):\n${locationsList}`);
  }

  if (customAttrsList) {
    sections.push(`WORLD PARAMETERS & DETAILS:\n${customAttrsList}`);
  }

  sections.push(`CAST (appearance locked — repeat verbatim in art):\n${cast || '(no cast defined)'}`);

  return sections.join('\n\n');
}

/**
 * Assemble the full generation context under a character budget.
 * Order: bible → canon deltas → recap chain → pointed full episodes.
 * Oldest recaps truncate first; bible is never cut.
 */
export function buildStoryContext(
  world: ComicWorld,
  premise: string,
  opts?: { budgetChars?: number }
): string {
  const budget = opts?.budgetChars ?? 6000;
  const bible = buildWorldBible(world);
  const episodes = world.episodes || [];

  const canon = episodes
    .flatMap((ep) =>
      (ep.newFacts ?? []).map((f) => `[Ep${ep.episodeNumber ?? '?'}] ${f}`)
    )
    .join('\n');

  // Recap chain: "what happened before that pointer", oldest first.
  let chain = episodes.map(
    (ep) => `[Ep${ep.episodeNumber ?? '?'} recap] ${ep.recap || '(no recap — early episode)'}`
  );

  const pointed = resolvePointers(premise, episodes);
  const pointerBlock = pointed.map(episodeFullText).join('\n\n');

  const openThreads = Array.from(
    new Set(episodes.slice(-3).flatMap((ep) => ep.openThreads ?? []))
  ).slice(0, 5);

  // Fit the variable middle under budget; bible + pointers are protected.
  let chainText = chain.join('\n');
  const fixed = bible.length + canon.length + pointerBlock.length + 200;
  const room = Math.max(0, budget - fixed);
  while (chainText.length > room && chain.length > 1) {
    chain = chain.slice(1); // drop oldest recap first
    chainText = chain.join('\n');
  }
  if (chainText.length > room) chainText = room > 0 ? chainText.slice(-room) : '';

  const parts = [bible];
  if (canon) parts.push(`ESTABLISHED CANON:\n${canon}`);
  if (chainText) parts.push(`STORY SO FAR (oldest first):\n${chainText}`);
  if (openThreads.length > 0) {
    parts.push(`OPEN THREADS (resolve or continue, never silently drop):\n${openThreads.map((t) => `- ${t}`).join('\n')}`);
  }
  if (pointerBlock) {
    parts.push(
      `REFERENCED EPISODES (user pointed here — full text, highest attention):\n${pointerBlock}`
    );
  }
  return parts.join('\n\n');
}
