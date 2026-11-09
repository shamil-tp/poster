import React, { useState, useEffect } from 'react';
import { SynthesizedArtDirection } from './hybridGenerator';
import { PortfolioPhoto } from '../utils/knowledgeParser';
import {
  IllustrationAssetSpec,
  selectAssetsForStyle,
} from './assetRegistry';
import { Layers, Shuffle, Grid } from 'lucide-react';

export type IllustrationCompositionMode =
  | 'supplied-asset-plate'
  | 'multi-asset-layer'
  | 'asset-portrait-fusion'
  | 'edge-bleed-asset'
  | 'typographic-geometric-totem';

export type CollageArrangementId =
  | 'scattered-zine-pinboard'
  | 'triptych-gallery-cascade'
  | 'constructivist-diagonal-stack'
  | 'mosaic-asymmetric-cluster'
  | 'editorial-overlap-diptych'
  | 'mixed-media-scrapbook-totem'
  | 'orbiting-satellite-plates'
  | 'monolithic-spotlight';

export type CanvasScatterMode =
  | 'none'
  | 'corner-counterpoint'
  | 'diagonal-echo-plates'
  | 'floating-marginalia-stamps'
  | 'ambient-bleed';

export type AssetMaskShape =
  | 'none'
  | 'arch'
  | 'circle'
  | 'octagon'
  | 'diagonal-slice'
  | 'offset-window';

export interface IllustrationConfig {
  id: string;
  title: string;
  subject: string;
  category: SynthesizedArtDirection['illustrationCategory'];
  scaleFactor: number;
  rotationDeg: number;
  framingMode:
    | 'integrated-portrait-sculpture'
    | 'pure-procedural-totem'
    | 'duotone-collage-cutout';
  compositionMode: IllustrationCompositionMode;
  collageArrangement: CollageArrangementId;
  canvasScatterMode: CanvasScatterMode;
  imageCount: 1 | 2 | 3 | 4;
  includePortraitInCollage: boolean;
  primaryAsset: IllustrationAssetSpec;
  secondaryAsset: IllustrationAssetSpec;
  ensembleAssets: IllustrationAssetSpec[];
  maskShape: AssetMaskShape;
  cropMode: 'contain' | 'cover-center' | 'cover-top' | 'artistic-zoom';
  blendTreatment: 'normal' | 'duotone-tint' | 'high-contrast-ink' | 'warm-vintage';
  secondaryPlacement:
    | 'top-right-overlap'
    | 'bottom-left-cutout'
    | 'split-diptych'
    | 'floating-stamp';
  overflowBleed: boolean;
}

export const COLLAGE_ARRANGEMENTS: {
  id: CollageArrangementId;
  label: string;
  defaultCount: 1 | 2 | 3 | 4;
}[] = [
  { id: 'scattered-zine-pinboard', label: 'Zine Pinboard Collage', defaultCount: 3 },
  { id: 'triptych-gallery-cascade', label: 'Triptych Cascade', defaultCount: 3 },
  { id: 'constructivist-diagonal-stack', label: 'Constructivist Stack', defaultCount: 3 },
  { id: 'mosaic-asymmetric-cluster', label: 'Asymmetric Mosaic', defaultCount: 4 },
  { id: 'editorial-overlap-diptych', label: 'Editorial Diptych', defaultCount: 2 },
  { id: 'mixed-media-scrapbook-totem', label: 'Mixed-Media Scrapbook', defaultCount: 4 },
  { id: 'orbiting-satellite-plates', label: 'Orbiting Satellites', defaultCount: 3 },
  { id: 'monolithic-spotlight', label: 'Monolithic Spotlight', defaultCount: 1 },
];

