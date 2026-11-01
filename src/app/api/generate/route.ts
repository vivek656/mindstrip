import { NextRequest, NextResponse } from 'next/server';
import { runProductionRoom, buildComicStripFromProduction } from '@/lib/agents/orchestrator';
import { persistToPermanentBlob } from '@/lib/blob-storage';
import { sanitizeForImageContentPolicy, createPolicySafePagePrompt } from '@/lib/agents/art-director';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      rawDump, 
      artStyle, 
      lens, 
      provider = 'meta-api', 
      apiKey, 
      baseUrl, 
      modelName, 
      characters,
      worldTitle,
      genre,
      storyContext,
      layoutPreference = 'auto',
      imageModel,
      world,
      pastEpisodes
    } = body;

    if (!rawDump) {
      return NextResponse.json({ error: 'Missing rawDump prompt' }, { status: 400 });
    }

    // Resolve target endpoint, key, and model according to Meta provider preset
    let targetBaseUrl = 'https://api.meta.ai/v1';
    let targetApiKey = apiKey || '';
    let targetModel = modelName || 'muse-spark-1.3';
    let providerLabel = 'Meta Model API';

    if (provider === 'fireworks') {
      targetBaseUrl = baseUrl || 'https://api.fireworks.ai/inference/v1';
      targetApiKey = apiKey || process.env.FIREWORKS_API_KEY || '';
      targetModel = modelName || 'accounts/fireworks/models/llama-v3p3-70b-instruct';
      providerLabel = 'Fireworks AI (Meta Llama 3.3 70B)';
    } else if (provider === 'groq') {
      targetBaseUrl = baseUrl || 'https://api.groq.com/openai/v1';
      targetApiKey = apiKey || process.env.GROQ_API_KEY || '';
      targetModel = modelName || 'llama-3.3-70b-versatile';
      providerLabel = 'Groq (Meta Llama 3.3 70B)';
    } else if (provider === 'baseten') {
      targetBaseUrl = baseUrl || process.env.BASETEN_BASE_URL || 'https://bridge.baseten.co/v1';
      targetApiKey = apiKey || process.env.BASETEN_API_KEY || '';
      targetModel = modelName || 'llama-3.3-70b';
      providerLabel = 'Baseten (Meta Llama 3.3)';
    } else if (provider === 'ollama') {
      targetBaseUrl = baseUrl || 'http://localhost:11434/v1';
      targetApiKey = 'ollama';
      targetModel = modelName || 'llama3.3';
      providerLabel = 'Local Ollama (Meta Llama)';
    } else {
      // meta-api official
      targetBaseUrl = baseUrl || process.env.META_MODEL_BASE_URL || 'https://api.meta.ai/v1';
      targetApiKey = apiKey || process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY || '';
      if (!modelName || modelName === 'llama-3.3-70b-instruct') {
        targetModel = 'muse-spark-1.3';
      } else {
        targetModel = modelName;
      }
      providerLabel = 'Meta Model API';
    }

    // Execute Autonomous Multi-Agent Production Room Pipeline
    const productionResult = await runProductionRoom({
      rawDump,
      artStyle: artStyle || 'webcomic',
      lens: lens || 'candid',
      characters,
      worldTitle,
      genre,
      storyContext,
      layoutPreference,
      world,
      pastEpisodes: pastEpisodes || world?.episodes,
      provider,
      apiKey: targetApiKey,
      baseUrl: targetBaseUrl,
      modelName: targetModel
    });

    let comicStrip = buildComicStripFromProduction(productionResult, {
      rawDump,
      artStyle: artStyle || 'webcomic',
      lens: lens || 'candid',
      characters,
      worldTitle,
      genre,
      world,
      pastEpisodes: pastEpisodes || world?.episodes,
      modelName: `${providerLabel} (${targetModel})`
    });

    // If an API key is present, attempt full-page image generation using Art Director's synthesized prompt
    let generatedPageImage: string | undefined = undefined;
    let imageGenerationNotice = 'Artwork generation not requested';

    const effectiveImageModel = imageModel || (process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY ? 'muse-image-1.0' : (process.env.FIREWORKS_API_KEY ? 'flux-1-schnell' : 'muse-image-1.0'));
    const fireworksKey = (provider === 'fireworks' ? targetApiKey : '') || process.env.FIREWORKS_API_KEY || '';
    const metaImgKey = (provider === 'meta-api' ? targetApiKey : '') || process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY || '';
    const isFireworksImage = effectiveImageModel === 'flux-1-schnell' && Boolean(fireworksKey);

    if (isFireworksImage && fireworksKey) {
      try {
        const pagePrompt = productionResult.artDirectorPrompt;
        const imgRes = await fetch('https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell/text_to_image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fireworksKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: pagePrompt,
            aspect_ratio: comicStrip.layoutStyle === '1-panel' ? '16:9' : '3:4',
            output_format: 'jpeg'
          })
        });

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const rawImg = imgData.data?.[0]?.url || imgData.image_url;
          if (rawImg) {
            generatedPageImage = rawImg;
            imageGenerationNotice = `Fireworks FLUX.1 Schnell (${comicStrip.layoutStyle})`;
          }
        } else {
          const errTxt = await imgRes.text();
          console.warn('Fireworks image generation non-200:', imgRes.status, errTxt);
          imageGenerationNotice = `Fireworks FLUX error (${imgRes.status})`;
        }
      } catch (imgErr) {
        console.warn('Fireworks image generation error:', imgErr);
        imageGenerationNotice = 'Fireworks image generation service offline';
      }
    } else if (metaImgKey) {
      try {
        const cleanBase = targetBaseUrl.includes('api.meta.ai') ? targetBaseUrl.replace(/\/+$/, '') : 'https://api.meta.ai/v1';
        const rawPagePrompt = productionResult.artDirectorPrompt || '';
        const pagePrompt = sanitizeForImageContentPolicy(rawPagePrompt);
        let imgRes = await fetch(`${cleanBase}/images/generations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${metaImgKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'muse-image-1.0',
            prompt: pagePrompt,
            n: 1,
            size: '1024x1024'
          })
        });

        // Content policy auto-recovery
        if (!imgRes.ok) {
          const errTxt = await imgRes.text();
          if (imgRes.status === 400 && errTxt.includes('content_policy_violation')) {
            console.warn('Meta Muse Image flagged content policy in full orchestrator. Auto-retrying with safe prompt...');
            const safePrompt = createPolicySafePagePrompt(
              artStyle,
              comicStrip.layoutStyle || '4-panel',
              (characters || []).map((c: any) => c.name).join(' and '),
              `${worldTitle || 'Comic'} graphic novel scene with dramatic visual storytelling and cinematic lighting`
            );

            imgRes = await fetch(`${cleanBase}/images/generations`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${metaImgKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'muse-image-1.0',
                prompt: safePrompt,
                n: 1,
                size: '1024x1024'
              })
            });
          }
        }

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const rawImg = imgData.data?.[0]?.b64_json || imgData.data?.[0]?.url;
          if (rawImg) {
            generatedPageImage = rawImg.startsWith('http') || rawImg.startsWith('data:')
              ? rawImg
              : `data:image/webp;base64,${rawImg}`;
            imageGenerationNotice = `Meta Muse Image 1.0 (${comicStrip.layoutStyle})`;
          }
        } else {
          const errTxt = await imgRes.text();
          console.warn('Meta image generation non-200:', imgRes.status, errTxt);
          imageGenerationNotice = `Meta Muse Image error (${imgRes.status})`;
        }
      } catch (imgErr) {
        console.warn('Image generation error:', imgErr);
        imageGenerationNotice = 'Image generation service offline';
      }
    }

    if (generatedPageImage) {
      const blobResult = await persistToPermanentBlob(generatedPageImage, `page-${worldTitle || 'world'}`);
      comicStrip = {
        ...comicStrip,
        pageImageUrl: blobResult.url,
        generationNotice: `${providerLabel} (${targetModel}) + ${imageGenerationNotice}${blobResult.isPermanent ? ' [Vercel Blob CDN]' : ''}`
      };
    }

    return NextResponse.json({ comicStrip });
  } catch (error) {
    console.error('API Generate Error:', error);
    return NextResponse.json(
      { error: 'Failed to process comic generation' },
      { status: 500 }
    );
  }
}
