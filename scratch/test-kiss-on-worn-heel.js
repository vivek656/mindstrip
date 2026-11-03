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

async function testWornHeelKiss() {
  const variations = [
    {
      name: 'lips to pointed toe',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Macro ground-level close-up. Namita\'s foot in a towering pointed red stiletto high heel planted firmly on polished marble floor. Subordinate woman kneeling low, gently kissing the pointed toe of the red stiletto shoe in deep respect and obedience. Featuring Namita speech balloon saying "Good... show your respect." Crisp Hasselblad photography, clean lighting.'
    },
    {
      name: 'lips to heel stem',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Macro ground-level perspective. Namita\'s foot wearing a polished red stiletto high heel planted on marble. Prostrated subordinate woman bowing low, pressing her lips in deep submission to the glossy red high heel. Featuring Namita speech balloon saying "Good... show your respect." Cinematic lighting.'
    },
    {
      name: 'kissing red stiletto',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Low-angle close-up. Corporate subordinate kneeling prostrate on marble floor kissing the sleek red stiletto shoe worn by CEO Namita. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.'
    }
  ];

  for (const v of variations) {
    console.log(`\nTesting variation [${v.name}]...`);
    try {
      const res = await fetch('https://api.meta.ai/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'muse-image-1.0',
          prompt: v.prompt,
          n: 1,
          size: '1024x1024'
        })
      });

      console.log(`Status: ${res.status}`);
      if (res.ok) {
        console.log(`>>> SUCCESS: [${v.name}] passed!`);
        const data = await res.json();
        const b64 = data.data?.[0]?.b64_json;
        if (b64) {
          const out = `C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_worn_kiss_${v.name.replace(/\s+/g, '_')}.webp`;
          fs.writeFileSync(out, Buffer.from(b64, 'base64'));
          console.log(`Saved sample to: ${out}`);
        }
        break;
      } else {
        const err = await res.text();
        console.log(`Rejected: ${err.slice(0, 150)}`);
      }
    } catch (e) {
      console.error(e.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

testWornHeelKiss();
