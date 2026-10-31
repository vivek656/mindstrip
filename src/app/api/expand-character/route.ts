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
            return `• ${c.name} (${c.role}${c.gender ? `, ${c.gender}` : ''}): ${c.personality ? `Personality: ${c.personality}. ` : ''}${c.backstory ? `Backstory: ${c.backstory.slice(0, 100)}...` : ''}`;
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
1. STRICTLY OBEY the creator's explicit vision above! If the creator states this character is an everyday office worker, love interest, coworker, or normal person and NOT a hero saving earth, DO NOT give her superpowers, combat styles, or tactical weapons!
2. Fill out realistic, emotionally resonant details that match her role as ${charRole} in this universe.
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

    // Heuristic Contextual Generator ($0.00 Fallback)
    const isHero = charRole === 'protagonist';
    const isVillain = charRole === 'antagonist';
    const otherCast = existingCharacters.filter((n: string) => n.toLowerCase() !== charName.toLowerCase());
    const gLower = (genre || '').toLowerCase();
    const dLower = (userDirective || '').toLowerCase();
    const isRomanceOrOffice = charRole === 'love-interest' || charRole === 'colleague' || dLower.includes('love') || dLower.includes('romance') || dLower.includes('office') || dLower.includes('not a hero');
    const isDaily = isRomanceOrOffice || gLower.includes('slice') || gLower.includes('daily') || gLower.includes('comedy') || gLower.includes('romance') || gLower.includes('office') || gLower.includes('drama');

    const fallbackExpansion = isRomanceOrOffice ? {
      appearance: character.appearance || `${charName} possesses warm, perceptive eyes, styled hair, and a grounded, confident posture suited for professional and personal environments.`,
      wardrobe: character.wardrobe || `Clean modern attire: tailored blazer, crisp shirt or blouse, dark trousers, and comfortable leather shoes.`,
      iconicItem: character.iconicItem || `A personalized everyday accessory and sleek notebook.`,
      backstory: character.backstory || (userDirective ? `${charName}'s background in ${worldTitle}: ${userDirective.slice(0, 150)}` : `${charName} has built a solid standing in ${worldTitle} through strategic preparation, sharp wit, and genuine interpersonal loyalty.`),
      motivation: character.motivation || `To succeed on their own terms in ${worldTitle} while staying true to those they care about.`,
      flaws: character.flaws || `Struggles to ask for support during overwhelming crises, preferring to bear pressure quietly.`,
      secret: character.secret || `Keeps a personal contingency plan that few in their circle know about.`,
      abilities: character.abilities || `Strategic negotiation, crisis management, empathetic interpersonal diplomacy, and sharp observation.`,
      gear: character.gear || `Professional commuter bag, personal communication device, and notebook.`,
      voiceTone: character.voiceTone || `Warm, articulate, and grounded; pairs observant humor with calm clarity under pressure.`,
      catchphrase: character.catchphrase || `Let's focus on what we can control and take it one step at a time.`,
      suggestedRelationships: otherCast.length > 0 ? [
        {
          targetCharacterName: otherCast[0],
          relationType: 'love-interest',
          dynamicDescription: `Close mutual bond with shared ambitions and quiet emotional trust.`
        }
      ] : []
    } : isDaily ? {
      appearance: character.appearance || `${charName} possesses warm, expressive eyes, tousled dark hair, and a casual, animated posture that puts people immediately at ease.`,
      wardrobe: character.wardrobe || `Oversized cable-knit cardigan over an organic cotton graphic tee, relaxed-fit dark denim, and classic worn canvas sneakers.`,
      iconicItem: character.iconicItem || `A battered stainless steel coffee tumbler covered in quirky indie band and art cafe stickers.`,
      backstory: character.backstory || `Moved to the neighborhood to pursue an independent creative dream, constantly juggling a chaotic day job, eccentric roommates, and big ambitions.`,
      motivation: character.motivation || `To master their craft and build a welcoming community space where oddballs feel at home.`,
      flaws: character.flaws || `Terrible at setting boundaries; agrees to help everyone else before finishing their own urgent projects.`,
      secret: character.secret || `Secretly the anonymous creator of the neighborhood's beloved viral slice-of-life comic strip.`,
      abilities: character.abilities || `Master coffee barista, quick-witted social banter, keen visual observation, and an uncanny ability to defuse tense arguments.`,
      gear: character.gear || `Vintage 35mm film camera, leather-trimmed canvas messenger bag, dog-eared sketchbook, and noise-canceling headphones.`,
      voiceTone: character.voiceTone || `Warm, conversational, and energetic; punctuates self-deprecating anecdotes with infectious laughter.`,
      catchphrase: character.catchphrase || `One step at a time — first, we need more coffee.`,
      suggestedRelationships: otherCast.length > 0 ? [
        {
          targetCharacterName: otherCast[0],
          relationType: isHero ? 'ally' : 'rival',
          dynamicDescription: `Close daily friends who playfully roast each other's habits over morning espresso.`
        }
      ] : []
    } : {
      appearance: character.appearance || `${charName} possesses sharp, observant eyes, windswept dark hair, and a resilient, athletic posture forged through constant survival.`,
      wardrobe: character.wardrobe || `Weathered charcoal utility jacket over a slate-grey tunic, reinforced knee-high leather boots, and subtle copper metallic stitching.`,
      iconicItem: character.iconicItem || `A modified mechanical wrist-chronometer with a cracked display that still counts down to an unknown deadline.`,
      backstory: character.backstory || `Once an operative within the old regional order, ${charName} walked away after uncovering a conspiracy that erased their sector's archives. Now operating in the fringes, they seek answers before the truth is permanently rewritten.`,
      motivation: character.motivation || isHero ? `To protect the remaining independent sanctuaries and expose the syndicate's hidden monopoly.` : isVillain ? `To enforce absolute order across the sectors, no matter the human cost.` : `To survive on their own terms without bending to external authority.`,
      flaws: character.flaws || isHero ? `Struggles to ask for help; tends to shoulder impossible burdens alone until pushed to collapse.` : `Prone to ruthless pragmatism and deeply cynical regarding human loyalty.`,
      secret: character.secret || `Carries a forged biometric clearance key that belongs to an identity presumed dead five years ago.`,
      abilities: character.abilities || `Master of rapid tactical deduction, parkour navigation, and short-range defensive redirection.`,
      gear: character.gear || `Thermal smoke pellets, grapple line, and an encrypted comm-scanner.`,
      voiceTone: character.voiceTone || `Dry, perceptive, and economical with words; punctuates tense moments with understated sarcasm.`,
      catchphrase: character.catchphrase || isHero ? `The odds don't matter once the first move is made.` : `Every system eventually bows to pressure.`,
      suggestedRelationships: otherCast.length > 0 ? [
        {
          targetCharacterName: otherCast[0],
          relationType: isHero ? 'ally' : 'rival',
          dynamicDescription: `Shares a history of tight escapes, but their differing codes of honor cause constant tactical arguments.`
        }
      ] : []
    };

    return NextResponse.json({ ...fallbackExpansion, provider: 'Heuristic Studio Engine' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Character expansion failed: ${msg}` }, { status: 500 });
  }
}
