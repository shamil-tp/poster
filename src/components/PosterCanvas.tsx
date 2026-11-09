import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowUpRight,
  Sparkles,
  FolderGit2,
  Award,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { CompleteDesignState } from '../engine/designEngine';
import { PosterDataSlice, PortfolioIdentity } from '../utils/knowledgeParser';
import { PosterMotifLayer } from './PosterMotifLayer';
import { ProceduralIllustration } from '../engine/illustrationGenerator';
import { InteractiveHeadline, SmoothPointer } from './InteractiveHeadline';

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

  // Smooth requestAnimationFrame pointer interpolation (eliminates hover jumps & transition stutter)
  const targetRef = useRef({ x: 0.5, y: 0.5, active: false });
  const currentRef = useRef<SmoothPointer>({
    x: 0.5,
    y: 0.5,
    vx: 0,
    vy: 0,
    influence: 0,
    active: false,
  });
  const rafRef = useRef<number | null>(null);
  const [pointer, setPointer] = useState<SmoothPointer>(currentRef.current);

  const [expandedSpecTab, setExpandedSpecTab] = useState<'architecture' | 'verification'>(
    'architecture'
  );
  const [interactivePulse, setInteractivePulse] = useState(0);

  const stepPointerAnimation = useCallback(() => {
    const cur = currentRef.current;
    const tgt = targetRef.current;
    const targetInf = tgt.active ? 1 : 0;

    const nx = cur.x + (tgt.x - cur.x) * 0.14;
    const ny = cur.y + (tgt.y - cur.y) * 0.14;
    const nInf = cur.influence + (targetInf - cur.influence) * 0.12;
    const vx = nx - cur.x;
    const vy = ny - cur.y;

    currentRef.current = {
      x: nx,
      y: ny,
      vx,
      vy,
      influence: nInf,
      active: tgt.active,
    };
    setPointer({ ...currentRef.current });

    const settled =
      Math.abs(tgt.x - nx) < 0.001 &&
      Math.abs(tgt.y - ny) < 0.001 &&
      Math.abs(targetInf - nInf) < 0.002;

    if (!settled) {
      rafRef.current = requestAnimationFrame(stepPointerAnimation);
    } else {
      rafRef.current = null;
    }
  }, []);

  const triggerAnimationLoop = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(stepPointerAnimation);
    }
  }, [stepPointerAnimation]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    targetRef.current = { x, y, active: true };
    triggerAnimationLoop();
  };

  const handlePointerLeave = () => {
    targetRef.current = { x: 0.5, y: 0.5, active: false };
    triggerAnimationLoop();
  };

  const inf = pointer.influence;
  const px = (pointer.x - 0.5) * 20 * inf;
  const py = (pointer.y - 0.5) * 20 * inf;
  const tiltX = (0.5 - pointer.y) * 4.5 * inf;
  const tiltY = (pointer.x - 0.5) * 4.5 * inf;

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

  // Unboxed / Art-Directed Project Narrative Section (Can be rendered floating, minimalist, or framed)
  const renderArtisticProjectNarrative = (options?: {
    framed?: boolean;
    compact?: boolean;
    translucent?: boolean;
    rotationClass?: string;
  }) => {
    const {
      framed = false,
      compact = false,
      translucent = false,
      rotationClass = '',
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
          framed ? 'p-3.5 sm:p-5' : 'py-1.5 sm:py-2'
        } ${rotationClass}`}
        style={{
          backgroundColor: translucent
            ? `${style.bgElevated}DD`
            : framed
            ? style.bgElevated
            : 'transparent',
          backdropFilter: translucent ? 'blur(14px)' : undefined,
          ...(framed || translucent ? getFrameBorderStyle(true) : {}),
          transform: `translate3d(${(px * 0.22).toFixed(2)}px, ${(py * 0.22).toFixed(
            2
          )}px, 0)`,
        }}
      >
        {/* Top Dossier Kicker & Subtle Action Links */}
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
            <ul
              className="space-y-1.5 text-xs sm:text-sm leading-snug"
              style={{ fontFamily: typography.fontBody }}
            >
              {slice.focalProject.highlights
                .slice(0, compact ? 2 : 3)
                .map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5"
                    style={{ color: style.textPrimary }}
                  >
                    {idx === 0 && typography.decorativeDropCap ? (
                      <span
                        className="text-xl sm:text-2xl font-bold leading-none px-1.5 py-0.5 shrink-0"
                        style={{
                          fontFamily: typography.fontDisplay,
                          color: style.bgCanvas,
                          backgroundColor: style.accentPrimary,
                        }}
                      >
                        {bullet.charAt(0)}
                      </span>
                    ) : (
                      <span
                        className="font-mono text-[11px] font-bold mt-0.5 shrink-0"
                        style={{ color: style.accentPrimary }}
                      >
                        0{idx + 1}
                      </span>
                    )}
                    <span className="line-clamp-2">
                      {idx === 0 && typography.decorativeDropCap
                        ? bullet.slice(1)
                        : bullet}
                    </span>
                  </li>
                ))}
            </ul>
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

  // Editorial Callout / Credential Accent (Unboxed or subtle typographic callout)
  const renderEditorialCalloutStrip = () => (
    <div
      className="shrink-0 flex flex-wrap items-center justify-between gap-4 pt-2 border-t text-xs"
      style={{ borderColor: `${style.borderColor}66` }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpenDossierModal();
        }}
        className="cursor-pointer group/cred min-w-0 flex-1"
      >
        <div
          className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono"
          style={{ color: style.accentPrimary }}
        >
          <Award className="w-3 h-3 shrink-0" />
          <span className="truncate font-semibold">{slice.featuredHackathon.result}</span>
          <span style={{ color: style.textSecondary }} className="hidden sm:inline">
            · {slice.featuredHackathon.dates}
          </span>
        </div>
        <div
          className="text-xs sm:text-sm font-bold truncate group-hover/cred:underline"
          style={{ fontFamily: typography.fontDisplay, color: style.textPrimary }}
        >
          {slice.featuredHackathon.title}
        </div>
      </div>

      <div
        onClick={(e) => {
          e.stopPropagation();
          onSwapSecondaryToPrimary();
        }}
        className="cursor-pointer group/next min-w-0 flex-1 sm:text-right"
      >
        <div
          className="flex items-center sm:justify-end gap-1.5 text-[10px] sm:text-[11px] font-mono"
          style={{ color: style.accentPrimary }}
        >
          <Terminal className="w-3 h-3 shrink-0" />
          <span className="truncate font-semibold">
            Next Dossier: {slice.secondaryProject.shortName}
          </span>
        </div>
        <div
          className="text-xs sm:text-sm font-bold truncate group-hover/next:underline"
          style={{ fontFamily: typography.fontDisplay, color: style.textPrimary }}
        >
          {slice.featuredSkillGroup.category}
        </div>
      </div>
    </div>
  );

  // Mobile-friendly compact illustration + identity header for viewports < lg
  const renderMobileIdentityHeader = (
    sizeClass = 'text-4xl sm:text-6xl lg:text-7xl',
    align: 'left' | 'center' | 'right' = 'left'
  ) => (
    <div className="shrink-0 flex items-center justify-between gap-3 pr-10 sm:pr-14 lg:pr-0">
      <div className="lg:hidden w-14 h-14 sm:w-20 sm:h-20 shrink-0">
        <ProceduralIllustration
          artDirection={style}
          config={illustration}
          photo={slice.photo}
          pointer={pointer}
          onCyclePhoto={onCyclePhoto}
          compact
        />
      </div>

      <div className="min-w-0 flex-1">
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
        <InteractiveHeadline
          text={identity.fullName}
          subtitle={identity.primaryRole}
          artDirection={style}
          typography={typography}
          pointer={pointer}
          onCycleTypography={onCycleTypography}
          sizeClass={sizeClass}
          align={align}
        />
      </div>
    </div>
  );

  // Minimal Exhibition Colophon Strip (replaces dashboard header/footer)
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

  // Render truly distinct, art-directed poster compositions per layout archetype!
  const renderArtDirectedPoster = () => {
    switch (layout.id) {
      case 'magazine-cover': {
        // 1. EDITORIAL MAGAZINE COVER: Giant Masthead across top, overlapping central sculpture, floating cover callouts
        return (
          <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            {/* Giant Vogue/Wired-style Masthead */}
            <div className="relative z-20 shrink-0 pb-2 border-b-2" style={{ borderColor: style.textPrimary }}>
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono uppercase tracking-widest mb-1 pr-12 lg:pr-16" style={{ color: style.textSecondary }}>
                <span>ISSUE NO. {String(style.editionNumber).padStart(3, '0')} // {style.name}</span>
                <span className="hidden sm:inline">{identity.location}</span>
                <span>shamiltp.me</span>
              </div>
              {renderMobileIdentityHeader('text-4xl sm:text-6xl lg:text-8xl', 'center')}
            </div>

            {/* Central Overlapping Cover Sculpture + Floating Left/Right Cover Lines */}
            <div className="relative flex-1 min-h-0 flex flex-col lg:flex-row items-stretch justify-between gap-4 py-3 overflow-hidden">
              {/* Left Cover Story Callout */}
              <div className="lg:w-[44%] z-20 flex flex-col justify-between min-h-0 my-auto">
                {renderArtisticProjectNarrative({ framed: false })}
              </div>

              {/* Center/Right Overlapping Monumental Cover Portrait */}
              <div
                className="hidden lg:flex lg:w-[36%] h-full min-h-0 relative z-10 items-center justify-center"
                style={{
                  transform: `translate3d(${(px * -0.45).toFixed(2)}px, ${(
                    py * -0.45
                  ).toFixed(2)}px, 0)`,
                }}
              >
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  pointer={pointer}
                  onCyclePhoto={onCyclePhoto}
                  frameVariant="arch-niche"
                />
              </div>

              {/* Right Vertical Cover Story Bullets */}
              <div className="lg:w-[20%] z-20 flex flex-col justify-end gap-4 min-h-0 lg:text-right">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDossierModal();
                  }}
                  className="cursor-pointer border-l-2 lg:border-l-0 lg:border-r-2 pl-3 lg:pl-0 lg:pr-3"
                  style={{ borderColor: style.accentPrimary }}
                >
                  <div className="text-[10px] font-mono uppercase" style={{ color: style.accentPrimary }}>
                    {slice.featuredHackathon.result}
                  </div>
                  <div className="text-xs sm:text-sm font-bold leading-tight mt-0.5" style={{ fontFamily: typography.fontDisplay }}>
                    {slice.featuredHackathon.title}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: style.textSecondary }}>
                    {slice.featuredExperience.title}
                  </div>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwapSecondaryToPrimary();
                  }}
                  className="cursor-pointer border-l-2 lg:border-l-0 lg:border-r-2 pl-3 lg:pl-0 lg:pr-3"
                  style={{ borderColor: style.accentSecondary }}
                >
                  <div className="text-[10px] font-mono uppercase" style={{ color: style.accentPrimary }}>
                    Up Next // {slice.secondaryProject.shortName}
                  </div>
                  <div className="text-xs sm:text-sm font-bold leading-tight mt-0.5" style={{ fontFamily: typography.fontDisplay }}>
                    {slice.featuredSkillGroup.category}
                  </div>
                  <div className="text-[10px] font-mono mt-0.5 truncate" style={{ color: style.textSecondary }}>
                    {slice.featuredSkillGroup.items.slice(0, 4).join(' · ')}
                  </div>
                </div>
              </div>
            </div>

            {renderPosterColophon()}
          </div>
        );
      }

      case 'asymmetric-avant-garde':
      case 'full-bleed-artwork': {
        // 2. AVANT-GARDE OFFSET OVERLAP / FULL-BLEED MONUMENT:
        // Oversized off-axis sculpture breaking the right/center stage with overlapping headline and floating museum placard
        return (
          <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 lg:p-10 overflow-hidden">
            {/* Background Oversized Floating Sculpture on Desktop */}
            <div
              className="hidden lg:block absolute right-8 top-8 bottom-14 w-[48%] z-10 pointer-events-auto"
              style={{
                transform: `translate3d(${(px * -0.6).toFixed(2)}px, ${(
                  py * -0.6
                ).toFixed(2)}px, 0)`,
              }}
            >
              <ProceduralIllustration
                artDirection={style}
                config={illustration}
                photo={slice.photo}
                pointer={pointer}
                onCyclePhoto={onCyclePhoto}
                frameVariant={
                  layout.id === 'full-bleed-artwork'
                    ? 'frameless-overlap'
                    : 'arch-niche'
                }
              />
            </div>

            {/* Top Left Overlapping Display Title (crosses over the artwork boundary) */}
            <div className="relative z-20 lg:max-w-[68%] shrink-0">
              {renderMobileIdentityHeader('text-4xl sm:text-6xl lg:text-8xl', 'left')}
            </div>

            {/* Bottom Left Floating Translucent Museum Placard */}
            <div className="relative z-20 lg:w-[58%] my-auto flex flex-col gap-3 min-h-0">
              {renderArtisticProjectNarrative({
                translucent: true,
                framed: true,
              })}
              {renderEditorialCalloutStrip()}
            </div>

            <div className="relative z-20">{renderPosterColophon()}</div>
          </div>
        );
      }

      case 'circular-monument': {
        // 3. ORBITAL MANDALA & ASTROLABE AXIS:
        // Central circular medallion surrounded by 4 asymmetric corner quadrants & orbital rings
        return (
          <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            {/* Decorative Orbital Rings in Center */}
            <div
              aria-hidden="true"
              className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none z-0"
            >
              <div
                className="w-[430px] h-[430px] rounded-full border border-dashed opacity-35"
                style={{
                  borderColor: style.accentPrimary,
                  transform: `translate3d(${(px * 0.4).toFixed(2)}px, ${(
                    py * 0.4
                  ).toFixed(2)}px, 0)`,
                }}
              />
            </div>

            {/* Top Row: Left Identity + Right Style Manifesto */}
            <div className="relative z-20 flex flex-col lg:flex-row lg:items-start justify-between gap-3 shrink-0 lg:pr-16">
              <div className="lg:max-w-[55%]">
                {renderMobileIdentityHeader('text-3xl sm:text-5xl lg:text-6xl', 'left')}
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenStyleModal();
                }}
                className="hidden lg:flex flex-col items-end text-right cursor-pointer max-w-xs"
              >
                <span
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: style.accentPrimary }}
                >
                  Orbital Edition #{String(style.editionNumber).padStart(3, '0')}
                </span>
                <span
                  className="text-lg font-bold mt-0.5"
                  style={{ fontFamily: typography.fontDisplay }}
                >
                  {style.name}
                </span>
                <span className="text-xs line-clamp-2 mt-0.5" style={{ color: style.textSecondary }}>
                  {style.harmonyNote}
                </span>
              </div>
            </div>

            {/* Middle Row: Left Project Spec + Center Circular Medallion + Right Credentials */}
            <div className="relative z-20 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center py-2 overflow-hidden">
              <div className="lg:col-span-5 flex flex-col justify-center min-h-0">
                {renderArtisticProjectNarrative({ framed: false, compact: true })}
              </div>

              <div className="hidden lg:flex lg:col-span-4 h-full max-h-[340px] items-center justify-center">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  pointer={pointer}
                  onCyclePhoto={onCyclePhoto}
                  frameVariant="circle-medallion"
                />
              </div>

              <div className="lg:col-span-3 flex flex-col justify-center gap-4 lg:text-right">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDossierModal();
                  }}
                  className="cursor-pointer"
                >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwapSecondaryToPrimary();
                  }}
                  className="cursor-pointer pt-3 border-t"
                  style={{ borderColor: `${style.borderColor}66` }}
                >
                  <div className="text-[11px] font-mono font-semibold" style={{ color: style.accentPrimary }}>
                    Next Focus // {slice.secondaryProject.shortName}
                  </div>
                  <div className="text-sm font-bold mt-0.5" style={{ fontFamily: typography.fontDisplay }}>
                    {slice.featuredSkillGroup.category}
                  </div>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: style.textSecondary }}>
                    {slice.featuredSkillGroup.items.slice(0, 4).join(' · ')}
                  </div>
                </div>
              </div>
            </div>

            {renderPosterColophon()}
          </div>
        );
      }

      case 'diagonal-split':
      case 'split-poster-duality': {
        // 4. 50/50 INVERTED SPLIT POSTER & DIAGONAL ARCHITECTURAL SPLIT:
        // Dramatic color-plane split with a full-height visual showcase on one side and an open manifesto on the other
        const isDiagonal = layout.id === 'diagonal-split';
        return (
          <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            {/* Diagonal or 50/50 Color-Blocked Plane */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundColor: style.bgElevated,
                clipPath: isDiagonal
                  ? 'polygon(0 0, 48% 0, 34% 100%, 0 100%)'
                  : 'polygon(0 0, 42% 0, 42% 100%, 0 100%)',
                borderRight: `2px solid ${style.accentPrimary}`,
              }}
            />

            <div className="relative z-20 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-hidden">
              {/* Left Visual Stage (5 cols on desktop) */}
              <div className="hidden lg:flex lg:col-span-5 flex-col justify-between min-h-0 py-1">
                <div className="flex items-baseline justify-between">
                  <span
                    className="text-5xl font-black tracking-tighter opacity-35"
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
                    pointer={pointer}
                    onCyclePhoto={onCyclePhoto}
                    frameVariant={isDiagonal ? 'frameless-overlap' : 'default'}
                  />
                </div>

                <div className="text-xs font-mono" style={{ color: style.textSecondary }}>
                  {style.harmonyNote}
                </div>
              </div>

              {/* Right Open Editorial Manifesto (7 cols on desktop) */}
              <div className="lg:col-span-7 flex flex-col justify-between min-h-0 gap-3 overflow-hidden">
                {renderMobileIdentityHeader('text-4xl sm:text-6xl lg:text-7xl', 'left')}
                {renderArtisticProjectNarrative({ framed: false })}
                {renderEditorialCalloutStrip()}
              </div>
            </div>

            <div className="relative z-20">{renderPosterColophon()}</div>
          </div>
        );
      }

      case 'vertical-spine-editorial':
      case 'bauhaus-constructivist': {
        // 5. VERTICAL SPINE & ZEN NEGATIVE SPACE / CONSTRUCTIVIST PILLAR:
        // Giant vertical rotated spine along the left edge, vast breathing space, floating sculpture
        const isBauhaus = layout.id === 'bauhaus-constructivist';
        return (
          <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-7 items-stretch overflow-hidden">
              {/* Monumental Vertical Spine Pillar (2 cols on desktop) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onCycleLayout();
                }}
                className="hidden lg:flex lg:col-span-2 flex-col items-center justify-between py-5 px-2 cursor-pointer select-none overflow-hidden"
                style={{
                  backgroundColor: isBauhaus ? style.accentPrimary : 'transparent',
                  color: isBauhaus
                    ? style.isDark
                      ? '#09090B'
                      : '#FFFFFF'
                    : style.textPrimary,
                  borderRight: !isBauhaus ? `2px solid ${style.borderColor}` : undefined,
                }}
                title="Click or press [L] to randomize layout"
              >
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180">
                  {style.name} // EDITION #{String(style.editionNumber).padStart(3, '0')}
                </span>
                <span
                  className="text-4xl xl:text-5xl font-black tracking-tighter [writing-mode:vertical-rl] rotate-180 leading-none"
                  style={{ fontFamily: typography.fontDisplay }}
                >
                  {identity.fullName.toUpperCase()}
                </span>
              </div>

              {/* Center Zen / Constructivist Manifesto (6 cols on desktop) */}
              <div className="lg:col-span-6 flex flex-col justify-between min-h-0 py-1 overflow-hidden">
                {renderMobileIdentityHeader('text-3xl sm:text-5xl lg:text-6xl', 'left')}
                <div className="my-auto py-2">
                  {renderArtisticProjectNarrative({
                    framed: false,
                  })}
                </div>
                {renderEditorialCalloutStrip()}
              </div>

              {/* Right Poised Sculpture (4 cols on desktop) */}
              <div className="hidden lg:flex lg:col-span-4 flex-col justify-between min-h-0 py-1 overflow-hidden">
                <div className="flex-1 min-h-0">
                  <ProceduralIllustration
                    artDirection={style}
                    config={illustration}
                    photo={slice.photo}
                    pointer={pointer}
                    onCyclePhoto={onCyclePhoto}
                    frameVariant={isBauhaus ? 'frameless-overlap' : 'arch-niche'}
                  />
                </div>
              </div>
            </div>

            {renderPosterColophon()}
          </div>
        );
      }

      case 'layered-collage-zine': {
        // 6. TACTILE LAYERED COLLAGE ZINE:
        // Tilted overlapping paper clippings, taped Polaroid portrait specimen, stamped seal
        return (
          <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center overflow-hidden">
              {/* Left Tilted Zine Cutouts (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between min-h-0 gap-3 z-20">
                <div
                  className="p-3 sm:p-4 -rotate-1"
                  style={{
                    backgroundColor: style.bgElevated,
                    ...getFrameBorderStyle(true),
                  }}
                >
                  {renderMobileIdentityHeader('text-3xl sm:text-5xl lg:text-6xl', 'left')}
                </div>

                {renderArtisticProjectNarrative({
                  framed: true,
                  compact: true,
                  rotationClass: 'rotate-[0.6deg]',
                })}

                {renderEditorialCalloutStrip()}
              </div>

              {/* Right Overlapping Taped Polaroid Cutout (5 cols) */}
              <div className="hidden lg:flex lg:col-span-5 h-full max-h-[460px] items-center justify-center relative z-10 lg:-ml-6">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  pointer={pointer}
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

      case 'three-column-broadsheet': {
        // 7. CLASSICAL THREE-COLUMN BROADSHEET:
        // Archival print masthead + 3 vertical columns divided by fine print hairlines (no UI boxes)
        return (
          <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            {/* Archival Print Masthead with Double Rule */}
            <div
              className="shrink-0 pb-3 mb-2 border-b-4 border-double"
              style={{ borderColor: style.textPrimary }}
            >
              {renderMobileIdentityHeader('text-3xl sm:text-5xl lg:text-6xl', 'center')}
            </div>

            {/* 3 Print Columns with Vertical Hairline Dividers */}
            <div
              className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:divide-x py-2 overflow-hidden"
              style={{ borderColor: style.borderColor }}
            >
              {/* Column 1: Lead Project Article */}
              <div className="lg:col-span-5 flex flex-col justify-between min-h-0 pr-1">
                {renderArtisticProjectNarrative({ framed: false })}
              </div>

              {/* Column 2: Engraved Medallion Plate */}
              <div className="hidden lg:flex lg:col-span-4 flex-col justify-between min-h-0 pl-5 pr-1">
                <div className="flex-1 min-h-0">
                  <ProceduralIllustration
                    artDirection={style}
                    config={illustration}
                    photo={slice.photo}
                    pointer={pointer}
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

              {/* Column 3: Chronicles, Hackathons & Technical Index */}
              <div
                className="hidden lg:flex lg:col-span-3 flex-col justify-between min-h-0 pl-5 text-xs"
                style={{ borderColor: style.borderColor }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDossierModal();
                  }}
                  className="cursor-pointer"
                >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwapSecondaryToPrimary();
                  }}
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

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenStyleModal();
                  }}
                  className="cursor-pointer pt-3 border-t"
                  style={{ borderColor: `${style.borderColor}66` }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: style.accentPrimary }}>
                    III. Typographic Colophon
                  </div>
                  <p className="text-[11px]" style={{ color: style.textSecondary }}>
                    Set in {typography.pairingName} under {style.name} art direction.
                  </p>
                </div>
              </div>
            </div>

            {renderPosterColophon()}
          </div>
        );
      }

      case 'brutalist-manifesto': {
        // 8. RAW BRUTALIST STRUCTURAL MANIFESTO:
        // Giant background watermark numerals, bottom-anchored colossal display title, unboxed ISO spec lines
        return (
          <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            {/* Giant Watermark Edition Index */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute right-8 -top-6 text-[11rem] font-black leading-none select-none pointer-events-none opacity-10"
              style={{
                fontFamily: typography.fontDisplay,
                color: style.accentPrimary,
                transform: `translate3d(${(px * -0.5).toFixed(2)}px, ${(
                  py * -0.5
                ).toFixed(2)}px, 0)`,
              }}
            >
              0{slice.focalProject.index}
            </div>

            {/* Upper Section: Left ISO Spec Manifesto + Right Frameless HUD/Brutalist Sculpture */}
            <div className="relative z-20 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-hidden">
              <div className="lg:col-span-7 flex flex-col justify-between min-h-0 gap-3">
                <div className="lg:hidden">
                  {renderMobileIdentityHeader('text-4xl sm:text-6xl', 'left')}
                </div>
                {renderArtisticProjectNarrative({ framed: false })}
                {renderEditorialCalloutStrip()}
              </div>

              <div className="hidden lg:flex lg:col-span-5 h-full max-h-[380px] items-center justify-center">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  pointer={pointer}
                  onCyclePhoto={onCyclePhoto}
                  frameVariant="frameless-overlap"
                />
              </div>
            </div>

            {/* Bottom-Anchored Colossal Display Title */}
            <div
              className="hidden lg:block relative z-20 shrink-0 pt-2 border-t-2"
              style={{ borderColor: style.textPrimary }}
            >
              {renderMobileIdentityHeader('text-5xl lg:text-8xl', 'left')}
            </div>

            {renderPosterColophon()}
          </div>
        );
      }

      default: {
        // 9. ASYMMETRIC SCULPTURAL TOTEM & FLOATING MANIFESTO (bento-playground):
        // Frameless floating sculpture on the left/center with staggered unboxed editorial typography on the right
        return (
          <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-7 lg:p-9 overflow-hidden">
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-hidden">
              {/* Left Floating Sculptural Plate (5 cols on desktop) */}
              <div className="hidden lg:flex lg:col-span-5 h-full max-h-[450px] flex-col justify-center">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  pointer={pointer}
                  onCyclePhoto={onCyclePhoto}
                  frameVariant="frameless-overlap"
                />
              </div>

              {/* Right Staggered Editorial Hierarchy (7 cols on desktop) */}
              <div className="lg:col-span-7 flex flex-col justify-between min-h-0 gap-3 overflow-hidden">
                {renderMobileIdentityHeader('text-4xl sm:text-6xl lg:text-7xl', 'left')}
                {renderArtisticProjectNarrative({ framed: false })}
                {renderEditorialCalloutStrip()}
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
      onClick={() => setInteractivePulse((p) => p + 1)}
      data-testid="poster-canvas"
      data-style-slug={style.slug}
      data-layout-id={layout.id}
      data-edition={style.editionNumber}
      className="relative flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col justify-between p-2 sm:p-4 lg:p-5 transition-colors duration-500"
      style={{
        backgroundColor: style.bgCanvas,
        color: style.textPrimary,
        fontFamily: typography.fontBody,
      }}
    >
      {/* Background SVG & Ambient Motif Layer */}
      <PosterMotifLayer
        style={style}
        pointer={pointer}
        interactivePulse={interactivePulse}
      />

      {/* Exhibition Poster Surface */}
      <div
        className="relative z-10 w-full h-full min-h-0 flex flex-col justify-between overflow-hidden"
        style={{
          backgroundColor:
            style.borderStyle === 'glass-rim'
              ? `${style.bgSurface}CC`
              : `${style.bgSurface}F2`,
          ...getFrameBorderStyle(false),
          transform: `perspective(1600px) rotateX(${(tiltX * 0.28).toFixed(
            2
          )}deg) rotateY(${(tiltY * 0.28).toFixed(2)}deg)`,
          willChange: 'transform',
        }}
      >
        {renderArtDirectedPoster()}
      </div>
    </main>
  );
};
