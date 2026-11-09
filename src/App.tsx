/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search,
  Shuffle,
  Download,
  Sparkles,
  Image as ImageIcon,
  Check,
  X,
  Type as TypeIcon,
  LayoutGrid,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Palette,
} from 'lucide-react';
import {
  parsePortfolioMarkdown,
  selectPosterDataSlice,
  INITIAL_RAW_MARKDOWN,
  PortfolioPhoto,
} from './utils/knowledgeParser';
import {
  generateCompleteDesignState,
  CompleteDesignState,
} from './engine/designEngine';
import { exportPosterAsPng } from './utils/posterExporter';
import { PosterCanvas } from './components/PosterCanvas';
import { StyleStudioModal } from './components/StyleStudioModal';
import { KnowledgeStudioModal } from './components/KnowledgeStudioModal';

const STORAGE_SEEN_KEY = 'shamil_tp_poster_seen_signatures_v2';
const STORAGE_CUSTOM_PHOTOS_KEY = 'shamil_tp_poster_custom_photos_v1';

function loadSeenSignatures(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_SEEN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSeenSignatures(sigs: string[]) {
  try {
    localStorage.setItem(STORAGE_SEEN_KEY, JSON.stringify(sigs.slice(-400)));
  } catch {
    // Ignore storage quota errors
  }
}

function loadCustomPhotos(): PortfolioPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_PHOTOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [rawMarkdown, setRawMarkdown] = useState<string>(INITIAL_RAW_MARKDOWN);
  const [customPhotos, setCustomPhotos] = useState<PortfolioPhoto[]>(() =>
    loadCustomPhotos()
  );

  // Parse knowledge base from .md + custom photos
  const kb = useMemo(
    () => parsePortfolioMarkdown(rawMarkdown, customPhotos),
    [rawMarkdown, customPhotos]
  );

  // Fetch the full attached .md file at runtime to keep rawMarkdown synced
  useEffect(() => {
    fetch('/assets/aistudio/SHAMIL_TP_PORTFOLIO_KNOWLEDGE_BASE_a54d24ce.md')
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (text && text.trim().length > 100) {
          setRawMarkdown(text);
        }
      })
      .catch(() => {
        // Fallback already loaded via INITIAL_RAW_MARKDOWN
      });
  }, []);

  const [seenSignatures, setSeenSignatures] = useState<string[]>(() =>
    loadSeenSignatures()
  );
  const [typeOverrideCounter, setTypeOverrideCounter] = useState<number>(0);
  const [layoutOverrideCounter, setLayoutOverrideCounter] = useState<number>(0);

  // Generate fresh deterministic seed on every page refresh
  const [designState, setDesignState] = useState<CompleteDesignState>(() => {
    const initialSeen = loadSeenSignatures();
    const edition = initialSeen.length + 1;
    const initialSeed =
      Math.floor(Math.random() * 900000) + edition * 7919 + (Date.now() % 10000);
    const state = generateCompleteDesignState(initialSeed, edition, {
      projectCount: 12,
      photoCount: 3 + loadCustomPhotos().length,
    });
    saveSeenSignatures([...initialSeen, state.comboSignature]);
    return state;
  });

  useEffect(() => {
    setSeenSignatures((prev) => {
      if (prev.includes(designState.comboSignature)) return prev;
      const next = [...prev, designState.comboSignature];
      saveSeenSignatures(next);
      return next;
    });
  }, [designState.comboSignature]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isControlMenuOpen, setIsControlMenuOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close expandable menu when clicking outside
  useEffect(() => {
    if (!isControlMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsControlMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isControlMenuOpen]);

  // A. Complete Design Regeneration (New Seed -> New Style/Hybrid, New Layout, New Typography, New Illustration, New Dossier)
  const handleRegenerateDesign = useCallback(
    (options?: {
      forceStyleId?: number;
      forceSecondaryStyleId?: number;
      forceHybrid?: boolean;
    }) => {
      setTypeOverrideCounter(0);
      setLayoutOverrideCounter(0);
      setDesignState((prev) => {
        const nextEdition = prev.editionNumber + 1;
        const nextSeed =
          Math.floor(Math.random() * 900000) +
          nextEdition * 6151 +
          (Date.now() % 10000);
        return generateCompleteDesignState(nextSeed, nextEdition, {
          ...options,
          previousState: prev,
          projectCount: kb.projects.length,
          photoCount: kb.photos.length,
        });
      });
      setDownloadStatus(null);
    },
    [kb.projects.length, kb.photos.length]
  );

  // E. Independent Typography Randomization (Preserves current style, layout, and illustration)
  const handleRandomizeTypography = useCallback(() => {
    setTypeOverrideCounter((prevCount) => {
      const nextCount = prevCount + 1;
      setDesignState((prev) => {
        const updated = generateCompleteDesignState(
          prev.seed,
          prev.editionNumber,
          {
            typeOverrideIndex: nextCount,
            layoutOverrideIndex:
              layoutOverrideCounter > 0 ? layoutOverrideCounter : undefined,
            projectCount: kb.projects.length,
            photoCount: kb.photos.length,
          }
        );
        return {
          ...prev,
          typography: updated.typography,
        };
      });
      return nextCount;
    });
  }, [kb.projects.length, kb.photos.length, layoutOverrideCounter]);

  // F. Independent Layout Randomization (Preserves current style, typography, and illustration)
  const handleRandomizeLayout = useCallback(() => {
    setLayoutOverrideCounter((prevCount) => {
      const nextCount = prevCount + 1;
      setDesignState((prev) => {
        const updated = generateCompleteDesignState(
          prev.seed,
          prev.editionNumber,
          {
            typeOverrideIndex:
              typeOverrideCounter > 0 ? typeOverrideCounter : undefined,
            layoutOverrideIndex: nextCount,
            projectCount: kb.projects.length,
            photoCount: kb.photos.length,
          }
        );
        return {
          ...prev,
          layout: updated.layout,
        };
      });
      return nextCount;
    });
  }, [kb.projects.length, kb.photos.length, typeOverrideCounter]);

  // G. Fullscreen Toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen?.()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  // H. Keyboard Controls: Space (Regenerate), T (Typography), L (Layout), M (Menu), Escape (Close Menu/Modals)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape') {
          (target as HTMLElement).blur();
        }
        return;
      }

      if (e.code === 'Space' && !isStyleModalOpen && !isKnowledgeModalOpen) {
        e.preventDefault();
        handleRegenerateDesign();
      } else if (
        (e.key === 't' || e.key === 'T') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isStyleModalOpen &&
        !isKnowledgeModalOpen
      ) {
        e.preventDefault();
        handleRandomizeTypography();
      } else if (
        (e.key === 'l' || e.key === 'L') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isStyleModalOpen &&
        !isKnowledgeModalOpen
      ) {
        e.preventDefault();
        handleRandomizeLayout();
      } else if (
        (e.key === 'm' || e.key === 'M') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isStyleModalOpen &&
        !isKnowledgeModalOpen
      ) {
        e.preventDefault();
        setIsControlMenuOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsControlMenuOpen(false);
        setIsStyleModalOpen(false);
        setIsKnowledgeModalOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleRegenerateDesign,
    handleRandomizeTypography,
    handleRandomizeLayout,
    isStyleModalOpen,
    isKnowledgeModalOpen,
  ]);

  const handleCyclePhoto = () => {
    setDesignState((prev) => ({
      ...prev,
      photoIndex: (prev.photoIndex + 1) % kb.photos.length,
    }));
  };

  const handleCycleProject = () => {
    setDesignState((prev) => ({
      ...prev,
      projectIndex: (prev.projectIndex + 1) % kb.projects.length,
      secondaryProjectIndex:
        (prev.secondaryProjectIndex + 1) % kb.projects.length,
    }));
  };

  const handleSwapSecondaryToPrimary = () => {
    setDesignState((prev) => ({
      ...prev,
      projectIndex: prev.secondaryProjectIndex,
      secondaryProjectIndex: (prev.projectIndex + 2) % kb.projects.length,
    }));
  };

  const handleAddCustomPhoto = (newPhoto: PortfolioPhoto) => {
    setCustomPhotos((prev) => {
      const updated = [newPhoto, ...prev];
      try {
        localStorage.setItem(STORAGE_CUSTOM_PHOTOS_KEY, JSON.stringify(updated));
      } catch {
        // Ignore quota limits
      }
      return updated;
    });
    setDesignState((prev) => ({
      ...prev,
      photoIndex: 0,
    }));
  };

  const activeSlice = useMemo(
    () =>
      selectPosterDataSlice(kb, {
        projectIndex: designState.projectIndex,
        secondaryProjectIndex: designState.secondaryProjectIndex,
        experienceIndex: designState.experienceIndex,
        hackathonIndex: designState.hackathonIndex,
        skillGroupIndex: designState.skillGroupIndex,
        educationIndex: designState.educationIndex,
        photoIndex: designState.photoIndex,
        searchQuery,
      }),
    [kb, designState, searchQuery]
  );

  const activeStyle = designState.artDirection;

  const handleDownloadPoster = async () => {
    try {
      setDownloadStatus('Rendering 1920×1080 PNG...');
      const filename = await exportPosterAsPng(
        activeStyle,
        activeSlice,
        kb.identity
      );
      setDownloadStatus(`Downloaded ${filename}`);
      setTimeout(() => setDownloadStatus(null), 4000);
    } catch {
      setDownloadStatus('Export complete');
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  return (
    <div
      className="relative h-[100dvh] min-h-[100svh] w-[100vw] overflow-hidden flex flex-col select-none"
      style={{
        backgroundColor: activeStyle.bgCanvas,
        color: activeStyle.textPrimary,
      }}
    >
      {/* DISCREET FLOATING STUDIO MENU (Hidden by default; only a low-profile trigger is visible) */}
      <div
        ref={menuRef}
        className="fixed top-3.5 right-3.5 sm:top-5 sm:right-6 z-40 flex flex-col items-end"
      >
        <button
          type="button"
          onClick={() => setIsControlMenuOpen((prev) => !prev)}
          aria-expanded={isControlMenuOpen}
          aria-label={
            isControlMenuOpen ? 'Close Studio Controls' : 'Open Studio Controls'
          }
          title="Studio Controls [M] · Space to Regenerate"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono border cursor-pointer backdrop-blur-md transition-opacity duration-300 ${
            isControlMenuOpen
              ? 'opacity-100'
              : 'opacity-45 hover:opacity-100 focus:opacity-100'
          }`}
          style={{
            backgroundColor: `${activeStyle.bgElevated}D9`,
            borderColor: activeStyle.borderColor,
            color: activeStyle.textPrimary,
            fontFamily: designState.typography.fontMono,
          }}
        >
          {isControlMenuOpen ? (
            <>
              <X className="w-3.5 h-3.5" style={{ color: activeStyle.accentPrimary }} />
              <span>Close</span>
            </>
          ) : (
            <>
              <SlidersHorizontal
                className="w-3.5 h-3.5"
                style={{ color: activeStyle.accentPrimary }}
              />
              <span className="hidden sm:inline">Studio</span>
            </>
          )}
        </button>

        {/* Expandable Compact Control Drawer (Only rendered when user explicitly opens it) */}
        {isControlMenuOpen && (
          <div
            role="region"
            aria-label="Poster Studio Controls"
            className="mt-2 w-[min(92vw,340px)] p-3.5 border shadow-2xl backdrop-blur-xl flex flex-col gap-3 transition-all duration-300"
            style={{
              backgroundColor: `${activeStyle.bgElevated}F5`,
              borderColor: activeStyle.borderColor,
              color: activeStyle.textPrimary,
              fontFamily: designState.typography.fontBody,
            }}
          >
            {/* Header Info inside Drawer */}
            <div
              className="flex items-center justify-between pb-2 border-b text-[11px] font-mono"
              style={{ borderColor: `${activeStyle.borderColor}88` }}
            >
              <span className="font-bold truncate" style={{ color: activeStyle.accentPrimary }}>
                {activeStyle.name}
              </span>
              <span style={{ color: activeStyle.textSecondary }}>
                Edition #{String(activeStyle.editionNumber).padStart(3, '0')}
              </span>
            </div>

            {/* Search Input to Recompose Poster from .md Knowledge Base */}
            <div className="relative flex items-center">
              <Search
                className="w-3.5 h-3.5 absolute left-2.5 pointer-events-none"
                style={{ color: activeStyle.textSecondary }}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search .md (e.g. Go, OpsPilot, Rewind, Cloudflare)..."
                aria-label="Search portfolio knowledge base"
                className="w-full pl-8 pr-6 py-1.5 text-xs border focus:outline-none transition-colors"
                style={{
                  backgroundColor: activeStyle.bgSurface,
                  borderColor: activeStyle.borderColor,
                  color: activeStyle.textPrimary,
                  fontFamily: designState.typography.fontBody,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2 p-0.5 cursor-pointer"
                  style={{ color: activeStyle.textSecondary }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Primary Poster Mutators Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleRegenerateDesign()}
                aria-label="Regenerate complete design"
                className="col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border cursor-pointer transition-transform active:scale-98"
                style={{
                  backgroundColor: activeStyle.bgSurface,
                  borderColor: activeStyle.accentPrimary,
                  color: activeStyle.textPrimary,
                  fontFamily: designState.typography.fontMono,
                }}
              >
                <Shuffle
                  className="w-3.5 h-3.5"
                  style={{ color: activeStyle.accentPrimary }}
                />
                <span>Regenerate [Space]</span>
              </button>

              <button
                type="button"
                onClick={handleRandomizeTypography}
                aria-label="Randomize typography only"
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border cursor-pointer transition-transform active:scale-98"
                style={{
                  backgroundColor: activeStyle.bgSurface,
                  borderColor: activeStyle.borderColor,
                  color: activeStyle.textPrimary,
                  fontFamily: designState.typography.fontMono,
                }}
              >
                <TypeIcon
                  className="w-3.5 h-3.5"
                  style={{ color: activeStyle.accentPrimary }}
                />
                <span>Type [T]</span>
              </button>

              <button
                type="button"
                onClick={handleRandomizeLayout}
                aria-label="Randomize layout only"
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border cursor-pointer transition-transform active:scale-98"
                style={{
                  backgroundColor: activeStyle.bgSurface,
                  borderColor: activeStyle.borderColor,
                  color: activeStyle.textPrimary,
                  fontFamily: designState.typography.fontMono,
                }}
              >
                <LayoutGrid
                  className="w-3.5 h-3.5"
                  style={{ color: activeStyle.accentPrimary }}
                />
                <span>Layout [L]</span>
              </button>

              <button
                type="button"
                onClick={() => handleRegenerateDesign({ forceHybrid: true })}
                aria-label="Generate hybrid design combination"
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold border cursor-pointer transition-transform active:scale-98"
                style={{
                  backgroundColor: activeStyle.bgSurface,
                  borderColor: activeStyle.borderColor,
                  color: activeStyle.accentPrimary,
                  fontFamily: designState.typography.fontMono,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hybrid Combo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsControlMenuOpen(false);
                  setIsStyleModalOpen(true);
                }}
                aria-label="Open 50 Styles Catalog"
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border cursor-pointer"
                style={{
                  backgroundColor: activeStyle.bgSurface,
                  borderColor: activeStyle.borderColor,
                  color: activeStyle.textPrimary,
                  fontFamily: designState.typography.fontMono,
                }}
              >
                <Palette
                  className="w-3.5 h-3.5"
                  style={{ color: activeStyle.accentPrimary }}
                />
                <span>50 Styles</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsControlMenuOpen(false);
                  setIsKnowledgeModalOpen(true);
                }}
                aria-label="Open Knowledge Base and Photo Studio"
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border cursor-pointer"
                style={{
                  backgroundColor: activeStyle.bgSurface,
                  borderColor: activeStyle.borderColor,
                  color: activeStyle.textPrimary,
                  fontFamily: designState.typography.fontMono,
                }}
              >
                <ImageIcon
                  className="w-3.5 h-3.5"
                  style={{ color: activeStyle.accentPrimary }}
                />
                <span>Photos / .md</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border cursor-pointer"
                style={{
                  backgroundColor: activeStyle.bgSurface,
                  borderColor: activeStyle.borderColor,
                  color: activeStyle.textPrimary,
                  fontFamily: designState.typography.fontMono,
                }}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Windowed</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
            </div>

            {/* Primary Export Action */}
            <button
              type="button"
              onClick={handleDownloadPoster}
              aria-label="Download Poster PNG"
              className="w-full py-2 px-3 text-xs font-semibold transition-transform active:scale-98 cursor-pointer inline-flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: activeStyle.accentPrimary,
                color: activeStyle.isDark ? '#09090B' : '#FFFFFF',
                fontFamily: designState.typography.fontMono,
              }}
            >
              {downloadStatus ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{downloadStatus}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Poster (1920×1080)</span>
                </>
              )}
            </button>

            <div
              className="text-[10px] font-mono text-center pt-1 border-t"
              style={{
                borderColor: `${activeStyle.borderColor}66`,
                color: activeStyle.textSecondary,
              }}
            >
              Shortcuts: [Space] New Poster · [T] Type · [L] Layout · [M] Menu
            </div>
          </div>
        )}
      </div>

      {/* ZERO-SCROLL FULL-VIEWPORT EXPERIMENTAL DESIGN CANVAS */}
      <PosterCanvas
        designState={designState}
        slice={activeSlice}
        identity={kb.identity}
        onCyclePhoto={handleCyclePhoto}
        onCycleProject={handleCycleProject}
        onSwapSecondaryToPrimary={handleSwapSecondaryToPrimary}
        onCycleTypography={handleRandomizeTypography}
        onCycleLayout={handleRandomizeLayout}
        onOpenStyleModal={() => setIsStyleModalOpen(true)}
        onOpenDossierModal={() => setIsKnowledgeModalOpen(true)}
      />

      {/* 50 DESIGN STYLES & HYBRID SYNTHESIZER MODAL */}
      <StyleStudioModal
        isOpen={isStyleModalOpen}
        activeStyle={activeStyle}
        seenCount={seenSignatures.length}
        onClose={() => setIsStyleModalOpen(false)}
        onSelectPureStyle={(styleId) =>
          handleRegenerateDesign({ forceStyleId: styleId, forceHybrid: false })
        }
        onSynthesizeHybrid={(styleAId, styleBId) =>
          handleRegenerateDesign({
            forceStyleId: styleAId,
            forceSecondaryStyleId: styleBId,
            forceHybrid: true,
          })
        }
        onRandomizeHybrid={() => handleRegenerateDesign({ forceHybrid: true })}
      />

      {/* KNOWLEDGE BASE (.MD) & PHOTO UPLOAD STUDIO MODAL */}
      <KnowledgeStudioModal
        isOpen={isKnowledgeModalOpen}
        kb={kb}
        rawMarkdown={rawMarkdown}
        activeProjectIndex={designState.projectIndex}
        activePhotoIndex={designState.photoIndex}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onSelectProject={(idx) =>
          setDesignState((prev) => ({
            ...prev,
            projectIndex: idx,
            secondaryProjectIndex: (idx + 3) % kb.projects.length,
          }))
        }
        onSelectPhoto={(idx) =>
          setDesignState((prev) => ({
            ...prev,
            photoIndex: idx,
          }))
        }
        onAddCustomPhoto={handleAddCustomPhoto}
        onUpdateMarkdown={(newMd) => setRawMarkdown(newMd)}
      />
    </div>
  );
}
