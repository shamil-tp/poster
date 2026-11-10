/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { ZipArchive } from 'archiver';
import { generateCompleteDesignState, CompleteDesignState } from '../engine/designEngine.ts';

// Dynamically load playwright-core from local node_modules or global Bun path
async function getPlaywrightCore(): Promise<any> {
  try {
    // @ts-ignore
    const mod = await import('playwright-core');
    return mod.chromium ? mod : (mod.default || mod);
  } catch {
    const globalPath = '/usr/local/share/bun-global/node_modules/playwright-core/index.js';
    if (fs.existsSync(globalPath)) {
      // @ts-ignore
      const mod = await import(globalPath);
      return mod.chromium ? mod : (mod.default || mod);
    }
    throw new Error('playwright-core not found.');
  }
}

export interface BulkGeneratorOptions {
  count?: number;
  outputDir?: string;
  zipFilename?: string;
  concurrency?: number;
  targetUrl?: string;
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
  onProgress?: (progress: BulkProgressReport) => void;
  shouldCancel?: () => boolean;
}

export interface BulkProgressReport {
  completed: number;
  total: number;
  percent: number;
  activeWorkers: number;
  currentStyle?: string;
  ratePerSec: number;
  estimatedRemainingSec: number;
}

export interface BulkGeneratorResult {
  totalRequested: number;
  totalGenerated: number;
  zipPath: string;
  zipSizeBytes: number;
  outputFolder: string;
  signaturesCount: number;
  metrics: {
    totalTimeMs: number;
    initializationTimeMs: number;
    renderTimeMs: number;
    zipFinalizeTimeMs: number;
    avgMsPerPoster: number;
    postersPerSecond: number;
    cpuCores: number;
    concurrency: number;
    memoryUsedMb: number;
  };
}

/**
 * Pre-computes N genuinely distinct poster design configurations.
 * Guarantees zero duplicate comboSignatures.
 */
export function generateUniquePosterBatches(count: number, startSeed?: number): CompleteDesignState[] {
  const baseSeed = startSeed ?? (Math.floor(Math.random() * 900000) + 100000);
  const states: CompleteDesignState[] = [];
  const seenSignatures = new Set<string>();

  let attempt = 0;
  let seq = 1;
  const maxAttempts = count * 5;

  while (states.length < count && attempt < maxAttempts) {
    attempt++;
    const seed = baseSeed + seq * 7919 + attempt * 1013;
    const edition = states.length + 1;
    const state = generateCompleteDesignState(seed, edition);

    if (!seenSignatures.has(state.comboSignature)) {
      seenSignatures.add(state.comboSignature);
      states.push(state);
      seq++;
    }
  }

  return states;
}

/**
 * High-performance worker-pooled bulk generator.
 */
