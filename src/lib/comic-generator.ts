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

  // Resolve custom character continuity if provided by user
  const protagonist = characters?.find((c) => c.role === 'protagonist') || characters?.[0];
  const antagonistChar = characters?.find((c) => c.role === 'antagonist');
  const sidekickChar = characters?.find((c) => c.role === 'sidekick' || c.role === 'supporting');

  const protagonistName = protagonist?.name || 'Protagonist';
  const protagonistAppearance = protagonist?.appearance || 'Expressive comic character design';
  const protagonistGender = protagonist?.gender && protagonist.gender !== 'unspecified' ? protagonist.gender : '';

  const antagonistName = antagonistChar?.name || null;
  const antagonistAppearance = antagonistChar?.appearance || 'Imposing opposing figure';
  const antagonistGender = antagonistChar?.gender && antagonistChar.gender !== 'unspecified' ? antagonistChar.gender : '';

  const sidekickName = sidekickChar?.name || null;
  const sidekickAppearance = sidekickChar?.appearance || 'Resourceful loyal companion';
  const sidekickGender = sidekickChar?.gender && sidekickChar.gender !== 'unspecified' ? sidekickChar.gender : '';

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
    // Pure metadata - real AI images generated via Meta Model API (muse-image)
    return undefined;
  };

  const buildPageImageUrl = (): string | undefined => {
    // Pure metadata - real AI images generated via Meta Model API (muse-image)
    return undefined;
  };

  // Extract a brief synopsis from user's raw prompt
  const premiseSnippet = cleanPrompt.length > 90 ? `${cleanPrompt.slice(0, 87)}...` : cleanPrompt;

  // Dynamically derive an episode title from world and premise
  const deriveTitle = () => {
    const words = cleanPrompt.split(/\s+/).slice(0, 5).join(' ');
    const formatted = words.charAt(0).toUpperCase() + words.slice(1).replace(/[.,;:!?]+$/, '');
    return formatted.length > 6 ? formatted : `${worldTitle || 'Episode'}: The Next Move`;
  };

  const episodeTitle = deriveTitle();

  // Dynamic 4-Panel Narrative Pacing Structure
  // Panel 1: The Inciting Situation
  const p1Desc = `${protagonistName} confronts the opening dilemma: "${premiseSnippet}".`;
  const p1ImagePrompt = `${stylePrefix}. ${protagonistName} ${protagonistGender ? `(${protagonistGender})` : ''} (${protagonistAppearance}), scene: ${cleanPrompt}. Atmospheric establishing shot, expressive comic composition.`;
  const p1Text = protagonist?.catchphrase || `Here we go... "${premiseSnippet}".`;

  // Panel 2: The Complication / Rising Tension
  const p2Desc = antagonistName
    ? `${antagonistName} enters the scene, escalating the conflict and testing ${protagonistName}.`
    : `The pressure mounts as an unexpected obstacle complicates the situation.`;
  const p2ImagePrompt = antagonistName
    ? `${stylePrefix}. ${antagonistName} ${antagonistGender ? `(${antagonistGender})` : ''} (${antagonistAppearance}) confronting ${protagonistName}, dramatic high-tension comic faceoff.`
    : `${stylePrefix}. High tension comic panel, intense challenge confronting ${protagonistName}, dramatic lighting.`;

  // Panel 3: The Turning Point / Breakthrough
  const p3Desc = sidekickName
    ? `${sidekickName} steps in alongside ${protagonistName} with a breakthrough strategy.`
    : `${protagonistName} discovers a decisive counter-move to turn the tables.`;
  const p3ImagePrompt = sidekickName
    ? `${stylePrefix}. ${sidekickName} ${sidekickGender ? `(${sidekickGender})` : ''} (${sidekickAppearance}) collaborating with ${protagonistName}, energetic breakthrough moment, dynamic angle.`
    : `${stylePrefix}. ${protagonistName} executing a bold tactical plan, radiant energy, triumphant breakthrough angle.`;

  // Panel 4: The Outcome / Pacing Cliffhanger
  const p4Desc = `The immediate conflict resolves with a lasting impact on ${worldTitle || 'this world'}.`;
  const p4ImagePrompt = `${stylePrefix}. ${protagonistName} standing in the aftermath, cinematic wide angle, thoughtful resolution, evocative atmosphere.`;

  const panels: ComicPanel[] = [
    {
      panelNumber: 1,
      title: 'The Situation Unfolds',
      sceneDescription: p1Desc,
      visualMetaphor: 'The initial spark of the narrative arc',
      characters: [protagonistName],
      bubbles: [
        {
          id: 'b1-1',
          speaker: protagonistName,
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
      characters: antagonistName ? [protagonistName, antagonistName] : [protagonistName],
      bubbles: [
        {
          id: 'b2-1',
          speaker: antagonistName || 'Narrator',
          text: antagonistChar?.catchphrase || (antagonistName ? 'Did you really think it would be that straightforward?' : 'The stakes escalate without warning.'),
          type: antagonistName ? 'shout' : 'caption',
          position: 'top-right'
        },
        {
          id: 'b2-2',
          speaker: protagonistName,
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
      characters: sidekickName ? [protagonistName, sidekickName] : [protagonistName],
      bubbles: [
        {
          id: 'b3-1',
          speaker: sidekickName || protagonistName,
          text: sidekickChar?.catchphrase || (sidekickName ? `Look closely, ${protagonistName}—we have an opening right here!` : 'Found the angle. Making the move now!'),
          type: 'speech',
          position: 'top-left'
        },
        {
          id: 'b3-2',
          speaker: protagonistName,
          text: sidekickName ? 'On it! Executing together.' : 'Everything connects now.',
          type: 'speech',
          position: 'bottom-right'
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
      characters: [protagonistName],
      bubbles: [
        {
          id: 'b4-1',
          speaker: protagonistName,
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

  const cognitiveAnalysis: CognitiveAnalysis = {
    initialBurdenScore: 80,
    finalBurdenScore: 20,
    primaryDistortion: 'Narrative Pacing & Resolution',
    antagonistPersonified: antagonistName || 'The Central Obstacle',
    coreTruth: `Every great story is shaped by the decisions made in the heat of conflict.`,
    mentalSpaceFreedMinutes: 120,
    actionBlueprint: [
      {
        id: 'act-1',
        action: `Build upon this chapter's conclusion in the next episode.`,
        timeRequired: '5 mins',
        completed: false
      }
    ]
  };

  return {
    id: `strip-${Date.now()}`,
    title: episodeTitle,
    createdAt: new Date().toISOString(),
    domain: 'personal',
    artStyle,
    lens,
    rawBrainDump: cleanPrompt,
    pageImageUrl: buildPageImageUrl(),
    panels,
    cognitiveAnalysis,
    metaModelUsed: modelUsed
  };
}
