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

async function testGroundedRealisticKiss() {
  console.log('Testing physically grounded, realistic Panel 3 in executive office...');

  const prompt = `ultra-realistic 4K editorial photography comic panel. Ground-level 3/4 low angle inside 100th-floor luxury executive penthouse office. Namita's pointed red patent leather stiletto high heel shoe is firmly planted flat and resting naturally on the polished marble floor, both stiletto heel and red sole grounded on marble. Beside Namita's leather executive chair, 30-year-old senior female subordinate Priya in a tailored dark corporate suit is kneeling low on both knees, hands flat on the polished marble floor beside the shoe in deep reverence, bowing her head down to the floor, gently touching her lips to the pointed front tip of the grounded red stiletto shoe. In background: base of executive mahogany desk, black leather chair, panoramic floor-to-ceiling glass windows overlooking sunny Mumbai skyline. Natural realistic anatomy, natural gravity, grounded footwear, authentic lighting, subtle marble floor reflections. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 50mm photography. Strictly zero floating shoes, zero tilted shoes, zero warped perspective.`;

  try {
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
      const out = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_grounded_realistic_kiss.webp';
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log('Saved to', out);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testGroundedRealisticKiss();
