import React from 'react';
import { SynthesizedArtDirection } from '../engine/hybridGenerator';
import { TypographyConfig } from '../engine/typographyGenerator';

export interface SmoothPointer {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  influence?: number;
  active: boolean;
}

interface InteractiveHeadlineProps {
  text: string;
  subtitle?: string;
  artDirection: SynthesizedArtDirection;
  typography: TypographyConfig;
  pointer?: SmoothPointer;
  onCycleTypography: () => void;
  sizeClass?: string;
  align?: 'left' | 'center' | 'right';
  showSubtitle?: boolean;
  showMetaHint?: boolean;
  colorOverride?: string;
}

export const InteractiveHeadline: React.FC<InteractiveHeadlineProps> = ({
  text,
  subtitle,
  artDirection,
  typography,
  onCycleTypography,
  sizeClass = 'text-4xl sm:text-6xl lg:text-7xl',
  align = 'left',
  showSubtitle = true,
  showMetaHint = false,
  colorOverride,
}) => {
  const displayTitle = typography.uppercaseHeadline ? text.toUpperCase() : text;
  const words = displayTitle.split(' ');
  const primaryTextColor = colorOverride || artDirection.textPrimary;

  const alignClasses =
    align === 'center'
      ? 'items-center text-center justify-center'
      : align === 'right'
      ? 'items-end text-right justify-end'
      : 'items-start text-left justify-start';

  return (
    /* STATIC OUTER HIT-BOX: Never transforms or changes layout size on hover -> 100% immune to hover oscillation */
    <div
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
      aria-label={`${text}${
        subtitle ? ` — ${subtitle}` : ''
      }. Interactive typography (${typography.interactiveLabel}). Click to cycle font variation.`}
      className={`group/headline relative cursor-pointer select-none flex flex-col ${alignClasses}`}
    >
      {/* Curved SVG Arc Headline Option */}
      {typography.headlineTreatment === 'curved-svg-arc' && (
        <div className="hidden xl:block w-full h-24 -mb-2 overflow-visible pointer-events-none">
          <svg viewBox="0 0 720 105" className="w-full h-full overflow-visible">
            <defs>
              <path
                id="editorialArcPath"
                d="M 16,88 Q 360,16 704,88"
                fill="none"
              />
            </defs>
            <text
              fill={primaryTextColor}
              className="transition-opacity duration-300 group-hover/headline:opacity-90"
              style={{
                fontFamily: typography.fontDisplay,
                fontSize: '50px',
                fontWeight: 800,
                letterSpacing: '0.06em',
              }}
            >
              <textPath href="#editorialArcPath" startOffset="50%" textAnchor="middle">
                {displayTitle}
              </textPath>
            </text>
          </svg>
        </div>
      )}

      {/* Visual Inner Container: Pointer-events-none so transforms never alter the parent hit-box */}
      <div
        className={`relative pointer-events-none ${
          typography.headlineTreatment === 'curved-svg-arc' ? 'xl:hidden' : ''
        }`}
        style={{
          transform:
            'translate3d(calc(var(--px, 0) * 6px), calc(var(--py, 0) * 4px), 0)',
        }}
      >
        {/* Chromatic / Layered Echo Backplate */}
        {(typography.headlineTreatment === 'layered-echo-shadow' ||
          typography.interactiveMode === 'chromatic-echo-split') && (
          <div
            aria-hidden="true"
            className={`${sizeClass} font-bold tracking-tight leading-[0.92] absolute inset-0 select-none opacity-25 group-hover/headline:opacity-60 transition-opacity duration-300 flex flex-wrap items-baseline gap-x-[0.24em] ${
              align === 'center'
                ? 'justify-center'
                : align === 'right'
                ? 'justify-end'
                : 'justify-start'
            }`}
            style={{
              fontFamily: typography.fontDisplay,
              color: 'transparent',
              WebkitTextStroke: `1.5px ${artDirection.accentPrimary}`,
              letterSpacing: typography.letterSpacing,
              transform:
                'translate3d(calc(4px + var(--px, 0) * 10px), calc(3px + var(--py, 0) * 8px), 0)',
            }}
          >
            {words.map((w, idx) => (
              <span key={idx} className="inline-block">
                {w}
              </span>
            ))}
          </div>
        )}

        <h1
          className={`${sizeClass} font-bold tracking-tight leading-[0.92] relative z-10 flex flex-wrap items-baseline gap-x-[0.24em] ${
            align === 'center'
              ? 'justify-center'
              : align === 'right'
              ? 'justify-end'
              : 'justify-start'
          }`}
          style={{
            fontFamily: typography.fontDisplay,
            letterSpacing: typography.letterSpacing,
          }}
        >
          {words.map((word, wIdx) => {
            const isOutlineWord =
              typography.headlineTreatment === 'split-outline-solid' &&
              wIdx >= Math.ceil(words.length / 2);

            const isGradient =
              typography.headlineTreatment === 'gradient-iridescent';

            const wordShiftClass =
              typography.interactiveMode === 'word-tilt-shift'
                ? wIdx % 2 === 0
                  ? 'group-hover/headline:-translate-y-1 group-hover/headline:-rotate-1'
                  : 'group-hover/headline:translate-y-1 group-hover/headline:rotate-1'
                : 'group-hover/headline:-translate-y-0.5';

            return (
              <span
                key={wIdx}
                className={`inline-block transition-transform duration-300 ease-out ${wordShiftClass}`}
                style={{
                  color: isOutlineWord
                    ? 'transparent'
                    : isGradient
                    ? wIdx % 2 === 0
                      ? primaryTextColor
                      : artDirection.accentPrimary
                    : primaryTextColor,
                  WebkitTextStroke: isOutlineWord
                    ? `1.5px ${primaryTextColor}`
                    : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </h1>

        {/* Subtle Animated Underline Accent on Hover */}
        <div
          aria-hidden="true"
          className="h-[2px] w-0 group-hover/headline:w-full transition-all duration-500 ease-out mt-1"
          style={{ backgroundColor: artDirection.accentPrimary }}
        />
      </div>

      {/* Optional Subtitle */}
      {showSubtitle && subtitle && (
        <div
          className={`pointer-events-none flex flex-wrap items-center gap-3 mt-1.5 ${
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
              className="text-[10px] font-mono opacity-0 group-hover/headline:opacity-75 transition-opacity duration-300"
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
