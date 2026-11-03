const fs = require('fs');
const path = require('path');
const { MongoClient } = require(path.resolve(process.cwd(), 'node_modules/mongodb'));

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

async function sync() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('mindstrip');
  const worldsCol = db.collection('worlds');

  const worldIds = ['world-1793423242997', 'world-fork-1793537920934'];
  for (const wid of worldIds) {
    const w = await worldsCol.findOne({ id: wid });
    if (!w) continue;
    const episodes = (w.episodes || []).map(ep => {
      if (ep.episodeNumber === 4 || ep.id === 'strip-1793554793674' || ep.id === 'strip-1793556305259') {
        return {
          ...ep,
          pageImageUrl: '/episodes/ep4_namita_office_ritual.webp',
          generationNotice: 'Synthesized with Meta Muse Image (Locked Authentic Namita Thapar Likeness, 4K Cinematic Realism + Speech Balloons)',
          updatedAt: new Date().toISOString()
        };
      }
      return ep;
    });

    const characters = (w.characters || []).map(c => {
      if (c.name.toLowerCase().includes('namita')) {
        return {
          ...c,
          appearance: 'Gorgeous glamorous Indian businesswoman CEO Namita Thapar — warm golden honey Indian skin tone, smooth glowing radiant complexion, youthful soft facial contours, plump cheeks (strictly zero hollow gaunt cheeks, zero elderly wrinkles), large expressive dark brown almond eyes with kohl eyeliner, perfectly arched dark eyebrows, rich crimson red lipstick, voluminous glossy black wavy blow-dried hair cascading over shoulders. Beautiful, radiant, and terrifyingly dominant queen presence that commands absolute reverence.',
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    await worldsCol.updateOne(
      { id: wid },
      { $set: { episodes, characters, updatedAt: new Date().toISOString() } }
    );
    console.log('Synced world:', wid);
  }

  await client.close();
}

sync().catch(console.error);
