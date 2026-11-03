import { NextRequest, NextResponse } from 'next/server';
import { persistToPermanentBlob } from '@/lib/blob-storage';
import {
  cleanPromptForWordlessArtwork,
  sanitizeDiffusionSafetyTriggers,
  formatFrameWithRagDialogue,
  applyCanonicalCharacterAttire,
  hasSceneSpecificAttire,
  rewritePromptWithAiArtDirector,
  createPolicySafePagePrompt,
  stripSystemMetadataTags,
  parseCustomPromptBeats,
  COMIC_PAGE_PUBLICATION_DIRECTIVE,
  REALISTIC_PHOTO_DIRECTIVE,
  isPhotorealisticStyle
} from '@/lib/agents/art-director';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      artStyle = 'webcomic',
      characters = [],
      worldTitle,
      episodeTitle,
      provider = 'meta-api',
      apiKey,
      baseUrl,
      layoutStyle = '4-panel',
      imageModel,
      customPrompt,
      aspectRatio: userAspectRatio,
      panels = []
    } = body;

    // Extract characters ACTUALLY featured in this episode's panels or prompt
    const featuredNames = new Set<string>();
    if (Array.isArray(panels)) {
      panels.forEach((p: { characters?: string[]; bubbles?: { speaker?: string }[] }) => {
        (p.characters || []).forEach((n: string) => featuredNames.add(n.toLowerCase().trim()));
        (p.bubbles || []).forEach((b: { speaker?: string }) => {
          if (b.speaker && b.speaker.toLowerCase() !== 'narrator' && b.speaker.toLowerCase() !== 'caption') {
            featuredNames.add(b.speaker.toLowerCase().trim());
          }
        });
      });
    }

    const promptSnippet = (customPrompt || prompt || episodeTitle || '').toLowerCase();

    // Filter characters to only those who actually appear in this episode!
    const activeEpisodeCharacters = (characters || []).filter((c: { name: string }) => {
      const cName = c.name.toLowerCase();
      if (featuredNames.size > 0) {
        return Array.from(featuredNames).some((fn) => fn.includes(cName) || cName.includes(fn));
      }
      return promptSnippet.includes(cName);
    });

    const targetCharacters = activeEpisodeCharacters.length > 0 ? activeEpisodeCharacters : (characters || []);

    // Intelligent AI Layout Decision: Prioritize AI Showrunner's decision or analyze narrative pacing
    let effectiveLayout: '1-panel' | '2-panel' | '3-panel' | '4-panel' = '4-panel';
    if (layoutStyle === 'auto' || !layoutStyle) {
      if (Array.isArray(panels) && panels.length > 0) {
        if (panels.length === 1) effectiveLayout = '1-panel';
        else if (panels.length === 2) effectiveLayout = '2-panel';
        else if (panels.length === 3) effectiveLayout = '3-panel';
        else effectiveLayout = '4-panel';
      } else {
        const pText = (customPrompt || prompt || episodeTitle || '').toLowerCase();
        if (pText.includes('splash') || pText.includes('panorama') || pText.includes('climax') || pText.includes('revelation') || pText.includes('explosion') || pText.includes('epic')) {
          effectiveLayout = '1-panel';
        } else if (pText.includes('vs') || pText.includes('confrontation') || pText.includes('faceoff') || pText.includes('dialogue') || pText.includes('argument') || pText.includes('duel')) {
          effectiveLayout = '2-panel';
        } else if (pText.includes('chase') || pText.includes('escalate') || pText.includes('step by step') || pText.includes('webtoon') || pText.includes('strip')) {
          effectiveLayout = '3-panel';
        } else {
          effectiveLayout = '4-panel';
        }
      }
    } else {
      effectiveLayout = layoutStyle;
    }

    // ─── Per-Art-Style RAG Visual Modifier ────────────────────────────────────
    // Each style produces a distinct visual-direction prefix that forces the diffusion
    // model into a genuinely different aesthetic space, not just different words.
    const ART_STYLE_RAG: Record<string, string> = {
      'webcomic':           'vibrant flat cel-shaded digital illustration, clean bold ink outlines, saturated color fills, modern webcomic aesthetic,',
      'cinematic-realism':  'ultra-realistic 4K editorial photography, live-action film still, Hasselblad medium format, natural skin textures, cinematic lighting, photorealistic,',
      'manga':              'dynamic black-and-white manga ink illustration, bold screentone shading, expressive motion lines, high-contrast B&W graphic novel panels,',
      'noir':               'noir graphic novel, deep dramatic shadow contrast, chiaroscuro rimlight, moody dark palette, stark black ink shadows, brooding cinematic atmosphere,',
      'cyberpunk':          'neon-drenched cyberpunk illustration, glowing LED neon signs, rain-soaked reflective streets, high-tech dystopian aesthetic, electric cyan and magenta color palette,',
      'newspaper':          'vintage newspaper comic strip, warm sepia aged paper texture, nostalgic ink crosshatching, halftone dot patterns, classic editorial illustration,',
      'minimalist':         'crisp minimalist editorial illustration, refined clean linework, restrained muted color palette, whitespace-forward design, sophisticated indie graphic novel tone,',
    };
    const styleRag = ART_STYLE_RAG[artStyle] || `${artStyle} style comic illustration,`;

    // Thoroughly scrub all metadata, panel numbers, timestamps, and typography triggers so diffusion models never paint text
    const rawClean = sanitizeDiffusionSafetyTriggers(cleanPromptForWordlessArtwork(stripSystemMetadataTags(customPrompt || prompt || episodeTitle || 'dynamic comic scene')));
    let sanitizedPrompt = applyCanonicalCharacterAttire(rawClean, targetCharacters);

    // Slice panels to exactly the number of frames the user selected
    const targetFrameCount = effectiveLayout === '1-panel' ? 1 : effectiveLayout === '2-panel' ? 2 : effectiveLayout === '3-panel' ? 3 : 4;
    // If customPrompt is provided (from Granular controls), trust it and skip panel-dialogue override
    const hasCustomPrompt = Boolean(customPrompt && customPrompt.trim().length > 0);
    // Only use panel-dialogue override when no explicit customPrompt was provided by the user
    const hasPanelDialogue = !hasCustomPrompt && Array.isArray(panels) && panels.some((p: any) => p.bubbles && p.bubbles.length > 0);

    if (hasPanelDialogue) {
      // Scripted panels with dialogue bubbles: respect layout selection, slice panels to frame count
      if (effectiveLayout === '1-panel' && panels.length >= 1) {
        const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
        sanitizedPrompt = `${styleRag} Full-page cinematic splash illustration: ${p1}. Panoramic dramatic composition.`;
      } else if (effectiveLayout === '2-panel' && panels.length >= 2) {
        const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
        const p2 = formatFrameWithRagDialogue(panels[1], targetCharacters);
        sanitizedPrompt = `${styleRag} Two sequential narrative frames side by side separated by a vertical white comic gutter: Left frame depicts ${p1}. Right frame depicts ${p2}.`;
      } else if (effectiveLayout === '3-panel' && panels.length >= 3) {
        const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
        const p2 = formatFrameWithRagDialogue(panels[1], targetCharacters);
        const p3 = formatFrameWithRagDialogue(panels[2], targetCharacters);
        sanitizedPrompt = `${styleRag} Three sequential narrative vertical frames separated by clean white gutters: Top frame depicts ${p1}. Middle frame depicts ${p2}. Bottom frame depicts ${p3}.`;
      } else {
        const p1 = formatFrameWithRagDialogue(panels[0] || {}, targetCharacters);
        const p2 = formatFrameWithRagDialogue(panels[1] || panels[0] || {}, targetCharacters);
        const p3 = formatFrameWithRagDialogue(panels[2] || panels[0] || {}, targetCharacters);
        const p4 = formatFrameWithRagDialogue(panels[3] || panels[1] || {}, targetCharacters);
        sanitizedPrompt = `${styleRag} Four sequential narrative frames in a 2x2 comic grid with clean white gutters: Top-left frame depicts ${p1}. Top-right frame depicts ${p2}. Bottom-left frame depicts ${p3}. Bottom-right frame depicts ${p4}.`;
      }
    } else if (hasCustomPrompt) {
      // User or Director provided an explicit prompt — the customPrompt from Granular controls
      // already encodes the art style + layout via buildSequentialPrompt(). Use it directly.
      const parsedBeats = parseCustomPromptBeats(customPrompt!, targetFrameCount);

      if (parsedBeats && parsedBeats.length >= 2) {
        // Custom prompt contained explicit numbered beats
        const b = parsedBeats.map(beat => cleanPromptForWordlessArtwork(beat));
        if (effectiveLayout === '1-panel') {
          sanitizedPrompt = `${styleRag} Full-page cinematic graphic novel splash illustration: ${b[0]}. Panoramic dramatic composition.`;
        } else if (effectiveLayout === '2-panel') {
          sanitizedPrompt = `${styleRag} Two sequential narrative frames side by side separated by a vertical white comic gutter: Left frame depicts ${b[0]}. Right frame depicts ${b[1] || b[0]}.`;
        } else if (effectiveLayout === '3-panel') {
          sanitizedPrompt = `${styleRag} Three sequential narrative vertical frames separated by clean white gutters: Top frame depicts ${b[0]}. Middle frame depicts ${b[1] || b[0]}. Bottom frame depicts ${b[2] || b[1] || b[0]}.`;
        } else {
          sanitizedPrompt = `${styleRag} Four sequential narrative frames in a 2x2 comic grid with clean white gutters: Top-left frame depicts ${b[0]}. Top-right frame depicts ${b[1] || b[0]}. Bottom-left frame depicts ${b[2] || b[0]}. Bottom-right frame depicts ${b[3] || b[1] || b[0]}.`;
        }
      } else if (
        customPrompt!.includes('sequential narrative frames') ||
        customPrompt!.includes('Top frame') ||
        customPrompt!.includes('Frame 1') ||
        customPrompt!.includes('two-panel') ||
        customPrompt!.includes('three-frame') ||
        customPrompt!.includes('four-panel')
      ) {
        // Custom prompt was already pre-formatted with frame descriptions by buildSequentialPrompt()
        // Prepend the style RAG modifier so the art style still has full effect
        sanitizedPrompt = `${styleRag} ${rawClean}`;
      } else {
        // Single descriptive prompt: frame the action across the selected layout
        if (effectiveLayout === '1-panel') {
          sanitizedPrompt = `${styleRag} Full-page cinematic graphic novel splash illustration depicting: ${rawClean}. Panoramic dramatic composition.`;
        } else if (effectiveLayout === '2-panel') {
          sanitizedPrompt = `${styleRag} Two sequential narrative frames side by side separated by a vertical white comic gutter depicting: ${rawClean}. Left frame establishes the scene. Right frame depicts the decisive reaction.`;
        } else if (effectiveLayout === '3-panel') {
          sanitizedPrompt = `${styleRag} Three sequential narrative vertical frames separated by clean white gutters depicting: ${rawClean}. Top frame establishes the setup. Middle frame shows the conflict. Bottom frame shows the outcome.`;
        } else {
          sanitizedPrompt = `${styleRag} Four sequential narrative frames in a 2x2 comic grid with clean white gutters depicting: ${rawClean}. Frame 1 setup, Frame 2 escalation, Frame 3 turning point, Frame 4 resolution.`;
        }
      }
    } else if (Array.isArray(panels) && panels.length > 0) {
      // Standard draw from scripted episode panels (no custom prompt, no dialogue)
      if (effectiveLayout === '1-panel' && panels.length >= 1) {
        const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
        sanitizedPrompt = `${styleRag} Full-page cinematic graphic novel splash illustration: ${p1}. Panoramic dramatic composition.`;
      } else if (effectiveLayout === '2-panel' && panels.length >= 2) {
        const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
        const p2 = formatFrameWithRagDialogue(panels[1], targetCharacters);
        sanitizedPrompt = `${styleRag} Two sequential narrative frames side by side separated by a vertical white comic gutter: Left frame depicts ${p1}. Right frame depicts ${p2}.`;
      } else if (effectiveLayout === '3-panel' && panels.length >= 3) {
        const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
        const p2 = formatFrameWithRagDialogue(panels[1], targetCharacters);
        const p3 = formatFrameWithRagDialogue(panels[2], targetCharacters);
        sanitizedPrompt = `${styleRag} Three sequential narrative vertical frames separated by clean white gutters: Top frame depicts ${p1}. Middle frame depicts ${p2}. Bottom frame depicts ${p3}.`;
      } else if (effectiveLayout === '4-panel' && panels.length >= 4) {
        const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
        const p2 = formatFrameWithRagDialogue(panels[1], targetCharacters);
        const p3 = formatFrameWithRagDialogue(panels[2], targetCharacters);
        const p4 = formatFrameWithRagDialogue(panels[3], targetCharacters);
        sanitizedPrompt = `${styleRag} Four sequential narrative frames in a 2x2 comic grid with clean white gutters: Top-left frame depicts ${p1}. Top-right frame depicts ${p2}. Bottom-left frame depicts ${p3}. Bottom-right frame depicts ${p4}.`;
      }
    }

    let targetBaseUrl = 'https://api.meta.ai/v1';
    let targetApiKey = apiKey || '';

    const effectiveImageModel = imageModel || (process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY ? 'muse-image-1.0' : (process.env.FIREWORKS_API_KEY ? 'flux-1-schnell' : 'muse-image-1.0'));
    const isFireworks = (provider === 'fireworks' || effectiveImageModel === 'flux-1-schnell') && Boolean(process.env.FIREWORKS_API_KEY || (provider === 'fireworks' && apiKey));

    if (isFireworks) {
      targetBaseUrl = baseUrl || 'https://api.fireworks.ai/inference/v1';
      targetApiKey = apiKey || process.env.FIREWORKS_API_KEY || '';
    } else {
      targetBaseUrl = baseUrl || process.env.META_MODEL_BASE_URL || 'https://api.meta.ai/v1';
      targetApiKey = apiKey || process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY || '';
    }

    if (!targetApiKey) {
      // Fallback check if Fireworks key exists when Meta key is missing
      if (process.env.FIREWORKS_API_KEY) {
        targetBaseUrl = baseUrl || 'https://api.fireworks.ai/inference/v1';
        targetApiKey = process.env.FIREWORKS_API_KEY;
      } else {
        return NextResponse.json(
          { error: `Meta Model API Key not detected. Please configure META_MODEL_API_KEY in .env.local to generate official comic page artwork with Meta Muse Image 1.0.` },
          { status: 401 }
        );
      }
    }

    const cleanBase = targetBaseUrl.replace(/\/+$/, '');
    const validNames = (characters || []).map((c: { name: string }) => c.name.toLowerCase().trim());

    const hasPromptAttire = (charName: string) => hasSceneSpecificAttire(rawClean, charName);

    const charsListArray = targetCharacters.map((c: { name: string; appearance?: string; role?: string; wardrobe?: string }) => {
      let desc = `${c.name} (${c.appearance || c.role || 'character'}`;
      if (c.wardrobe && !hasPromptAttire(c.name)) {
        desc += `, default signature attire: ${c.wardrobe}`;
      }
      desc += `)`;
      return desc;
    });

    // Check if there are episodic guest characters (e.g. client, guest)
    const guestNames = Array.from(featuredNames).filter(
      (fn) => !(characters || []).some((c: { name: string }) => c.name.toLowerCase().includes(fn) || fn.includes(c.name.toLowerCase()))
    );
    guestNames.forEach((g) => {
      charsListArray.push(`${g} (scene partner in ${worldTitle || 'this world'})`);
    });

    const charsList = charsListArray.join(' and ');

    const fallbackWardrobe = targetCharacters
      .filter((c: any) => c.wardrobe && c.wardrobe.trim() && !hasPromptAttire(c.name))
      .map((c: any) => `${c.name} default attire: ${c.wardrobe.trim()}`)
      .join('; ');

    const isPhoto = isPhotorealisticStyle(artStyle || '') || (customPrompt ? isPhotorealisticStyle(customPrompt) : false);

    // Pure visual layout descriptions without the word "panel" or numbers that trigger diffusion models to paint text labels
    let layoutDescriptor = 'comic book page layout structured as a 2x2 grid of four distinct sequential frames separated by crisp white comic gutters, four distinct sequential scene boxes arranged in two rows and two columns';
    let calculatedAspect = userAspectRatio || '3:4';

    if (isPhoto) {
      if (effectiveLayout === '1-panel') {
        layoutDescriptor = 'single raw 35mm candid color photograph, cinematic movie still, sharp optical focus, natural ambient indoor lighting, documentary photography';
        calculatedAspect = userAspectRatio || '16:9';
      } else if (effectiveLayout === '2-panel') {
        layoutDescriptor = 'contact sheet of two sequential 35mm film stills from a dramatic movie scene, arranged side by side separated by clean thin white borders';
        calculatedAspect = userAspectRatio || '3:4';
      } else if (effectiveLayout === '3-panel') {
        layoutDescriptor = 'contact sheet of three sequential 35mm film stills from a dramatic movie scene, arranged vertically separated by clean thin white borders';
        calculatedAspect = userAspectRatio || '3:4';
      } else {
        layoutDescriptor = 'contact sheet of four sequential 35mm film stills from a dramatic movie scene, arranged in a 2x2 grid separated by clean thin white borders';
        calculatedAspect = userAspectRatio || '3:4';
      }
    } else {
      if (effectiveLayout === '1-panel') {
        layoutDescriptor = 'cinematic full-page dramatic graphic novel splash illustration, single panoramic widescreen composition, borderless dynamic frame, atmospheric lighting';
        calculatedAspect = userAspectRatio || '16:9';
      } else if (effectiveLayout === '2-panel') {
        layoutDescriptor = 'two sequential graphic novel frames side by side, vertical white comic gutter, confrontation and reaction storytelling';
        calculatedAspect = userAspectRatio || '3:4';
      } else if (effectiveLayout === '3-panel') {
        layoutDescriptor = 'three sequential vertical graphic novel frames, progressive visual action with clean white gutters';
        calculatedAspect = userAspectRatio || '3:4';
      } else {
        layoutDescriptor = 'comic book page layout structured as a 2x2 grid of four distinct sequential frames separated by crisp white comic gutters, four distinct sequential scene boxes arranged in two rows and two columns';
        calculatedAspect = userAspectRatio || '3:4';
      }
    }

    const publicationDirective = isPhoto ? REALISTIC_PHOTO_DIRECTIVE : COMIC_PAGE_PUBLICATION_DIRECTIVE;
    const rawPagePrompt = isPhoto
      ? `ultra-realistic 4K editorial photography, ${layoutDescriptor}, authentic live-action film photography depicting: ${charsList || 'people'}.${fallbackWardrobe ? ` [WARDROBE]: ${fallbackWardrobe}.` : ''} Scene: ${sanitizedPrompt}. ${publicationDirective} Hasselblad medium format portrait, natural skin textures, 8k resolution, photorealistic cinematic lighting.`
      : `${styleRag} ${layoutDescriptor}, high resolution sequential artwork depicting characters: ${charsList || 'comic heroes'}.${fallbackWardrobe ? ` [DEFAULT ATTIRE]: ${fallbackWardrobe}.` : ''} Narrative scene: ${sanitizedPrompt}. ${publicationDirective} Dynamic composition, cinematic lighting.`;
    const pagePrompt = sanitizeDiffusionSafetyTriggers(rawPagePrompt);

    if (isFireworks) {
      const imgRes = await fetch('https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell/text_to_image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${targetApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: pagePrompt,
          aspect_ratio: calculatedAspect === '16:9' ? '16:9' : calculatedAspect === '1:1' ? '1:1' : '3:4',
          output_format: 'jpeg'
        })
      });

      if (!imgRes.ok) {
        const errText = await imgRes.text();
        return NextResponse.json({ error: `Fireworks API error (${imgRes.status}): ${errText.slice(0, 180)}` }, { status: 502 });
      }

      const imgData = await imgRes.json();
      const rawImg = imgData.data?.[0]?.url || imgData.image_url;

      // Auto-archive into permanent Vercel Blob if configured
      const blobResult = await persistToPermanentBlob(rawImg, `fireworks-${worldTitle || 'world'}`);

      return NextResponse.json({
        pageImageUrl: blobResult.url,
        provider: blobResult.isPermanent ? 'Fireworks FLUX.1 + Vercel Blob' : 'Fireworks FLUX.1',
        layoutStyle: effectiveLayout,
        isPermanent: blobResult.isPermanent
      });
    } else {
      // Official Meta Model API (muse-image-1.0) with AI Art Director Auto-Recovery (Zero hardcoding)
      const modelToUse = imageModel || process.env.META_IMAGE_MODEL || 'muse-image-1.0';

      let imgRes: Response | null = null;
      let errText = '';
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          imgRes = await fetch(`${cleanBase}/images/generations`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${targetApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: modelToUse,
              prompt: pagePrompt,
              n: 1,
              size: '1024x1024'
            }),
            signal: AbortSignal.timeout(25000)
          });

          if (imgRes.ok) break;

          errText = await imgRes.text();
          // If 503 or 502 (Meta temporary service spike), wait 1s and retry once
          if ((imgRes.status === 503 || imgRes.status === 502 || imgRes.status === 429) && attempts < maxAttempts) {
            console.warn(`Meta Muse Image temporary service spike (${imgRes.status}). Retrying once in 1s...`);
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          break;
        } catch (fetchErr: any) {
          console.warn(`Fetch attempt ${attempts} to Meta API failed:`, fetchErr?.message || fetchErr);
          if (attempts < maxAttempts && !fetchErr?.name?.includes('Abort')) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          return NextResponse.json({
            error: 'Connection to Meta AI image server timed out. Meta servers may be experiencing peak traffic. Please try clicking Re-Draw again.'
          }, { status: 504 });
        }
      }

      // If Meta's automated safety filter flags the prompt (content_policy_violation),
      // dynamically reformulate using Meta's reasoning AI (muse-spark-1.3)
      if (imgRes && !imgRes.ok) {
        if (imgRes.status === 400 && errText.includes('content_policy_violation')) {
          console.warn('Meta Muse Image flagged content_policy_violation. Engaging AI Art Director to dynamically rephrase into visual direction...');
          
          const aiRewritten = await rewritePromptWithAiArtDirector(
            pagePrompt,
            targetApiKey,
            cleanBase,
            'muse-spark-1.3'
          );

          const safePrompt = aiRewritten || createPolicySafePagePrompt(
            artStyle,
            layoutDescriptor,
            charsList,
            sanitizedPrompt || `${worldTitle || 'Graphic novel'} sequential scene with dramatic staging, expressive interaction, and cinematic graphic novel lighting`,
            panels
          );

          imgRes = await fetch(`${cleanBase}/images/generations`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${targetApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: modelToUse,
              prompt: safePrompt,
              n: 1,
              size: '1024x1024'
            })
          });

          if (!imgRes.ok) {
            errText = await imgRes.text();
          }
        }

        if (!imgRes.ok) {
          if (errText.includes('content_policy_violation')) {
            return NextResponse.json({
              error: 'Meta AI content safety filter flagged this prompt (often triggered by words like "drugs", "weapons", or provocative phrasing). MindStrip attempted an automatic safe recovery, but Meta filter remained active. Please rephrase sensitive story words into neutral visual terms.'
            }, { status: 400 });
          }
          if (imgRes.status === 503 || imgRes.status === 502) {
            return NextResponse.json({
              error: 'The image generation service is temporarily busy. Please wait a few moments and try generating again.'
            }, { status: 503 });
          }
          return NextResponse.json({ error: `Meta Muse Image API error (${imgRes.status}): ${errText.slice(0, 180)}` }, { status: 502 });
        }
      }

      if (!imgRes) {
        return NextResponse.json({ error: 'Image generation service did not respond' }, { status: 500 });
      }

      let imgData: any = {};
      try {
        imgData = await imgRes.json();
      } catch (parseErr) {
        console.error('Failed to parse Meta Muse Image response as JSON:', parseErr);
        return NextResponse.json({ error: 'Image generation service returned an invalid response' }, { status: 502 });
      }

      const rawImg = imgData.data?.[0]?.b64_json || imgData.data?.[0]?.url;
      if (!rawImg) {
        return NextResponse.json({ error: 'Meta Muse Image did not return image data' }, { status: 500 });
      }

      const formattedImg = rawImg.startsWith('http') || rawImg.startsWith('data:')
        ? rawImg
        : `data:image/webp;base64,${rawImg}`;

      // Auto-archive into permanent Vercel Blob if configured
      const blobResult = await persistToPermanentBlob(formattedImg, `meta-muse-${worldTitle || 'world'}`);

      return NextResponse.json({
        pageImageUrl: blobResult.url,
        provider: blobResult.isPermanent ? 'Meta Muse Image 1.0 + Vercel Blob' : 'Meta Muse Image 1.0',
        layoutStyle: effectiveLayout,
        isPermanent: blobResult.isPermanent
      });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error generating comic page artwork:', msg);
    return NextResponse.json({ error: `Failed to generate page artwork: ${msg}` }, { status: 500 });
  }
}
