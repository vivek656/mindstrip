import { ComicStrip, ComicPanel, CognitiveAnalysis, ArtStyle, PerspectiveLens, ComicCharacter } from '@/types/comic';

export function generateComicStripMock(
  rawDump: string,
  artStyle: ArtStyle = 'webcomic',
  lens: PerspectiveLens = 'candid',
  modelUsed: string = 'Meta Muse Spark 2.5 + Muse Image',
  characters?: ComicCharacter[],
  worldTitle?: string,
  genre?: string
): ComicStrip {
  const cleanPrompt = rawDump.trim() || 'A new chapter unfolds with unexpected turns.';
  const lowerPrompt = cleanPrompt.toLowerCase();

  // 1. DYNAMIC CAST SCOPING: Identify characters explicitly mentioned in premise
  const mentionedChars = (characters || []).filter((c) =>
    lowerPrompt.includes(c.name.toLowerCase()) || lowerPrompt.includes(`@${c.name.toLowerCase()}`)
  );

  // If specific characters were mentioned, scope exclusively to them; otherwise fall back to core lead
  const isTargetedScene = mentionedChars.length > 0;
  const leadChar = isTargetedScene
    ? mentionedChars[0]
    : characters?.find((c) => c.role === 'protagonist') || characters?.[0];

  const leadName = leadChar?.name || 'Protagonist';
  const leadAppearance = leadChar?.appearance || 'Expressive comic character design';
  const leadGender = leadChar?.gender && leadChar.gender !== 'unspecified' ? leadChar.gender : '';

  // 2. DETECT EPISODIC GUEST CHARACTERS (e.g. "client", "boss", "guest", "customer", "rival")
  const isWorkplaceOrClient = /client|contract|deal|bid|customer|office|meeting|presentation|corporate|seduce|negotiat/.test(lowerPrompt);
  const detectedGuestChars: ComicCharacter[] = [];

  if (isWorkplaceOrClient) {
    detectedGuestChars.push({
      id: `guest-client-${Date.now()}`,
      name: 'The New Client',
      role: 'client',
      gender: 'male',
      appearance: 'Distinguished executive in a tailored charcoal suit, luxury watch, discerning gaze',
      description: 'High-stakes corporate client holding the multimillion-dollar contract',
      avatarEmoji: '💼',
      traits: ['Discerning', 'Cautious', 'Influential']
    });
  }

  // Determine second scene partner (either episodic guest, secondary mentioned character, or default)
  const guestPartner = detectedGuestChars[0];
  const secondaryMentioned = mentionedChars[1];
  const partnerName = guestPartner ? guestPartner.name : secondaryMentioned ? secondaryMentioned.name : null;
  const partnerAppearance = guestPartner ? guestPartner.appearance : secondaryMentioned?.appearance || '';

  // Only include standard hero/villain if NOT a targeted solo/workplace spotlight
  const antagonistChar = isTargetedScene ? null : characters?.find((c) => c.role === 'antagonist');
  const antagonistName = antagonistChar?.name || null;
  const antagonistAppearance = antagonistChar?.appearance || 'Imposing opposing figure';
  const antagonistGender = antagonistChar?.gender && antagonistChar.gender !== 'unspecified' ? antagonistChar.gender : '';

  const sidekickChar = isTargetedScene ? null : characters?.find((c) => c.role === 'sidekick' || c.role === 'supporting');
  const sidekickName = sidekickChar?.name || null;
  const sidekickAppearance = sidekickChar?.appearance || 'Resourceful loyal companion';
  const sidekickGender = sidekickChar?.gender && sidekickChar.gender !== 'unspecified' ? sidekickChar.gender : '';

  // Page characters scoped exclusively to active scene participants
  const pageCharacters: ComicCharacter[] = leadChar ? [leadChar] : [];
  if (secondaryMentioned && !pageCharacters.some((c) => c.id === secondaryMentioned.id)) {
    pageCharacters.push(secondaryMentioned);
  }

  // Resolve style prefix for image synthesis
  const getStylePrefix = (style: ArtStyle) => {
    switch (style) {
      case 'webcomic':
        return 'high quality modern webcomic, vibrant colorful digital art, clean cel-shaded linework, dynamic lighting, webtoon style';
      case 'manga':
        return 'dynamic manga comic panel, dramatic black and white ink, screentone shading, action speedlines, expressive anime aesthetic';
      case 'cyberpunk':
        return 'cyberpunk neon graphic novel panel, glowing cyan and magenta lights, dark futuristic rain, gritty atmospheric lighting';
      case 'noir':
        return 'cinematic graphic novel noir comic panel, high contrast deep shadows, dramatic rim lighting, moody comic ink';
      case 'newspaper':
        return 'classic newspaper comic strip, warm paper texture, nostalgic linework, gentle watercolor wash';
      case 'minimalist':
      default:
        return 'modern editorial comic art, crisp architectural linework, refined palette, clean graphic novel panel';
    }
  };

  const stylePrefix = getStylePrefix(artStyle);
  const baseSeed = Math.floor(Math.random() * 900000) + 100000;

  const buildImageUrl = (_promptSnippet: string, _panelNum: number): string | undefined => {
    return undefined;
  };

  const buildPageImageUrl = (): string | undefined => {
    return undefined;
  };

  // Extract a brief synopsis from user's raw prompt
  const premiseSnippet = cleanPrompt.length > 90 ? `${cleanPrompt.slice(0, 87)}...` : cleanPrompt;

  // Dynamically derive an episode title from world and premise
  const deriveTitle = () => {
    if (isWorkplaceOrClient) {
      return `${leadName}: The High-Stakes Contract`;
    }
    const words = cleanPrompt.split(/\s+/).slice(0, 5).join(' ');
    const formatted = words.charAt(0).toUpperCase() + words.slice(1).replace(/[.,;:!?]+$/, '');
    return formatted.length > 6 ? formatted : `${worldTitle || 'Episode'}: The Next Move`;
  };

  const episodeTitle = deriveTitle();

  // 3. SCENE GENERATION: Tailor panels to workplace/corporate vs heroic/action narrative
  let panels: ComicPanel[] = [];

  if (isWorkplaceOrClient && guestPartner) {
    // Workplace / Negotiation Arc (Zero Superhero Combat or Hero Intrusion)
    panels = [
      {
        panelNumber: 1,
        title: 'Executive Entry',
        sceneDescription: `${leadName} enters the high-rise executive suite with poised elegance, holding the confidential dossier and reviewing strategy.`,
        visualMetaphor: 'Poise and strategic intent establishing the corporate stage',
        characters: [leadName],
        bubbles: [
          {
            id: 'b1-1',
            speaker: leadName,
            text: 'Everything rides on this presentation. Time to secure this contract.',
            type: 'thought',
            position: 'top-left'
          }
        ],
        soundEffect: 'STEP',
        soundEffectPosition: { x: 75, y: 20 },
        mood: 'determined',
        imagePrompt: `${stylePrefix}. ${leadName} ${leadGender ? `(${leadGender})` : ''} (${leadAppearance}) in high-end office environment, reviewing confidential papers, elegant modern corporate aesthetic, pure visual graphic novel art.`,
        imageUrl: buildImageUrl('panel-1', 1)
      },
      {
        panelNumber: 2,
        title: 'Disarming Rapport',
        sceneDescription: `${leadName} sits across from ${guestPartner.name}, locking eyes with confident magnetism while he evaluates the initial proposition with skeptical reserve.`,
        visualMetaphor: 'Psychological chess match across the negotiation table',
        characters: [leadName, guestPartner.name],
        bubbles: [
          {
            id: 'b2-1',
            speaker: guestPartner.name,
            text: 'A dozen firms have pitched me this week. What makes your terms exceptional?',
            type: 'speech',
            position: 'top-right'
          },
          {
            id: 'b2-2',
            speaker: leadName,
            text: 'Because none of them have the vision—or the nerve—to deliver what I am offering.',
            type: 'speech',
            position: 'bottom-left'
          }
        ],
        soundEffect: 'CLICK',
        soundEffectPosition: { x: 20, y: 70 },
        mood: 'stressed',
        imagePrompt: `${stylePrefix}. ${leadName} confronting ${guestPartner.name} (${partnerAppearance}), luxurious boardroom meeting, intense eye contact and captivating charisma, atmospheric corporate lighting, pure graphic novel art.`,
        imageUrl: buildImageUrl('panel-2', 2)
      },
      {
        panelNumber: 3,
        title: 'The Irresistible Angle',
        sceneDescription: `${leadName} leans in over the contract terms, revealing bespoke incentives that completely shatter ${guestPartner.name}'s skepticism.`,
        visualMetaphor: 'The definitive breakthrough of persuasive authority',
        characters: [leadName, guestPartner.name],
        bubbles: [
          {
            id: 'b3-1',
            speaker: guestPartner.name,
            text: 'You anticipated every vulnerability in my portfolio... highly impressive.',
            type: 'speech',
            position: 'top-left'
          },
          {
            id: 'b3-2',
            speaker: leadName,
            text: 'I told you: I only play games I intend to win.',
            type: 'speech',
            position: 'bottom-right'
          }
        ],
        soundEffect: 'SPARK',
        soundEffectPosition: { x: 60, y: 35 },
        mood: 'epiphany',
        imagePrompt: `${stylePrefix}. ${leadName} leaning forward with dazzling confidence, ${guestPartner.name} visibly impressed, glowing warm rimlight, cinematic composition, pure graphic novel art.`,
        imageUrl: buildImageUrl('panel-3', 3)
      },
      {
        panelNumber: 4,
        title: 'Ink on the Agreement',
        sceneDescription: `${guestPartner.name} signs the executive agreement with a knowing smile, finalizing the partnership as ${leadName} secures victory.`,
        visualMetaphor: 'Triumph achieved through intellect and magnetic composure',
        characters: [leadName, guestPartner.name],
        bubbles: [
          {
            id: 'b4-1',
            speaker: guestPartner.name,
            text: 'The contract is yours. Looking forward to our fruitful partnership.',
            type: 'speech',
            position: 'top-right'
          },
          {
            id: 'b4-2',
            speaker: leadName,
            text: 'A pleasure doing business with you.',
            type: 'speech',
            position: 'bottom-left'
          }
        ],
        soundEffect: 'SIGN',
        soundEffectPosition: { x: 80, y: 75 },
        mood: 'serene',
        imagePrompt: `${stylePrefix}. ${guestPartner.name} signing legal agreement with fountain pen alongside ${leadName}, golden hour sunbeams through office windows, triumphant conclusion, pure visual art.`,
        imageUrl: buildImageUrl('panel-4', 4)
      }
    ];
  } else {
    // Action / World Narrative Arc
    const p1Desc = `${leadName} confronts the opening dilemma: "${premiseSnippet}".`;
    const p1ImagePrompt = `${stylePrefix}. ${leadName} ${leadGender ? `(${leadGender})` : ''} (${leadAppearance}), scene: ${cleanPrompt}. Atmospheric establishing shot, expressive comic composition.`;
    const p1Text = leadChar?.catchphrase || `Here we go... "${premiseSnippet}".`;

    const p2Desc = partnerName
      ? `${leadName} faces an unexpected clash with ${partnerName}.`
      : antagonistName
      ? `${antagonistName} ambushes the scene, challenging ${leadName}.`
      : `The pressure mounts as an unexpected obstacle complicates the situation.`;

    const p2ImagePrompt = `${stylePrefix}. High tension scene, intense challenge confronting ${leadName}, dramatic lighting, pure visual art.`;

    const p3Desc = `${leadName} discovers a decisive counter-move to resolve the impasse.`;
    const p3ImagePrompt = `${stylePrefix}. ${leadName} executing a bold plan, dynamic angle, pure visual art.`;

    const p4Desc = `The immediate conflict resolves with forward momentum for ${worldTitle || 'this world'}.`;
    const p4ImagePrompt = `${stylePrefix}. ${leadName} standing resolute in the aftermath, cinematic wide angle, pure visual art.`;

    panels = [
      {
        panelNumber: 1,
        title: 'The Situation Unfolds',
        sceneDescription: p1Desc,
        visualMetaphor: 'The initial spark of the narrative arc',
        characters: [leadName],
        bubbles: [
          {
            id: 'b1-1',
            speaker: leadName,
            text: p1Text,
            type: 'thought',
            position: 'top-left'
          }
        ],
        soundEffect: 'FOCUS',
        soundEffectPosition: { x: 75, y: 20 },
        mood: 'stressed',
        imagePrompt: p1ImagePrompt,
        imageUrl: buildImageUrl(p1ImagePrompt, 1)
      },
      {
        panelNumber: 2,
        title: 'Rising Tension',
        sceneDescription: p2Desc,
        visualMetaphor: 'The friction point testing character conviction',
        characters: partnerName ? [leadName, partnerName] : [leadName],
        bubbles: [
          {
            id: 'b2-1',
            speaker: partnerName || 'Narrator',
            text: partnerName ? `You are out of your depth here, ${leadName}.` : 'The stakes escalate without warning.',
            type: partnerName ? 'speech' : 'caption',
            position: 'top-right'
          },
          {
            id: 'b2-2',
            speaker: leadName,
            text: 'Not backing down from this.',
            type: 'speech',
            position: 'bottom-left'
          }
        ],
        soundEffect: 'CLASH!',
        soundEffectPosition: { x: 15, y: 70 },
        mood: 'chaotic',
        imagePrompt: p2ImagePrompt,
        imageUrl: buildImageUrl(p2ImagePrompt, 2)
      },
      {
        panelNumber: 3,
        title: 'The Turning Point',
        sceneDescription: p3Desc,
        visualMetaphor: 'Discovery of the winning angle and collaboration',
        characters: [leadName],
        bubbles: [
          {
            id: 'b3-1',
            speaker: leadName,
            text: 'Found the angle. Making the move now!',
            type: 'speech',
            position: 'top-left'
          }
        ],
        soundEffect: 'STRIKE!',
        soundEffectPosition: { x: 60, y: 40 },
        mood: 'epiphany',
        imagePrompt: p3ImagePrompt,
        imageUrl: buildImageUrl(p3ImagePrompt, 3)
      },
      {
        panelNumber: 4,
        title: 'The Outcome',
        sceneDescription: p4Desc,
        visualMetaphor: 'Equilibrium restored and momentum toward the next chapter',
        characters: [leadName],
        bubbles: [
          {
            id: 'b4-1',
            speaker: leadName,
            text: 'Handled. Let us see what the next chapter brings.',
            type: 'speech',
            position: 'top-right'
          },
          {
            id: 'b4-2',
            speaker: 'Narrator',
            text: `And so, the journey in ${worldTitle || 'this world'} continues...`,
            type: 'caption',
            position: 'bottom-left'
          }
        ],
        soundEffect: 'RESOLVE',
        soundEffectPosition: { x: 80, y: 75 },
        mood: 'serene',
        imagePrompt: p4ImagePrompt,
        imageUrl: buildImageUrl(p4ImagePrompt, 4)
      }
    ];
  }

  const cognitiveAnalysis: CognitiveAnalysis = {
    initialBurdenScore: 80,
    finalBurdenScore: 20,
    primaryDistortion: 'Narrative Framing & Strategic Resolution',
    antagonistPersonified: partnerName || antagonistName || 'The Central Obstacle',
    coreTruth: isWorkplaceOrClient
      ? `True power in negotiation lies in preparation, poise, and understanding what the other side genuinely values.`
      : `Every great story is shaped by the decisions made in the heat of conflict.`,
    mentalSpaceFreedMinutes: 120,
    actionBlueprint: [
      {
        id: 'act-1',
        action: `Build upon "${episodeTitle}" in the next chapter.`,
        timeRequired: '5 mins',
        completed: false
      }
    ]
  };

  const dynamicSuggestions = isWorkplaceOrClient
    ? [
        `${leadName} navigates the initial onboarding phase while discerning ${guestPartner?.name || 'the client'}'s true motives`,
        `A rival executive attempts to undermine the newly signed partnership behind closed doors`,
        `${leadName} and ${guestPartner?.name || 'the client'} celebrate the agreement at a private gala where new dynamics emerge`
      ]
    : [
        `${leadName} investigates the hidden anomaly uncovered during this chapter`,
        `${leadName} prepares a proactive counter-strategy for the upcoming escalation`,
        `A critical breakthrough reveals a surprising hidden truth about this world`
      ];

  const dynamicQuestion = isWorkplaceOrClient
    ? {
        question: `How should ${leadName} solidify the new partnership with ${guestPartner?.name || 'the client'}?`,
        options: [
          { label: '🥂 Strategic Private Celebration', beat: `${leadName} attends an exclusive private dinner to deepen mutual trust and strategic leverage` },
          { label: '📊 Ruthless Operational Execution', beat: `${leadName} over-delivers on the first milestone before the client can question the terms` },
          { label: '🕵️ Confidential Due Diligence', beat: `${leadName} discreetly probes the client's undisclosed corporate liabilities` }
        ]
      }
    : {
        question: `How should ${leadName} proceed in the aftermath of this chapter?`,
        options: [
          { label: '⚔️ Direct Offensive', beat: `${leadName} takes the initiative immediately and presses the advantage` },
          { label: '🕵️ Covert Reconnaissance', beat: `${leadName} investigates hidden clues left behind in the field` },
          { label: '🛡️ Fortified Consolidation', beat: `${leadName} regroups with allies to solidify defensive security` }
        ]
      };

  return {
    id: `strip-${Date.now()}`,
    title: episodeTitle,
    createdAt: new Date().toISOString(),
    domain: isWorkplaceOrClient ? 'drama' : 'adventure',
    artStyle,
    lens,
    rawBrainDump: cleanPrompt,
    pageImageUrl: buildPageImageUrl(),
    panels,
    cognitiveAnalysis,
    metaModelUsed: modelUsed,
    pageCharacters,
    guestCharacters: detectedGuestChars.length > 0 ? detectedGuestChars : undefined,
    nextSuggestions: dynamicSuggestions,
    directorQuestion: dynamicQuestion
  };
}
