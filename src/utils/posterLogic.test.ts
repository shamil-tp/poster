import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DESIGN_STYLES_50,
  createHybridDesignStyle,
  generateUniquePosterRecipe,
} from './posterStyles';
import {
  parsePortfolioMarkdown,
  selectPosterDataSlice,
  INITIAL_RAW_MARKDOWN,
} from './knowledgeParser';
import { ENRICHED_STYLES_50 } from '../engine/designStyles';
import { CURATED_HYBRID_PAIRS, blendEnrichedStyles } from '../engine/hybridGenerator';
import { LAYOUT_ARCHETYPES } from '../engine/layoutGenerator';
import { generateCompleteDesignState, createSeededRng } from '../engine/designEngine';
import {
  ILLUSTRATION_ASSETS_39,
  selectAssetsForStyle,
  createExpandableAssetSpec,
  getAllIllustrationAssets,
} from '../engine/assetRegistry';
import {
  extractUsedFontFamilies,
  filterFontFaceBlocks,
  convertViewportUnitsInCss,
  computeExportDimensions,
} from './posterExporter';

test('all 50 enriched design styles exist with illustration subjects, compatible hybrids, and motion personalities', () => {
  assert.equal(DESIGN_STYLES_50.length, 50);
  assert.equal(ENRICHED_STYLES_50.length, 50);
  for (let i = 0; i < 50; i++) {
    const style = ENRICHED_STYLES_50[i];
    assert.equal(style.id, i + 1);
    assert.ok(style.illustrationSubject.length > 10, `Style ${style.id} missing illustrationSubject`);
    assert.ok(style.preferredLayouts.length >= 2, `Style ${style.id} needs preferredLayouts`);
    assert.ok(style.compatibleHybrids.length >= 3, `Style ${style.id} needs compatibleHybrids`);
    assert.ok(style.motionPersonality.length > 0, `Style ${style.id} needs motionPersonality`);
  }
});

test('all 39 supplied illustration assets (img1..img39) are cataloged with valid metadata and style compatibility', () => {
  assert.equal(ILLUSTRATION_ASSETS_39.length, 39);
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();

  for (let i = 0; i < 39; i++) {
    const asset = ILLUSTRATION_ASSETS_39[i];
    assert.equal(asset.id, `asset-img${i + 1}`);
    assert.ok(asset.url.startsWith('/assets/aistudio/img'));
    assert.ok(asset.width > 0 && asset.height > 0);
    assert.ok(asset.aspectRatio > 0);
    assert.ok(asset.compatibleStyleIds.length >= 4);
    assert.ok(asset.compatibleCategories.length >= 2);
    assert.ok(!seenIds.has(asset.id));
    assert.ok(!seenUrls.has(asset.url));
    seenIds.add(asset.id);
    seenUrls.add(asset.url);
  }
});

test('every one of the 50 design styles selects a cohesive 4-asset ensemble without duplicates', () => {
  const rng = createSeededRng(777);
  for (let styleId = 1; styleId <= 50; styleId++) {
    const state = generateCompleteDesignState(styleId * 997, styleId, {
      forceStyleId: styleId,
      forceHybrid: false,
    });
    const {
      primaryAsset,
      secondaryAsset,
      ensembleAssets,
      compatiblePoolSize,
    } = selectAssetsForStyle(state.artDirection, rng);
    assert.ok(primaryAsset.id.startsWith('asset-img'));
    assert.ok(secondaryAsset.id.startsWith('asset-img'));
    assert.notEqual(primaryAsset.id, secondaryAsset.id);
    assert.equal(ensembleAssets.length, 4);
    assert.equal(new Set(ensembleAssets.map((a) => a.id)).size, 4);
    assert.ok(compatiblePoolSize >= 1);
  }
});