export function generateIllustrationConfig(
  artDirection: SynthesizedArtDirection,
  rng: () => number,
  options?: {
    customAssets?: IllustrationAssetSpec[];
    excludeAssetIds?: string[];
    forceAssetId?: string;
    previousArrangement?: CollageArrangementId;
  }
): IllustrationConfig {
  const { primaryAsset, secondaryAsset, ensembleAssets } = selectAssetsForStyle(
    artDirection,
    rng,
    options
  );

  // Determine preferred collage arrangements based on the style's visual category,
  // avoiding repeating the previous arrangement.
  let preferredArrangements: CollageArrangementId[] = [
    'scattered-zine-pinboard',
    'triptych-gallery-cascade',
    'constructivist-diagonal-stack',
    'mosaic-asymmetric-cluster',
    'editorial-overlap-diptych',
    'mixed-media-scrapbook-totem',
    'orbiting-satellite-plates',
    'monolithic-spotlight',
  ];

  if (
    artDirection.illustrationCategory === 'collage-scrapbook' ||
    artDirection.illustrationCategory === 'character-mascot'
  ) {
    preferredArrangements = [
      'scattered-zine-pinboard',
      'mixed-media-scrapbook-totem',
      'mosaic-asymmetric-cluster',
      'triptych-gallery-cascade',
    ];
  } else if (
    artDirection.illustrationCategory === 'geometric-construct' ||
    artDirection.illustrationCategory === 'cyber-schematic' ||
    artDirection.illustrationCategory === 'pixel-retro'
  ) {
    preferredArrangements = [
      'constructivist-diagonal-stack',
      'mosaic-asymmetric-cluster',
      'triptych-gallery-cascade',
      'orbiting-satellite-plates',
    ];
  } else if (
    artDirection.illustrationCategory === 'zen-ceramic' ||
    artDirection.illustrationCategory === 'botanical-organic' ||
    artDirection.illustrationCategory === 'classical-sculpture'
  ) {
    preferredArrangements = [
      'editorial-overlap-diptych',
      'triptych-gallery-cascade',
      'orbiting-satellite-plates',
      'monolithic-spotlight',
    ];
  }

  const candidateArrangements = preferredArrangements.filter(
    (a) => a !== options?.previousArrangement
  );
  const chosenPool =
    candidateArrangements.length > 0 ? candidateArrangements : preferredArrangements;

  // 75% pick from style-preferred arrangements, 25% pick from all 8 for unexpected art direction
  const allIds = COLLAGE_ARRANGEMENTS.map((c) => c.id).filter(
    (a) => a !== options?.previousArrangement
  );
  const collageArrangement: CollageArrangementId =
    rng() < 0.75
      ? chosenPool[Math.floor(rng() * chosenPool.length)]
      : allIds[Math.floor(rng() * allIds.length)] || 'scattered-zine-pinboard';

  // Randomize number of combined images (1 to 4 illustrations + optional portrait photo)
  const countRoll = rng();
  let imageCount: 1 | 2 | 3 | 4 = 3;
  if (collageArrangement === 'monolithic-spotlight') {
    imageCount = countRoll < 0.65 ? 1 : 2;
  } else if (collageArrangement === 'editorial-overlap-diptych') {
    imageCount = countRoll < 0.75 ? 2 : 3;
  } else if (
    collageArrangement === 'mosaic-asymmetric-cluster' ||
    collageArrangement === 'mixed-media-scrapbook-totem'
  ) {
    imageCount = countRoll < 0.58 ? 4 : 3;
  } else {
    if (countRoll < 0.14) imageCount = 1;
    else if (countRoll < 0.42) imageCount = 2;
    else if (countRoll < 0.76) imageCount = 3;
    else imageCount = 4;
  }

  // Weave Shamil TP's portrait photo into the multi-image arrangement ~45% of the time
  const includePortraitInCollage = rng() < 0.48;

  const compositionMode: IllustrationCompositionMode =
    imageCount >= 2
      ? 'multi-asset-layer'
      : includePortraitInCollage
      ? 'asset-portrait-fusion'
      : 'supplied-asset-plate';

  const framingMode: IllustrationConfig['framingMode'] =
    imageCount >= 2
      ? 'duotone-collage-cutout'
      : 'integrated-portrait-sculpture';

  const scatterOptions: CanvasScatterMode[] = [
    'corner-counterpoint',
    'diagonal-echo-plates',
    'floating-marginalia-stamps',
    'ambient-bleed',
    'none',
  ];
  const canvasScatterMode =
    scatterOptions[Math.floor(rng() * scatterOptions.length)];

  const masks: AssetMaskShape[] = [
    'none',
    'arch',
    'circle',
    'octagon',
    'diagonal-slice',
    'offset-window',
  ];
  const maskShape =
    artDirection.illustrationCategory === 'botanical-organic' ||
    artDirection.illustrationCategory === 'zen-ceramic'
      ? rng() < 0.6
        ? 'arch'
        : 'none'
      : artDirection.illustrationCategory === 'classical-sculpture' ||
        artDirection.illustrationCategory === 'ornate-engraving'
      ? rng() < 0.55
        ? 'circle'
        : 'arch'
      : masks[Math.floor(rng() * masks.length)];

  const cropRoll = rng();
  const cropMode: IllustrationConfig['cropMode'] =
    cropRoll < 0.45
      ? primaryAsset.recommendedCrop
      : cropRoll < 0.75
      ? 'cover-center'
      : cropRoll < 0.9
      ? 'contain'
      : 'artistic-zoom';

  const blendRoll = rng();
  const blendTreatment: IllustrationConfig['blendTreatment'] =
    blendRoll < 0.62
      ? 'normal'
      : blendRoll < 0.78
      ? 'warm-vintage'
      : blendRoll < 0.9
      ? 'duotone-tint'
      : 'high-contrast-ink';

  const placements: IllustrationConfig['secondaryPlacement'][] = [
    'top-right-overlap',
    'bottom-left-cutout',
    'split-diptych',
    'floating-stamp',
  ];
  const secondaryPlacement = placements[Math.floor(rng() * placements.length)];

  return {
    id: `illus-${artDirection.signatureId}-${primaryAsset.id}-${collageArrangement}-${Math.floor(
      rng() * 1000
    )}`,
    title:
      imageCount > 1
        ? `${primaryAsset.title} + ${imageCount - 1} Companion Plate${
            imageCount > 2 ? 's' : ''
          }`
        : primaryAsset.title,
    subject: `${primaryAsset.subject} · ${artDirection.illustrationSubject}`,
    category: artDirection.illustrationCategory,
    scaleFactor: 0.96 + rng() * 0.16,
    rotationDeg: (rng() - 0.5) * 5,
    framingMode,
    compositionMode,
    collageArrangement,
    canvasScatterMode,
    imageCount,
    includePortraitInCollage,
    primaryAsset,
    secondaryAsset,
    ensembleAssets,
    maskShape,
    cropMode,
    blendTreatment,
    secondaryPlacement,
    overflowBleed: canvasScatterMode !== 'none',
  };
}

