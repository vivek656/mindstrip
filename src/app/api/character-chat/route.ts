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
  const isCorporateOrCeo = rawInput.includes('ceo') || rawInput.includes('office') || rawInput.includes('namita') || rawInput.includes('corporate') || rawInput.includes('contract') || rawInput.includes('client');
  const isRomanceOrCrush = rawInput.includes('crush') || rawInput.includes('romance') || rawInput.includes('love') || rawInput.includes('seduce') || rawInput.includes('flirt');
  const isStilettoOrHeels = rawInput.includes('stiletto') || rawInput.includes('heel') || rawInput.includes('louboutin') || rawInput.includes('shoe');
  const isActionOrHero = rawInput.includes('hero') || rawInput.includes('action') || rawInput.includes('fight') || rawInput.includes('tactical');

  if (focusSection === 'visuals') {
    if (userMessage && userMessage.trim()) {
      // User responded with visual guidance
      const appearanceDraft = isCorporateOrCeo
        ? `Resembles a commanding Indian businesswoman with radiant olive complexion, poised posture, shoulder-length glossy blow-dried dark hair, sharp expressive dark eyes, and a confident, magnetic executive presence.`
        : `Distinctive facial structure with observant eyes, tailored styling, and an immediately recognizable silhouette suited for ${genre}.`;

      const wardrobeDraft = isStilettoOrHeels || isCorporateOrCeo
        ? `Ultra-luxury CEO dominatrix-chic: fitted silk blouses in ivory, blood-red and jet black, high-waist tailored pencil skirts, structured designer cape blazers, and designer sarees in champagne gold and deep wine for high-stakes gala negotiations.`
        : `Signature color-blocked daily attire with sharp tailored lines, deep contrasting tones, and authentic textural details.`;

      const iconicItemDraft = isStilettoOrHeels || isCorporateOrCeo
        ? `Glossy black Christian Louboutin So Kate stilettos with blood-red soles — the sharp, rhythmic click on marble that commands instant silence and deference across the corporate floor.`
        : `A signature heirloom accessory or everyday carry prop that anchors their silhouette in every comic frame.`;

      return {
        reply: `That gives @${name} incredible visual authority! The contrast between her poised presence and sharp executive styling creates an instant visual anchor for the comic artist.

Here is the drafted visual continuity package based on our discussion:`,
        questions: [
          `Does @${name} have a signature color accent (e.g. ruby red lips, emerald jewelry, or gold trim)?`,
          `When she's off-the-clock or in private, does her wardrobe soften or stay hyper-armored?`
        ],
        quickOptions: [
          `👠 Blood-red Louboutin stilettos & ivory silk blouses`,
          `🥻 Champagne gold designer saree with sharp cape blazer`,
          `💎 Diamond solitaire studs & gold executive fountain pen`,
          `💄 Bold matte crimson lip & tailored midnight-black suit`
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
2. Does she have a trademark accessory or prop (like high-end stilettos, a statement blazer, or luxury jewelry)?
3. What hair, complexion, or facial feature gives her that unforgettable gaze?`,
      questions: [
        `What is her go-to daily outfit and color palette?`,
        `What signature item or footwear anchors her silhouette in wide shots?`
      ],
      quickOptions: [
        `👠 Luxury CEO power suit with blood-red Louboutin stilettos`,
        `🥻 Designer silk sarees with tailored cape blazers`,
        `☕ Smart casual tailored pencil skirt with silk ivory blouse`,
        `💼 Sharp double-breasted charcoal blazer & diamond studs`
      ],
      suggestedUpdates: isCorporateOrCeo ? {
        wardrobe: `Ultra-luxury CEO dominatrix-chic: fitted silk blouses in ivory, blood-red and jet black, high-waist pencil skirts and tailored designer sarees in champagne gold and wine.`,
        iconicItem: `Her glossy black Louboutin So Kate stilettos with blood-red soles — the sharp click on marble that silences the entire executive floor.`
      } : undefined
    };
  }

  if (focusSection === 'lore') {
    if (userMessage && userMessage.trim()) {
      return {
        reply: `This backstory gives @${name} so much dramatic depth. Balancing high-stakes ambitions with personal vulnerability makes her an unforgettable character in the story!

Here is how we can refine her psychological profile:`,
        questions: [
          `What is the one line she would NEVER cross, even to win?`,
          `Who in the world holds the key to her hidden soft spot?`
        ],
        quickOptions: [
          `🎯 Driven to prove she built her empire on merit, not favors`,
          `🔒 Keeps a classified personal diary under biometric lock`,
          `⚠️ Blindspot: Overconfidence and refusal to show hesitation`,
          `💔 Hides a past heartbreak behind an impenetrable corporate persona`
        ],
        suggestedUpdates: {
          backstory: character?.backstory || `@${name} rose through the cutthroat ranks through relentless preparation and ruthless emotional discipline. Behind her poised demeanor lies someone who fought for every inch of authority she wields.`,
          motivation: `To maintain absolute control over her empire and negotiate from an unassailable position of strength.`,
          flaws: `Inability to display vulnerability or delegate critical trust to others.`,
          secret: `Has secretly orchestrated a personal contingency buyout to protect her firm against hostile takeovers.`
        }
      };
    }

    return {
      reply: `Let's dig into @${name}'s core psychology and origin. What drives her beneath the surface?

1. What formative trial or triumph made her who she is today?
2. What is her core motivation or what does she fear losing most?
3. What fatal flaw or blindspot could cause high-stakes drama?`,
      questions: [
        `What is her ultimate ambition in "${worldTitle}"?`,
        `What secret truth does she guard from colleagues and rivals?`
      ],
      quickOptions: [
        `🎯 Total executive independence and boardroom supremacy`,
        `🔒 Guarding an emotional vulnerability behind an iron facade`,
        `⚠️ Believing she can charm or outmaneuver any competitor`,
        `📖 Self-made origin: started with nothing and trusts nobody`
      ]
    };
  }

  if (focusSection === 'voice') {
    return {
      reply: `How does @${name} sound when she commands a room or speaks in private?

1. What is her speech cadence (sharp, teasing, honeyed, velvety, deadpan)?
2. Does she have a signature phrase or verbal tic?
3. How does her voice change when she's negotiating vs when she's alone?`,
      questions: [
        `What is her signature line or verbal sting?`,
        `How does she disarm opponents in dialogue?`
      ],
      quickOptions: [
        `💬 "Let's cut the pleasantries and talk valuation."`,
        `💬 "I don't ask for contracts, darling. People beg me to take them."`,
        `💬 Velvety, measured cadence with sharp razor-like precision`,
        `💬 Warm, teasing wit masked with strategic corporate calculation`
      ],
      suggestedUpdates: {
        voiceTone: `Velvety, deliberate cadence with razor-sharp articulation; effortlessly shifts from disarming corporate warmth to ice-cold leverage in a heartbeat.`,
        catchphrase: `"I don't negotiate for table scraps, darling. I decide who eats."`
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
1. Act as a collaborative, highly perceptive comic co-director interviewing the creator about this character.
2. If the user tells you what they want (e.g. "She is based on Namita Thapar, 45 yo hot mommy CEO, stilettos, high stakes"), enthusiastically incorporate their exact vision into concrete character continuity anchors!
3. Ask 1-2 thoughtful, evocative follow-up questions about the focus section to spark creative decisions.
4. Provide 3-4 punchy, clickable quick-choice options that the creator can tap as shortcuts.
5. In "suggestedUpdates", provide polished, publication-ready text for the relevant dossier fields (appearance, wardrobe, iconicItem, backstory, motivation, etc.) so the creator can click "Apply to Dossier" with 1 click!

CRITICAL FORMATTING:
Respond ONLY with a valid JSON object matching this exact schema:
{
  "reply": "Conversational, engaging response to the creator acknowledging their input, discussing dramatic implications, and framing the next creative question.",
  "questions": [
    "Evocative question 1 about this section?",
    "Evocative question 2 about this section?"
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

        // Format conversational messages
        const formattedMessages = [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-6).map((m: any) => ({
            role: m.role,
            content: m.content
          })),
          {
            role: 'user',
            content: userMessage || `Hello! Let's interview me about @${charName}'s ${focusSection}. Ask me the most critical questions to define her.`
          }
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
            max_tokens: 1200,
            response_format: { type: 'json_object' },
          }),
        });

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          const rawContent = aiJson.choices?.[0]?.message?.content?.trim() || '';
          const cleaned = rawContent.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
          const parsed = JSON.parse(cleaned);

          return NextResponse.json({
            reply: parsed.reply || `Understood! Let's refine @${charName}'s profile.`,
            questions: Array.isArray(parsed.questions) ? parsed.questions : [],
            quickOptions: Array.isArray(parsed.quickOptions) ? parsed.quickOptions : [],
            suggestedUpdates: parsed.suggestedUpdates || {},
          });
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