test('expandable asset system registers new assets (e.g. img40.png) and includes them in selection pool', () => {
  const expanded = createExpandableAssetSpec({
    url: '/assets/aistudio/img40.png',
    filename: 'img40.png',
    title: 'Future Constructivist Emblem',
    visualCategory: 'bauhaus-geometric',
    width: 1200,
    height: 1600,
  });
  const pool = getAllIllustrationAssets([expanded]);
  assert.equal(pool.length, 40);
  assert.equal(pool[0].filename, 'img40.png');
  assert.equal(pool[0].format, 'png');
  assert.equal(pool[0].hasTransparency, true);

  const forcedState = generateCompleteDesignState(12345, 1, {
    customAssets: [expanded],
    forceAssetId: expanded.id,
  });
  assert.equal(forcedState.illustration.primaryAsset.id, expanded.id);
});

test('all 14 curated hybrid pairs blend into cohesive art directions', () => {
  assert.equal(CURATED_HYBRID_PAIRS.length, 14);
  for (const [idA, idB, note] of CURATED_HYBRID_PAIRS) {
    const sA = ENRICHED_STYLES_50[idA - 1];
    const sB = ENRICHED_STYLES_50[idB - 1];
    const blended = blendEnrichedStyles(sA, sB, 1);
    assert.equal(blended.isHybrid, true);
    assert.equal(blended.harmonyNote, note);
    assert.ok(blended.name.includes(sA.name) && blended.name.includes(sB.name));
  }
});

test('generateCompleteDesignState is deterministic for a given seed and supports independent Type and Layout randomization', () => {
  const stateA = generateCompleteDesignState(424242, 1);
  const stateB = generateCompleteDesignState(424242, 1);
  assert.equal(stateA.comboSignature, stateB.comboSignature);
  assert.equal(stateA.artDirection.signatureId, stateB.artDirection.signatureId);
  assert.equal(stateA.layout.id, stateB.layout.id);
  assert.equal(stateA.typography.id, stateB.typography.id);
  assert.equal(
    stateA.illustration.primaryAsset.id,
    stateB.illustration.primaryAsset.id
  );

  // Independent Typography randomization preserves style, layout, and primary asset
  const typeMutated = generateCompleteDesignState(424242, 1, {
    typeOverrideIndex: 3,
  });
  assert.equal(typeMutated.artDirection.signatureId, stateA.artDirection.signatureId);
  assert.equal(typeMutated.layout.id, stateA.layout.id);
  assert.notEqual(typeMutated.typography.id, stateA.typography.id);
  assert.equal(
    typeMutated.illustration.primaryAsset.id,
    stateA.illustration.primaryAsset.id
  );

  // Independent Layout randomization preserves style, typography, and primary asset
  const layoutMutated = generateCompleteDesignState(424242, 1, {
    layoutOverrideIndex: 5,
  });
  assert.equal(layoutMutated.artDirection.signatureId, stateA.artDirection.signatureId);
  assert.equal(layoutMutated.typography.id, stateA.typography.id);
  assert.equal(layoutMutated.layout.id, LAYOUT_ARCHETYPES[5 % LAYOUT_ARCHETYPES.length].id);
});

test('consecutive regenerations produce distinct styles, layouts, collage arrangements, and randomized multi-image counts', () => {
  let prev = generateCompleteDesignState(1001, 1);
  const usedAssets = new Set<string>(prev.illustration.ensembleAssets.map((a) => a.id));
  const usedArrangements = new Set<string>([prev.illustration.collageArrangement]);
  const seenImageCounts = new Set<number>([prev.illustration.imageCount]);

  for (let i = 2; i <= 30; i++) {
    const next = generateCompleteDesignState(1001 + i * 7919, i, {
      previousState: prev,
      projectCount: 12,
      photoCount: 3,
    });
    assert.notEqual(next.artDirection.signatureId, prev.artDirection.signatureId);
    assert.notEqual(next.projectIndex, prev.projectIndex);
    assert.notEqual(next.photoIndex, prev.photoIndex);
    assert.notEqual(
      next.illustration.collageArrangement,
      prev.illustration.collageArrangement
    );
    for (const a of next.illustration.ensembleAssets) {
      usedAssets.add(a.id);
    }
    assert.ok(
      next.illustration.imageCount === 1 || next.illustration.imageCount === 2,
      `Expected imageCount to be 1 or 2, got ${next.illustration.imageCount}`
    );
    usedArrangements.add(next.illustration.collageArrangement);
    seenImageCounts.add(next.illustration.imageCount);
    prev = next;
  }
  assert.ok(usedAssets.size >= 20, `Expected >= 20 distinct assets across 30 ensembles, got ${usedAssets.size}`);
  assert.ok(usedArrangements.size >= 6, `Expected >= 6 distinct collage arrangements, got ${usedArrangements.size}`);
  assert.ok(seenImageCounts.has(1) && seenImageCounts.has(2), 'Expected both single-image (1) and two-image (2) compositions');
});

