/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';
import {
  WebpBannerMetadata,
  computeWebpContentHash,
  isValidWebpBuffer,
  updateReadmePosterImageUrl,
} from '../utils/imgRouteHeaders.ts';

const WORKSPACE_ROOT = process.cwd();
const BANNER_WEBP_PATH = path.join(
  WORKSPACE_ROOT,
  'public',
  'assets',
  'poster-banner.webp'
);
const BANNER_META_PATH = path.join(
  WORKSPACE_ROOT,
  'public',
  'assets',
  'poster-banner.meta.json'
);
const README_PATH = path.join(WORKSPACE_ROOT, 'README.md');
const ASSETS_DIR = path.join(WORKSPACE_ROOT, 'public', 'assets', 'aistudio');

export interface CachedBannerRecord {
  buffer: Buffer;
  meta: WebpBannerMetadata;
  mtimeMs: number;
}

let cachedRecord: CachedBannerRecord | null = null;

interface ServerPosterPreset {
  styleName: string;
  bgCanvas: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  accentPrimary: string;
  accentSecondary: string;
  assetFile: string;
  projectTitle: string;
  projectCategory: string;
  projectSummary: string;
  projectTech: string;
}

const SERVER_POSTER_PRESETS: ServerPosterPreset[] = [
  {
    styleName: 'Graffiti × Swiss Minimalist Exhibition',
    bgCanvas: '#131519',
    bgElevated: '#1E232B',
    textPrimary: '#F5F7FA',
    textSecondary: '#9AA5B8',
    accentPrimary: '#FACC15',
    accentSecondary: '#F43F5E',
    assetFile: 'img7.jpg',
    projectTitle: 'Blogify — OWASP-Hardened Full Stack Publishing Platform',
    projectCategory: 'SELECTED MONOGRAPH · SECURITY ARCHITECTURE',
    projectSummary:
      'Engineered memory-hard Argon2id password hashing paired with short-lived access tokens and rotating refresh tokens.',
    projectTech: 'Node.js · Express 5 · MongoDB · Argon2id · Dual JWT Rotation',
  },
  {
    styleName: 'Editorial Constructivism · Archival Edition',
    bgCanvas: '#F4EFE6',
    bgElevated: '#FFFFFF',
    textPrimary: '#161514',
    textSecondary: '#57534E',
    accentPrimary: '#B91C1C',
    accentSecondary: '#1D4ED8',
    assetFile: 'img30.jpg',
    projectTitle: 'OpsPilot — Multi-Tenant AI Incident & DevOps Copilot',
    projectCategory: '001. PRODUCTION AI SYSTEMS & MICROSERVICES',
    projectSummary:
      'Hybrid FastAPI + Express architecture with RAG runbook indexing, SSE telemetry streams, and RBAC workspaces.',
    projectTech: 'FastAPI · TypeScript · PostgreSQL · Docker · Redis',
  },
  {
    styleName: 'Nautical × Neo-Brutalist Swiss Grid',
    bgCanvas: '#0B1320',
    bgElevated: '#132035',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accentPrimary: '#F59E0B',
    accentSecondary: '#38BDF8',
    assetFile: 'img15.jpg',
    projectTitle: 'RegretMap — Community Geospatial Travel Lessons Platform',
    projectCategory: '003. GEOSPATIAL FULL-STACK ENGINEERING',
    projectSummary:
      'Interactive Leaflet geospatial canvas with coordinate pins, density heatmap toggling, and proxied Photon geocoding.',
    projectTech: 'React · Node.js · Leaflet · Geospatial Indexing · REST API',
  },
  {
    styleName: 'Surrealism · Midnight Monochrome Plate',
    bgCanvas: '#0E1017',
    bgElevated: '#181C28',
    textPrimary: '#F3F4F6',
    textSecondary: '#9CA3AF',
    accentPrimary: '#FB7185',
    accentSecondary: '#818CF8',
    assetFile: 'img22.jpg',
    projectTitle: 'Blog-Rendering-Library — Zero-Dependency DOM Engine',
    projectCategory: '006. OPEN-SOURCE JAVASCRIPT ENGINE',
    projectSummary:
      'Transforms structured JSON payloads directly into semantic headings, code blocks, and 15+ instant URL-driven themes.',
    projectTech: 'Vanilla JavaScript (ES6+) · Browser DOM API · MIT License',
  },
];

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Synthesizes a high-resolution (1440x900) WebP poster directly on the server using sharp
 * and real artwork/portrait assets from `public/assets/aistudio/`.
 */
