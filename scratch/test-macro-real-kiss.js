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

async function testMacroKiss() {
  const tests = [
    {
      name: 'm1_tight_macro_true_scale',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side-profile tight close-up, 85mm telephoto macro compression, eye-level to floor, zero wide-angle distortion, zero giant shoe. On left: front toe and red sole edge of pointed red patent leather stiletto shoe resting flat and firm on the polished marble floor. On right on the exact same focal plane: 30-year-old Indian woman Priya with hair in neat bun, beautiful symmetrical adult face with plump cheeks, kneeling with hands flat on marble, lips touching the leather tip of the red shoe in deep respect. True 1:1 head-to-shoe realistic proportion, sharp focus on lips and shoe leather, warm reflections on Italian marble floor, base of mahogany executive desk and city skyline window in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.'
    },
    {
      name: 'm2_planted_flat_ground_shot',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level eye-to-floor side profile inside 100th-floor corner executive penthouse suite. Pointed red patent leather stiletto shoe is planted completely flat on the polished marble floor, both heel and sole resting on the ground. Kneeling beside it in 1:1 natural human scale, 30-year-old businesswoman Priya in dark tailored suit bows low, hands flat on marble, resting her lips against the front tip of the red shoe in deep respect. Symmetrical adult features, plump cheeks, sharp focus, glossy leather texture, marble reflections, dark mahogany desk in background. Featuring Namita speech balloon saying "Good... show your respect."'
    },
    {
      name: 'm3_worn_stiletto_grounded_kiss',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side-profile framing, 85mm lens compression, eye-level to marble floor, zero wide-angle distortion. Inside luxury 100th-floor corner executive penthouse suite. On left: pointed red patent leather stiletto shoe planted flat on the polished marble floor with red sole on the ground. On right on the exact same focal plane: 30-year-old woman Priya with dark hair in a neat bun, kneeling in side profile in perfect 1:1 true scale proportion, hands flat on marble, lips touching the pointed toe of the red stiletto shoe in deep respect. Symmetrical adult facial features, plump cheeks, crisp focus across both shoe and face, polished marble floor reflections, base of mahogany executive desk and city skyscraper window in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.'
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

testMacroKiss();