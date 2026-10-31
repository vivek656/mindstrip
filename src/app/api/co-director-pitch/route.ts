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
  defaultAssumption?: string;
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
      const lower = cleanPremise.toLowerCase();
      const detectedFocused = charNames.filter((name: string) => lower.includes(name.toLowerCase()));
      const focused = detectedFocused.length > 0 ? detectedFocused : [charNames[0] || 'Protagonist'];
      const excluded = charNames.filter((name: string) => !focused.includes(name));

      const hasClient = /client|contract|deal|bid|customer/.test(lower);
      const guestList: CoDirectorGuestCharacter[] = [];
      if (hasClient) {
        guestList.push({
          name: 'The New Client (Mr. Sterling)',
          role: 'client',
          appearance: 'distinguished corporate executive in a bespoke tailored suit, expensive watch',
          description: 'High-stakes client holding the multimillion-dollar contract',
          avatarEmoji: '💼'
        });
      }

      const mockQuestions: CoDirectorQuestion[] = [
        {
          id: 'q-dynamic',
          question: `How should ${focused[0] || 'the protagonist'} approach the new client?`,
          options: [
            {
              label: 'Calculated Charm & Wit',
              description: 'Subtle double-entendres and intellectual mastery of the numbers',
              beatAddition: 'Meera uses razor-sharp intellect and subtle charm over dinner'
            },
            {
              label: 'Bold Corporate Power Move',
              description: 'Commanding the room with magnetic confidence and asserting total authority',
              beatAddition: 'Meera takes total charge of the conference room with magnetic poise'
            }
          ],
          defaultAssumption: `${focused[0] || 'Meera'} uses calculated psychological charm and disarming wit over dinner to lower his corporate defenses`
        },
        {
          id: 'q-climax',
          question: 'What is the dramatic turning point / twist of the page?',
          options: [
            {
              label: 'Signed Deal Victory',
              description: 'The client is completely disarmed and enthusiastically signs the contract',
              beatAddition: 'The client signs the contract with an impressed grin'
            },
            {
              label: 'Suspenseful Cliffhanger',
              description: 'Right as the pen touches paper, an unexpected revelation or interruption occurs',
              beatAddition: 'Just as the pen touches paper, a secret clause creates unexpected tension'
            }
          ],
          defaultAssumption: 'The client is thoroughly disarmed and slides the signed contract across the table with an intrigued smirk'
        }
      ];

      return NextResponse.json({
        premiseSummary: `Spotlight episode centered on ${focused.join(', ')}`,
        focusedCharacters: focused,
        excludedCharacters: excluded,
        detectedGuestCharacters: guestList,
        directorialQuestions: mockQuestions
      });
    }

    const systemPrompt = `You are MindStrip's Meta AI Co-Director Brain.
Analyze the creator's proposed story premise before drawing the page.
You must:
1. Identify which characters from the World Bible are explicitly relevant to this scene.
2. Identify characters from the World Bible who should be EXCLUDED from this page (do not force the whole cast!).
3. Detect any NEW/TEMPORARY guest characters introduced in the premise (e.g. "a client", "the boss", "a date", "a rival bidder").
4. Formulate 2-3 provocative directorial questions to clarify the dramatic tone, strategy, and ending before scripting.
5. Provide a "defaultAssumption" for each question describing what you will assume if the creator selects "Let AI Assume" or skips ahead.

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
      ],
      "defaultAssumption": "Smart narrative assumption AI will use if the creator chooses 'Let AI Assume' or skips"
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
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
