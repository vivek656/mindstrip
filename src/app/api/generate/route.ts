import { NextRequest, NextResponse } from 'next/server';
import { generateComicStripMock } from '@/lib/comic-generator';
import type { ComicPanel, ArtStyle } from '@/types/comic';

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
      layoutPreference = 'auto' // 'auto' | '1-panel' | '2-panel' | '3-panel' | '4-panel'
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
      // On official api.meta.ai, text model is muse-spark-1.3
      if (!modelName || modelName === 'llama-3.3-70b-instruct') {
        targetModel = 'muse-spark-1.3';
      } else {
        targetModel = modelName;
      }
      providerLabel = 'Meta Model API';
    }

    // Assembled story context: bible + chain + pointers. The model never
    // sees raw storage — only this curated, budgeted brief.
    const contextBlock =
      typeof storyContext === 'string' && storyContext.trim()
        ? storyContext.trim()
        : 'None yet (first episode — establish the world and cast).';

    // If an API key is present, execute real Meta Model API call
    if (targetApiKey) {
      try {
        const cleanBase = targetBaseUrl.replace(/\/+$/, '');
        const layoutInstruction = layoutPreference === 'auto'
          ? `You have FULL AUTONOMY as an AI Comic Director Agent. Analyze the dramatic weight of the story prompt and autonomously choose the optimal layout:
- "1-panel": Epic full-page splash art (ideal for a climactic reveal, establishing panorama, or singular dramatic moment).
- "2-panel": Confrontation or punchline split (ideal for sharp banter, before/after contrast, or setup & immediate punchline).
- "3-panel": Fast-paced webtoon strip (ideal for 3-act escalation: setup -> complication -> immediate twist).
- "4-panel": Classic sequential graphic novel spread (ideal for complete narrative arcs).
Explain your dramatic choice in "directorReasoning".`
          : `The user has explicitly requested the "${layoutPreference}" layout. Design exactly ${layoutPreference.replace('-panel', '')} panel(s) and explain in "directorReasoning" how you optimized the storytelling for this layout.`;

        const chatRes = await fetch(`${cleanBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${targetApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              {
                role: 'system',
                content: `You are MindStrip's Autonomous Meta AI Comic Director & Pacing Agent.
You design serialized comic episodes with intelligent narrative pacing, character continuity, and dynamic page layouts.

${layoutInstruction}

Return ONLY valid JSON with this exact schema:
{
  "title": "Creative Episode Title",
  "layoutStyle": "1-panel" | "2-panel" | "3-panel" | "4-panel",
  "directorReasoning": "Your concise explanation of why this layout and pacing was chosen for this scene",
  "coreTruth": "A memorable insight or takeaway from this story",
  "recap": "One or two sentences (under 80 words) summarizing this episode for future continuity",
  "newFacts": ["Canon facts this episode introduced"],
  "openThreads": ["Unresolved hooks this episode leaves open"],
  "panels": [
    {
      "panelNumber": 1,
      "title": "Panel Title",
      "sceneDescription": "Detailed visual description of what happens in this scene",
      "characters": ["Name of character in this panel"],
      "bubbles": [
        {
          "id": "b1-1",
          "speaker": "Character Name",
          "text": "Dialogue or thought text",
          "type": "speech" (or "thought" | "shout" | "caption"),
          "position": "top-left"
        }
      ],
      "soundEffect": "SOUND_EFFECT",
      "mood": "stressed" (or "chaotic" | "epiphany" | "serene"),
      "imagePrompt": "Visual prompt describing lighting, composition, characters, and angle"
    }
  ]
}
Continuity: the STORY CONTEXT below is canon. Continue open threads instead of dropping them. Keep every character's locked appearance identical.`
              },
              {
                role: 'user',
                content: `Universe Title: "${worldTitle || 'Untitled Universe'}"
Genre: "${genre || 'Adventure'}"
Art Style: "${artStyle || 'webcomic'}"
Recurring Characters: ${JSON.stringify(characters || [])}
Requested Layout: ${layoutPreference}
STORY CONTEXT:
${contextBlock}
Episode Premise / Prompt: "${rawDump}"`
              }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          const rawContent = chatData.choices?.[0]?.message?.content || '{}';
          const cleaned = String(rawContent)
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/, '')
            .trim();
          const parsed = JSON.parse(cleaned || '{}');

          if (parsed.panels && Array.isArray(parsed.panels) && parsed.panels.length > 0) {
            const chosenLayout: '1-panel' | '2-panel' | '3-panel' | '4-panel' = 
              ['1-panel', '2-panel', '3-panel', '4-panel'].includes(parsed.layoutStyle)
                ? parsed.layoutStyle
                : parsed.panels.length === 1 ? '1-panel'
                : parsed.panels.length === 2 ? '2-panel'
                : parsed.panels.length === 3 ? '3-panel'
                : '4-panel';

            const skeleton = generateComicStripMock(
              rawDump,
              artStyle || 'webcomic',
              lens || 'candid',
              `${providerLabel} • ${targetModel}`,
              characters,
              worldTitle,
              genre
            );

            // Call Meta Muse Image or Fireworks AI Image generation if an API key is provided
            let generatedPageImage: string | undefined = undefined;
            let imageGenerationNotice = 'Artwork generation not requested';

            if (targetApiKey) {
              try {
                const charsList = (characters || []).map((c: Record<string, unknown>) => `${c.name} (${c.appearance || c.role})`).join(' and ');
                
                let layoutPromptSnippet = `${chosenLayout} graphic novel page spread with ${chosenLayout.replace('-panel', '')} sequential comic panels on one page, clean gutters`;
                if (chosenLayout === '1-panel') {
                  layoutPromptSnippet = `cinematic full-page graphic novel splash art, single dramatic panoramic frame, borderless epic composition, dramatic lighting`;
                } else if (chosenLayout === '2-panel') {
                  layoutPromptSnippet = `two-panel split graphic novel page spread, vertical comic gutter, two progressive confrontation and reaction panels`;
                } else if (chosenLayout === '3-panel') {
                  layoutPromptSnippet = `three-panel sequential webtoon comic strip, three progressive action frames with clean gutters`;
                }

                const pagePrompt = `${artStyle || 'webcomic'} ${layoutPromptSnippet}, high resolution sequential art, depicting characters: ${charsList}. Narrative beat: ${rawDump}. Dynamic composition, expressive graphic novel layout.`;

                if (provider === 'meta-api' || (!provider && targetApiKey) || targetBaseUrl.includes('api.meta.ai')) {
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

                  if (imgRes.ok) {
                    const imgData = await imgRes.json();
                    const rawImg = imgData.data?.[0]?.b64_json || imgData.data?.[0]?.url;
                    if (rawImg) {
                      generatedPageImage = rawImg.startsWith('http') || rawImg.startsWith('data:')
                        ? rawImg
                        : `data:image/webp;base64,${rawImg}`;
                      imageGenerationNotice = `Meta Muse Image 1.0 (${chosenLayout})`;
                    }
                  } else {
                    const errTxt = await imgRes.text();
                    console.warn('Meta image generation non-200:', imgRes.status, errTxt);
                    imageGenerationNotice = `Meta Muse Image error (${imgRes.status})`;
                  }
                } else if (provider === 'fireworks') {
                  const imgRes = await fetch('https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell/text_to_image', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${targetApiKey}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      prompt: pagePrompt,
                      aspect_ratio: chosenLayout === '1-panel' ? '16:9' : '3:4',
                      output_format: 'jpeg'
                    })
                  });

                  if (imgRes.ok) {
                    const imgData = await imgRes.json();
                    const rawImg = imgData.data?.[0]?.url || imgData.image_url;
                    if (rawImg) {
                      generatedPageImage = rawImg;
                      imageGenerationNotice = `Fireworks FLUX.1 (${chosenLayout})`;
                    }
                  } else {
                    const errTxt = await imgRes.text();
                    console.warn('Fireworks image generation non-200:', imgRes.status, errTxt);
                    imageGenerationNotice = `Fireworks FLUX error (${imgRes.status})`;
                  }
                }
              } catch (imgErr) {
                console.warn('Image generation error:', imgErr);
                imageGenerationNotice = 'Image generation service offline';
              }
            }

            const maxPanels = chosenLayout === '1-panel' ? 1 : chosenLayout === '2-panel' ? 2 : chosenLayout === '3-panel' ? 3 : 4;
            const mergedPanels: ComicPanel[] = parsed.panels.slice(0, maxPanels).map((p: Record<string, unknown>, i: number) => {
              const panelNum = i + 1;
              return {
                ...skeleton.panels[Math.min(i, skeleton.panels.length - 1)],
                ...p,
                panelNumber: panelNum,
                imageUrl: undefined,
              } as ComicPanel;
            });

            const comicStrip = {
              ...skeleton,
              title: typeof parsed.title === 'string' ? parsed.title : skeleton.title,
              layoutStyle: chosenLayout,
              directorReasoning: typeof parsed.directorReasoning === 'string' ? parsed.directorReasoning : `AI Director optimized this episode into a ${chosenLayout} for peak narrative rhythm.`,
              recap: typeof parsed.recap === 'string' ? parsed.recap : undefined,
              newFacts: Array.isArray(parsed.newFacts)
                ? parsed.newFacts.filter((f: unknown): f is string => typeof f === 'string')
                : undefined,
              openThreads: Array.isArray(parsed.openThreads)
                ? parsed.openThreads.filter((f: unknown): f is string => typeof f === 'string')
                : undefined,
              panels: mergedPanels,
              pageImageUrl: generatedPageImage,
              cognitiveAnalysis: {
                ...skeleton.cognitiveAnalysis,
                coreTruth: parsed.coreTruth || skeleton.cognitiveAnalysis.coreTruth,
              },
              metaModelUsed: `${providerLabel} (${targetModel})`,
              generationNotice: generatedPageImage
                ? `${providerLabel} (${targetModel}) + ${imageGenerationNotice}`
                : `${providerLabel} (${targetModel}) • Artwork Awaiting Generation`
            };

            return NextResponse.json({ comicStrip });
          }
        } else {
          const errTxt = await chatRes.text();
          console.warn(`Meta API call returned status ${chatRes.status}:`, errTxt);
          const fallback = generateComicStripMock(
            rawDump,
            artStyle || 'webcomic',
            lens || 'candid',
            `${providerLabel} (${targetModel}) • Offline`,
            characters,
            worldTitle,
            genre
          );
          return NextResponse.json({
            comicStrip: {
              ...fallback,
              generationError: `Meta API returned HTTP ${chatRes.status}: ${errTxt.slice(0, 180)}`
            }
          });
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn('Meta API execution encountered error:', errMsg);
        const fallback = generateComicStripMock(
          rawDump,
          artStyle || 'webcomic',
          lens || 'candid',
          `${providerLabel} (${targetModel}) • Offline`,
          characters,
          worldTitle,
          genre
        );
        return NextResponse.json({
          comicStrip: {
            ...fallback,
            generationError: `Meta API connection failed: ${errMsg}`
          }
        });
      }
    }

    // Default resilient dynamic generator (e.g. if key missing or network offline)
    const comicStrip = generateComicStripMock(
      rawDump,
      artStyle || 'webcomic',
      lens || 'candid',
      `${providerLabel} (${targetModel})`,
      characters,
      worldTitle,
      genre
    );

    return NextResponse.json({ comicStrip });
  } catch (error) {
    console.error('API Generate Error:', error);
    return NextResponse.json(
      { error: 'Failed to process comic generation' },
      { status: 500 }
    );
  }
}
