import { GeneratedPosterStyle } from './posterStyles';
import { PosterDataSlice, PortfolioIdentity } from './knowledgeParser';

export type PosterExportFormat = 'png' | 'jpeg' | 'webp';

export interface PosterExportOptions {
  format?: PosterExportFormat;
  scale?: number;
  quality?: number;
  targetElement?: HTMLElement | null;
  triggerDownload?: boolean;
}

export interface PosterExportResult {
  filename: string;
  format: PosterExportFormat;
  width: number;
  height: number;
  exportWidth: number;
  exportHeight: number;
  dataUrl: string;
}

const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'georgia',
  'times new roman',
  'times',
  'arial',
  'helvetica',
  'courier new',
  'courier',
  'inherit',
  'initial',
  'unset',
]);

// In-memory caches so repeated exports and duplicate collage plates are instantaneous
const imageDataUrlCache = new Map<string, string>();
const woffDataUrlCache = new Map<string, string>();
let cachedGoogleFontsStylesheetText: string | null = null;

/**
 * Pure helper: Extracts unique custom font family names from an array of CSS font-family strings.
 */
export function extractUsedFontFamilies(fontStrings: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of fontStrings) {
    if (!raw) continue;
    const parts = raw.split(',');
    for (const part of parts) {
      const cleaned = part.replace(/['"]/g, '').trim();
      if (!cleaned) continue;
      const lower = cleaned.toLowerCase();
      if (GENERIC_FONT_FAMILIES.has(lower)) continue;
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(cleaned);
      }
    }
  }

  return result;
}

/**
 * Pure helper: Filters a Google Fonts stylesheet down to only the @font-face blocks
 * matching the font families actually used in the current poster.
 */
export function filterFontFaceBlocks(
  cssText: string,
  usedFamilies: string[]
): string[] {
  if (!cssText || usedFamilies.length === 0) return [];
  const targetSet = new Set(usedFamilies.map((f) => f.toLowerCase().trim()));
  const blocks = cssText.match(/@font-face\s*\{[^}]+\}/g) || [];

  return blocks.filter((block) => {
    const match = block.match(/font-family\s*:\s*['"]?([^;'"]+)['"]?/i);
    if (!match || !match[1]) return false;
    return targetSet.has(match[1].toLowerCase().trim());
  });
}

/**
 * Pure helper: Converts viewport-relative CSS units (vw, dvw, svw, vh, dvh, svh)
 * into exact pixel values matching the live poster's bounding box.
 */
export function convertViewportUnitsInCss(
  cssText: string,
  width: number,
  height: number
): string {
  if (!cssText) return '';
  return cssText
    .replace(
      /(-?\d+(?:\.\d+)?)(dvw|svw|lvw|vw)\b/g,
      (_, numStr: string) => `${((parseFloat(numStr) * width) / 100).toFixed(2)}px`
    )
    .replace(
      /(-?\d+(?:\.\d+)?)(dvh|svh|lvh|vh)\b/g,
      (_, numStr: string) => `${((parseFloat(numStr) * height) / 100).toFixed(2)}px`
    );
}

/**
 * Pure helper: Computes exact aspect-ratio-preserving high-DPI export dimensions.
 */
export function computeExportDimensions(
  rectWidth: number,
  rectHeight: number,
  targetScale = 2
): {
  width: number;
  height: number;
  exportWidth: number;
  exportHeight: number;
  scale: number;
} {
  const width = Math.max(320, Math.round(rectWidth));
  const height = Math.max(320, Math.round(rectHeight));
  const clampedScale = Math.max(1, Math.min(3, targetScale));
  const exportWidth = Math.round(width * clampedScale);
  const exportHeight = Math.round(height * clampedScale);

  return {
    width,
    height,
    exportWidth,
    exportHeight,
    scale: clampedScale,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

async function fetchUrlAsDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  const cached = imageDataUrlCache.get(url) || woffDataUrlCache.get(url);
  if (cached) return cached;

  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'same-origin' });
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    imageDataUrlCache.set(url, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

async function waitForImageReady(img: HTMLImageElement): Promise<void> {
  if (!img.complete) {
    await new Promise<void>((resolve) => {
      const done = () => {
        img.removeEventListener('load', done);
        img.removeEventListener('error', done);
        resolve();
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      setTimeout(done, 3500);
    });
  }
  if (typeof img.decode === 'function') {
    try {
      await img.decode();
    } catch {
      // Ignore decode warning if already decoded
    }
  }
}

async function inlineImageElementToDataUrl(
  img: HTMLImageElement
): Promise<string | null> {
  await waitForImageReady(img);
  const src = img.currentSrc || img.src;
  if (!src) return null;
  if (src.startsWith('data:')) return src;

  const fromFetch = await fetchUrlAsDataUrl(src);
  if (fromFetch) return fromFetch;

  // Fallback: rasterize loaded HTMLImageElement via offscreen canvas
  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = img.naturalWidth;
      offscreen.height = img.naturalHeight;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = offscreen.toDataURL('image/png');
        imageDataUrlCache.set(src, dataUrl);
        return dataUrl;
      }
    } catch {
      // Ignore canvas fallback error
    }
  }
  return src;
}

