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

async function testRefinedV3() {
  const tests = [
    {
      name: 'refined_pencil_skirt_v3',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side-profile framing, 85mm lens compression, eye-level to marble floor, zero wide-angle distortion, zero giant shoe. Inside luxury 100th-floor corner executive penthouse suite. On left: Namita wearing black knee-length pencil skirt, pointed red patent leather stiletto shoe worn on foot, heel resting on the polished marble floor. On right on the exact same focal plane in 1:1 true scale: 30-year-old woman Priya in dark business suit with hair in neat bun, kneeling on the marble floor with hands flat on marble, lips touching the pointed tip of the red stiletto shoe in deep respect. Symmetrical adult facial features, plump cheeks, crisp focus across face and shoe, polished marble floor reflections, base of mahogany executive desk and city skyscraper window in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 85mm portrait.'
    },
    {
      name: 'refined_seated_crossing_heels_v3',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Low-angle intimate side-profile shot inside 100th-floor executive corner penthouse office. Lower hem of Namita\'s black pencil skirt, pointed red patent leather stiletto high heel worn on foot resting on the polished Italian marble floor. Subordinate Priya (30-year-old attractive Indian woman in dark business suit with hair in neat bun) is kneeling on marble with hands flat on the floor, leaning forward, lips touching the front tip of the red stiletto shoe in deep respect. Natural 1:1 scale, authentic human anatomy, warm marble reflections, base of executive mahogany desk and city high-rise window in background. Featuring Namita speech balloon saying "Good... show your respect."'
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

testRefinedV3();