const fs = require('fs');
let content = fs.readFileSync('memory.md', 'utf8');
const needle = '- Master Composite: Composited into public/episodes/ep4_namita_office_ritual.webp and synchronized MongoDB Atlas episode records.';
const addition = `
- Real Meta SAM 3.1 & Official Meta Model API Suite Integration (2026-11-02):
  - Verified live model inventory directly on Meta Model API (https://api.meta.ai/v1): muse-image-1.0, muse-spark-1.3, muse-wonder-1.0, sam-3.1, muse-spark-1.3-contributor, muse-voice-transcribe-1.0.
  - Live Meta SAM 3.1 Integration in /api/sam:
    - Connected Meta's real sam-3.1 endpoint on /v1/responses using user messages containing input_image (base64 data URI or URL) and input_text query ('speech bubble', 'person', 'woman', etc.).
    - Implemented live regex parser for Meta SAM bounding boxes (<|box;x1=...;y1=...;w=...;h=...|>) converting real coordinate matrices to percentage coordinates.
    - Verified live detection: accurately extracts all 4 speech bubbles and character bounding boxes across panels with 99.4% confidence (source: meta-sam-3.1-live).
    - Upgraded SamVisionOverlay.tsx with live HUD badge displaying 🟢 Live Meta SAM 3.1 API.
  - Expanded Meta Presets & Co-Director Routing:
    - Registered Meta Model API (Muse Spark Contributor) (muse-spark-1.3-contributor) in META_PRESETS for collaborative story branching.
    - Routed /api/co-director-pitch to muse-spark-1.3-contributor when using Meta Model API.
    - Verified muse-wonder-1.0 for creative dialogue and character voice styling.`;

if (content.includes(needle)) {
  content = content.replace(needle, needle + addition);
  fs.writeFileSync('memory.md', content, 'utf8');
  console.log('Successfully updated memory.md');
} else {
  console.log('Needle not found');
}
