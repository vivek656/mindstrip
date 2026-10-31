import { NextRequest, NextResponse } from 'next/server';
import { persistToPermanentBlob } from '@/lib/blob-storage';
import {
  cleanPromptForWordlessArtwork,
  formatFrameWithRagDialogue,
  applyCanonicalCharacterAttire,
  stripSystemMetadataTags,
  COMIC_PAGE_PUBLICATION_DIRECTIVE
} from '@/lib/agents/art-director';

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

    const targetCharacters = activeEpisodeCharacters.length > 0 ? activeEpisodeCharacters : (characters || []).slice(0, 2);

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

    // Thoroughly scrub all metadata, panel numbers, timestamps, and typography triggers so diffusion models never paint text
    const rawClean = cleanPromptForWordlessArtwork(stripSystemMetadataTags(customPrompt || prompt || episodeTitle || 'dynamic comic scene'));
    let sanitizedPrompt = applyCanonicalCharacterAttire(rawClean, targetCharacters);

    // If multi-panel layout and panel objects are provided, build an explicit sequential frame prompt with RAG dialogue
    const hasExplicitCustom = Boolean(customPrompt && customPrompt.trim().length > 0 && !customPrompt.includes('sequential narrative frames'));
    if (!hasExplicitCustom && effectiveLayout === '1-panel' && Array.isArray(panels) && panels.length >= 1) {
      const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
      sanitizedPrompt = `Full-page cinematic graphic novel splash illustration: ${p1}. Panoramic dramatic composition.`;
    } else if (!hasExplicitCustom && effectiveLayout === '2-panel' && Array.isArray(panels) && panels.length >= 2) {
      const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
      const p2 = formatFrameWithRagDialogue(panels[1], targetCharacters);
      sanitizedPrompt = `Two sequential narrative frames side by side separated by a vertical white comic gutter: Left frame depicts ${p1}. Right frame depicts ${p2}.`;
    } else if (!hasExplicitCustom && effectiveLayout === '3-panel' && Array.isArray(panels) && panels.length >= 3) {
      const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
      const p2 = formatFrameWithRagDialogue(panels[1], targetCharacters);
      const p3 = formatFrameWithRagDialogue(panels[2], targetCharacters);
      sanitizedPrompt = `Three sequential narrative vertical frames separated by clean white gutters: Top frame depicts ${p1}. Middle frame depicts ${p2}. Bottom frame depicts ${p3}.`;
    } else if (!hasExplicitCustom && effectiveLayout === '4-panel' && Array.isArray(panels) && panels.length >= 4) {
      const p1 = formatFrameWithRagDialogue(panels[0], targetCharacters);
      const p2 = formatFrameWithRagDialogue(panels[1], targetCharacters);
      const p3 = formatFrameWithRagDialogue(panels[2], targetCharacters);
      const p4 = formatFrameWithRagDialogue(panels[3], targetCharacters);
      sanitizedPrompt = `Four sequential narrative frames in a 2x2 comic grid with clean white gutters: Top-left frame depicts ${p1}. Top-right frame depicts ${p2}. Bottom-left frame depicts ${p3}. Bottom-right frame depicts ${p4}.`;
    }

    let targetBaseUrl = 'https://api.meta.ai/v1';
    let targetApiKey = apiKey || '';

    const isFireworks = provider === 'fireworks' || imageModel === 'flux-1-schnell';

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
          { error: `Meta Model API Key not detected. Please configure META_MODEL_API_KEY in .env.local to generate official comic page artwork.` },
          { status: 401 }
        );
      }
    }

    const cleanBase = targetBaseUrl.replace(/\/+$/, '');
    const validNames = (characters || []).map((c: { name: string }) => c.name.toLowerCase().trim());

    const charsListArray = targetCharacters.map((c: { name: string; appearance?: string; role?: string; wardrobe?: string }) => {
      const role = (c.role || '').toLowerCase();
      const isCivilian = !role.includes('hero') && !role.includes('vigilante') && !role.includes('warrior') && !role.includes('fighter') && !role.includes('super');
      let desc = `${c.name} (${c.appearance || c.role || 'character'}`;
      if (c.wardrobe) desc += `, wearing ${c.wardrobe}`;
      if (isCivilian) {
        desc += `, civilian everyday citizen, dressed in normal modern office/casual clothing, NOT a superhero, NOT wearing tactical battle armor, NOT performing martial arts`;
      }
      desc += `)`;
      return desc;
    });

    // Check if there are episodic guest characters (e.g. client, boss)
    const guestNames = Array.from(featuredNames).filter(
      (fn) => !(characters || []).some((c: { name: string }) => c.name.toLowerCase().includes(fn) || fn.includes(c.name.toLowerCase()))
    );
    guestNames.forEach((g) => {
      if (/client/.test(g)) {
        charsListArray.push(`${g} (wealthy corporate client in a sharp tailored business suit)`);
      } else if (/boss|ceo|manager/.test(g)) {
        charsListArray.push(`${g} (demanding corporate executive in formal business attire)`);
      }
    });

    const charsList = charsListArray.join(' and ');

    const mandatoryWardrobe = targetCharacters
      .filter((c: any) => c.wardrobe && c.wardrobe.trim())
      .map((c: any) => `${c.name} MUST be wearing: ${c.wardrobe.trim()} (strictly adhere to this attire; DO NOT render in saree, traditional robes, or combat battle gear)`)
      .join('; ');

    // Pure visual layout descriptions without the word "panel" or numbers that trigger diffusion models to paint text labels
    let layoutDescriptor = 'comic book page layout structured as a 2x2 grid of four distinct sequential frames separated by crisp white comic gutters, four distinct sequential scene boxes arranged in two rows and two columns';
    let calculatedAspect = userAspectRatio || '3:4';

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

    const publicationDirective = COMIC_PAGE_PUBLICATION_DIRECTIVE;
    const pagePrompt = `${artStyle} ${layoutDescriptor}, high resolution sequential artwork depicting characters: ${charsList || 'comic heroes'}.${mandatoryWardrobe ? ` [MANDATORY ATTIRE]: ${mandatoryWardrobe}.` : ''} Narrative scene: ${sanitizedPrompt}. ${publicationDirective} Dynamic composition, cinematic lighting.`;

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
      // Official Meta Model API (muse-image-1.0)
      const imgRes = await fetch(`${cleanBase}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${targetApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: imageModel || process.env.META_IMAGE_MODEL || 'muse-image-1.0',
          prompt: pagePrompt,
          n: 1,
          size: '1024x1024'
        })
      });

      if (!imgRes.ok) {
        const errText = await imgRes.text();
        return NextResponse.json({ error: `Meta Muse Image API error (${imgRes.status}): ${errText.slice(0, 180)}` }, { status: 502 });
      }

      const imgData = await imgRes.json();
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