test('legacy createHybridDesignStyle and generateUniquePosterRecipe remain functional', () => {
  const neoclassical = DESIGN_STYLES_50[0];
  const cybercore = DESIGN_STYLES_50[23];
  const hybrid = createHybridDesignStyle(neoclassical, cybercore, 7);
  assert.equal(hybrid.isHybrid, true);

  const seen: string[] = [];
  const recipe = generateUniquePosterRecipe(seen, { seedOffset: 10 });
  assert.ok(recipe.comboSignature.length > 0);
});

test('parsePortfolioMarkdown and selectPosterDataSlice accurately filter Shamil TP portfolio dossiers', () => {
  const kb = parsePortfolioMarkdown(INITIAL_RAW_MARKDOWN);
  assert.equal(kb.identity.fullName, 'Shamil TP');
  assert.equal(kb.projects.length, 12);

  const rewindSlice = selectPosterDataSlice(kb, {
    projectIndex: 0,
    experienceIndex: 0,
    hackathonIndex: 0,
    skillGroupIndex: 0,
    educationIndex: 0,
    photoIndex: 1,
    searchQuery: 'Golang',
  });
  assert.equal(rewindSlice.focalProject.id, 'rewind');
});

test('posterExporter helpers accurately extract custom fonts, filter @font-face rules, convert viewport units, and compute high-DPI dimensions', () => {
  const families = extractUsedFontFamilies([
    "'Cinzel', 'Cormorant Garamond', Georgia, serif",
    "'JetBrains Mono', monospace",
    '"Cinzel", sans-serif',
  ]);
  assert.deepEqual(families, ['Cinzel', 'Cormorant Garamond', 'JetBrains Mono']);

  const sampleGoogleCss = `
    @font-face {
      font-family: 'Cinzel';
      src: url(https://fonts.gstatic.com/s/cinzel/v23/abc.woff2) format('woff2');
    }
    @font-face {
      font-family: 'Bangers';
      src: url(https://fonts.gstatic.com/s/bangers/v20/xyz.woff2) format('woff2');
    }
    @font-face {
      font-family: 'JetBrains Mono';
      src: url(https://fonts.gstatic.com/s/jetbrainsmono/v18/def.woff2) format('woff2');
    }
  `;
  const filteredBlocks = filterFontFaceBlocks(sampleGoogleCss, [
    'Cinzel',
    'JetBrains Mono',
  ]);
  assert.equal(filteredBlocks.length, 2);
  assert.ok(filteredBlocks[0].includes('Cinzel'));
  assert.ok(filteredBlocks[1].includes('JetBrains Mono'));

  const convertedCss = convertViewportUnitsInCss(
    '.hero { width: 100vw; height: 100dvh; max-width: 40vw; }',
    1440,
    900
  );
  assert.equal(
    convertedCss,
    '.hero { width: 1440.00px; height: 900.00px; max-width: 576.00px; }'
  );

  const dims = computeExportDimensions(1440, 900, 2);
  assert.deepEqual(dims, {
    width: 1440,
    height: 900,
    exportWidth: 2880,
    exportHeight: 1800,
    scale: 2,
  });
});

