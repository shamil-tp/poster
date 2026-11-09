import React, { useState } from 'react';
import { SynthesizedArtDirection } from './hybridGenerator';
import { PortfolioPhoto } from '../utils/knowledgeParser';
import { Camera, Sparkles } from 'lucide-react';

export interface IllustrationConfig {
  id: string;
  title: string;
  subject: string;
  category: SynthesizedArtDirection['illustrationCategory'];
  scaleFactor: number;
  rotationDeg: number;
  framingMode: 'integrated-portrait-sculpture' | 'pure-procedural-totem' | 'duotone-collage-cutout';
  overflowBleed: boolean;
}

export function generateIllustrationConfig(
  artDirection: SynthesizedArtDirection,
  rng: () => number
): IllustrationConfig {
  const modes: IllustrationConfig['framingMode'][] = [
    'integrated-portrait-sculpture',
    'duotone-collage-cutout',
    'pure-procedural-totem',
  ];
  const r = rng();
  const framingMode =
    r < 0.58
      ? 'integrated-portrait-sculpture'
      : r < 0.86
      ? 'duotone-collage-cutout'
      : modes[2];

  return {
    id: `illus-${artDirection.signatureId}-${Math.floor(rng() * 1000)}`,
    title: `${artDirection.name} Visual Plates`,
    subject: artDirection.illustrationSubject,
    category: artDirection.illustrationCategory,
    scaleFactor: 0.96 + rng() * 0.14,
    rotationDeg:
      artDirection.illustrationCategory === 'collage-scrapbook'
        ? (rng() - 0.5) * 5
        : 0,
    framingMode,
    overflowBleed: rng() < 0.5,
  };
}

export type IllustrationFrameVariant =
  | 'default'
  | 'circle-medallion'
  | 'arch-niche'
  | 'frameless-overlap'
  | 'polaroid-tape'
  | 'full-bleed-backdrop';

interface ProceduralIllustrationProps {
  artDirection: SynthesizedArtDirection;
  config: IllustrationConfig;
  photo: PortfolioPhoto;
  pointer: { x: number; y: number; active: boolean; influence?: number };
  onCyclePhoto: () => void;
  compact?: boolean;
  frameVariant?: IllustrationFrameVariant;
  className?: string;
}

