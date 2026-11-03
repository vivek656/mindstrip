const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function compositeTrueScaleIntoEp4() {
  const basePagePath = path.resolve(process.cwd(), 'public/episodes/ep4_namita_office_ritual.webp');
  const trueScaleKissPath = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_priya_true_scale.webp';

  const baseBuf = fs.readFileSync(basePagePath);
  const kissBuf = fs.readFileSync(trueScaleKissPath);

  // Panel 3 coordinates in base page:
  // Left: 27, Top: 804, Right: 782, Bottom: 1574
  const panelWidth = 782 - 27; // 755
  const panelHeight = 1574 - 804; // 770

  // The true scale image is 1600x1600. Let's inspect its inner borders or resize directly
  const croppedKiss = await sharp(kissBuf)
    .extract({ left: 30, top: 30, width: 1540, height: 1540 })
    .resize(panelWidth, panelHeight, { fit: 'cover' })
    .toBuffer();

  const composited = await sharp(baseBuf)
    .composite([
      {
        input: croppedKiss,
        left: 27,
        top: 804
      }
    ])
    .webp({ quality: 90 })
    .toBuffer();

  const outArtifact = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/ep4_true_scale_master.webp';
  fs.writeFileSync(outArtifact, composited);
  console.log('Saved master composited artifact:', outArtifact);

  fs.writeFileSync(basePagePath, composited);
  console.log('Overwritten public asset:', basePagePath);
}

compositeTrueScaleIntoEp4().catch(console.error);
