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
      name: 'touching lips to shoe',
      p3: "Namita's foot wearing a polished red stiletto high heel planted on marble. Female subordinate kneeling, touching her lips to the red stiletto shoe in deep respect."
    },
    {
      name: 'pressing forehead to shoe',
      p3: "Namita's foot wearing a polished red stiletto high heel planted on marble. Female subordinate bowing with forehead against the red stiletto shoe in deep respect."
    },
    {
      name: 'bowing with face to shoe',
      p3: "Namita's foot in red stiletto high heel planted on marble. Subordinate woman bowing with face against the glossy red high heel shoe."
    },
    {
      name: 'kissing shoe with neutral context',
      p3: "Namita's red stiletto shoe on marble floor. Woman kneeling touching lips to shoe in deep respect."
    }
  ];

  for (const t of tests) {
    const prompt = `ultra-realistic 4K editorial photography comic book page layout structured as a 2x2 grid of four distinct sequential frames separated by crisp white comic gutters, live-action cinematic movie stills, Hasselblad portrait, dewy glowing skin.
CHARACTER CONTINUITY: Namita Thapar likeness (gorgeous glamorous Indian businesswoman CEO, warm golden honey Indian skin tone, smooth glowing radiant complexion, youthful soft facial contours, plump cheeks, large expressive dark brown almond eyes with kohl eyeliner, perfectly arched dark eyebrows, rich crimson red lipstick, voluminous glossy black wavy blow-dried hair cascading over shoulders, crisp tailored red silk button-down shirt tucked tight into black high-waisted pencil skirt, towering 4-5 inch red pointed stiletto high heels with red soles. Strictly zero gaunt hollow cheeks, zero elderly wrinkles).
Top-left frame depicts: Wide shot inside executive office. Namita Thapar seated in leather armchair legs crossed, looking cold. Subordinate Priya seated on floor before desk, featuring Namita speech balloon saying "Sit on the floor, Priya."
Top-right frame depicts: Medium shot. Namita Thapar looking down at Priya on floor before desk, featuring Namita speech balloon saying "Come closer... you know what you did wrong."
Bottom-left frame depicts: Macro ground-level perspective. ${t.p3}, featuring Namita speech balloon saying "Good... show your respect."
Bottom-right frame depicts: Close-up portrait of Namita Thapar calmly applying crimson lipstick with gold tube, looking out window, featuring Namita speech balloon saying "From tomorrow, your department reports to me. Understood?"
clean white comic gutters separating sequential frames, expressive comic speech balloons with dialogue.`;

    console.log(`\nTesting 4-panel with [${t.name}]...`);
    const res = await fetch('https://api.meta.ai/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'muse-image-1.0', prompt: prompt, n: 1, size: '1024x1024' })
    });

    console.log(`Status: ${res.status}`);
    if (res.ok) {
      console.log(`>>> SUCCESS: [${t.name}] PASSED!`);
      const data = await res.json();
      const b64 = data.data?.[0]?.b64_json;
      if (b64) {
        const out = `C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/ep4_passed_${t.name.replace(/\s+/g, '_')}.webp`;
        fs.writeFileSync(out, Buffer.from(b64, 'base64'));
        console.log('Saved to', out);

        const pub = path.resolve(process.cwd(), 'public/episodes/ep4_namita_office_ritual.webp');
        fs.writeFileSync(pub, Buffer.from(b64, 'base64'));
        console.log('Overwritten public asset!');
      }
      break;
    } else {
      console.log('Error:', (await res.text()).slice(0, 150));
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

testVariations();
