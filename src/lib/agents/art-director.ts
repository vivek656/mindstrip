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
 * Uses Meta AI (muse-spark-1.3) to dynamically rewrite an image prompt that was flagged
 * by image generation content filters into clean visual art direction (framing, lighting,
 * environment, posture, wardrobe) with ZERO hardcoded word dictionaries.
 */
export async function rewritePromptWithAiArtDirector(
  originalPrompt: string,
  targetApiKey: string,
  cleanBase: string,
  modelName: string = 'muse-spark-1.3'
): Promise<string | null> {
  if (!targetApiKey) return null;
  try {
    const res = await fetch(`${cleanBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${targetApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: `You are MindStrip's AI Art Director. An image generation prompt for a comic page or character was flagged by an automated content management filter.
Your task: Rephrase the prompt into pure visual comic art direction (focusing purely on lighting, camera angle, character wardrobe, posture, environment, and composition) that is completely safe and policy-compliant, preserving the creator's visual aesthetic without any sensitive or policy-triggering keywords.
Rules:
1. Do NOT include sensitive, provocative, or violent terms.
2. Focus strictly on what the camera sees (lighting, color palette, attire, composition).
3. Return ONLY the rewritten visual prompt string. Do NOT add preamble, quotes, or markdown.`
          },
          {
            role: 'user',
            content: `Flagged prompt to reformulate into safe visual comic artwork: "${originalPrompt}"`
          }
        ],
        temperature: 0.5,
        max_tokens: 1024
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content && content.length > 20) {
        return content.replace(/^["'`]|["'`]$/g, '').trim();
      }
    }
  } catch (err) {
    console.warn('AI Art Director prompt reformulation skipped:', err);
  }
  return null;
}

/**
 * Creates a clean, visual-only fallback prompt focusing purely on character visual anchors,
 * comic style, layout gutters, and dramatic lighting without carrying over unvetted narrative text.
 */
export function createPolicySafePagePrompt(
  artStyle: string,
  layoutDescriptor: string,
  charactersList: string,
  sceneSummary: string
): string {
  const style = artStyle || 'webcomic';
  const layout = layoutDescriptor || 'comic book page layout structured as four distinct sequential frames separated by white gutters';
  const chars = charactersList || 'comic heroes';
  const scene = sceneSummary || 'dramatic scene interaction with expressive character presence';
  return `${style} ${layout}, high resolution sequential graphic novel artwork depicting: ${chars}. Narrative scene: ${scene}. Professional graphic novel page, crisp white comic gutters, cinematic lighting, dynamic composition.`;
}

/**
 * Strips accumulated system metadata tags from premises, preventing director directives
 * and cast scoping locks from piling up or appending repeatedly across turns.
 */
