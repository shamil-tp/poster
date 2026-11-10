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
  | 'monolithic-spotlight'
  | 'editorial-overlap-diptych'
  | 'orbiting-satellite-plates'
  | 'triptych-gallery-cascade'
  | 'constructivist-diagonal-stack'
  | 'mosaic-asymmetric-cluster'
  | 'mixed-media-scrapbook-totem'
  | 'scattered-zine-pinboard';

export type CanvasScatterMode =
  | 'none'
  | 'ambient-bleed'
  | 'corner-counterpoint'
  | 'diagonal-echo-plates'
  | 'floating-marginalia-stamps';

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
  /** Strictly 1 or 2 prominent foreground images to preserve breathing room and visual hierarchy */
  imageCount: 1 | 2;
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
  defaultCount: 1 | 2;
}[] = [
  { id: 'monolithic-spotlight', label: 'Monolithic Solo Plate', defaultCount: 1 },
  { id: 'triptych-gallery-cascade', label: 'Sculptural Arch Specimen', defaultCount: 1 },
  { id: 'constructivist-diagonal-stack', label: 'Off-Axis Architectural', defaultCount: 1 },
  { id: 'scattered-zine-pinboard', label: 'Archival Print Specimen', defaultCount: 1 },
  { id: 'editorial-overlap-diptych', label: 'Scale-Contrast Diptych', defaultCount: 2 },
  { id: 'orbiting-satellite-plates', label: 'Opposite-Corner Counterpoint', defaultCount: 2 },
  { id: 'mosaic-asymmetric-cluster', label: '70/30 Gallery Split', defaultCount: 2 },
  { id: 'mixed-media-scrapbook-totem', label: 'Foreground + Blended Echo', defaultCount: 2 },
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

  // Determine preferred composition arrangements based on style category,
  // avoiding repeating the previous arrangement.
  let preferredArrangements: CollageArrangementId[] = [
    'monolithic-spotlight',
    'triptych-gallery-cascade',
    'constructivist-diagonal-stack',
    'scattered-zine-pinboard',
    'editorial-overlap-diptych',
    'orbiting-satellite-plates',
    'mosaic-asymmetric-cluster',
    'mixed-media-scrapbook-totem',
  ];

  if (
    artDirection.illustrationCategory === 'zen-ceramic' ||
    artDirection.illustrationCategory === 'botanical-organic' ||
    artDirection.illustrationCategory === 'classical-sculpture' ||
    artDirection.illustrationCategory === 'typographic-sculpture'
  ) {
    preferredArrangements = [
      'monolithic-spotlight',
      'triptych-gallery-cascade',
      'editorial-overlap-diptych',
      'orbiting-satellite-plates',
    ];
  } else if (
    artDirection.illustrationCategory === 'geometric-construct' ||
    artDirection.illustrationCategory === 'cyber-schematic' ||
    artDirection.illustrationCategory === 'pixel-retro'
  ) {
    preferredArrangements = [
      'constructivist-diagonal-stack',
      'monolithic-spotlight',
      'mosaic-asymmetric-cluster',
      'orbiting-satellite-plates',
    ];
  } else if (
    artDirection.illustrationCategory === 'collage-scrapbook' ||
    artDirection.illustrationCategory === 'character-mascot'
  ) {
    preferredArrangements = [
      'mixed-media-scrapbook-totem',
      'editorial-overlap-diptych',
      'scattered-zine-pinboard',
      'orbiting-satellite-plates',
    ];
  }

  const candidateArrangements = preferredArrangements.filter(
    (a) => a !== options?.previousArrangement
  );
  const chosenPool =
    candidateArrangements.length > 0 ? candidateArrangements : preferredArrangements;

  const allIds = COLLAGE_ARRANGEMENTS.map((c) => c.id).filter(
    (a) => a !== options?.previousArrangement
  );
  const collageArrangement: CollageArrangementId =
    rng() < 0.75
      ? chosenPool[Math.floor(rng() * chosenPool.length)]
      : allIds[Math.floor(rng() * allIds.length)] || 'monolithic-spotlight';

  // Rule 1 & 2: Prefer 1 strong, well-positioned image (~62% of posters),
  // and allow a maximum of 2 prominent images (~38% of posters) with distinct positions & scales.
  const countRoll = rng();
  let imageCount: 1 | 2 = 1;
  if (
    collageArrangement === 'monolithic-spotlight' ||
    collageArrangement === 'triptych-gallery-cascade' ||
    collageArrangement === 'scattered-zine-pinboard'
  ) {
    imageCount = countRoll < 0.78 ? 1 : 2;
  } else if (collageArrangement === 'constructivist-diagonal-stack') {
    imageCount = countRoll < 0.65 ? 1 : 2;
  } else {
    imageCount = countRoll < 0.42 ? 1 : 2;
  }

  // Optional portrait photo is used as the 2nd counterpoint element (never as a 3rd stacked image)
  const includePortraitInCollage = rng() < 0.28;

  const compositionMode: IllustrationCompositionMode =
    imageCount === 2
      ? 'multi-asset-layer'
      : includePortraitInCollage
      ? 'asset-portrait-fusion'
      : 'supplied-asset-plate';

  const framingMode: IllustrationConfig['framingMode'] =
    imageCount === 2
      ? 'duotone-collage-cutout'
      : 'integrated-portrait-sculpture';

  // Rule 3 & 4: Atmospheric background blending modes (subtle visual layers & unified background collages)
  const scatterOptions: CanvasScatterMode[] = [
    'ambient-bleed',
    'corner-counterpoint',
    'diagonal-echo-plates',
    'floating-marginalia-stamps',
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
      imageCount === 2
        ? `${primaryAsset.title} + ${secondaryAsset.title}`
        : primaryAsset.title,
    subject: `${primaryAsset.subject} · ${artDirection.illustrationSubject}`,
    category: artDirection.illustrationCategory,
    scaleFactor: 0.96 + rng() * 0.12,
    rotationDeg: (rng() - 0.5) * 3,
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
  const [activeImageCount, setActiveImageCount] = useState<1 | 2>(
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
        return 'contrast(1.14) saturate(1.06)';
      case 'warm-vintage':
        return 'sepia(0.12) contrast(1.05) saturate(1.05)';
      case 'duotone-tint':
        return 'contrast(1.1) saturate(1.12)';
      default:
        return 'contrast(1.02)';
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
              <circle cx="200" cy="200" r="182" stroke={c1} strokeWidth="1" strokeDasharray="6 6" opacity="0.55" />
              <circle cx="200" cy="200" r="148" stroke={border} strokeWidth="0.75" opacity="0.45" />
            </g>
          </svg>
        );

      case 'geometric-construct':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g opacity="0.45">
              <rect x="36" y="36" width="328" height="328" stroke={fg} strokeWidth="1" />
              <line x1="20" y1="200" x2="380" y2="200" stroke={fg} strokeWidth="0.75" strokeDasharray="6 6" />
              <line x1="200" y1="20" x2="200" y2="380" stroke={fg} strokeWidth="0.75" strokeDasharray="6 6" />
            </g>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g opacity="0.38">
              <circle cx="200" cy="200" r="156" stroke={c2} strokeWidth="1" strokeDasharray="8 6" />
              <line x1="48" y1="200" x2="352" y2="200" stroke={c1} strokeWidth="0.75" />
            </g>
          </svg>
        );
    }
  };

  // Resolve the active ensemble assets (strictly 1 or 2 foreground images)
  const validEnsemble = config.ensembleAssets.filter(
    (a) => !failedUrls[a.url]
  );
  const assetsToRender = (
    validEnsemble.length > 0 ? validEnsemble : [config.primaryAsset]
  ).slice(0, compact ? 1 : activeImageCount);

  const a0 = assetsToRender[0] || config.primaryAsset;
  const rawSecond = assetsToRender[1] || config.secondaryAsset;

  // If showPortrait is enabled in a 2-image composition and the portrait hasn't failed,
  // use Shamil TP's portrait as the secondary counterpoint element so we NEVER exceed 2 prominent images.
  const secondImageSource: {
    id: string;
    url: string;
    title: string;
    filename: string;
    recommendedCrop?: 'contain' | 'cover-center' | 'cover-top';
    dominantPalette: [string, string, string];
  } =
    showPortrait && !failedUrls[photo.url]
      ? {
          id: photo.id,
          url: photo.url,
          title: photo.caption,
          filename: 'portrait',
          recommendedCrop: 'cover-center',
          dominantPalette: [
            artDirection.bgSurface,
            artDirection.accentPrimary,
            artDirection.bgElevated,
          ],
        }
      : rawSecond;

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

  // Helper to render a clean, well-proportioned image plate without cluttered sticker badges
  const renderAssetCard = (
    asset: {
      id: string;
      url: string;
      title: string;
      recommendedCrop?: 'contain' | 'cover-center' | 'cover-top';
      dominantPalette: [string, string, string];
    },
    idx: number,
    layoutClasses: string,
    options?: {
      shape?: 'rect' | 'arch' | 'circle' | 'polaroid' | 'octagon' | 'diagonal';
      parallaxX?: number;
      parallaxY?: number;
      fit?: 'cover' | 'contain';
      zIndexClass?: string;
      subtleBorder?: boolean;
    }
  ) => {
    const {
      shape = 'rect',
      parallaxX = idx === 0 ? -5 : 7,
      parallaxY = idx === 0 ? -4 : 6,
      fit = asset.recommendedCrop === 'contain' ? 'contain' : 'cover',
      zIndexClass = 'z-10',
      subtleBorder = false,
    } = options || {};

    const shapeClass =
      shape === 'circle'
        ? 'rounded-full'
        : shape === 'arch'
        ? 'rounded-t-[999px]'
        : shape === 'polaroid'
        ? 'p-2 sm:p-2.5 pb-6 sm:pb-7 bg-zinc-100 text-zinc-900'
        : '';

    const clipPath =
      shape === 'octagon'
        ? 'polygon(16% 0%, 84% 0%, 100% 16%, 100% 84%, 84% 100%, 16% 100%, 0% 84%, 0% 16%)'
        : shape === 'diagonal'
        ? 'polygon(0% 0%, 96% 0%, 100% 92%, 4% 100%)'
        : undefined;

    return (
      <div
        key={`${asset.id}-${idx}`}
        className={`overflow-hidden pointer-events-none transition-shadow duration-500 ${
          subtleBorder ? 'border shadow-md' : 'border shadow-xl'
        } ${shapeClass} ${zIndexClass} ${layoutClasses}`}
        style={{
          borderColor:
            idx === 0
              ? `${artDirection.borderColor}`
              : `${artDirection.accentPrimary}99`,
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
        <img
          src={asset.url}
          alt={asset.title}
          referrerPolicy="no-referrer"
          onError={() => markUrlFailed(asset.url)}
          className={`w-full h-full ${
            fit === 'contain' ? 'object-contain p-2' : 'object-cover object-center'
          } transition-transform duration-500 ease-out group-hover/illus:scale-[1.03]`}
          style={{ filter: getAssetFilter() }}
        />
      </div>
    );
  };

  // Render either 1 strong focal image OR 2 spatially separated images with contrasting scales
  const renderFocalStage = () => {
    // Compact mobile thumbnail mode: always 1 clean image
    if (compact) {
      return (
        <div className="relative w-full h-full flex items-center justify-center p-1">
          {renderAssetCard(a0, 0, 'w-[88%] h-[88%]', {
            zIndexClass: 'z-10',
            subtleBorder: true,
          })}
        </div>
      );
    }

    // =========================================================================
    // RULE 1: SINGLE-IMAGE COMPOSITION (One strong, well-positioned focal image)
    // =========================================================================
    if (activeImageCount === 1) {
      switch (activeArrangement) {
        case 'triptych-gallery-cascade':
          // Poised Sculptural Arch Specimen with generous side margins
          return (
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6">
              {renderAssetCard(a0, 0, 'w-[70%] h-[88%] relative', {
                shape: 'arch',
              })}
            </div>
          );

        case 'constructivist-diagonal-stack':
          // Off-Axis Architectural Plate anchored right with open space on the left
          return (
            <div className="relative w-full h-full flex items-center justify-end p-4 sm:p-6">
              {renderAssetCard(a0, 0, 'w-[78%] h-[86%] relative', {
                shape: 'diagonal',
              })}
            </div>
          );

        case 'orbiting-satellite-plates':
          // Poised Circular Medallion in contemplative negative space
          return (
            <div className="relative w-full h-full flex items-center justify-center p-5 sm:p-7">
              {renderAssetCard(
                a0,
                0,
                'h-[84%] max-w-[84%] aspect-square relative',
                {
                  shape: 'circle',
                }
              )}
            </div>
          );

        case 'editorial-overlap-diptych':
          // Left-anchored Editorial Plate with open right margin
          return (
            <div className="relative w-full h-full flex items-center justify-start p-4 sm:p-6">
              {renderAssetCard(a0, 0, 'w-[78%] h-[88%] relative', {
                shape:
                  frameVariant === 'arch-niche' || config.maskShape === 'arch'
                    ? 'arch'
                    : 'rect',
              })}
            </div>
          );

        case 'mixed-media-scrapbook-totem':
          // Single Foreground Focal Illustration + Softly Blended Atmospheric Background Image
          return (
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
              {/* Softly blended background echo image (no border, feathered mask, low opacity) */}
              <div
                aria-hidden="true"
                className="absolute inset-3 pointer-events-none z-0 overflow-hidden"
                style={{
                  opacity: artDirection.isDark ? 0.22 : 0.18,
                  mixBlendMode: artDirection.isDark ? 'screen' : 'multiply',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 75% 75% at 72% 35%, black 20%, transparent 78%)',
                  maskImage:
                    'radial-gradient(ellipse 75% 75% at 72% 35%, black 20%, transparent 78%)',
                }}
              >
                <img
                  src={secondImageSource.url}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => markUrlFailed(secondImageSource.url)}
                  className="w-full h-full object-cover object-center grayscale contrast-125 blur-[2px] scale-105"
                />
              </div>

              {renderAssetCard(a0, 0, 'w-[72%] h-[84%] relative z-10', {
                shape:
                  frameVariant === 'circle-medallion'
                    ? 'circle'
                    : frameVariant === 'arch-niche'
                    ? 'arch'
                    : 'rect',
              })}
            </div>
          );

        default: {
          // Monolithic Solo Plate
          const shape =
            frameVariant === 'circle-medallion' || frameVariant === 'stamp-seal'
              ? 'circle'
              : frameVariant === 'arch-niche' || config.maskShape === 'arch'
              ? 'arch'
              : frameVariant === 'polaroid-tape'
              ? 'polaroid'
              : 'rect';
          return (
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6">
              {renderAssetCard(a0, 0, 'w-[82%] h-[86%] relative', {
                shape,
              })}
            </div>
          );
        }
      }
    }

    // =========================================================================
    // RULE 2: TWO-IMAGE COMPOSITION (Max 2 prominent images, distinct positions,
    // contrasting scales ~65% vs ~28%, generous negative space, never stacked)
    // =========================================================================
    switch (activeArrangement) {
      case 'orbiting-satellite-plates':
        // Opposite-Corner Counterpoint: Dominant plate bottom-left, small satellite top-right
        return (
          <div className="relative w-full h-full p-4 sm:p-6 flex items-end justify-between gap-6">
            {renderAssetCard(
              a0,
              0,
              'w-[60%] h-[82%] self-end',
              {
                shape: 'arch',
                parallaxX: -6,
                parallaxY: 4,
                zIndexClass: 'z-10',
              }
            )}
            {renderAssetCard(
              secondImageSource,
              1,
              'w-[26%] aspect-square self-start',
              {
                shape: 'circle',
                parallaxX: 8,
                parallaxY: -6,
                zIndexClass: 'z-20',
                subtleBorder: true,
              }
            )}
          </div>
        );

      case 'mosaic-asymmetric-cluster':
      case 'triptych-gallery-cascade':
        // 70 / 30 Editorial Split with generous negative space gutter (zero overlap)
        return (
          <div className="relative w-full h-full p-4 sm:p-6 flex items-stretch justify-between gap-5 sm:gap-7">
            {renderAssetCard(
              a0,
              0,
              'w-[64%] h-[88%] self-center',
              {
                shape: 'rect',
                parallaxX: -5,
                parallaxY: -4,
                zIndexClass: 'z-10',
              }
            )}
            <div className="w-[28%] h-[88%] self-center flex flex-col justify-end">
              {renderAssetCard(
                secondImageSource,
                1,
                'w-full h-[46%]',
                {
                  shape: 'rect',
                  parallaxX: 7,
                  parallaxY: 6,
                  zIndexClass: 'z-10',
                  subtleBorder: true,
                }
              )}
            </div>
          </div>
        );

      case 'constructivist-diagonal-stack':
        // Architectural Counter-Balance: Dominant plate top-left, small secondary plate bottom-right
        return (
          <div className="relative w-full h-full p-4 sm:p-6 flex items-start justify-between gap-6">
            {renderAssetCard(
              a0,
              0,
              'w-[62%] h-[82%] self-start',
              {
                shape: 'diagonal',
                parallaxX: -6,
                parallaxY: -4,
                zIndexClass: 'z-10',
              }
            )}
            {renderAssetCard(
              secondImageSource,
              1,
              'w-[28%] h-[38%] self-end',
              {
                shape: 'octagon',
                parallaxX: 8,
                parallaxY: 6,
                zIndexClass: 'z-10',
                subtleBorder: true,
              }
            )}
          </div>
        );

      case 'mixed-media-scrapbook-totem':
      case 'scattered-zine-pinboard':
        // Foreground Dominant Illustration + Softly Blended Background Photographic Layer
        return (
          <div className="relative w-full h-full p-4 sm:p-6 flex items-center justify-start overflow-hidden">
            {/* Softly integrated background layer on the right side (borderless, feathered mask) */}
            <div
              aria-hidden="true"
              className="absolute right-2 top-2 bottom-2 w-[56%] pointer-events-none z-0 overflow-hidden"
              style={{
                opacity: artDirection.isDark ? 0.28 : 0.22,
                mixBlendMode: artDirection.isDark ? 'screen' : 'multiply',
                WebkitMaskImage:
                  'radial-gradient(ellipse 80% 80% at 65% 50%, black 25%, transparent 78%)',
                maskImage:
                  'radial-gradient(ellipse 80% 80% at 65% 50%, black 25%, transparent 78%)',
              }}
            >
              <img
                src={secondImageSource.url}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => markUrlFailed(secondImageSource.url)}
                className="w-full h-full object-cover object-center grayscale-[35%] contrast-110 blur-[1.5px]"
              />
            </div>

            {renderAssetCard(
              a0,
              0,
              'w-[64%] h-[86%] relative z-10',
              {
                shape: 'rect',
                parallaxX: -6,
                parallaxY: -4,
                zIndexClass: 'z-10',
              }
            )}
          </div>
        );

      case 'editorial-overlap-diptych':
      default:
        // Asymmetric Scale-Contrast Diptych: Dominant left plate + small separated right counterpoint
        return (
          <div className="relative w-full h-full p-4 sm:p-6 flex items-center justify-between gap-6">
            {renderAssetCard(
              a0,
              0,
              'w-[62%] h-[86%] self-start',
              {
                shape: 'arch',
                parallaxX: -6,
                parallaxY: -4,
                zIndexClass: 'z-10',
              }
            )}
            {renderAssetCard(
              secondImageSource,
              1,
              'w-[28%] h-[42%] self-end',
              {
                shape: 'rect',
                parallaxX: 8,
                parallaxY: 5,
                zIndexClass: 'z-10',
                subtleBorder: true,
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
      data-secondary-asset-id={secondImageSource.id}
      data-ensemble-ids={
        activeImageCount === 2 ? `${a0.id},${secondImageSource.id}` : a0.id
      }
      data-image-count={activeImageCount}
      data-collage-arrangement={activeArrangement}
      aria-label={`Interactive ${artDirection.name} visual composition (${
        activeImageCount === 2
          ? `${a0.title} and ${secondImageSource.title}`
          : a0.title
      }). Click to cycle artwork.`}
      className={`group/illus relative cursor-pointer select-none overflow-hidden flex items-center justify-center ${
        compact ? 'w-full h-full' : 'w-full h-full min-h-[160px]'
      } ${outerShapeClasses} ${className}`}
      style={{
        backgroundColor: isFrameless ? 'transparent' : artDirection.bgElevated,
        border: isFrameless
          ? 'none'
          : artDirection.borderStyle === 'brutal-offset'
          ? `2px solid ${artDirection.borderColor}`
          : artDirection.borderStyle === 'double-frame'
          ? `3px double ${artDirection.borderColor}`
          : artDirection.borderStyle === 'dashed-sketch'
          ? `1.5px dashed ${artDirection.borderColor}`
          : `1px solid ${artDirection.borderColor}`,
        boxShadow:
          !isFrameless && artDirection.borderStyle === 'brutal-offset'
            ? compact
              ? `3px 3px 0px ${artDirection.accentPrimary}`
              : `6px 6px 0px ${artDirection.accentPrimary}`
            : undefined,
      }}
    >
      {/* Layer 1: Subtle Procedural SVG Geometry & Halos (pointer-events-none) */}
      <div
        className={`absolute inset-0 ${
          compact ? 'p-0.5' : 'p-3 sm:p-5'
        } pointer-events-none`}
        style={{
          opacity: 0.35,
          transform: compact
            ? undefined
            : 'translate3d(calc(var(--px, 0) * 8px), calc(var(--py, 0) * 8px), 0)',
        }}
      >
        <div className="w-full h-full transition-transform duration-500 ease-out group-hover/illus:scale-[1.02]">
          {renderCategoryVectorArt()}
        </div>
      </div>

      {/* Layer 2: Curated Focal Stage (Strictly 1 or 2 well-spaced images) */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {renderFocalStage()}
      </div>

      {/* Layer 3: Discreet Gallery Controls (Excluded from exported poster via data-export-ignore) */}
      {compact ? (
        <div
          data-export-ignore="true"
          className="absolute inset-x-0 bottom-0 z-30 bg-black/75 px-1 py-0.5 text-[9px] font-mono text-white text-center truncate pointer-events-none opacity-0 group-hover/illus:opacity-100 transition-opacity duration-300"
        >
          {activeImageCount}x Art
        </div>
      ) : (
        <div
          data-export-ignore="true"
          className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-2 sm:p-2.5 text-white flex items-end justify-between gap-2 opacity-0 group-hover/illus:opacity-100 focus-within:opacity-100 transition-opacity duration-300"
        >
          <div className="min-w-0 pointer-events-none">
            <div className="text-[10px] font-mono text-white/80 truncate">
              {activeImageCount === 2
                ? `${a0.filename} + ${secondImageSource.filename}`
                : a0.filename}
            </div>
            <div
              className="text-xs font-bold truncate"
              style={{ fontFamily: artDirection.fontDisplay }}
            >
              {arrangementMeta.label} ({activeImageCount === 1 ? 'Solo' : 'Diptych'})
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageCount((prev) => (prev === 1 ? 2 : 1));
              }}
              className="px-2 py-1 text-[10px] font-mono bg-black/80 hover:bg-black text-white border border-white/25 cursor-pointer whitespace-nowrap transition-colors"
              aria-label="Toggle between 1 solo image and 2 contrasting images"
            >
              <Layers className="w-3 h-3 inline mr-1" />
              <span>{activeImageCount === 1 ? '1 Img' : '2 Imgs'}</span>
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
              }}
              className="px-2 py-1 text-[10px] font-mono bg-black/80 hover:bg-black text-white border border-white/25 cursor-pointer whitespace-nowrap transition-colors"
              aria-label="Cycle image composition arrangement"
            >
              <Grid className="w-3 h-3 inline mr-1" />
              <span>Compose</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPortrait((p) => {
                  const next = !p;
                  if (next && activeImageCount === 1) {
                    setActiveImageCount(2);
                  }
                  return next;
                });
              }}
              className="hidden sm:inline-flex items-center px-1.5 py-1 text-[10px] font-mono bg-black/80 hover:bg-black text-white border border-white/25 cursor-pointer transition-colors"
              aria-label="Toggle portrait counterpoint in 2-image composition"
              title="Toggle Portrait Counterpoint"
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
 * Rules 3 & 4: Atmospheric Background Image Blending & Unified Mixed-Media Backdrops
 * Integrates secondary/tertiary ensemble images subtly into the poster background using
 * feathered CSS masks, soft blur, desaturation, blend modes, and typography-protecting scrims
 * so background imagery never competes with foreground typography or appears as separate cards.
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
  const bgAssetA = ensemble[2] || ensemble[1] || config.secondaryAsset;
  const bgAssetB = ensemble[3] || ensemble[1] || config.primaryAsset;

  if (failed[bgAssetA.url] && failed[bgAssetB.url]) return null;

  const blendMode: React.CSSProperties['mixBlendMode'] = artDirection.isDark
    ? 'screen'
    : 'multiply';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-[1]"
    >
      {/* Mode 1: Subtle Atmospheric Corner/Edge Wash (Single feathered background image) */}
      {config.canvasScatterMode === 'ambient-bleed' && !failed[bgAssetA.url] && (
        <div
          className="absolute -right-12 -bottom-12 w-[52vw] max-w-[680px] h-[68vh] opacity-[0.12]"
          style={{
            mixBlendMode: blendMode,
            WebkitMaskImage:
              'radial-gradient(ellipse 72% 72% at 75% 70%, black 10%, transparent 72%)',
            maskImage:
              'radial-gradient(ellipse 72% 72% at 75% 70%, black 10%, transparent 72%)',
            transform:
              'translate3d(calc(var(--px, 0) * -10px), calc(var(--py, 0) * -10px), 0)',
          }}
        >
          <img
            src={bgAssetA.url}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setFailed((p) => ({ ...p, [bgAssetA.url]: true }))}
            className="w-full h-full object-cover object-center grayscale-[60%] contrast-110 blur-[2px]"
          />
        </div>
      )}

      {/* Mode 2: Upper-Field Softly Blended Photographic Veil */}
      {config.canvasScatterMode === 'corner-counterpoint' && !failed[bgAssetA.url] && (
        <div
          className="absolute -top-10 -right-10 w-[48vw] max-w-[620px] h-[62vh] opacity-[0.11]"
          style={{
            mixBlendMode: blendMode,
            WebkitMaskImage:
              'radial-gradient(circle at 78% 24%, black 8%, transparent 68%)',
            maskImage:
              'radial-gradient(circle at 78% 24%, black 8%, transparent 68%)',
            transform:
              'translate3d(calc(var(--px, 0) * 10px), calc(var(--py, 0) * -8px), 0)',
          }}
        >
          <img
            src={bgAssetA.url}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setFailed((p) => ({ ...p, [bgAssetA.url]: true }))}
            className="w-full h-full object-cover object-center grayscale-[50%] blur-[3px]"
          />
        </div>
      )}

      {/* Mode 3: Unified Dual-Image Atmospheric Background Collage (Seamless feathered blend, zero card borders) */}
      {config.canvasScatterMode === 'diagonal-echo-plates' && (
        <>
          {!failed[bgAssetA.url] && (
            <div
              className="absolute -left-12 -top-12 w-[50vw] max-w-[640px] h-[64vh] opacity-[0.10]"
              style={{
                mixBlendMode: blendMode,
                WebkitMaskImage:
                  'radial-gradient(ellipse 70% 70% at 25% 28%, black 10%, transparent 70%)',
                maskImage:
                  'radial-gradient(ellipse 70% 70% at 25% 28%, black 10%, transparent 70%)',
              }}
            >
              <img
                src={bgAssetA.url}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFailed((p) => ({ ...p, [bgAssetA.url]: true }))}
                className="w-full h-full object-cover object-center grayscale-[65%] blur-[3px]"
              />
            </div>
          )}
          {!failed[bgAssetB.url] && (
            <div
              className="absolute -right-12 -bottom-12 w-[54vw] max-w-[700px] h-[68vh] opacity-[0.11]"
              style={{
                mixBlendMode: blendMode,
                WebkitMaskImage:
                  'radial-gradient(ellipse 70% 70% at 75% 72%, black 10%, transparent 70%)',
                maskImage:
                  'radial-gradient(ellipse 70% 70% at 75% 72%, black 10%, transparent 70%)',
              }}
            >
              <img
                src={bgAssetB.url}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFailed((p) => ({ ...p, [bgAssetB.url]: true }))}
                className="w-full h-full object-cover object-center grayscale-[65%] blur-[3px]"
              />
            </div>
          )}
        </>
      )}

      {/* Mode 4: Unified Mixed-Media Texture Wash with Typography Readability Scrim */}
      {config.canvasScatterMode === 'floating-marginalia-stamps' &&
        !failed[bgAssetA.url] && (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.09]"
              style={{
                mixBlendMode: blendMode,
                WebkitMaskImage:
                  'linear-gradient(135deg, transparent 15%, black 55%, transparent 95%)',
                maskImage:
                  'linear-gradient(135deg, transparent 15%, black 55%, transparent 95%)',
              }}
            >
              <img
                src={bgAssetA.url}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFailed((p) => ({ ...p, [bgAssetA.url]: true }))}
                className="w-full h-full object-cover object-center grayscale-[70%] blur-[4px] scale-105"
              />
            </div>
            {/* Protective radial readability scrim so foreground typography stays 100% crisp */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 45% 50%, ${artDirection.bgCanvas}D9 25%, transparent 85%)`,
              }}
            />
          </div>
        )}
    </div>
  );
};
