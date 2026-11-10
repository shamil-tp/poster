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
  createSeededRng,
} from './engine/designEngine';
import {
  IllustrationAssetSpec,
  loadCustomIllustrationAssets,
  saveCustomIllustrationAssets,
  getAllIllustrationAssets,
  discoverAdditionalAssets,
} from './engine/assetRegistry';
import { generateIllustrationConfig } from './engine/illustrationGenerator';
import {
  exportRenderedPoster,
  prewarmPosterFonts,
  PosterExportFormat,
} from './utils/posterExporter';
import { PosterCanvas } from './components/PosterCanvas';
import { StyleStudioModal } from './components/StyleStudioModal';
import { KnowledgeStudioModal } from './components/KnowledgeStudioModal';

const STORAGE_SEEN_KEY = 'shamil_tp_poster_seen_signatures_v2';
const STORAGE_CUSTOM_PHOTOS_KEY = 'shamil_tp_poster_custom_photos_v1';
const STORAGE_RECENT_ASSETS_KEY = 'shamil_tp_poster_recent_assets_v1';

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

function loadRecentAssetIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_RECENT_ASSETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentAssetIds(ids: string[]) {
  try {
    localStorage.setItem(
      STORAGE_RECENT_ASSETS_KEY,
      JSON.stringify(ids.slice(-12))
    );
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
  const [customAssets, setCustomAssets] = useState<IllustrationAssetSpec[]>(() =>
    loadCustomIllustrationAssets()
  );
  const [recentAssetIds, setRecentAssetIds] = useState<string[]>(() =>
    loadRecentAssetIds()
  );

  const allIllustrationAssets = useMemo(
    () => getAllIllustrationAssets(customAssets),
    [customAssets]
  );

  // Parse knowledge base from .md + custom photos
  const kb = useMemo(
    () => parsePortfolioMarkdown(rawMarkdown, customPhotos),
    [rawMarkdown, customPhotos]
  );

  // Fetch the full attached .md file and run expandable asset discovery on mount
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

    discoverAdditionalAssets()
      .then((discovered) => {
        if (discovered.length > 0) {
          setCustomAssets((prev) => [...discovered, ...prev]);
        }
      })
      .catch(() => {});
  }, []);

  const [seenSignatures, setSeenSignatures] = useState<string[]>(() =>
    loadSeenSignatures()
  );
  const [typeOverrideCounter, setTypeOverrideCounter] = useState<number>(0);
  const [layoutOverrideCounter, setLayoutOverrideCounter] = useState<number>(0);

  // Generate fresh deterministic seed on every page refresh, avoiding recently used assets
  const [designState, setDesignState] = useState<CompleteDesignState>(() => {
    const initialSeen = loadSeenSignatures();
    const initialRecentAssets = loadRecentAssetIds();
    const initialCustomAssets = loadCustomIllustrationAssets();
    const edition = initialSeen.length + 1;
    const initialSeed =
      Math.floor(Math.random() * 900000) + edition * 7919 + (Date.now() % 10000);
    const state = generateCompleteDesignState(initialSeed, edition, {
      projectCount: 12,
      photoCount: 3 + loadCustomPhotos().length,
      customAssets: initialCustomAssets,
      excludeAssetIds: initialRecentAssets.slice(-8),
    });
    saveSeenSignatures([...initialSeen, state.comboSignature]);
    saveRecentAssetIds([
      ...initialRecentAssets,
      state.illustration.primaryAsset.id,
    ]);
    return state;
  });

  useEffect(() => {
    setSeenSignatures((prev) => {
      if (prev.includes(designState.comboSignature)) return prev;
      const next = [...prev, designState.comboSignature];
      saveSeenSignatures(next);
      return next;
    });
    setRecentAssetIds((prev) => {
      const primaryId = designState.illustration.primaryAsset.id;
      if (prev[prev.length - 1] === primaryId) return prev;
      const next = [...prev.filter((id) => id !== primaryId), primaryId].slice(-12);
      saveRecentAssetIds(next);
      return next;
    });
  }, [designState.comboSignature, designState.illustration.primaryAsset.id]);

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

  // A. Complete Design Regeneration (New Seed -> New Style/Hybrid, New Layout, New Typography, New Asset Combination, New Dossier)
  const handleRegenerateDesign = useCallback(
    (options?: {
      forceStyleId?: number;
      forceSecondaryStyleId?: number;
      forceHybrid?: boolean;
      forceAssetId?: string;
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
          customAssets,
          excludeAssetIds: recentAssetIds.slice(-8),
          previousState: prev,
          projectCount: kb.projects.length,
          photoCount: kb.photos.length,
        });
      });
      setDownloadStatus(null);
    },
    [kb.projects.length, kb.photos.length, customAssets, recentAssetIds]
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
            customAssets,
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
  }, [kb.projects.length, kb.photos.length, layoutOverrideCounter, customAssets]);

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
            customAssets,
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
  }, [kb.projects.length, kb.photos.length, typeOverrideCounter, customAssets]);

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

  // Clicking the illustration stage shuffles the multi-image ensemble, collage arrangement, and portrait
  const handleCyclePhoto = () => {
    setDesignState((prev) => {
      const nextRng = createSeededRng(prev.seed + Date.now());
      const nextIllustration = generateIllustrationConfig(
        prev.artDirection,
        nextRng,
        {
          customAssets,
          excludeAssetIds: [
            ...prev.illustration.ensembleAssets.map((a) => a.id),
            ...recentAssetIds.slice(-4),
          ],
          previousArrangement: prev.illustration.collageArrangement,
        }
      );
      return {
        ...prev,
        illustration: nextIllustration,
        photoIndex: (prev.photoIndex + 1) % kb.photos.length,
      };
    });
  };

  const handleSelectAsset = (assetId: string) => {
    setDesignState((prev) => {
      const nextRng = createSeededRng(prev.seed ^ 0x99887766);
      const nextIllustration = generateIllustrationConfig(
        prev.artDirection,
        nextRng,
        {
          customAssets,
          forceAssetId: assetId,
        }
      );
      return {
        ...prev,
        illustration: nextIllustration,
      };
    });
  };

  const handleAddCustomAsset = (newAsset: IllustrationAssetSpec) => {
    setCustomAssets((prev) => {
      const updated = [newAsset, ...prev];
      saveCustomIllustrationAssets(updated);
      return updated;
    });
    setDesignState((prev) => {
      const nextRng = createSeededRng(prev.seed ^ 0x55443322);
      const nextIllustration = generateIllustrationConfig(
        prev.artDirection,
        nextRng,
        {
          customAssets: [newAsset, ...customAssets],
          forceAssetId: newAsset.id,
        }
      );
      return {
        ...prev,
        illustration: nextIllustration,
      };
    });
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

  // Pre-warm the active poster's Google Fonts in memory so exporting is instant
  useEffect(() => {
    prewarmPosterFonts([
      designState.typography.fontDisplay,
      designState.typography.fontBody,
      designState.typography.fontMono,
      activeStyle.fontDisplay,
      activeStyle.fontBody,
      activeStyle.fontMono,
    ]);
  }, [
    designState.typography.fontDisplay,
    designState.typography.fontBody,
    designState.typography.fontMono,
    activeStyle.fontDisplay,
    activeStyle.fontBody,
    activeStyle.fontMono,
  ]);

  const [imgBannerVersion, setImgBannerVersion] = useState<string | null>(null);
  const [imgPublishStatus, setImgPublishStatus] = useState<string | null>(null);

  // Fetch initial /img banner version metadata
  useEffect(() => {
    fetch('/api/img/meta')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.meta?.version) {
          setImgBannerVersion(data.meta.version);
        }
      })
      .catch(() => {});
  }, []);

  // Automatically sync newly rendered poster to /img in the background so /img stays fresh
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const result = await exportRenderedPoster(activeStyle, {
          format: 'webp',
          scale: 1,
          quality: 0.86,
          triggerDownload: false,
        });
        const res = await fetch('/api/img/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataUrl: result.dataUrl,
            styleName: activeStyle.name,
            editionNumber: activeStyle.editionNumber,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.meta?.version) {
            setImgBannerVersion(data.meta.version);
          }
        }
      } catch {
        // Non-blocking background sync
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [activeStyle, designState.comboSignature]);

  const handlePublishImgBanner = useCallback(async () => {
    try {
      setImgPublishStatus('Publishing /img WebP...');
      const result = await exportRenderedPoster(activeStyle, {
        format: 'webp',
        scale: 1,
        quality: 0.88,
        triggerDownload: false,
      });
      const res = await fetch('/api/img/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: result.dataUrl,
          styleName: activeStyle.name,
          editionNumber: activeStyle.editionNumber,
        }),
      });
      if (!res.ok) throw new Error('Publish failed');
      const data = await res.json();
      const version = data?.meta?.version || '';
      setImgBannerVersion(version);
      const mdBadge =
        data?.urls?.markdownBadge ||
        `[![Poster Playground](https://poster.shamiltp.life/img?v=${version})](https://poster.shamiltp.life)`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(mdBadge).catch(() => {});
      }
      setImgPublishStatus(`Copied /img?v=${version}`);
      setTimeout(() => setImgPublishStatus(null), 4000);
    } catch {
      setImgPublishStatus('Sync failed — retry');
      setTimeout(() => setImgPublishStatus(null), 3000);
    }
  }, [activeStyle]);

  const handleDownloadPoster = useCallback(
    async (format: PosterExportFormat = 'png') => {
      try {
        const label =
          format === 'jpeg' ? 'JPG' : format === 'webp' ? 'WEBP' : 'PNG';
        setDownloadStatus(`Capturing Hi-Res ${label}...`);
        const result = await exportRenderedPoster(activeStyle, {
          format,
          scale: 2,
          quality: format === 'webp' ? 0.9 : 0.95,
        });
        setDownloadStatus(
          `Saved ${result.exportWidth}×${result.exportHeight} ${label}`
        );
        setTimeout(() => setDownloadStatus(null), 4000);
      } catch {
        setDownloadStatus('Export failed — please retry');
        setTimeout(() => setDownloadStatus(null), 3000);
      }
    },
    [activeStyle]
  );

  // [D] keyboard shortcut to download poster PNG directly
  useEffect(() => {
    const onDownloadShortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (
        (e.key === 'd' || e.key === 'D') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isStyleModalOpen &&
        !isKnowledgeModalOpen
      ) {
        e.preventDefault();
        handleDownloadPoster('png');
      }
    };
    window.addEventListener('keydown', onDownloadShortcut);
    return () => window.removeEventListener('keydown', onDownloadShortcut);
  }, [handleDownloadPoster, isStyleModalOpen, isKnowledgeModalOpen]);

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

            {/* Active Image Composition Indicator */}
            <div
              className="flex items-center justify-between text-[10px] font-mono px-2 py-1 border"
              style={{
                backgroundColor: activeStyle.bgSurface,
                borderColor: `${activeStyle.borderColor}66`,
                color: activeStyle.textSecondary,
              }}
            >
              <span className="truncate">
                {designState.illustration.imageCount === 1
                  ? `Solo: ${designState.illustration.primaryAsset.filename}`
                  : `Diptych: ${designState.illustration.primaryAsset.filename} + ${designState.illustration.secondaryAsset.filename}`}
              </span>
              <span
                className="font-semibold ml-2 shrink-0"
                style={{ color: activeStyle.accentPrimary }}
              >
                {designState.illustration.imageCount === 1 ? '1 Plate' : '2 Plates'}
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
                aria-label="Open Illustration Asset Library and Knowledge Base"
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
                <span>Assets ({allIllustrationAssets.length})</span>
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

            {/* Primary Export Actions (Pixel-Perfect Rendered Poster Capture: PNG, JPG, WEBP & /img Route Sync) */}
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDownloadPoster('png')}
                  aria-label="Download Poster PNG"
                  className="col-span-2 py-2 px-2.5 text-xs font-semibold transition-transform active:scale-98 cursor-pointer inline-flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: activeStyle.accentPrimary,
                    color: activeStyle.isDark ? '#09090B' : '#FFFFFF',
                    fontFamily: designState.typography.fontMono,
                  }}
                >
                  {downloadStatus ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="truncate">{downloadStatus}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG [D]</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPoster('webp')}
                  aria-label="Download Poster WebP"
                  className="col-span-1 py-2 px-2 text-xs font-semibold border transition-transform active:scale-98 cursor-pointer inline-flex items-center justify-center gap-1"
                  style={{
                    backgroundColor: activeStyle.bgSurface,
                    borderColor: activeStyle.accentPrimary,
                    color: activeStyle.textPrimary,
                    fontFamily: designState.typography.fontMono,
                  }}
                >
                  <span>WEBP</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPoster('jpeg')}
                  aria-label="Download Poster JPG"
                  className="col-span-1 py-2 px-2 text-xs font-semibold border transition-transform active:scale-98 cursor-pointer inline-flex items-center justify-center gap-1"
                  style={{
                    backgroundColor: activeStyle.bgSurface,
                    borderColor: activeStyle.borderColor,
                    color: activeStyle.textPrimary,
                    fontFamily: designState.typography.fontMono,
                  }}
                >
                  <span>JPG</span>
                </button>
              </div>

              {/* /img Route & GitHub Camo Versioned URL Sync */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={handlePublishImgBanner}
                  aria-label="Publish current poster to /img and copy versioned GitHub README Markdown"
                  className="col-span-2 py-1.5 px-2.5 text-[11px] font-mono border cursor-pointer inline-flex items-center justify-center gap-1.5 transition-transform active:scale-98"
                  style={{
                    backgroundColor: activeStyle.bgSurface,
                    borderColor: activeStyle.borderColor,
                    color: activeStyle.textPrimary,
                  }}
                >
                  <Check
                    className="w-3 h-3 shrink-0"
                    style={{ color: activeStyle.accentPrimary }}
                  />
                  <span className="truncate">
                    {imgPublishStatus || 'Sync /img & Copy MD'}
                  </span>
                </button>

                <a
                  href={
                    imgBannerVersion ? `/img?v=${imgBannerVersion}` : '/img'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open /img WebP endpoint"
                  className="col-span-1 py-1.5 px-2 text-[11px] font-mono border inline-flex items-center justify-center truncate"
                  style={{
                    backgroundColor: activeStyle.bgSurface,
                    borderColor: activeStyle.borderColor,
                    color: activeStyle.accentPrimary,
                  }}
                >
                  /img ↗
                </a>
              </div>
            </div>

            <div
              className="text-[10px] font-mono text-center pt-1 border-t"
              style={{
                borderColor: `${activeStyle.borderColor}66`,
                color: activeStyle.textSecondary,
              }}
            >
              Shortcuts: [Space] New · [T] Type · [L] Layout · [D] Save · [M] Menu
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

      {/* ILLUSTRATION ASSETS (39+), KNOWLEDGE BASE (.MD) & PHOTO STUDIO MODAL */}
      <KnowledgeStudioModal
        isOpen={isKnowledgeModalOpen}
        kb={kb}
        rawMarkdown={rawMarkdown}
        activeProjectIndex={designState.projectIndex}
        activePhotoIndex={designState.photoIndex}
        activeAssetId={designState.illustration.primaryAsset.id}
        allAssets={allIllustrationAssets}
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
        onSelectAsset={handleSelectAsset}
        onAddCustomPhoto={handleAddCustomPhoto}
        onAddCustomAsset={handleAddCustomAsset}
        onUpdateMarkdown={(newMd) => setRawMarkdown(newMd)}
      />
    </div>
  );
}
