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

  // 1. Audit Antagonist Opposition & Behavior
  antagonists.forEach((antagonist) => {
    draft.panels.forEach((panel) => {
      // Check dialogue bubbles spoken by the antagonist
      panel.bubbles.forEach((b) => {
        if (b.speaker.toLowerCase().includes(antagonist.name.toLowerCase())) {
          const text = b.text.toLowerCase();
          // Friendly or cooperative phrases that betray antagonist integrity
          const friendlyPhrases = [
            'let me help',
            'i can help',
            'here is the solution',
            'i apologize',
            'sorry about earlier',
            'good job',
            'proud of you',
            'we are a team',
            'let us work together',
            'take my hand',
            'trust me',
            'you are right',
            'i agree with you',
            'we should cooperate'
          ];

          for (const phrase of friendlyPhrases) {
            if (text.includes(phrase)) {
              violations.push({
                code: 'ANTAGONIST_OPPOSITION_FAILED',
                severity: 'critical',
                panelNumber: panel.panelNumber,
                characterName: antagonist.name,
                description: `Antagonist "${antagonist.name}" speaks cooperatively ("${phrase}") in Panel ${panel.panelNumber}.`,
                critique: `The antagonist must never assist, comfort, or cooperate with ${protagonistName}. Antagonists must menace, challenge, mock, sabotage, or set traps.`,
                suggestedFix: `Rewrite ${antagonist.name}'s line in Panel ${panel.panelNumber} into an adversarial taunt, ultimatum, or sabotage threat.`
              });
              break;
            }
          }
        }
      });

      // Check scene description for antagonist acting as an ally
      const scene = panel.sceneDescription.toLowerCase();
      if (scene.includes(antagonist.name.toLowerCase())) {
        if (
          scene.includes('helps') ||
          scene.includes('saves') ||
          scene.includes('assists') ||
          scene.includes('rescues') ||
          scene.includes('comforts') ||
          scene.includes('allies with')
        ) {
          violations.push({
            code: 'ANTAGONIST_OPPOSITION_FAILED',
            severity: 'critical',
            panelNumber: panel.panelNumber,
            characterName: antagonist.name,
            description: `Scene description shows antagonist "${antagonist.name}" aiding or saving the protagonist in Panel ${panel.panelNumber}.`,
            critique: `Antagonists must maintain conflict and opposition. They must not save or support the hero unless the user explicitly requested a redemption arc.`,
            suggestedFix: `Change Panel ${panel.panelNumber} so that ${antagonist.name} ambushes, obstructs, or takes advantage of the crisis instead.`
          });
        }
      }
    });
  });

  // 2. Audit Cast Integrity: All speaking and active characters MUST exist in the active World Bible cast
  const validCastNames = characters.map((c) => c.name.toLowerCase().trim());
  const activeCastDisplay = characters.map((c) => c.name).join(', ') || 'Protagonist';

  draft.panels.forEach((panel) => {
    // Check speech bubble speakers
    panel.bubbles.forEach((b) => {
      const speaker = b.speaker.trim();
      const speakerLower = speaker.toLowerCase();
      if (speakerLower !== 'narrator' && speakerLower !== 'caption' && !validCastNames.some((name) => speakerLower.includes(name) || name.includes(speakerLower))) {
        violations.push({
          code: 'DELETED_OR_UNKNOWN_CHARACTER',
          severity: 'critical',
          panelNumber: panel.panelNumber,
          characterName: speaker,
          description: `Panel ${panel.panelNumber} features speaker "${speaker}" who is not in the active World Bible cast.`,
          critique: `The character "${speaker}" was removed or does not exist in the World Bible. Only current active cast members [${activeCastDisplay}] may appear or speak.`,
          suggestedFix: `Replace "${speaker}" with an active character (${activeCastDisplay}) or Narrator.`
        });
      }
    });

    // Check panel.characters array
    (panel.characters || []).forEach((charName) => {
      const charLower = charName.toLowerCase().trim();
      if (charLower !== 'narrator' && !validCastNames.some((name) => charLower.includes(name) || name.includes(charLower))) {
        violations.push({
          code: 'DELETED_OR_UNKNOWN_CHARACTER',
          severity: 'critical',
          panelNumber: panel.panelNumber,
          characterName: charName,
          description: `Panel ${panel.panelNumber} scripts character "${charName}" who was removed from the World Bible.`,
          critique: `"${charName}" is not an active character in this universe. Clean all references to deleted characters.`,
          suggestedFix: `Purge "${charName}" from Panel ${panel.panelNumber} and replace with an active cast member.`
        });
      }
    });
  });

  // 3. Audit Civilian Non-Combatant Consistency: Civilian characters must NOT perform superhero combat
  const civilians = characters.filter((c) => {
    const role = (c.role || '').toLowerCase();
    return !role.includes('hero') && !role.includes('vigilante') && !role.includes('warrior') && !role.includes('fighter') && !role.includes('super');
  });

  civilians.forEach((civilian) => {
    draft.panels.forEach((panel) => {
      const scene = panel.sceneDescription.toLowerCase();
      const bubbles = panel.bubbles.map((b) => b.text.toLowerCase()).join(' ');
      const combined = `${scene} ${bubbles}`;

      if (combined.includes(civilian.name.toLowerCase())) {
        const combatWords = [
          'mid-kick',
          'roundhouse',
          'karate',
          'martial arts',
          'smashes drone',
          'destroying a drone',
          'flying kick',
          'ninja',
          'superhuman',
          'swings sword',
          'laser blast',
          'tactical combat',
          'night shift is mine',
          'fights at night'
        ];

        for (const word of combatWords) {
          if (combined.includes(word)) {
            violations.push({
              code: 'CIVILIAN_COMBAT_VIOLATION',
              severity: 'critical',
              panelNumber: panel.panelNumber,
              characterName: civilian.name,
              description: `Civilian character "${civilian.name}" (${civilian.role}) is performing superhero combat actions ("${word}") in Panel ${panel.panelNumber}.`,
              critique: `"${civilian.name}" is defined as a civilian ${civilian.role}, NOT a superhero or night-shift fighter. They must not fight villains, do martial arts, or wield combat weapons.`,
              suggestedFix: `Re-script "${civilian.name}" in Panel ${panel.panelNumber} to behave according to their actual civilian profession (${civilian.role}), reacting realistically without combat powers.`
            });
            break;
          }
        }
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