export type IllustrationFrameVariant =
  | 'default'
  | 'circle-medallion'
  | 'arch-niche'
  | 'frameless-overlap'
  | 'polaroid-tape'
  | 'full-bleed-backdrop'
  | 'stamp-seal';

interface ProceduralIllustrationProps {
  artDirection: SynthesizedArtDirection;
  config: IllustrationConfig;
  photo: PortfolioPhoto;
  pointer?: { x: number; y: number; active: boolean; influence?: number };
  onCyclePhoto: () => void;
  compact?: boolean;
  frameVariant?: IllustrationFrameVariant;
  className?: string;
  pureVectorDefault?: boolean;
}

export const ProceduralIllustration: React.FC<ProceduralIllustrationProps> = ({
  artDirection,
  config,
  photo,
  onCyclePhoto,
  compact = false,
  frameVariant = 'default',
  className = '',
}) => {
  const [activeArrangement, setActiveArrangement] = useState<CollageArrangementId>(
    config.collageArrangement
  );
  const [activeImageCount, setActiveImageCount] = useState<1 | 2 | 3 | 4>(
    config.imageCount
  );
  const [showPortrait, setShowPortrait] = useState<boolean>(
    config.includePortraitInCollage
  );
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveArrangement(config.collageArrangement);
    setActiveImageCount(config.imageCount);
    setShowPortrait(config.includePortraitInCollage);
    setFailedUrls({});
  }, [
    config.id,
    config.collageArrangement,
    config.imageCount,
    config.includePortraitInCollage,
  ]);

  const markUrlFailed = (url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
  };

  const getAssetFilter = (): string => {
    switch (config.blendTreatment) {
      case 'high-contrast-ink':
        return 'contrast(1.16) saturate(1.08)';
      case 'warm-vintage':
        return 'sepia(0.14) contrast(1.06) saturate(1.08)';
      case 'duotone-tint':
        return 'contrast(1.12) saturate(1.16)';
      default:
        return 'contrast(1.03)';
    }
  };

  const renderCategoryVectorArt = () => {
    const c1 = artDirection.accentPrimary;
    const c2 = artDirection.accentSecondary;
    const fg = artDirection.textPrimary;
    const border = artDirection.borderColor;

    switch (config.category) {
      case 'classical-sculpture':
      case 'ornate-engraving':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g>
              <circle cx="200" cy="200" r="182" stroke={c1} strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="200" cy="200" r="154" stroke={border} strokeWidth="1" />
              <polygon points="16,56 200,12 384,56" stroke={c1} strokeWidth="1.5" fill={c1 + '12'} />
            </g>
          </svg>
        );

      case 'geometric-construct':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g>
              <rect x="28" y="28" width="344" height="344" stroke={fg} strokeWidth="2" />
              <circle cx="110" cy="110" r="78" fill={c1} opacity="0.35" />
              <rect x="210" y="210" width="140" height="140" fill={c2} opacity="0.35" />
              <line x1="16" y1="200" x2="384" y2="200" stroke={fg} strokeWidth="1.2" strokeDasharray="6 6" />
              <line x1="200" y1="16" x2="200" y2="384" stroke={fg} strokeWidth="1.2" strokeDasharray="6 6" />
            </g>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g>
              <rect x="28" y="28" width="344" height="344" stroke={c1} strokeWidth="1.5" opacity="0.55" />
              <circle cx="200" cy="200" r="148" stroke={c2} strokeWidth="1.5" strokeDasharray="8 6" opacity="0.6" />
              <path d="M 60 340 L 340 60 M 60 60 L 340 340" stroke={c1} strokeWidth="1" opacity="0.4" />
            </g>
          </svg>
        );
    }
  };

  // Resolve the active slice of ensemble assets (1 to 4 distinct images)
  const validEnsemble = config.ensembleAssets.filter(
    (a) => !failedUrls[a.url]
  );
  const assetsToRender = (
    validEnsemble.length > 0 ? validEnsemble : [config.primaryAsset]
  ).slice(0, compact ? 2 : activeImageCount);

  const a0 = assetsToRender[0] || config.primaryAsset;
  const a1 = assetsToRender[1] || config.secondaryAsset;
  const a2 = assetsToRender[2] || config.ensembleAssets[2] || a0;
  const a3 = assetsToRender[3] || config.ensembleAssets[3] || a1;

  const isFrameless =
    frameVariant === 'frameless-overlap' ||
    frameVariant === 'full-bleed-backdrop' ||
    frameVariant === 'stamp-seal';

  const outerShapeClasses =
    frameVariant === 'circle-medallion' || frameVariant === 'stamp-seal'
      ? 'rounded-full aspect-square'
      : frameVariant === 'arch-niche' && activeImageCount === 1
      ? 'rounded-t-[999px]'
      : '';

  // Helper to render an individual image plate inside a collage with custom framing, tape, or mask
  const renderAssetCard = (
    asset: IllustrationAssetSpec,
    idx: number,
    layoutClasses: string,
    options?: {
      shape?: 'rect' | 'arch' | 'circle' | 'polaroid' | 'octagon' | 'diagonal';
      tape?: boolean;
      parallaxX?: number;
      parallaxY?: number;
      fit?: 'cover' | 'contain';
      badgeLabel?: string;
      zIndexClass?: string;
    }
  ) => {
    const {
      shape = 'rect',
      tape = false,
      parallaxX = idx % 2 === 0 ? -7 : 9,
      parallaxY = idx % 2 === 0 ? -6 : 8,
      fit = asset.recommendedCrop === 'contain' ? 'contain' : 'cover',
      badgeLabel,
      zIndexClass = 'z-10',
    } = options || {};

    const shapeClass =
      shape === 'circle'
        ? 'rounded-full'
        : shape === 'arch'
        ? 'rounded-t-[999px]'
        : shape === 'polaroid'
        ? 'p-1.5 sm:p-2 pb-5 sm:pb-6 bg-zinc-100 text-zinc-900'
        : '';

    const clipPath =
      shape === 'octagon'
        ? 'polygon(18% 0%, 82% 0%, 100% 18%, 100% 82%, 82% 100%, 18% 100%, 0% 82%, 0% 18%)'
        : shape === 'diagonal'
        ? 'polygon(0% 0%, 95% 0%, 100% 90%, 5% 100%)'
        : undefined;

    return (
      <div
        key={`${asset.id}-${idx}`}
        className={`overflow-hidden pointer-events-none shadow-xl border-2 ${shapeClass} ${zIndexClass} ${layoutClasses}`}
        style={{
          borderColor:
            idx === 0
              ? artDirection.accentPrimary
              : idx === 1
              ? artDirection.accentSecondary
              : artDirection.borderColor,
          backgroundColor:
            shape === 'polaroid'
              ? '#F8F7F4'
              : asset.dominantPalette[2] || artDirection.bgSurface,
          clipPath,
          transform: compact
            ? undefined
            : `translate3d(calc(var(--px, 0) * ${parallaxX}px), calc(var(--py, 0) * ${parallaxY}px), 0)`,
        }}
      >
        {tape && !compact && (
          <div
            aria-hidden="true"
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 z-30 opacity-85 -rotate-2"
            style={{
              backgroundColor:
                idx % 2 === 0
                  ? artDirection.accentPrimary
                  : artDirection.accentSecondary,
            }}
          />
        )}
        <img
          src={asset.url}
          alt={asset.title}
          onError={() => markUrlFailed(asset.url)}
          className={`w-full h-full ${
            fit === 'contain' ? 'object-contain p-1' : 'object-cover object-center'
          } transition-transform duration-500 ease-out group-hover/illus:scale-[1.04]`}
          style={{ filter: getAssetFilter() }}
        />
        {badgeLabel && !compact && (
          <span
            className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider bg-black/80 text-white"
          >
            {badgeLabel}
          </span>
        )}
      </div>
    );
  };

  // Render the active Multi-Image Collage Arrangement
  const renderMultiImageStage = () => {
    // Compact mobile thumbnail mode (renders 1 or 2 layered images cleanly)
    if (compact) {
      return (
        <div className="relative w-full h-full flex items-center justify-center p-1">
          {renderAssetCard(a0, 0, 'w-[82%] h-[82%] -rotate-2', {
            zIndexClass: 'z-10',
          })}
          {assetsToRender.length >= 2 &&
            renderAssetCard(
              a1,
              1,
              'absolute bottom-0.5 right-0.5 w-[54%] h-[54%] rotate-3',
              { zIndexClass: 'z-20' }
            )}
        </div>
      );
    }

    // If user selected 1 image or monolithic-spotlight with 1 image
    if (activeImageCount === 1) {
      const shape =
        frameVariant === 'circle-medallion' || frameVariant === 'stamp-seal'
          ? 'circle'
          : frameVariant === 'arch-niche' || config.maskShape === 'arch'
          ? 'arch'
          : frameVariant === 'polaroid-tape'
          ? 'polaroid'
          : 'rect';
      return (
        <div className="relative w-full h-full flex items-center justify-center p-3">
          {renderAssetCard(a0, 0, 'w-[84%] h-[88%] relative', {
            shape,
            tape: frameVariant === 'polaroid-tape',
            badgeLabel: a0.filename,
          })}
        </div>
      );
    }

    // 2-Image Arrangements (or when activeImageCount === 2)
    if (activeImageCount === 2) {
      if (
        activeArrangement === 'constructivist-diagonal-stack' ||
        activeArrangement === 'mosaic-asymmetric-cluster'
      ) {
        return (
          <div className="relative w-full h-full flex items-center justify-center p-3">
            {renderAssetCard(
              a0,
              0,
              'absolute left-3 top-3 w-[64%] h-[78%] -rotate-1',
              {
                shape: 'diagonal',
                parallaxX: -8,
                parallaxY: -6,
                zIndexClass: 'z-10',
                badgeLabel: a0.filename,
              }
            )}
            {renderAssetCard(
              a1,
              1,
              'absolute right-3 bottom-8 w-[54%] h-[64%] rotate-2',
              {
                shape: 'rect',
                tape: true,
                parallaxX: 11,
                parallaxY: 8,
                zIndexClass: 'z-20',
                badgeLabel: a1.filename,
              }
            )}
          </div>
        );
      }

      // Default 2-Image Editorial Overlap Diptych
      return (
        <div className="relative w-full h-full flex items-center justify-center p-3">
          {renderAssetCard(
            a0,
            0,
            'absolute left-4 top-3 bottom-9 w-[62%] -rotate-1',
            {
              shape: 'arch',
              parallaxX: -7,
              parallaxY: -5,
              zIndexClass: 'z-10',
              badgeLabel: a0.filename,
            }
          )}
          {renderAssetCard(
            a1,
            1,
            'absolute right-3 bottom-8 w-[48%] h-[58%] rotate-3',
            {
              shape: 'polaroid',
              tape: true,
              parallaxX: 12,
              parallaxY: -8,
              zIndexClass: 'z-20',
              badgeLabel: a1.filename,
            }
          )}
        </div>
      );
    }

    // 3- or 4-Image Multi-Asset Collage Arrangements
    switch (activeArrangement) {
      case 'triptych-gallery-cascade':
        return (
          <div className="relative w-full h-full grid grid-cols-3 gap-2.5 items-center p-3 pb-9">
            {renderAssetCard(a0, 0, 'w-full h-[84%] -translate-y-2', {
              shape: 'arch',
              parallaxX: -8,
              parallaxY: -6,
              zIndexClass: 'z-10',
              badgeLabel: a0.filename,
            })}
            {renderAssetCard(a1, 1, 'w-full h-[90%] translate-y-2 scale-105', {
              shape: 'rect',
              parallaxX: 5,
              parallaxY: 8,
              zIndexClass: 'z-20',
              badgeLabel: a1.filename,
            })}
            {renderAssetCard(a2, 2, 'w-full h-[80%] -translate-y-3', {
              shape: 'arch',
              parallaxX: 10,
              parallaxY: -7,
              zIndexClass: 'z-10',
              badgeLabel: a2.filename,
            })}
            {activeImageCount >= 4 &&
              renderAssetCard(
                a3,
                3,
                'absolute bottom-9 left-1/2 -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 rotate-6',
                {
                  shape: 'circle',
                  parallaxX: -12,
                  parallaxY: 10,
                  zIndexClass: 'z-30',
                }
              )}
          </div>
        );

      case 'constructivist-diagonal-stack':
        return (
          <div className="relative w-full h-full p-3">
            {renderAssetCard(
              a0,
              0,
              'absolute left-3 top-3 w-[60%] h-[76%]',
              {
                shape: 'diagonal',
                parallaxX: -9,
                parallaxY: -6,
                zIndexClass: 'z-10',
                badgeLabel: a0.filename,
              }
            )}
            {renderAssetCard(
              a1,
              1,
              'absolute right-3 top-5 w-[44%] h-[48%] rotate-2',
              {
                shape: 'octagon',
                parallaxX: 10,
                parallaxY: -8,
                zIndexClass: 'z-20',
                badgeLabel: a1.filename,
              }
            )}
            {renderAssetCard(
              a2,
              2,
              'absolute right-6 bottom-9 w-[50%] h-[46%] -rotate-2',
              {
                shape: 'rect',
                parallaxX: 8,
                parallaxY: 9,
                zIndexClass: 'z-20',
                badgeLabel: a2.filename,
              }
            )}
            {activeImageCount >= 4 &&
              renderAssetCard(
                a3,
                3,
                'absolute left-5 bottom-9 w-[34%] aspect-square -rotate-6',
                {
                  shape: 'circle',
                  parallaxX: -11,
                  parallaxY: 11,
                  zIndexClass: 'z-30',
                }
              )}
          </div>
        );

      case 'mosaic-asymmetric-cluster':
        return (
          <div className="relative w-full h-full grid grid-cols-12 grid-rows-6 gap-2 p-3 pb-9">
            {renderAssetCard(
              a0,
              0,
              'col-span-7 row-span-6 w-full h-full',
              {
                shape: 'rect',
                parallaxX: -6,
                parallaxY: -4,
                zIndexClass: 'z-10',
                badgeLabel: a0.filename,
              }
            )}
            {renderAssetCard(
              a1,
              1,
              'col-span-5 row-span-3 w-full h-full',
              {
                shape: 'rect',
                parallaxX: 7,
                parallaxY: -6,
                zIndexClass: 'z-10',
                badgeLabel: a1.filename,
              }
            )}
            {renderAssetCard(
              a2,
              2,
              'col-span-5 row-span-3 w-full h-full',
              {
                shape: 'rect',
                parallaxX: 7,
                parallaxY: 6,
                zIndexClass: 'z-10',
                badgeLabel: a2.filename,
              }
            )}
            {activeImageCount >= 4 &&
              renderAssetCard(
                a3,
                3,
                'absolute top-1/2 left-[52%] -translate-x-1/2 -translate-y-1/2 w-[34%] aspect-[3/4] -rotate-3',
                {
                  shape: 'polaroid',
                  tape: true,
                  parallaxX: -11,
                  parallaxY: 9,
                  zIndexClass: 'z-20',
                  badgeLabel: a3.filename,
                }
              )}
          </div>
        );

      case 'orbiting-satellite-plates':
        return (
          <div className="relative w-full h-full flex items-center justify-center p-3">
            {renderAssetCard(
              a0,
              0,
              'relative w-[58%] aspect-square',
              {
                shape: 'circle',
                parallaxX: -5,
                parallaxY: -5,
                zIndexClass: 'z-10',
                badgeLabel: a0.filename,
              }
            )}
            {renderAssetCard(
              a1,
              1,
              'absolute top-3 left-3 w-[34%] h-[42%] -rotate-6',
              {
                shape: 'arch',
                parallaxX: -12,
                parallaxY: -10,
                zIndexClass: 'z-20',
                badgeLabel: a1.filename,
              }
            )}
            {renderAssetCard(
              a2,
              2,
              'absolute bottom-9 right-3 w-[36%] h-[44%] rotate-4',
              {
                shape: 'polaroid',
                tape: true,
                parallaxX: 12,
                parallaxY: 10,
                zIndexClass: 'z-20',
                badgeLabel: a2.filename,
              }
            )}
            {activeImageCount >= 4 &&
              renderAssetCard(
                a3,
                3,
                'absolute top-3 right-3 w-[28%] aspect-square rotate-6',
                {
                  shape: 'octagon',
                  parallaxX: 10,
                  parallaxY: -9,
                  zIndexClass: 'z-20',
                }
              )}
          </div>
        );

      case 'mixed-media-scrapbook-totem':
      case 'scattered-zine-pinboard':
      default:
        return (
          <div className="relative w-full h-full p-3">
            {/* Base Left Cutout */}
            {renderAssetCard(
              a0,
              0,
              'absolute left-3 top-4 w-[56%] h-[74%] -rotate-3',
              {
                shape: 'polaroid',
                tape: true,
                parallaxX: -8,
                parallaxY: -6,
                zIndexClass: 'z-10',
                badgeLabel: a0.filename,
              }
            )}
            {/* Overlapping Upper-Right Cutout */}
            {renderAssetCard(
              a1,
              1,
              'absolute right-3 top-3 w-[48%] h-[56%] rotate-3',
              {
                shape: 'rect',
                tape: true,
                parallaxX: 10,
                parallaxY: -8,
                zIndexClass: 'z-20',
                badgeLabel: a1.filename,
              }
            )}
            {/* Overlapping Lower-Center / Right Cutout */}
            {renderAssetCard(
              a2,
              2,
              'absolute right-8 bottom-9 w-[46%] h-[48%] -rotate-2',
              {
                shape: 'arch',
                parallaxX: 7,
                parallaxY: 10,
                zIndexClass: 'z-20',
                badgeLabel: a2.filename,
              }
            )}
            {/* Optional 4th Stamp Specimen */}
            {activeImageCount >= 4 &&
              renderAssetCard(
                a3,
                3,
                'absolute left-6 bottom-9 w-[30%] aspect-square rotate-6',
                {
                  shape: 'circle',
                  parallaxX: -11,
                  parallaxY: 9,
                  zIndexClass: 'z-30',
                }
              )}
          </div>
        );
    }
  };

  const arrangementMeta =
    COLLAGE_ARRANGEMENTS.find((c) => c.id === activeArrangement) ||
    COLLAGE_ARRANGEMENTS[0];

  return (
    /* STATIC OUTER HIT-TARGET: Never transforms or rotates on hover -> zero boundary oscillation */
    <div
      onClick={(e) => {
        e.stopPropagation();
        onCyclePhoto();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCyclePhoto();
        }
      }}
      data-asset-id={a0.id}
      data-secondary-asset-id={a1.id}
      data-ensemble-ids={assetsToRender.map((a) => a.id).join(',')}
      data-image-count={activeImageCount}
      data-collage-arrangement={activeArrangement}
      aria-label={`Interactive ${artDirection.name} multi-image collage (${assetsToRender
        .map((a) => a.title)
        .join(', ')}). Click to shuffle visual ensemble.`}
      className={`group/illus relative cursor-pointer select-none overflow-hidden flex items-center justify-center ${
        compact ? 'w-full h-full' : 'w-full h-full min-h-[160px]'
      } ${outerShapeClasses} ${className}`}
      style={{
        backgroundColor: isFrameless ? 'transparent' : artDirection.bgElevated,
        border: isFrameless
          ? 'none'
          : artDirection.borderStyle === 'brutal-offset'
          ? `2.5px solid ${artDirection.borderColor}`
          : artDirection.borderStyle === 'double-frame'
          ? `3px double ${artDirection.borderColor}`
          : artDirection.borderStyle === 'dashed-sketch'
          ? `2px dashed ${artDirection.borderColor}`
          : `1px solid ${artDirection.borderColor}`,
        boxShadow:
          !isFrameless && artDirection.borderStyle === 'brutal-offset'
            ? compact
              ? `3px 3px 0px ${artDirection.accentPrimary}`
              : `7px 7px 0px ${artDirection.accentPrimary}`
            : undefined,
      }}
    >
      {/* Layer 1: Style-Specific Procedural SVG Geometry & Halos (pointer-events-none) */}
      <div
        className={`absolute inset-0 ${
          compact ? 'p-0.5' : 'p-2 sm:p-4'
        } pointer-events-none`}
        style={{
          opacity: 0.42,
          transform: compact
            ? undefined
            : 'translate3d(calc(var(--px, 0) * 10px), calc(var(--py, 0) * 10px), 0)',
        }}
      >
        <div className="w-full h-full transition-transform duration-500 ease-out group-hover/illus:scale-[1.03]">
          {renderCategoryVectorArt()}
        </div>
      </div>

      {/* Layer 2: Multi-Image Collage & Mixed-Media Stage (1 to 4 Harmonized Illustrations) */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {renderMultiImageStage()}
      </div>

      {/* Layer 3: Shamil TP Mixed-Media Portrait Medallion (woven into the collage when active) */}
      {showPortrait && !failedUrls[photo.url] && !compact && (
        <div
          className="absolute bottom-9 right-2.5 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 shadow-2xl z-30 overflow-hidden pointer-events-none"
          style={{
            borderColor: artDirection.accentPrimary,
            backgroundColor: artDirection.bgSurface,
            transform:
              'translate3d(calc(var(--px, 0) * 11px), calc(var(--py, 0) * 7px), 0)',
          }}
        >
          <img
            src={photo.url}
            alt={photo.caption}
            referrerPolicy="no-referrer"
            onError={() => markUrlFailed(photo.url)}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover/illus:scale-105"
          />
        </div>
      )}

      {/* Layer 4: Discreet Gallery Collage Controls (Appears smoothly on hover without shifting layout) */}
      {compact ? (
        <div
          data-export-ignore="true"
          className="absolute inset-x-0 bottom-0 z-30 bg-black/75 px-1 py-0.5 text-[9px] font-mono text-white text-center truncate pointer-events-none opacity-0 group-hover/illus:opacity-100 transition-opacity duration-300"
        >
          {assetsToRender.length}x Art
        </div>
      ) : (
        <div
          data-export-ignore="true"
          className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-2 sm:p-2.5 text-white flex items-end justify-between gap-2 opacity-0 group-hover/illus:opacity-100 focus-within:opacity-100 transition-opacity duration-300"
        >
          <div className="min-w-0 pointer-events-none">
            <div className="text-[10px] font-mono text-white/80 truncate">
              {assetsToRender.map((a) => a.filename).join(' + ')}
              {showPortrait ? ' + Portrait' : ''}
            </div>
            <div
              className="text-xs font-bold truncate"
              style={{ fontFamily: artDirection.fontDisplay }}
            >
              {arrangementMeta.label} ({activeImageCount} Plate
              {activeImageCount > 1 ? 's' : ''})
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const counts: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];
                const nextCount =
                  counts[(counts.indexOf(activeImageCount) + 1) % counts.length];
                setActiveImageCount(nextCount);
              }}
              className="px-2 py-1 text-[10px] font-mono bg-black/80 hover:bg-black text-white border border-white/25 cursor-pointer whitespace-nowrap transition-colors"
              aria-label="Cycle number of combined images in collage (1 to 4 images)"
            >
              <Layers className="w-3 h-3 inline mr-1" />
              <span>{activeImageCount} Imgs</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const idx = COLLAGE_ARRANGEMENTS.findIndex(
                  (c) => c.id === activeArrangement
                );
                const next =
                  COLLAGE_ARRANGEMENTS[(idx + 1) % COLLAGE_ARRANGEMENTS.length];
                setActiveArrangement(next.id);
                if (activeImageCount === 1 && next.defaultCount > 1) {
                  setActiveImageCount(next.defaultCount);
                }
              }}
              className="px-2 py-1 text-[10px] font-mono bg-black/80 hover:bg-black text-white border border-white/25 cursor-pointer whitespace-nowrap transition-colors"
              aria-label="Cycle multi-image collage arrangement layout"
            >
              <Grid className="w-3 h-3 inline mr-1" />
              <span>Layout</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPortrait((p) => !p);
              }}
              className="hidden sm:inline-flex items-center px-1.5 py-1 text-[10px] font-mono bg-black/80 hover:bg-black text-white border border-white/25 cursor-pointer transition-colors"
              aria-label="Toggle portrait photo layer inside collage"
              title="Toggle Portrait Medallion"
            >
              <Shuffle className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Canvas-Wide Multi-Image Scatter & Mixed-Media Layer
 * Places secondary/tertiary/quaternary ensemble assets across corners, margins, or background
 * planes of the poster so multi-image compositions extend across the entire poster canvas.
 */
