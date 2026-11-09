import React, { useState, useEffect } from 'react';
import { SynthesizedArtDirection } from './hybridGenerator';
import { PortfolioPhoto } from '../utils/knowledgeParser';
import {
  IllustrationAssetSpec,
  selectAssetsForStyle,
} from './assetRegistry';
import { Sparkles, Layers, User, Image as ImageIcon } from 'lucide-react';

export type IllustrationCompositionMode =
  | 'supplied-asset-plate'
  | 'multi-asset-layer'
  | 'asset-portrait-fusion'
  | 'edge-bleed-asset'
  | 'typographic-geometric-totem';

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
  primaryAsset: IllustrationAssetSpec;
  secondaryAsset: IllustrationAssetSpec;
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

export function generateIllustrationConfig(
  artDirection: SynthesizedArtDirection,
  rng: () => number,
  options?: {
    customAssets?: IllustrationAssetSpec[];
    excludeAssetIds?: string[];
    forceAssetId?: string;
  }
): IllustrationConfig {
  const { primaryAsset, secondaryAsset } = selectAssetsForStyle(
    artDirection,
    rng,
    options
  );

  // Choose composition mode so posters use supplied illustration assets as the primary source,
  // while preserving visual diversity across single-asset, multi-asset collage, portrait fusion,
  // edge-bleed, and minimalist typographic/geometric treatments.
  const modeRoll = rng();
  let compositionMode: IllustrationCompositionMode = 'supplied-asset-plate';
  if (options?.forceAssetId) {
    compositionMode = 'supplied-asset-plate';
  } else if (modeRoll < 0.45) {
    compositionMode = 'supplied-asset-plate';
  } else if (modeRoll < 0.72) {
    compositionMode = 'multi-asset-layer';
  } else if (modeRoll < 0.88) {
    compositionMode = 'asset-portrait-fusion';
  } else if (modeRoll < 0.96) {
    compositionMode = 'edge-bleed-asset';
  } else {
    compositionMode = 'typographic-geometric-totem';
  }

  const framingMode: IllustrationConfig['framingMode'] =
    compositionMode === 'typographic-geometric-totem'
      ? 'pure-procedural-totem'
      : compositionMode === 'multi-asset-layer'
      ? 'duotone-collage-cutout'
      : 'integrated-portrait-sculpture';

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
    id: `illus-${artDirection.signatureId}-${primaryAsset.id}-${Math.floor(rng() * 1000)}`,
    title: primaryAsset.title,
    subject: `${primaryAsset.subject} · ${artDirection.illustrationSubject}`,
    category: artDirection.illustrationCategory,
    scaleFactor: 0.96 + rng() * 0.16,
    rotationDeg:
      artDirection.illustrationCategory === 'collage-scrapbook' ||
      compositionMode === 'multi-asset-layer'
        ? (rng() - 0.5) * 5
        : 0,
    framingMode,
    compositionMode,
    primaryAsset,
    secondaryAsset,
    maskShape,
    cropMode,
    blendTreatment,
    secondaryPlacement,
    overflowBleed: rng() < 0.52,
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
  pureVectorDefault = false,
}) => {
  const [activeMode, setActiveMode] = useState<IllustrationCompositionMode>(
    pureVectorDefault ? 'typographic-geometric-totem' : config.compositionMode
  );
  const [primaryError, setPrimaryError] = useState(false);
  const [secondaryError, setSecondaryError] = useState(false);
  const [portraitError, setPortraitError] = useState(false);

  // Sync mode when poster regenerates or asset changes
  useEffect(() => {
    setActiveMode(
      pureVectorDefault ? 'typographic-geometric-totem' : config.compositionMode
    );
    setPrimaryError(false);
    setSecondaryError(false);
  }, [config.id, config.primaryAsset.id, config.compositionMode, pureVectorDefault]);

  const getAssetFilter = (): string => {
    switch (config.blendTreatment) {
      case 'high-contrast-ink':
        return 'contrast(1.18) saturate(1.08)';
      case 'warm-vintage':
        return 'sepia(0.14) contrast(1.06) saturate(1.08)';
      case 'duotone-tint':
        return 'contrast(1.12) saturate(1.18)';
      default:
        return 'contrast(1.03)';
    }
  };

  const getMaskClipPath = (shape: AssetMaskShape): string | undefined => {
    switch (shape) {
      case 'octagon':
        return 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)';
      case 'diagonal-slice':
        return 'polygon(0% 0%, 94% 0%, 100% 88%, 6% 100%)';
      case 'offset-window':
        return 'polygon(4% 4%, 96% 0%, 96% 96%, 0% 94%)';
      default:
        return undefined;
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
              <circle cx="200" cy="200" r="176" stroke={c1} strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="200" cy="200" r="150" stroke={border} strokeWidth="1" />
              {Array.from({ length: 24 }).map((_, i) => {
                const a = (i * Math.PI) / 12;
                return (
                  <line
                    key={i}
                    x1={200 + Math.cos(a) * 112}
                    y1={200 + Math.sin(a) * 112}
                    x2={200 + Math.cos(a) * 172}
                    y2={200 + Math.sin(a) * 172}
                    stroke={i % 2 === 0 ? c1 : c2}
                    strokeWidth={i % 2 === 0 ? '1.5' : '0.8'}
                    opacity="0.68"
                  />
                );
              })}
              <rect x="26" y="56" width="26" height="288" stroke={c1} strokeWidth="1.5" />
              <rect x="348" y="56" width="26" height="288" stroke={c1} strokeWidth="1.5" />
              <polygon points="16,56 200,12 384,56" stroke={c1} strokeWidth="2" fill={c1 + '15'} />
              <circle cx="200" cy="185" r="62" stroke={c1} strokeWidth="2" fill={artDirection.bgElevated} />
            </g>
          </svg>
        );

      case 'geometric-construct':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g>
              <rect x="38" y="38" width="324" height="324" stroke={fg} strokeWidth="2.5" />
              <circle cx="140" cy="140" r="94" fill={c1} opacity="0.85" />
              <rect
                x="182"
                y="172"
                width="152"
                height="152"
                fill={c2}
                opacity="0.85"
                stroke={fg}
                strokeWidth="2.5"
              />
              <polygon
                points="64,342 192,342 128,210"
                fill={artDirection.bgCanvas}
                stroke={fg}
                strokeWidth="3"
              />
              <line x1="16" y1="200" x2="384" y2="200" stroke={fg} strokeWidth="1.5" strokeDasharray="6 6" />
              <line x1="200" y1="16" x2="200" y2="384" stroke={fg} strokeWidth="1.5" strokeDasharray="6 6" />
            </g>
          </svg>
        );

      case 'cyber-schematic':
      case 'pixel-retro':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g>
              <rect x="22" y="22" width="356" height="356" stroke={c1} strokeWidth="1.5" />
              <path d="M 22 64 L 64 22 M 336 22 L 378 64 M 22 336 L 64 378 M 336 378 L 378 336" stroke={c2} strokeWidth="2" />
              <circle cx="200" cy="200" r="134" stroke={c1} strokeWidth="1.5" strokeDasharray="12 6" />
              <circle cx="200" cy="200" r="98" stroke={c2} strokeWidth="2" />
              <rect x="148" y="148" width="104" height="104" stroke={c1} strokeWidth="2" fill={c1 + '22'} />
            </g>
          </svg>
        );

      case 'synth-horizon':
      case 'fluid-atmospheric':
      case 'glass-3d':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <defs>
              <linearGradient id={`synthSun-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c1} />
                <stop offset="100%" stopColor={c2} />
              </linearGradient>
            </defs>
            <g>
              <circle cx="200" cy="175" r="112" fill={`url(#synthSun-${config.id})`} opacity="0.85" />
              <line x1="12" y1="268" x2="388" y2="268" stroke={c1} strokeWidth="2.5" />
              <line x1="12" y1="312" x2="388" y2="312" stroke={c2} strokeWidth="1.2" />
              <line x1="12" y1="358" x2="388" y2="358" stroke={c2} strokeWidth="1.2" />
            </g>
          </svg>
        );

      case 'botanical-organic':
      case 'zen-ceramic':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g>
              <path
                d="M 76 356 L 76 168 A 124 124 0 0 1 324 168 L 324 356 Z"
                stroke={c1}
                strokeWidth="2"
                fill={c1 + '12'}
              />
              <circle cx="200" cy="152" r="56" fill={c2 + '35'} stroke={c2} strokeWidth="1.5" />
              <path d="M 200 235 Q 212 148 268 92" stroke={fg} strokeWidth="2.5" />
            </g>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g>
              <rect x="36" y="36" width="328" height="328" stroke={c1} strokeWidth="2" />
              <circle cx="200" cy="200" r="130" fill={c1 + '18'} stroke={c1} strokeWidth="2" />
              <path d="M 80 320 L 320 80 M 80 80 L 320 320" stroke={c2} strokeWidth="1.5" />
            </g>
          </svg>
        );
    }
  };

  const isCircleVariant =
    frameVariant === 'circle-medallion' ||
    frameVariant === 'stamp-seal' ||
    config.maskShape === 'circle';

  const isArchVariant =
    frameVariant === 'arch-niche' || config.maskShape === 'arch';

  const isFrameless =
    frameVariant === 'frameless-overlap' ||
    frameVariant === 'full-bleed-backdrop' ||
    frameVariant === 'stamp-seal';

  const outerShapeClasses =
    frameVariant === 'circle-medallion' || frameVariant === 'stamp-seal'
      ? 'rounded-full aspect-square'
      : frameVariant === 'arch-niche'
      ? 'rounded-t-[999px]'
      : '';

  const primaryAsset = config.primaryAsset;
  const secondaryAsset = config.secondaryAsset;
  const showSuppliedPrimary =
    activeMode !== 'typographic-geometric-totem' && !primaryError;
  const showSecondaryLayer =
    activeMode === 'multi-asset-layer' &&
    !secondaryError &&
    !compact &&
    secondaryAsset.id !== primaryAsset.id;
  const showPortraitOverlay =
    (activeMode === 'asset-portrait-fusion' ||
      (primaryError && activeMode !== 'typographic-geometric-totem')) &&
    !portraitError;

  const objectFitClass =
    config.cropMode === 'contain'
      ? 'object-contain p-1.5 sm:p-2.5'
      : config.cropMode === 'cover-top'
      ? 'object-cover object-top'
      : config.cropMode === 'artistic-zoom'
      ? 'object-cover object-center scale-110'
      : 'object-cover object-center';

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
      data-asset-id={primaryAsset.id}
      data-secondary-asset-id={secondaryAsset.id}
      data-composition-mode={activeMode}
      aria-label={`Interactive ${artDirection.name} artwork (${primaryAsset.title} & ${photo.caption}). Click to cycle visual plate.`}
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
      {/* Top Masking Tape Strip when polaroid-tape or collage-scrapbook */}
      {!compact &&
        (frameVariant === 'polaroid-tape' ||
          config.category === 'collage-scrapbook' ||
          activeMode === 'multi-asset-layer') && (
          <div
            aria-hidden="true"
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-6 z-30 opacity-80 -rotate-2 pointer-events-none"
            style={{
              backgroundColor: artDirection.accentPrimary,
              mixBlendMode: 'multiply',
            }}
          />
        )}

      {/* Layer 1: Style-Specific Procedural SVG Geometry & Halos (pointer-events-none) */}
      <div
        className={`absolute inset-0 ${
          compact ? 'p-0.5' : 'p-2 sm:p-4'
        } pointer-events-none`}
        style={{
          opacity: activeMode === 'typographic-geometric-totem' ? 1 : 0.48,
          transform: compact
            ? undefined
            : 'translate3d(calc(var(--px, 0) * 10px), calc(var(--py, 0) * 10px), 0)',
        }}
      >
        <div className="w-full h-full transition-transform duration-500 ease-out group-hover/illus:scale-[1.03]">
          {renderCategoryVectorArt()}
        </div>
      </div>

      {/* Layer 2: Primary Supplied Illustration Asset (from the 39+ asset library) */}
      {showSuppliedPrimary && (
        <div
          className={`relative z-10 overflow-hidden pointer-events-none ${
            compact
              ? 'w-[88%] h-[88%]'
              : activeMode === 'edge-bleed-asset'
              ? 'w-full h-full'
              : activeMode === 'multi-asset-layer' &&
                config.secondaryPlacement === 'split-diptych'
              ? 'w-[58%] h-[86%] -ml-[26%] border-2 shadow-xl'
              : isCircleVariant
              ? 'w-[76%] max-w-[360px] aspect-square rounded-full border-2 shadow-lg'
              : isArchVariant
              ? 'w-[78%] h-[86%] rounded-t-[999px] border-2 shadow-lg'
              : frameVariant === 'polaroid-tape'
              ? 'w-[78%] h-[84%] p-2 bg-white shadow-xl -rotate-1'
              : 'w-[82%] h-[86%] border-2 shadow-lg'
          }`}
          style={{
            borderColor: artDirection.accentPrimary,
            backgroundColor: primaryAsset.dominantPalette[2] || artDirection.bgSurface,
            clipPath: compact ? undefined : getMaskClipPath(config.maskShape),
            transform: compact
              ? undefined
              : `translate3d(calc(var(--px, 0) * -7px), calc(var(--py, 0) * -7px), 0) rotate(${config.rotationDeg.toFixed(
                  1
                )}deg)`,
            transition: 'opacity 360ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <img
            src={primaryAsset.url}
            alt={primaryAsset.title}
            onError={() => setPrimaryError(true)}
            className={`w-full h-full ${objectFitClass} transition-transform duration-500 ease-out group-hover/illus:scale-[1.04]`}
            style={{ filter: getAssetFilter() }}
          />
          {config.blendTreatment === 'duotone-tint' && (
            <div
              className="absolute inset-0 mix-blend-color opacity-25 pointer-events-none"
              style={{ backgroundColor: artDirection.accentPrimary }}
            />
          )}
        </div>
      )}

      {/* Layer 3: Secondary Supplied Illustration Asset (Multi-Image Layering & Collage) */}
      {showSecondaryLayer && (
        <div
          className={`
            absolute z-20 overflow-hidden pointer-events-none border-2 shadow-2xl
            ${
              config.secondaryPlacement === 'top-right-overlap'
                ? 'top-3 right-3 w-[42%] h-[46%] rotate-3'
                : config.secondaryPlacement === 'bottom-left-cutout'
                ? 'bottom-9 left-3 w-[44%] h-[46%] -rotate-3'
                : config.secondaryPlacement === 'floating-stamp'
                ? 'top-4 left-4 w-28 h-28 sm:w-36 sm:h-36 rounded-full rotate-6'
                : 'right-3 top-6 bottom-10 w-[44%] rotate-1'
            }
          `}
          style={{
            borderColor: artDirection.accentSecondary,
            backgroundColor: secondaryAsset.dominantPalette[2] || artDirection.bgElevated,
            transform:
              'translate3d(calc(var(--px, 0) * 11px), calc(var(--py, 0) * -9px), 0)',
          }}
        >
          <img
            src={secondaryAsset.url}
            alt={secondaryAsset.title}
            onError={() => setSecondaryError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover/illus:scale-105"
          />
        </div>
      )}

      {/* Layer 4: Shamil TP Portrait Medallion / Fusion Plate */}
      {showPortraitOverlay && (
        <div
          className={`
            ${
              showSuppliedPrimary && !compact
                ? 'absolute bottom-10 right-3 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 shadow-2xl z-20'
                : 'relative z-10 w-[68%] h-[76%] border-2 shadow-xl'
            }
            overflow-hidden pointer-events-none
          `}
          style={{
            borderColor: artDirection.accentPrimary,
            backgroundColor: artDirection.bgSurface,
            transform: compact
              ? undefined
              : 'translate3d(calc(var(--px, 0) * 9px), calc(var(--py, 0) * 7px), 0)',
          }}
        >
          <img
            src={photo.url}
            alt={photo.caption}
            referrerPolicy="no-referrer"
            onError={() => setPortraitError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover/illus:scale-105"
          />
        </div>
      )}

      {/* Layer 5: Discreet Gallery Plate Controls (Appears smoothly on hover without shifting layout) */}
      {compact ? (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-black/75 px-1 py-0.5 text-[9px] font-mono text-white text-center truncate pointer-events-none opacity-0 group-hover/illus:opacity-100 transition-opacity duration-300">
          {primaryAsset.filename}
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2.5 sm:p-3 text-white flex items-end justify-between gap-2 opacity-0 group-hover/illus:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <div className="min-w-0 pointer-events-none">
            <div className="text-[10px] font-mono text-white/75 truncate">
              {activeMode === 'multi-asset-layer'
                ? `${primaryAsset.filename} × ${secondaryAsset.filename}`
                : activeMode === 'asset-portrait-fusion'
                ? `${primaryAsset.filename} + Portrait`
                : primaryAsset.filename}{' '}
              · {primaryAsset.visualCategory}
            </div>
            <div
              className="text-xs font-bold truncate"
              style={{ fontFamily: artDirection.fontDisplay }}
            >
              {activeMode === 'typographic-geometric-totem'
                ? config.title
                : primaryAsset.title}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const cycleOrder: IllustrationCompositionMode[] = [
                  'supplied-asset-plate',
                  'multi-asset-layer',
                  'asset-portrait-fusion',
                  'typographic-geometric-totem',
                ];
                const idx = cycleOrder.indexOf(activeMode);
                setActiveMode(cycleOrder[(idx + 1) % cycleOrder.length]);
              }}
              className="px-2 py-1 text-[10px] font-mono bg-black/75 hover:bg-black text-white border border-white/25 cursor-pointer whitespace-nowrap transition-colors"
              aria-label="Cycle visual plate composition mode (Single Asset, Multi-Asset Collage, Portrait Fusion, Pure Vector)"
            >
              {activeMode === 'supplied-asset-plate' && (
                <>
                  <ImageIcon className="w-3 h-3 inline mr-1" />
                  <span>Art Plate</span>
                </>
              )}
              {activeMode === 'multi-asset-layer' && (
                <>
                  <Layers className="w-3 h-3 inline mr-1" />
                  <span>2-Asset Collage</span>
                </>
              )}
              {activeMode === 'asset-portrait-fusion' && (
                <>
                  <User className="w-3 h-3 inline mr-1" />
                  <span>Art + Portrait</span>
                </>
              )}
              {(activeMode === 'edge-bleed-asset' ||
                activeMode === 'typographic-geometric-totem') && (
                <>
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  <span>Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Ambient / Off-Grid Background & Edge-Bleed Illustration Asset Layer
 * Renders secondary or edge-to-edge supplied assets behind poster paradigms when overflowBleed is active,
 * creating genuine multi-layered poster depth without interfering with text legibility or hover states.
 */
export const PosterBackgroundAssetLayer: React.FC<{
  artDirection: SynthesizedArtDirection;
  config: IllustrationConfig;
}> = ({ artDirection, config }) => {
  const [bgError, setBgError] = useState(false);

  useEffect(() => {
    setBgError(false);
  }, [config.secondaryAsset.id, config.primaryAsset.id]);

  if (!config.overflowBleed || bgError) return null;

  const bgAsset =
    config.compositionMode === 'multi-asset-layer'
      ? config.primaryAsset
      : config.secondaryAsset;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-[1]"
    >
      <div
        className="absolute -right-10 -bottom-10 w-[40vw] max-w-[480px] aspect-[3/4] opacity-[0.13] sm:opacity-[0.16] rotate-6"
        style={{
          transform:
            'translate3d(calc(var(--px, 0) * -14px), calc(var(--py, 0) * -14px), 0)',
          mixBlendMode: artDirection.isDark ? 'screen' : 'multiply',
        }}
      >
        <img
          src={bgAsset.url}
          alt=""
          onError={() => setBgError(true)}
          className="w-full h-full object-cover object-center grayscale contrast-125"
        />
      </div>
    </div>
  );
};