export async function synthesizeDynamicPosterWebp(
  seed = 1
): Promise<{ buffer: Buffer; styleName: string; editionNumber: number }> {
  const width = 1440;
  const height = 900;
  const presetIndex = Math.abs(Math.floor(seed)) % SERVER_POSTER_PRESETS.length;
  const preset = SERVER_POSTER_PRESETS[presetIndex];
  const editionNumber = (Math.abs(Math.floor(seed)) % 99) + 1;

  // Prepare primary illustration plate
  const primaryPath = path.join(ASSETS_DIR, preset.assetFile);
  const portraitPath = path.join(ASSETS_DIR, 'profile-700_c6decb6b.webp');

  let primaryPlateBuffer: Buffer | null = null;
  let portraitPlateBuffer: Buffer | null = null;
  let bgBleedBuffer: Buffer | null = null;

  if (fs.existsSync(primaryPath)) {
    const circleMask = Buffer.from(
      `<svg width="380" height="380" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="380" height="380" rx="190" ry="190" fill="#fff"/>
      </svg>`
    );
    primaryPlateBuffer = await sharp(primaryPath)
      .resize(380, 380, { fit: 'cover' })
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    bgBleedBuffer = await sharp(primaryPath)
      .resize(620, 620, { fit: 'cover' })
      .modulate({ saturation: 0.45, brightness: 0.65 })
      .blur(18)
      .png()
      .toBuffer();
  }

  if (fs.existsSync(portraitPath)) {
    const roundedMask = Buffer.from(
      `<svg width="116" height="148" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="116" height="148" rx="8" ry="8" fill="#fff"/>
      </svg>`
    );
    portraitPlateBuffer = await sharp(portraitPath)
      .resize(116, 148, { fit: 'cover' })
      .composite([{ input: roundedMask, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  const svgOverlay = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow" cx="65%" cy="48%" r="55%">
        <stop offset="0%" stop-color="${preset.accentPrimary}" stop-opacity="0.14"/>
        <stop offset="60%" stop-color="${preset.accentSecondary}" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="${preset.bgCanvas}" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Atmospheric Glow -->
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#glow)" />

    <!-- Architectural Corner Frame & Orbital Rings -->
    <path d="M 56 170 L 56 56 L 170 56" fill="none" stroke="${preset.accentPrimary}" stroke-width="1.2" stroke-opacity="0.42" />
    <path d="M 1384 730 L 1384 844 L 1270 844" fill="none" stroke="${preset.accentPrimary}" stroke-width="1.2" stroke-opacity="0.42" />
    <circle cx="1130" cy="450" r="275" fill="none" stroke="${preset.accentPrimary}" stroke-width="1" stroke-opacity="0.24" />
    <circle cx="1130" cy="450" r="200" fill="none" stroke="${preset.accentSecondary}" stroke-width="1" stroke-dasharray="5 6" stroke-opacity="0.28" />

    <!-- Top Editorial Rail -->
    <text x="64" y="76" fill="${preset.textSecondary}" font-family="monospace, sans-serif" font-size="13" letter-spacing="4">
      EXHIBITION NO. ${String(editionNumber).padStart(3, '0')} — ${escapeXml(preset.styleName.toUpperCase())}
    </text>
    <text x="1376" y="76" text-anchor="end" fill="${preset.textSecondary}" font-family="monospace, sans-serif" font-size="13" letter-spacing="3">
      KOZHIKODE (CALICUT), KERALA, INDIA
    </text>

    <!-- Artwork Medallion Frame -->
    <circle cx="458" cy="452" r="218" fill="${preset.bgElevated}" stroke="${preset.accentPrimary}" stroke-width="2" stroke-opacity="0.55" />
    <circle cx="458" cy="452" r="196" fill="none" stroke="${preset.textSecondary}" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.35" />

    <!-- Right-Hand Editorial Typography Column -->
    <text x="730" y="388" fill="${preset.textPrimary}" font-family="Georgia, 'Times New Roman', serif" font-size="82" font-weight="900" letter-spacing="-1">
      Shamil TP
    </text>
    <text x="732" y="432" fill="${preset.accentPrimary}" font-family="sans-serif" font-size="20" font-weight="700" letter-spacing="1.2">
      Backend-Focused Full Stack Developer
    </text>

    <line x1="732" y1="458" x2="1220" y2="458" stroke="${preset.textSecondary}" stroke-opacity="0.28" stroke-width="1" />

    <!-- Featured Project Dossier -->
    <text x="732" y="486" fill="${preset.accentPrimary}" font-family="monospace, sans-serif" font-size="12" letter-spacing="2.8">
      ${escapeXml(preset.projectCategory)}
    </text>
    <text x="732" y="524" fill="${preset.textPrimary}" font-family="Georgia, serif" font-size="27" font-weight="700">
      ${escapeXml(preset.projectTitle)}
    </text>
    <text x="732" y="564" fill="${preset.textSecondary}" font-family="sans-serif" font-size="16">
      ${escapeXml(preset.projectSummary)}
    </text>
    <text x="732" y="604" fill="${preset.accentSecondary}" font-family="monospace, sans-serif" font-size="13" letter-spacing="1">
      ${escapeXml(preset.projectTech)}
    </text>

    <!-- Bottom Colophon Rail -->
    <text x="64" y="834" fill="${preset.accentPrimary}" font-family="monospace, sans-serif" font-size="12" letter-spacing="2.5">
      POSTER.SHAMILTP.LIFE · SHAMILTP.ME
    </text>
    <text x="1376" y="834" text-anchor="end" fill="${preset.textSecondary}" font-family="monospace, sans-serif" font-size="12" letter-spacing="2.2">
      LIVE EXHIBITION ↗   GITHUB   SHAMILTP073@GMAIL.COM
    </text>
  </svg>`;

  const composites: OverlayOptions[] = [];

  if (bgBleedBuffer) {
    composites.push({
      input: bgBleedBuffer,
      left: width - 560,
      top: height - 540,
      blend: 'over',
    });
  }

  // Subtle dark/light readability veil over background bleed
  const veilSvg = Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${height}" fill="${preset.bgCanvas}" fill-opacity="0.86"/>
    </svg>`
  );
  composites.push({ input: veilSvg, left: 0, top: 0 });

  // Main vector typography + frames
  composites.push({
    input: Buffer.from(svgOverlay),
    left: 0,
    top: 0,
  });

  // Primary circular illustration inside medallion
  if (primaryPlateBuffer) {
    composites.push({
      input: primaryPlateBuffer,
      left: 458 - 190,
      top: 452 - 190,
    });
  }

  // Secondary scale-contrasted portrait counterpoint plate
  if (portraitPlateBuffer) {
    const portraitFrameSvg = Buffer.from(
      `<svg width="124" height="156" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="122" height="154" rx="10" ry="10" fill="${preset.bgElevated}" stroke="${preset.accentPrimary}" stroke-width="2"/>
      </svg>`
    );
    composites.push({
      input: portraitFrameSvg,
      left: 548,
      top: 500,
    });
    composites.push({
      input: portraitPlateBuffer,
      left: 552,
      top: 504,
    });
  }

  const webpBuffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: preset.bgCanvas,
    },
  })
    .composite(composites)
    .webp({ quality: 86, effort: 4, smartSubsample: true })
    .toBuffer();

  return {
    buffer: webpBuffer,
    styleName: preset.styleName,
    editionNumber,
  };
}

