import { GeneratedPosterStyle } from './posterStyles';
import { PosterDataSlice, PortfolioIdentity } from './knowledgeParser';

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + '…', x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

export async function exportPosterAsPng(
  style: GeneratedPosterStyle,
  slice: PosterDataSlice,
  identity: PortfolioIdentity
): Promise<string> {
  const width = 1920;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // 1. Background Canvas
  ctx.fillStyle = style.bgCanvas;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient glow
  const grad = ctx.createRadialGradient(width * 0.78, height * 0.35, 40, width * 0.78, height * 0.35, 680);
  grad.addColorStop(0, style.accentPrimary + '26');
  grad.addColorStop(1, style.bgCanvas + '00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Outer Poster Frame
  ctx.strokeStyle = style.borderColor;
  ctx.lineWidth = style.borderStyle === 'brutal-offset' ? 4 : 2;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  if (style.borderStyle === 'double-frame' || style.borderStyle === 'ornate-corner') {
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 60, width - 120, height - 120);
  }

  // 3. Top Edition & Style Kicker
  ctx.fillStyle = style.accentPrimary;
  ctx.font = `600 18px ${style.fontMono}`;
  const styleLabel = style.isHybrid
    ? `HYBRID EDITION #${String(style.editionNumber).padStart(3, '0')} · ${style.name.toUpperCase()}`
    : `STYLE #${String(style.id).padStart(2, '0')} · ${style.name.toUpperCase()} · EDITION #${String(style.editionNumber).padStart(3, '0')}`;
  ctx.fillText(styleLabel, 96, 112);

  // Right Kicker: Handle & Domain
  ctx.textAlign = 'right';
  ctx.fillStyle = style.textSecondary;
  ctx.fillText(`${identity.handle} · shamiltp.me · ${identity.location}`, width - 96, 112);
  ctx.textAlign = 'left';

  // Hairline divider
  ctx.strokeStyle = style.borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(96, 136);
  ctx.lineTo(width - 96, 136);
  ctx.stroke();

  // 4. Primary Identity Headline
  ctx.fillStyle = style.textPrimary;
  ctx.font = `700 88px ${style.fontDisplay}`;
  ctx.fillText(identity.fullName, 96, 240);

  ctx.fillStyle = style.accentPrimary;
  ctx.font = `600 28px ${style.fontBody}`;
  ctx.fillText(identity.primaryRole, 96, 286);

  ctx.fillStyle = style.textSecondary;
  ctx.font = `400 20px ${style.fontBody}`;
  ctx.fillText(`${identity.academicStatus} · ${slice.featuredEducation.institution}`, 96, 322);

  // 5. Left Column: Featured Project Dossier Card
  const cardX = 96;
  const cardY = 366;
  const cardW = 1040;
  const cardH = 420;

  if (style.borderStyle === 'brutal-offset') {
    ctx.fillStyle = style.borderColor;
    ctx.fillRect(cardX + 8, cardY + 8, cardW, cardH);
  }

  ctx.fillStyle = style.bgElevated;
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = style.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  ctx.fillStyle = style.accentPrimary;
  ctx.font = `600 16px ${style.fontMono}`;
  ctx.fillText(
    `FEATURED DOSSIER ${slice.focalProject.index} · ${slice.focalProject.category.toUpperCase()}`,
    cardX + 36,
    cardY + 46
  );

  ctx.fillStyle = style.textPrimary;
  ctx.font = `700 36px ${style.fontDisplay}`;
  wrapCanvasText(ctx, slice.focalProject.name, cardX + 36, cardY + 94, cardW - 72, 42, 1);

  ctx.fillStyle = style.textSecondary;
  ctx.font = `600 19px ${style.fontBody}`;
  wrapCanvasText(ctx, slice.focalProject.ownership, cardX + 36, cardY + 134, cardW - 72, 26, 1);

  // Project architectural highlights
  ctx.fillStyle = style.textPrimary;
  ctx.font = `400 19px ${style.fontBody}`;
  let curY = cardY + 178;
  for (const bullet of slice.focalProject.highlights.slice(0, 3)) {
    curY = wrapCanvasText(ctx, `• ${bullet}`, cardX + 36, curY, cardW - 72, 27, 2) + 8;
  }

  // Tech stack row
  ctx.fillStyle = style.accentPrimary;
  ctx.font = `600 17px ${style.fontMono}`;
  const stackLine = slice.focalProject.techStack.join(' · ');
  wrapCanvasText(ctx, stackLine, cardX + 36, cardY + cardH - 36, cardW - 72, 24, 1);

  // 6. Bottom Left Row: Secondary Credential & Skill Matrix
  const bottomY = 824;
  ctx.fillStyle = style.textPrimary;
  ctx.font = `700 22px ${style.fontDisplay}`;
  wrapCanvasText(
    ctx,
    `${slice.featuredHackathon.title} — ${slice.featuredHackathon.result}`,
    96,
    bottomY,
    cardW,
    28,
    1
  );

  ctx.fillStyle = style.textSecondary;
  ctx.font = `400 17px ${style.fontBody}`;
  wrapCanvasText(
    ctx,
    `${slice.featuredHackathon.organizer} · ${slice.featuredExperience.title} @ ${slice.featuredExperience.organization}`,
    96,
    bottomY + 32,
    cardW,
    24,
    1
  );

  ctx.fillStyle = style.accentPrimary;
  ctx.font = `600 15px ${style.fontMono}`;
  wrapCanvasText(
    ctx,
    `${slice.featuredSkillGroup.category}: ${slice.featuredSkillGroup.items.slice(0, 6).join(' · ')}`,
    96,
    bottomY + 64,
    cardW,
    22,
    1
  );

  // 7. Right Column: Portrait Frame + Style DNA
  const imgX = 1188;
  const imgY = 172;
  const imgW = 636;
  const imgH = 614;

  if (style.borderStyle === 'brutal-offset') {
    ctx.fillStyle = style.accentPrimary;
    ctx.fillRect(imgX + 10, imgY + 10, imgW, imgH);
  }

  ctx.fillStyle = style.bgSurface;
  ctx.fillRect(imgX, imgY, imgW, imgH);

  // Load portrait image safely
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = (err) => reject(err);
      el.src = slice.photo.url;
    });

    // Cover crop calculation
    const scale = Math.max(imgW / img.width, imgH / img.height);
    const sw = imgW / scale;
    const sh = imgH / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, imgX, imgY, imgW, imgH);
  } catch {
    // Styled fallback block if image fails
    ctx.fillStyle = style.bgElevated;
    ctx.fillRect(imgX, imgY, imgW, imgH);
    ctx.fillStyle = style.textPrimary;
    ctx.font = `700 48px ${style.fontDisplay}`;
    ctx.fillText('SHAMIL TP', imgX + 48, imgY + imgH / 2);
  }

  ctx.strokeStyle = style.borderColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(imgX, imgY, imgW, imgH);

  // Caption under image
  ctx.fillStyle = style.textPrimary;
  ctx.font = `600 20px ${style.fontDisplay}`;
  ctx.fillText(slice.photo.caption, imgX, bottomY);

  ctx.fillStyle = style.textSecondary;
  ctx.font = `400 17px ${style.fontBody}`;
  wrapCanvasText(ctx, style.description, imgX, bottomY + 32, imgW, 24, 2);

  // Footer contact line
  ctx.fillStyle = style.textSecondary;
  ctx.font = `500 16px ${style.fontMono}`;
  ctx.fillText(
    `${identity.email} · ${identity.phone} · github.com/${identity.handle}`,
    96,
    height - 72
  );

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  const filename = `shamil-tp-poster-${style.slug}-ed${style.editionNumber}.png`;
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return filename;
}
