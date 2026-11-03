const fs = require('fs');
const path = require('path');

const envFile = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const key = process.env.META_MODEL_API_KEY || process.env.MODEL_API_KEY || process.env.META_API_KEY;

async function testWornFootTrueScale() {
  const prompt = 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side-profile framing, eye-level to floor, 85mm telephoto lens compression, zero wide-angle distortion, zero giant foot. Both Namita\'s foot and Priya\'s face are on the exact same focal plane side-by-side in natural 1:1 true anatomical scale. On left: Namita\'s slender foot wearing a polished red stiletto high heel planted on marble. On right: 30-year-old subordinate Priya kneeling with head bowed low in profile, soft symmetrical facial features, lips touching the red leather edge of the stiletto shoe in deep respect. Polished marble floor with subtle reflections. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad cinematography.';

  console.log('Testing worn stiletto with true 1:1 scale...');
  const res = await fetch('https://api.meta.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'muse-image-1.0',
      prompt: prompt,
      n: 1,
      size: '1024x1024'
    })
  });

  console.log('Status:', res.status);
  if (!res.ok) {
    console.log('Error:', await res.text());
    return;
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (b64) {
    const out = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_worn_true_scale.webp';
    fs.writeFileSync(out, Buffer.from(b64, 'base64'));
    console.log('Saved to', out);
  }
}

testWornFootTrueScale();
