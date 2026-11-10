/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'node:crypto';

export interface WebpBannerMetadata {
  version: string;
  etag: string;
  lastModified: string;
  width: number;
  height: number;
  bytes: number;
  format: 'webp';
  styleName?: string;
  editionNumber?: number;
}

export interface ImgHeaderBuildParams {
  version: string;
  etag: string;
  lastModified: string;
  byteLength: number;
  requestedVersion?: string | null;
  isDynamicQuery?: boolean;
}

export interface ConditionalRequestParams {
  ifNoneMatch?: string | null;
  ifModifiedSince?: string | null;
  etag: string;
  lastModified: string;
  isDynamicQuery?: boolean;
}

export interface CamoSafePosterUrls {
  version: string;
  directUrl: string;
  versionedQueryUrl: string;
  versionedPathUrl: string;
  markdownBadge: string;
  htmlImgTag: string;
}

/**
 * Verifies that a byte buffer begins with a valid RIFF....WEBP magic header.
 */
export function isValidWebpBuffer(buffer: Uint8Array | Buffer): boolean {
  if (!buffer || buffer.byteLength < 12) return false;
  const riff =
    buffer[0] === 0x52 && // 'R'
    buffer[1] === 0x49 && // 'I'
    buffer[2] === 0x46 && // 'F'
    buffer[3] === 0x46; // 'F'
  const webp =
    buffer[8] === 0x57 && // 'W'
    buffer[9] === 0x45 && // 'E'
    buffer[10] === 0x42 && // 'B'
    buffer[11] === 0x50; // 'P'
  return riff && webp;
}

/**
 * Computes a deterministic 12-character hex version and quoted RFC-7232 ETag
 * from the raw WebP binary bytes.
 */
export function computeWebpContentHash(buffer: Uint8Array | Buffer): {
  version: string;
  etag: string;
} {
  const hash = crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex')
    .slice(0, 12);
  return {
    version: hash,
    etag: `"${hash}"`,
  };
}

/**
 * Normalizes a version token from query (`?v=abc123`) or path (`/img/abc123.webp`).
 */
