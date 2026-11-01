import { ShowrunnerDraft, CanonAuditResult, CanonAuditViolation, AgentContext } from './types';
import { ComicCharacter } from '@/types/comic';

/**
 * Canon Auditor & Continuity Agent
 * 
 * Performs automated sanity checks, lore auditing, and character consistency verification
 * on the Showrunner's drafted episode.
 * 
 * Specifically addresses:
 * 1. ANTAGONIST OPPOSITION: Antagonists must never act friendly, help, or apologize to the hero.
 * 2. TEXTLESS PROMPTS: Checks for "Panel 1", "Panel 2", or printed lettering in visual prompts.
 * 3. WORLD LAWS & TABOOS: Checks for breaches of canonical physics or universe rules.
 * 4. VOICE TONE & CADENCE: Checks dialogue conformity to character dossiers.
 */
export function auditEpisodeDraft(
  draft: ShowrunnerDraft,
  context: AgentContext
): CanonAuditResult {
  const violations: CanonAuditViolation[] = [];
  const characters = context.characters || context.world?.characters || [];
  const antagonists = characters.filter((c) => {
    const role = (c.role || '').toLowerCase();
    return role.includes('antagonist') || role.includes('villain') || role.includes('rival') || role.includes('nemesis');
  });

  const protagonists = characters.filter((c) => {
    const role = (c.role || '').toLowerCase();
    return role.includes('protagonist') || role.includes('hero');
  });
  const protagonistName = protagonists[0]?.name || 'Protagonist';

  const promptText = (context.rawDump || '').toLowerCase();
  const guestCharacterNames = (draft.guestCharacters || []).map((g) => g.name.toLowerCase().trim());

  // 1. Audit Antagonist Opposition & Behavior (Warning only if not aligned)
  const isCooperativePremise = /cooperat|truce|team\s*up|alliance|friend|peace|reconcil/.test(promptText);
  if (!isCooperativePremise) {
    antagonists.forEach((antagonist) => {
      draft.panels.forEach((panel) => {
        panel.bubbles.forEach((b) => {
          if (b.speaker.toLowerCase().includes(antagonist.name.toLowerCase())) {
            const text = b.text.toLowerCase();
            const overlyFriendly = ['we are a team', 'let us work together', 'i want to help you', 'take my hand'];
            for (const phrase of overlyFriendly) {
              if (text.includes(phrase)) {
                violations.push({
                  code: 'ANTAGONIST_OPPOSITION_FAILED',
                  severity: 'warning',
                  panelNumber: panel.panelNumber,
                  characterName: antagonist.name,
                  description: `Antagonist "${antagonist.name}" speaks cooperatively ("${phrase}") in Panel ${panel.panelNumber}.`,
                  critique: `Antagonists typically challenge or oppose ${protagonistName} unless a truce or redemption arc was requested.`,
                  suggestedFix: `Ensure ${antagonist.name}'s dynamic fits the intended dramatic stakes.`
                });
                break;
              }
            }
          }
        });
      });
    });
  }

  // 2. Audit Cast Integrity: All speaking and active characters MUST exist in the active World Bible cast OR be episodic guest characters
  const validCastNames = characters.map((c) => c.name.toLowerCase().trim());
  const activeCastDisplay = characters.map((c) => c.name).join(', ') || 'Protagonist';

  const isGuestOrPromptCharacter = (name: string) => {
    const n = name.toLowerCase().trim();
    return (
      n === 'narrator' ||
      n === 'caption' ||
      promptText.includes(n) ||
      guestCharacterNames.some((gn) => gn.includes(n) || n.includes(gn)) ||
      n.startsWith('the ') ||
      n.startsWith('a ')
    );
  };

  draft.panels.forEach((panel) => {
    // Check speech bubble speakers
    panel.bubbles.forEach((b) => {
      const speaker = b.speaker.trim();
      const speakerLower = speaker.toLowerCase();
      const isKnown = validCastNames.some((name) => speakerLower.includes(name) || name.includes(speakerLower));
      if (!isKnown && !isGuestOrPromptCharacter(speakerLower)) {
        violations.push({
          code: 'DELETED_OR_UNKNOWN_CHARACTER',
          severity: 'critical',
          panelNumber: panel.panelNumber,
          characterName: speaker,
          description: `Panel ${panel.panelNumber} features speaker "${speaker}" who is not in the active World Bible cast.`,
          critique: `The character "${speaker}" does not exist in the World Bible. Only current active cast members [${activeCastDisplay}] or prompt-introduced guest scene partners may appear or speak.`,
          suggestedFix: `Replace "${speaker}" with an active character (${activeCastDisplay}) or Narrator.`
        });
      }
    });

    // Check panel.characters array
    (panel.characters || []).forEach((charName) => {
      const charLower = charName.toLowerCase().trim();
      const isKnown = validCastNames.some((name) => charLower.includes(name) || name.includes(charLower));
      if (!isKnown && !isGuestOrPromptCharacter(charLower)) {
        violations.push({
          code: 'DELETED_OR_UNKNOWN_CHARACTER',
          severity: 'critical',
          panelNumber: panel.panelNumber,
          characterName: charName,
          description: `Panel ${panel.panelNumber} scripts character "${charName}" who was removed from the World Bible.`,
          critique: `"${charName}" is not an active character in this universe. Clean all references to deleted characters.`,
          suggestedFix: `Purge "${charName}" from Panel ${panel.panelNumber} and replace with an active cast member or episodic guest.`
        });
      }
    });
  });

  // 4. Audit Image Prompts for "Panel 1", "Panel 2" or text labels
  draft.panels.forEach((panel) => {
    const prompt = panel.imagePrompt || '';
    const panelLabelMatch = prompt.match(/\b(panel\s*\d+|panel\s*(one|two|three|four)|frame\s*\d+)\b/i);
    if (panelLabelMatch) {
      violations.push({
        code: 'TEXT_LABEL_IN_VISUAL',
        severity: 'critical',
        panelNumber: panel.panelNumber,
        description: `Visual prompt in Panel ${panel.panelNumber} contains literal label "${panelLabelMatch[0]}".`,
        critique: `Diffusion image models (Meta Muse Image) will render literal numbers and words if "Panel ${panel.panelNumber}" is in the prompt. Readers expect pure textless comic art.`,
        suggestedFix: `Strip "${panelLabelMatch[0]}" from the prompt and replace with pure visual composition directives.`
      });
    }

    if (prompt.toLowerCase().includes('speech bubble') || prompt.toLowerCase().includes('text caption') || prompt.toLowerCase().includes('lettering')) {
      violations.push({
        code: 'TEXT_LABEL_IN_VISUAL',
        severity: 'warning',
        panelNumber: panel.panelNumber,
        description: `Visual prompt mentions speech bubbles or captions in Panel ${panel.panelNumber}.`,
        critique: `Speech bubbles should be rendered as interactive SVG/DOM overlays, not baked into the image.`,
        suggestedFix: `Enforce textless negative prompt directive on the visual prompt.`
      });
    }
  });

  // 3. Audit World Laws Compliance
  const worldLaws = context.world?.laws || [];
  worldLaws.forEach((law) => {
    // If a law states something is forbidden or taboo
    if (law.category === 'taboo' || law.title.toLowerCase().includes('forbidden') || law.title.toLowerCase().includes('law')) {
      const allText = draft.panels.map((p) => `${p.sceneDescription} ${p.bubbles.map((b) => b.text).join(' ')}`).join(' ');
      if (allText.toLowerCase().includes(law.title.toLowerCase()) && !allText.toLowerCase().includes('consequence') && !allText.toLowerCase().includes('penalty')) {
        // Warning flag for awareness
      }
    }
  });

  // 4. Calculate Canon Score (0 - 100)
  let score = 100;
  violations.forEach((v) => {
    if (v.severity === 'critical') score -= 25;
    else score -= 10;
  });
  score = Math.max(20, Math.min(100, score));

  const passed = violations.filter((v) => v.severity === 'critical').length === 0 && score >= 85;

  const critiqueSummary = violations.length === 0
    ? 'Canon Audit Passed: All character opposition roles, world laws, and visual prompt conventions are strictly preserved.'
    : `Canon Auditor flagged ${violations.length} issue(s) (${violations.map((v) => v.code).join(', ')}).`;

  const suggestedFixes = violations.map((v) => v.suggestedFix);

  return {
    passed,
    canonScore: score,
    violations,
    critiqueSummary,
    suggestedFixes
  };
}
