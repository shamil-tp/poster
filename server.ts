/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import express, { Request, Response } from 'express';
import {
  buildCamoSafePosterUrls,
  buildImgResponseHeaders,
  computeWebpContentHash,
  isConditionalRequestFresh,
  normalizeRequestedVersion,
} from './src/utils/imgRouteHeaders.ts';
import {
  getActivePosterBanner,
  saveWebpBannerBuffer,
  synthesizeDynamicPosterWebp,
} from './src/server/posterBannerService.ts';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_SITE_URL =
  process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')
    ? process.env.APP_URL
    : 'https://poster.shamiltp.life';

async function handlePosterWebpRequest(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const querySeedRaw = req.query.seed;
    const queryRandom =
      req.query.random === '1' ||
      req.query.random === 'true' ||
      req.query.fresh === '1';
    const hasDynamicSeed =
      queryRandom ||
      (typeof querySeedRaw === 'string' && querySeedRaw.trim().length > 0);

    // Optional on-the-fly dynamic seed generation (?seed=42 or ?random=1)
    if (hasDynamicSeed) {
      const seedNum = queryRandom
        ? Math.floor(Math.random() * 100000) + 1
        : Number.parseInt(String(querySeedRaw), 10) || 1;
      const dynamicPoster = await synthesizeDynamicPosterWebp(seedNum);
      const { version, etag } = computeWebpContentHash(dynamicPoster.buffer);
      const lastModified = new Date().toUTCString();
      const headers = buildImgResponseHeaders({
        version,
        etag,
        lastModified,
        byteLength: dynamicPoster.buffer.byteLength,
        requestedVersion: null,
        isDynamicQuery: true,
      });

      res.set(headers);
      if (req.method === 'HEAD') {
        res.status(200).end();
        return;
      }
      res.status(200).end(dynamicPoster.buffer);
      return;
    }

    const record = await getActivePosterBanner();
    const rawRequestedVersion =
      (typeof req.params.version === 'string' ? req.params.version : null) ||
      (typeof req.query.v === 'string' ? req.query.v : null) ||
      (typeof req.query.version === 'string' ? req.query.version : null);
    const requestedVersion = normalizeRequestedVersion(rawRequestedVersion);

    const headers = buildImgResponseHeaders({
      version: record.meta.version,
      etag: record.meta.etag,
      lastModified: record.meta.lastModified,
      byteLength: record.buffer.byteLength,
      requestedVersion,
      isDynamicQuery: false,
    });

    const isFresh = isConditionalRequestFresh({
      ifNoneMatch: req.headers['if-none-match'] as string | undefined,
      ifModifiedSince: req.headers['if-modified-since'] as string | undefined,
      etag: record.meta.etag,
      lastModified: record.meta.lastModified,
      isDynamicQuery: false,
    });

    if (isFresh) {
      const notModifiedHeaders = { ...headers };
      delete notModifiedHeaders['Content-Length'];
      res.set(notModifiedHeaders);
      res.status(304).end();
      return;
    }

    res.set(headers);
    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }
    res.status(200).end(record.buffer);
  } catch (err) {
    console.error('Error serving /img WebP poster:', err);
    res.status(500).type('text/plain').send('Failed to render WebP poster');
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.disable('x-powered-by');
  app.disable('etag'); // Managed explicitly via SHA-256 content-hash ETag on /img

  app.use(express.json({ limit: '25mb' }));

  // 1. Dedicated WebP Banner Routes: /img, /img.webp, /img/:version
  app.get('/img', handlePosterWebpRequest);
  app.get('/img.webp', handlePosterWebpRequest);
  app.get('/img/:version', handlePosterWebpRequest);

  // 2. Metadata & GitHub Camo URL Inspection Endpoint
  app.get('/api/img/meta', async (_req: Request, res: Response) => {
    try {
      const record = await getActivePosterBanner();
      const urls = buildCamoSafePosterUrls(
        PUBLIC_SITE_URL,
        record.meta.version
      );
      res.json({
        ok: true,
        meta: record.meta,
        urls,
      });
    } catch (err) {
      console.error('Error reading /api/img/meta:', err);
      res.status(500).json({ ok: false, error: 'Failed to read banner meta' });
    }
  });

  // 3. Publish / Sync Active Poster to /img (updates WebP, ETag, Last-Modified, and README.md)
  app.post('/api/img/publish', async (req: Request, res: Response) => {
    try {
      const { dataUrl, styleName, editionNumber, seed, regenerate } =
        req.body || {};

      let rawBuffer: Buffer;
      let resolvedStyleName: string | undefined = styleName;
      let resolvedEdition: number | undefined = editionNumber;

      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
        const commaIndex = dataUrl.indexOf(',');
        if (commaIndex === -1) {
          res.status(400).json({ ok: false, error: 'Invalid image dataUrl' });
          return;
        }
        const base64Payload = dataUrl.slice(commaIndex + 1);
        rawBuffer = Buffer.from(base64Payload, 'base64');
      } else if (regenerate || typeof seed === 'number') {
        const synthesized = await synthesizeDynamicPosterWebp(
          typeof seed === 'number'
            ? seed
            : Math.floor(Math.random() * 90000) + 1
        );
        rawBuffer = synthesized.buffer;
        resolvedStyleName = resolvedStyleName || synthesized.styleName;
        resolvedEdition = resolvedEdition || synthesized.editionNumber;
      } else {
        res.status(400).json({
          ok: false,
          error: 'Provide either a rendered image dataUrl or regenerate: true',
        });
        return;
      }

      const saved = await saveWebpBannerBuffer(rawBuffer, {
        styleName: resolvedStyleName,
        editionNumber: resolvedEdition,
        baseUrl: 'https://poster.shamiltp.life',
      });
      const urls = buildCamoSafePosterUrls(
        'https://poster.shamiltp.life',
        saved.meta.version
      );

      res.json({
        ok: true,
        meta: saved.meta,
        urls,
      });
    } catch (err) {
      console.error('Error publishing /img WebP poster:', err);
      res
        .status(500)
        .json({ ok: false, error: 'Failed to publish WebP poster' });
    }
  });

  const distDir = path.resolve(process.cwd(), 'dist');
  const distIndexHtml = path.join(distDir, 'index.html');
  const isProd =
    process.env.NODE_ENV === 'production' && fs.existsSync(distIndexHtml);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir, { index: false }));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(distIndexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Poster Playground server listening on http://0.0.0.0:${PORT} (/img WebP endpoint ready)`
    );
  });
}

startServer();
