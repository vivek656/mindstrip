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

  if (focusSection === 'visuals') {
    if (userMessage && userMessage.trim()) {
      const cleanInput = userMessage.trim();
      return {
        reply: `Got it! Updating @${name}'s visual styling directly from your direction: "${cleanInput}".`,
        questions: chatHistoryLength > 2 ? [] : [
          `Would you like to add any signature props or accessory details?`
        ],
        quickOptions: [
          `🎨 Keep this exact signature look for all panels`,
          `🔍 Focus on distinctive facial features and expressions`,
          `✨ Add high-contrast color accents to the palette`
        ],
        suggestedUpdates: {
          appearance: cleanInput,
          wardrobe: cleanInput,
          iconicItem: character?.iconicItem || `Signature styling accessory defined by creator`
        }
      };
    }

    // Initial greeting / prompt for Visuals
    return {
      reply: `Let's design @${name}'s visual continuity anchors for "${worldTitle}"! How should ${name} look in the comic panels? Tell me about their clothing, facial features, hair, or signature items.`,
      questions: [
        `What is their signature everyday outfit?`,
        `What visual accessory or item defines their silhouette?`
      ],
      quickOptions: [
        `✨ Modern tailored attire with clean lines`,
        `🧥 Practical everyday clothing suited for ${genre}`,
        `🎨 Distinct aesthetic styled to your creative vision`
      ]
    };
  }

  if (focusSection === 'lore') {
    if (userMessage && userMessage.trim()) {
      const cleanInput = userMessage.trim();
      return {
        reply: `Got it! Updating @${name}'s lore and backstory to your exact specification: "${cleanInput}".`,
        questions: chatHistoryLength > 1 ? [] : [
          `What core motivation or goal drives @${name} in "${worldTitle}"?`
        ],
        quickOptions: [
          `🎯 Independent ambition: forging their own path on their own terms`,
          `🛡️ Protecting what they have built against external threats`,
          `⚡ Striving for excellence and proving their true capability`
        ],
        suggestedUpdates: {
          backstory: cleanInput,
          motivation: `To achieve their defining ambition in ${worldTitle} on their own terms.`,
          flaws: `A fierce independence that makes delegating trust difficult during high-stakes crises.`,
          secret: `Guards an undisclosed truth or contingency plan from their past.`
        }
      };
    }

    return {
      reply: `Let's explore @${name}'s origins and formative history for "${worldTitle}". What shaped them into who they are?`,
      questions: [
        `What formative experience defines their origin?`,
        `What is their primary driving purpose?`
      ],
      quickOptions: [
        `🎯 Built their own path through sheer determination and vision`,
        `👑 High-stakes legacy: proving their worth beyond expectations`,
        `⚡ Driven by a past turning point that changed their trajectory`
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
  const posPronoun = character?.gender === 'female' ? 'her' : character?.gender === 'male' ? 'his' : 'their';
  const objPronoun = character?.gender === 'female' ? 'her' : character?.gender === 'male' ? 'him' : 'them';

  return {
    reply: `I'm your AI Character Co-Director for @${name} in "${worldTitle}". Let's develop ${objPronoun} together! Tell me what you envision for ${posPronoun} role, personality, or look, and I will tailor specific suggestions for your dossier.`,
    questions: [
      `What is ${posPronoun} primary role and conflict in the upcoming episodes?`,
      `Should we focus on Visual Anchors (wardrobe/accessories) or Lore & Backstory first?`
    ],
    quickOptions: [
      `🎨 Refine ${posPronoun} physical look & signature wardrobe`,
      `📖 Deepen ${posPronoun} origin story & core motivation`,
      `💬 Dial in ${posPronoun} dialogue voice & catchphrases`,
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
      modelName,
    } = body;

    const charName = character?.name || 'Character';
    const charRole = character?.role || 'protagonist';
    const charGender = character?.gender || 'unspecified';

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
    } else if (provider === 'baseten') {
      targetBaseUrl = baseUrl || process.env.BASETEN_BASE_URL || 'https://bridge.baseten.co/v1';
      targetApiKey = apiKey || process.env.BASETEN_API_KEY || '';
      targetModel = modelName || 'llama-3.3-70b';
    } else if (provider === 'ollama') {
      targetBaseUrl = baseUrl || 'http://localhost:11434/v1';
      targetApiKey = 'ollama';
      targetModel = modelName || 'llama3.3';
    } else {
      if (!modelName || modelName === 'llama-3.3-70b-instruct') {
        targetModel = 'muse-spark-1.3';
      }
    }

    const cleanBase = targetBaseUrl.replace(/\/+$/, '');

    // If an API key is available, call Meta Muse Spark / Llama 3.3 70B
    if (targetApiKey) {
      try {
        const model = targetModel;

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

        // Format conversational messages cleanly without duplicate user turns (uncapped context)
        const sanitizedHistory = (chatHistory || []).map((m: any) => ({
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
