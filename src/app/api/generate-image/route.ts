import { NextRequest, NextResponse } from 'next/server';
import { persistToPermanentBlob } from '@/lib/blob-storage';
import { cleanPromptForWordlessArtwork, TEXTLESS_ARTWORK_DIRECTIVE } from '@/lib/agents/art-director';

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

    // Intelligent AI Layout Decision if 'auto' is selected
    let effectiveLayout: '1-panel' | '2-panel' | '3-panel' | '4-panel' = '4-panel';
    if (layoutStyle === 'auto' || !layoutStyle) {
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
    } else {
      effectiveLayout = layoutStyle;
    }

    // Thoroughly scrub all metadata, panel numbers, timestamps, and typography triggers so diffusion models never paint text
    let sanitizedPrompt = cleanPromptForWordlessArtwork(customPrompt || prompt || episodeTitle || 'dynamic comic scene');

    // If multi-panel layout and panel objects are provided, build an explicit sequential frame prompt
    if (!customPrompt && effectiveLayout === '4-panel' && Array.isArray(panels) && panels.length >= 4) {
      const p1 = cleanPromptForWordlessArtwork(panels[0]?.imagePrompt || panels[0]?.sceneDescription || '');
      const p2 = cleanPromptForWordlessArtwork(panels[1]?.imagePrompt || panels[1]?.sceneDescription || '');
      const p3 = cleanPromptForWordlessArtwork(panels[2]?.imagePrompt || panels[2]?.sceneDescription || '');
      const p4 = cleanPromptForWordlessArtwork(panels[3]?.imagePrompt || panels[3]?.sceneDescription || '');
      sanitizedPrompt = `Four sequential narrative frames in a 2x2 comic grid: Top-left frame depicts ${p1}. Top-right frame depicts ${p2}. Bottom-left frame depicts ${p3}. Bottom-right frame depicts ${p4}.`;
    } else if (!customPrompt && effectiveLayout === '2-panel' && Array.isArray(panels) && panels.length >= 2) {
      const p1 = cleanPromptForWordlessArtwork(panels[0]?.imagePrompt || panels[0]?.sceneDescription || '');
      const p2 = cleanPromptForWordlessArtwork(panels[1]?.imagePrompt || panels[1]?.sceneDescription || '');
      sanitizedPrompt = `Two sequential narrative frames side by side: Left frame depicts ${p1}. Right frame depicts ${p2}.`;
    } else if (!customPrompt && effectiveLayout === '3-panel' && Array.isArray(panels) && panels.length >= 3) {
      const p1 = cleanPromptForWordlessArtwork(panels[0]?.imagePrompt || panels[0]?.sceneDescription || '');
      const p2 = cleanPromptForWordlessArtwork(panels[1]?.imagePrompt || panels[1]?.sceneDescription || '');
      const p3 = cleanPromptForWordlessArtwork(panels[2]?.imagePrompt || panels[2]?.sceneDescription || '');
      sanitizedPrompt = `Three sequential narrative vertical frames: Top frame depicts ${p1}. Middle frame depicts ${p2}. Bottom frame depicts ${p3}.`;
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
    const charsList = (characters || []).map((c: { name: string; appearance?: string; role?: string }) => `${c.name} (${c.appearance || c.role})`).join(' and ');

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

    const textlessDirective = TEXTLESS_ARTWORK_DIRECTIVE;
    const pagePrompt = `${artStyle} ${layoutDescriptor}, high resolution sequential artwork depicting characters: ${charsList || 'comic heroes'}. Narrative scene: ${sanitizedPrompt}. ${textlessDirective} Dynamic composition, cinematic lighting.`;

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
