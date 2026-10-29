# MindStrip — Plugging In Your Meta $150 Credits

No secrets live in this repo. Keys stay in your browser (Settings modal) or in local `.env.local` / host env vars. Both are gitignored.

## Option A — Browser Settings (fastest, recommended for judging)

1. Open MindStrip, click Settings.
2. Provider: `Meta Model API (Muse Spark / Muse Wonder / SAM 3.1)`.
3. Paste your Meta Model API key from the Billing page into API Key.
4. Model Identifier: exact id from your dashboard, e.g. `muse-spark-1.3`.
5. Leave Base URL empty unless your dashboard shows a custom endpoint. Default is `https://api.meta.ai/v1`.
6. Save, then generate a strip. The viewer badge should read `Meta Model API (muse-spark-1.3)`.

The key is sent ephemerally to `/api/generate` for that request only and never written to disk.

## Option B — Server env (for your deployed demo)

Create `.env.local` locally (never commit) or set host env vars:

```bash
META_MODEL_API_KEY=your-key-here
META_MODEL_BASE_URL=https://api.meta.ai/v1
META_SPARK_MODEL=muse-spark-1.3
META_IMAGE_MODEL=muse-image-1.0
```

`META_IMAGE_MODEL` defaults to `muse-image-1.0`. Image calls are best-effort: if they fail, panels keep the vector fallback so demos never break.

Also accepted as fallbacks: `MODEL_API_KEY`, `META_API_KEY`.

## How it works in code

- Client: `src/lib/meta-models.ts` sends `{ rawDump, artStyle, lens, provider, apiKey, baseUrl, modelName }` to `/api/generate`.
- Server: `src/app/api/generate/route.ts` calls `POST {base}/chat/completions` with `response_format: { type: 'json_object' }`, merges valid JSON onto the mock skeleton, and falls back to simulation on any failure.
- Image: best-effort `POST {base}/images/generations` only when `META_IMAGE_MODEL` is set.

## Troubleshooting

- Badge says Simulation/Fallback: key missing, wrong model id, or non-200 from Meta. Check dashboard for exact model id and spend limit.
- Never paste keys in chat, issues, or markdown. Set a Spend Limit notification on the Billing page.
