import { NextRequest, NextResponse } from 'next/server';

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
      aspectRatio: userAspectRatio
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

    // Sanitize any accidental "panel 1", "panel 2" mentions from user or episode prompt to prevent models from drawing text labels
    const sanitizedPrompt = (customPrompt || prompt || episodeTitle || 'epic confrontation')
      .replace(/panel\s*\d+/gi, 'story beat')
      .replace(/panel\s*(one|two|three|four)/gi, 'story beat')
      .replace(/\bpanel\b/gi, 'frame')
      .trim();

    // Simulation / Free Preview Provider ($0.00 Zero Cost)
    if (provider === 'simulation' || imageModel === 'simulation') {
      const cleanPrompt = encodeURIComponent(
        `${sanitizedPrompt} ${artStyle} graphic novel spread pure visual art textless no text no numbers no labels`.slice(0, 140)
      );
      const mockUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1365&nologo=true&seed=${Date.now()}`;
      return NextResponse.json({ pageImageUrl: mockUrl, provider: 'Instant Preview Engine (Free)', layoutStyle: effectiveLayout });
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
      const providerName = isFireworks ? 'Fireworks AI' : 'Meta Model';
      return NextResponse.json(
        { error: `${providerName} API Key not detected. Add your key in Settings, or select "Free Preview ($0.00)" for instant zero-cost artwork.` },
        { status: 401 }
      );
    }

    const cleanBase = targetBaseUrl.replace(/\/+$/, '');
    const charsList = (characters || []).map((c: { name: string; appearance?: string; role?: string }) => `${c.name} (${c.appearance || c.role})`).join(' and ');

    // Pure visual layout descriptions without the word "panel" or numbers that trigger diffusion models to paint text labels
    let layoutDescriptor = 'multi-frame graphic novel comic page spread, sequential visual storytelling divided by clean white gutters, borderless frame compositions';
    let calculatedAspect = userAspectRatio || '3:4';

    if (effectiveLayout === '1-panel') {
      layoutDescriptor = 'cinematic full-page dramatic graphic novel splash illustration, single panoramic widescreen frame, borderless dynamic composition, atmospheric lighting';
      calculatedAspect = userAspectRatio || '16:9';
    } else if (effectiveLayout === '2-panel') {
      layoutDescriptor = 'two-frame split graphic novel page spread, vertical white comic gutter, two progressive confrontation and reaction frames';
      calculatedAspect = userAspectRatio || '3:4';
    } else if (effectiveLayout === '3-panel') {
      layoutDescriptor = 'three-frame sequential vertical strip, progressive visual action frames with clean white gutters';
      calculatedAspect = userAspectRatio || '3:4';
    }

    const textlessDirective = 'STRICTLY TEXTLESS ARTWORK: pure visual sequential illustration, absolutely NO printed text, NO numbers, NO panel titles, NO "Panel 1" or "Panel 2" labels, NO watermarks, NO captions, NO speech bubbles, professional published comic book art.';

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
      return NextResponse.json({ pageImageUrl: rawImg, provider: 'Fireworks FLUX.1', layoutStyle: effectiveLayout });
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

      const pageImageUrl = rawImg.startsWith('http') || rawImg.startsWith('data:')
        ? rawImg
        : `data:image/webp;base64,${rawImg}`;

      return NextResponse.json({ pageImageUrl, provider: 'Meta Muse Image 1.0', layoutStyle: effectiveLayout });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error generating comic page artwork:', msg);
    return NextResponse.json({ error: `Failed to generate page artwork: ${msg}` }, { status: 500 });
  }
}
