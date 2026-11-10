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
  versionedFilename?: string;
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
  versionedFilenameUrl: string;
  versionedQueryUrl: string;
  versionedPathUrl: string;
  markdownBadge: string;
  versionedMarkdownBadge: string;
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
 * Normalizes a version token from query (`?v=def9408f9f29`), versioned filename
 * (`/img-def9408f9f29.webp`), or path (`/img/def9408f9f29.webp`).
 */
export function normalizeRequestedVersion(
  rawVersion?: string | null
): string | null {
  if (!rawVersion || typeof rawVersion !== 'string') return null;
  const trimmed = rawVersion
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .replace(/^\/+/, '')
    .replace(/^img[-_/]/i, '')
    .replace(/\.webp$/i, '')
    .replace(/^v[-_]?/i, (m) => (rawVersion.length > 12 ? '' : m));
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Builds HTTP response headers for `/img.webp`, `/img-<version>.webp`, and `/img`.
 *
 * - Exact content-hash hits (`/img-<hash>.webp` or `/img.webp?v=<hash>`) receive
 *   `Cache-Control: public, max-age=31536000, immutable` so versioned URLs cache
 *   efficiently while busting GitHub Camo whenever the filename/hash changes.
 * - Unversioned `/img.webp` requests receive
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
    'Content-Disposition': `inline; filename="img-${params.version}.webp"`,
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
 * according to RFC 7232 so unchanged requests return `304 Not Modified`.
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
 * Generates direct `.webp` and GitHub-Camo-busting versioned `.webp` URLs and Markdown snippets.
 */
export function buildCamoSafePosterUrls(
  baseUrl: string,
  version: string
): CamoSafePosterUrls {
  const cleanBase = (baseUrl || 'https://poster.shamiltp.life').replace(
    /\/+$/,
    ''
  );
  const directUrl = `${cleanBase}/img.webp`;
  const versionedFilenameUrl = `${cleanBase}/img-${version}.webp`;
  const versionedQueryUrl = `${cleanBase}/img.webp?v=${version}`;
  const versionedPathUrl = versionedFilenameUrl;
  const markdownBadge = `[![Poster Playground](${directUrl})](${cleanBase})`;
  const versionedMarkdownBadge = `[![Poster Playground](${versionedFilenameUrl})](${cleanBase})`;
  const htmlImgTag = `<img width="1200" height="475" alt="Poster Playground" src="${directUrl}" />`;

  return {
    version,
    directUrl,
    versionedFilenameUrl,
    versionedQueryUrl,
    versionedPathUrl,
    markdownBadge,
    versionedMarkdownBadge,
    htmlImgTag,
  };
}

/**
 * Updates versioned `/img-<hash>.webp` or `/img?v=<hash>` references in a README.md string.
 */
export function updateReadmePosterImageUrl(
  readmeMarkdown: string,
  version: string,
  baseUrl = 'https://poster.shamiltp.life'
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const escapedBase = cleanBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Replace versioned filename `/img-<oldhash>.webp` or query `/img(.webp)?v=<oldhash>`
  const versionedRegex = new RegExp(
    `(${escapedBase}\\/img)(?:-[a-zA-Z0-9]+\\.webp|(?:\\.webp)?\\?v=[a-zA-Z0-9._-]+|\\/[a-zA-Z0-9._-]+\\.webp)`,
    'g'
  );

  if (versionedRegex.test(readmeMarkdown)) {
    return readmeMarkdown.replace(versionedRegex, `$1-${version}.webp`);
  }

  return readmeMarkdown;
}