export function normalizeRequestedVersion(
  rawVersion?: string | null
): string | null {
  if (!rawVersion || typeof rawVersion !== 'string') return null;
  const trimmed = rawVersion
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .replace(/\.webp$/i, '')
    .replace(/^v[-_]?/i, (m) => (rawVersion.length > 12 ? '' : m));
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Builds HTTP response headers for `/img` and `/img/:version` routes.
 *
 * - Exact content-hash hits (`/img?v=<hash>` or `/img/<hash>.webp`) receive
 *   `Cache-Control: public, max-age=31536000, immutable` because the URL itself
 *   is keyed to the exact image bytes (busting GitHub Camo when the hash changes).
 * - Unversioned `/img` or mismatched version requests receive
 *   `Cache-Control: public, max-age=0, s-maxage=0, must-revalidate, no-cache, no-transform`
 *   so browsers, CDNs, and proxies always revalidate against `ETag` / `Last-Modified`.
 */
export function buildImgResponseHeaders(
  params: ImgHeaderBuildParams
): Record<string, string> {
  const normalizedReqVersion = normalizeRequestedVersion(
    params.requestedVersion
  );
  const isImmutableVersionMatch =
    Boolean(normalizedReqVersion) &&
    normalizedReqVersion === params.version &&
    !params.isDynamicQuery;

  const cacheControl = isImmutableVersionMatch
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=0, s-maxage=0, must-revalidate, no-cache, no-transform';

  const headers: Record<string, string> = {
    'Content-Type': 'image/webp',
    'Content-Length': String(params.byteLength),
    'Content-Disposition': `inline; filename="shamil-tp-poster-${params.version}.webp"`,
    ETag: params.etag,
    'Last-Modified': params.lastModified,
    'Cache-Control': cacheControl,
    'X-Poster-Version': params.version,
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Timing-Allow-Origin': '*',
    Vary: 'Accept-Encoding',
  };

  if (!isImmutableVersionMatch) {
    headers['Surrogate-Control'] = 'no-store';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }

  return headers;
}

/**
 * Evaluates HTTP conditional request headers (`If-None-Match` and `If-Modified-Since`)
 * according to RFC 7232 so unchanged poster banners return `304 Not Modified`.
 */
export function isConditionalRequestFresh(
  params: ConditionalRequestParams
): boolean {
  if (params.isDynamicQuery) return false;

  const cleanEtag = params.etag.replace(/^W\//i, '').trim();

  if (params.ifNoneMatch && params.ifNoneMatch.trim().length > 0) {
    const raw = params.ifNoneMatch.trim();
    if (raw === '*') return true;
    const candidates = raw
      .split(',')
      .map((part) => part.trim().replace(/^W\//i, ''));
    return candidates.includes(cleanEtag);
  }

  if (params.ifModifiedSince && params.ifModifiedSince.trim().length > 0) {
    const sinceTime = Date.parse(params.ifModifiedSince);
    const lastModTime = Date.parse(params.lastModified);
    if (!Number.isNaN(sinceTime) && !Number.isNaN(lastModTime)) {
      return lastModTime <= sinceTime;
    }
  }

  return false;
}

/**
 * Generates direct and GitHub-Camo-busting versioned URLs and Markdown snippets.
 */
export function buildCamoSafePosterUrls(
  baseUrl: string,
  version: string
): CamoSafePosterUrls {
  const cleanBase = (baseUrl || 'https://poster.shamiltp.life').replace(
    /\/+$/,
    ''
  );
  const directUrl = `${cleanBase}/img`;
  const versionedQueryUrl = `${cleanBase}/img?v=${version}`;
  const versionedPathUrl = `${cleanBase}/img/${version}.webp`;
  const markdownBadge = `[![Poster Playground](${versionedQueryUrl})](${cleanBase})`;
  const htmlImgTag = `<img src="${versionedQueryUrl}" alt="Poster Playground — Shamil TP Generative Poster Portfolio" width="1440" height="900" />`;

  return {
    version,
    directUrl,
    versionedQueryUrl,
    versionedPathUrl,
    markdownBadge,
    htmlImgTag,
  };
}

/**
 * Updates any `/img` banner URL in a README.md string with the latest content-hash
 * version so GitHub's Camo proxy immediately fetches the updated WebP image.
 */
export function updateReadmePosterImageUrl(
  readmeMarkdown: string,
  version: string,
  baseUrl = 'https://poster.shamiltp.life'
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const escapedBase = cleanBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Pattern 1: Replace existing `/img?v=...` or `/img/<hash>.webp` or bare `/img` inside Markdown/HTML image URLs
  const imgUrlRegex = new RegExp(
    `(${escapedBase}\\/img)(?:\\/[a-zA-Z0-9._-]+\\.webp)?(?:\\?v=[a-zA-Z0-9._-]+)?`,
    'g'
  );

  if (imgUrlRegex.test(readmeMarkdown)) {
    return readmeMarkdown.replace(imgUrlRegex, `$1?v=${version}`);
  }

  // Pattern 2: If README does not yet contain the banner image, insert it below the main H1 heading
  const bannerSnippet = `\n[![Poster Playground](${cleanBase}/img?v=${version})](${cleanBase})\n`;
  const h1Match = readmeMarkdown.match(/^#\s+.+$/m);
  if (h1Match && h1Match.index !== undefined) {
    const insertPos = h1Match.index + h1Match[0].length;
    return (
      readmeMarkdown.slice(0, insertPos) +
      '\n' +
      bannerSnippet +
      readmeMarkdown.slice(insertPos)
    );
  }

  return `${bannerSnippet}\n${readmeMarkdown}`;
}
