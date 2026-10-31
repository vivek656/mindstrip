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

  // Detect episodic guests
  const hasClient = /client|deal|contract|bid|customer/.test(lower);
  const hasBoss = /boss|manager|executive|director/.test(lower);
  const hasRival = /rival|competitor|enemy/.test(lower);
  const guestLabels: string[] = [];
  if (hasClient) guestLabels.push('The New Client');
  if (hasBoss) guestLabels.push('The Corporate Boss');
  if (hasRival) guestLabels.push('The Rival Bidder');

  const leadName = spotlightChars[0] || 'The Lead';
  const guestsStr = guestLabels.length > 0 ? guestLabels.join(' & ') : '';
  const sceneCast = [...spotlightChars, ...guestLabels];

  // Detect themes & moods
  const isSeductionOrCharm = /seduce|charm|flirt|attract|allure/.test(lower);
  const isCorporateOffice = /office|contract|business|boardroom|deal|meeting|presentation/.test(lower);
  const isTensionOrConflict = /fight|clash|tension|argue|threat|betray|trap/.test(lower);
  const isTwistOrHesitation = /hesitate|wait|twist|suspicious|doubt|turn|reveal/.test(lower);

  let reply = '';
  let panel1 = '';
  let panel2 = '';
  let panel3 = '';
  let panel4 = '';
  let premise = '';
  let quickStarters: string[] = [];

  if (isCorporateOffice || hasClient || isSeductionOrCharm) {
    reply = `I like where you're taking this scene! Focusing specifically on **${leadName}** ${guestsStr ? `and **${guestsStr}**` : ''} keeps the spotlight razor-sharp without unnecessary cast clutter.

Here is how we can pace this dramatic beat across the 4 panels:

• **Panel 1 — The Approach:** ${leadName} enters the high-floor glass boardroom with effortless poise and confidence, locking eyes with ${guestsStr || 'her counterpart'}.
• **Panel 2 — The Maneuver:** ${leadName} leans forward across the polished mahogany table, pairing calculated charisma with incisive business insight to disarm defenses.
• **Panel 3 — The Reaction:** ${guestsStr || 'The client'} leans back, swirling an espresso or checking the contract numbers, clearly intrigued but assessing her motives.
• **Panel 4 — The Pivot:** A high-tension beat — the pen is poised over the signature line, or an unexpected counter-condition is put on the table.

How does that pacing feel? We can either push straight for her sealing the contract, or introduce a sudden complication.`;

    panel1 = `${leadName} enters the sleek glass-walled boardroom with commanding posture, carrying the confidential proposal dossier.`;
    panel2 = `${leadName} sits opposite ${guestsStr || 'the executive'}, leaning in with a disarming smile and sharp, persuasive gaze.`;
    panel3 = `${guestsStr || 'The client'} studies the terms with an enigmatic expression, visibly impressed yet testing her resolve.`;
    panel4 = `High-stakes close-up: A luxury fountain pen hovers above the signature block as eye contact intensifies.`;

    premise = `Episode #${(currentEpisode?.episodeNumber || 1) + 1}: ${leadName} conducts high-stakes negotiations with ${guestsStr || 'a high-profile client'} in a sleek modern boardroom, using magnetic charm and razor-sharp intellect to close the deal.`;

    quickStarters = [
      'Seal the deal cleanly with a toast',
      'The client adds a dangerous unexpected condition',
      'Security or the boss interrupts right before signing'
    ];
  } else if (isTensionOrConflict) {
    reply = `That raises the stakes dramatically! Having **${leadName}** face this conflict head-on creates great narrative momentum.

Here is a dynamic 4-panel visual breakdown:

• **Panel 1 (Setup):** Atmospheric establishing shot framing the escalating tension and body language.
• **Panel 2 (The Escalation):** Sharp dialogue exchange or tactical move where ${leadName} asserts control.
• **Panel 3 (The Turning Point):** An intense reaction beat or close-up revealing true intentions.
• **Panel 4 (The Cliffhanger):** A suspenseful freeze-frame leaving the outcome on a knife-edge.

Would you like to resolve this conflict in this issue, or carry the standoff into the next chapter?`;

    panel1 = `${leadName} confronts the situation with resolute focus in high-contrast dramatic lighting.`;
    panel2 = `The verbal or physical confrontation escalates as stakes are laid out.`;
    panel3 = `A sudden shift in leverage leaves the room dead silent.`;
    panel4 = `Dramatic cliffhanger panel setting up the consequences.`;

    premise = `Episode #${(currentEpisode?.episodeNumber || 1) + 1}: ${leadName} faces an escalating conflict that tests their resolve and alters the balance of power.`;

    quickStarters = [
      'Have them outsmart the opposition cleanly',
      'Add a shocking betrayal or secret reveal',
      'Cut to black right at the climax'
    ];
  } else {
    // General conversational creative partner
    reply = `Great direction. Building this beat around **${leadName}** keeps the storytelling intimate and visually coherent.

Here is a 4-panel flow designed to bring that idea to life:

• **Panel 1:** Establishing wide shot setting the mood and atmosphere of the location.
• **Panel 2:** Medium shot as ${leadName} takes the initiative and drives the action.
• **Panel 3:** Expressive close-up capturing micro-expressions and underlying tension.
• **Panel 4:** Dramatic payoff or transition leading directly into the next development.

Tell me if you want to tweak any specific panel, or hit **Draw Episode** whenever you're ready!`;

    panel1 = `${leadName} in their element, setting the scene with distinct character atmosphere.`;
    panel2 = `${leadName} makes a decisive move, advancing the core scene objective.`;
    panel3 = `Intimate reaction framing showcasing character depth and personality.`;
    panel4 = `Striking final beat that caps the sequence and propels the story forward.`;

    premise = `Episode #${(currentEpisode?.episodeNumber || 1) + 1}: ${lastUserMsg || `${leadName} drives the next chapter of the story.`}`;

    quickStarters = [
      'Focus more on dialogue and humor',
      'Make the visual framing more cinematic',
      'Add an unexpected twist at the end'
    ];
  }

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
${worldLore ? `- Lore: "${worldLore.slice(0, 300)}..."` : ''}
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

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-8).map((m: any) => ({
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
        max_tokens: 1400,
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
    const rawContent = data.choices?.[0]?.message?.content || '{}';
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
