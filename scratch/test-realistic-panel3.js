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

async function testRealisticPanel3() {
  const variations = [
    {
      name: 'natural office bow to grounded shoe',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level perspective inside luxury 100th-floor corner executive penthouse suite. Seated CEO Namita in black knee-length pencil skirt with her pointed red patent leather stiletto high heel firmly planted flat on the polished marble floor. Beside her desk, 30-year-old subordinate Priya in dark corporate suit is kneeling low on marble, hands flat on the floor, head bowed down with forehead and lips resting against the pointed red shoe in deep reverence and submission. In background: base of executive mahogany desk, black leather chair, panoramic city skyline window, warm office lighting, marble reflections. Physically grounded, natural human anatomy, zero floating shoe, zero tilted shoe. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 50mm.'
    },
    {
      name: 'pov look down at reverence',
      prompt: 'ultra-realistic 4K editorial photography comic panel. High-angle perspective looking down from executive chair inside corner penthouse office. Hem of Namita\'s black pencil skirt and pointed red stiletto heel planted firmly on polished marble floor. Right before the shoe, senior subordinate Priya in dark tailored corporate uniform is prostrated low on her knees, forehead and hands resting on the marble in deep reverence beside the red shoe. Beautiful reflections on marble, mahogany desk edge. Authentic live-action photography, natural anatomy, realistic gravity. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad 35mm.'
    }
  ];

  for (const v of variations) {
    console.log(`\nTesting variation [${v.name}]...`);
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
          const out = `C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_p3_${v.name.replace(/\s+/g, '_')}.webp`;
          fs.writeFileSync(out, Buffer.from(b64, 'base64'));
          console.log('Saved to', out);
        }
      } else {
        console.log('Error:', (await res.text()).slice(0, 160));
      }
    } catch (e) {
      console.error(e.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

testRealisticPanel3();
