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
/**
 * Thoroughly sanitizes text intended for image diffusion models.
 * Strips panel numbers, scene headers, timestamps (e.g. 09:00, 22:30), 
 * title badges (e.g. THE CALL, SAVING EARTH), quotes, and structural jargon
 * that cause diffusion models (like FLUX.1 or Meta Muse) to physically paint 
 * text badges or banners onto the comic artwork.
 */
export function cleanPromptForWordlessArtwork(raw: string): string {
  if (!raw) return '';
  return raw
    // Strip timestamps like 09:00, 22:30, 09:00 am
    .replace(/\b\d{1,2}:\d{2}(\s*(am|pm))?\b/gi, ' ')
    // Strip brackets around panel headers e.g. "[Panel 1]", "(Frame 2)", "[Beat 3]"
    .replace(/\[\s*(panel|scene|frame|beat)?\s*#?\s*\d*\s*\]/gi, ' ')
    .replace(/\(\s*(panel|scene|frame|beat)?\s*#?\s*\d*\s*\)/gi, ' ')
    // Strip panel/scene/frame/beat headers with optional number, e.g. "Panel 1:", "Panel 1 —", "Scene #2 -", "Beat 4:"
    .replace(/\b(panel|scene|frame|beat)\s*#?\s*\d+\s*([—\-\:\.]\s*)?/gi, ' ')
    // Strip word numbers: "panel one:", "scene two -"
    .replace(/\b(panel|scene|frame|beat)\s*(one|two|three|four|five|six)\s*([—\-\:\.]\s*)?/gi, ' ')
    // Strip "4-panel", "3-panel", "1-panel"
    .replace(/\b\d+\s*-\s*panels?\b/gi, ' ')
    // Strip all-caps titles with colons like "THE CALL:", "SAVING EARTH:", "THE SETUP:"
    .replace(/\b[A-Z0-9\s]{2,25}:(?=\s)/g, ' ')
    // Strip standalone words: panel, panels, speech bubble, dialogue box, caption
    .replace(/\b(panels?|speech bubbles?|dialogue box(es)?|captions?)\b/gi, ' ')
    // Strip quotes so diffusion models never treat quoted text as text to paint
    .replace(/["'“”‘’«»]/g, ' ')
    // Clean up empty parentheses or brackets
    .replace(/[\(\[\{]\s*[\)\]\}]/g, ' ')
    // Strip leftover leading dashes, colons, punctuation clumps
    .replace(/[:—–-]{2,}/g, ' ')
    .replace(/\s*([,:—–-])\s*([,:—–-])+/g, '$1')
    .replace(/^\s*[,:—–-]\s*/, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Textless directive formulated using purely positive descriptive keywords.
 * CRITICAL: Never include quoted strings like 'NO "Panel 1"' because diffusion
 * models will attend to the quotes and draw the quoted text as a visual badge!
 */
export const TEXTLESS_ARTWORK_DIRECTIVE =
  'clean wordless sequential art, mute graphic novel illustration, unlettered clean comic art, pristine visual storytelling, silent comic page without typography, professional graphic novel publication.';

export function directVisualArtwork(
  draft: ShowrunnerDraft,
  context: AgentContext
): ArtDirectorResult {
  const characters = context.characters || context.world?.characters || [];
  const artStyle: ArtStyle = context.artStyle || context.world?.artStyle || 'webcomic';
  const layout = draft.layoutStyle || '4-panel';

  // 1. Compile Character Visual Anchors (with Character Visual RAG)
  const visualAnchors: string[] = [];
  const charDescriptions = characters.map((c) => {
    const role = (c.role || '').toLowerCase();
    const isCivilian = !role.includes('hero') && !role.includes('vigilante') && !role.includes('warrior') && !role.includes('fighter') && !role.includes('super');
    const anchors: string[] = [];
    if (c.appearance) anchors.push(c.appearance);
    if (c.wardrobe) anchors.push(`wearing ${c.wardrobe}`);
    if (isCivilian) anchors.push('civilian everyday citizen, regular clothing, non-combatant, NOT wearing tactical combat gear, NOT fighting');
    if (c.iconicItem) anchors.push(`signature ${c.iconicItem}`);
    if (c.imageUrl) anchors.push(`canonical model sheet match: ${c.imageUrl}`);
    if (c.portraitRefUrl) anchors.push(`face & eyes anchor: ${c.portraitRefUrl}`);
    if (c.fullBodyRefUrl) anchors.push(`legs & costume silhouette anchor: ${c.fullBodyRefUrl}`);
    if (c.backViewRefUrl) anchors.push(`rear turnaround anchor: ${c.backViewRefUrl}`);
    if (c.actionPoseRefUrl) anchors.push(`action stance anchor: ${c.actionPoseRefUrl}`);
    const anchorStr = anchors.length > 0 ? anchors.join(', ') : 'distinct expressive comic design';
    visualAnchors.push(`${c.name}${c.imageUrl ? ' (Model Sheet Locked)' : ''}: ${anchorStr}`);
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
    const cleaned = cleanPromptForWordlessArtwork(rawPrompt);
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

  // 5. Build Unified Full-Page Image Prompt (for Meta Muse Image 1.0 & FLUX.1)
  const charsSummary = charDescriptions.length > 0 ? charDescriptions.join(' and ') : 'comic characters';
  let premiseSnippet = cleanPromptForWordlessArtwork(context.rawDump || draft.title || 'dynamic comic scene');

  if (layout === '4-panel' && draft.panels.length >= 4) {
    const p1 = cleanPromptForWordlessArtwork(draft.panels[0]?.imagePrompt || draft.panels[0]?.sceneDescription || '');
    const p2 = cleanPromptForWordlessArtwork(draft.panels[1]?.imagePrompt || draft.panels[1]?.sceneDescription || '');
    const p3 = cleanPromptForWordlessArtwork(draft.panels[2]?.imagePrompt || draft.panels[2]?.sceneDescription || '');
    const p4 = cleanPromptForWordlessArtwork(draft.panels[3]?.imagePrompt || draft.panels[3]?.sceneDescription || '');
    layoutDescriptor = 'a four-panel comic strip page layout structured as a 2x2 grid of four distinct sequential frames separated by crisp white comic gutters, four distinct sequential scene boxes arranged in two rows and two columns';
    premiseSnippet = `Four sequential narrative frames in a 2x2 comic grid: Top-left frame depicts ${p1}. Top-right frame depicts ${p2}. Bottom-left frame depicts ${p3}. Bottom-right frame depicts ${p4}.`;
  }

  const pagePrompt = `${artStyle} ${layoutDescriptor}, high resolution sequential artwork depicting characters: ${charsSummary}. Narrative scene: ${premiseSnippet}. ${TEXTLESS_ARTWORK_DIRECTIVE} Dynamic composition, cinematic lighting.`;

  return {
    sanitizedDraft,
    pagePrompt,
    visualAnchors,
    layoutDescriptor
  };
}