export const PosterBackgroundAssetLayer: React.FC<{
  artDirection: SynthesizedArtDirection;
  config: IllustrationConfig;
}> = ({ artDirection, config }) => {
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFailed({});
  }, [config.id]);

  if (config.canvasScatterMode === 'none') return null;

  const ensemble = config.ensembleAssets;
  const scatterA = ensemble[2] || ensemble[1] || config.secondaryAsset;
  const scatterB = ensemble[3] || ensemble[0] || config.primaryAsset;

  if (failed[scatterA.url] && failed[scatterB.url]) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-[2]"
    >
      {/* Mode 1: Corner Counterpoint Specimen Stamp + Ambient Bleed */}
      {config.canvasScatterMode === 'corner-counterpoint' && !failed[scatterA.url] && (
        <div
          className="hidden xl:block absolute bottom-12 right-8 w-32 h-40 p-1.5 border shadow-lg rotate-3 opacity-80"
          style={{
            backgroundColor: artDirection.bgElevated,
            borderColor: artDirection.accentPrimary,
            transform:
              'translate3d(calc(var(--px, 0) * -10px), calc(var(--py, 0) * -8px), 0) rotate(4deg)',
          }}
        >
          <img
            src={scatterA.url}
            alt=""
            onError={() => setFailed((p) => ({ ...p, [scatterA.url]: true }))}
            className="w-full h-full object-cover object-center"
          />
          <span
            className="absolute bottom-1 left-1 px-1 py-0.5 text-[8px] font-mono bg-black/80 text-white"
          >
            {scatterA.filename}
          </span>
        </div>
      )}

      {/* Mode 2: Diagonal Echo Plates (2 off-grid marginalia plates in opposite zones) */}
      {config.canvasScatterMode === 'diagonal-echo-plates' && (
        <>
          {!failed[scatterA.url] && (
            <div
              className="hidden xl:block absolute top-14 right-20 w-28 h-28 rounded-full border-2 overflow-hidden shadow-lg -rotate-6 opacity-85"
              style={{
                borderColor: artDirection.accentSecondary,
                backgroundColor: artDirection.bgElevated,
                transform:
                  'translate3d(calc(var(--px, 0) * 12px), calc(var(--py, 0) * -10px), 0)',
              }}
            >
              <img
                src={scatterA.url}
                alt=""
                onError={() => setFailed((p) => ({ ...p, [scatterA.url]: true }))}
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}
          {!failed[scatterB.url] && (
            <div
              className="absolute -left-8 -bottom-8 w-56 h-72 opacity-[0.14] rotate-6"
              style={{
                mixBlendMode: artDirection.isDark ? 'screen' : 'multiply',
                transform:
                  'translate3d(calc(var(--px, 0) * -12px), calc(var(--py, 0) * 10px), 0)',
              }}
            >
              <img
                src={scatterB.url}
                alt=""
                onError={() => setFailed((p) => ({ ...p, [scatterB.url]: true }))}
                className="w-full h-full object-cover object-center grayscale contrast-125"
              />
            </div>
          )}
        </>
      )}

      {/* Mode 3: Floating Marginalia Postage Stamps */}
      {config.canvasScatterMode === 'floating-marginalia-stamps' &&
        !failed[scatterA.url] && (
          <div
            className="hidden xl:flex absolute bottom-14 right-10 items-center gap-2.5 opacity-85"
            style={{
              transform:
                'translate3d(calc(var(--px, 0) * -9px), calc(var(--py, 0) * -7px), 0)',
            }}
          >
            <div
              className="w-24 h-32 p-1 border-2 border-dashed -rotate-3 shadow-md"
              style={{
                borderColor: artDirection.accentPrimary,
                backgroundColor: artDirection.bgElevated,
              }}
            >
              <img
                src={scatterA.url}
                alt=""
                onError={() => setFailed((p) => ({ ...p, [scatterA.url]: true }))}
                className="w-full h-full object-cover"
              />
            </div>
            {!failed[scatterB.url] && scatterB.id !== scatterA.id && (
              <div
                className="w-20 h-20 rounded-full p-1 border-2 rotate-6 shadow-md overflow-hidden"
                style={{
                  borderColor: artDirection.accentSecondary,
                  backgroundColor: artDirection.bgElevated,
                }}
              >
                <img
                  src={scatterB.url}
                  alt=""
                  onError={() =>
                    setFailed((p) => ({ ...p, [scatterB.url]: true }))
                  }
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            )}
          </div>
        )}

      {/* Mode 4: Ambient Edge-to-Edge Backdrop Bleed */}
      {config.canvasScatterMode === 'ambient-bleed' && !failed[scatterA.url] && (
        <div
          className="absolute -right-10 -bottom-10 w-[40vw] max-w-[480px] aspect-[3/4] opacity-[0.14] sm:opacity-[0.17] rotate-6"
          style={{
            transform:
              'translate3d(calc(var(--px, 0) * -14px), calc(var(--py, 0) * -14px), 0)',
            mixBlendMode: artDirection.isDark ? 'screen' : 'multiply',
          }}
        >
          <img
            src={scatterA.url}
            alt=""
            onError={() => setFailed((p) => ({ ...p, [scatterA.url]: true }))}
            className="w-full h-full object-cover object-center grayscale contrast-125"
          />
        </div>
      )}
    </div>
  );
};
