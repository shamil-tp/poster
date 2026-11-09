import React from 'react';
import { GeneratedPosterStyle } from '../utils/posterStyles';

interface PosterMotifLayerProps {
  style: GeneratedPosterStyle;
  pointer: { x: number; y: number; active: boolean; influence?: number };
  interactivePulse: number;
}

export const PosterMotifLayer: React.FC<PosterMotifLayerProps> = ({
  style,
  pointer,
  interactivePulse,
}) => {
  const inf = pointer.influence !== undefined ? pointer.influence : pointer.active ? 1 : 0;
  const shiftX = (pointer.x - 0.5) * 32 * inf;
  const shiftY = (pointer.y - 0.5) * 32 * inf;
  const rot = (pointer.x - 0.5) * 6 * inf + (interactivePulse % 2 === 1 ? 2 : 0);

  const renderMotifSvg = () => {
    switch (style.motif) {
      case 'laurel-columns':
      case 'acanthus-vine':
      case 'victorian-damask':
      case 'baroque-flourish':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.2" stroke={style.accentPrimary} strokeWidth="1.5">
              <line x1="72" y1="36" x2="72" y2="864" />
              <line x1="86" y1="36" x2="86" y2="864" />
              <line x1="1354" y1="36" x2="1354" y2="864" />
              <line x1="1368" y1="36" x2="1368" y2="864" />
              <circle cx="720" cy="450" r="360" strokeDasharray="6 6" />
              <circle cx="720" cy="450" r="305" stroke={style.accentSecondary} />
              <path d="M 340 105 Q 720 25 1100 105" strokeWidth="2" />
              <path d="M 340 795 Q 720 875 1100 795" strokeWidth="2" />
            </g>
          </svg>
        );

      case 'aurora-waves':
      case 'ethereal-halo':
      case 'frutiger-bubbles':
      case 'glass-prisms':
        return (
          <div className="w-full h-full relative overflow-hidden">
            <div
              className="absolute -top-32 -left-24 w-[38rem] h-[38rem] rounded-full blur-3xl"
              style={{
                backgroundColor: style.accentPrimary,
                opacity: style.isDark ? 0.2 : 0.15,
                transform: `translate3d(${(shiftX * 1.4).toFixed(2)}px, ${(shiftY * 1.4).toFixed(2)}px, 0)`,
              }}
            />
            <div
              className="absolute -bottom-40 -right-24 w-[42rem] h-[42rem] rounded-full blur-3xl"
              style={{
                backgroundColor: style.accentSecondary,
                opacity: style.isDark ? 0.18 : 0.14,
                transform: `translate3d(${(-shiftX * 1.2).toFixed(2)}px, ${(-shiftY * 1.2).toFixed(2)}px, 0)`,
              }}
            />
          </div>
        );

      case 'bauhaus-primitives':
      case 'memphis-squiggles':
      case 'pop-art-halftone':
      case 'kitsch-starburst':
      case 'neo-brutalist-offset':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.18">
              <circle cx="1220" cy="180" r="145" fill={style.accentPrimary} />
              <rect
                x="90"
                y="620"
                width="190"
                height="190"
                stroke={style.accentSecondary}
                strokeWidth="6"
              />
              <polygon
                points="1160,790 1320,790 1240,640"
                stroke={style.textPrimary}
                strokeWidth="4"
              />
              <line x1="0" y1="210" x2="1440" y2="210" stroke={style.borderColor} strokeWidth="1" />
              <line x1="440" y1="0" x2="440" y2="900" stroke={style.borderColor} strokeWidth="1" />
            </g>
          </svg>
        );

      case 'art-deco-sunburst':
      case 'luxury-monogram':
      case 'filigree-lace':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.22" stroke={style.accentPrimary} strokeWidth="1.2">
              {Array.from({ length: 16 }).map((_, idx) => {
                const angle = (idx * Math.PI) / 15;
                const x2 = 720 + Math.cos(angle) * 900;
                const y2 = 900 - Math.sin(angle) * 900;
                return <line key={idx} x1="720" y1="900" x2={x2} y2={y2} />;
              })}
              <rect x="36" y="36" width="1368" height="828" />
              <rect x="52" y="52" width="1336" height="796" />
              <polygon points="720,18 750,52 720,86 690,52" />
            </g>
          </svg>
        );

      case 'cyber-circuit':
      case 'synthwave-horizon':
      case 'vaporwave-bust-grid':
      case 'y2k-chrome-matrix':
      case 'pixel-grid':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.2" stroke={style.accentPrimary} strokeWidth="1">
              <line x1="0" y1="620" x2="1440" y2="620" strokeWidth="2" />
              <line x1="0" y1="670" x2="1440" y2="670" />
              <line x1="0" y1="735" x2="1440" y2="735" />
              <line x1="0" y1="815" x2="1440" y2="815" />
              {Array.from({ length: 13 }).map((_, idx) => {
                const topX = 720 + (idx - 6) * 60;
                const botX = 720 + (idx - 6) * 220;
                return <line key={idx} x1={topX} y1="620" x2={botX} y2="900" />;
              })}
              <circle
                cx="720"
                cy="620"
                r="145"
                stroke={style.accentSecondary}
                strokeWidth="2"
              />
            </g>
          </svg>
        );

      case 'sketch-crosshatch':
      case 'utilitarian-spec':
      case 'brutalist-crosshair':
      case 'modular-type-blocks':
      case 'nautical-compass':
      case 'steampunk-gears':
      case 'academia-astrolabe':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.2" stroke={style.borderColor} strokeWidth="1">
              <line x1="360" y1="0" x2="360" y2="900" strokeDasharray="4 4" />
              <line x1="720" y1="0" x2="720" y2="900" strokeDasharray="4 4" />
              <line x1="1080" y1="0" x2="1080" y2="900" strokeDasharray="4 4" />
              <line x1="0" y1="300" x2="1440" y2="300" strokeDasharray="4 4" />
              <line x1="0" y1="600" x2="1440" y2="600" strokeDasharray="4 4" />
              <circle cx="1180" cy="240" r="115" stroke={style.accentPrimary} strokeWidth="1.5" />
              <circle cx="1180" cy="240" r="84" stroke={style.accentSecondary} strokeDasharray="8 4" />
              <line x1="1040" y1="240" x2="1320" y2="240" stroke={style.accentPrimary} />
              <line x1="1180" y1="100" x2="1180" y2="380" stroke={style.accentPrimary} />
            </g>
          </svg>
        );

      default:
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.18" stroke={style.accentPrimary} strokeWidth="1.5">
              <circle cx="1150" cy="450" r="275" />
              <circle
                cx="1150"
                cy="450"
                r="200"
                stroke={style.accentSecondary}
                strokeDasharray="5 5"
              />
              <path d="M 60 60 L 180 60 M 60 60 L 60 180" />
              <path d="M 1380 840 L 1260 840 M 1380 840 L 1380 720" />
            </g>
          </svg>
        );
    }
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      <div
        className="w-full h-full"
        style={{
          transform: `translate3d(${(shiftX * 0.55).toFixed(2)}px, ${(
            shiftY * 0.55
          ).toFixed(2)}px, 0) rotate(${(rot * 0.14).toFixed(2)}deg)`,
          willChange: 'transform',
        }}
      >
        {renderMotifSvg()}
      </div>

      {/* Smooth Cursor-Following Ambient Aura */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.08 + inf * 0.16,
          background: `radial-gradient(560px circle at ${(pointer.x * 100).toFixed(
            1
          )}% ${(pointer.y * 100).toFixed(1)}%, ${style.accentPrimary}40, transparent 72%)`,
        }}
      />
    </div>
  );
};
