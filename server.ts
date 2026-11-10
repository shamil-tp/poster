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
  isConditionalRequestFresh,
  normalizeRequestedVersion,
} from './src/utils/imgRouteHeaders.ts';
import {
  getActivePosterBanner,
  saveWebpBannerBuffer,
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
    console.error('Error serving /img.webp:', err);
    res.status(500).type('text/plain').send('Failed to serve WebP image');
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.disable('x-powered-by');
  app.disable('etag'); // Managed explicitly via SHA-256 content-hash ETag on /img.webp

  app.use(express.json({ limit: '25mb' }));

  // 1. Direct WebP Image Endpoints: /img.webp, /img-<version>.webp, /img, /img/:version
  app.get('/img.webp', handlePosterWebpRequest);
  app.get('/img-:version.webp', handlePosterWebpRequest);
  app.get('/img', handlePosterWebpRequest);
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

  // 3. Explicit Publish Endpoint (only triggered when explicitly invoked)
  app.post('/api/img/publish', async (req: Request, res: Response) => {
    try {
      const { dataUrl, styleName, editionNumber } = req.body || {};

      if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        res.status(400).json({
          ok: false,
          error: 'Provide a valid image dataUrl',
        });
        return;
      }

      const commaIndex = dataUrl.indexOf(',');
      if (commaIndex === -1) {
        res.status(400).json({ ok: false, error: 'Invalid image dataUrl' });
        return;
      }
      const base64Payload = dataUrl.slice(commaIndex + 1);
      const rawBuffer = Buffer.from(base64Payload, 'base64');

      const saved = await saveWebpBannerBuffer(rawBuffer, {
        styleName,
        editionNumber,
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
      console.error('Error publishing /img.webp:', err);
      res
        .status(500)
        .json({ ok: false, error: 'Failed to publish WebP image' });
    }
  });

  // 4. Standalone Bulk Generation & ZIP Download Endpoint
  app.post('/api/bulk-generate', async (req: Request, res: Response) => {
    try {
      const { count = 10, concurrency = 4, format = 'png', width = 1440, height = 900 } = req.body || {};
      const { runBulkPosterGeneration } = await import('./src/server/bulkPosterGenerator.ts');
      
      const safeCount = Math.min(1000, Math.max(1, Number(count) || 10));
      const safeConcurrency = Math.min(8, Math.max(1, Number(concurrency) || 4));

      const result = await runBulkPosterGeneration({
        count: safeCount,
        concurrency: safeConcurrency,
        format: format === 'jpeg' ? 'jpeg' : 'png',
        width: Number(width) || 1440,
        height: Number(height) || 900,
        targetUrl: `http://localhost:${PORT}`,
      });

      res.json({
        ok: true,
        ...result,
        downloadUrl: `/api/bulk-download/${path.basename(result.zipPath)}`,
      });
    } catch (err: any) {
      console.error('Bulk generation error:', err);
      res.status(500).json({ ok: false, error: err.message || 'Bulk generation failed' });
    }
  });

  // Download generated ZIP archive
  app.get('/api/bulk-download/:filename', (req: Request, res: Response) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(process.cwd(), 'dist-posters', filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).send('ZIP file not found');
      return;
    }
    res.download(filePath, filename);
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
      `Poster Playground server listening on http://0.0.0.0:${PORT} (/img.webp ready)`
    );
  });
}

startServer();
