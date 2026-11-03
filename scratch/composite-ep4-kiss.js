const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function compositeKissIntoEp4() {
  const basePagePath = path.resolve(process.cwd(), 'public/episodes/ep4_namita_office_ritual.webp');
  const kissPath = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/test_worn_kiss_lips_to_pointed_toe.webp';

  const baseBuf = fs.readFileSync(basePagePath);
  const kissBuf = fs.readFileSync(kissPath);

  const panelWidth = 782 - 27; // 755
  const panelHeight = 1574 - 804; // 770

  const croppedKiss = await sharp(kissBuf)
    .extract({ left: 30, top: 30, width: 1539, height: 1540 })
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

  const outArtifact = 'C:/Users/vivek/.gemini/antigravity/brain/63ce3c5c-5581-47ec-bc06-8203fd07ae09/ep4_with_composite_kiss.webp';
  fs.writeFileSync(outArtifact, composited);
  console.log('Saved composited artifact:', outArtifact);

  fs.writeFileSync(basePagePath, composited);
  console.log('Overwritten public asset:', basePagePath);
}

compositeKissIntoEp4().catch(console.error);