export function stripSystemMetadataTags(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\[DIRECTORIAL CAST LOCK\][\s\S]*?(?=\n\n|\n\[|$)/gi, '')
    .replace(/\[Director Direction & Beats\]:[\s\S]*?(?=\n\n|\n\[|$)/gi, '')
    .replace(/\[Scoped Cast for Page\]:[\s\S]*?(?=\n\n|\n\[|$)/gi, '')
    .replace(/\[MANDATORY CHARACTER WARDROBE\]:[\s\S]*?(?=\n\n|\n\[|$)/gi, '')
    .replace(/\[MANDATORY WARDROBE\]:[\s\S]*?(?=\n\n|\n\[|$)/gi, '')
    .trim();
}

/**
 * Detects if a scene description or prompt already contains explicit attire or clothing
 * specified for a character (or for the scene in general), allowing page-specific outfits
 * (e.g. gala gown, tracksuit, wedding saree, lab coat, armor, pajamas) to take precedence.
 */
export function hasSceneSpecificAttire(sceneText: string, characterName?: string): boolean {
  if (!sceneText) return false;

  if (characterName) {
    const escapedName = characterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Pattern 1: Character name near clothing/attire keywords
    const charAttireRegex = new RegExp(
      `\\b${escapedName}\\b[^.,;!?]{0,60}\\b(wearing|dressed in|clad in|sporting|draped in|attire|outfit|costume|gown|dress|uniform|suit|tuxedo|scrubs|robe|swimsuit|bikini|pajamas|pyjamas|armor|armour|jacket|hoodie|coat|sweater|tshirt|t-shirt|lehenga|saree|sari|kurta|sherwani|kimono|hanbok|wetsuit|spacesuit)\\b`,
      'i'
    );
    if (charAttireRegex.test(sceneText)) return true;
  }

  // Pattern 2: General explicit attire clauses in the text
  const generalAttireRegex = /\b(wearing|dressed in|clad in|sporting|draped in|costumed as|dressed as|outfit:|attire:)\s+[a-zA-Z\s]+/i;
  return generalAttireRegex.test(sceneText);
}

/**
 * Applies character visual continuity to a frame description.
 * CRITICAL RULE: Page-specific attire takes absolute precedence!
 * If the scene description already specifies what a character is wearing on this page
 * (e.g. "Namita wearing an evening gown", "dressed in lab scrubs", "in athletic gear"),
 * that page attire is 100% PRESERVED and NOT overwritten.
 * The character's signature dossier wardrobe is ONLY appended as a fallback default
 * when no clothing is specified for that character on that page.
 */
export function applyCanonicalCharacterAttire(
  sceneText: string,
  characters?: { name: string; wardrobe?: string; appearance?: string }[]
): string {
  if (!sceneText || !characters || characters.length === 0) return sceneText;
  let updated = sceneText;

  for (const c of characters) {
    if (!c.name) continue;
    const escapedName = c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const charRegex = new RegExp(`\\b${escapedName}\\b`, 'i');
    if (!charRegex.test(updated)) continue;

    // If the scene ALREADY specifies attire for this character or scene, leave it untouched!
    if (hasSceneSpecificAttire(updated, c.name)) {
      continue;
    }

    // Only apply the dossier wardrobe as a fallback default when no clothing is mentioned
    if (c.wardrobe && c.wardrobe.trim()) {
      if (!updated.toLowerCase().includes(c.wardrobe.toLowerCase())) {
        updated += `, ${c.name} is wearing ${c.wardrobe.trim()}`;
      }
    }
  }

  return updated;
}

/**
 * Injects RAG-grounded dialogue, speech balloons, and sound effects directly into
 * a sequential frame's visual prompt for native in-image generation.
 */
export function formatFrameWithRagDialogue(
  panel: ComicPanel,
  characters?: { name: string; wardrobe?: string; appearance?: string }[]
): string {
  if (!panel) return '';
  let visualDesc = cleanStructuralMetadata(panel.imagePrompt || panel.sceneDescription || '');
  if (characters && characters.length > 0) {
    visualDesc = applyCanonicalCharacterAttire(visualDesc, characters);
  }

  const speechParts: string[] = [];
  if (panel.bubbles && panel.bubbles.length > 0) {
    panel.bubbles.forEach((b) => {
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

  // 2. Check if the scene or draft already specifies attire for characters
  const allSceneText = [
    context.rawDump || '',
    draft.title || '',
    ...draft.panels.map((p) => `${p.sceneDescription || ''} ${p.imagePrompt || ''}`)
  ].join(' ');

  // Compile Character Visual Anchors (with Character Visual RAG) strictly for featured characters
  const visualAnchors: string[] = [];
  const charDescriptions = targetCharacters.map((c) => {
    const anchors: string[] = [];
    if (c.appearance) anchors.push(c.appearance);
    
    // Page/scene-specific attire takes precedence: only inject signature wardrobe if scene has none
    const hasSceneAttire = hasSceneSpecificAttire(allSceneText, c.name);
    if (c.wardrobe && !hasSceneAttire) {
      anchors.push(`default attire: ${c.wardrobe}`);
    }
    
    if (c.iconicItem) anchors.push(`signature ${c.iconicItem}`);
    if (c.imageUrl) anchors.push(`canonical model sheet match: ${c.imageUrl}`);
    if (c.portraitRefUrl) anchors.push(`face & eyes anchor: ${c.portraitRefUrl}`);
    if (c.fullBodyRefUrl) anchors.push(`silhouette anchor: ${c.fullBodyRefUrl}`);
    if (c.backViewRefUrl) anchors.push(`turnaround anchor: ${c.backViewRefUrl}`);
    if (c.actionPoseRefUrl) anchors.push(`signature posture anchor: ${c.actionPoseRefUrl}`);
    const anchorStr = anchors.length > 0 ? anchors.join(', ') : 'distinct expressive comic design';
    visualAnchors.push(`${c.name}${c.imageUrl ? ' (Model Sheet Locked)' : ''}: ${anchorStr}`);
    return `${c.name} (${anchorStr})`;
  });

  // Also include episodic guest scene partners from featuredNames (e.g. client, boss)
  const guestNames = Array.from(featuredNames).filter(
    (fn) => !characters.some((c) => c.name.toLowerCase().includes(fn) || fn.includes(c.name.toLowerCase()))
  );
  guestNames.forEach((g) => {
    charDescriptions.push(`${g} (scene partner in ${context.worldTitle || 'this world'})`);
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
    const frameWithDialogue = formatFrameWithRagDialogue(panel, targetCharacters);
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
    const p1 = formatFrameWithRagDialogue(draft.panels[0], targetCharacters);
    premiseSnippet = `Full-page cinematic graphic novel splash illustration: ${p1}. Panoramic dramatic composition.`;
  } else if (layout === '2-panel' && draft.panels.length >= 2) {
    const p1 = formatFrameWithRagDialogue(draft.panels[0], targetCharacters);
    const p2 = formatFrameWithRagDialogue(draft.panels[1], targetCharacters);
    premiseSnippet = `Two sequential narrative frames side by side separated by a vertical white comic gutter: Left frame depicts ${p1}. Right frame depicts ${p2}.`;
  } else if (layout === '3-panel' && draft.panels.length >= 3) {
    const p1 = formatFrameWithRagDialogue(draft.panels[0], targetCharacters);
    const p2 = formatFrameWithRagDialogue(draft.panels[1], targetCharacters);
    const p3 = formatFrameWithRagDialogue(draft.panels[2], targetCharacters);
    premiseSnippet = `Three sequential narrative vertical frames separated by clean white gutters: Top frame depicts ${p1}. Middle frame depicts ${p2}. Bottom frame depicts ${p3}.`;
  } else if (draft.panels.length >= 4) {
    const p1 = formatFrameWithRagDialogue(draft.panels[0], targetCharacters);
    const p2 = formatFrameWithRagDialogue(draft.panels[1], targetCharacters);
    const p3 = formatFrameWithRagDialogue(draft.panels[2], targetCharacters);
    const p4 = formatFrameWithRagDialogue(draft.panels[3], targetCharacters);
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
