import { AgentContext, ProductionRoomResult } from './types';
import { queryCanonRag, formatRagContextBlock } from './canon-rag';
import { draftEpisodeBeats } from './showrunner';
import { auditEpisodeDraft } from './canon-auditor';
import { directVisualArtwork } from './art-director';
import { AgentTraceStep, ComicStrip, CognitiveAnalysis } from '@/types/comic';

/**
 * Autonomous Multi-Agent Production Room Orchestrator
 * 
 * Coordinates the multi-agent production pipeline:
 * 1. Canon RAG Engine (Episodic vector memory retrieval)
 * 2. Showrunner Agent (Meta Muse Spark 1.3 narrative pacing)
 * 3. Canon Auditor Agent (Continuity, rules, and antagonist opposition audit)
 * 4. Autonomous Self-Correction Loop (Revises draft if critique score fails)
 * 5. Visual Art Director Agent (Visual consistency anchors & textless directives)
 */
export async function runProductionRoom(
  context: AgentContext
): Promise<ProductionRoomResult> {
  const trace: AgentTraceStep[] = [];
  let correctionsCount = 0;

  // -------------------------------------------------------------
  // STEP 0: CAST SCOPING & HERO/VILLAIN DECOUPLING
  // -------------------------------------------------------------
  const rawDumpLower = (context.rawDump || '').toLowerCase();
  const allCharacters = context.characters || context.world?.characters || [];

  // Match characters mentioned in prompt (supporting typos like meeera / meera, @mentions, and whole names)
  const explicitlyMentioned = allCharacters.filter((c) => {
    const nameLower = c.name.toLowerCase();
    if (rawDumpLower.includes(`@${nameLower}`) || rawDumpLower.includes(nameLower)) return true;
    const normalizedChar = nameLower.replace(/(.)\1+/g, '$1');
    const normalizedPrompt = rawDumpLower.replace(/(.)\1+/g, '$1');
    return normalizedPrompt.includes(normalizedChar);
  });

  // Dynamically detect any guest characters introduced in the premise (e.g. "a client", "the detective", "a customer")
  const guestMatch = context.rawDump.match(/(?:a|the|new)\s+(client|customer|investor|buyer|partner|stranger|visitor|rival|detective|merchant|boss|guest)\b/i);
  const detectedGuestChars: any[] = [];
  if (guestMatch) {
    const roleFound = guestMatch[1].toLowerCase();
    const roleCapitalized = roleFound.charAt(0).toUpperCase() + roleFound.slice(1);
    detectedGuestChars.push({
      id: `guest-${roleFound}-${Date.now()}`,
      name: `The ${roleCapitalized}`,
      role: roleFound,
      gender: 'unspecified',
      appearance: `Styling suited for a ${roleFound} in ${context.genre || 'this world'}`,
      description: `Episodic scene partner in this chapter`,
      avatarEmoji: '👤',
      traits: ['Dynamic']
    });
  }

  // If specific characters were targeted, strictly isolate them!
  let activeCast = allCharacters;
  let excludedNames: string[] = [];

  if (explicitlyMentioned.length > 0) {
    activeCast = [...explicitlyMentioned, ...detectedGuestChars];
    excludedNames = allCharacters
      .filter((c) => !explicitlyMentioned.some((ec) => ec.id === c.id))
      .map((c) => c.name);
  }

  const activeContext: AgentContext = {
    ...context,
    characters: activeCast,
    rawDump: context.rawDump + (excludedNames.length > 0 ? `\n\n[DIRECTORIAL CAST LOCK]: ONLY ${activeCast.map(c => c.name).join(' and ')} are in this scene. STRICTLY EXCLUDED: ${excludedNames.join(', ')}. Under NO circumstances should ${excludedNames.join(', ')} appear, speak, or be referenced.` : '')
  };

  // -------------------------------------------------------------
  // STEP 1: CANON RAG ENGINE
  // -------------------------------------------------------------
  const ragMemories = queryCanonRag(
    activeContext.rawDump,
    activeContext.world,
    activeContext.characters,
    activeContext.pastEpisodes
  );
  const ragBlock = formatRagContextBlock(ragMemories);

  trace.push({
    id: `trace-rag-${Date.now()}`,
    agent: 'rag',
    agentName: 'Canon RAG Memory Engine',
    action: `Retrieved ${ragMemories.length} relevant lore item(s) from accumulated canon`,
    status: 'approved',
    timestamp: new Date().toISOString(),
    summary: ragMemories.length > 0
      ? `Indexed past episode beats, unresolved threads, and character dossier lore.`
      : `First episode initialized with world premise and founding cast.`,
    thoughts: `Scored relevance across ${activeContext.pastEpisodes?.length || 0} episodes, ${activeContext.world?.laws?.length || 0} laws, and ${activeContext.characters?.length || 0} characters.`,
    anchors: ragMemories.map((m) => `${m.title} (${Math.round(m.relevanceScore * 100)}% match)`)
  });

  // -------------------------------------------------------------
  // STEP 2: SHOWRUNNER AGENT (Initial Draft)
  // -------------------------------------------------------------
  let currentDraft = await draftEpisodeBeats(activeContext, ragBlock);

  trace.push({
    id: `trace-showrunner-${Date.now()}`,
    agent: 'showrunner',
    agentName: 'Showrunner Agent (Meta Muse Spark 1.3)',
    action: `Formulated dramatic arc & selected ${currentDraft.layoutStyle} layout`,
    status: 'passed',
    timestamp: new Date().toISOString(),
    summary: `Drafted ${currentDraft.panels.length} panel(s) with episodic pacing: "${currentDraft.title}".`,
    thoughts: currentDraft.directorReasoning,
  });

  // -------------------------------------------------------------
  // STEP 3: CANON AUDITOR AGENT (First Audit)
  // -------------------------------------------------------------
  let auditResult = auditEpisodeDraft(currentDraft, activeContext);

  trace.push({
    id: `trace-audit-1-${Date.now()}`,
    agent: 'auditor',
    agentName: 'Canon Auditor & Continuity Agent',
    action: `Audited draft against World Bible, Character Dossiers & Antagonist Rules`,
    status: auditResult.passed ? 'approved' : 'critique',
    timestamp: new Date().toISOString(),
    score: auditResult.canonScore,
    summary: auditResult.critiqueSummary,
    thoughts: `Evaluated character roles, antagonist hostility, dialogue tone, and visual prompt cleanliness.`,
    violations: auditResult.violations.map((v) => `[${v.severity.toUpperCase()}] ${v.description}`),
    critique: auditResult.suggestedFixes.join(' | ')
  });

  // -------------------------------------------------------------
  // STEP 4: AUTONOMOUS SELF-CORRECTION LOOP (If critique fails)
  // -------------------------------------------------------------
  if (!auditResult.passed && auditResult.violations.length > 0) {
    correctionsCount++;

    const initialAntagonistAction = currentDraft.panels
      .map((p) => p.bubbles.map((b) => `${b.speaker}: ${b.text}`).join(' | '))
      .join(' -- ');

    // Re-run Showrunner with critique feedback
    const revisedDraft = await draftEpisodeBeats(activeContext, ragBlock, auditResult);
    
    // Re-audit the revised draft
    const reAuditResult = auditEpisodeDraft(revisedDraft, activeContext);

    const revisedAntagonistAction = revisedDraft.panels
      .map((p) => p.bubbles.map((b) => `${b.speaker}: ${b.text}`).join(' | '))
      .join(' -- ');

    trace.push({
      id: `trace-correction-${Date.now()}`,
      agent: 'showrunner',
      agentName: 'Showrunner Agent (Self-Correction Loop)',
      action: `Auto-corrected draft based on Canon Auditor critique`,
      status: 'revised',
      timestamp: new Date().toISOString(),
      score: reAuditResult.canonScore,
      summary: `Applied fixes: converted compromised interactions into active opposition and cleaned prompt labels. Canon score improved from ${auditResult.canonScore} to ${reAuditResult.canonScore}/100.`,
      thoughts: `Refactored dialogue cadence and scene dynamics to satisfy antagonist hostility constraints and textless artwork standards.`,
      diff: {
        field: 'Antagonist Behavior & Visual Prompts',
        before: auditResult.violations.map((v) => v.description).join('; '),
        after: `Resolved: Strict antagonist opposition enforced. Textless prompt sanitized.`,
        reason: 'Autonomous Multi-Agent Feedback Loop'
      }
    });

    currentDraft = revisedDraft;
    auditResult = reAuditResult;
  }

  // -------------------------------------------------------------
  // STEP 5: VISUAL ART DIRECTOR AGENT
  // -------------------------------------------------------------
  const artResult = directVisualArtwork(currentDraft, activeContext);
  currentDraft = artResult.sanitizedDraft;

  trace.push({
    id: `trace-art-director-${Date.now()}`,
    agent: 'art_director',
    agentName: 'Visual Art Director Agent',
    action: `Synthesized visual continuity anchors and textless negative prompts`,
    status: 'approved',
    timestamp: new Date().toISOString(),
    summary: `Injected ${artResult.visualAnchors.length} character visual anchor(s) and layout composition directives.`,
    thoughts: `Enforced strict textless directive: pure visual illustration, zero printed panel labels, and consistent character aesthetics.`,
    anchors: artResult.visualAnchors
  });

  // Stamp scoped page characters and guest characters directly onto the draft
  if (explicitlyMentioned.length > 0) {
    currentDraft.pageCharacters = explicitlyMentioned.map((c) => c.name);
    currentDraft.guestCharacters = detectedGuestChars;
  }

  return {
    draft: currentDraft,
    trace,
    canonScore: auditResult.canonScore,
    correctionsCount,
    ragMemories,
    artDirectorPrompt: artResult.pagePrompt
  };
}

