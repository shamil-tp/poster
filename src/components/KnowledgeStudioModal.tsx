import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  FolderGit2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ParsedKnowledgeBase, PortfolioPhoto } from '../utils/knowledgeParser';
import {
  IllustrationAssetSpec,
  AssetVisualCategory,
  createExpandableAssetSpec,
} from '../engine/assetRegistry';

interface KnowledgeStudioModalProps {
  isOpen: boolean;
  kb: ParsedKnowledgeBase;
  rawMarkdown: string;
  activeProjectIndex: number;
  activePhotoIndex: number;
  activeAssetId: string;
  allAssets: IllustrationAssetSpec[];
  onClose: () => void;
  onSelectProject: (index: number) => void;
  onSelectPhoto: (index: number) => void;
  onSelectAsset: (assetId: string) => void;
  onAddCustomPhoto: (photo: PortfolioPhoto) => void;
  onAddCustomAsset: (asset: IllustrationAssetSpec) => void;
  onUpdateMarkdown: (newMd: string) => void;
}

const CATEGORY_LABELS: { id: 'all' | AssetVisualCategory; label: string }[] = [
  { id: 'all', label: 'All Assets' },
  { id: 'bauhaus-geometric', label: 'Bauhaus & Geometric' },
  { id: 'ukiyo-zen-botanical', label: 'Ukiyo-e, Zen & Botanical' },
  { id: 'pop-street-character', label: 'Pop, Street & Character' },
  { id: 'noir-gothic-sketch', label: 'Noir, Gothic & Sketch' },
  { id: 'architectural-scenic', label: 'Architectural & Scenic' },
];

