import React, { useState, useRef } from 'react';
import { SynthesizedArtDirection } from '../engine/hybridGenerator';
import { TypographyConfig } from '../engine/typographyGenerator';

export interface SmoothPointer {
  x: number; // smoothed 0..1
  y: number; // smoothed 0..1
  vx: number; // velocity x
  vy: number; // velocity y
  influence: number; // smoothed 0..1 (replaces abrupt boolean active)
  active: boolean;
}

interface InteractiveHeadlineProps {
  text: string;
  subtitle?: string;
  artDirection: SynthesizedArtDirection;
  typography: TypographyConfig;
  pointer: SmoothPointer;
  onCycleTypography: () => void;
  sizeClass?: string;
  align?: 'left' | 'center' | 'right';
  showSubtitle?: boolean;
  showMetaHint?: boolean;
}

export const InteractiveHeadline: React.FC<InteractiveHeadlineProps> = ({
  text,
  subtitle,
  artDirection,
  typography,
  pointer,
  onCycleTypography,
  sizeClass = 'text-4xl sm:text-6xl lg:text-7xl',
  align = 'left',
  showSubtitle = true,
  showMetaHint = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localCursor, setLocalCursor] = useState({ x: 0.5, y: 0.5 });

  const displayTitle = typography.uppercaseHeadline ? text.toUpperCase() : text;
  const chars = displayTitle.split('');

  const handleLocalMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const lx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ly = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setLocalCursor({ x: lx, y: ly });
  };

  // Smoothly modulated offsets driven by smoothed pointer.influence (0..1) -> zero flicker or jump
  const inf = pointer.influence;
  const offsetX = (pointer.x - 0.5) * 18 * inf;
  const offsetY = (pointer.y - 0.5) * 12 * inf;
  const magneticX = hovered ? (localCursor.x - 0.5) * 10 : offsetX * 0.35;
  const magneticY = hovered ? (localCursor.y - 0.5) * 6 : offsetY * 0.35;

  const alignClasses =
    align === 'center'
      ? 'items-center text-center justify-center'
      : align === 'right'
      ? 'items-end text-right justify-end'
      : 'items-start text-left justify-start';

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleLocalMove}
      onClick={(e) => {
        e.stopPropagation();
        onCycleTypography();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCycleTypography();
        }
      }}
      aria-label={`${text}${subtitle ? ` — ${subtitle}` : ''}. Interactive typography (${typography.interactiveLabel}). Click to cycle font variation.`}
      className={`group relative cursor-pointer select-none flex flex-col ${alignClasses}`}
      style={{
        transform: `translate3d(${magneticX.toFixed(2)}px, ${magneticY.toFixed(2)}px, 0)`,
        transition: hovered
          ? 'transform 120ms cubic-bezier(0.22, 1, 0.36, 1)'
          : 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
      }}
    >
      {/* Curved SVG Arc Headline Option (when headlineTreatment === 'curved-svg-arc' on desktop) */}
      {typography.headlineTreatment === 'curved-svg-arc' && (
        <div className="hidden xl:block w-full h-24 -mb-2 overflow-visible">
          <svg viewBox="0 0 720 105" className="w-full h-full overflow-visible">
            <defs>
              <path
                id="editorialArcPath"
                d={`M 16,88 Q 360,${14 + (pointer.y - 0.5) * 24 * inf} 704,88`}
                fill="none"
              />
            </defs>
            <text
              fill={artDirection.textPrimary}
              style={{
                fontFamily: typography.fontDisplay,
                fontSize: '50px',
                fontWeight: 800,
                letterSpacing: hovered ? '0.12em' : '0.05em',
                transition: 'letter-spacing 420ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <textPath href="#editorialArcPath" startOffset="50%" textAnchor="middle">
                {displayTitle}
              </textPath>
            </text>
          </svg>
        </div>
      )}

      {/* Standard / Kinetic Character-Level Interactive Headline */}
      <div
        className={`relative ${
          typography.headlineTreatment === 'curved-svg-arc' ? 'xl:hidden' : ''
        }`}
      >
        {/* Chromatic / Layered Echo Backplates (smoothly driven by pointer offset) */}
        {(typography.headlineTreatment === 'layered-echo-shadow' ||
          typography.interactiveMode === 'chromatic-echo-split') && (
          <>
            <div
              aria-hidden="true"
              className={`${sizeClass} font-bold tracking-tight leading-[0.92] absolute inset-0 pointer-events-none select-none`}
              style={{
                fontFamily: typography.fontDisplay,
                color: 'transparent',
                WebkitTextStroke: `1.5px ${artDirection.accentPrimary}`,
                opacity: 0.28 + (hovered ? 0.32 : inf * 0.18),
                transform: `translate3d(${(offsetX * 0.9 + (hovered ? 6 : 3)).toFixed(
                  2
                )}px, ${(offsetY * 0.9 + (hovered ? 4 : 2)).toFixed(2)}px, 0)`,
                transition:
                  'opacity 360ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {displayTitle}
            </div>
            <div
              aria-hidden="true"
              className={`${sizeClass} font-bold tracking-tight leading-[0.92] absolute inset-0 pointer-events-none select-none`}
              style={{
                fontFamily: typography.fontDisplay,
                color: 'transparent',
                WebkitTextStroke: `1px ${artDirection.accentSecondary}`,
                opacity: hovered ? 0.42 : inf * 0.2,
                transform: `translate3d(${(-offsetX * 0.65 - (hovered ? 5 : 2)).toFixed(
                  2
                )}px, ${(-offsetY * 0.65 - (hovered ? 3 : 1)).toFixed(2)}px, 0)`,
                transition:
                  'opacity 360ms cubic-bezier(0.22, 1, 0.36, 1), transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {displayTitle}
            </div>
          </>
        )}

        <h1
          className={`${sizeClass} font-bold tracking-tight leading-[0.92] relative z-10 flex flex-wrap items-baseline ${
            align === 'center'
              ? 'justify-center'
              : align === 'right'
              ? 'justify-end'
              : 'justify-start'
          }`}
          style={{
            fontFamily: typography.fontDisplay,
            letterSpacing:
              hovered && typography.interactiveMode === 'hover-letter-spread'
                ? '0.07em'
                : typography.letterSpacing,
            transition: 'letter-spacing 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {chars.map((ch, idx) => {
            if (ch === ' ') {
              return (
                <span key={idx} className="inline-block w-[0.26em]">
                  &nbsp;
                </span>
              );
            }

            // Smooth Gaussian cursor-wave per character using localCursor when hovered or global pointer
            const charRatio = idx / Math.max(1, chars.length - 1);
            const activeCursorX = hovered ? localCursor.x : pointer.x;
            const dist = Math.abs(activeCursorX - charRatio);
            const gaussian = Math.exp(-(dist * dist) / 0.08);

            const intensity = hovered ? 1 : inf * 0.45;
            const waveLift =
              typography.interactiveMode === 'cursor-weight-wave' || hovered
                ? gaussian * -7 * intensity
                : 0;

            const scaleBoost =
              hovered && typography.interactiveMode === 'cursor-weight-wave'
                ? 1 + gaussian * 0.08
                : 1;

            const skewDeg =
              typography.interactiveMode === 'word-tilt-shift'
                ? (activeCursorX - 0.5) * 10 * intensity
                : typography.headlineTreatment === 'rotated-constructivist'
                ? -2
                : 0;

            const isOutlineChar =
              typography.headlineTreatment === 'split-outline-solid' &&
              idx >= Math.floor(chars.length / 2);

            const isGradient =
              typography.headlineTreatment === 'gradient-iridescent';

            const showStrokeLook =
              (isOutlineChar && !hovered) ||
              (hovered &&
                typography.interactiveMode === 'outline-fill-invert' &&
                gaussian > 0.45);

            return (
              <span
                key={idx}
                className="inline-block"
                style={{
                  transform: `translate3d(0, ${waveLift.toFixed(
                    2
                  )}px, 0) scale(${scaleBoost.toFixed(3)}) skewX(${skewDeg.toFixed(
                    2
                  )}deg)`,
                  transition: hovered
                    ? 'transform 140ms cubic-bezier(0.22, 1, 0.36, 1), color 260ms ease'
                    : 'transform 460ms cubic-bezier(0.22, 1, 0.36, 1), color 260ms ease',
                  color: showStrokeLook
                    ? 'transparent'
                    : isGradient
                    ? idx % 2 === 0
                      ? artDirection.accentPrimary
                      : artDirection.textPrimary
                    : artDirection.textPrimary,
                  WebkitTextStroke: showStrokeLook
                    ? `1.5px ${
                        hovered
                          ? artDirection.accentPrimary
                          : artDirection.textPrimary
                      }`
                    : undefined,
                  willChange: 'transform',
                }}
              >
                {ch}
              </span>
            );
          })}
        </h1>
      </div>

      {/* Optional Subtitle & Subtle Hover Hint */}
      {showSubtitle && subtitle && (
        <div
          className={`flex flex-wrap items-center gap-3 mt-1.5 ${
            align === 'center'
              ? 'justify-center'
              : align === 'right'
              ? 'justify-end'
              : 'justify-start'
          }`}
        >
          <p
            className="text-xs sm:text-sm lg:text-base font-semibold tracking-wide"
            style={{
              color: artDirection.accentPrimary,
              fontFamily: typography.fontBody,
            }}
          >
            {subtitle}
          </p>
          {showMetaHint && (
            <span
              className="text-[10px] font-mono opacity-0 group-hover:opacity-75 transition-opacity duration-300"
              style={{ color: artDirection.textSecondary }}
            >
              [{typography.pairingName}]
            </span>
          )}
        </div>
      )}
    </div>
  );
};