export const ProceduralIllustration: React.FC<ProceduralIllustrationProps> = ({
  artDirection,
  config,
  photo,
  pointer,
  onCyclePhoto,
  compact = false,
  frameVariant = 'default',
  className = '',
}) => {
  const [hovered, setHovered] = useState(false);
  const [showPureVector, setShowPureVector] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  const inf = pointer.influence !== undefined ? pointer.influence : pointer.active ? 1 : 0;
  const px = (pointer.x - 0.5) * 26 * inf;
  const py = (pointer.y - 0.5) * 26 * inf;
  const tiltX = (0.5 - pointer.y) * 8 * inf;
  const tiltY = (pointer.x - 0.5) * 8 * inf;

  const getPhotoFilter = (): string => {
    switch (artDirection.photoTreatment) {
      case 'high-contrast-mono':
        return 'grayscale(0.92) contrast(1.24)';
      case 'warm-sepia':
        return 'sepia(0.36) contrast(1.08)';
      case 'duotone-accent':
        return 'contrast(1.15) saturate(1.22)';
      case 'halftone-frame':
        return 'contrast(1.22) saturate(1.15)';
      default:
        return 'contrast(1.05)';
    }
  };

  const renderCategoryVectorArt = () => {
    const c1 = artDirection.accentPrimary;
    const c2 = artDirection.accentSecondary;
    const fg = artDirection.textPrimary;
    const border = artDirection.borderColor;
    const pulseRot = (pulseCount % 4) * 15;

    switch (config.category) {
      case 'classical-sculpture':
      case 'ornate-engraving':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g
              style={{
                transform: `translate3d(${(px * 0.45).toFixed(2)}px, ${(py * 0.45).toFixed(
                  2
                )}px, 0) rotate(${pulseRot * 0.25}deg)`,
                transformOrigin: '200px 200px',
              }}
            >
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
              <line x1="35" y1="56" x2="35" y2="344" stroke={c1} strokeWidth="0.8" />
              <line x1="44" y1="56" x2="44" y2="344" stroke={c1} strokeWidth="0.8" />
              <rect x="348" y="56" width="26" height="288" stroke={c1} strokeWidth="1.5" />
              <line x1="356" y1="56" x2="356" y2="344" stroke={c1} strokeWidth="0.8" />
              <line x1="365" y1="56" x2="365" y2="344" stroke={c1} strokeWidth="0.8" />
              <polygon points="16,56 200,12 384,56" stroke={c1} strokeWidth="2" fill={c1 + '15'} />
              <path
                d="M135,346 C135,282 265,282 265,346 Z"
                fill={c1 + '30'}
                stroke={c1}
                strokeWidth="2"
              />
              <circle cx="200" cy="185" r="62" stroke={c1} strokeWidth="2" fill={artDirection.bgElevated} />
            </g>
          </svg>
        );

      case 'geometric-construct':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g
              style={{
                transform: `translate3d(${(px * 0.55).toFixed(2)}px, ${(py * 0.55).toFixed(
                  2
                )}px, 0) rotate(${pulseRot * 0.4}deg)`,
                transformOrigin: '200px 200px',
              }}
            >
              <rect x="38" y="38" width="324" height="324" stroke={fg} strokeWidth="2.5" />
              <circle cx="140" cy="140" r="94" fill={c1} />
              <rect
                x="182"
                y="172"
                width="152"
                height="152"
                fill={c2}
                stroke={fg}
                strokeWidth="2.5"
              />
              <polygon
                points="64,342 192,342 128,210"
                fill={artDirection.bgCanvas}
                stroke={fg}
                strokeWidth="3"
              />
              <path
                d="M 230 62 L 268 62 L 268 94 L 304 94 L 304 126 L 340 126"
                stroke={fg}
                strokeWidth="4"
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
            <g
              style={{
                transform: `translate3d(${(px * 0.65).toFixed(2)}px, ${(py * 0.65).toFixed(2)}px, 0)`,
              }}
            >
              <rect x="22" y="22" width="356" height="356" stroke={c1} strokeWidth="1.5" />
              <path d="M 22 64 L 64 22 M 336 22 L 378 64 M 22 336 L 64 378 M 336 378 L 378 336" stroke={c2} strokeWidth="2" />
              <circle cx="200" cy="200" r="134" stroke={c1} strokeWidth="1.5" strokeDasharray="12 6" />
              <circle cx="200" cy="200" r="98" stroke={c2} strokeWidth="2" />
              <rect x="148" y="148" width="104" height="104" stroke={c1} strokeWidth="2" fill={c1 + '22'} />
              <rect x="166" y="174" width="22" height="22" fill={c1} />
              <rect x="212" y="174" width="22" height="22" fill={c1} />
              <path d="M 166 222 L 234 222" stroke={c2} strokeWidth="6" />
              <line x1="200" y1="32" x2="200" y2="102" stroke={c1} strokeWidth="1.5" />
              <line x1="200" y1="298" x2="200" y2="368" stroke={c1} strokeWidth="1.5" />
              <line x1="32" y1="200" x2="102" y2="200" stroke={c1} strokeWidth="1.5" />
              <line x1="298" y1="200" x2="368" y2="200" stroke={c1} strokeWidth="1.5" />
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
            <g
              style={{
                transform: `translate3d(${(px * 0.5).toFixed(2)}px, ${(py * 0.5).toFixed(2)}px, 0)`,
              }}
            >
              <circle cx="200" cy="175" r="112" fill={`url(#synthSun-${config.id})`} opacity="0.85" />
              {[195, 215, 235, 255].map((y, idx) => (
                <rect
                  key={y}
                  x="80"
                  y={y}
                  width="240"
                  height={4 + idx * 2}
                  fill={artDirection.bgSurface}
                />
              ))}
              <line x1="12" y1="268" x2="388" y2="268" stroke={c1} strokeWidth="2.5" />
              <line x1="12" y1="298" x2="388" y2="298" stroke={c2} strokeWidth="1.2" />
              <line x1="12" y1="334" x2="388" y2="334" stroke={c2} strokeWidth="1.2" />
              <line x1="12" y1="374" x2="388" y2="374" stroke={c2} strokeWidth="1.2" />
              {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((n) => (
                <line
                  key={n}
                  x1={200 + n * 18}
                  y1="268"
                  x2={200 + n * 60}
                  y2="388"
                  stroke={c1}
                  strokeWidth="1"
                  opacity="0.72"
                />
              ))}
            </g>
          </svg>
        );

      case 'botanical-organic':
      case 'zen-ceramic':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g
              style={{
                transform: `translate3d(${(px * 0.4).toFixed(2)}px, ${(py * 0.4).toFixed(2)}px, 0)`,
              }}
            >
              <path
                d="M 76 356 L 76 168 A 124 124 0 0 1 324 168 L 324 356 Z"
                stroke={c1}
                strokeWidth="2"
                fill={c1 + '12'}
              />
              <circle cx="200" cy="152" r="56" fill={c2 + '35'} stroke={c2} strokeWidth="1.5" />
              <path
                d="M 162 228 Q 126 280 152 344 L 248 344 Q 274 280 238 228 Z"
                fill={c1}
                opacity="0.85"
              />
              <path d="M 200 235 Q 212 148 268 92" stroke={fg} strokeWidth="2.5" />
              <ellipse cx="232" cy="154" rx="24" ry="11" transform="rotate(-30 232 154)" fill={c2} />
              <ellipse cx="176" cy="174" rx="24" ry="11" transform="rotate(25 176 174)" fill={c1} />
              <ellipse cx="256" cy="112" rx="19" ry="9" transform="rotate(-40 256 112)" fill={c2} />
            </g>
          </svg>
        );

      case 'mechanical-gear':
      case 'maritime-nautical':
      case 'surreal-portal':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g
              style={{
                transform: `translate3d(${(px * 0.48).toFixed(2)}px, ${(py * 0.48).toFixed(
                  2
                )}px, 0) rotate(${((pointer.x - 0.5) * 18 * inf + pulseRot).toFixed(2)}deg)`,
                transformOrigin: '200px 200px',
              }}
            >
              <circle cx="200" cy="200" r="160" stroke={c1} strokeWidth="2.5" />
              <circle cx="200" cy="200" r="130" stroke={c2} strokeWidth="1.5" strokeDasharray="8 6" />
              <circle cx="200" cy="200" r="88" stroke={c1} strokeWidth="2" />
              <polygon
                points="200,24 224,176 376,200 224,224 200,376 176,224 24,200 176,176"
                stroke={c1}
                strokeWidth="1.8"
                fill={c1 + '18'}
              />
              <ellipse cx="200" cy="200" rx="52" ry="30" stroke={fg} strokeWidth="2" fill={artDirection.bgElevated} />
              <circle cx="200" cy="200" r="15" fill={c1} />
            </g>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
            <g
              style={{
                transform: `translate3d(${(px * 0.5).toFixed(2)}px, ${(py * 0.5).toFixed(2)}px, 0)`,
              }}
            >
              <rect x="36" y="36" width="328" height="328" stroke={c1} strokeWidth="2" />
              <circle cx="200" cy="200" r="122" fill={c1 + '22'} stroke={c1} strokeWidth="2.5" />
              <path d="M 80 320 L 320 80 M 80 80 L 320 320" stroke={c2} strokeWidth="1.5" />
              <rect x="136" y="136" width="128" height="128" stroke={fg} strokeWidth="2" fill={artDirection.bgElevated} />
            </g>
          </svg>
        );
    }
  };

  // Portrait visibility uses smooth opacity/scale rather than mounting/unmounting on hover
  const isPortraitVisible = !showPureVector && !imgError;

  const isCircleVariant =
    frameVariant === 'circle-medallion' ||
    config.category === 'classical-sculpture' ||
    config.category === 'ornate-engraving' ||
    config.category === 'maritime-nautical' ||
    config.category === 'mechanical-gear';

  const isArchVariant =
    frameVariant === 'arch-niche' ||
    config.category === 'botanical-organic' ||
    config.category === 'zen-ceramic';

  const isFrameless = frameVariant === 'frameless-overlap' || frameVariant === 'full-bleed-backdrop';

  const outerShapeClasses =
    frameVariant === 'circle-medallion'
      ? 'rounded-full aspect-square'
      : frameVariant === 'arch-niche'
      ? 'rounded-t-[999px]'
      : '';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setPulseCount((c) => c + 1);
        onCyclePhoto();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setPulseCount((c) => c + 1);
          onCyclePhoto();
        }
      }}
      aria-label={`Interactive ${artDirection.name} artwork and portrait (${photo.caption}). Click to cycle visual plate.`}
      className={`relative group cursor-pointer select-none overflow-hidden flex items-center justify-center ${
        compact ? 'w-full h-full' : 'w-full h-full min-h-[180px]'
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
        transform: compact
          ? undefined
          : `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(
              2
            )}deg) rotate(${config.rotationDeg.toFixed(2)}deg)`,
        willChange: 'transform',
      }}
    >
      {/* Top Masking Tape Strip when polaroid-tape or collage-scrapbook */}
      {!compact &&
        (frameVariant === 'polaroid-tape' ||
          config.category === 'collage-scrapbook') && (
          <div
            aria-hidden="true"
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-6 z-30 opacity-80 rotate-[-2deg] pointer-events-none"
            style={{
              backgroundColor: artDirection.accentPrimary,
              mixBlendMode: 'multiply',
            }}
          />
        )}

      {/* Layer 1: Style-Specific Procedural SVG Artwork */}
      <div
        className={`absolute inset-0 ${
          compact ? 'p-0.5' : 'p-2 sm:p-4'
        } pointer-events-none transition-transform duration-500 ease-out`}
        style={{
          transform: hovered && !compact ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        {renderCategoryVectorArt()}
      </div>

      {/* Layer 2: Art-Directed Portrait Sculpture Integration (Always mounted to prevent hover flicker) */}
      {!imgError && (
        <div
          className={`relative z-10 overflow-hidden ${
            compact
              ? 'w-[76%] h-[76%] border'
              : isCircleVariant
              ? 'w-[60%] max-w-[300px] aspect-square rounded-full border-2'
              : isArchVariant
              ? 'w-[62%] h-[74%] rounded-t-[999px] border-2'
              : frameVariant === 'polaroid-tape' ||
                config.category === 'collage-scrapbook'
              ? 'w-[66%] h-[72%] p-2 bg-white shadow-xl -rotate-2'
              : 'w-[64%] h-[72%] border-2'
          }`}
          style={{
            borderColor: artDirection.accentPrimary,
            opacity: isPortraitVisible ? 1 : 0,
            pointerEvents: isPortraitVisible ? 'auto' : 'none',
            transform: compact
              ? undefined
              : `translate3d(${(-px * 0.42).toFixed(2)}px, ${(-py * 0.42).toFixed(
                  2
                )}px, 0) scale(${isPortraitVisible ? (hovered ? 1.03 : 1) : 0.92})`,
            transition:
              'opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform, opacity',
          }}
        >
          <img
            src={photo.url}
            alt={photo.caption}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-700 cubic-bezier(0.22, 1, 0.36, 1) group-hover:scale-105"
            style={{ filter: getPhotoFilter() }}
          />
          {artDirection.photoTreatment === 'duotone-accent' && (
            <div
              className="absolute inset-0 mix-blend-color opacity-35 pointer-events-none"
              style={{ backgroundColor: artDirection.accentPrimary }}
            />
          )}
        </div>
      )}

      {/* Layer 3: Discreet Gallery Plate Controls (Hidden until hover on desktop) */}
      {compact ? (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-black/70 px-1 py-0.5 text-[9px] font-mono text-white text-center truncate pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Swap
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-2.5 sm:p-3.5 text-white flex items-end justify-between gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-white/75 truncate">
              {config.subject}
            </div>
            <div
              className="text-xs font-bold truncate"
              style={{ fontFamily: artDirection.fontDisplay }}
            >
              {isPortraitVisible ? photo.caption : config.title}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPureVector((v) => !v);
              }}
              className="px-2 py-1 text-[10px] font-mono bg-black/70 hover:bg-black text-white border border-white/25 cursor-pointer whitespace-nowrap transition-colors"
              aria-label="Toggle between Pure Vector Illustration and Portrait Sculpture"
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              {showPureVector ? 'Portrait + Art' : 'Pure Vector'}
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-black/70 text-white border border-white/20">
              <Camera className="w-3 h-3" />
              <span>Plate</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
