import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      character,
      worldTitle,
      genre = 'Comic Universe',
      existingCharacters = [],
      apiKey,
      baseUrl,
      provider = 'meta-api'
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

    // AI Call if API Key exists
    if (targetApiKey) {
      try {
        const model = targetBaseUrl.includes('api.meta.ai') ? 'muse-spark-1.3' : 'accounts/fireworks/models/llama-v3p3-70b-instruct';

        const systemPrompt = `You are the MindStrip Lead Character Architect for the comic universe "${worldTitle || 'Untitled Universe'}" (${genre}).
Your job is to expand the character "${charName}" (${charRole}, ${charGender}) into a deep, three-dimensional comic book figure with distinct visual anchors, psychological depth, and interpersonal ties.

Other characters in this universe: ${existingCharacters.filter((n: string) => n.toLowerCase() !== charName.toLowerCase()).join(', ') || 'None yet'}

Respond ONLY with valid JSON matching this schema:
{
  "appearance": "Visual physical traits: hair style/color, eyes, build, posture",
  "wardrobe": "Signature everyday clothing, color palette, distinctive textures or armor",
  "iconicItem": "One memorable silhouette accessory or prop (e.g. cracked aviators, customized sidearm, holographic watch)",
  "backstory": "2-3 sentences of compelling formative origin, past trials, or life before the comic begins",
  "motivation": "Core psychological desire or driving ambition",
  "flaws": "Fatal flaw, blindspot, or vulnerability that creates drama",
  "secret": "A hidden classified truth or burden they keep to themselves",
  "abilities": "Specialized skills, profession, talent, tradecraft, magic, or powers tailored to the universe genre (${genre}). If Slice-of-Life/Comedy, focus on jobs, culinary, artistic, or social talents; if Mystery, deduction/forensics; if Sci-Fi/Fantasy/Action, tech/magic/powers.",
  "gear": "Signature items, belongings, tools, or gear carried by this character tailored to (${genre}). If Slice-of-Life, personal items like bags, cameras, sketchbooks, mugs; if Detective/Action/SciFi, field gear, devices, or weapons.",
  "voiceTone": "Dialogue cadence and speech habits (e.g. sharp cynical humor, cryptic brevity, energetic slang)",
  "catchphrase": "A punchy, memorable signature catchphrase",
  "suggestedRelationships": [
    {
      "targetCharacterName": "Name from other characters if available, or archetype",
      "relationType": "ally" | "rival" | "mentor" | "nemesis" | "family" | "frenemy",
      "dynamicDescription": "One sentence explaining their mutual friction or loyalty"
    }
  ]
}`;

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
              { role: 'user', content: `Develop full deep-dive profile for @${charName} in ${worldTitle}. Current notes: "${character.description || ''} ${character.appearance || ''} ${character.personality || ''}"` }
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
    const isDaily = gLower.includes('slice') || gLower.includes('daily') || gLower.includes('comedy') || gLower.includes('romance') || gLower.includes('office') || gLower.includes('drama');

    const fallbackExpansion = isDaily ? {
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
