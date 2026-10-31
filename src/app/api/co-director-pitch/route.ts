import { NextRequest, NextResponse } from 'next/server';
import { ComicCharacter } from '@/types/comic';

export interface CoDirectorOption {
  label: string;
  description: string;
  beatAddition: string;
}

export interface CoDirectorQuestion {
  id: string;
  question: string;
  options: CoDirectorOption[];
}

export interface CoDirectorGuestCharacter {
  name: string;
  role: string;
  appearance: string;
  description: string;
  avatarEmoji?: string;
}

export interface CoDirectorPitchResult {
  premiseSummary: string;
  focusedCharacters: string[];
  excludedCharacters: string[];
  detectedGuestCharacters: CoDirectorGuestCharacter[];
  directorialQuestions: CoDirectorQuestion[];
}

export function generateHeuristicPitch(
  cleanPremise: string,
  charNames: string[],
  worldTitle: string = 'Comic World',
  genre: string = 'Drama'
): CoDirectorPitchResult {
  const lower = cleanPremise.toLowerCase();
  const detectedFocused = charNames.filter((name: string) => lower.includes(name.toLowerCase()));
  const focused = detectedFocused.length > 0 ? detectedFocused : [charNames[0] || 'Protagonist'];
  const excluded = charNames.filter((name: string) => !focused.includes(name));

  const guestMatch = cleanPremise.match(/(?:a|the|new)\s+(client|customer|investor|buyer|partner|stranger|visitor|rival|detective|merchant|boss|guest)\b/i);
  const guestList: CoDirectorGuestCharacter[] = [];
  if (guestMatch) {
    const roleFound = guestMatch[1].toLowerCase();
    const roleCapitalized = roleFound.charAt(0).toUpperCase() + roleFound.slice(1);
    guestList.push({
      name: `The ${roleCapitalized}`,
      role: roleFound,
      appearance: `Visual styling appropriate for a ${roleFound} in ${genre}`,
      description: `Episodic scene partner in ${worldTitle}`,
      avatarEmoji: '👤'
    });
  }

  const primaryLead = focused[0] || 'the protagonist';

  const mockQuestions: CoDirectorQuestion[] = [
    {
      id: 'q-dynamic',
      question: `How does ${primaryLead} confront the central dilemma in "${cleanPremise.slice(0, 60)}"?`,
      options: [
        {
          label: 'Direct Assertive Action',
          description: 'Taking immediate charge of the situation with bold courage',
          beatAddition: `${primaryLead} takes decisive charge with confident action`
        },
        {
          label: 'Calculated Strategic Patience',
          description: 'Analyzing the environment for hidden angles before making a move',
          beatAddition: `${primaryLead} observes the situation strategically before committing`
        }
      ]
    },
    {
      id: 'q-climax',
      question: 'How does this dramatic scene conclude for the next episode?',
      options: [
        {
          label: 'Decisive Breakthrough',
          description: 'Clear forward momentum gained with tangible progress',
          beatAddition: 'The immediate challenge resolves with clear forward momentum'
        },
        {
          label: 'Suspenseful Cliffhanger',
          description: 'An unexpected discovery raises the stakes for the next chapter',
          beatAddition: 'A sudden unexpected revelation raises the stakes for the next chapter'
        }
      ]
    }
  ];

  return {
    premiseSummary: `Spotlight episode centered on ${focused.join(', ')}: "${cleanPremise.slice(0, 80)}"`,
    focusedCharacters: focused,
    excludedCharacters: excluded,
    detectedGuestCharacters: guestList,
    directorialQuestions: mockQuestions
  };
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
    const {
      premise = '',
      characters = [],
      worldTitle = 'Comic World',
      genre = 'Drama',
      apiKey,
      baseUrl,
      provider = 'meta-api',
      modelName,
    } = body;

    const cleanPremise = String(premise).trim();
    if (!cleanPremise) {
      return NextResponse.json({ error: 'Premise is required' }, { status: 400 });
    }

    const charNames = characters.map((c: ComicCharacter) => c.name);

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

    // Fallback heuristic if no API key is available
    if (!targetApiKey) {
      return NextResponse.json(generateHeuristicPitch(cleanPremise, charNames, worldTitle, genre));
    }

    const systemPrompt = `You are MindStrip's Meta AI Co-Director Brain.
Analyze the creator's proposed story premise before drawing the page.
You must:
1. Identify which characters from the World Bible are explicitly relevant to this scene.
2. Identify characters from the World Bible who should be EXCLUDED from this page (do not force the whole cast!).
3. Detect any NEW/TEMPORARY guest characters introduced in the premise (e.g. "a client", "the boss", "a date", "a rival bidder").
4. Formulate 2-3 provocative directorial questions to clarify the dramatic tone, strategy, and ending before scripting.

Return ONLY valid JSON with this schema:
{
  "premiseSummary": "1-sentence editorial logline",
  "focusedCharacters": ["Names of active characters from provided roster"],
  "excludedCharacters": ["Names of provided characters who should stay off-page"],
  "detectedGuestCharacters": [
    {
      "name": "Guest Character Name",
      "role": "e.g. client / detective / rival",
      "appearance": "Visual look & clothing",
      "description": "Short bio and narrative purpose",
      "avatarEmoji": "emoji"
    }
  ],
  "directorialQuestions": [
    {
      "id": "q1",
      "question": "Provocative directorial fork question",
      "options": [
        {
          "label": "Option Title",
          "description": "Short explanation of the vibe",
          "beatAddition": "Exact descriptive beat phrase to inject into prompt"
        },
        {
          "label": "Option Title",
          "description": "Short explanation of the vibe",
          "beatAddition": "Exact descriptive beat phrase to inject into prompt"
        }
      ]
    }
  ]
}`;

    const userMessage = `World: "${worldTitle}" (${genre})
Active Cast: ${JSON.stringify(characters.map((c: ComicCharacter) => ({ name: c.name, role: c.role })))}
Proposed Premise: "${cleanPremise}"`;

    const cleanBase = targetBaseUrl.replace(/\/+$/, '');
    const res = await fetch(`${cleanBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${targetApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI API error (${res.status}): ${errText.slice(0, 150)}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const parsed: CoDirectorPitchResult = JSON.parse(rawContent);

    return NextResponse.json(parsed);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('Co-Director Pitch fallback:', msg);
    // Graceful fallback: return intelligent heuristic pitch instead of failing
    const charNames = (body?.characters || []).map((c: ComicCharacter) => c.name);
    return NextResponse.json(generateHeuristicPitch(String(body?.premise || ''), charNames, body?.worldTitle, body?.genre));
  }
}
