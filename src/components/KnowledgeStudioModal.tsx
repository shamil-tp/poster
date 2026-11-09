import React, { useState } from 'react';
import { X, Upload, FileText, FolderGit2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { ParsedKnowledgeBase, PortfolioPhoto } from '../utils/knowledgeParser';

interface KnowledgeStudioModalProps {
  isOpen: boolean;
  kb: ParsedKnowledgeBase;
  rawMarkdown: string;
  activeProjectIndex: number;
  activePhotoIndex: number;
  onClose: () => void;
  onSelectProject: (index: number) => void;
  onSelectPhoto: (index: number) => void;
  onAddCustomPhoto: (photo: PortfolioPhoto) => void;
  onUpdateMarkdown: (newMd: string) => void;
}

export const KnowledgeStudioModal: React.FC<KnowledgeStudioModalProps> = ({
  isOpen,
  kb,
  rawMarkdown,
  activeProjectIndex,
  activePhotoIndex,
  onClose,
  onSelectProject,
  onSelectPhoto,
  onAddCustomPhoto,
  onUpdateMarkdown,
}) => {
  const [activeTab, setActiveTab] = useState<'dossiers' | 'photos' | 'markdown'>('dossiers');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoMood, setPhotoMood] = useState('Editorial Portrait');
  const [mdDraft, setMdDraft] = useState(rawMarkdown);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newPhoto: PortfolioPhoto = {
          id: `custom-${Date.now()}`,
          url: reader.result,
          caption: photoCaption.trim() || `Shamil TP · ${file.name.replace(/\.[^.]+$/, '')}`,
          mood: photoMood.trim() || 'Custom Uploaded Portrait',
          aspectHint: 'portrait',
        };
        onAddCustomPhoto(newPhoto);
        setPhotoCaption('');
        setStatusMessage('New photo added to poster rotation and applied to active poster.');
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
      aria-label="Knowledge Base Dossiers and Photo Studio"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[86vh] flex flex-col bg-zinc-950 text-zinc-100 border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Portfolio Knowledge Base (.md) & Photo Pool
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              12 Verified Project Dossiers · {kb.photos.length} Active Portrait Photos · Real-time Markdown Parser
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
        <div className="flex items-center gap-2 px-6 py-3 bg-zinc-900/60 border-b border-zinc-800 shrink-0">
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
                  Synced with <code className="text-zinc-200">/assets/aistudio/SHAMIL_TP_PORTFOLIO_KNOWLEDGE_BASE_a54d24ce.md</code>. Edit below or upload an updated <code className="text-zinc-200">.md</code> file to re-parse identity fields live.
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
                      setStatusMessage('Markdown knowledge base re-parsed and applied to poster.');
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
