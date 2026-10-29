import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      genre,
      artStyle,
      apiKey,
      baseUrl,
      provider = 'meta-api'
    } = body;

    let targetBaseUrl = baseUrl || process.env.META_MODEL_BASE_URL || 'https://api.meta.ai/v1';
    let targetApiKey = apiKey || process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY || '';

    if (provider === 'fireworks') {
      targetBaseUrl = baseUrl || 'https://api.fireworks.ai/inference/v1';
      targetApiKey = apiKey || process.env.FIREWORKS_API_KEY || '';
    }

    const cleanBase = targetBaseUrl.replace(/\/+$/, '');
    const cleanPrompt = (prompt || 'A quirky hero balancing daily life and extraordinary stakes').trim();

    if (targetApiKey) {
      try {
        const model = targetBaseUrl.includes('api.meta.ai') ? 'muse-spark-1.3' : 'accounts/fireworks/models/llama-v3p3-70b-instruct';
        
        const res = await fetch(`${cleanBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${targetApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `You are the MindStrip Autonomous World Architect Agent.
Your mission is to invent a rich, serialized comic universe with deep lore, distinct character visual anchors, and universe rules based on the user's creative spark.
Return ONLY valid JSON matching this exact schema:
{
  "title": "Creative World Title",
  "tagline": "Engaging single-sentence hook",
  "genre": "Genre name (e.g. Cyberpunk Noir, Startup Comedy, Cozy Supernatural)",
  "artStyle": "webcomic" (or "manga" | "noir" | "cyberpunk" | "newspaper" | "minimalist"),
  "lore": "Compelling 2-3 sentence universe backstory, setting, and ongoing central conflict",
  "environmentRules": [
    "Key rule or physics anomaly in this world",
    "Social or technical constraint in this world"
  ],
  "characters": [
    {
      "name": "Character Name",
      "role": "protagonist",
      "gender": "female" (or "male" | "non-binary" | "robot-ai" | "creature-other"),
      "appearance": "Detailed visual anchor: hair, clothing, signature colors, accessories, silhouette (CRITICAL for image continuity)",
      "personality": "Core emotional traits and flaws",
      "catchphrase": "Memorable signature catchphrase",
      "description": "Role in the world",
      "avatarEmoji": "⚡"
    },
    {
      "name": "Antagonist Name",
      "role": "antagonist",
      "gender": "male",
      "appearance": "Visual look, menacing or quirky attire, physical traits",
      "personality": "Opposing worldview and motivation",
      "catchphrase": "Signature villain quote",
      "description": "The central friction or rival",
      "avatarEmoji": "👾"
    },
    {
      "name": "Sidekick Name",
      "role": "sidekick",
      "gender": "non-binary",
      "appearance": "Visual look, pragmatic gear or supportive style",
      "personality": "Comedic foil, moral anchor, or reality check",
      "catchphrase": "Pragmatic catchphrase",
      "description": "Loyal partner or advisor",
      "avatarEmoji": "🤖"
    }
  ],
  "firstEpisodePremise": "The inciting incident for Episode 1"
}`
              },
              {
                role: 'user',
                content: `Build an original comic universe from this prompt: "${cleanPrompt}". Suggested genre: "${genre || 'Any'}", style: "${artStyle || 'webcomic'}"`
              }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || '{}';
          const cleaned = String(content).replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed.title && parsed.characters && parsed.characters.length > 0) {
            const world = {
              id: `world-${Date.now()}`,
              title: parsed.title,
              tagline: parsed.tagline || 'A new serialized universe',
              genre: parsed.genre || genre || 'Modern Graphic Novel',
              artStyle: parsed.artStyle || artStyle || 'webcomic',
              lore: parsed.lore,
              environmentRules: parsed.environmentRules || [],
              characters: parsed.characters.map((c: Record<string, unknown>, i: number) => ({
                id: `char-${Date.now()}-${i}`,
                name: c.name || `Hero ${i + 1}`,
                role: c.role || (i === 0 ? 'protagonist' : i === 1 ? 'antagonist' : 'sidekick'),
                gender: c.gender || 'unspecified',
                appearance: c.appearance || 'Distinctive comic attire with expressive features',
                personality: c.personality || 'Determined and resourceful',
                catchphrase: c.catchphrase,
                description: c.description || `${c.role} in this world`,
                avatarEmoji: c.avatarEmoji || (i === 0 ? '⚡' : i === 1 ? '👾' : '🤖'),
                traits: [String(c.role || ''), String(c.gender || '')].filter(Boolean)
              })),
              episodes: [],
              createdAt: new Date().toISOString(),
              firstEpisodePremise: parsed.firstEpisodePremise
            };

            return NextResponse.json({ world });
          }
        }
      } catch (agentErr) {
        console.warn('World Architect Agent call error, using generator:', agentErr);
      }
    }

    // Heuristic Fallback World Generator
    const cleanTitle = cleanPrompt.length > 30 ? cleanPrompt.slice(0, 27) + '...' : cleanPrompt;
    const fallbackWorld = {
      id: `world-${Date.now()}`,
      title: `${cleanTitle}: Chronicles`,
      tagline: `Where extraordinary decisions collide with everyday reality`,
      genre: genre || 'Urban Sci-Fi & Adventure',
      artStyle: artStyle || 'webcomic',
      lore: `In a world where everyday routines hide extraordinary secrets, unlikely allies unite to maintain balance against rising friction.`,
      environmentRules: [
        'Actions have compounding narrative consequences',
        'Characters retain signature visual anchors across all chapters'
      ],
      characters: [
        {
          id: `char-${Date.now()}-0`,
          name: 'Protagonist',
          role: 'protagonist',
          gender: 'female',
          appearance: 'High-contrast jacket, expressive dark eyes, messenger bag filled with technical tools',
          personality: 'Pragmatic, determined, refuses to give up under pressure',
          catchphrase: 'There is always an angle we haven\'t tried yet.',
          description: 'The central lead navigating the dilemma',
          avatarEmoji: '⚡',
          traits: ['protagonist', 'female']
        },
        {
          id: `char-${Date.now()}-1`,
          name: 'The Challenger',
          role: 'antagonist',
          gender: 'male',
          appearance: 'Sharply tailored trenchcoat, sleek sunglasses, calm imposing posture',
          personality: 'Calculated, uncompromising, tests the protagonist\'s resolve',
          catchphrase: 'Did you really think it would be that straightforward?',
          description: 'The central rival testing character conviction',
          avatarEmoji: '🕶️',
          traits: ['antagonist', 'male']
        },
        {
          id: `char-${Date.now()}-2`,
          name: 'Kip',
          role: 'sidekick',
          gender: 'robot-ai',
          appearance: 'Compact floating metallic drone with glowing blue holographic visor',
          personality: 'Witty, hyper-analytical, provides strategic clarity',
          catchphrase: 'Probability of success rising by 14% if we act now.',
          description: 'Faithful AI companion and tactical advisor',
          avatarEmoji: '🤖',
          traits: ['sidekick', 'robot-ai']
        }
      ],
      episodes: [],
      createdAt: new Date().toISOString(),
      firstEpisodePremise: cleanPrompt
    };

    return NextResponse.json({ world: fallbackWorld });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `World architecture failed: ${msg}` }, { status: 500 });
  }
}
