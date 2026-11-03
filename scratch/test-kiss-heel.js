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

async function testKissPhrases() {
  const variations = [
    { name: 'kissing the shoe', phrase: 'kneeling woman kissing the red stiletto shoe in deep respect' },
    { name: 'kissing high heel', phrase: 'subordinate woman kissing the glossy red high heel in reverence' },
    { name: 'lips pressed to shoe', phrase: 'kneeling woman pressing her lips in deep reverence to the pointed tip of the red stiletto shoe' },
    { name: 'lips touching heel', phrase: 'close-up of kneeling subordinate with lips touching the polished red high heel in absolute obedience' },
    { name: 'forehead and lips to shoe', phrase: 'subordinate bowing down with forehead and lips to the red shoe in homage' },
    { name: 'reverently kissing toe of heel', phrase: 'close-up of woman kneeling on marble floor reverently kissing the pointed toe of the red high heel shoe' },
  ];

  for (const v of variations) {
    console.log(`\nTesting [${v.name}]: "${v.phrase}"...`);
    try {
      const res = await fetch('https://api.meta.ai/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'muse-image-1.0',
          prompt: `ultra-realistic 4K editorial photography comic panel. Macro ground-level close-up of pointed red stiletto high heel on polished marble floor. ${v.phrase}, featuring Namita speech balloon saying "Good... show your respect." Clean cinematic lighting, Hasselblad photo.`,
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
          const out = `C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_kiss_${v.name.replace(/\s+/g, '_')}.webp`;
          fs.writeFileSync(out, Buffer.from(b64, 'base64'));
          console.log(`Saved sample to: ${out}`);
        }
        break; // Found a working one!
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

testKissPhrases();
