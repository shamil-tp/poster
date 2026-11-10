/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {
  WebpBannerMetadata,
  computeWebpContentHash,
  isValidWebpBuffer,
  updateReadmePosterImageUrl,
} from '../utils/imgRouteHeaders.ts';

const WORKSPACE_ROOT = process.cwd();
const PUBLIC_DIR = path.join(WORKSPACE_ROOT, 'public');
const PRIMARY_IMG_WEBP_PATH = path.join(PUBLIC_DIR, 'img.webp');
const BANNER_WEBP_PATH = path.join(
  PUBLIC_DIR,
  'assets',
  'poster-banner.webp'
);
const BANNER_META_PATH = path.join(
  PUBLIC_DIR,
  'assets',
  'poster-banner.meta.json'
);
const README_PATH = path.join(WORKSPACE_ROOT, 'README.md');

export interface CachedBannerRecord {
  buffer: Buffer;
  meta: WebpBannerMetadata;
  mtimeMs: number;
}

let cachedRecord: CachedBannerRecord | null = null;

/**
 * Loads the active WebP image from `public/img.webp` (or `public/assets/poster-banner.webp`),
 * verifying its RIFF....WEBP binary signature and dimensions.
 */
export async function getActivePosterBanner(): Promise<CachedBannerRecord> {
  const targetPath = fs.existsSync(PRIMARY_IMG_WEBP_PATH)
    ? PRIMARY_IMG_WEBP_PATH
    : BANNER_WEBP_PATH;

  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (cachedRecord && cachedRecord.mtimeMs === stat.mtimeMs) {
      return cachedRecord;
    }

    const buffer = fs.readFileSync(targetPath);
    if (isValidWebpBuffer(buffer)) {
      const { version, etag } = computeWebpContentHash(buffer);
      let storedMeta: Partial<WebpBannerMetadata> = {};
      if (fs.existsSync(BANNER_META_PATH)) {
        try {
          storedMeta = JSON.parse(fs.readFileSync(BANNER_META_PATH, 'utf-8'));
        } catch {
          // Ignore malformed JSON
        }
      }

      let width = storedMeta.width || 1200;
      let height = storedMeta.height || 475;
      if (!storedMeta.width || !storedMeta.height) {
        try {
          const sharpMeta = await sharp(buffer).metadata();
          if (sharpMeta.width) width = sharpMeta.width;
          if (sharpMeta.height) height = sharpMeta.height;
        } catch {
          // Keep default dimensions
        }
      }

      const versionedFilename = `img-${version}.webp`;
      const versionedPath = path.join(PUBLIC_DIR, versionedFilename);
      if (!fs.existsSync(versionedPath)) {
        try {
          fs.writeFileSync(versionedPath, buffer);
        } catch {
          // Ignore write error in read-only environments
        }
      }

      const meta: WebpBannerMetadata = {
        version,
        etag,
        lastModified:
          storedMeta.version === version && storedMeta.lastModified
            ? storedMeta.lastModified
            : new Date(stat.mtimeMs).toUTCString(),
        width,
        height,
        bytes: buffer.byteLength,
        format: 'webp',
        versionedFilename,
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

  throw new Error('public/img.webp not found or invalid WebP file');
}

/**
 * Converts any input image buffer (PNG/JPEG/WebP) into a genuine WebP buffer
 * while preserving its exact visual appearance and aspect ratio, writes
 * `public/img.webp` and versioned `public/img-<hash>.webp`, and updates metadata.
 */
export async function saveWebpBannerBuffer(
  rawInputBuffer: Buffer,
  options?: {
    styleName?: string;
    editionNumber?: number;
    baseUrl?: string;
  }
): Promise<CachedBannerRecord> {
  const inputMeta = await sharp(rawInputBuffer).metadata();
  const width = inputMeta.width || 1200;
  const height = inputMeta.height || 475;

  const optimizedBuffer = await sharp(rawInputBuffer)
    .webp({ quality: 92, nearLossless: true, effort: 6 })
    .toBuffer();

  const { version, etag } = computeWebpContentHash(optimizedBuffer);
  const versionedFilename = `img-${version}.webp`;

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
    width,
    height,
    bytes: optimizedBuffer.byteLength,
    format: 'webp',
    versionedFilename,
    styleName: options?.styleName,
    editionNumber: options?.editionNumber,
  };

  fs.mkdirSync(path.dirname(BANNER_WEBP_PATH), { recursive: true });
  fs.writeFileSync(PRIMARY_IMG_WEBP_PATH, optimizedBuffer);
  fs.writeFileSync(path.join(PUBLIC_DIR, versionedFilename), optimizedBuffer);
  fs.writeFileSync(BANNER_WEBP_PATH, optimizedBuffer);
  fs.writeFileSync(BANNER_META_PATH, JSON.stringify(meta, null, 2));

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

  const stat = fs.statSync(PRIMARY_IMG_WEBP_PATH);
  cachedRecord = {
    buffer: optimizedBuffer,
    meta,
    mtimeMs: stat.mtimeMs,
  };

  return cachedRecord;
}
