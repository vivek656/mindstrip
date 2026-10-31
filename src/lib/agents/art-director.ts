import { ShowrunnerDraft, AgentContext } from './types';
import { ComicPanel, ArtStyle } from '@/types/comic';

export interface ArtDirectorResult {
  sanitizedDraft: ShowrunnerDraft;
  pagePrompt: string;
  visualAnchors: string[];
  layoutDescriptor: string;
}

/**
 * Strips structural jargon, panel numbering, and timestamps (e.g. "Panel 1:", "[Beat 2]", "09:00")
 * that cause diffusion models to mistakenly paint literal metadata banners like "PANEL 1".
 * Crucially, it preserves narrative descriptions, action, and dialogue.
 */
export function cleanStructuralMetadata(raw: string): string {
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
    // Strip standalone panel counts like "4-panel", "3-panel"
    .replace(/\b\d+\s*-\s*panels?\b/gi, ' ')
    // Strip all-caps titles with colons like "THE CALL:", "SAVING EARTH:", "THE SETUP:"
    .replace(/\b[A-Z0-9\s]{2,25}:(?=\s)/g, ' ')
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
 * Backwards-compatible alias for cleanStructuralMetadata.
 */
export function cleanPromptForWordlessArtwork(raw: string): string {
  return cleanStructuralMetadata(raw);
}

/**
 * Injects RAG-grounded dialogue, speech balloons, and sound effects directly into
 * a sequential frame's visual prompt for native in-image generation.
 */
export function formatFrameWithRagDialogue(panel: ComicPanel): string {
  if (!panel) return '';
  const visualDesc = cleanStructuralMetadata(panel.imagePrompt || panel.sceneDescription || '');

  const speechParts: string[] = [];
  if (panel.bubbles && panel.bubbles.length > 0) {
    panel.bubbles.slice(0, 2).forEach((b) => {
      const cleanText = b.text.replace(/["“”]/g, '').trim();
      if (cleanText) {
        if (b.type === 'thought') {
          speechParts.push(`${b.speaker} thought bubble saying "${cleanText}"`);
        } else {
          speechParts.push(`${b.speaker} speech balloon saying "${cleanText}"`);
        }
      }
    });
  }

  const sfxPart = panel.soundEffect ? `sound effect "${panel.soundEffect.replace(/^⚡\s*/, '')}"` : '';
  const textElements = [...speechParts, sfxPart].filter(Boolean).join(', ');

  if (textElements) {
    return `${visualDesc}, featuring ${textElements}`;
  }
  return visualDesc;
}

/**
 * Textless directive used strictly for standalone character model sheet portraits.
 */
export const TEXTLESS_ARTWORK_DIRECTIVE =
  'clean wordless portrait, unlettered character design, pristine model sheet without typography, professional publication.';

/**
 * Authentic comic page publication directive: instructs diffusion models to generate
 * real graphic novel pages with comic speech balloons, dialogue, and sound effects.
 */
export const COMIC_PAGE_PUBLICATION_DIRECTIVE =
  'authentic published graphic novel comic book page, clean white gutters separating sequential frames, expressive comic speech balloons with dialogue, comic sound effects, professional comic publication.';

export function directVisualArtwork(
  draft: ShowrunnerDraft,
  context: AgentContext
): ArtDirectorResult {
  const characters = context.characters || context.world?.characters || [];
  const artStyle: ArtStyle = context.artStyle || context.world?.artStyle || 'webcomic';
  const layout = draft.layoutStyle || '4-panel';

  // 1. Determine which characters are ACTUALLY featured in this episode's script or premise
  const featuredNames = new Set<string>();
  draft.panels.forEach((p) => {
    (p.characters || []).forEach((n) => featuredNames.add(n.toLowerCase().trim()));
    (p.bubbles || []).forEach((b) => {
      if (b.speaker.toLowerCase() !== 'narrator' && b.speaker.toLowerCase() !== 'caption') {
        featuredNames.add(b.speaker.toLowerCase().trim());
      }
    });
  });

  const promptLower = (context.rawDump || '').toLowerCase();

  // Filter World Bible characters: only include if present in panels or mentioned in prompt
  const activeEpisodeCharacters = characters.filter((c) => {
    const cName = c.name.toLowerCase();
    if (featuredNames.size > 0) {
      return Array.from(featuredNames).some((fn) => fn.includes(cName) || cName.includes(fn));
    }
    return promptLower.includes(cName);
  });

  // Fallback: If no character matched, take only the single primary character
  const targetCharacters = activeEpisodeCharacters.length > 0 ? activeEpisodeCharacters : [characters[0]].filter(Boolean);

  // Compile Character Visual Anchors (with Character Visual RAG) strictly for featured characters
  const visualAnchors: string[] = [];
  const charDescriptions = targetCharacters.map((c) => {
    const role = (c.role || '').toLowerCase();
    const isCivilian = !role.includes('hero') && !role.includes('vigilante') && !role.includes('warrior') && !role.includes('fighter') && !role.includes('super');
    const anchors: string[] = [];
    if (c.appearance) anchors.push(c.appearance);
    if (c.wardrobe) anchors.push(`wearing ${c.wardrobe}`);
    if (isCivilian) anchors.push('civilian everyday citizen, regular modern office/casual clothing, non-combatant, NOT wearing tactical combat gear, NOT performing martial arts');
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

  // Also include episodic guest scene partners from featuredNames (e.g. client, boss)
  const guestNames = Array.from(featuredNames).filter(
    (fn) => !characters.some((c) => c.name.toLowerCase().includes(fn) || fn.includes(c.name.toLowerCase()))
  );
  guestNames.forEach((g) => {
    if (/client/.test(g)) {
      charDescriptions.push(`${g} (wealthy high-profile corporate client in a sharp tailored business suit)`);
    } else if (/boss|ceo|manager/.test(g)) {
      charDescriptions.push(`${g} (demanding corporate executive in formal business attire)`);
    } else {
      charDescriptions.push(`${g} (scene partner in appropriate civilian attire)`);
    }
  });

  // 2. Resolve Layout Composition Descriptor
  let layoutDescriptor = 'comic book page layout structured as four distinct sequential frames separated by crisp white comic gutters';
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

  // 4. Sanitize and update each panel's imagePrompt in the draft with dialogue
  const sanitizedPanels = draft.panels.map((panel) => {
    const frameWithDialogue = formatFrameWithRagDialogue(panel);
    const sanitized = `${styleDescriptor}. ${frameWithDialogue}. Dynamic composition, expressive comic frame.`;
    return {
      ...panel,
      imagePrompt: sanitized
    };
  });

  const sanitizedDraft: ShowrunnerDraft = {
    ...draft,
    panels: sanitizedPanels
  };

  // 5. Build Unified Full-Page Image Prompt with Injected RAG Dialogue
  const charsSummary = charDescriptions.length > 0 ? charDescriptions.join(' and ') : 'comic characters';
  let premiseSnippet = cleanStructuralMetadata(context.rawDump || draft.title || 'dynamic comic scene');

  if (layout === '1-panel' && draft.panels.length >= 1) {
    const p1 = formatFrameWithRagDialogue(draft.panels[0]);
    premiseSnippet = `Full-page cinematic graphic novel splash illustration: ${p1}. Panoramic dramatic composition.`;
  } else if (layout === '2-panel' && draft.panels.length >= 2) {
    const p1 = formatFrameWithRagDialogue(draft.panels[0]);
    const p2 = formatFrameWithRagDialogue(draft.panels[1]);
    premiseSnippet = `Two sequential narrative frames side by side separated by a vertical white comic gutter: Left frame depicts ${p1}. Right frame depicts ${p2}.`;
  } else if (layout === '3-panel' && draft.panels.length >= 3) {
    const p1 = formatFrameWithRagDialogue(draft.panels[0]);
    const p2 = formatFrameWithRagDialogue(draft.panels[1]);
    const p3 = formatFrameWithRagDialogue(draft.panels[2]);
    premiseSnippet = `Three sequential narrative vertical frames separated by clean white gutters: Top frame depicts ${p1}. Middle frame depicts ${p2}. Bottom frame depicts ${p3}.`;
  } else if (draft.panels.length >= 4) {
    const p1 = formatFrameWithRagDialogue(draft.panels[0]);
    const p2 = formatFrameWithRagDialogue(draft.panels[1]);
    const p3 = formatFrameWithRagDialogue(draft.panels[2]);
    const p4 = formatFrameWithRagDialogue(draft.panels[3]);
    layoutDescriptor = 'a four-panel comic strip page layout structured as a 2x2 grid of four distinct sequential frames separated by crisp white comic gutters, four distinct sequential scene boxes arranged in two rows and two columns';
    premiseSnippet = `Four sequential narrative frames in a 2x2 comic grid with white gutters: Top-left frame depicts ${p1}. Top-right frame depicts ${p2}. Bottom-left frame depicts ${p3}. Bottom-right frame depicts ${p4}.`;
  }

  const pagePrompt = `${artStyle} ${layoutDescriptor}, high resolution sequential artwork depicting characters: ${charsSummary}. Narrative scene: ${premiseSnippet}. ${COMIC_PAGE_PUBLICATION_DIRECTIVE} Dynamic composition, cinematic lighting.`;

  return {
    sanitizedDraft,
    pagePrompt,
    visualAnchors,
    layoutDescriptor
  };
}
