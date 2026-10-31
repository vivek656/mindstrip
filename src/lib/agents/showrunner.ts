import { ShowrunnerDraft, AgentContext, CanonAuditResult } from './types';
import { generateComicStripMock } from '@/lib/comic-generator';
import { ComicPanel } from '@/types/comic';

/**
 * Showrunner Agent (Powered by Meta Muse Spark 1.3 / Llama 3.3)
 * 
 * Designs the dramatic narrative arc:
 * - Autonomously selects optimal layout pacing (1-panel splash, 2-panel faceoff, 3-panel strip, 4-panel spread)
 * - Authors dialogue bubbles, sound effects (SFX), and visual scene cues
 * - Generates creative continuation forks & cliffhangers
 * - Capable of SELF-CORRECTION when provided critique from the Canon Auditor
 */
export async function draftEpisodeBeats(
  context: AgentContext,
  ragContext?: string,
  critiqueFeedback?: CanonAuditResult
): Promise<ShowrunnerDraft> {
  const {
    rawDump,
    artStyle = 'webcomic',
    lens = 'candid',
    characters = [],
    worldTitle = 'Untitled Universe',
    genre = 'Adventure',
    storyContext = '',
    layoutPreference = 'auto',
    provider,
    apiKey,
    baseUrl,
    modelName
  } = context;

  // Check if real Meta API or Partner inference is available
  const hasApiKey = Boolean(apiKey || (provider === 'fireworks' && process.env.FIREWORKS_API_KEY) || (provider === 'groq' && process.env.GROQ_API_KEY) || process.env.META_MODEL_API_KEY);

  if (hasApiKey) {
    try {
      const cleanBase = (baseUrl || 'https://api.meta.ai/v1').replace(/\/+$/, '');
      const targetModel = modelName || (provider === 'fireworks' ? 'accounts/fireworks/models/llama-v3p3-70b-instruct' : provider === 'groq' ? 'llama-3.3-70b-versatile' : 'muse-spark-1.3');

      const layoutInstruction = layoutPreference === 'auto'
        ? `You have FULL AUTONOMY as an AI Comic Director Agent. Analyze the dramatic weight of the story prompt and autonomously choose the optimal layout:
- "1-panel": Epic full-page splash art (ideal for a climactic reveal, establishing panorama, or singular dramatic moment).
- "2-panel": Confrontation or punchline split (ideal for sharp banter, before/after contrast, or setup & immediate punchline).
- "3-panel": Fast-paced webtoon strip (ideal for 3-act escalation: setup -> complication -> immediate twist).
- "4-panel": Classic sequential graphic novel spread (ideal for complete narrative arcs).
Explain your dramatic choice in "directorReasoning".`
        : `The user has explicitly requested the "${layoutPreference}" layout. Design exactly ${layoutPreference.replace('-panel', '')} panel(s) and explain in "directorReasoning" how you optimized the storytelling for this layout.`;

      let critiquePrompt = '';
      if (critiqueFeedback && critiqueFeedback.violations.length > 0) {
        critiquePrompt = `
PREVIOUS DRAFT REJECTED BY CANON AUDITOR AGENT:
The following violations were detected:
${critiqueFeedback.violations.map((v) => `• [${v.code}] ${v.description} -> CRITIQUE: ${v.critique}`).join('\n')}
SUGGESTED FIXES TO APPLY IMMEDIATELY:
${critiqueFeedback.suggestedFixes.map((f) => `• ${f}`).join('\n')}
You MUST revise the episode to strictly satisfy the Canon Auditor. Never repeat these violations!`;
      }

      const systemPrompt = `You are MindStrip's Autonomous Meta AI Showrunner Agent (powered by ${targetModel}).
You script serialized comic episodes with intelligent narrative pacing, character continuity, and dynamic page layouts.

CRITICAL CASTING & EPISODE RULES:
1. EPISODE SPOTLIGHT & ZERO UNWANTED HERO CAMEO: If the episode prompt focuses on a specific character (e.g., "@Meera" in an office setting), DO NOT force the main hero, protagonist, or other world characters into the scene! Script ONLY the requested character and their relevant scene partners. Give the spotlighted character their own standalone episode arc!
2. CIVILIAN, CRUSH & OFFICE WORKER INTEGRITY (NOT A HERO SIDEKICK): A character whose role is a "crush", "office worker", "coworker", "love-interest", or "civilian" is NEVER a superhero sidekick. They DO NOT fight villains, DO NOT wear tactical armor, and DO NOT follow a hero on superhero missions. Ground their scenes completely in their defined role: office drama, corporate negotiations, flirting, seducing a client to get a contract, workplace humor, and real-life interpersonal tension!
3. TEMPORARY GUEST SCENE PARTNERS: When the user's premise introduces a temporary or one-off character (e.g., "the new client", "the CEO", "a mysterious customer", "a rival bidder"), YOU ARE EXPLICITLY ENCOURAGED to introduce them as an episodic guest character in the panels and dialogue (e.g., speaker: "New Client (Mr. Sterling)" or "Client"). They act as a one-off scene partner for this episode without permanently altering the world bible.
4. ANTAGONIST INTEGRITY: Any character with role="antagonist" MUST ACTIVELY OPPOSE, MENACE, MOCK, OR SABOTAGE THE PROTAGONIST. They must NEVER help, sympathize with, or apologize!
5. MANDATORY CAST INTEGRITY: Never include deleted cast members from previous worlds.
6. TEXTLESS IMAGE PROMPTS: In "imagePrompt", describe only visual composition, lighting, and action. NEVER write "Panel 1", "Panel 2", numbers, or speech bubble text!
${critiquePrompt}
${layoutInstruction}

Return ONLY valid JSON with this schema:
{
  "title": "Episode Title",
  "layoutStyle": "1-panel" | "2-panel" | "3-panel" | "4-panel",
  "directorReasoning": "Why this pacing and layout was selected",
  "coreTruth": "Insight or takeaway",
  "pageCharacters": ["Names of characters appearing on this page"],
  "guestCharacters": [
    {
      "name": "Guest Name",
      "role": "e.g. client, boss, stranger",
      "appearance": "Visual look & clothing",
      "description": "Short bio & scene role",
      "avatarEmoji": "emoji"
    }
  ],
  "recap": "Summary of this episode (under 80 words)",
  "newFacts": ["Canon facts introduced"],
  "openThreads": ["Unresolved hooks left open"],
  "nextSuggestions": ["Plot hook 1", "Plot hook 2", "Plot hook 3"],
  "directorQuestion": {
    "question": "Provocative continuation fork",
    "options": [
      { "label": "Action 1", "beat": "Dramatic beat" },
      { "label": "Action 2", "beat": "Dramatic beat" }
    ]
  },
  "panels": [
    {
      "panelNumber": 1,
      "title": "Beat Title",
      "sceneDescription": "Detailed visual description",
      "characters": ["Names"],
      "bubbles": [
        { "id": "b1-1", "speaker": "Name", "text": "Dialogue line", "type": "speech", "position": "top-left" }
      ],
      "soundEffect": "KRAK!",
      "mood": "stressed",
      "imagePrompt": "Visual lighting and character pose (STRICTLY NO printed text or 'Panel 1' labels)"
    }
  ]
}`;

      const userContent = `Universe: "${worldTitle}" (${genre})
Art Style: "${artStyle}"
Characters: ${JSON.stringify(characters)}
${ragContext ? `\n${ragContext}\n` : ''}
${storyContext ? `\nSTORY CONTEXT:\n${storyContext}\n` : ''}
Episode Premise / Brain Dump: "${rawDump}"`;

      const res = await fetch(`${cleanBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey || process.env.META_MODEL_API_KEY || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        const cleaned = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.panels && parsed.panels.length > 0) {
          return {
            title: parsed.title || `${worldTitle}: Next Beat`,
            layoutStyle: parsed.layoutStyle || '4-panel',
            directorReasoning: parsed.directorReasoning || 'Selected optimal narrative pacing for this chapter.',
            coreTruth: parsed.coreTruth || 'Action breeds clarity.',
            recap: parsed.recap || rawDump.slice(0, 80),
            newFacts: parsed.newFacts || [],
            openThreads: parsed.openThreads || [],
            nextSuggestions: parsed.nextSuggestions || [],
            pageCharacters: parsed.pageCharacters || [],
            guestCharacters: parsed.guestCharacters || [],
            directorQuestion: parsed.directorQuestion,
            panels: parsed.panels
          };
        }
      }
    } catch (err) {
      console.warn('Remote Showrunner call failed, falling back to local reasoning:', err);
    }
  }

  // Local / Resilient Narrative Reasoner
  const fallbackStrip = generateComicStripMock(
    rawDump,
    artStyle,
    lens,
    'Meta AI Showrunner (Local Engine)',
    characters,
    worldTitle,
    genre
  );

  let chosenLayout: '1-panel' | '2-panel' | '3-panel' | '4-panel' = layoutPreference === 'auto' ? '4-panel' : layoutPreference;
  if (layoutPreference === 'auto') {
    const lower = rawDump.toLowerCase();
    if (/splash|epic|reveal|poster|monumental|panoramic|climax/.test(lower)) chosenLayout = '1-panel';
    else if (/vs|versus|faceoff|duel|confrontation|debate|argument/.test(lower)) chosenLayout = '2-panel';
    else if (/chase|escape|trio|journey|escalat/.test(lower)) chosenLayout = '3-panel';
  }

  const maxPanels = chosenLayout === '1-panel' ? 1 : chosenLayout === '2-panel' ? 2 : chosenLayout === '3-panel' ? 3 : 4;
  let panels: ComicPanel[] = fallbackStrip.panels.slice(0, maxPanels);

  // If self-correcting from critique in local mode:
  if (critiqueFeedback && critiqueFeedback.violations.length > 0) {
    const antagonist = characters.find((c) => (c.role || '').toLowerCase().includes('antagonist'));
    const protagonist = characters.find((c) => (c.role || '').toLowerCase().includes('protagonist')) || characters[0];
    const validNames = new Set(characters.map((c) => c.name.toLowerCase()));
    const primaryCivilian = characters.find((c) => {
      const role = (c.role || '').toLowerCase();
      return !role.includes('hero') && !role.includes('vigilante') && !role.includes('fighter');
    });

    panels = panels.map((p) => {
      // 1. Purge deleted characters from speech bubbles and replace with active characters
      let updatedBubbles = p.bubbles.map((b) => {
        const isUnknown = b.speaker.toLowerCase() !== 'narrator' && !Array.from(validNames).some((n) => b.speaker.toLowerCase().includes(n));
        const effectiveSpeaker = isUnknown ? (primaryCivilian?.name || protagonist?.name || 'Narrator') : b.speaker;

        if (antagonist && effectiveSpeaker.toLowerCase().includes(antagonist.name.toLowerCase())) {
          return {
            ...b,
            speaker: effectiveSpeaker,
            text: `Did you honestly think I would let you succeed, ${protagonist?.name || 'hero'}? You've stepped right into my trap.`,
            type: 'shout' as const
          };
        }
        return {
          ...b,
          speaker: effectiveSpeaker
        };
      });

      // 2. Fix scene description to ensure antagonist opposes and civilians don't do superhero combat
      let scene = p.sceneDescription;
      if (antagonist && scene.includes(antagonist.name)) {
        scene = `${antagonist.name} ambushes the perimeter, deploying countermeasures to sabotage ${protagonist?.name || 'the protagonist'}.`;
      }

      // Check civilian combat violations
      if (primaryCivilian && (scene.toLowerCase().includes('mid-kick') || scene.toLowerCase().includes('martial arts') || scene.toLowerCase().includes('night shift is mine'))) {
        scene = `${primaryCivilian.name} watches with nervous anxiety from the terminal, holding a notepad and alerting ${protagonist?.name || 'the team'} to the surging voltage.`;
      }

      // 3. Fix visual prompt labels
      const cleanedPrompt = p.imagePrompt
        .replace(/\b(panel\s*\d+|panel\s*(one|two|three|four)|frame\s*\d+)\b/gi, 'story beat')
        .trim();

      // Ensure panel.characters only contains valid cast
      const validPanelChars = (p.characters || []).filter((cn) => Array.from(validNames).some((vn) => cn.toLowerCase().includes(vn)));
      if (validPanelChars.length === 0 && protagonist) validPanelChars.push(protagonist.name);

      return {
        ...p,
        characters: validPanelChars,
        bubbles: updatedBubbles,
        sceneDescription: scene,
        imagePrompt: cleanedPrompt
      };
    });
  }

  return {
    title: fallbackStrip.title,
    layoutStyle: chosenLayout,
    directorReasoning: `Showrunner Agent selected ${chosenLayout} to balance dramatic revelation and episodic momentum.`,
    coreTruth: fallbackStrip.cognitiveAnalysis.coreTruth,
    recap: fallbackStrip.recap || rawDump.slice(0, 80),
    newFacts: fallbackStrip.newFacts || [],
    openThreads: fallbackStrip.openThreads || [],
    nextSuggestions: fallbackStrip.nextSuggestions || [],
    directorQuestion: fallbackStrip.directorQuestion,
    panels
  };
}
