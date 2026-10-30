import { ShowrunnerDraft, AgentContext } from './types';
import { ArtStyle } from '@/types/comic';

export interface ArtDirectorResult {
  sanitizedDraft: ShowrunnerDraft;
  pagePrompt: string;
  visualAnchors: string[];
  layoutDescriptor: string;
}

/**
 * Visual Art Director Agent
 * 
 * Enforces visual consistency across characters and styles:
 * 1. Extracts character visual anchors (hair, wardrobe, iconic items, silhouette).
 * 2. Injects composition & camera angles for the selected layout format.
 * 3. Strips all panel labels, numbers, and text references from prompts.
 * 4. Injects strict textless negative prompts to prevent diffusion models from drawing words/numbers.
 */
export function directVisualArtwork(
  draft: ShowrunnerDraft,
  context: AgentContext
): ArtDirectorResult {
  const characters = context.characters || context.world?.characters || [];
  const artStyle: ArtStyle = context.artStyle || context.world?.artStyle || 'webcomic';
  const layout = draft.layoutStyle || '4-panel';

  // 1. Compile Character Visual Anchors
  const visualAnchors: string[] = [];
  const charDescriptions = characters.map((c) => {
    const anchors: string[] = [];
    if (c.appearance) anchors.push(c.appearance);
    if (c.wardrobe) anchors.push(`wearing ${c.wardrobe}`);
    if (c.iconicItem) anchors.push(`signature ${c.iconicItem}`);
    const anchorStr = anchors.length > 0 ? anchors.join(', ') : 'distinct expressive comic design';
    visualAnchors.push(`${c.name}: ${anchorStr}`);
    return `${c.name} (${anchorStr})`;
  });

  // 2. Resolve Layout Composition Descriptor
  let layoutDescriptor = 'multi-frame graphic novel comic page spread, sequential visual storytelling divided by clean white gutters, borderless frame compositions';
  if (layout === '1-panel') {
    layoutDescriptor = 'cinematic full-page dramatic graphic novel splash illustration, single panoramic widescreen frame, borderless dynamic composition, atmospheric lighting';
  } else if (layout === '2-panel') {
    layoutDescriptor = 'two-frame split graphic novel page spread, vertical white comic gutter, two progressive confrontation and reaction frames';
  } else if (layout === '3-panel') {
    layoutDescriptor = 'three-frame sequential vertical strip, progressive visual action frames with clean white gutters';
  }

  // 3. Resolve Art Style Prefix
  const getStyleDescriptor = (style: string): string => {
    switch (style) {
      case 'webcomic':
        return 'high quality modern webcomic, vibrant colorful digital art, clean cel-shaded linework, dynamic lighting, webtoon style';
      case 'manga':
        return 'dynamic manga comic art, dramatic black and white ink, screentone shading, action speedlines, expressive anime aesthetic';
      case 'cyberpunk':
        return 'cyberpunk neon graphic novel page, glowing cyan and magenta lights, dark futuristic rain, gritty atmospheric lighting';
      case 'noir':
        return 'cinematic graphic novel noir comic art, high contrast deep shadows, dramatic rim lighting, moody ink';
      case 'newspaper':
        return 'classic newspaper comic strip, warm paper texture, nostalgic linework, gentle watercolor wash';
      case 'minimalist':
      default:
        return 'modern editorial comic art, crisp architectural linework, refined palette, clean graphic novel frames';
    }
  };

  const styleDescriptor = getStyleDescriptor(artStyle);

  // 4. Sanitize and update each panel's imagePrompt in the draft
  const sanitizedPanels = draft.panels.map((panel) => {
    const rawPrompt = panel.imagePrompt || panel.sceneDescription || '';
    const cleaned = rawPrompt
      .replace(/\b(panel\s*\d+|panel\s*(one|two|three|four)|frame\s*\d+)\b/gi, 'story beat')
      .replace(/panel/gi, 'scene')
      .replace(/speech bubble/gi, 'action pose')
      .trim();

    const sanitized = `${styleDescriptor}. ${cleaned}. Pure visual illustration, cinematic composition, textless comic art.`;
    return {
      ...panel,
      imagePrompt: sanitized
    };
  });

  const sanitizedDraft: ShowrunnerDraft = {
    ...draft,
    panels: sanitizedPanels
  };

  // 5. Build Unified Full-Page Image Prompt (for Meta Muse Image 1.0)
  const textlessDirective = 'STRICTLY TEXTLESS ARTWORK: pure visual sequential illustration, absolutely NO printed text, NO numbers, NO panel titles, NO "Panel 1" or "Panel 2" labels, NO watermarks, NO captions, NO speech bubbles, professional published comic book art.';
  const charsSummary = charDescriptions.length > 0 ? charDescriptions.join(' and ') : 'comic characters';
  const premiseSnippet = (context.rawDump || draft.title)
    .replace(/\b(panel\s*\d+|frame\s*\d+)\b/gi, '')
    .trim();

  const pagePrompt = `${artStyle} ${layoutDescriptor}, high resolution sequential artwork depicting characters: ${charsSummary}. Narrative beat: ${premiseSnippet}. ${textlessDirective} Dynamic composition, cinematic lighting.`;

  return {
    sanitizedDraft,
    pagePrompt,
    visualAnchors,
    layoutDescriptor
  };
}
