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

async function testSeatedFeetKiss() {
  const tests = [
    {
      name: 'v7_seated_at_feet_intimate_angle',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Low-angle medium-close shot inside 100th-floor corner executive penthouse office. Seated in her black leather armchair, CEO Namita wearing black pencil skirt rests her red patent leather stiletto shoe flat on the polished marble floor. Subordinate Priya in dark business suit is kneeling on the marble floor at Namita\'s feet, bowing down with hands flat on marble, lips touching the pointed tip of the red stiletto shoe in deep respect. Natural 1:1 true scale, authentic human anatomy, grounded shoe on marble with clear reflections, dark mahogany desk and panoramic city skyline in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 50mm portrait.'
    },
    {
      name: 'v8_tight_seated_legs_and_bow',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Floor-level perspective inside luxury penthouse office. Lower legs of seated CEO in black pencil skirt, pointed red patent stiletto high heel planted firmly flat on the polished marble floor. Right beside the shoe, 30-year-old businesswoman Priya in dark tailored suit is kneeling on the marble floor, hands on the marble, bowing her head down with lips touching the pointed front of the planted red shoe in deep respect. True 1:1 scale, authentic anatomy, grounded shoe with reflections on Italian marble, base of mahogany executive desk and skyscraper skyline window in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 85mm.'
    },
    {
      name: 'v9_ground_level_natural_profile',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Eye-level to polished marble floor inside luxury executive penthouse office. CEO Namita seated in chair wearing black pencil skirt, with pointed red patent leather stiletto high heel resting flat on the marble floor. Subordinate Priya in dark suit kneeling low beside the chair, hands on marble floor, bowing down with lips touching the tip of the red shoe in deep respect. 1:1 true scale, zero distortion, grounded shoe with clear reflections, mahogany desk in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.'
    }
  ];

  for (const t of tests) {
    console.log(`\n========================================`);
    console.log(`Testing variation: [${t.name}]...`);
    try {
      const res = await fetch('https://api.meta.ai/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'muse-image-1.0',
          prompt: t.prompt,
          n: 1,
          size: '1024x1024'
        })
      });

      console.log('Status:', res.status);
      if (res.ok) {
        console.log(`>>> SUCCESS: [${t.name}] PASSED!`);
        const data = await res.json();
        const b64 = data.data?.[0]?.b64_json;
        if (b64) {
          const out = `C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_${t.name}.webp`;
          fs.writeFileSync(out, Buffer.from(b64, 'base64'));
          console.log('Saved to', out);
        }
      } else {
        const err = await res.text();
        console.log('Error details:', err.slice(0, 200));
      }
    } catch (e) {
      console.error('Fetch error:', e.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

testSeatedFeetKiss();