export const KnowledgeStudioModal: React.FC<KnowledgeStudioModalProps> = ({
  isOpen,
  kb,
  rawMarkdown,
  activeProjectIndex,
  activePhotoIndex,
  activeAssetId,
  allAssets,
  onClose,
  onSelectProject,
  onSelectPhoto,
  onSelectAsset,
  onAddCustomPhoto,
  onAddCustomAsset,
  onUpdateMarkdown,
}) => {
  const [activeTab, setActiveTab] = useState<
    'assets' | 'dossiers' | 'photos' | 'markdown'
  >('assets');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<
    'all' | AssetVisualCategory
  >('all');
  const [newAssetTitle, setNewAssetTitle] = useState('');
  const [newAssetCategory, setNewAssetCategory] =
    useState<AssetVisualCategory>('bauhaus-geometric');

  const [photoCaption, setPhotoCaption] = useState('');
  const [photoMood, setPhotoMood] = useState('Editorial Portrait');
  const [mdDraft, setMdDraft] = useState(rawMarkdown);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredAssets =
    assetCategoryFilter === 'all'
      ? allAssets
      : allAssets.filter((a) => a.visualCategory === assetCategoryFilter);

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        const imgEl = new Image();
        imgEl.onload = () => {
          const spec = createExpandableAssetSpec({
            url: dataUrl,
            filename: file.name,
            title: newAssetTitle.trim() || undefined,
            visualCategory: newAssetCategory,
            width: imgEl.naturalWidth || 1024,
            height: imgEl.naturalHeight || 1365,
          });
          onAddCustomAsset(spec);
          setNewAssetTitle('');
          setStatusMessage(
            `Registered "${spec.title}" (${spec.width}×${spec.height}) into the Illustration Asset Engine and applied to poster.`
          );
        };
        imgEl.onerror = () => {
          const spec = createExpandableAssetSpec({
            url: dataUrl,
            filename: file.name,
            title: newAssetTitle.trim() || undefined,
            visualCategory: newAssetCategory,
          });
          onAddCustomAsset(spec);
          setNewAssetTitle('');
          setStatusMessage(
            `Registered "${spec.title}" into the Illustration Asset Engine.`
          );
        };
        imgEl.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newPhoto: PortfolioPhoto = {
          id: `custom-${Date.now()}`,
          url: reader.result,
          caption:
            photoCaption.trim() ||
            `Shamil TP · ${file.name.replace(/\.[^.]+$/, '')}`,
          mood: photoMood.trim() || 'Custom Uploaded Portrait',
          aspectHint: 'portrait',
        };
        onAddCustomPhoto(newPhoto);
        setPhotoCaption('');
        setStatusMessage(
          'New photo added to poster rotation and applied to active poster.'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMdDraft(reader.result);
        onUpdateMarkdown(reader.result);
        setStatusMessage(`Parsed updated markdown file: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Illustration Asset Library, Dossiers and Knowledge Base Studio"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[88vh] flex flex-col bg-zinc-950 text-zinc-100 border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Illustration Asset Library ({allAssets.length}) · Knowledge Base (.md) & Portraits
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {allAssets.length} Categorized Illustration Assets · 12 Verified Project Dossiers ·{' '}
              {kb.photos.length} Portrait Photos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Knowledge Base Modal"
            className="p-2 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-zinc-900/60 border-b border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Illustration Assets ({allAssets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dossiers')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'dossiers'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>12 Project Dossiers</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Portrait Photos ({kb.photos.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('markdown')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'markdown'
                ? 'bg-zinc-100 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw .md Knowledge Source</span>
          </button>
        </div>

        {statusMessage && (
          <div className="px-6 py-2.5 bg-emerald-950/60 border-b border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-emerald-400 hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'assets' && (
            <div className="space-y-5">
              {/* Expandable Asset Registration Box */}
              <div className="p-4 border border-zinc-800 bg-zinc-900/40 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
                <div className="flex-1 space-y-2 w-full">
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Expandable Illustration Library (/public/assets/aistudio/) — Register New Asset
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="asset-title-input"
                        className="block text-[11px] text-zinc-400 mb-1"
                      >
                        Artwork Title (optional)
                      </label>
                      <input
                        id="asset-title-input"
                        type="text"
                        value={newAssetTitle}
                        onChange={(e) => setNewAssetTitle(e.target.value)}
                        placeholder="e.g. Constructivist Kinetic Totem"
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="asset-category-select"
                        className="block text-[11px] text-zinc-400 mb-1"
                      >
                        Style Compatibility Category
                      </label>
                      <select
                        id="asset-category-select"
                        value={newAssetCategory}
                        onChange={(e) =>
                          setNewAssetCategory(
                            e.target.value as AssetVisualCategory
                          )
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      >
                        <option value="bauhaus-geometric">
                          Bauhaus & Geometric
                        </option>
                        <option value="ukiyo-zen-botanical">
                          Ukiyo-e, Zen & Botanical
                        </option>
                        <option value="pop-street-character">
                          Pop, Street & Character
                        </option>
                        <option value="noir-gothic-sketch">
                          Noir, Gothic & Sketch
                        </option>
                        <option value="architectural-scenic">
                          Architectural & Scenic
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Illustration Asset</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAssetUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Category Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                <div className="flex flex-wrap items-center gap-1.5">
                  {CATEGORY_LABELS.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAssetCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 text-xs font-mono border transition-colors cursor-pointer ${
                        assetCategoryFilter === cat.id
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  Showing {filteredAssets.length} of {allAssets.length} assets
                </span>
              </div>

              {/* 39+ Illustration Assets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredAssets.map((asset) => {
                  const isActive = asset.id === activeAssetId;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        onSelectAsset(asset.id);
                        onClose();
                      }}
                      className={`text-left border overflow-hidden transition-all cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? 'border-amber-400 bg-zinc-900'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
                      }`}
                    >
                      <div className="h-44 w-full bg-zinc-900 overflow-hidden relative flex items-center justify-center p-2">
                        <img
                          src={asset.url}
                          alt={asset.title}
                          loading="lazy"
                          className="max-w-full max-h-full object-contain"
                        />
                        <span className="absolute top-2 left-2 bg-black/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-200 border border-white/15">
                          {asset.filename}
                        </span>
                        {isActive && (
                          <span className="absolute top-2 right-2 bg-amber-400 text-zinc-950 px-1.5 py-0.5 text-[10px] font-mono font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 border-t border-zinc-800/80">
                        <div className="text-[10px] font-mono text-amber-400 truncate">
                          {asset.visualCategory} · {asset.width}×{asset.height}
                        </div>
                        <div className="text-xs font-bold text-zinc-100 mt-0.5 truncate">
                          {asset.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {asset.subject}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'dossiers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kb.projects.map((proj, idx) => {
                const isCurrent = idx === activeProjectIndex % kb.projects.length;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => {
                      onSelectProject(idx);
                      onClose();
                    }}
                    className={`text-left p-4 border transition-colors cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'border-amber-400 bg-zinc-900'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-1">
                        <span>
                          {proj.index}. {proj.category}
                        </span>
                        {isCurrent && <span>Active on Poster</span>}
                      </div>
                      <div className="text-sm font-bold text-zinc-100">
                        {proj.name}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {proj.ownership}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-500 truncate">
                      {proj.techStack.join(' · ')}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Upload New Photo Box */}
              <div className="p-4 border border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="flex-1 space-y-2 w-full">
                  <div className="text-xs font-semibold text-zinc-200">
                    Upload New Portrait Photo to Poster Pool
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="photo-caption-input"
                        className="block text-[11px] text-zinc-400 mb-1"
                      >
                        Photo Caption
                      </label>
                      <input
                        id="photo-caption-input"
                        type="text"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="e.g. Shamil TP · Conference Keynote"
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="photo-mood-input"
                        className="block text-[11px] text-zinc-400 mb-1"
                      >
                        Photo Mood Tag
                      </label>
                      <input
                        id="photo-mood-input"
                        type="text"
                        value={photoMood}
                        onChange={(e) => setPhotoMood(e.target.value)}
                        placeholder="e.g. Editorial Monograph"
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                </div>

                <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {kb.photos.map((photo, idx) => {
                  const isCurrent = idx === activePhotoIndex % kb.photos.length;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => {
                        onSelectPhoto(idx);
                        onClose();
                      }}
                      className={`text-left border overflow-hidden transition-all cursor-pointer flex flex-col ${
                        isCurrent
                          ? 'border-amber-400 bg-zinc-900'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
                      }`}
                    >
                      <div className="h-48 w-full bg-zinc-900 overflow-hidden relative">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-mono text-amber-400">
                          {photo.mood} {isCurrent ? '· Active' : ''}
                        </div>
                        <div className="text-xs font-bold text-zinc-100 mt-0.5 truncate">
                          {photo.caption}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'markdown' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-zinc-400">
                  Synced with{' '}
                  <code className="text-zinc-200">
                    /assets/aistudio/SHAMIL_TP_PORTFOLIO_KNOWLEDGE_BASE_a54d24ce.md
                  </code>
                  . Edit below or upload an updated{' '}
                  <code className="text-zinc-200">.md</code> file to re-parse
                  identity fields live.
                </p>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-700 text-zinc-200 hover:bg-zinc-800 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Load .md File</span>
                    <input
                      type="file"
                      accept=".md,.txt"
                      onChange={handleMdFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateMarkdown(mdDraft);
                      setStatusMessage(
                        'Markdown knowledge base re-parsed and applied to poster.'
                      );
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-amber-500 text-zinc-950 hover:bg-amber-400 cursor-pointer"
                  >
                    Apply .md Updates
                  </button>
                </div>
              </div>
              <textarea
                value={mdDraft}
                onChange={(e) => setMdDraft(e.target.value)}
                aria-label="Raw Markdown Knowledge Base Editor"
                rows={14}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
