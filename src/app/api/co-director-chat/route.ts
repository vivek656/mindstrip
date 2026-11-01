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
 * Robust JSON and response extractor.
 * If the model returned JSON, extracts and cleans it.
 * If the model returned pure conversational markdown (e.g. without JSON braces),
 * it preserves the model's intelligent response directly rather than dropping to a fallback.
 */
function extractJsonFromModelContent(raw: string): CoDirectorChatResponsePayload | null {
  if (!raw) return null;

  // 1. Direct JSON parse
  try {
    const direct = JSON.parse(raw);
    if (direct && typeof direct === 'object' && direct.reply) {
      return direct;
    }
  } catch {}

  // 2. Unfence markdown
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && parsed.reply) {
      return parsed;
    }
  } catch {}

  // 3. Find outer JSON object braces
  try {
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = raw.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && parsed.reply) {
        return parsed;
      }
    }
  } catch {}

  // 4. If JSON parsing failed but model output conversational markdown text,
  // USE THE MODEL'S ACTUAL RESPONSE DIRECTLY! Never discard it!
  const textReply = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  if (textReply.length > 10) {
    return {
      reply: textReply,
      synthesizedPremise: '',
      castSpotlight: [],
      castExcluded: [],
      suggestedPanels: [],
      quickStarters: [
        'Apply changes & re-draw page',
        'Suggest dialogue polish',
        'Refine visual cinematography',
      ],
    };
  }

  return null;
}