/**
 * Loads the active WebP poster banner from disk/memory cache, or synthesizes
 * a baseline WebP banner if none exists yet.
 */
export async function getActivePosterBanner(): Promise<CachedBannerRecord> {
  try {
    if (fs.existsSync(BANNER_WEBP_PATH)) {
      const stat = fs.statSync(BANNER_WEBP_PATH);
      if (cachedRecord && cachedRecord.mtimeMs === stat.mtimeMs) {
        return cachedRecord;
      }

      const buffer = fs.readFileSync(BANNER_WEBP_PATH);
      if (isValidWebpBuffer(buffer)) {
        const { version, etag } = computeWebpContentHash(buffer);
        let storedMeta: Partial<WebpBannerMetadata> = {};
        if (fs.existsSync(BANNER_META_PATH)) {
          try {
            storedMeta = JSON.parse(fs.readFileSync(BANNER_META_PATH, 'utf-8'));
          } catch {
            // Ignore malformed metadata JSON
          }
        }

        const meta: WebpBannerMetadata = {
          version,
          etag,
          lastModified:
            storedMeta.version === version && storedMeta.lastModified
              ? storedMeta.lastModified
              : new Date(stat.mtimeMs).toUTCString(),
          width: storedMeta.width || 1440,
          height: storedMeta.height || 900,
          bytes: buffer.byteLength,
          format: 'webp',
          styleName: storedMeta.styleName,
          editionNumber: storedMeta.editionNumber,
        };

        cachedRecord = {
          buffer,
          meta,
          mtimeMs: stat.mtimeMs,
        };
        return cachedRecord;
      }
    }
  } catch {
    // Fall through to synthesis if file read fails
  }

  // Synthesize and persist default WebP banner if file is missing or invalid
  const synthesized = await synthesizeDynamicPosterWebp(1);
  return saveWebpBannerBuffer(synthesized.buffer, {
    styleName: synthesized.styleName,
    editionNumber: synthesized.editionNumber,
  });
}