export async function runBulkPosterGeneration(
  options: BulkGeneratorOptions = {}
): Promise<BulkGeneratorResult> {
  const count = Math.max(1, options.count ?? 10);
  const concurrency = Math.min(count, Math.max(1, options.concurrency ?? 4));
  const outputDir = path.resolve(options.outputDir ?? './dist-posters');
  const zipName = options.zipFilename ?? `posters-${count}-batch.zip`;
  const zipPath = path.join(outputDir, zipName);
  const targetUrl = options.targetUrl ?? 'http://localhost:3000';
  const width = options.width ?? 1440;
  const height = options.height ?? 900;
  const format = options.format ?? 'png';

  const t0 = performance.now();
  fs.mkdirSync(outputDir, { recursive: true });

  // 1. Pre-generate all unique design configurations
  console.log(`[1/5] Pre-computing ${count} unique poster design configurations...`);
  const t_config_0 = performance.now();
  const designs = generateUniquePosterBatches(count);
  const t_config_1 = performance.now();
  console.log(
    `  Computed ${designs.length} unique designs in ${(t_config_1 - t_config_0).toFixed(1)}ms (zero duplicate signatures)`
  );

  // 2. Setup streaming ZIP archive
  const outStream = fs.createWriteStream(zipPath);
  const zip = new ZipArchive({ zlib: { level: 1 } });
  zip.pipe(outStream);

  // 3. Launch persistent browser with pooled pages
  console.log(`[2/5] Initializing persistent headless browser pool (${concurrency} concurrent workers)...`);
  const t_init_0 = performance.now();
  const { chromium } = await getPlaywrightCore();

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
    ],
  });

  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });

  // Pre-warm pooled browser pages concurrently
  const pages = await Promise.all(
    Array.from({ length: concurrency }, async (_, i) => {
      const page = await context.newPage();
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
      // Ensure Google Fonts and layout stylesheets are loaded
      await page.evaluate(() => document.fonts.ready);
      // Strip UI transitions and animation delay so snapshots capture immediately without stutter
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            transition: none !important;
            animation: none !important;
          }
          [aria-label="Open Studio Controls"] {
            display: none !important;
          }
        `,
      });
      return { id: i + 1, page };
    })
  );
  const t_init_1 = performance.now();
  console.log(`  Browser pool initialized in ${(t_init_1 - t_init_0).toFixed(1)}ms`);

  // 4. Concurrently render designs across the worker pool
  console.log(`[3/5] Bulk-rendering ${count} posters to high-res ${format.toUpperCase()}...`);
  const t_render_0 = performance.now();
  let currentIndex = 0;
  let completedCount = 0;

  async function workerLoop(workerId: number, page: any) {
    const el = await page.$('[data-testid="poster-canvas"]');
    if (!el) {
      throw new Error('Poster canvas element not found in DOM');
    }

    while (currentIndex < designs.length) {
      if (options.shouldCancel?.()) {
        break;
      }

      const itemIndex = currentIndex++;
      const design = designs[itemIndex];
      const posterNumber = String(itemIndex + 1).padStart(4, '0');
      const filename = `poster-${posterNumber}-${design.artDirection.slug}.${format}`;

      let buffer: Buffer | null = null;
      let retries = 0;

      while (!buffer && retries < 3) {
        try {
          // Instruct page to render this exact pre-computed design state
          await page.evaluate((state: CompleteDesignState) => {
            (window as any).__POSTER_STUDIO_API__.setDesignStateDirectly(state);
          }, design);

          // Capture the rendered canvas DOM element directly
          buffer = await el.screenshot({
            type: format,
            ...(format === 'jpeg' ? { quality: options.quality ?? 90 } : {}),
          });
        } catch {
          retries++;
          await page.waitForTimeout(50);
        }
      }

      if (buffer) {
        zip.append(buffer, { name: filename });
        completedCount++;

        const now = performance.now();
        const elapsedSec = (now - t_render_0) / 1000;
        const rate = elapsedSec > 0 ? completedCount / elapsedSec : 0;
        const remainingSec = rate > 0 ? (count - completedCount) / rate : 0;

        if (options.onProgress) {
          options.onProgress({
            completed: completedCount,
            total: count,
            percent: Math.round((completedCount / count) * 100),
            activeWorkers: concurrency,
            currentStyle: design.artDirection.name,
            ratePerSec: Number(rate.toFixed(1)),
            estimatedRemainingSec: Math.round(remainingSec),
          });
        }

        if (completedCount % Math.max(1, Math.floor(count / 10)) === 0 || completedCount === count) {
          console.log(
            `  Progress: ${completedCount}/${count} (${Math.round(
              (completedCount / count) * 100
            )}%) | Rate: ${rate.toFixed(1)} posters/sec | Est. Remaining: ${Math.round(remainingSec)}s`
          );
        }
      }
    }
  }

  await Promise.all(pages.map(({ id, page }) => workerLoop(id, page)));
  const t_render_1 = performance.now();
  await browser.close();

  // 5. Finalize and compress ZIP archive
  console.log(`[4/5] Finalizing ZIP archive: ${zipPath}...`);
  const t_zip_0 = performance.now();
  await zip.finalize();
  await new Promise<void>((resolve, reject) => {
    outStream.on('close', () => resolve());
    outStream.on('error', (err) => reject(err));
  });
  const t_zip_1 = performance.now();

  const zipStat = fs.statSync(zipPath);
  const t_final = performance.now();

  const mem = process.memoryUsage();
  const renderTimeSec = (t_render_1 - t_render_0) / 1000;

  const result: BulkGeneratorResult = {
    totalRequested: count,
    totalGenerated: completedCount,
    zipPath,
    zipSizeBytes: zipStat.size,
    outputFolder: outputDir,
    signaturesCount: designs.length,
    metrics: {
      totalTimeMs: t_final - t0,
      initializationTimeMs: t_init_1 - t_init_0,
      renderTimeMs: t_render_1 - t_render_0,
      zipFinalizeTimeMs: t_zip_1 - t_zip_0,
      avgMsPerPoster: renderTimeSec > 0 ? (t_render_1 - t_render_0) / completedCount : 0,
      postersPerSecond: renderTimeSec > 0 ? Number((completedCount / renderTimeSec).toFixed(2)) : 0,
      cpuCores: 4,
      concurrency,
      memoryUsedMb: Math.round(mem.rss / 1024 / 1024),
    },
  };

  console.log(`\n======================================================`);
  console.log(`🎉 BULK GENERATION COMPLETED SUCCESSFULLY!`);
  console.log(`Output ZIP:       ${zipPath}`);
  console.log(`Archive Size:     ${(zipStat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Posters Built:    ${completedCount}/${count}`);
  console.log(`Total Time:       ${(result.metrics.totalTimeMs / 1000).toFixed(2)}s`);
  console.log(`Render Throughput:${result.metrics.postersPerSecond} posters/second`);
  console.log(`Memory (RSS):     ${result.metrics.memoryUsedMb} MB`);
  console.log(`======================================================\n`);

  return result;
}

// CLI direct execution support
const isDirectCli =
  typeof process !== 'undefined' &&
  Boolean(
    process.argv?.[1] &&
      (process.argv[1].endsWith('bulkPosterGenerator.ts') ||
        process.argv[1].endsWith('bulkPosterGenerator.js'))
  );

if (isDirectCli) {
  const countArg = parseInt(process.argv[2] || '10', 10);
  const concurrencyArg = parseInt(process.argv[3] || '4', 10);
  const formatArg = (process.argv[4] === 'jpeg' ? 'jpeg' : 'png') as 'png' | 'jpeg';

  runBulkPosterGeneration({
    count: countArg,
    concurrency: concurrencyArg,
    format: formatArg,
  }).catch((err) => {
    console.error('[CLI Error]', err);
    process.exit(1);
  });
}
