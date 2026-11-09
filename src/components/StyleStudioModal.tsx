import React, { useState } from 'react';
import { X, Shuffle, Sparkles, Check, Search } from 'lucide-react';
import {
  DESIGN_STYLES_50,
  DesignStyleSpec,
  GeneratedPosterStyle,
} from '../utils/posterStyles';

interface StyleStudioModalProps {
  isOpen: boolean;
  activeStyle: GeneratedPosterStyle;
  seenCount: number;
  onClose: () => void;
  onSelectPureStyle: (styleId: number) => void;
  onSynthesizeHybrid: (styleAId: number, styleBId: number) => void;
  onRandomizeHybrid: () => void;
}

export const StyleStudioModal: React.FC<StyleStudioModalProps> = ({
  isOpen,
  activeStyle,
  seenCount,
  onClose,
  onSelectPureStyle,
  onSynthesizeHybrid,
  onRandomizeHybrid,
}) => {
  const [filterText, setFilterText] = useState('');
  const [styleAId, setStyleAId] = useState<number>(
    activeStyle.parentStyles[0]?.id || 17
  );
  const [styleBId, setStyleBId] = useState<number>(
    activeStyle.parentStyles[1]?.id || 24
  );

  if (!isOpen) return null;

  const filteredStyles = DESIGN_STYLES_50.filter((s) => {
    const q = filterText.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      String(s.id) === q ||
      s.mood.toLowerCase().includes(q) ||
      s.coreElements.some((el) => el.toLowerCase().includes(q))
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="50 Design Styles and Hybrid Synthesizer Studio"
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
              50 Design Styles & Hybrid Combinator Studio
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {seenCount} unique non-repeating poster editions generated in this session · Active:{' '}
              <span className="text-zinc-200 font-semibold">{activeStyle.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Style Studio"
            className="p-2 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hybrid Synthesizer Bar */}
        <div className="px-6 py-4 bg-zinc-900/70 border-b border-zinc-800 shrink-0 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div>
              <label
                htmlFor="hybrid-style-a"
                className="block text-[11px] font-mono text-zinc-400 mb-1"
              >
                Primary Palette & Motif (Style A)
              </label>
              <select
                id="hybrid-style-a"
                value={styleAId}
                onChange={(e) => setStyleAId(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 px-3 py-2 focus:outline-none focus:border-zinc-400"
              >
                {DESIGN_STYLES_50.map((s) => (
                  <option key={s.id} value={s.id}>
                    {String(s.id).padStart(2, '0')}. {s.name} ({s.mood.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-sm font-mono text-zinc-500 pt-4">×</span>

            <div>
              <label
                htmlFor="hybrid-style-b"
                className="block text-[11px] font-mono text-zinc-400 mb-1"
              >
                Typography, Layout & Micro-FX (Style B)
              </label>
              <select
                id="hybrid-style-b"
                value={styleBId}
                onChange={(e) => setStyleBId(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 px-3 py-2 focus:outline-none focus:border-zinc-400"
              >
                {DESIGN_STYLES_50.map((s) => (
                  <option key={s.id} value={s.id}>
                    {String(s.id).padStart(2, '0')}. {s.name} ({s.layoutVariant})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                onSynthesizeHybrid(styleAId, styleBId);
                onClose();
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesize Hybrid Poster</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onRandomizeHybrid();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Hybrid Combo</span>
          </button>
        </div>

        {/* Search Input for 50 Styles */}
        <div className="px-6 py-3 border-b border-zinc-800 shrink-0 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter 50 design styles by name, mood, or element (e.g. Bauhaus, gold, grid)..."
              aria-label="Filter 50 design styles"
              className="w-full bg-zinc-900 border border-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>
          <span className="text-xs font-mono text-zinc-400 tabular-nums">
            Showing {filteredStyles.length} of 50 Styles
          </span>
        </div>

        {/* Grid of 50 Styles */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStyles.map((s: DesignStyleSpec) => {
            const isSelected =
              !activeStyle.isHybrid && activeStyle.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSelectPureStyle(s.id);
                  onClose();
                }}
                className={`text-left p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-zinc-900'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono text-zinc-400 tabular-nums">
                      #{String(s.id).padStart(2, '0')} · {s.mood.split(',')[0]}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 border border-white/20"
                        style={{ backgroundColor: s.bgCanvas }}
                        title={`Canvas: ${s.bgCanvas}`}
                      />
                      <span
                        className="w-3 h-3 border border-white/20"
                        style={{ backgroundColor: s.accentPrimary }}
                        title={`Accent: ${s.accentPrimary}`}
                      />
                      <span
                        className="w-3 h-3 border border-white/20"
                        style={{ backgroundColor: s.accentSecondary }}
                        title={`Secondary: ${s.accentSecondary}`}
                      />
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-400 ml-1" />
                      )}
                    </div>
                  </div>
                  <div
                    className="text-sm font-bold text-zinc-100"
                    style={{ fontFamily: s.fontDisplay }}
                  >
                    {s.name}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {s.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-500 truncate">
                  {s.coreElements.slice(0, 3).join(' · ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
