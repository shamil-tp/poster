import { LayoutArchetypeId } from './designStyles';
import { SynthesizedArtDirection } from './hybridGenerator';

export interface LayoutCompositionSpec {
  id: LayoutArchetypeId;
  name: string;
  subtitle: string;
  illustrationScale: 'monumental' | 'oversized-bleed' | 'balanced-sculptural' | 'collage-cutout';
  illustrationPlacement: 'center-stage' | 'left-wing' | 'right-wing' | 'full-backdrop' | 'floating-overlap';
  negativeSpaceRatio: 'high-zen' | 'balanced-editorial' | 'dense-constructivist';
  densityMode?: 'ultra-minimal' | 'curated-editorial' | 'maximalist-manifesto';
  outerFrameMode?: 'full-bleed-borderless' | 'inset-gallery-mat' | 'double-archival-border' | 'asymmetric-accent-bar';
  surfaceTexture?: 'clean-matte' | 'fine-dot-matrix' | 'architectural-grid' | 'diagonal-print-grain';
}

export const LAYOUT_ARCHETYPES: LayoutCompositionSpec[] = [
  {
    id: 'magazine-cover',
    name: 'Editorial Magazine Cover',
    subtitle: 'Full-width masthead banner, central overlapping sculpture/portrait & asymmetrical cover stories',
    illustrationScale: 'oversized-bleed',
    illustrationPlacement: 'center-stage',
    negativeSpaceRatio: 'balanced-editorial',
    densityMode: 'curated-editorial',
    outerFrameMode: 'inset-gallery-mat',
    surfaceTexture: 'clean-matte',
  },
  {
    id: 'bauhaus-constructivist',
    name: 'Constructivist Color-Block Grid',
    subtitle: 'Exposed geometric color planes, rotated vertical spine typography & primary structural blocks',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'right-wing',
    negativeSpaceRatio: 'dense-constructivist',
    densityMode: 'maximalist-manifesto',
    outerFrameMode: 'full-bleed-borderless',
    surfaceTexture: 'architectural-grid',
  },
  {
    id: 'diagonal-split',
    name: 'Diagonal Architectural Split',
    subtitle: 'Dynamic angled surface division contrasting kinetic headline geometry against floating artwork',
    illustrationScale: 'oversized-bleed',
    illustrationPlacement: 'left-wing',
    negativeSpaceRatio: 'balanced-editorial',
    densityMode: 'curated-editorial',
    outerFrameMode: 'full-bleed-borderless',
    surfaceTexture: 'diagonal-print-grain',
  },
  {
    id: 'circular-monument',
    name: 'Orbital Mandala & Astrolabe Axis',
    subtitle: 'Centered circular medallion artwork encircled by orbital rings & radial corner inscriptions',
    illustrationScale: 'monumental',
    illustrationPlacement: 'center-stage',
    negativeSpaceRatio: 'balanced-editorial',
    densityMode: 'curated-editorial',
    outerFrameMode: 'double-archival-border',
    surfaceTexture: 'fine-dot-matrix',
  },
  {
    id: 'vertical-spine-editorial',
    name: 'Minimalist Zen Exhibition Print',
    subtitle: 'Expansive contemplative negative space, poised focal artwork & whisper-quiet museum typography',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'right-wing',
    negativeSpaceRatio: 'high-zen',
    densityMode: 'ultra-minimal',
    outerFrameMode: 'full-bleed-borderless',
    surfaceTexture: 'clean-matte',
  },
  {
    id: 'layered-collage-zine',
    name: 'Tactile Cut-and-Paste Zine Collage',
    subtitle: 'Rotated paper clippings, taped Polaroid portrait specimen, rubber stamp seal & raw cutouts',
    illustrationScale: 'collage-cutout',
    illustrationPlacement: 'floating-overlap',
    negativeSpaceRatio: 'balanced-editorial',
    densityMode: 'maximalist-manifesto',
    outerFrameMode: 'inset-gallery-mat',
    surfaceTexture: 'diagonal-print-grain',
  },
  {
    id: 'full-bleed-artwork',
    name: 'Cinema Monolith & Billing Block',
    subtitle: 'Monumental visual centerpiece with dramatic cinema-poster billing typography & floating title',
    illustrationScale: 'monumental',
    illustrationPlacement: 'full-backdrop',
    negativeSpaceRatio: 'high-zen',
    densityMode: 'ultra-minimal',
    outerFrameMode: 'full-bleed-borderless',
    surfaceTexture: 'clean-matte',
  },
  {
    id: 'brutalist-manifesto',
    name: 'Colossal Swiss Typographic Poster',
    subtitle: 'Wall-to-wall oversized display typography, giant project index numerals & stark structural rules',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'left-wing',
    negativeSpaceRatio: 'dense-constructivist',
    densityMode: 'maximalist-manifesto',
    outerFrameMode: 'asymmetric-accent-bar',
    surfaceTexture: 'architectural-grid',
  },
  {
    id: 'three-column-broadsheet',
    name: 'Classical Archival Broadsheet',
    subtitle: 'Symmetrical archival print columns, ornate drop-cap lead, engraved figure plate & footnotes',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'center-stage',
    negativeSpaceRatio: 'balanced-editorial',
    densityMode: 'maximalist-manifesto',
    outerFrameMode: 'double-archival-border',
    surfaceTexture: 'clean-matte',
  },
  {
    id: 'bento-playground',
    name: 'Industrial Systems Specimen Sheet',
    subtitle: 'Large-scale telemetry metrics, architectural schematic plate & modular technical breakdown',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'right-wing',
    negativeSpaceRatio: 'dense-constructivist',
    densityMode: 'maximalist-manifesto',
    outerFrameMode: 'inset-gallery-mat',
    surfaceTexture: 'fine-dot-matrix',
  },
  {
    id: 'asymmetric-avant-garde',
    name: 'Deconstructed Off-Grid Overlap',
    subtitle: 'Unconventional off-axis typography overlapping an oversized cropped artwork that breaks its frame',
    illustrationScale: 'oversized-bleed',
    illustrationPlacement: 'floating-overlap',
    negativeSpaceRatio: 'high-zen',
    densityMode: 'ultra-minimal',
    outerFrameMode: 'full-bleed-borderless',
    surfaceTexture: 'diagonal-print-grain',
  },
  {
    id: 'split-poster-duality',
    name: '50/50 Color-Inverted Diptych',
    subtitle: 'High-contrast color-inverted split screen pairing a full-height visual showcase with an editorial thesis',
    illustrationScale: 'oversized-bleed',
    illustrationPlacement: 'left-wing',
    negativeSpaceRatio: 'balanced-editorial',
    densityMode: 'curated-editorial',
    outerFrameMode: 'full-bleed-borderless',
    surfaceTexture: 'clean-matte',
  },
];

