const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function compositeV3IntoEp4() {
  const basePagePath = path.resolve(process.cwd(), 'public/episodes/ep4_namita_office_ritual.webp');
  const v3Path = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_v3_worn_on_foot_resting_flat.webp';

  const baseBuf = fs.readFileSync(basePagePath);
  const v3Buf = fs.readFileSync(v3Path);

  // Panel 3 coordinates in 1600x1600 base page:
  // Left: 27, Top: 804, Right: 782, Bottom: 1574
  const panelWidth = 782 - 27; // 755
  const panelHeight = 1574 - 804; // 770

  const croppedV3 = await sharp(v3Buf)
    .extract({ left: 25, top: 25, width: 1550, height: 1550 })
    .resize(panelWidth, panelHeight, { fit: 'cover' })
    .toBuffer();

  const composited = await sharp(baseBuf)
    .composite([
      {
        input: croppedV3,
        left: 27,
        top: 804
      }
    ])
    .webp({ quality: 90 })
    .toBuffer();

  const outArtifact = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/ep4_v3_grounded_kiss_master.webp';
  fs.writeFileSync(outArtifact, composited);
  console.log('Saved corrected v3 master artifact:', outArtifact);
}

compositeV3IntoEp4().catch(console.error);