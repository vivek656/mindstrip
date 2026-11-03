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

async function testGroundedSideKiss() {
  const prompt = 'ultra-realistic 4K editorial photography comic panel. Ground-level side-angle shot inside 100th-floor luxury executive penthouse corner office. Seated in her leather executive chair beside her mahogany desk, Namita has both pointed red patent leather stiletto heels firmly planted flat on the polished marble floor. On the marble floor beside her feet, senior subordinate Priya in a tailored dark corporate uniform is fully prostrated on her knees, hands flat on the polished marble floor, bowing her head down to the floor, gently kissing the glossy red shoe resting flat on the marble. In background: base of executive mahogany desk, floor-to-ceiling glass windows with city skyline, natural office lighting, pristine marble floor reflections. Realistic human anatomy, natural gravity, grounded shoe firmly on floor, zero floating shoe, zero tilted shoe. Featuring Namita speech balloon saying "Good... show your respect." Hasselblad portrait.';

  console.log('Testing grounded side kiss with office background...');
  try {
    const res = await fetch('https://api.meta.ai/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'muse-image-1.0',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      })
    });

    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      const b64 = data.data?.[0]?.b64_json;
      if (b64) {
        const out = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_grounded_side_kiss_perfect.webp';
        fs.writeFileSync(out, Buffer.from(b64, 'base64'));
        console.log('Saved to', out);
      }
    } else {
      console.log('Error:', await res.text());
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testGroundedSideKiss();
