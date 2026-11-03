const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function compositePovIntoEp4() {
  const basePagePath = path.resolve(process.cwd(), 'public/episodes/ep4_namita_office_ritual.webp');
  const povPath = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_p3_pov_look_down_at_reverence.webp';

  const baseBuf = fs.readFileSync(basePagePath);
  const povBuf = fs.readFileSync(povPath);

  // Panel 3 coordinates in base page:
  // Left: 27, Top: 804, Right: 782, Bottom: 1574
  const panelWidth = 782 - 27; // 755
  const panelHeight = 1574 - 804; // 770

  const croppedPov = await sharp(povBuf)
    .extract({ left: 30, top: 30, width: 1540, height: 1540 })
    .resize(panelWidth, panelHeight, { fit: 'cover' })
    .toBuffer();

  const composited = await sharp(baseBuf)
    .composite([
      {
        input: croppedPov,
        left: 27,
        top: 804
      }
    ])
    .webp({ quality: 90 })
    .toBuffer();

  const outArtifact = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/ep4_grounded_pov_master.webp';
  fs.writeFileSync(outArtifact, composited);
  console.log('Saved grounded POV master artifact:', outArtifact);

  fs.writeFileSync(basePagePath, composited);
  console.log('Overwritten public asset:', basePagePath);
}

compositePovIntoEp4().catch(console.error);
