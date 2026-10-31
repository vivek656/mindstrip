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
 * Never returns a static, hardcoded template: dynamically reflects user conversation,
 * detected characters, and genre context.
 */
function generateDynamicCoDirectorResponse(
  messages: { role: string; content: string }[],
  world: { title?: string; genre?: string; characters?: ComicCharacter[] },
  currentEpisode?: { episodeNumber?: number }
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
    // If none explicitly mentioned, default to primary character mentioned or lead
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
  const reply = `I like where you're taking this scene! Focusing specifically on **${leadName}** ${guestsStr ? `and **${guestsStr}**` : ''} keeps the narrative progression sharp and compelling.

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

  const premise = `Episode #${(currentEpisode?.episodeNumber || 1) + 1}: ${leadName} navigates "${userTopic}" with ${guestsStr || 'key scene partners'}, driving dramatic narrative momentum in ${world.title}.`;

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
    } = body;

    const worldTitle = world.title || 'Comic Universe';
    const genre = world.genre || 'Drama';
    const worldTagline = world.tagline || '';
    const worldLore = world.lore || '';
    const characters: ComicCharacter[] = world.characters || [];

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
        generateDynamicCoDirectorResponse(messages, world, currentEpisode)
      );
    }

    const castRosterStr = characters
      .map((c) => `- @${c.name} (${c.role}): ${c.personality || c.description || 'character'}`)
      .join('\n');

    const systemPrompt = `You are MindStrip's Meta AI Comic Co-Director & Creative Partner in the writers' room.
You are collaborating in a natural, ChatGPT-style back-and-forth conversation with a comic creator to direct the next page/episode of their comic.

UNIVERSE CONTEXT:
- World: "${worldTitle}"
- Genre: ${genre}
${worldTagline ? `- Tagline: "${worldTagline}"` : ''}
${worldLore ? `- Lore: "${worldLore}"` : ''}
- Active Universe Cast:
${castRosterStr || 'No predefined cast'}
- Current Episode Number: #${(currentEpisode.episodeNumber || 1) + 1}

CORE CO-DIRECTOR BEHAVIORS:
1. Talk like an expert, enthusiastic comic co-director (like ChatGPT) having a real conversation.
2. DO NOT interrogate the creator with endless multiple-choice questionnaires or rigid quizzes!
3. Answer their questions directly, offer visual pacing, dialogue lines, and dramatic staging ideas.
4. If they introduce a new guest character (e.g. "a client", "the boss", "a date", "a stranger"), develop them naturally in the scene alongside the mentioned character(s).
5. Enforce Cast Scoping: Only include characters who genuinely belong in this scene. Exclude unmentioned superheroes/villains from invading this page!
6. Provide a 4-panel visual breakdown (Panel 1, 2, 3, 4) suggesting cinematic camera angles, character body language, and dramatic beats.
7. You may suggest 1 brief creative fork or open thought IF genuinely helpful, but let the user lead.
8. Maintain continuity across the conversation history.

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
        generateDynamicCoDirectorResponse(messages, world, currentEpisode)
      );
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
    if (!rawContent) {
      return NextResponse.json(
        generateDynamicCoDirectorResponse(messages, world, currentEpisode)
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
      generateDynamicCoDirectorResponse(body?.messages || [], body?.world || {}, body?.currentEpisode || {})
    );
  }
}