test('/img WebP route helpers validate RIFF WebP bytes, compute content-hash ETags, handle 304 caching, and update GitHub Camo README URLs', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const {
    isValidWebpBuffer,
    computeWebpContentHash,
    buildImgResponseHeaders,
    isConditionalRequestFresh,
    buildCamoSafePosterUrls,
    updateReadmePosterImageUrl,
  } = await import('./imgRouteHeaders');

  // Verify the baseline WebP banner file on disk is a genuine RIFF....WEBP image
  const bannerPath = path.join(process.cwd(), 'public', 'assets', 'poster-banner.webp');
  assert.ok(fs.existsSync(bannerPath), 'public/assets/poster-banner.webp should exist');
  const bannerBuf = fs.readFileSync(bannerPath);
  assert.equal(isValidWebpBuffer(bannerBuf), true, 'Baseline banner must have valid RIFF WEBP magic bytes');

  const htmlBuf = Buffer.from('<!doctype html><html><body>not webp</body></html>');
  assert.equal(isValidWebpBuffer(htmlBuf), false, 'HTML buffer must be rejected as non-WebP');

  const { version, etag } = computeWebpContentHash(bannerBuf);
  assert.equal(version.length, 12);
  assert.equal(etag, `"${version}"`);

  // Unversioned /img request -> must-revalidate, no-cache so stale images are never served
  const unversionedHeaders = buildImgResponseHeaders({
    version,
    etag,
    lastModified: 'Tue, 10 Nov 2026 04:00:00 GMT',
    byteLength: bannerBuf.byteLength,
    requestedVersion: null,
  });
  assert.equal(unversionedHeaders['Content-Type'], 'image/webp');
  assert.equal(unversionedHeaders['ETag'], etag);
  assert.ok(unversionedHeaders['Cache-Control'].includes('must-revalidate'));
  assert.equal(unversionedHeaders['Cross-Origin-Resource-Policy'], 'cross-origin');

  // Versioned /img?v=<version> request -> immutable cache header
  const versionedHeaders = buildImgResponseHeaders({
    version,
    etag,
    lastModified: 'Tue, 10 Nov 2026 04:00:00 GMT',
    byteLength: bannerBuf.byteLength,
    requestedVersion: version,
  });
  assert.equal(versionedHeaders['Cache-Control'], 'public, max-age=31536000, immutable');

  // Conditional request evaluation (If-None-Match & If-Modified-Since)
  assert.equal(
    isConditionalRequestFresh({
      ifNoneMatch: etag,
      etag,
      lastModified: 'Tue, 10 Nov 2026 04:00:00 GMT',
    }),
    true
  );
  assert.equal(
    isConditionalRequestFresh({
      ifNoneMatch: `W/${etag}`,
      etag,
      lastModified: 'Tue, 10 Nov 2026 04:00:00 GMT',
    }),
    true
  );
  assert.equal(
    isConditionalRequestFresh({
      ifNoneMatch: '"stalehash000"',
      etag,
      lastModified: 'Tue, 10 Nov 2026 04:00:00 GMT',
    }),
    false
  );

  // GitHub Camo URL builder & README updater
  const urls = buildCamoSafePosterUrls('https://poster.shamiltp.life', 'a1b2c3d4e5f6');
  assert.equal(urls.directUrl, 'https://poster.shamiltp.life/img');
  assert.equal(urls.versionedQueryUrl, 'https://poster.shamiltp.life/img?v=a1b2c3d4e5f6');
  assert.equal(urls.versionedPathUrl, 'https://poster.shamiltp.life/img/a1b2c3d4e5f6.webp');

  const updatedReadme = updateReadmePosterImageUrl(
    '# Poster Playground\n\n[![Poster Playground](https://poster.shamiltp.life/img?v=oldversion11)](https://poster.shamiltp.life)\n',
    'newversion99'
  );
  assert.ok(updatedReadme.includes('https://poster.shamiltp.life/img?v=newversion99'));
  assert.ok(!updatedReadme.includes('oldversion11'));
});


