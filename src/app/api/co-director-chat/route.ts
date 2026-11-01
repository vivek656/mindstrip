import { NextRequest, NextResponse } from 'next/server';
import { ComicCharacter, CoDirectorChatMessage } from '@/types/comic';

interface CoDirectorChatResponsePayload {
  reply: string;
  synthesizedPremise: string;
  castSpotlight: string[];
  castExcluded: string[];
  suggestedPanels?: { panelNumber: number; description: string; dialogue?: string }[];
  quickStarters?: string[];
}

/**
 * Dynamic fallback engine when API keys are not present or network issues arise.
 * Dynamically reflects user conversation, current page context, detected characters, and genre.
 */
function generateDynamicCoDirectorResponse(
  messages: { role: string; content: string }[],
  world: { title?: string; genre?: string; characters?: ComicCharacter[] },
  currentEpisode?: {
    episodeNumber?: number;
    title?: string;
    summary?: string;
    panels?: any[];
  },
  chatMode: 'current' | 'next' = 'next',
  storyContext?: string
): CoDirectorChatResponsePayload {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const fullUserText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');
  const lower = (lastUserMsg + ' ' + fullUserText).toLowerCase();

  const allCharNames = (world.characters || []).map((c) => c.name);
  const spotlightChars = allCharNames.filter((name) => lower.includes(name.toLowerCase()));
  if (spotlightChars.length === 0 && allCharNames.length > 0) {
    spotlightChars.push(allCharNames[0]);
  }
  const excludedChars = allCharNames.filter((name) => !spotlightChars.includes(name));

  // Detect episodic guests dynamically from text
  const guestMatch = lower.match(/(?:a|the|new)\s+(client|customer|investor|buyer|partner|stranger|visitor|rival|detective|merchant|boss|guest)\b/i);
  const guestLabels: string[] = [];
  if (guestMatch) {
    const roleCapitalized = guestMatch[1].charAt(0).toUpperCase() + guestMatch[1].slice(1).toLowerCase();
    guestLabels.push(`The ${roleCapitalized}`);
  }

  const leadName = spotlightChars[0] || 'The Lead';
  const guestsStr = guestLabels.length > 0 ? guestLabels.join(' & ') : '';
  const sceneCast = [...spotlightChars, ...guestLabels];
  const userTopic = lastUserMsg.trim() || 'the central development';
  const epNum = currentEpisode?.episodeNumber || 1;
  const epTitle = currentEpisode?.title || `Issue #${epNum}`;

  if (chatMode === 'current') {
    const reply = `I'm analyzing **Issue #${epNum}: "${epTitle}"** with you! With our established canon and context up to this page, focusing on **${leadName}** ${guestsStr ? `and **${guestsStr}**` : ''} gives this scene great dramatic punch.

Here is how we can refine or re-direct this page:
• **Visual Staging & Pacing:** Emphasize the physical dynamic and eye contact in Panels 1 & 2 to build dramatic tension before the turn.
• **Dialogue Polish:** Keep ${leadName}'s dialogue sharp and grounded in their motivation.
• **Pivotal Climax:** In Panels 3 & 4, bring the confrontation to a decisive visual peak.

If you like this adjustment, click **Re-Direct Scene** or **Clean Re-Draw** to apply these changes to the page artwork!`;

    const panel1 = `${leadName} confronts the situation with focused intent around "${userTopic}".`;
    const panel2 = `Tense exchange and interpersonal friction as ${leadName} and scene partners collide over "${userTopic}".`;
    const panel3 = `The dramatic turning point of the scene unfolds with high-contrast cinematic staging.`;
    const panel4 = `A resolute outcome leaves an impactful conclusion for this issue.`;

    return {
      reply,
      synthesizedPremise: `Issue #${epNum}: ${leadName} navigates "${userTopic}" with ${guestsStr || 'key scene partners'}, driving dramatic narrative momentum in ${world.title || 'the universe'}.`,
      castSpotlight: sceneCast,
      castExcluded: excludedChars,
      suggestedPanels: [
        { panelNumber: 1, description: panel1 },
        { panelNumber: 2, description: panel2 },
        { panelNumber: 3, description: panel3 },
        { panelNumber: 4, description: panel4 },
      ],
      quickStarters: [
        'Punch up the dialogue between characters',
        'Re-direct this scene with higher tension',
        'Apply changes & re-draw page artwork',
      ],
    };
  }

  // Next Episode Mode
  const reply = `I like where you're taking the next chapter! Focusing specifically on **${leadName}** ${guestsStr ? `and **${guestsStr}**` : ''} keeps the narrative progression sharp and compelling following Issue #${epNum}.

Here is how we can structure this sequence across the 4 panels:

• **Panel 1 — Establishing the Scene:** ${leadName} steps into the scene with clear intent, establishing the stakes around "${userTopic}".
• **Panel 2 — The Interaction:** ${leadName} engages directly with ${guestsStr || 'their counterpart'}, developing the interpersonal dynamic and dialogue.
• **Panel 3 — The Pivotal Exchange:** A critical revelation or turning point occurs that shifts the balance of power.
• **Panel 4 — The Decision / Hook:** A decisive choice is made, setting up an immediate cliffhanger for the next episode.

How does this pacing feel? We can either push for a decisive resolution or introduce an unexpected complication.`;

  const panel1 = `${leadName} enters the scene with focused composure, establishing the moment for "${userTopic}".`;
  const panel2 = `${leadName} engages ${guestsStr || 'their counterpart'}, exchanging sharp, observant dialogue.`;
  const panel3 = `A pivotal development occurs as the dialogue and stakes over "${userTopic}" reach a climax.`;
  const panel4 = `A decisive choice is made, leaving an intriguing narrative opening for the next chapter.`;

  const premise = `Episode #${epNum + 1}: ${leadName} navigates "${userTopic}" with ${guestsStr || 'key scene partners'}, driving dramatic narrative momentum in ${world.title || 'the universe'}.`;

  const quickStarters = [
    'Resolve the scene with a decisive breakthrough',
    'Introduce an unexpected complication or rival twist',
    'End on a suspenseful cliffhanger for the next issue'
  ];

  return {
    reply,
    synthesizedPremise: premise,
    castSpotlight: sceneCast,
    castExcluded: excludedChars,
    suggestedPanels: [
      { panelNumber: 1, description: panel1 },
      { panelNumber: 2, description: panel2 },
      { panelNumber: 3, description: panel3 },
      { panelNumber: 4, description: panel4 },
    ],
    quickStarters,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      world = {},
      currentEpisode = {},
      apiKey,
      baseUrl,
      provider = 'meta-api',
      modelName,
      chatMode = 'next', // 'current' | 'next'
      storyContext = '',
    } = body;

    const worldTitle = world.title || 'Comic Universe';
    const genre = world.genre || 'Drama';
    const worldTagline = world.tagline || '';
    const worldLore = world.lore || '';
    const characters: ComicCharacter[] = world.characters || [];
    const isCurrentPageChat = chatMode === 'current';
    const epNum = currentEpisode.episodeNumber || 1;
    const epTitle = currentEpisode.title || `Issue #${epNum}`;

    // Target AI provider & credentials
    let targetBaseUrl = baseUrl || process.env.META_MODEL_BASE_URL || 'https://api.meta.ai/v1';
    let targetApiKey = apiKey || process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY || '';
    let targetModel = modelName || 'muse-spark-1.3';

    if (provider === 'fireworks') {
      targetBaseUrl = baseUrl || 'https://api.fireworks.ai/inference/v1';
      targetApiKey = apiKey || process.env.FIREWORKS_API_KEY || '';
      targetModel = modelName || 'accounts/fireworks/models/llama-v3p3-70b-instruct';
    } else if (provider === 'groq') {
      targetBaseUrl = baseUrl || 'https://api.groq.com/openai/v1';
      targetApiKey = apiKey || process.env.GROQ_API_KEY || '';
      targetModel = modelName || 'llama-3.3-70b-versatile';
    }

    // If no API key is available, use dynamic intelligent response
    if (!targetApiKey) {
      return NextResponse.json(
        generateDynamicCoDirectorResponse(messages, world, currentEpisode, chatMode, storyContext)
      );
    }

    const castRosterStr = characters
      .map((c) => `- @${c.name} (${c.role}): ${c.personality || c.description || 'character'}`)
      .join('\n');

    let systemPrompt = '';

    if (isCurrentPageChat) {
      // CURRENT PAGE DEDICATED DIRECTOR PROMPT WITH FULL CONTINUITY CONTEXT
      systemPrompt = `You are MindStrip's Meta AI Comic Director dedicated to Issue #${epNum}: "${epTitle}".
You are collaborating with the comic creator in a natural, ChatGPT-style conversation to analyze, refine, polish, re-direct, or adjust THIS SPECIFIC COMIC PAGE.

${storyContext ? `STORY CONTINUITY LEADING UP TO THIS PAGE (World Bible, Canon & Prior Issues):\n${storyContext}\n` : ''}

CURRENT PAGE BREAKDOWN (ISSUE #${epNum}: "${epTitle}"):
- Premise / Scene: "${currentEpisode.summary || currentEpisode.rawBrainDump || ''}"
${currentEpisode.directorReasoning ? `- Director Pacing Rationale: "${currentEpisode.directorReasoning}"` : ''}
${currentEpisode.coreTruth ? `- Core Emotional Truth: "${currentEpisode.coreTruth}"` : ''}
${currentEpisode.layoutStyle ? `- Layout Format: ${currentEpisode.layoutStyle}` : ''}
${currentEpisode.panels && currentEpisode.panels.length > 0 ? `- Panels on this page:
${currentEpisode.panels.map((p: any) => `  • Panel ${p.panelNumber}: ${p.sceneDescription || ''}${p.visualMetaphor ? ` [Visual: ${p.visualMetaphor}]` : ''}${p.characters && p.characters.length > 0 ? ` [Cast: ${p.characters.join(', ')}]` : ''}${p.bubbles && p.bubbles.length > 0 ? ` | Speech: ${Array.isArray(p.bubbles) ? p.bubbles.map((b: any) => typeof b === 'string' ? b : `${b.speaker}: "${b.text}"`).join('; ') : p.bubbles}` : ''}`).join('\n')}` : ''}

CORE PAGE DIRECTOR BEHAVIORS:
1. Talk like an expert, enthusiastic comic director (like ChatGPT) having a real creative partnership conversation.
2. You have complete context of the universe lore, character personalities, and prior episode events leading to this page. Reference them naturally!
3. If the creator asks to punch up dialogue, suggest punchy, sharp, or emotional dialogue lines suited to the characters.
4. If the creator asks to re-direct this scene, provide an updated premise and an optimized 4-panel visual breakdown.
5. If the creator asks about character actions, physical positions, or cinematography, provide clear visual descriptions.
6. Enforce Cast Scoping: keep focus on the characters actively in this scene.
7. Return clean JSON matching the schema below.`;
    } else {
      // NEXT EPISODE WRITERS' ROOM CO-DIRECTOR PROMPT
      systemPrompt = `You are MindStrip's Meta AI Comic Co-Director & Creative Partner in the writers' room.
You are collaborating in a natural, ChatGPT-style back-and-forth conversation with a comic creator to direct the NEXT page/episode (Issue #${epNum + 1}) of their comic.

${storyContext ? `STORY CONTINUITY UP TO CURRENT PAGE (World Bible, Canon & Preceding Issues):\n${storyContext}\n` : ''}

UNIVERSE CONTEXT:
- World: "${worldTitle}"
- Genre: ${genre}
${worldTagline ? `- Tagline: "${worldTagline}"` : ''}
${worldLore ? `- Lore: "${worldLore}"` : ''}
- Active Universe Cast:
${castRosterStr || 'No predefined cast'}
- Current (Preceding) Episode: #${epNum} "${epTitle}"
${currentEpisode.summary ? `- Preceding Episode Recap: "${currentEpisode.summary}"` : ''}

CORE CO-DIRECTOR BEHAVIORS:
1. Talk like an expert, enthusiastic comic co-director (like ChatGPT) having a real conversation.
2. DO NOT interrogate the creator with endless multiple-choice questionnaires or rigid quizzes!
3. Build on the established canon, character arcs, and unresolved open threads from preceding episodes.
4. Answer their questions directly, offer visual pacing, dialogue lines, and dramatic staging ideas.
5. If they introduce a new guest character (e.g. "a client", "the boss", "a date", "a stranger"), develop them naturally in the scene alongside the mentioned character(s).
6. Enforce Cast Scoping: Only include characters who genuinely belong in this scene. Exclude unmentioned superheroes/villains from invading this page!
7. Provide a 4-panel visual breakdown (Panel 1, 2, 3, 4) suggesting cinematic camera angles, character body language, and dramatic beats.
8. Maintain continuity across the conversation history.`;
    }

    systemPrompt += `

Return ONLY a valid JSON object matching this schema:
{
  "reply": "Engaging, conversational response in markdown (dialogue snippets, panel flow, advice, enthusiasm)",
  "synthesizedPremise": "Clean, comprehensive editorial logline ready to generate this comic page",
  "castSpotlight": ["Names of active characters on this page"],
  "castExcluded": ["Names of universe characters who stay off-page"],
  "suggestedPanels": [
    { "panelNumber": 1, "description": "Visual scene framing", "dialogue": "Optional speech" },
    { "panelNumber": 2, "description": "Visual scene framing", "dialogue": "Optional speech" },
    { "panelNumber": 3, "description": "Visual scene framing", "dialogue": "Optional speech" },
    { "panelNumber": 4, "description": "Visual scene framing", "dialogue": "Optional speech" }
  ],
  "quickStarters": ["2-3 punchy short phrases user can tap to reply quickly"]
}`;

    // Full uncapped conversation context
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const cleanBase = targetBaseUrl.replace(/\/+$/, '');
    const res = await fetch(`${cleanBase}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${targetApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Co-Director Chat API error (${res.status}): ${errText.slice(0, 150)}`);
      return NextResponse.json(
        generateDynamicCoDirectorResponse(messages, world, currentEpisode, chatMode, storyContext)
      );
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
    if (!rawContent) {
      return NextResponse.json(
        generateDynamicCoDirectorResponse(messages, world, currentEpisode, chatMode, storyContext)
      );
    }
    const cleaned = rawContent.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed: CoDirectorChatResponsePayload = JSON.parse(cleaned);

    return NextResponse.json({
      reply: parsed.reply || 'Understood! Let us build this page together.',
      synthesizedPremise: parsed.synthesizedPremise || '',
      castSpotlight: Array.isArray(parsed.castSpotlight) ? parsed.castSpotlight : [],
      castExcluded: Array.isArray(parsed.castExcluded) ? parsed.castExcluded : [],
      suggestedPanels: Array.isArray(parsed.suggestedPanels) ? parsed.suggestedPanels : [],
      quickStarters: Array.isArray(parsed.quickStarters) ? parsed.quickStarters : [],
    });
  } catch (error) {
    console.warn('Co-Director chat fallback:', error);
    const body = await req.json().catch(() => ({}));
    return NextResponse.json(
      generateDynamicCoDirectorResponse(
        body?.messages || [],
        body?.world || {},
        body?.currentEpisode || {},
        body?.chatMode || 'next',
        body?.storyContext || ''
      )
    );
  }
}
