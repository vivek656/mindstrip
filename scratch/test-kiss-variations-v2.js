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

async function testKissVariations() {
  const variations = [
    {
      name: 'v1_side_profile_bow_to_grounded_shoe',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side-profile framing, 85mm lens compression, eye-level to floor, zero wide-angle distortion. Inside luxury 100th-floor corner executive penthouse office. On left: pointed red patent leather stiletto shoe worn on Namita\'s foot below black pencil skirt, planted firmly flat and level on the polished marble floor. On right on the exact same focal plane and 1:1 true scale: 30-year-old woman Priya in dark business suit with hair in neat bun, bowing her head down to the marble floor, lips kissing the pointed toe of the red stiletto shoe in deep respect. Natural gravity, shoe stays resting flat on marble, authentic human anatomy, polished marble floor reflections, dark mahogany desk base and city skyline window in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.'
    },
    {
      name: 'v2_ground_level_office_kiss',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Floor-level side-profile close-up inside 100th-floor corner executive penthouse suite. Seated at mahogany desk, CEO Namita wears black pencil skirt with pointed red patent leather stiletto shoe planted flat on the polished marble floor. Kneeling on the marble floor beside her, 30-year-old subordinate Priya in dark suit bows down, hands flat on marble, kissing the pointed front of the red stiletto shoe in deep respect. True 1:1 realistic proportion, head and shoe on same focal plane, realistic lighting, marble reflections, executive office skyline in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 85mm portrait.'
    },
    {
      name: 'v3_intimate_macro_floor_kiss',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Intimate ground-level macro shot, eye-to-floor, 85mm telephoto compression, zero forced perspective. Pointed red patent stiletto shoe rests level and flat on polished marble floor. Kneeling low on the floor beside the shoe, attractive 30-year-old Indian businesswoman Priya with hair in neat bun bows her face down, lips touching the front tip of the red stiletto shoe in deep respect. True 1:1 head-to-shoe scale, crisp focus across face and shoe leather, warm marble reflections, base of mahogany executive desk and city skyscraper window in background. Featuring Namita speech balloon saying "Good... show your respect."'
    }
  ];

  for (const v of variations) {
    console.log(`\n========================================`);
    console.log(`Testing variation: [${v.name}]...`);
    try {
      const res = await fetch('https://api.meta.ai/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'muse-image-1.0',
          prompt: v.prompt,
          n: 1,
          size: '1024x1024'
        })
      });

      console.log('Status:', res.status);
      if (res.ok) {
        console.log(`>>> SUCCESS: [${v.name}] PASSED!`);
        const data = await res.json();
        const b64 = data.data?.[0]?.b64_json;
        if (b64) {
          const out = `C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_${v.name}.webp`;
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

testKissVariations();