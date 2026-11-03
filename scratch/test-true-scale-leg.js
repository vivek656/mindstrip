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

async function testWornLegScale() {
  const prompt = 'ultra-realistic 4K editorial photography comic panel. Ground-level side-profile close-up, 85mm telephoto lens compression, eye-level to marble floor, zero wide-angle distortion, zero giant feet. Namita\'s ankle wearing a pointed red stiletto shoe planted on the marble floor. On the exact same focal plane side-by-side, senior subordinate Priya kneeling in side profile, true 1:1 natural proportion, gently kissing the pointed toe of the red stiletto shoe in deep respect. Both shoe and Priya\'s face in sharp focus, polished marble floor reflections. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.';

  console.log('Testing ankle + true 1:1 scale side profile...');
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
    const out = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_worn_scale_perfect.webp';
    fs.writeFileSync(out, Buffer.from(b64, 'base64'));
    console.log('Saved to', out);
  }
}

testWornLegScale();
