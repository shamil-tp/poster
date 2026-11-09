import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowUpRight,
  FolderGit2,
  Award,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { CompleteDesignState } from '../engine/designEngine';
import { PosterDataSlice, PortfolioIdentity } from '../utils/knowledgeParser';
import { PosterMotifLayer } from './PosterMotifLayer';
import { ProceduralIllustration } from '../engine/illustrationGenerator';
import { InteractiveHeadline } from './InteractiveHeadline';

interface PosterCanvasProps {
  designState: CompleteDesignState;
  slice: PosterDataSlice;
  identity: PortfolioIdentity;
  onCyclePhoto: () => void;
  onCycleProject: () => void;
  onSwapSecondaryToPrimary: () => void;
  onCycleTypography: () => void;
  onCycleLayout: () => void;
  onOpenStyleModal: () => void;
  onOpenDossierModal: () => void;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  designState,
  slice,
  identity,
  onCyclePhoto,
  onCycleProject,
  onSwapSecondaryToPrimary,
  onCycleTypography,
  onCycleLayout,
  onOpenStyleModal,
  onOpenDossierModal,
}) => {
  const { artDirection: style, typography, layout, illustration } = designState;
  const containerRef = useRef<HTMLDivElement>(null);

  // ZERO-REACT-RENDER POINTER TRACKING:
  // Updates CSS custom properties (--px, --py, --cursor-x, --cursor-y) via requestAnimationFrame
  // directly on containerRef.current.style so mouse movement NEVER triggers React re-renders or hover shaking.
  const targetRef = useRef({ x: 0.5, y: 0.5, active: false });
  const currentRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number | null>(null);

  const [expandedSpecTab, setExpandedSpecTab] = useState<'architecture' | 'verification'>(
    'architecture'
  );

  const stepPointerLoop = useCallback(() => {
    const cur = currentRef.current;
    const tgt = targetRef.current;

    const nx = cur.x + (tgt.x - cur.x) * 0.12;
    const ny = cur.y + (tgt.y - cur.y) * 0.12;
    currentRef.current = { x: nx, y: ny };

    const el = containerRef.current;
    if (el) {
      const px = (nx - 0.5) * 2; // -1 .. +1
      const py = (ny - 0.5) * 2; // -1 .. +1
      el.style.setProperty('--px', px.toFixed(4));
      el.style.setProperty('--py', py.toFixed(4));
      el.style.setProperty('--cursor-x', (nx * 100).toFixed(2));
      el.style.setProperty('--cursor-y', (ny * 100).toFixed(2));
    }

    const settled =
      Math.abs(tgt.x - nx) < 0.0008 && Math.abs(tgt.y - ny) < 0.0008;

    if (!settled) {
      rafRef.current = requestAnimationFrame(stepPointerLoop);
    } else {
      rafRef.current = null;
    }
  }, []);

  const startPointerLoop = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(stepPointerLoop);
    }
  }, [stepPointerLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handlePointerMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    targetRef.current = { x, y, active: true };
    startPointerLoop();
  };

  const handlePointerLeave = () => {
    targetRef.current = { x: 0.5, y: 0.5, active: false };
    startPointerLoop();
  };

  // Surface texture overlay based on layout.surfaceTexture
  const getSurfaceTextureStyle = (): React.CSSProperties => {
    switch (layout.surfaceTexture) {
      case 'fine-dot-matrix':
        return {
          backgroundImage: `radial-gradient(${style.borderColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        };
      case 'architectural-grid':
        return {
          backgroundImage: `linear-gradient(to right, ${style.borderColor}28 1px, transparent 1px), linear-gradient(to bottom, ${style.borderColor}28 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        };
      case 'diagonal-print-grain':
        return {
          backgroundImage: `repeating-linear-gradient(-45deg, ${style.borderColor}14, ${style.borderColor}14 1px, transparent 1px, transparent 8px)`,
        };
      default:
        return {};
    }
  };

  const getFrameBorderStyle = (isElevatedSurface = false): React.CSSProperties => {
    if (style.borderStyle === 'brutal-offset') {
      return {
        border: `2px solid ${style.borderColor}`,
        boxShadow: isElevatedSurface
          ? `4px 4px 0px ${style.borderColor}`
          : `8px 8px 0px ${style.accentPrimary}`,
      };
    }
    if (style.borderStyle === 'double-frame') {
      return { border: `3px double ${style.borderColor}` };
    }
    if (style.borderStyle === 'dashed-sketch') {
      return { border: `1.5px dashed ${style.borderColor}` };
    }
    if (style.borderStyle === 'glass-rim') {
      return {
        border: `1px solid ${style.accentPrimary}55`,
        backdropFilter: 'blur(14px)',
      };
    }
    return { border: `1px solid ${style.borderColor}` };
  };

  // Reusable Project Dossier Narrative (supports different visual densities & styles)
  const renderProjectNarrative = (options?: {
    framed?: boolean;
    compact?: boolean;
    translucent?: boolean;
    rotationClass?: string;
    maxBullets?: number;
    proseMode?: boolean;
  }) => {
    const {
      framed = false,
      compact = false,
      translucent = false,
      rotationClass = '',
      maxBullets = compact ? 2 : 3,
      proseMode = false,
    } = options || {};

    return (
      <div
        role="region"
        aria-label={`Featured Project Dossier ${slice.focalProject.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setExpandedSpecTab((prev) =>
            prev === 'architecture' ? 'verification' : 'architecture'
          );
        }}
        className={`group/dossier relative flex flex-col justify-between min-h-0 overflow-hidden cursor-pointer ${
          framed ? 'p-3.5 sm:p-5' : 'py-1 sm:py-2'
        } ${rotationClass}`}
        style={{
          backgroundColor: translucent
            ? `${style.bgElevated}DF`
            : framed
            ? style.bgElevated
            : 'transparent',
          backdropFilter: translucent ? 'blur(14px)' : undefined,
          ...(framed || translucent ? getFrameBorderStyle(true) : {}),
        }}
      >
        <div className="shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span
              className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate"
              style={{ fontFamily: typography.fontMono, color: style.accentPrimary }}
            >
              0{slice.focalProject.index} // {slice.focalProject.category}
            </span>

            <div className="flex items-center gap-2 shrink-0 text-[10px] sm:text-[11px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedSpecTab('architecture');
                }}
                className="cursor-pointer transition-opacity hover:opacity-100"
                style={{
                  fontFamily: typography.fontMono,
                  color:
                    expandedSpecTab === 'architecture'
                      ? style.accentPrimary
                      : style.textSecondary,
                  fontWeight: expandedSpecTab === 'architecture' ? 700 : 400,
                }}
              >
                Spec
              </button>
              <span aria-hidden="true" style={{ color: style.textSecondary }}>
                /
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedSpecTab('verification');
                }}
                className="cursor-pointer transition-opacity hover:opacity-100"
                style={{
                  fontFamily: typography.fontMono,
                  color:
                    expandedSpecTab === 'verification'
                      ? style.accentPrimary
                      : style.textSecondary,
                  fontWeight: expandedSpecTab === 'verification' ? 700 : 400,
                }}
              >
                Metrics
              </button>
              <span aria-hidden="true" style={{ color: style.textSecondary }}>
                ·
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCycleProject();
                }}
                className="inline-flex items-center gap-1 font-medium hover:underline cursor-pointer"
                style={{ color: style.textPrimary, fontFamily: typography.fontMono }}
                aria-label="Cycle featured project dossier"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Next Work</span>
              </button>
            </div>
          </div>

          <h2
            className={`${
              compact
                ? 'text-base sm:text-xl lg:text-2xl'
                : 'text-lg sm:text-2xl lg:text-3xl'
            } font-bold tracking-tight leading-[1.08]`}
            style={{
              fontFamily: typography.fontDisplay,
              color: style.textPrimary,
              textWrap: 'balance',
            }}
          >
            {slice.focalProject.name}
          </h2>
          <p
            className="text-[11px] sm:text-xs mt-0.5 font-medium truncate"
            style={{ color: style.textSecondary, fontFamily: typography.fontBody }}
          >
            {slice.focalProject.ownership}
          </p>
        </div>

        {/* Architectural Highlights or Verification Metrics */}
        <div className="my-auto py-2 overflow-hidden">
          {expandedSpecTab === 'architecture' ? (
            proseMode ? (
              <p
                className="text-xs sm:text-sm leading-relaxed line-clamp-5"
                style={{ fontFamily: typography.fontBody, color: style.textPrimary }}
              >
                <span
                  className="float-left text-3xl sm:text-4xl font-bold leading-none mr-2.5 mt-0.5 px-2 py-1"
                  style={{
                    fontFamily: typography.fontDisplay,
                    backgroundColor: style.accentPrimary,
                    color: style.isDark ? '#09090B' : '#FFFFFF',
                  }}
                >
                  {slice.focalProject.highlights[0]?.charAt(0) || 'S'}
                </span>
                {slice.focalProject.highlights[0]?.slice(1)}{' '}
                {slice.focalProject.highlights[1] || ''}
              </p>
            ) : (
              <ul
                className="space-y-1.5 text-xs sm:text-sm leading-snug"
                style={{ fontFamily: typography.fontBody }}
              >
                {slice.focalProject.highlights
                  .slice(0, maxBullets)
                  .map((bullet, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5"
                      style={{ color: style.textPrimary }}
                    >
                      <span
                        className="font-mono text-[11px] font-bold mt-0.5 shrink-0"
                        style={{ color: style.accentPrimary }}
                      >
                        0{idx + 1}
                      </span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
              </ul>
            )
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
              {slice.focalProject.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="p-2 border-l-2"
                  style={{
                    borderColor: style.accentPrimary,
                    backgroundColor: `${style.bgSurface}99`,
                  }}
                >
                  <div
                    className="text-[10px] font-mono tabular-nums"
                    style={{ color: style.textSecondary }}
                  >
                    0{idx + 1}
                  </div>
                  <div
                    className="text-xs font-bold mt-0.5 tabular-nums truncate"
                    style={{
                      color: style.textPrimary,
                      fontFamily: typography.fontDisplay,
                    }}
                  >
                    {metric}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tech Stack & Live Links */}
        <div
          className="shrink-0 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs"
          style={{ borderColor: `${style.borderColor}88` }}
        >
          <div
            className="truncate max-w-full sm:max-w-[62%]"
            style={{ fontFamily: typography.fontMono, color: style.accentPrimary }}
          >
            {slice.focalProject.techStack.slice(0, 6).join(' · ')}
          </div>

          <div
            className="flex items-center gap-3 shrink-0"
            style={{ fontFamily: typography.fontMono }}
          >
            {slice.focalProject.liveUrl && (
              <a
                href={slice.focalProject.liveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 font-semibold hover:underline"
                style={{ color: style.textPrimary }}
              >
                <span>Live Deployment</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
            {slice.focalProject.repoUrl && (
              <a
                href={slice.focalProject.repoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 font-semibold hover:underline"
                style={{ color: style.accentPrimary }}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Source</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Mobile-friendly compact illustration + identity header for viewports < lg
  const renderMobileIdentityHeader = (
    sizeClass = 'text-4xl sm:text-6xl lg:text-7xl',
    align: 'left' | 'center' | 'right' = 'left',
    showLocationLine = true
  ) => (
    <div className="shrink-0 flex items-center justify-between gap-3 pr-10 sm:pr-14 lg:pr-0">
      <div className="lg:hidden w-14 h-14 sm:w-20 sm:h-20 shrink-0">
        <ProceduralIllustration
          artDirection={style}
          config={illustration}
          photo={slice.photo}
          onCyclePhoto={onCyclePhoto}
          compact
        />
      </div>

      <div className="min-w-0 flex-1">
        {showLocationLine && (
          <div
            className={`text-[10px] sm:text-[11px] font-mono mb-1 truncate ${
              align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : ''
            }`}
            style={{ color: style.textSecondary }}
          >
            {identity.location} · {identity.academicStatus} ·{' '}
            <a
              href={identity.domains[1]}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline font-semibold"
              style={{ color: style.accentPrimary }}
            >
              shamiltp.me
            </a>
          </div>
        )}
        <InteractiveHeadline
          text={identity.fullName}
          subtitle={identity.primaryRole}
          artDirection={style}
          typography={typography}
          onCycleTypography={onCycleTypography}
          sizeClass={sizeClass}
          align={align}
        />
      </div>
    </div>
  );

  // Minimal Exhibition Colophon Strip
  const renderPosterColophon = () => (
    <div
      className="shrink-0 flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[10px] sm:text-[11px]"
      style={{
        borderColor: `${style.borderColor}66`,
        fontFamily: typography.fontMono,
        color: style.textSecondary,
      }}
    >
      <div className="flex flex-wrap items-center gap-2 truncate">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenStyleModal();
          }}
          className="font-semibold hover:underline cursor-pointer"
          style={{ color: style.accentPrimary }}
          aria-label={`Inspect active style ${style.name}`}
        >
          {style.isHybrid
            ? `Hybrid · ${style.name}`
            : `No. ${String(style.id).padStart(2, '0')}/50 · ${style.name}`}
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCycleLayout();
          }}
          className="hover:underline cursor-pointer hidden sm:inline"
          style={{ color: style.textPrimary }}
          aria-label={`Active layout ${layout.name}. Click to randomize layout.`}
        >
          {layout.name}
        </button>
        <span aria-hidden="true" className="hidden md:inline">
          ·
        </span>
        <span className="hidden md:inline">
          Edition #{String(style.editionNumber).padStart(3, '0')}
        </span>
        {slice.searchQuery && (
          <>
            <span aria-hidden="true">·</span>
            <span style={{ color: style.accentPrimary }} className="font-semibold">
              {slice.matchSummary}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {identity.subdomains.slice(0, 2).map((sub) => (
          <React.Fragment key={sub.url}>
            <a
              href={sub.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline hidden sm:inline"
              style={{ color: style.accentPrimary }}
            >
              {sub.label}
            </a>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
          </React.Fragment>
        ))}
        <a
          href={`mailto:${identity.email}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:underline"
          style={{ color: style.textPrimary }}
        >
          {identity.email}
        </a>
        <span aria-hidden="true">·</span>
        <a
          href={identity.github}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="hover:underline"
          style={{ color: style.textPrimary }}
        >
          GitHub
        </a>
        <span aria-hidden="true">·</span>
        <a
          href={identity.linkedin}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="hover:underline"
          style={{ color: style.textPrimary }}
        >
          LinkedIn
        </a>
      </div>
    </div>
  );

  // ============================================================================
  // 12 RADICALLY DISTINCT DESIGNER PARADIGMS (NO SHARED MASTER TEMPLATE)
  // ============================================================================
  const renderDesignerWorld = () => {
    switch (layout.id) {
      case 'vertical-spine-editorial': {
        // PARADIGM 1: ULTRA-MINIMALIST ZEN EXHIBITION PRINT
        // Borderless, 70%+ contemplative negative space, single poised artwork, whisper-quiet museum placard
        return (
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-hidden">
            {/* Top Minimalist Catalog Header */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase pr-14" style={{ color: style.textSecondary }}>
              <button
                type="button"
                onClick={() => onOpenStyleModal()}
                className="hover:underline cursor-pointer"
                aria-label={`Inspect active style ${style.name}`}
              >
                EXHIBITION NO. {String(style.editionNumber).padStart(3, '0')} — {style.name}
              </button>
              <button
                type="button"
                onClick={() => onCycleLayout()}
                className="hidden sm:inline hover:underline cursor-pointer"
                aria-label={`Active layout ${layout.name}. Click to randomize layout.`}
              >
                {identity.location}
              </button>
            </div>

            {/* Centerpiece: Floating Poised Artwork + Generous Negative Space */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 my-auto overflow-hidden">
              <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 shrink-0">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  onCyclePhoto={onCyclePhoto}
                  frameVariant="circle-medallion"
                />
              </div>

              <div className="max-w-lg flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
                <InteractiveHeadline
                  text={identity.fullName}
                  subtitle={identity.primaryRole}
                  artDirection={style}
                  typography={typography}
                  onCycleTypography={onCycleTypography}
                  sizeClass="text-3xl sm:text-5xl lg:text-6xl"
                />

                <div
                  role="region"
                  aria-label={`Featured Project Dossier ${slice.focalProject.name}`}
                  onClick={() => onCycleProject()}
                  className="cursor-pointer pt-3 border-t max-w-md"
                  style={{ borderColor: `${style.borderColor}66` }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: style.accentPrimary }}>
                    Selected Monograph // Click for Next
                  </div>
                  <h2
                    className="text-base sm:text-xl font-bold"
                    style={{ fontFamily: typography.fontDisplay }}
                  >
                    {slice.focalProject.name}
                  </h2>
                  <p
                    className="text-xs sm:text-sm mt-1.5 leading-relaxed line-clamp-2"
                    style={{ color: style.textSecondary, fontFamily: typography.fontBody }}
                  >
                    {slice.focalProject.highlights[0]}
                  </p>
                </div>
              </div>
            </div>

            {/* Whisper-Quiet Museum Footer */}
            <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase" style={{ color: style.textSecondary }}>
              <a href={identity.domains[1]} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: style.accentPrimary }}>
                shamiltp.me
              </a>
              <div className="flex items-center gap-4">
                {slice.focalProject.liveUrl && (
                  <a href={slice.focalProject.liveUrl} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: style.textPrimary }}>
                    Live Exhibition ↗
                  </a>
                )}
                <a href={identity.github} target="_blank" rel="noreferrer" className="hover:underline">
                  GitHub
                </a>
                <a href={`mailto:${identity.email}`} className="hover:underline hidden sm:inline">
                  {identity.email}
                </a>
              </div>
            </div>
          </div>
        );
      }

      case 'brutalist-manifesto': {
        // PARADIGM 2: COLOSSAL SWISS TYPOGRAPHIC POSTER
        // Wall-to-wall monumental typography IS the visual centerpiece, paired with giant project numerals & stark rules
        return (
          <div
            className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 lg:p-10 overflow-hidden border-l-[12px] sm:border-l-[20px]"
            style={{ borderColor: style.accentPrimary }}
          >
            {/* Top Swiss Grid Specification Bar */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b-2 text-[10px] sm:text-xs font-mono uppercase pr-12"
              style={{ borderColor: style.textPrimary }}
            >
              <div>
                <div style={{ color: style.textSecondary }}>ARCHITECT</div>
                <div className="font-bold truncate">{identity.fullName}</div>
              </div>
              <div>
                <div style={{ color: style.textSecondary }}>DISCIPLINE</div>
                <div className="font-bold truncate" style={{ color: style.accentPrimary }}>
                  {style.name}
                </div>
              </div>
              <div className="hidden sm:block">
                <div style={{ color: style.textSecondary }}>BASE</div>
                <div className="font-bold truncate">{identity.location}</div>
              </div>
              <div className="hidden sm:block text-right">
                <div style={{ color: style.textSecondary }}>EDITION</div>
                <div className="font-bold">#{String(style.editionNumber).padStart(3, '0')}</div>
              </div>
            </div>

            {/* Middle Colossal Index + Featured Work Manifesto */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-3 overflow-hidden">
              {/* Giant Numeral + Stamp Emblem */}
              <div className="hidden lg:flex lg:col-span-4 flex-col items-start justify-center relative">
                <div
                  className="text-[8rem] xl:text-[11rem] font-black leading-[0.8] tracking-tighter select-none"
                  style={{
                    fontFamily: typography.fontDisplay,
                    color: style.accentPrimary,
                  }}
                >
                  0{slice.focalProject.index}
                </div>
                <div className="w-36 h-36 mt-3">
                  <ProceduralIllustration
                    artDirection={style}
                    config={illustration}
                    photo={slice.photo}
                    onCyclePhoto={onCyclePhoto}
                    frameVariant="stamp-seal"
                  />
                </div>
              </div>

              {/* Stark Unboxed Typographic Spec */}
              <div className="lg:col-span-8 flex flex-col justify-center min-h-0">
                {renderProjectNarrative({ framed: false, maxBullets: 3 })}
              </div>
            </div>

            {/* Bottom Wall-to-Wall Colossal Display Title */}
            <div
              className="shrink-0 pt-3 border-t-4 flex flex-col gap-2"
              style={{ borderColor: style.textPrimary }}
            >
              {renderMobileIdentityHeader(
                'text-5xl sm:text-7xl lg:text-8xl xl:text-9xl',
                'left',
                false
              )}
              {renderPosterColophon()}
            </div>
          </div>
        );
      }

      case 'full-bleed-artwork': {
        // PARADIGM 3: CINEMA MONOLITH & BILLING BLOCK
        // Dramatic center-stage visual monolith with top director credit and classic condensed cinema billing block at bottom
        return (
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-5 sm:p-8 lg:p-10 overflow-hidden">
            {/* Top Cinema Production Header */}
            <div className="relative z-20 flex flex-col items-center text-center shrink-0 pr-8 sm:pr-0">
              <div
                className="text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase mb-1"
                style={{ color: style.accentPrimary }}
              >
                A {style.name.toUpperCase()} PRODUCTION · EDITION #{String(style.editionNumber).padStart(3, '0')}
              </div>
              <InteractiveHeadline
                text={identity.fullName}
                subtitle={slice.focalProject.name}
                artDirection={style}
                typography={typography}
                onCycleTypography={onCycleTypography}
                sizeClass="text-4xl sm:text-6xl lg:text-7xl"
                align="center"
              />
            </div>

            {/* Center Monumental Visual Stage */}
            <div className="relative z-10 flex-1 min-h-0 w-full max-w-3xl mx-auto my-3 overflow-hidden">
              <ProceduralIllustration
                artDirection={style}
                config={illustration}
                photo={slice.photo}
                onCyclePhoto={onCyclePhoto}
                frameVariant="default"
              />
            </div>

            {/* Classic Cinema Billing Block Footer */}
            <div
              role="region"
              aria-label={`Featured Project Dossier ${slice.focalProject.name}`}
              onClick={() => onCycleProject()}
              className="relative z-20 shrink-0 max-w-4xl mx-auto w-full text-center cursor-pointer pt-2 border-t"
              style={{ borderColor: `${style.borderColor}88` }}
            >
              <p
                className="text-[11px] sm:text-xs font-mono uppercase tracking-wider leading-relaxed line-clamp-2"
                style={{ color: style.textSecondary }}
              >
                <strong style={{ color: style.textPrimary }}>STARRING ARCHITECTURE</strong>{' '}
                {slice.focalProject.name.toUpperCase()} ·{' '}
                <strong style={{ color: style.textPrimary }}>ENGINEERED WITH</strong>{' '}
                {slice.focalProject.techStack.slice(0, 5).join(' / ')} ·{' '}
                <strong style={{ color: style.textPrimary }}>ACHIEVEMENT</strong>{' '}
                {slice.focalProject.highlights[0]} ·{' '}
                <strong style={{ color: style.accentPrimary }}>HONORS</strong>{' '}
                {slice.featuredHackathon.title} ({slice.featuredHackathon.result})
              </p>
              <div className="mt-2">{renderPosterColophon()}</div>
            </div>
          </div>
        );
      }

      case 'layered-collage-zine': {
        // PARADIGM 4: TACTILE CUT-AND-PASTE ZINE COLLAGE
        // Scattered tilted paper cutouts, taped Polaroid photo specimen, circular rubber stamp badge
        return (
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-7 lg:p-10 overflow-hidden">
            {/* Floating Rubber Stamp Badge in Top-Left/Center */}
            <div
              onClick={() => onOpenDossierModal()}
              className="hidden xl:flex absolute top-8 right-28 z-30 w-28 h-28 rounded-full border-2 border-dashed flex-col items-center justify-center text-center p-2 rotate-12 cursor-pointer"
              style={{
                borderColor: style.accentPrimary,
                color: style.accentPrimary,
                backgroundColor: `${style.bgElevated}EE`,
                fontFamily: typography.fontMono,
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest">
                VERIFIED
              </span>
              <span className="text-[10px] font-extrabold leading-tight mt-0.5 line-clamp-2">
                {slice.featuredHackathon.result}
              </span>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center my-auto overflow-hidden">
              {/* Left Tilted Zine Cutouts (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-3.5 z-20 min-h-0">
                <div
                  className="p-3.5 sm:p-5 -rotate-1 shadow-lg"
                  style={{
                    backgroundColor: style.bgElevated,
                    ...getFrameBorderStyle(true),
                  }}
                >
                  {renderMobileIdentityHeader('text-3xl sm:text-5xl lg:text-6xl', 'left')}
                </div>

                {renderProjectNarrative({
                  framed: true,
                  compact: true,
                  rotationClass: 'rotate-1 shadow-md',
                })}
              </div>

              {/* Right Taped Polaroid Specimen (5 cols) */}
              <div className="hidden lg:flex lg:col-span-5 h-full max-h-[430px] items-center justify-center relative z-10 lg:-ml-4">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  onCyclePhoto={onCyclePhoto}
                  frameVariant="polaroid-tape"
                  className="rotate-2 shadow-2xl"
                />
              </div>
            </div>

            {renderPosterColophon()}
          </div>
        );
      }

      case 'circular-monument': {
        // PARADIGM 5: SACRED GEOMETRY / CELESTIAL ASTROLABE CODEX
        // Double-ruled archival border, central circular medallion, and 4 radial corner inscriptions
        return (
          <div
            className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden m-1 sm:m-3"
            style={{
              backgroundColor: `${style.bgSurface}F2`,
              border: `3px double ${style.borderColor}`,
            }}
          >
            {/* Concentric Astrolabe Rings */}
            <div
              aria-hidden="true"
              className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none z-0"
            >
              <div
                className="w-[440px] h-[440px] rounded-full border border-dashed opacity-30"
                style={{ borderColor: style.accentPrimary }}
              />
              <div
                className="absolute w-[540px] h-[540px] rounded-full border opacity-15"
                style={{ borderColor: style.textPrimary }}
              />
            </div>

            {/* Top Corners: NW Identity + NE Astrolabe Notes */}
            <div className="relative z-20 flex flex-col lg:flex-row lg:items-start justify-between gap-3 shrink-0 lg:pr-14">
              <div className="lg:max-w-[54%]">
                {renderMobileIdentityHeader('text-3xl sm:text-5xl lg:text-6xl', 'left')}
              </div>

              <div
                onClick={() => onOpenStyleModal()}
                className="hidden lg:flex flex-col items-end text-right cursor-pointer max-w-xs"
              >
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: style.accentPrimary }}>
                  CODEX NO. {String(style.editionNumber).padStart(3, '0')}
                </span>
                <span className="text-lg font-bold mt-0.5" style={{ fontFamily: typography.fontDisplay }}>
                  {style.name}
                </span>
                <span className="text-xs line-clamp-2 mt-0.5" style={{ color: style.textSecondary }}>
                  {style.harmonyNote}
                </span>
              </div>
            </div>

            {/* Center Axis: SW Project Inscription + Center Circular Medallion + SE Honors */}
            <div className="relative z-20 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center py-2 overflow-hidden">
              <div className="lg:col-span-5 flex flex-col justify-center min-h-0">
                {renderProjectNarrative({ framed: false, compact: true })}
              </div>

              <div className="hidden lg:flex lg:col-span-4 h-full max-h-[330px] items-center justify-center">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  onCyclePhoto={onCyclePhoto}
                  frameVariant="circle-medallion"
                />
              </div>

              <div className="lg:col-span-3 flex flex-col justify-center gap-4 lg:text-right">
                <div onClick={() => onOpenDossierModal()} className="cursor-pointer">
                  <div className="text-[11px] font-mono font-semibold" style={{ color: style.accentPrimary }}>
                    {slice.featuredHackathon.result}
                  </div>
                  <div className="text-sm font-bold mt-0.5" style={{ fontFamily: typography.fontDisplay }}>
                    {slice.featuredHackathon.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: style.textSecondary }}>
                    {slice.featuredExperience.organization}
                  </div>
                </div>

                <div
                  onClick={() => onSwapSecondaryToPrimary()}
                  className="cursor-pointer pt-3 border-t"
                  style={{ borderColor: `${style.borderColor}66` }}
                >
                  <div className="text-[11px] font-mono font-semibold" style={{ color: style.accentPrimary }}>
                    Next Focus // {slice.secondaryProject.shortName}
                  </div>
                  <div className="text-sm font-bold mt-0.5" style={{ fontFamily: typography.fontDisplay }}>
                    {slice.featuredSkillGroup.category}
                  </div>
                </div>
              </div>
            </div>

            {renderPosterColophon()}
          </div>
        );
      }

      case 'magazine-cover': {
        // PARADIGM 6: HIGH-FASHION / ART MAGAZINE ISSUE COVER
        // Giant masthead across the top, central arched portrait, floating cover lines & issue barcode
        return (
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            {/* Giant Masthead */}
            <div className="relative z-20 shrink-0 pb-2 border-b-2" style={{ borderColor: style.textPrimary }}>
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono uppercase tracking-widest mb-1 pr-12 lg:pr-16" style={{ color: style.textSecondary }}>
                <span>ISSUE NO. {String(style.editionNumber).padStart(3, '0')} // {style.name}</span>
                <span className="hidden sm:inline">{identity.location}</span>
                <span>shamiltp.me</span>
              </div>
              {renderMobileIdentityHeader('text-4xl sm:text-6xl lg:text-8xl', 'center', false)}
            </div>

            {/* Cover Body */}
            <div className="relative flex-1 min-h-0 flex flex-col lg:flex-row items-stretch justify-between gap-5 py-3 overflow-hidden">
              <div className="lg:w-[44%] z-20 flex flex-col justify-between min-h-0 my-auto">
                {renderProjectNarrative({ framed: false })}
              </div>

              <div className="hidden lg:flex lg:w-[34%] h-full min-h-0 relative z-10 items-center justify-center">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  onCyclePhoto={onCyclePhoto}
                  frameVariant="arch-niche"
                />
              </div>

              <div className="lg:w-[22%] z-20 flex flex-col justify-between min-h-0 lg:text-right py-2">
                <div onClick={() => onOpenDossierModal()} className="cursor-pointer">
                  <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: style.accentPrimary }}>
                    EXCLUSIVE FEATURE
                  </div>
                  <div className="text-sm sm:text-base font-bold leading-snug mt-0.5" style={{ fontFamily: typography.fontDisplay }}>
                    {slice.featuredHackathon.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: style.textSecondary }}>
                    {slice.featuredHackathon.result}
                  </div>
                </div>

                {/* Editorial Barcode Graphic */}
                <div className="hidden lg:flex flex-col items-end mt-auto pt-3">
                  <div className="flex items-center gap-[2px] h-8">
                    {[3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 2].map((w, idx) => (
                      <div
                        key={idx}
                        className="h-full"
                        style={{
                          width: `${w * 2}px`,
                          backgroundColor: style.textPrimary,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest mt-1" style={{ color: style.textSecondary }}>
                    ISSN 2026-{String(style.id).padStart(2, '0')}0{style.editionNumber}
                  </span>
                </div>
              </div>
            </div>

            {renderPosterColophon()}
          </div>
        );
      }

      case 'diagonal-split':
      case 'split-poster-duality': {
        // PARADIGM 7 & 9: 50/50 COLOR-INVERTED DIPTYCH & CONSTRUCTIVIST DIAGONAL SPLIT
        const isDiagonal = layout.id === 'diagonal-split';
        return (
          <div className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden">
            {/* Bold Color-Blocked Half or Diagonal Wedge */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundColor: style.bgElevated,
                clipPath: isDiagonal
                  ? 'polygon(0 0, 52% 0, 34% 100%, 0 100%)'
                  : 'polygon(0 0, 44% 0, 44% 100%, 0 100%)',
                borderRight: `3px solid ${style.accentPrimary}`,
              }}
            />

            <div className="relative z-20 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch p-4 sm:p-7 lg:p-9 overflow-hidden">
              {/* Left Visual Showcase Stage (5 cols) */}
              <div className="hidden lg:flex lg:col-span-5 flex-col justify-between min-h-0">
                <div className="flex items-baseline justify-between">
                  <span
                    className="text-6xl font-black tracking-tighter opacity-45"
                    style={{ fontFamily: typography.fontDisplay, color: style.accentPrimary }}
                  >
                    #{String(style.editionNumber).padStart(3, '0')}
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest" style={{ color: style.textSecondary }}>
                    {style.name}
                  </span>
                </div>

                <div className="flex-1 min-h-0 my-3">
                  <ProceduralIllustration
                    artDirection={style}
                    config={illustration}
                    photo={slice.photo}
                    onCyclePhoto={onCyclePhoto}
                    frameVariant={isDiagonal ? 'frameless-overlap' : 'default'}
                  />
                </div>

                <div className="text-xs font-mono" style={{ color: style.textSecondary }}>
                  {style.harmonyNote}
                </div>
              </div>

              {/* Right Open Editorial Thesis (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between min-h-0 gap-3 overflow-hidden">
                {renderMobileIdentityHeader('text-4xl sm:text-6xl lg:text-7xl', 'left')}
                {renderProjectNarrative({ framed: false })}
                {renderPosterColophon()}
              </div>
            </div>
          </div>
        );
      }

      case 'bauhaus-constructivist': {
        // PARADIGM 10: WEIMAR BAUHAUS / MONDRIAN COLOR-PLANE GRID
        // Viewport partitioned by thick structural lines into distinct color planes
        return (
          <div
            className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
            style={{ backgroundColor: style.bgCanvas }}
          >
            {/* Plane 1: Primary Accent Vertical Pillar (2 cols on desktop) */}
            <div
              onClick={() => onCycleLayout()}
              className="hidden lg:flex lg:col-span-2 flex-col items-center justify-between py-8 px-2 cursor-pointer select-none border-r-4"
              style={{
                backgroundColor: style.accentPrimary,
                color: style.isDark ? '#09090B' : '#FFFFFF',
                borderColor: style.textPrimary,
              }}
              title="Click or press [L] to randomize layout"
            >
              <span className="text-xs font-mono font-bold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180">
                {style.name} // BAUHAUS EDITION #{String(style.editionNumber).padStart(3, '0')}
              </span>
              <span
                className="text-5xl font-black tracking-tighter [writing-mode:vertical-rl] rotate-180 leading-none"
                style={{ fontFamily: typography.fontDisplay }}
              >
                {identity.fullName.toUpperCase()}
              </span>
            </div>

            {/* Plane 2: Center Manifesto & Structural Divisions (6 cols on desktop) */}
            <div
              className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-7 border-r-0 lg:border-r-4 min-h-0 overflow-hidden"
              style={{ borderColor: style.textPrimary }}
            >
              <div className="pb-4 border-b-4" style={{ borderColor: style.textPrimary }}>
                {renderMobileIdentityHeader('text-4xl sm:text-5xl lg:text-6xl', 'left')}
              </div>

              <div className="my-auto py-3">
                {renderProjectNarrative({ framed: false })}
              </div>

              {renderPosterColophon()}
            </div>

            {/* Plane 3: Right Geometric Totem & Color Block (4 cols on desktop) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col justify-between min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 p-6 flex items-center justify-center" style={{ backgroundColor: style.bgElevated }}>
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  onCyclePhoto={onCyclePhoto}
                  frameVariant="frameless-overlap"
                />
              </div>

              <div
                onClick={() => onSwapSecondaryToPrimary()}
                className="p-5 border-t-4 cursor-pointer"
                style={{
                  borderColor: style.textPrimary,
                  backgroundColor: style.accentSecondary,
                  color: '#09090B',
                }}
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest">
                  NEXT MODULE // {slice.secondaryProject.shortName}
                </div>
                <div className="text-base font-black mt-0.5 truncate" style={{ fontFamily: typography.fontDisplay }}>
                  {slice.featuredSkillGroup.category}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'three-column-broadsheet': {
        // PARADIGM 8: 19TH-CENTURY ARCHIVAL BROADSHEET (PROSE & ENGRAVED PLATE)
        return (
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            {/* Double-Rule Newspaper Banner */}
            <div
              className="shrink-0 pb-3 mb-2 border-b-4 border-double"
              style={{ borderColor: style.textPrimary }}
            >
              {renderMobileIdentityHeader('text-3xl sm:text-5xl lg:text-6xl', 'center')}
            </div>

            {/* 3 Archival Print Columns with Prose Drop-Cap */}
            <div
              className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:divide-x py-2 overflow-hidden"
              style={{ borderColor: style.borderColor }}
            >
              <div className="lg:col-span-5 flex flex-col justify-between min-h-0 pr-1">
                {renderProjectNarrative({ framed: false, proseMode: true })}
              </div>

              <div className="hidden lg:flex lg:col-span-4 flex-col justify-between min-h-0 pl-5 pr-1">
                <div className="flex-1 min-h-0">
                  <ProceduralIllustration
                    artDirection={style}
                    config={illustration}
                    photo={slice.photo}
                    onCyclePhoto={onCyclePhoto}
                    frameVariant="arch-niche"
                  />
                </div>
                <p
                  className="text-[11px] italic text-center mt-2"
                  style={{ color: style.textSecondary, fontFamily: typography.fontBody }}
                >
                  Fig. {style.editionNumber} — {style.harmonyNote}
                </p>
              </div>

              <div
                className="hidden lg:flex lg:col-span-3 flex-col justify-between min-h-0 pl-5 text-xs"
                style={{ borderColor: style.borderColor }}
              >
                <div onClick={() => onOpenDossierModal()} className="cursor-pointer">
                  <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: style.accentPrimary }}>
                    I. Chronicle & Honors
                  </div>
                  <div className="font-bold text-sm" style={{ fontFamily: typography.fontDisplay }}>
                    {slice.featuredHackathon.title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: style.textSecondary }}>
                    {slice.featuredHackathon.result} ({slice.featuredHackathon.dates}) ·{' '}
                    {slice.featuredExperience.title} at {slice.featuredExperience.organization}.
                  </p>
                </div>

                <div
                  onClick={() => onSwapSecondaryToPrimary()}
                  className="cursor-pointer pt-3 border-t"
                  style={{ borderColor: `${style.borderColor}66` }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: style.accentPrimary }}>
                    II. Systems Repertoire
                  </div>
                  <div className="font-bold text-sm" style={{ fontFamily: typography.fontDisplay }}>
                    {slice.featuredSkillGroup.category}
                  </div>
                  <p className="mt-1 font-mono text-[11px] leading-relaxed" style={{ color: style.textSecondary }}>
                    {slice.featuredSkillGroup.items.slice(0, 6).join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            {renderPosterColophon()}
          </div>
        );
      }

      case 'asymmetric-avant-garde': {
        // PARADIGM 11: DECONSTRUCTED OFF-GRID OVERLAP
        // Oversized off-axis artwork in upper-right overlapped by floating display banner & asymmetric lower-left project
        return (
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-5 sm:p-8 lg:p-11 overflow-hidden">
            {/* Oversized Off-Axis Sculpture on Desktop */}
            <div className="hidden lg:block absolute right-10 top-10 bottom-16 w-[46%] z-10">
              <ProceduralIllustration
                artDirection={style}
                config={illustration}
                photo={slice.photo}
                onCyclePhoto={onCyclePhoto}
                frameVariant="arch-niche"
              />
            </div>

            {/* Overlapping Display Title */}
            <div className="relative z-20 lg:max-w-[66%] shrink-0">
              {renderMobileIdentityHeader('text-4xl sm:text-6xl lg:text-8xl', 'left')}
            </div>

            {/* Floating Translucent Placard */}
            <div className="relative z-20 lg:w-[56%] my-auto flex flex-col gap-3 min-h-0">
              {renderProjectNarrative({
                translucent: true,
                framed: true,
                compact: true,
              })}
            </div>

            <div className="relative z-20">{renderPosterColophon()}</div>
          </div>
        );
      }

      default: {
        // PARADIGM 12: INDUSTRIAL SYSTEMS & TELEMETRY SPECIMEN SHEET (bento-playground)
        // Large-scale project metrics grid + technical schematic plate + modular engineering breakdown
        return (
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            {/* Top Specimen Header + 4 Large Telemetry Metric Blocks */}
            <div className="shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pb-3 border-b" style={{ borderColor: style.borderColor }}>
              <div className="lg:col-span-6">
                {renderMobileIdentityHeader('text-3xl sm:text-5xl lg:text-6xl', 'left')}
              </div>

              <div className="hidden lg:grid lg:col-span-6 grid-cols-4 gap-2 pr-14">
                {slice.focalProject.metrics.slice(0, 4).map((metric, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 border"
                    style={{
                      backgroundColor: style.bgElevated,
                      borderColor: style.borderColor,
                    }}
                  >
                    <div className="text-[9px] font-mono uppercase" style={{ color: style.accentPrimary }}>
                      SPEC 0{idx + 1}
                    </div>
                    <div
                      className="text-xs xl:text-sm font-bold mt-0.5 truncate tabular-nums"
                      style={{ fontFamily: typography.fontDisplay }}
                    >
                      {metric}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Specimen Body */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-3 overflow-hidden">
              <div className="hidden lg:flex lg:col-span-5 h-full max-h-[410px] flex-col justify-center">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  onCyclePhoto={onCyclePhoto}
                />
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between min-h-0 gap-3">
                {renderProjectNarrative({ framed: true })}
              </div>
            </div>

            {renderPosterColophon()}
          </div>
        );
      }
    }
  };

  return (
    <main
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      data-testid="poster-canvas"
      data-style-slug={style.slug}
      data-layout-id={layout.id}
      data-edition={style.editionNumber}
      className="relative flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col justify-between transition-colors duration-500"
      style={{
        backgroundColor: style.bgCanvas,
        color: style.textPrimary,
        fontFamily: typography.fontBody,
        ...getSurfaceTextureStyle(),
      }}
    >
      {/* Background SVG & Ambient Motif Layer (driven by CSS variables, zero re-renders) */}
      <PosterMotifLayer style={style} />

      {/* Render the active Designer World directly without a repetitive master frame */}
      {renderDesignerWorld()}
    </main>
  );
};