export function generateLayoutConfig(
  artDirection: SynthesizedArtDirection,
  rng: () => number,
  overrideIndex?: number,
  previousLayoutId?: LayoutArchetypeId
): LayoutCompositionSpec {
  if (overrideIndex !== undefined && overrideIndex > 0) {
    return LAYOUT_ARCHETYPES[overrideIndex % LAYOUT_ARCHETYPES.length];
  }

  // Draw across the full 12-paradigm spectrum (with a slight weight toward preferred layouts,
  // but 65% open across all 12 paradigms so consecutive regenerations explore radically different structures)
  const useFullSpectrum = rng() < 0.65;
  const preferred = artDirection.preferredLayouts;

  if (!useFullSpectrum && preferred && preferred.length > 0) {
    const candidates = preferred.filter((id) => id !== previousLayoutId);
    const chosenId =
      candidates.length > 0
        ? candidates[Math.floor(rng() * candidates.length)]
        : preferred[Math.floor(rng() * preferred.length)];
    const found = LAYOUT_ARCHETYPES.find((l) => l.id === chosenId);
    if (found) return found;
  }

  const fallbackCandidates = LAYOUT_ARCHETYPES.filter(
    (l) => l.id !== previousLayoutId
  );
  return fallbackCandidates[
    Math.floor(rng() * fallbackCandidates.length)
  ];
}
