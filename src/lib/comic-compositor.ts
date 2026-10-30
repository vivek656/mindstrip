import { ComicPanel, SpeechBubble } from '@/types/comic';

/**
 * Comic Page Compositor
 * 
 * Flattens sequential comic artwork and typographic speech bubbles into a single,
 * self-contained, code-independent comic page image (.png / .jpg).
 * 
 * Anyone downloading or viewing this image will see the complete comic with
 * crisp dialogue balloons and sound effects permanently baked into the image pixels.
 */

export interface CompositeOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Word-wraps text inside an HTML5 Canvas context.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draws a rounded rectangle bubble with an authentic comic speech tail.
 */
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  tailX: number,
  tailY: number,
  isThought = false
) {
  ctx.save();
  ctx.beginPath();

  // Bubble body
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

  // Speech tail
  if (!isThought) {
    const tailBaseLeft = x + width * 0.3;
    const tailBaseRight = x + width * 0.45;
    ctx.lineTo(tailBaseRight, y + height);
    ctx.lineTo(tailX, tailY);
    ctx.lineTo(tailBaseLeft, y + height);
  }

  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Reset shadow for border
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#181716';
  ctx.stroke();

  // Thought bubbles small indicator circles
  if (isThought) {
    ctx.beginPath();
    ctx.arc(tailX, tailY - 12, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(tailX - 4, tailY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws an energetic comic sound effect badge (e.g. ⚡ KRAK!, 💥 BAM!).
 */
function drawSoundEffectBadge(
  ctx: CanvasRenderingContext2D,
  sfx: string,
  centerX: number,
  centerY: number
) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(-0.06); // slight -3.5 deg comic tilt

  const cleanText = sfx.toUpperCase().replace(/^⚡\s*/, '');
  const displayText = `⚡ ${cleanText}`;

  ctx.font = '900 16px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Impact", sans-serif';
  const metrics = ctx.measureText(displayText);
  const paddingX = 14;
  const paddingY = 8;
  const badgeWidth = metrics.width + paddingX * 2;
  const badgeHeight = 28;

  // Draw background badge
  ctx.beginPath();
  const rx = -badgeWidth / 2;
  const ry = -badgeHeight / 2;
  const r = 6;
  ctx.moveTo(rx + r, ry);
  ctx.lineTo(rx + badgeWidth - r, ry);
  ctx.quadraticCurveTo(rx + badgeWidth, ry, rx + badgeWidth, ry + r);
  ctx.lineTo(rx + badgeWidth, ry + badgeHeight - r);
  ctx.quadraticCurveTo(rx + badgeWidth, ry + badgeHeight, rx + badgeWidth - r, ry + badgeHeight);
  ctx.lineTo(rx + r, ry + badgeHeight);
  ctx.quadraticCurveTo(rx, ry + badgeHeight, rx, ry + badgeHeight - r);
  ctx.lineTo(rx, ry + r);
  ctx.quadraticCurveTo(rx, ry, rx + r, ry);
  ctx.closePath();

  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = '#fbbf24'; // bright comic amber
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#181716';
  ctx.stroke();

  // Text
  ctx.fillStyle = '#181716';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayText, 0, 1);

  ctx.restore();
}

/**
 * Bakes comic panels (dialogues, speech bubbles, sound effects) directly onto
 * the base sequential comic artwork canvas, producing a single flattened image data URL.
 */
export async function bakeComicPage(
  imageUrl: string,
  panels: ComicPanel[],
  layoutStyle: '1-panel' | '2-panel' | '3-panel' | '4-panel' = '4-panel',
  options: CompositeOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = options.width || img.naturalWidth || 1024;
        const height = options.height || img.naturalHeight || 1024;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(imageUrl); // fallback
        }

        // 1. Draw base comic artwork
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Calculate quadrant / panel boundaries
        const panelCount = panels.length || 4;
        const effectiveLayout = layoutStyle || (panelCount === 1 ? '1-panel' : panelCount === 2 ? '2-panel' : panelCount === 3 ? '3-panel' : '4-panel');

        interface PanelBounds {
          x: number;
          y: number;
          width: number;
          height: number;
        }

        const bounds: PanelBounds[] = [];

        if (effectiveLayout === '1-panel') {
          bounds.push({ x: 0, y: 0, width, height });
        } else if (effectiveLayout === '2-panel') {
          bounds.push({ x: 0, y: 0, width: width / 2, height });
          bounds.push({ x: width / 2, y: 0, width: width / 2, height });
        } else if (effectiveLayout === '3-panel') {
          bounds.push({ x: 0, y: 0, width, height: height / 3 });
          bounds.push({ x: 0, y: height / 3, width, height: height / 3 });
          bounds.push({ x: 0, y: (height * 2) / 3, width, height: height / 3 });
        } else {
          // 4-panel (2x2 grid)
          const halfW = width / 2;
          const halfH = height / 2;
          bounds.push({ x: 0, y: 0, width: halfW, height: halfH }); // Top-Left
          bounds.push({ x: halfW, y: 0, width: halfW, height: halfH }); // Top-Right
          bounds.push({ x: 0, y: halfH, width: halfW, height: halfH }); // Bottom-Left
          bounds.push({ x: halfW, y: halfH, width: halfW, height: halfH }); // Bottom-Right
        }

        // 3. Render dialogue bubbles and sound effects onto each panel
        panels.forEach((p, idx) => {
          const bound = bounds[idx];
          if (!bound) return;

          const bubbles = p.bubbles || [];
          let currentY = bound.y + 18;

          bubbles.forEach((b) => {
            const isThought = b.type === 'thought';
            const speakerLabel = b.speaker.toUpperCase();

            // Set up font for measurement
            const textFontSize = Math.max(12, Math.round(width * 0.013));
            const lineHeight = textFontSize * 1.35;
            ctx.font = `600 ${textFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

            const maxBubbleWidth = bound.width * 0.82;
            const lines = wrapText(ctx, `"${b.text}"`, maxBubbleWidth - 24);

            const bubbleHeight = 22 + lines.length * lineHeight + 12;
            const bubbleWidth = Math.min(
              maxBubbleWidth,
              Math.max(
                ...lines.map((l) => ctx.measureText(l).width),
                ctx.measureText(speakerLabel).width + 30
              ) + 26
            );

            const bubbleX = bound.x + 18;
            const bubbleY = currentY;

            // Tail coordinates pointing down towards the scene
            const tailX = bubbleX + bubbleWidth * 0.38;
            const tailY = bubbleY + bubbleHeight + 14;

            // Draw bubble
            drawSpeechBubble(
              ctx,
              bubbleX,
              bubbleY,
              bubbleWidth,
              bubbleHeight,
              12,
              tailX,
              tailY,
              isThought
            );

            // Draw Speaker Label
            ctx.save();
            ctx.font = `800 ${Math.max(9, Math.round(textFontSize * 0.75))}px "SF Pro Text", -apple-system, sans-serif`;
            ctx.fillStyle = '#52525b'; // zinc-600
            ctx.fillText(speakerLabel, bubbleX + 12, bubbleY + 14);

            // Draw Dialogue Lines
            ctx.font = `600 ${textFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.fillStyle = '#09090b'; // zinc-950
            lines.forEach((line, lineIdx) => {
              ctx.fillText(
                line,
                bubbleX + 12,
                bubbleY + 30 + lineIdx * lineHeight
              );
            });
            ctx.restore();

            currentY += bubbleHeight + 14;
          });

          // Draw Sound Effect if present
          if (p.soundEffect) {
            const sfxX = bound.x + bound.width - 64;
            const sfxY = bound.y + bound.height - 28;
            drawSoundEffectBadge(ctx, p.soundEffect, sfxX, sfxY);
          }
        });

        // 4. Return baked composite image data URL
        const bakedDataUrl = canvas.toDataURL('image/jpeg', options.quality || 0.95);
        resolve(bakedDataUrl);
      } catch (err) {
        console.warn('Failed to bake comic page canvas, falling back to raw image:', err);
        resolve(imageUrl);
      }
    };

    img.onerror = () => {
      resolve(imageUrl); // fallback to raw image
    };

    img.src = imageUrl;
  });
}