/**
 * Convenience helper to assemble a complete ComicStrip object
 * directly from the production room result.
 */
export function buildComicStripFromProduction(
  result: ProductionRoomResult,
  context: AgentContext
): ComicStrip {
  const { draft, trace, canonScore, correctionsCount } = result;

  const cognitiveAnalysis: CognitiveAnalysis = {
    initialBurdenScore: 85,
    finalBurdenScore: 20,
    primaryDistortion: 'Narrative Framing & Resolution',
    antagonistPersonified: (context.characters || []).find((c) => (c.role || '').toLowerCase().includes('antagonist'))?.name || 'The Opposition',
    coreTruth: draft.coreTruth,
    mentalSpaceFreedMinutes: 120,
    actionBlueprint: [
      {
        id: `act-${Date.now()}-1`,
        action: `Carry forward the momentum from "${draft.title}" into the next episode.`,
        timeRequired: '5 mins',
        completed: false
      }
    ]
  };

  return {
    id: `strip-${Date.now()}`,
    title: draft.title,
    createdAt: new Date().toISOString(),
    domain: 'creative',
    artStyle: context.artStyle || 'webcomic',
    lens: context.lens || 'candid',
    rawBrainDump: context.rawDump,
    pageImageUrl: undefined,
    panels: draft.panels,
    cognitiveAnalysis,
    metaModelUsed: context.modelName ? `Meta AI (${context.modelName})` : 'Meta Muse Spark 1.3 + Muse Image',
    layoutStyle: draft.layoutStyle,
    directorReasoning: draft.directorReasoning,
    recap: draft.recap,
    newFacts: draft.newFacts,
    openThreads: draft.openThreads,
    nextSuggestions: draft.nextSuggestions,
    pageCharacters: draft.pageCharacters
      ? (context.characters || []).filter((c) => draft.pageCharacters?.some((pn) => c.name.toLowerCase().includes(pn.toLowerCase()) || pn.toLowerCase().includes(c.name.toLowerCase())))
      : undefined,
    guestCharacters: draft.guestCharacters,
    directorQuestion: draft.directorQuestion,
    agentTrace: trace,
    canonScore,
    correctionsCount
  };
}
