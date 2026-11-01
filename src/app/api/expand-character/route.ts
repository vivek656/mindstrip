import { NextRequest, NextResponse } from 'next/server';

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
      worldLocations = [],
      worldAttributes = [],
      existingCharacters = [],
      recentEpisodes = [],
      apiKey,
      baseUrl,
      provider = 'meta-api',
      modelName,
      userDirective = '',
      targetField = '',
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

    // Format full cast list with roles and traits for deep interpersonal cohesion
    const otherCastSummary = Array.isArray(existingCharacters)
      ? existingCharacters
          .map((c: any) => {
            if (typeof c === 'string') return c;
            return `• ${c.name} (${c.role}${c.gender ? `, ${c.gender}` : ''}): ${c.personality ? `Personality: ${c.personality}. ` : ''}${c.backstory ? `Backstory: ${c.backstory}` : ''}`;
          })
          .join('\n')
      : 'None yet';

    // AI Call if API Key exists
    if (targetApiKey) {
      try {
        const model = targetModel;

        const systemPrompt = `You are the MindStrip Lead Character Architect for the comic universe "${worldTitle}" (${genre}).
${worldTagline ? `Universe Tagline: "${worldTagline}"\n` : ''}${worldLore ? `World Lore & Core Conflict:\n"${worldLore}"\n` : ''}${worldLaws && worldLaws.length > 0 ? `Universal Laws & Ground Rules:\n${worldLaws.map((l: string) => `• ${l}`).join('\n')}\n` : ''}${worldLocations && worldLocations.length > 0 ? `Canonical Locations: ${worldLocations.join(', ')}\n` : ''}${worldAttributes && worldAttributes.length > 0 ? `World Parameters: ${worldAttributes.join(' | ')}\n` : ''}${recentEpisodes && recentEpisodes.length > 0 ? `Recent Story Developments:\n${recentEpisodes.map((e: any) => `• Ep ${e.episodeNumber || ''} "${e.title}": ${e.recap || ''}`).join('\n')}\n` : ''}
EXISTING CHARACTERS IN THIS UNIVERSE:
${otherCastSummary || 'Founding cast member'}

Your job is to expand or update the character "${charName}" (${charRole}, ${charGender}) into a multi-dimensional, memorable figure who belongs AUTHENTICALLY in this specific universe.
Make sure every field resonates with this world's tone, genre, lore, laws, and existing relationships.

Respond ONLY with valid JSON matching this schema:
{
  "appearance": "Visual physical traits: hair style/color, eyes, build, posture",
  "wardrobe": "Signature everyday clothing, color palette, distinctive textures, or professional/casual attire",
  "iconicItem": "One memorable silhouette accessory, jewelry, keepsake or prop",
  "backstory": "2-3 sentences of compelling formative origin, past trials, or life before the comic begins",
  "motivation": "Core psychological desire, emotional yearning, or driving ambition",
  "flaws": "Fatal flaw, blindspot, or vulnerability that creates drama",
  "secret": "A hidden truth, emotional burden, or plot twist they keep to themselves",
  "abilities": "Specialized skills, profession, talent, tradecraft, or powers tailored to the universe genre (${genre}). If Slice-of-Life/Romance/Comedy, focus on profession, interpersonal talents, or creative skills; if Mystery, deduction/forensics; if Sci-Fi/Fantasy/Action, tech/magic/powers.",
  "gear": "Signature items, belongings, tools, or gear carried by this character tailored to (${genre}). If Slice-of-Life/Romance, personal items like bags, cameras, sketchbooks, mugs; if Detective/Action/SciFi, field gear, devices, or weapons.",
  "voiceTone": "Dialogue cadence and speech habits (e.g. warm teasing wit, sharp cynical humor, cryptic brevity, energetic slang)",
  "catchphrase": "A punchy, memorable signature catchphrase or recurring line",
  "suggestedRelationships": [
    {
      "targetCharacterName": "Name of an existing character from the universe cast if available, or archetype",
      "relationType": "ally" | "rival" | "mentor" | "nemesis" | "family" | "frenemy" | "love-interest",
      "dynamicDescription": "One sentence explaining their mutual friction, romance, or loyalty"
    }
  ]
}`;

        const userPrompt = userDirective
          ? `Develop full deep-dive profile for @${charName} (${charRole}, ${charGender}) in "${worldTitle}" (${genre}).
CREATOR'S EXPLICIT CONCEPT & VISION:
"${userDirective}"

Current character draft notes:
- Backstory: "${character?.backstory || ''}"
- Description: "${character?.description || ''}"
- Appearance: "${character?.appearance || ''}"
- Personality: "${character?.personality || ''}"
- Motivation: "${character?.motivation || ''}"
- Flaws: "${character?.flaws || ''}"
- Abilities / Skills: "${character?.abilities || ''}"
- Gear / Belongings: "${character?.gear || ''}"

CRITICAL INSTRUCTIONS:
1. STRICTLY OBEY the creator's explicit vision and direction above! Respect their tone, genre, and character concept faithfully.
2. Fill out rich, nuanced, and emotionally resonant details that match their defined role as ${charRole} in "${worldTitle}".
3. If targetField is specified ("${targetField}"), ensure that field is particularly deep and polished.`
          : `Develop full deep-dive profile for @${charName} (${charRole}, ${charGender}) in "${worldTitle}" (${genre}).
Current draft notes:
- Backstory: "${character?.backstory || ''}"
- Description: "${character?.description || ''}"
- Appearance: "${character?.appearance || ''}"
- Personality: "${character?.personality || ''}"`;

        const res = await fetch(`${cleanBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${targetApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.75,
            max_tokens: 8192,
            response_format: { type: 'json_object' }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return NextResponse.json({ ...parsed, provider: 'Meta AI' });
          }
        }
      } catch (aiErr) {
        console.warn('Meta AI character expansion failed, falling back to heuristic engine:', aiErr);
      }
    }

    // Contextual Generator Fallback (Driven directly by userDirective, world, and genre)
    const isHero = charRole === 'protagonist';
    const isVillain = charRole === 'antagonist';
    const otherCast = existingCharacters.filter((n: string) => n.toLowerCase() !== charName.toLowerCase());

    const fallbackExpansion = {
      appearance: character.appearance || `${charName} possesses sharp, observant eyes and a distinctive silhouette suited for ${worldTitle} (${genre}).`,
      wardrobe: character.wardrobe || (userDirective ? `Signature styling based on creator vision: ${userDirective.trim()}` : `Signature practical attire suited for ${genre}.`),
      iconicItem: character.iconicItem || `A signature personal accessory carried through every chapter.`,
      backstory: character.backstory || (userDirective ? `${userDirective.trim()}` : `${charName} has forged a definitive standing in ${worldTitle} through strategic preparation, sharp wit, and genuine interpersonal conviction.`),
      motivation: character.motivation || `To achieve their defining ambition in ${worldTitle} on their own terms.`,
      flaws: character.flaws || `A fierce self-reliance that makes delegating trust difficult during high-stakes crises.`,
      secret: character.secret || `Guards a personal truth or contingency plan that could shift the stakes if revealed.`,
      abilities: character.abilities || `Specialized skills, resourceful deduction, and strategic adaptability tailored to ${genre}.`,
      gear: character.gear || `Essential personal items, communication device, and signature accessories suited for ${genre}.`,
      voiceTone: character.voiceTone || `Measured, articulate cadence; pairs observant clarity with calm confidence under pressure.`,
      catchphrase: character.catchphrase || `When the moment arrives, we take it one step at a time.`,
      suggestedRelationships: otherCast.length > 0 ? [
        {
          targetCharacterName: otherCast[0],
          relationType: isHero ? 'ally' : 'rival',
          dynamicDescription: `Intricate dynamic built on competing ambitions and mutual respect in ${worldTitle}.`
        }
      ] : []
    };

    return NextResponse.json({ ...fallbackExpansion, provider: 'Heuristic Studio Engine' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Character expansion failed: ${msg}` }, { status: 500 });
  }
}
