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

async function renderFullEp4WithKiss() {
  const p = `ultra-realistic 4K editorial photography comic book page layout structured as a 2x2 grid of four distinct sequential frames separated by crisp white comic gutters, live-action cinematic movie stills, Hasselblad portrait, dewy glowing skin, photorealistic cinematic lighting.
CHARACTER CONTINUITY: Namita Thapar likeness (gorgeous glamorous Indian businesswoman CEO, warm golden honey Indian skin tone, smooth glowing radiant complexion, youthful soft facial contours, plump cheeks, large expressive dark brown almond eyes with kohl eyeliner, perfectly arched dark eyebrows, rich crimson red lipstick, voluminous glossy black wavy blow-dried hair cascading over shoulders, crisp tailored red silk button-down shirt tucked tight into black high-waisted pencil skirt, towering 4-5 inch red pointed stiletto high heels with red soles. Strictly zero gaunt hollow cheeks, zero elderly wrinkles).
Top-left frame depicts: Wide shot inside 100th-floor corner executive penthouse suite. Namita Thapar seated in leather executive armchair with legs crossed showing towering red stiletto heels, looking cold and detached. In front of her desk on polished marble floor, subordinate Priya in dark corporate uniform kneeling prostrated low, featuring Namita speech balloon saying "Sit on the floor, Priya."
Top-right frame depicts: Medium shot. Namita Thapar seated in executive chair looking down coldly at Priya kneeling respectfully before her desk on the marble floor, featuring Namita speech balloon saying "Come closer... you know what you did wrong."
Bottom-left frame depicts: Macro ground-level perspective. Namita's foot in a towering pointed red stiletto high heel planted on the marble floor. Subordinate woman kneeling prostrated low, gently kissing the pointed red stiletto shoe in deep respect and obedience, featuring Namita speech balloon saying "Good... show your respect."
Bottom-right frame depicts: Close-up portrait of Namita Thapar with warm golden Indian complexion, smooth glowing cheeks, calmly applying crimson red lipstick with gold lipstick tube, cold bored eyes looking toward window while subordinate remains in blurred background, featuring Namita speech balloon saying "From tomorrow, your department reports to me. Understood?"
clean white comic gutters separating sequential frames, expressive comic speech balloons with dialogue, photorealistic live-action photography. Strictly zero cartoon drawing, zero 2D cel-shading, zero sketch.`;

  console.log('Rendering 4-panel Episode 4 with Namita likeness + actual shoe kiss...');
  let res;
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    res = await fetch('https://api.meta.ai/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'muse-image-1.0', prompt: p, n: 1, size: '1024x1024' })
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
    console.error('Failed:', await res.text());
    return;
  }

  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    console.error('No b64 returned');
    return;
  }

  const buf = Buffer.from(b64, 'base64');
  const artifactPath = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/ep4_namita_kiss_on_heels_4panel.webp';
  fs.writeFileSync(artifactPath, buf);
  console.log('Saved artifact:', artifactPath);

  // Update public/episodes
  const publicPath = path.resolve(process.cwd(), 'public/episodes/ep4_namita_office_ritual.webp');
  fs.writeFileSync(publicPath, buf);
  console.log('Overwritten public asset:', publicPath);
}

renderFullEp4WithKiss().catch(console.error);
