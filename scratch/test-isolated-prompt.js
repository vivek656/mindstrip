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

async function testVariations() {
  const tests = [
    {
      name: 'v1_office_background_priya_scale',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side-profile framing inside luxury 100th-floor corner executive penthouse suite, 85mm lens compression, eye-level to marble floor, zero wide-angle distortion, zero giant foot. On left: pointed red patent leather stiletto shoe worn on Namita\'s foot, resting flat on marble floor. On right on the exact same focal plane: 30-year-old woman Priya with dark hair in a neat bun, kneeling in side profile with hands on marble in perfect 1:1 true scale proportion, bowing down with lips touching the pointed toe of the red stiletto shoe in deep respect. Symmetrical adult facial features, plump cheeks, crisp focus across both shoe and face, polished marble floor reflections, base of mahogany executive desk and skyscraper window in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.'
    },
    {
      name: 'v2_seated_shoe_worn_on_foot',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level side-profile framing inside 100th-floor corner executive penthouse office, 85mm telephoto lens, eye-level to polished marble floor. Seated CEO Namita has her pointed red patent leather stiletto shoe worn on her foot and resting flat on the marble floor. Subordinate Priya (30-year-old woman in dark business suit with hair in neat bun) is kneeling on marble in 1:1 true scale, bowing down with lips touching the pointed toe of the red shoe in deep respect. Crisp focus across face and shoe, natural human anatomy, base of mahogany desk and city skyline window in background. Featuring Namita speech balloon saying "Good... show your respect."'
    },
    {
      name: 'v3_worn_on_foot_resting_flat',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side-profile framing, 85mm lens compression, eye-level to marble floor. Inside executive penthouse office with mahogany desk and city window. On left: pointed red patent leather stiletto shoe worn on foot, resting flat on the polished marble floor. On right in 1:1 true scale: 30-year-old woman Priya in dark business suit kneeling on the marble floor, hands on floor, bowing low, lips touching the pointed tip of the red stiletto shoe in deep respect. Symmetrical adult facial features, plump cheeks, crisp focus, marble floor reflections. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.'
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

testVariations();