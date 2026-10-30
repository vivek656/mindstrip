import { NextRequest, NextResponse } from 'next/server';
import { persistToPermanentBlob } from '@/lib/blob-storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      characterName = 'Character',
      role = 'hero',
      gender = '',
      appearance = '',
      wardrobe = '',
      iconicItem = '',
      artStyle = 'webcomic',
      viewType = 'model_sheet', // 'portrait' | 'full_body' | 'back_view' | 'model_sheet' | 'action_pose'
      customPrompt = '',
      provider = 'meta-api',
      apiKey = '',
      baseUrl = '',
      imageModel = 'muse-image-1.0'
    } = body;

    const charGender = gender && gender !== 'unspecified' ? `(${gender})` : '';
    const anchorDetails = [
      appearance ? `Features: ${appearance}` : null,
      wardrobe ? `Wardrobe: ${wardrobe}` : null,
      iconicItem ? `Signature Item: ${iconicItem}` : null,
    ].filter(Boolean).join(', ');

    // 1. Specialized View Prompts for Character Model Sheets
    let viewDescriptor = '';
    let aspect = '1:1';

    switch (viewType) {
      case 'portrait':
        viewDescriptor = `close-up character portrait bust, focusing on facial structure, expressive eyes, hair details, front facing, professional comic concept portrait`;
        aspect = '1:1';
        break;
      case 'full_body':
        viewDescriptor = `full-body character concept art, head-to-toe full length standing pose, showing silhouette, anatomy, torso, legs, shoes, complete costume design`;
        aspect = '3:4';
        break;
      case 'back_view':
        viewDescriptor = `character concept rear turnaround, back view showing back of costume, hair from behind, coat or cape back, silhouette from behind`;
        aspect = '3:4';
        break;
      case 'action_pose':
        viewDescriptor = `dynamic character action illustration, iconic heroic combat pose, wielding signature gear, dramatic atmospheric lighting`;
        aspect = '3:4';
        break;
      case 'model_sheet':
      default:
        viewDescriptor = `professional character model sheet, multi-angle turnaround lineup showing front view, three-quarter view, and side profile on one clean reference sheet, character design sheet`;
        aspect = '16:9';
        break;
    }

    const textlessDirective = 'STRICTLY TEXTLESS: pure character design illustration, absolutely NO printed text, NO watermarks, NO letters, clean background, published graphic novel reference.';
    
    const prompt = customPrompt
      ? `${artStyle} character art: ${customPrompt}. ${viewDescriptor}. ${textlessDirective}`
      : `${artStyle} character concept design of ${characterName} ${charGender} (${role}). ${viewDescriptor}. ${anchorDetails}. ${textlessDirective} Masterpiece comic art, crisp lines, consistent character anatomy.`;

    // 2. Resolve Target Keys & Provider
    const targetMetaKey = apiKey || process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY || '';
    const targetFireworksKey = (provider === 'fireworks' ? apiKey : '') || process.env.FIREWORKS_API_KEY || '';
    const cleanBase = (baseUrl || process.env.META_MODEL_BASE_URL || 'https://api.meta.ai/v1').replace(/\/+$/, '');

    // Determine effective provider:
    // If fireworks requested and has fireworks key -> fireworks
    // If targetMetaKey is present -> ALWAYS use official Meta Model API ('meta-api' / 'muse-image-1.0')
    // If targetFireworksKey is present -> fireworks
    let effectiveProvider = provider;
    if (provider === 'fireworks' && targetFireworksKey) {
      effectiveProvider = 'fireworks';
    } else if (targetMetaKey) {
      effectiveProvider = 'meta-api';
    } else if (targetFireworksKey) {
      effectiveProvider = 'fireworks';
    } else {
      effectiveProvider = 'none';
    }

    if (effectiveProvider === 'none') {
      return NextResponse.json({
        error: 'Meta Model API Key not detected. Please ensure META_MODEL_API_KEY is set in .env.local to generate official character concept art with Meta Muse Image 1.0.'
      }, { status: 401 });
    }

    // 3. Fireworks AI (FLUX.1 Schnell)
    if (effectiveProvider === 'fireworks' || imageModel === 'flux-1-schnell') {
      const targetKey = targetFireworksKey;
      if (!targetKey) {
        return NextResponse.json({ error: 'Fireworks API Key not configured' }, { status: 401 });
      }

      const imgRes = await fetch('https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell/text_to_image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${targetKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspect === '16:9' ? '16:9' : aspect === '3:4' ? '3:4' : '1:1',
          output_format: 'jpeg'
        })
      });

      if (!imgRes.ok) {
        const errTxt = await imgRes.text();
        return NextResponse.json({ error: `Fireworks API error (${imgRes.status}): ${errTxt.slice(0, 180)}` }, { status: 502 });
      }

      const imgData = await imgRes.json();
      const rawImg = imgData.data?.[0]?.url || imgData.image_url;

      const blobResult = await persistToPermanentBlob(rawImg, `char-${characterName}-${viewType}`);

      return NextResponse.json({
        imageUrl: blobResult.url,
        viewType,
        prompt,
        provider: blobResult.isPermanent ? 'Fireworks FLUX.1 + Vercel Blob' : 'Fireworks FLUX.1',
        isPermanent: blobResult.isPermanent
      });
    }

    // 4. Meta Model API (muse-image-1.0)
    const targetKey = targetMetaKey;
    if (!targetKey) {
      return NextResponse.json({ error: 'Meta Model API Key not configured' }, { status: 401 });
    }

    const imgRes = await fetch(`${cleanBase}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${targetKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: imageModel || 'muse-image-1.0',
        prompt,
        n: 1,
        size: '1024x1024'
      })
    });

    if (!imgRes.ok) {
      const errTxt = await imgRes.text();
      return NextResponse.json({ error: `Meta Muse Image error (${imgRes.status}): ${errTxt.slice(0, 180)}` }, { status: 502 });
    }

    const imgData = await imgRes.json();
    const rawImg = imgData.data?.[0]?.b64_json || imgData.data?.[0]?.url;
    if (!rawImg) {
      return NextResponse.json({ error: 'Meta Muse Image did not return image data' }, { status: 500 });
    }

    const formatted = rawImg.startsWith('http') || rawImg.startsWith('data:')
      ? rawImg
      : `data:image/webp;base64,${rawImg}`;

    const blobResult = await persistToPermanentBlob(formatted, `char-${characterName}-${viewType}`);

    return NextResponse.json({
      imageUrl: blobResult.url,
      viewType,
      prompt,
      provider: blobResult.isPermanent ? 'Meta Muse Image 1.0 + Vercel Blob' : 'Meta Muse Image 1.0',
      isPermanent: blobResult.isPermanent
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Character image generation error:', msg);
    return NextResponse.json({ error: `Failed to generate character image: ${msg}` }, { status: 500 });
  }
}
