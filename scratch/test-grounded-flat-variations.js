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

async function testGroundedFlat() {
  const tests = [
    {
      name: 'v4_planted_flat_on_floor_pencil_skirt',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level side-profile framing inside luxury 100th-floor corner executive penthouse suite, 85mm lens compression, eye-level to floor. On left: Namita wearing black pencil skirt, pointed red patent leather stiletto shoe worn on foot with both heel and front sole planted firmly flat on the polished marble floor, bearing weight on the ground. On right in 1:1 true scale: 30-year-old woman Priya in dark business suit kneeling on the marble floor with hands on the floor, lowering her face to the floor, lips touching the tip of the planted red shoe in deep respect. Crisp focus across face and shoe, warm marble floor reflections, base of mahogany executive desk and city skyscraper window in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.'
    },
    {
      name: 'v5_seated_pencil_skirt_planted_sole',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Low-angle side-profile shot inside executive penthouse office. Seated CEO Namita in black knee-length pencil skirt has her pointed red patent stiletto shoe resting flat on the polished marble floor. Subordinate Priya in dark corporate uniform is kneeling low on marble, hands flat on floor, bowing head down to the floor with lips touching the pointed tip of the red shoe in deep respect. Natural 1:1 scale, authentic human anatomy, grounded shoe with sole and heel touching marble, beautiful reflections, mahogany desk and skyline window in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 85mm.'
    },
    {
      name: 'v6_close_shot_floor_level_planted',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Eye-level to polished marble floor inside luxury high-rise office. On the marble floor, pointed red patent leather stiletto high heel shoe is planted completely flat and level on the ground. Beside it in 1:1 proportion, attractive 30-year-old businesswoman Priya in dark tailored suit is kneeling on the floor, hands flat on marble, lowering her head down to the floor, resting her lips against the front tip of the grounded red shoe in deep respect. Polished marble reflections, mahogany executive desk and skyscraper skyline in background. Featuring Namita speech balloon saying "Good... show your respect."'
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

testGroundedFlat();