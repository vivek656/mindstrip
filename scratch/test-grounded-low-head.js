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

async function testGroundedLowHead() {
  const tests = [
    {
      name: 'lh1_head_lowered_to_floor',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side-profile framing inside luxury 100th-floor corner executive penthouse office, 85mm lens compression, eye-level to marble floor, zero wide-angle distortion. On left: Namita wearing black pencil skirt, pointed red patent leather stiletto shoe worn on foot resting flat on the polished marble floor. On right in 1:1 true scale: 30-year-old woman Priya in dark business suit with hair in neat bun, kneeling on marble with hands flat on floor, lowering her head down to the marble floor, lips touching the leather tip of the planted red shoe in deep respect. Natural human anatomy, shoe resting level on marble with clear reflections, dark mahogany desk base and panoramic city skyline in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.'
    },
    {
      name: 'lh2_forehead_and_lips_to_planted_shoe',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level side-profile close-up inside 100th-floor corner executive suite. Seated CEO Namita in black pencil skirt, pointed red patent leather stiletto shoe worn on foot planted flat on the marble floor. Subordinate Priya in dark business suit kneeling on marble, hands flat on floor, bowing low with forehead and lips resting against the pointed toe of the planted red stiletto shoe in deep respect. True 1:1 scale, authentic human anatomy, grounded shoe on polished Italian marble floor, mahogany desk and sunny skyscraper skyline window in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 85mm.'
    },
    {
      name: 'lh3_intimate_macro_planted_level',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Floor-level horizontal macro framing, 85mm lens compression, zero forced perspective. On left: pointed red patent leather stiletto shoe worn on foot below black pencil skirt, resting flat and level on polished marble floor. On right on same focal plane: attractive 30-year-old woman Priya in dark tailored suit, kneeling with hands flat on marble, lowering her face to the marble surface, lips touching the front tip of the red leather shoe in deep respect. True 1:1 realistic proportion, sharp focus on lips and glossy shoe, marble floor reflections, base of mahogany executive desk and city skyscraper window in background. Featuring Namita speech balloon saying "Good... show your respect."'
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

testGroundedLowHead();