/**
 * Optimizes any input image buffer (PNG/JPEG/WebP) into a 1440x900 WebP buffer,
 * persists it to `public/assets/poster-banner.webp`, updates metadata, and
 * syncs the versioned Camo-safe URL in `README.md`.
 */
export async function saveWebpBannerBuffer(
  rawInputBuffer: Buffer,
  options?: {
    styleName?: string;
    editionNumber?: number;
    baseUrl?: string;
  }
): Promise<CachedBannerRecord> {
  const optimizedBuffer = await sharp(rawInputBuffer)
    .resize(1440, 900, { fit: 'cover', position: 'center' })
    .webp({ quality: 86, effort: 4, smartSubsample: true })
    .toBuffer();

  const { version, etag } = computeWebpContentHash(optimizedBuffer);

  // Ensure Last-Modified advances monotonically when the image changes
  const nowMs = Date.now();
  const prevLastModMs = cachedRecord
    ? Date.parse(cachedRecord.meta.lastModified)
    : 0;
  const effectiveMs =
    !Number.isNaN(prevLastModMs) && nowMs <= prevLastModMs
      ? prevLastModMs + 1000
      : nowMs;
  const lastModified = new Date(effectiveMs).toUTCString();

  const meta: WebpBannerMetadata = {
    version,
    etag,
    lastModified,
    width: 1440,
    height: 900,
    bytes: optimizedBuffer.byteLength,
    format: 'webp',
    styleName: options?.styleName,
    editionNumber: options?.editionNumber,
  };

  fs.mkdirSync(path.dirname(BANNER_WEBP_PATH), { recursive: true });
  fs.writeFileSync(BANNER_WEBP_PATH, optimizedBuffer);
  fs.writeFileSync(BANNER_META_PATH, JSON.stringify(meta, null, 2));

  // Keep README.md versioned URL in sync so GitHub Camo always gets a fresh hash URL
  if (fs.existsSync(README_PATH)) {
    try {
      const currentReadme = fs.readFileSync(README_PATH, 'utf-8');
      const updatedReadme = updateReadmePosterImageUrl(
        currentReadme,
        version,
        options?.baseUrl || 'https://poster.shamiltp.life'
      );
      if (updatedReadme !== currentReadme) {
        fs.writeFileSync(README_PATH, updatedReadme, 'utf-8');
      }
    } catch {
      // Ignore README write errors in read-only environments
    }
  }

  const stat = fs.statSync(BANNER_WEBP_PATH);
  cachedRecord = {
    buffer: optimizedBuffer,
    meta,
    mtimeMs: stat.mtimeMs,
  };

  return cachedRecord;
}
