import { NextRequest, NextResponse } from 'next/server';

export interface CharacterChatResponse {
  reply: string;
  questions: string[];
  quickOptions: string[];
  suggestedUpdates?: {
    appearance?: string;
    wardrobe?: string;
    iconicItem?: string;
    backstory?: string;
    motivation?: string;
    flaws?: string;
    secret?: string;
    voiceTone?: string;
    catchphrase?: string;
    personality?: string;
    abilities?: string;
    gear?: string;
  };
}

// Heuristic fallback generator when AI API key is omitted or rate-limited
function generateHeuristicCharacterChat(
  character: any,
  worldTitle: string,
  genre: string,
  focusSection: string,
  userMessage?: string,
  chatHistoryLength: number = 0
): CharacterChatResponse {
  const name = character?.name || 'Character';
  const role = character?.role || 'protagonist';
  const rawInput = (userMessage || character?.appearance || character?.backstory || '').toLowerCase();

  // Detect specific themes
  const isCorporateOrCeo = rawInput.includes('ceo') || rawInput.includes('office') || rawInput.includes('corporate') || rawInput.includes('contract') || rawInput.includes('client');
  const isRomanceOrCrush = rawInput.includes('crush') || rawInput.includes('romance') || rawInput.includes('love') || rawInput.includes('seduce') || rawInput.includes('flirt');
  const isStilettoOrHeels = rawInput.includes('stiletto') || rawInput.includes('heel') || rawInput.includes('shoe');
  const isActionOrHero = rawInput.includes('hero') || rawInput.includes('action') || rawInput.includes('fight') || rawInput.includes('tactical');

  if (focusSection === 'visuals') {
    if (userMessage && userMessage.trim()) {
      // Check if user explicitly mentioned attire style
      const mentionsWestern = /western|suit|blazer|trousers|skirt|pants|shirt|formal|dress/.test(rawInput);
      const mentionsSaree = /saree|sari|traditional|ethnic/.test(rawInput);

      let wardrobeDraft = '';
      if (mentionsSaree) {
        wardrobeDraft = `Traditional attire with refined textural detailing, structured draping, and elegant tonal accents.`;
      } else if (mentionsWestern || isCorporateOrCeo) {
        wardrobeDraft = `High-end modern executive western attire: tailored structured blazer, crisp button-down shirt or blouse, high-waist tailored trousers or pencil skirt, and polished footwear.`;
      } else {
        wardrobeDraft = `Signature styling based on creator vision: ${userMessage.slice(0, 120)}. Authentic textural details and crisp color contrast.`;
      }

      // User responded with visual guidance
      const appearanceDraft = isCorporateOrCeo
        ? `Polished executive presence with composed posture, observant eyes, and sharp, tailored styling suited for high-stakes corporate environments.`
        : `Distinctive facial structure with observant eyes, tailored styling, and an immediately recognizable silhouette suited for ${genre}: ${userMessage.slice(0, 100)}.`;

      const iconicItemDraft = isStilettoOrHeels || isCorporateOrCeo
        ? `Polished pointed-toe dress shoes or heels that project authority and poise across any executive floor.`
        : `Signature accessory reflecting their personality: ${userMessage.slice(0, 80)}.`;

      return {
        reply: `Got it! Updating @${name}'s visual continuity anchors to reflect "${userMessage.trim().slice(0, 90)}". The attire and styling have been updated to your exact specification so all future comic panels will strictly render her in this look.

Here is her updated visual continuity package:`,
        questions: chatHistoryLength > 2 ? [] : [
          `Would you like to refine her color accents or keep her signature styling as is?`
        ],
        quickOptions: [
          `👠 Modern tailored blazer, crisp blouse & fitted trousers`,
          `💼 Sharp double-breasted charcoal power suit & pointed heels`,
          `💎 Minimalist luxury watch & executive fountain pen`,
          `👔 Sleek monochromatic tailoring with clean architectural lines`
        ],
        suggestedUpdates: {
          appearance: character?.appearance || appearanceDraft,
          wardrobe: wardrobeDraft,
          iconicItem: iconicItemDraft,
        }
      };
    }

    // Initial greeting / prompt for Visuals
    return {
      reply: `Let's design @${name}'s visual continuity anchors for "${worldTitle}"! Since she is ${role === 'protagonist' ? 'the lead' : `a ${role}`}, her look will be injected into every Meta Muse Image generation prompt so she stays 100% consistent.

To get her look exactly right, tell me:
1. What power silhouette or signature outfit immediately defines her?
2. Does she have a trademark accessory or prop (like high-end footwear, a statement jacket, or signature jewelry)?
3. What hair, complexion, or facial feature gives her that unforgettable gaze?`,
      questions: [
        `What is her go-to daily outfit and color palette?`,
        `What signature item or footwear anchors her silhouette in wide shots?`
      ],
      quickOptions: [
        `💼 High-end tailored power suit with sharp clean lines`,
        `🧥 Minimalist structured blazer & tailored trousers`,
        `☕ Smart casual tailored trousers with clean shirt`,
        `✨ Custom designer attire based on creator vision`
      ],
      suggestedUpdates: isCorporateOrCeo ? {
        wardrobe: `High-end modern executive western attire: tailored structured blazer over a crisp shirt or blouse, high-waist tailored trousers, and polished footwear.`,
        iconicItem: `Polished pointed-toe heels or leather dress shoes with an authoritative, poised presence.`
      } : undefined
    };
  }

  if (focusSection === 'lore') {
    if (userMessage && userMessage.trim()) {
      const isOriginCorrection = /origin|born|wrong|childhood|father|mother|family|billionaire|daughter|son|rich|poor|started|founded|created/.test(userMessage.toLowerCase());
      const updatedBackstory = isOriginCorrection
        ? `${name}'s revised origin: ${userMessage.trim()}`
        : (character?.backstory ? `${character.backstory}\n\nKey development: ${userMessage.trim()}` : `${name}'s journey in ${worldTitle}: ${userMessage.trim()}`);

      return {
        reply: `Got it! Updating @${name}'s lore and formative history based on what you just shared: "${userMessage.trim().slice(0, 80)}".

I have updated the drafted dossier fields below to incorporate your direction:`,
        questions: chatHistoryLength > 1 ? [] : [
          `What defining principle or ambition drives @${name} forward in "${worldTitle}"?`
        ],
        quickOptions: [
          `🎯 Independent ambition: built her own empire from scratch`,
          `👑 High-stakes legacy: proving she is more than family inheritance`,
          `⚡ Ruthless perfectionism: never allowing anyone to dismiss her again`
        ],
        suggestedUpdates: {
          backstory: updatedBackstory,
          motivation: `To prove their authority and build an unassailable position in ${worldTitle}.`,
          flaws: `A fierce determination that makes it difficult to show vulnerability or accept compromises.`,
          secret: `Guards an undisclosed personal strategy to protect what they have built.`
        }
      };
    }

    return {
      reply: `Let's explore @${name}'s core psychology and origins for "${worldTitle}". What drives them beneath the surface?

1. What defining experience made them who they are today?
2. What is their primary ambition or what do they fear losing most?
3. What fatal flaw or blindspot could create dramatic tension?`,
      questions: [
        `What is their ultimate ambition in "${worldTitle}"?`,
        `What secret truth do they guard from others?`
      ],
      quickOptions: [
        `🎯 Fierce independence and autonomy in pursuing their goals`,
        `🔒 Protecting a hidden vulnerability behind a confident facade`,
        `⚠️ Believing they must carry every burden alone`,
        `📖 Self-made path: built their standing through relentless preparation`
      ]
    };
  }

  if (focusSection === 'voice') {
    return {
      reply: `How does @${name} sound when commanding a room or speaking in confidence?

1. What is their vocal cadence (sharp, warm, deliberate, deadpan)?
2. Do they have a signature catchphrase or speaking habit?
3. How does their tone shift when under pressure vs when at ease?`,
      questions: [
        `What is their signature line or verbal attitude?`,
        `How do they assert authority in dialogue?`
      ],
      quickOptions: [
        `💬 Sharp, articulate delivery with quiet confidence`,
        `💬 Warm and disarming with a quick, observant wit`,
        `💬 Measured, deliberate tone that commands immediate attention`,
        `💬 Candid, no-nonsense clarity with zero wasted words`
      ],
      suggestedUpdates: {
        voiceTone: `Measured, articulate cadence with a calm, authoritative presence suited for ${genre}.`,
        catchphrase: `"When the moment arrives, I don't hesitate."`
      }
    };
  }

  // Full / General Section
  return {
    reply: `I'm your AI Character Co-Director for @${name} in "${worldTitle}". Let's develop her together! Tell me what you envision for her role, personality, or look, and I will tailor specific questions and suggest updates for your dossier.`,
    questions: [
      `What is her primary role and conflict in the upcoming episodes?`,
      `Should we focus on her Visual Anchors (outfit/accessories) or Lore & Backstory first?`
    ],
    quickOptions: [
      `🎨 Refine her physical look & signature wardrobe`,
      `📖 Deepen her origin story & core motivation`,
      `💬 Dial in her dialogue voice & catchphrases`,
      `✨ Build a complete multi-dimensional character profile`
    ]
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      character,
      worldTitle = 'Untitled Universe',
      worldTagline = '',
      genre = 'Comic Universe',
      worldLore = '',
      worldLaws = [],
      existingCharacters = [],
      chatHistory = [],
      userMessage = '',
      focusSection = 'visuals',
      apiKey,
      baseUrl,
      provider = 'meta-api',
    } = body;

    const charName = character?.name || 'Character';
    const charRole = character?.role || 'protagonist';
    const charGender = character?.gender || 'unspecified';

    let targetBaseUrl = baseUrl || process.env.META_MODEL_BASE_URL || 'https://api.meta.ai/v1';
    let targetApiKey = apiKey || process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY || '';

    if (provider === 'fireworks') {
      targetBaseUrl = baseUrl || 'https://api.fireworks.ai/inference/v1';
      targetApiKey = apiKey || process.env.FIREWORKS_API_KEY || '';
    }

    const cleanBase = targetBaseUrl.replace(/\/+$/, '');

    // If an API key is available, call Meta Muse Spark / Llama 3.3 70B
    if (targetApiKey) {
      try {
        const model = targetBaseUrl.includes('api.meta.ai') ? 'muse-spark-1.3' : 'accounts/fireworks/models/llama-v3p3-70b-instruct';

        const systemPrompt = `You are the MindStrip AI Character Co-Director & Lead Narrative Architect for the comic universe "${worldTitle}" (${genre}).
${worldTagline ? `Universe Tagline: "${worldTagline}"\n` : ''}${worldLore ? `World Lore:\n"${worldLore}"\n` : ''}${worldLaws && worldLaws.length > 0 ? `World Ground Rules:\n${worldLaws.map((l: string) => `• ${l}`).join('\n')}\n` : ''}
CHARACTER UNDER DIRECTION:
- Name: "${charName}"
- Role: "${charRole}"
- Gender: "${charGender}"
- Current Appearance: "${character?.appearance || 'Unspecified'}"
- Current Wardrobe: "${character?.wardrobe || 'Unspecified'}"
- Current Iconic Prop: "${character?.iconicItem || 'Unspecified'}"
- Current Backstory: "${character?.backstory || 'Unspecified'}"
- Current Motivation: "${character?.motivation || 'Unspecified'}"
- Current Flaws: "${character?.flaws || 'Unspecified'}"
- Current Voice Tone: "${character?.voiceTone || 'Unspecified'}"
- Current Catchphrase: "${character?.catchphrase || 'Unspecified'}"

FOCUS SECTION: "${focusSection.toUpperCase()}" (e.g. VISUALS = face, hair, clothing, color palette, footwear, silhouette prop; LORE = origin, motivation, secret, fatal flaw; VOICE = speaking cadence, catchphrase, wit).

ROLE INSTRUCTIONS:
1. Act as a collaborative, highly perceptive comic co-director and creative partner (like ChatGPT).
2. If the user tells you what they want (e.g. "A sharp corporate executive in tailored suits with high-stakes ambitions"), enthusiastically incorporate their exact vision into concrete character continuity anchors!
3. Answer their questions directly, offer visual or narrative suggestions, and build context across turns.
4. DO NOT grill or interrogate the creator with endless questions. You may include 0 to 1 optional, thoughtful follow-up question ONLY IF it genuinely helps advance the character's development.
5. Provide 2-4 punchy, clickable quick-choice options that the creator can tap as shortcuts.
6. In "suggestedUpdates", provide polished, publication-ready text for the relevant dossier fields (appearance, wardrobe, iconicItem, backstory, motivation, etc.) so the creator can click "Apply to Dossier" with 1 click!

CRITICAL FORMATTING:
Respond ONLY with a valid JSON object matching this exact schema:
{
  "reply": "Conversational, engaging response to the creator acknowledging their input, discussing dramatic implications, and offering ideas.",
  "questions": [
    "Optional single thought question only if helpful (leave empty [] if user just made a statement or asked an answer)"
  ],
  "quickOptions": [
    "Option 1 description with emoji",
    "Option 2 description with emoji",
    "Option 3 description with emoji"
  ],
  "suggestedUpdates": {
    "appearance": "Polished text for physical appearance (if relevant to conversation)",
    "wardrobe": "Polished text for signature wardrobe & colors (if relevant)",
    "iconicItem": "Polished text for signature prop or silhouette accessory (if relevant)",
    "backstory": "Polished backstory (if relevant)",
    "motivation": "Polished motivation (if relevant)",
    "flaws": "Polished fatal flaw (if relevant)",
    "secret": "Polished secret (if relevant)",
    "voiceTone": "Polished voice tone (if relevant)",
    "catchphrase": "Polished catchphrase (if relevant)"
  }
}`;

        // Format conversational messages cleanly without duplicate user turns
        const sanitizedHistory = (chatHistory || []).slice(-8).map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '')
        }));
        const lastInHistory = sanitizedHistory[sanitizedHistory.length - 1];
        const isDuplicateLast = lastInHistory && lastInHistory.role === 'user' && lastInHistory.content.trim() === userMessage?.trim();

        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...(isDuplicateLast ? sanitizedHistory : [...sanitizedHistory, { role: 'user', content: userMessage || `Hello! Let's interview me about @${charName}'s ${focusSection}. Ask me the most critical questions to define her.` }])
        ];

        const aiRes = await fetch(`${cleanBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${targetApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 8192,
            response_format: { type: 'json_object' },
          }),
        });

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          const choice = aiJson.choices?.[0];
          const rawContent = choice?.message?.content?.trim() || '';
          if (rawContent) {
            const cleaned = rawContent.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(cleaned);

            return NextResponse.json({
              reply: parsed.reply || `Understood! Let's refine @${charName}'s profile.`,
              questions: Array.isArray(parsed.questions) ? parsed.questions : [],
              quickOptions: Array.isArray(parsed.quickOptions) ? parsed.quickOptions : [],
              suggestedUpdates: parsed.suggestedUpdates || {},
            });
          }
        }
      } catch (err) {
        console.warn('API call encountered error, falling back to heuristic engine:', err);
      }
    }

    // Heuristic fallback if API call was skipped or failed
    const heuristic = generateHeuristicCharacterChat(
      character,
      worldTitle,
      genre,
      focusSection,
      userMessage,
      chatHistory.length
    );

    return NextResponse.json(heuristic);
  } catch (error: any) {
    console.error('Character chat route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate character chat response' },
      { status: 500 }
    );
  }
}
