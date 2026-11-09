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

test('every one of the 50 design styles selects compatible primary and distinct secondary illustration assets', () => {
  const rng = createSeededRng(777);
  for (let styleId = 1; styleId <= 50; styleId++) {
    const state = generateCompleteDesignState(styleId * 997, styleId, {
      forceStyleId: styleId,
      forceHybrid: false,
    });
    const { primaryAsset, secondaryAsset, compatiblePoolSize } = selectAssetsForStyle(
      state.artDirection,
      rng
    );
    assert.ok(primaryAsset.id.startsWith('asset-img'));
    assert.ok(secondaryAsset.id.startsWith('asset-img'));
    assert.notEqual(primaryAsset.id, secondaryAsset.id);
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

test('consecutive regenerations produce distinct styles, layouts, projects, photos, and diverse illustration assets', () => {
  let prev = generateCompleteDesignState(1001, 1);
  const usedAssets = new Set<string>([prev.illustration.primaryAsset.id]);
  for (let i = 2; i <= 30; i++) {
    const next = generateCompleteDesignState(1001 + i * 7919, i, {
      previousState: prev,
      projectCount: 12,
      photoCount: 3,
    });
    assert.notEqual(next.artDirection.signatureId, prev.artDirection.signatureId);
    assert.notEqual(next.projectIndex, prev.projectIndex);
    assert.notEqual(next.photoIndex, prev.photoIndex);
    usedAssets.add(next.illustration.primaryAsset.id);
    prev = next;
  }
  // Across 30 regenerations, at least 12 distinct assets should be selected
  assert.ok(usedAssets.size >= 12, `Expected >= 12 distinct assets across 30 regenerations, got ${usedAssets.size}`);
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
