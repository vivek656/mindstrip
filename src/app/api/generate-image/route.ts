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
      layoutStyle = '4-panel'
    } = body;

    let targetBaseUrl = 'https://api.meta.ai/v1';
    let targetApiKey = apiKey || '';

    if (provider === 'fireworks') {
      targetBaseUrl = baseUrl || 'https://api.fireworks.ai/inference/v1';
      targetApiKey = apiKey || process.env.FIREWORKS_API_KEY || '';
    } else {
      targetBaseUrl = baseUrl || process.env.META_MODEL_BASE_URL || 'https://api.meta.ai/v1';
      targetApiKey = apiKey || process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY || '';
    }

    if (!targetApiKey) {
      return NextResponse.json(
        { error: 'Meta Model API Key not detected. Please add META_MODEL_API_KEY in .env.local or configure in Settings.' },
        { status: 401 }
      );
    }

    const cleanBase = targetBaseUrl.replace(/\/+$/, '');
    const charsList = (characters || []).map((c: { name: string; appearance?: string; role?: string }) => `${c.name} (${c.appearance || c.role})`).join(' and ');
    
    let layoutDescriptor = '4-panel sequential graphic novel comic page spread, 2x2 grid with authentic gutters';
    let aspectRatio = '3:4';

    if (layoutStyle === '1-panel') {
      layoutDescriptor = 'cinematic full-page dramatic graphic novel splash art, single epic panoramic frame, borderless composition, dramatic lighting';
      aspectRatio = '16:9';
    } else if (layoutStyle === '2-panel') {
      layoutDescriptor = 'two-panel split graphic novel page spread, vertical comic gutter, two progressive confrontation and reaction panels';
      aspectRatio = '3:4';
    } else if (layoutStyle === '3-panel') {
      layoutDescriptor = 'three-panel sequential webtoon comic strip, three progressive action frames with clean gutters';
      aspectRatio = '3:4';
    }

    const pagePrompt = `${artStyle} ${layoutDescriptor}, high resolution sequential art, depicting characters: ${charsList || 'comic heroes'}. Narrative scene: ${prompt || episodeTitle || worldTitle || 'epic confrontation'}. Dynamic composition, expressive graphic novel panel layout, cinematic lighting.`;

    if (provider === 'fireworks') {
      const imgRes = await fetch('https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell/text_to_image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${targetApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: pagePrompt,
          aspect_ratio: '3:4',
          output_format: 'jpeg'
        })
      });

      if (!imgRes.ok) {
        const errText = await imgRes.text();
        return NextResponse.json({ error: `Fireworks API error (${imgRes.status}): ${errText.slice(0, 180)}` }, { status: 502 });
      }

      const imgData = await imgRes.json();
      const rawImg = imgData.data?.[0]?.url || imgData.image_url;
      return NextResponse.json({ pageImageUrl: rawImg, provider: 'Fireworks FLUX.1' });
    } else {
      // Official Meta Model API (muse-image-1.0)
      const imgRes = await fetch(`${cleanBase}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${targetApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.META_IMAGE_MODEL || 'muse-image-1.0',
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

      return NextResponse.json({ pageImageUrl, provider: 'Meta Muse Image 1.0' });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error generating comic page artwork:', msg);
    return NextResponse.json({ error: `Failed to generate page artwork: ${msg}` }, { status: 500 });
  }
}