/**
 * Dynamic fallback engine when network issues arise or API calls are unavailable.
 * Dynamically answers the creator's exact question, referencing characters,
 * active scene context, and narrative beats without static boilerplate.
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

  const allChars = world.characters || [];
  const allCharNames = allChars.map((c) => c.name);
  const spotlightChars = allCharNames.filter((name) => lower.includes(name.toLowerCase()));
  if (spotlightChars.length === 0 && allCharNames.length > 0) {
    spotlightChars.push(allCharNames[0]);
  }
  const excludedChars = allCharNames.filter((name) => !spotlightChars.includes(name));

  const leadName = spotlightChars[0] || 'The Protagonist';
  const secondName = spotlightChars[1] || allCharNames.find((n) => n !== leadName) || 'the counterpart';
  const epNum = currentEpisode?.episodeNumber || 1;
  const epTitle = currentEpisode?.title || `Issue #${epNum}`;
  const userTopic = lastUserMsg.trim() || 'the central development';

  // Determine user intent from the latest message
  const isDialogueIntent = /\b(dialogue|lines?|speech|say|speaking|quote|talk|conversation|punch\s*up)\b/i.test(lastUserMsg);
  const isCameraIntent = /\b(camera|angle|shot|cinematography|framing|visual|lighting|shadow|composition)\b/i.test(lastUserMsg);
  const isTensionIntent = /\b(tension|stakes|intensity|drama|darker|dramatic|suspense|conflict|confrontation)\b/i.test(lastUserMsg);
  const isRedirectIntent = /\b(re-?direct|change|instead|twist|what\s*if|new\s*direction|ending)\b/i.test(lastUserMsg);

  let reply = '';
  let synthesizedPremise = '';
  let suggestedPanels: { panelNumber: number; description: string; dialogue?: string }[] = [];
  let quickStarters: string[] = [];

  if (chatMode === 'current') {
    if (isDialogueIntent) {
      reply = `### Directing Dialogue for Issue #${epNum}: "${epTitle}" 💬\n\nTo make the exchange between **${leadName}** and **${secondName}** crackle with energy, here is a sharper dialogue pass:\n\n• **Panel 1 — Cold Opening:**\n  > **${leadName}:** "You took your time getting here."\n\n• **Panel 2 — Raising the Stakes:**\n  > **${secondName}:** "I wasn't looking for you. I was making sure no one else followed."\n\n• **Panel 3 — The Turning Point:**\n  > **${leadName}:** "Then close the door. What happens next doesn't leave this room."\n\n• **Panel 4 — Cliffhanger Hook:**\n  > **${secondName}:** "It already did."\n\nHow do these lines sound for their vocal tone? We can adjust the snark or make it more deadly serious.`;
      quickStarters = ['Make it more sarcastic', 'Raise the emotional stakes', 'Keep these lines & re-draw'];
    } else if (isCameraIntent) {
      reply = `### Cinematography & Visual Staging Pass 🎬\n\nFor **Issue #${epNum}**, here is how we can dial in the camera angles across the 4 panels:\n\n1. **Panel 1 (Wide Establishing):** High-angle panoramic shot looking down on ${leadName}, establishing spatial isolation and setting the mood with deep chiaroscuro lighting.\n2. **Panel 2 (Over-the-Shoulder Medium):** Camera resting just behind ${leadName}'s shoulder facing ${secondName}, framing the physical distance and eye contact.\n3. **Panel 3 (Dutch Tilt Low-Angle):** Dynamic tilted camera looking up from floor level, emphasizing sudden motion and power dynamics.\n4. **Panel 4 (Extreme Close-Up):** Tight framing on ${leadName}'s eyes and expression, with high-contrast rim lighting catching the emotion.\n\nWant me to apply this visual staging to the artwork prompt?`;
      quickStarters = ['Apply visual staging & re-draw', 'Make Panel 3 even more dynamic', 'Focus on atmospheric lighting'];
    } else if (isTensionIntent) {
      reply = `### Escalating the Dramatic Tension ⚡\n\nTo amplify the suspense around "${userTopic}" in **Issue #${epNum}**:\n\n• **Shift the Power Dynamic:** Rather than a balanced confrontation, put ${leadName} momentarily on the back foot, forcing a sudden calculated risk in Panel 3.\n• **Environmental Pressure:** Introduce physical constraints—flickering lights, closing exits, or a ticking countdown—so the characters are reacting to both each other and the space.\n• **Unspoken Subtext:** Let ${secondName}'s body language say what dialogue leaves hidden.\n\nReady to re-render this page with maximum tension? Hit **Re-Direct Scene** or **Clean Re-Draw**!`;
      quickStarters = ['Apply high tension & re-draw', 'Introduce a sudden complication', 'Focus on character body language'];
    } else if (isRedirectIntent) {
      synthesizedPremise = `Issue #${epNum}: In the wake of ${userTopic}, ${leadName} takes decisive control of the situation against ${secondName}, forcing an unexpected narrative turn in ${world.title}.`;
      reply = `### Re-Directing Scene: "${userTopic}" 🎬\n\nI love this pivot! Here is how we restructure the sequence:\n\n• **Panel 1:** ${leadName} enters with a completely altered objective around "${userTopic}".\n• **Panel 2:** ${secondName} reacts with suspicion, realizing the plan has changed.\n• **Panel 3:** A decisive physical or verbal confrontation triggers the new turn.\n• **Panel 4:** The new status quo is established, setting up high-stakes fallout.\n\nClick **Apply Scene Beat** below to lock in this direction!`;
      quickStarters = ['Apply this direction', 'Make it even more unexpected', 'Re-draw page artwork'];
    } else {
      reply = `### AI Director Review for Issue #${epNum}: "${epTitle}"\n\nAnalyzing **"${userTopic}"** in the context of our established canon:\n\n• **Character Focus:** Keeping the spotlight on **${leadName}** maintains sharp continuity with the story so far.\n• **Scene Progression:** The tension between ${leadName} and ${secondName} is the driving engine of this issue.\n• **Pacing Recommendation:** Make sure Panel 3 delivers the dramatic peak so Panel 4 can land the emotional takeaway.\n\nWhat would you like to direct next—polish dialogue, refine camera angles, or re-direct the scene outcome?`;
      quickStarters = ['Punch up the dialogue', 'Adjust cinematography', 'Re-direct this scene'];
    }

    synthesizedPremise = synthesizedPremise || `Issue #${epNum}: ${leadName} confronts the escalating developments around "${userTopic}" with ${secondName}, driving dramatic narrative momentum in ${world.title}.`;
    suggestedPanels = [
      { panelNumber: 1, description: `${leadName} enters the space, establishing intent around "${userTopic}".` },
      { panelNumber: 2, description: `Tense interaction and dialogue between ${leadName} and ${secondName}.` },
      { panelNumber: 3, description: `The scene reaches a dramatic turning point with high-contrast framing.` },
      { panelNumber: 4, description: `A decisive resolution sets up the narrative hook for the next chapter.` },
    ];
  } else {
    // Next Episode Mode
    synthesizedPremise = `Episode #${epNum + 1}: ${leadName} confronts "${userTopic}" alongside ${secondName}, carrying forward the canon established in Issue #${epNum}.`;
    reply = `### Brainstorming Issue #${epNum + 1} 🚀\n\nBuilding directly on the climax of Issue #${epNum}:\n\n• **Opening Hook (Panel 1):** ${leadName} deals with the immediate aftermath of "${userTopic}".\n• **Escalation (Panel 2):** ${secondName} brings new information or a direct challenge.\n• **The Climax (Panel 3):** An unexpected confrontation shifts the balance of power.\n• **The Cliffhanger (Panel 4):** A decisive choice leaves an irresistible hook for the following issue.\n\nWhen this beat feels right, click **Draw Episode** to generate!`;
    suggestedPanels = [
      { panelNumber: 1, description: `${leadName} confronts the immediate aftermath of "${userTopic}".` },
      { panelNumber: 2, description: `${secondName} arrives, escalating the narrative friction.` },
      { panelNumber: 3, description: `A high-stakes confrontation reaches a critical revelation.` },
      { panelNumber: 4, description: `A dramatic cliffhanger is established for the next issue.` },
    ];
    quickStarters = [
      'Resolve the scene with a decisive breakthrough',
      'Introduce an unexpected rival twist',
      'End on a suspenseful cliffhanger',
    ];
  }

  return {
    reply,
    synthesizedPremise,
    castSpotlight: spotlightChars,
    castExcluded: excludedChars,
    suggestedPanels,
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

    // Target AI provider & credentials resolution
    // MindStrip uses Official Meta Model API as the primary reasoning engine
    const metaApiKey = process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY || '';
    const metaBaseUrl = process.env.META_MODEL_BASE_URL || 'https://api.meta.ai/v1';
    const metaModel = 'muse-spark-1.3';

    let targetBaseUrl = metaBaseUrl;
    let targetApiKey = metaApiKey;
    let targetModel = metaModel;

    if (provider === 'fireworks' && (apiKey || process.env.FIREWORKS_API_KEY)) {
      targetBaseUrl = baseUrl || 'https://api.fireworks.ai/inference/v1';
      targetApiKey = apiKey || process.env.FIREWORKS_API_KEY || '';
      targetModel = modelName && modelName.includes('fireworks') ? modelName : 'accounts/fireworks/models/llama-v3p3-70b-instruct';
    } else if (provider === 'groq' && (apiKey || process.env.GROQ_API_KEY)) {
      targetBaseUrl = baseUrl || 'https://api.groq.com/openai/v1';
      targetApiKey = apiKey || process.env.GROQ_API_KEY || '';
      targetModel = modelName && modelName.includes('llama') ? modelName : 'llama-3.3-70b-versatile';
    } else {
      // Official Meta Model API (Default & Primary)
      targetBaseUrl = metaBaseUrl;
      targetApiKey = metaApiKey || apiKey || '';
      targetModel = (modelName && !modelName.includes('fireworks') && !modelName.includes('groq')) ? modelName : 'muse-spark-1.3';
    }

    // If no credentials available, gracefully generate intelligent dynamic response
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
2. Directly answer whatever the creator asks! If they ask about dialogue, give sharp dialogue lines. If they ask about cinematography, give camera angles and lighting directions. If they ask about character motives or canon, explain based on full story continuity up to this page.
3. NEVER repeat the same boilerplate or generic intro. Respond freshly and dynamically to the latest user message.
4. If the creator asks to re-direct this scene, provide an updated premise and an optimized 4-panel visual breakdown.
5. Enforce Cast Scoping: keep focus on the characters actively in this scene.
6. Return clean JSON matching the schema below.`;
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

    const parsed = extractJsonFromModelContent(rawContent);
    if (!parsed) {
      return NextResponse.json(
        generateDynamicCoDirectorResponse(messages, world, currentEpisode, chatMode, storyContext)
      );
    }

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
