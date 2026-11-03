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

async function testBalancedPrompt() {
  const p = `ultra-realistic 4K editorial photography comic book page layout structured as a 2x2 grid of four distinct sequential frames separated by crisp white comic gutters, live-action cinematic movie stills, Hasselblad portrait, dewy glowing skin, photorealistic cinematic lighting.
CHARACTER CONTINUITY: Namita Thapar likeness (gorgeous glamorous Indian businesswoman CEO, warm golden honey Indian skin tone, smooth glowing radiant complexion, youthful soft facial contours, plump cheeks, large expressive dark brown almond eyes with kohl eyeliner, perfectly arched dark eyebrows, rich crimson red lipstick, voluminous glossy black wavy blow-dried hair cascading over shoulders, crisp tailored red silk button-down shirt tucked tight into black high-waisted pencil skirt, towering 4-5 inch red pointed stiletto high heels with red soles. Strictly zero gaunt hollow cheeks, zero elderly wrinkles).
Top-left frame depicts: Wide shot inside executive penthouse office. Namita Thapar seated in leather executive armchair with legs crossed showing towering red stiletto heels, looking cold and detached. In front of desk, female subordinate Priya in dark suit kneeling on marble floor, featuring Namita speech balloon saying "Sit on the floor, Priya."
Top-right frame depicts: Medium shot. Namita Thapar seated in executive chair looking down coldly at Priya kneeling before her desk on marble floor, featuring Namita speech balloon saying "Come closer... you know what you did wrong."
Bottom-left frame depicts: Macro ground-level perspective. Namita's foot wearing a polished red stiletto high heel planted on marble. Female subordinate kneeling low, gently kissing the pointed toe of the red stiletto shoe in deep respect, featuring Namita speech balloon saying "Good... show your respect."
Bottom-right frame depicts: Close-up portrait of Namita Thapar with warm golden Indian complexion, smooth glowing cheeks, calmly applying crimson red lipstick with gold lipstick tube, cold bored eyes looking toward window while subordinate remains in blurred background, featuring Namita speech balloon saying "From tomorrow, your department reports to me. Understood?"
clean white comic gutters separating sequential frames, expressive comic speech balloons with dialogue, photorealistic live-action photography. Strictly zero cartoon drawing, zero 2D cel-shading, zero sketch.`;

  console.log('Testing balanced 4-panel prompt with shoe kiss...');
  const res = await fetch('https://api.meta.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'muse-image-1.0', prompt: p, n: 1, size: '1024x1024' })
  });

  console.log('Status:', res.status);
  if (!res.ok) {
    console.log('Error:', await res.text());
    return;
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (b64) {
    const out = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/ep4_heel_kiss_success.webp';
    fs.writeFileSync(out, Buffer.from(b64, 'base64'));
    console.log('>>> SUCCESS! Saved to:', out);

    // Update public asset
    const publicPath = path.resolve(process.cwd(), 'public/episodes/ep4_namita_office_ritual.webp');
    fs.writeFileSync(publicPath, Buffer.from(b64, 'base64'));
    console.log('Overwritten public asset:', publicPath);
  }
}

testBalancedPrompt();
