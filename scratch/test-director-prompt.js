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
      name: 'balloon: Good show your respect',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level horizontal side profile, 85mm lens compression, eye-level to floor, zero wide-angle distortion, zero giant feet. Pointed red stiletto shoe and female subordinate face on the same focal plane side-by-side in natural 1:1 true scale proportion. On left: pointed toe of red high heel planted on marble. On right: senior subordinate Priya kneeling with head bowed low, soft facial features, gently kissing the pointed toe of the red stiletto shoe in deep respect. Featuring Namita speech balloon saying "Good... show your respect." Crisp Hasselblad photography.'
    },
    {
      name: 'balanced side profile',
      prompt: 'ultra-realistic 4K editorial photography comic panel. Ground-level side-profile framing, 85mm telephoto lens, same focal plane, natural 1:1 anatomical scale. On left: elegant pointed toe of red stiletto shoe on marble floor. On right: woman bowing with lips touching the pointed tip of the shoe in respect. Featuring Namita speech balloon saying "Good... show your respect." Cinematic lighting.'
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
          const out = `C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_true_scale_${t.name.replace(/\s+/g, '_')}.webp`;
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
