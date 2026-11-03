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

async function testPerfectOfficeKiss() {
  const variations = [
    {
      name: 'grounded low angle ritual kiss',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Low-angle intimate close-up on polished marble floor inside 100th-floor corner executive penthouse suite. Seated in her black leather executive chair near mahogany desk, Namita has her pointed red patent leather stiletto shoe resting flat and firm on the marble floor. Subordinate Priya (30-year-old attractive Indian woman in dark tailored business suit with hair in neat bun) is kneeling on both knees on the marble floor, hands placed flat on the marble beside the shoe, head bowed down low, lips pressed against the glossy pointed toe of Namita\'s red stiletto shoe in deep corporate reverence and obedience. Natural 1:1 scale, authentic human anatomy, grounded shoe with sole flat on marble, zero floating shoes, beautiful warm reflections on Italian marble floor, dark mahogany executive desk in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 50mm portrait.'
    },
    {
      name: 'side profile grounded kiss',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side-profile shot inside executive penthouse office. Namita\'s red patent stiletto high heel shoe is planted flat on the marble floor with red sole resting on the ground. 30-year-old senior subordinate Priya in dark suit is kneeling on the floor beside it, hands flat on the marble, bowing her head down with her lips kissing the pointed toe of the red stiletto shoe in deep respect. Natural 1:1 proportion, head and shoe on same scale, grounded on marble with clear reflections, base of mahogany desk and city window visible in background. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 85mm photo.'
    }
  ];

  for (const v of variations) {
    console.log(`\nTesting [${v.name}]...`);
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
          const out = `C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_kiss_${v.name.replace(/\s+/g, '_')}.webp`;
          fs.writeFileSync(out, Buffer.from(b64, 'base64'));
          console.log('Saved to', out);
        }
        break;
      } else {
        console.log('Error:', (await res.text()).slice(0, 160));
      }
    } catch (e) {
      console.error(e.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

testPerfectOfficeKiss();
