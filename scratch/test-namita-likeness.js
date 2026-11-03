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

async function testLikeness() {
  const prompt = 'ultra-realistic 4K editorial photography comic panel. Medium close-up portrait of gorgeous glamorous Indian businesswoman CEO Namita Thapar, warm golden honey Indian skin tone, smooth glowing radiant complexion, youthful soft facial contours, plump cheeks, large expressive dark brown almond eyes with kohl eyeliner, perfectly arched dark eyebrows, applying rich crimson red lipstick with gold lipstick tube, voluminous glossy black wavy blow-dried hair styled over shoulders, wearing crisp tailored red silk button-down shirt. In background through penthouse floor-to-ceiling glass window, blurred corporate subordinate kneeling on marble floor and sunny Mumbai skyline. Speech balloon above her saying "From tomorrow, your department reports to me. Understood?". Hasselblad portrait, high-glam Bollywood executive aesthetic, dewy flawless skin, pristine cinematic lighting. Strictly zero hollow cheeks, zero gaunt face, zero wrinkles, zero elderly features, zero cartoon.';

  console.log('Testing refined Namita Thapar prompt...');
  let res;
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    res = await fetch('https://api.meta.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'muse-image-1.0',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      })
    });
    console.log(`Attempt ${attempts} - Status: ${res.status}`);
    if (res.ok) break;
    if (res.status === 503 || res.status === 502) {
      console.log('503 Service unavailable, waiting 4 seconds...');
      await new Promise(r => setTimeout(r, 4000));
    } else {
      break;
    }
  }

  if (!res.ok) {
    console.log('Failed:', await res.text());
    return;
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (b64) {
    const outPath = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_namita_true_likeness.webp';
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log('Saved to', outPath);
  }
}
testLikeness();
