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
      name: 'natural corporate reverence',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level view inside 100th-floor corner executive penthouse office with dark mahogany desk and panoramic city skyline windows. Namita\'s pointed red stiletto high heel shoe is planted firmly flat on polished marble floor. Beside the shoe, senior subordinate Priya in dark corporate suit is kneeling respectfully on marble, bowing down with hands flat on marble, gently kissing the red stiletto shoe in deep respect. Natural gravity, realistic human anatomy, grounded shoe, warm penthouse office lighting, marble reflections. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 50mm photo.'
    },
    {
      name: 'seated executive desk framing',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Low-angle close-up inside luxury corner office. Seated CEO Namita\'s red stiletto shoe rests flat on marble floor near mahogany desk. Subordinate Priya kneeling on marble bows low with hands on floor, lips touching the tip of the red stiletto in deep respect. Daytime skyline visible through office window. Natural realistic perspective, grounded feet. Featuring Namita speech balloon saying "Good... show your respect."'
    },
    {
      name: 'bowing low to grounded shoe',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level perspective inside 100th-floor executive suite. Red patent leather stiletto high heel planted upright on marble floor. Subordinate woman in tailored suit kneeling on marble bows down with hands on floor, gently kissing the pointed toe of the shoe in reverence. In background: base of leather executive chair, mahogany desk, sunny city skyline. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 50mm.'
    }
  ];

  for (const t of tests) {
    console.log(`\nTesting [${t.name}]...`);
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
          const out = `C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_grounded_${t.name.replace(/\s+/g, '_')}.webp`;
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

testVariations();