async function getGoogleFontsStylesheetText(): Promise<string> {
  if (cachedGoogleFontsStylesheetText !== null) {
    return cachedGoogleFontsStylesheetText;
  }

  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  ).filter((link) => link.href && link.href.includes('fonts.googleapis.com'));

  const chunks: string[] = [];
  for (const link of links) {
    try {
      const res = await fetch(link.href);
      if (res.ok) {
        chunks.push(await res.text());
      }
    } catch {
      // Ignore network errors if offline
    }
  }

  cachedGoogleFontsStylesheetText = chunks.join('\n');
  return cachedGoogleFontsStylesheetText;
}

/**
 * Fetches and embeds @font-face rules with base64 data:font/woff2 URLs
 * for the specific font families used in the current poster.
 */
export async function buildEmbeddedFontFaceCss(
  usedFamilies: string[]
): Promise<string> {
  if (usedFamilies.length === 0) return '';

  const rawGoogleCss = await getGoogleFontsStylesheetText();
  const matchingBlocks = filterFontFaceBlocks(rawGoogleCss, usedFamilies);
  if (matchingBlocks.length === 0) return '';

  const inlinedBlocks = await Promise.all(
    matchingBlocks.map(async (block) => {
      const urlMatches = Array.from(
        block.matchAll(/url\((['"]?)(https?:\/\/[^)'"]+)\1\)/g)
      );
      let updatedBlock = block;

      for (const match of urlMatches) {
        const fullMatch = match[0];
        const fontUrl = match[2];
        let fontDataUrl = woffDataUrlCache.get(fontUrl) || null;
        if (!fontDataUrl) {
          fontDataUrl = await fetchUrlAsDataUrl(fontUrl);
          if (fontDataUrl) {
            woffDataUrlCache.set(fontUrl, fontDataUrl);
          }
        }
        if (fontDataUrl) {
          updatedBlock = updatedBlock.replace(
            fullMatch,
            `url("${fontDataUrl}")`
          );
        }
      }
      return updatedBlock;
    })
  );

  return inlinedBlocks.join('\n');
}

/**
 * Pre-warms the active poster's custom fonts in the background so clicking
 * Download is near-instantaneous.
 */
export async function prewarmPosterFonts(fontStrings: string[]): Promise<void> {
  try {
    const families = extractUsedFontFamilies(fontStrings);
    await buildEmbeddedFontFaceCss(families);
  } catch {
    // Non-blocking prewarm
  }
}

function serializeCssRuleList(
  rules: CSSRuleList,
  width: number,
  height: number
): string {
  const out: string[] = [];

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    // Skip external @import rules so SVG remains 100% self-contained
    if (rule.type === CSSRule.IMPORT_RULE) {
      continue;
    }

    // Evaluate @media rules against the live browser window so responsive classes
    // (sm:, md:, lg:, xl:) match the screen 100% regardless of SVG pixel scaling
    if (typeof CSSMediaRule !== 'undefined' && rule instanceof CSSMediaRule) {
      const condition = rule.conditionText || rule.media?.mediaText || '';
      if (!condition || window.matchMedia(condition).matches) {
        const inner = serializeCssRuleList(rule.cssRules, width, height);
        if (inner) out.push(inner);
      }
      continue;
    }

    // Recursively process @supports blocks
    if (typeof CSSSupportsRule !== 'undefined' && rule instanceof CSSSupportsRule) {
      const inner = serializeCssRuleList(rule.cssRules, width, height);
      if (inner) {
        out.push(`@supports (${rule.conditionText}) {\n${inner}\n}`);
      }
      continue;
    }

    // Recursively process Tailwind v4 @layer blocks (@layer theme, base, components, utilities)
    if (
      typeof CSSLayerBlockRule !== 'undefined' &&
      rule instanceof CSSLayerBlockRule
    ) {
      const inner = serializeCssRuleList(rule.cssRules, width, height);
      if (inner) {
        out.push(
          rule.name ? `@layer ${rule.name} {\n${inner}\n}` : `@layer {\n${inner}\n}`
        );
      }
      continue;
    }

    out.push(convertViewportUnitsInCss(rule.cssText, width, height));
  }

  return out.join('\n');
}

function collectSameOriginStylesheetCss(width: number, height: number): string {
  const chunks: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      if (sheet.href && sheet.href.includes('fonts.googleapis.com')) {
        continue;
      }
      const rules = sheet.cssRules;
      if (!rules) continue;
      chunks.push(serializeCssRuleList(rules, width, height));
    } catch {
      // Skip cross-origin stylesheets that cannot be read via cssRules
    }
  }

  return chunks.join('\n');
}

/**
 * Synchronizes essential live computed styles and inlined image data URLs
 * from the live poster DOM tree onto the cloned DOM tree.
 */
async function synchronizeClonedPosterTree(
  liveRoot: HTMLElement,
  cloneRoot: HTMLElement
): Promise<string[]> {
  const liveNodes: Element[] = [
    liveRoot,
    ...Array.from(liveRoot.querySelectorAll('*')),
  ];
  const cloneNodes: Element[] = [
    cloneRoot,
    ...Array.from(cloneRoot.querySelectorAll('*')),
  ];

  const collectedFontStrings: string[] = [];
  const imagePromises: Promise<void>[] = [];

  const count = Math.min(liveNodes.length, cloneNodes.length);
  for (let i = 0; i < count; i++) {
    const liveEl = liveNodes[i];
    const cloneEl = cloneNodes[i];

    const computed = window.getComputedStyle(liveEl);
    if (computed.fontFamily) {
      collectedFontStrings.push(computed.fontFamily);
    }

    if (cloneEl instanceof HTMLElement || cloneEl instanceof SVGElement) {
      // Lock exact visibility/display state from live layout (e.g. hidden lg:flex, xl:hidden)
      if (computed.display === 'none') {
        cloneEl.style.display = 'none';
      }
      if (computed.visibility === 'hidden') {
        cloneEl.style.visibility = 'hidden';
      }

      // Freeze any CSS-variable-driven transform at its current rendered matrix
      if (computed.transform && computed.transform !== 'none') {
        cloneEl.style.transform = computed.transform;
      }

      // Preserve special CSS effects explicitly
      if (computed.clipPath && computed.clipPath !== 'none') {
        cloneEl.style.clipPath = computed.clipPath;
      }
      if (computed.filter && computed.filter !== 'none') {
        cloneEl.style.filter = computed.filter;
      }
      if (computed.mixBlendMode && computed.mixBlendMode !== 'normal') {
        cloneEl.style.mixBlendMode = computed.mixBlendMode;
      }
      if (computed.writingMode && computed.writingMode !== 'horizontal-tb') {
        cloneEl.style.writingMode = computed.writingMode;
      }

      const maskImage =
        computed.getPropertyValue('mask-image') ||
        computed.getPropertyValue('-webkit-mask-image');
      if (maskImage && maskImage !== 'none') {
        cloneEl.style.setProperty('mask-image', maskImage);
        cloneEl.style.setProperty('-webkit-mask-image', maskImage);
      }

      const strokeWidth = computed.getPropertyValue('-webkit-text-stroke-width');
      const strokeColor = computed.getPropertyValue('-webkit-text-stroke-color');
      if (strokeWidth && strokeWidth !== '0px') {
        cloneEl.style.setProperty(
          '-webkit-text-stroke',
          `${strokeWidth} ${strokeColor}`
        );
      }

      // Disable transitions/animations in the static snapshot so nothing is mid-transition
      cloneEl.style.transition = 'none';
      cloneEl.style.animation = 'none';
    }

    // Inline <img> sources as base64 data URLs
    if (
      liveEl instanceof HTMLImageElement &&
      cloneEl instanceof HTMLImageElement
    ) {
      const liveRect = liveEl.getBoundingClientRect();
      imagePromises.push(
        inlineImageElementToDataUrl(liveEl).then((dataUrl) => {
          if (dataUrl) {
            cloneEl.src = dataUrl;
          }
          cloneEl.removeAttribute('srcset');
          cloneEl.removeAttribute('loading');
          cloneEl.removeAttribute('crossorigin');
          if (liveRect.width > 0 && liveRect.height > 0) {
            cloneEl.style.objectFit = computed.objectFit || 'cover';
            cloneEl.style.objectPosition = computed.objectPosition || 'center';
          }
        })
      );
    }
  }

  await Promise.all(imagePromises);

  // Strip UI controls / hover-only overlays marked with data-export-ignore="true"
  const ignoredElements = cloneRoot.querySelectorAll('[data-export-ignore="true"]');
  ignoredElements.forEach((el) => el.remove());

  return collectedFontStrings;
}

/**
 * Captures the actual rendered poster DOM ([data-testid="poster-canvas"]) into a
 * pixel-accurate high-resolution PNG or JPEG file.
 */
export async function exportRenderedPoster(
  style: GeneratedPosterStyle,
  options: PosterExportOptions = {}
): Promise<PosterExportResult> {
  const format: PosterExportFormat = options.format || 'png';
  const quality = options.quality ?? 0.95;
  const posterEl =
    options.targetElement ||
    document.querySelector<HTMLElement>('[data-testid="poster-canvas"]');

  if (!posterEl) {
    throw new Error('Poster canvas element not found in DOM');
  }

  // 1. Wait for web fonts to be ready on the live document
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness warning
    }
  }

  // 2. Measure exact rendered poster dimensions & compute high-DPI output size
  const rect = posterEl.getBoundingClientRect();
  const { width, height, exportWidth, exportHeight } = computeExportDimensions(
    rect.width,
    rect.height,
    options.scale ?? 2
  );

  // 3. Clone the rendered poster DOM node without mutating or regenerating the live poster
  const clone = posterEl.cloneNode(true) as HTMLElement;

  // 4. Synchronize computed styles, inline all <img> assets as base64 data URLs, and strip UI overlays
  const domFontStrings = await synchronizeClonedPosterTree(posterEl, clone);
  const usedFamilies = extractUsedFontFamilies([
    style.fontDisplay,
    style.fontBody,
    style.fontMono,
    ...domFontStrings,
  ]);

  // 5. Lock root clone dimensions to the exact live bounding box
  const liveRootStyle = window.getComputedStyle(posterEl);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.maxWidth = `${width}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.maxHeight = `${height}px`;
  clone.style.margin = '0';
  clone.style.boxSizing = 'border-box';
  clone.style.position = 'relative';
  clone.style.overflow = 'hidden';
  clone.style.backgroundColor = liveRootStyle.backgroundColor || style.bgCanvas;
  clone.style.color = liveRootStyle.color || style.textPrimary;
  clone.style.setProperty('--px', posterEl.style.getPropertyValue('--px') || '0');
  clone.style.setProperty('--py', posterEl.style.getPropertyValue('--py') || '0');
  clone.style.setProperty(
    '--cursor-x',
    posterEl.style.getPropertyValue('--cursor-x') || '50'
  );
  clone.style.setProperty(
    '--cursor-y',
    posterEl.style.getPropertyValue('--cursor-y') || '50'
  );

  // 6. Gather inlined @font-face rules and same-origin CSS rules
  const [fontFaceCss, appCss] = await Promise.all([
    buildEmbeddedFontFaceCss(usedFamilies),
    Promise.resolve(collectSameOriginStylesheetCss(width, height)),
  ]);

  const combinedCss = [
    fontFaceCss,
    appCss,
    `
    svg, .poster-export-xhtml-root {
      font-size: 16px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: geometricPrecision;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    `,
  ].join('\n');

  // 7. Build self-contained SVG with <foreignObject>
  const svgNS = 'http://www.w3.org/2000/svg';
  const xhtmlNS = 'http://www.w3.org/1999/xhtml';

  const svgEl = document.createElementNS(svgNS, 'svg');
  svgEl.setAttribute('xmlns', svgNS);
  svgEl.setAttribute('width', String(exportWidth));
  svgEl.setAttribute('height', String(exportHeight));
  svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const defsEl = document.createElementNS(svgNS, 'defs');
  const styleEl = document.createElementNS(svgNS, 'style');
  styleEl.setAttribute('type', 'text/css');
  styleEl.textContent = combinedCss;
  defsEl.appendChild(styleEl);
  svgEl.appendChild(defsEl);

  const foreignObjectEl = document.createElementNS(svgNS, 'foreignObject');
  foreignObjectEl.setAttribute('x', '0');
  foreignObjectEl.setAttribute('y', '0');
  foreignObjectEl.setAttribute('width', String(width));
  foreignObjectEl.setAttribute('height', String(height));

  const wrapperDiv = document.createElementNS(xhtmlNS, 'div');
  wrapperDiv.setAttribute('xmlns', xhtmlNS);
  wrapperDiv.setAttribute('class', 'poster-export-xhtml-root');
  wrapperDiv.setAttribute(
    'style',
    `width:${width}px;height:${height}px;margin:0;padding:0;overflow:hidden;background:${style.bgCanvas};`
  );
  wrapperDiv.appendChild(clone);
  foreignObjectEl.appendChild(wrapperDiv);
  svgEl.appendChild(foreignObjectEl);

  const serializedSvg = new XMLSerializer().serializeToString(svgEl);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    serializedSvg
  )}`;

  // 8. Decode SVG image and warm up embedded @font-face glyphs before final canvas rasterization
  const renderedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = svgDataUrl;
  });

  if (typeof renderedImg.decode === 'function') {
    try {
      await renderedImg.decode();
    } catch {
      // Ignore decode warning
    }
  }

  // Warm-up draw + animation frame ensures Chromium's isolated SVG FontSelector
  // finishes instantiating embedded base64 @font-face glyphs before final capture
  const canvas = document.createElement('canvas');
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = style.bgCanvas;
  ctx.fillRect(0, 0, exportWidth, exportHeight);
  ctx.drawImage(renderedImg, 0, 0, exportWidth, exportHeight);

  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );

  ctx.fillStyle = style.bgCanvas;
  ctx.fillRect(0, 0, exportWidth, exportHeight);
  ctx.drawImage(renderedImg, 0, 0, exportWidth, exportHeight);

  const mimeType =
    format === 'jpeg'
      ? 'image/jpeg'
      : format === 'webp'
      ? 'image/webp'
      : 'image/png';
  const ext =
    format === 'jpeg' ? 'jpg' : format === 'webp' ? 'webp' : 'png';
  const dataUrl =
    format === 'jpeg' || format === 'webp'
      ? canvas.toDataURL(mimeType, quality)
      : canvas.toDataURL(mimeType);

  const filename = `shamil-tp-poster-${style.slug}-ed${style.editionNumber}.${ext}`;

  // Store metadata on window for automated verification without affecting UI
  (window as unknown as Record<string, unknown>).__LAST_EXPORTED_POSTER__ = {
    filename,
    format,
    width,
    height,
    exportWidth,
    exportHeight,
    dataUrl,
  };

  if (options?.triggerDownload !== false) {
    // Trigger browser download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    filename,
    format,
    width,
    height,
    exportWidth,
    exportHeight,
    dataUrl,
  };
}

/**
 * Backward-compatible wrapper that exports the currently rendered poster DOM as PNG.
 */
export async function exportPosterAsPng(
  style: GeneratedPosterStyle,
  _slice?: PosterDataSlice,
  _identity?: PortfolioIdentity,
  _primaryAsset?: { url: string; title: string },
  options?: PosterExportOptions
): Promise<string> {
  const result = await exportRenderedPoster(style, {
    ...options,
    format: options?.format || 'png',
  });
  return result.filename;
}
