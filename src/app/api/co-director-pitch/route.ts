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

  const hasClient = /client|contract|deal|bid|customer/.test(lower);
  const guestList: CoDirectorGuestCharacter[] = [];
  if (hasClient) {
    const clientMatch = cleanPremise.match(/(?:client|investor|buyer|partner)\s+([A-Z][a-z]+)/i);
    const clientName = clientMatch ? `Client ${clientMatch[1]}` : 'The New Client';
    guestList.push({
      name: clientName,
      role: 'client',
      appearance: 'Distinguished executive in a tailored charcoal suit, sharp observant gaze',
      description: 'Key executive holding the multimillion-dollar deal',
      avatarEmoji: '💼'
    });
  }

  const primaryLead = focused[0] || 'the protagonist';

  const mockQuestions: CoDirectorQuestion[] = hasClient
    ? [
        {
          id: 'q-strategy',
          question: `What is ${primaryLead}'s tactical negotiation approach with the new client?`,
          options: [
            {
              label: 'Subtle Charm & Psychological Flattery',
              description: 'Reading micro-expressions over dinner, disarming defenses with calculated warmth and wit',
              beatAddition: `${primaryLead} uses disarming charisma and keen psychological observation to lower his guard`
            },
            {
              label: 'Bold Corporate Counter-Pitch',
              description: 'Commanding the boardroom with razor-sharp financial acumen and undeniable authority',
              beatAddition: `${primaryLead} playfully challenges his skeptical valuation with incisive corporate mastery`
            }
          ]
        },
        {
          id: 'q-reaction',
          question: 'How does the client respond to the proposition?',
          options: [
            {
              label: 'Intrigued yet Guarded',
              description: 'He smiles enigmatically and probes for hidden motives or vulnerabilities',
              beatAddition: 'The client swirls his glass with an enigmatic smirk, intrigued yet probing for true motives'
            },
            {
              label: 'Completely Captivated & Ready to Sign',
              description: 'Thoroughly persuaded by the pitch, he slides the contract forward before dessert',
              beatAddition: 'The client pushes the contract forward, thoroughly captivated by the magnetic persuasion'
            }
          ]
        },
        {
          id: 'q-climax',
          question: 'What is the dramatic resolution / cliffhanger of the meeting?',
          options: [
            {
              label: 'Triumphant Deal Secured',
              description: 'The deal is inked with mutual admiration and high-stakes promises',
              beatAddition: 'The fountain pen signs the contract, sealing a monumental new partnership'
            },
            {
              label: 'Lingering Romantic Tension',
              description: 'The contract is signed, but an intense lingering gaze suggests deeper complications ahead',
              beatAddition: 'The contract is finalized, but a lingering touch and unspoken glance hint at dangerous chemistry'
            }
          ]
        }
      ]
    : [
        {
          id: 'q-dynamic',
          question: `How does ${primaryLead} confront the central dilemma?`,
          options: [
            {
              label: 'Direct Assertive Action',
              description: 'Taking immediate charge of the situation with bold courage',
              beatAddition: `${primaryLead} takes decisive charge with confident action`
            },
            {
              label: 'Calculated Strategic Patience',
              description: 'Analyzing the environment for hidden angles before making the move',
              beatAddition: `${primaryLead} waits for the opportune moment to strike strategically`
            }
          ]
        },
        {
          id: 'q-climax',
          question: 'How does the scene resolve for the next episode?',
          options: [
            {
              label: 'Decisive Victory',
              description: 'Clear forward momentum gained with high morale',
              beatAddition: 'The dilemma resolves decisively with forward momentum'
            },
            {
              label: 'Suspenseful Cliffhanger',
              description: 'An unexpected discovery leaves questions open for the next chapter',
              beatAddition: 'A sudden unexpected revelation raises the stakes for the next chapter'
            }
          ]
        }
      ];

  return {
    premiseSummary: hasClient
      ? `High-stakes corporate meeting between ${primaryLead} and The New Client`
      : `Spotlight episode centered on ${focused.join(', ')}`,
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
