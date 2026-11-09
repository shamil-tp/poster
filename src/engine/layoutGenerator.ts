import { LayoutArchetypeId } from './designStyles';
import { SynthesizedArtDirection } from './hybridGenerator';

export interface LayoutCompositionSpec {
  id: LayoutArchetypeId;
  name: string;
  subtitle: string;
  illustrationScale: 'monumental' | 'oversized-bleed' | 'balanced-sculptural' | 'collage-cutout';
  illustrationPlacement: 'center-stage' | 'left-wing' | 'right-wing' | 'full-backdrop' | 'floating-overlap';
  negativeSpaceRatio: 'high-zen' | 'balanced-editorial' | 'dense-constructivist';
}

export const LAYOUT_ARCHETYPES: LayoutCompositionSpec[] = [
  {
    id: 'magazine-cover',
    name: 'Editorial Magazine Cover',
    subtitle: 'Full-width masthead banner, central overlapping sculpture/portrait & asymmetrical cover stories',
    illustrationScale: 'oversized-bleed',
    illustrationPlacement: 'center-stage',
    negativeSpaceRatio: 'balanced-editorial',
  },
  {
    id: 'bauhaus-constructivist',
    name: 'Constructivist Color-Block Grid',
    subtitle: 'Exposed geometric grid lines, rotated vertical spine typography & primary color planes',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'right-wing',
    negativeSpaceRatio: 'dense-constructivist',
  },
  {
    id: 'diagonal-split',
    name: 'Diagonal Architectural Split',
    subtitle: 'Dynamic angled surface division contrasting kinetic headline geometry against floating artwork',
    illustrationScale: 'oversized-bleed',
    illustrationPlacement: 'left-wing',
    negativeSpaceRatio: 'balanced-editorial',
  },
  {
    id: 'circular-monument',
    name: 'Orbital Mandala & Astrolabe Axis',
    subtitle: 'Centered circular medallion artwork encircled by curved arc typography & radial corner dossiers',
    illustrationScale: 'monumental',
    illustrationPlacement: 'center-stage',
    negativeSpaceRatio: 'balanced-editorial',
  },
  {
    id: 'vertical-spine-editorial',
    name: 'Vertical Spine & Zen Negative Space',
    subtitle: 'Vertical typographic pillar, expansive contemplative negative space & poised ceramic/botanical focal piece',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'right-wing',
    negativeSpaceRatio: 'high-zen',
  },
  {
    id: 'layered-collage-zine',
    name: 'Tactile Layered Collage Zine',
    subtitle: 'Rotated paper clippings, taped Polaroid portrait specimen, handwritten annotations & stamped badges',
    illustrationScale: 'collage-cutout',
    illustrationPlacement: 'floating-overlap',
    negativeSpaceRatio: 'balanced-editorial',
  },
  {
    id: 'full-bleed-artwork',
    name: 'Full-Bleed Monumental Canvas',
    subtitle: 'Expansive procedural artwork & portrait across the viewport with floating museum-grade captions',
    illustrationScale: 'monumental',
    illustrationPlacement: 'full-backdrop',
    negativeSpaceRatio: 'high-zen',
  },
  {
    id: 'brutalist-manifesto',
    name: 'Raw Brutalist Structural Manifesto',
    subtitle: 'Stark exposed structural hairlines, colossal edge-to-edge display type & tabular ISO engineering specs',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'left-wing',
    negativeSpaceRatio: 'dense-constructivist',
  },
  {
    id: 'three-column-broadsheet',
    name: 'Classical Three-Column Broadsheet',
    subtitle: 'Symmetrical archival print columns, ornate drop-cap lead, engraved centerpiece & scholarly footnotes',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'center-stage',
    negativeSpaceRatio: 'balanced-editorial',
  },
  {
    id: 'bento-playground',
    name: 'Asymmetric Modular Bento Playground',
    subtitle: 'Interlocking tactile compartments with dedicated interactive illustration stage & kinetic typography tile',
    illustrationScale: 'balanced-sculptural',
    illustrationPlacement: 'right-wing',
    negativeSpaceRatio: 'dense-constructivist',
  },
  {
    id: 'asymmetric-avant-garde',
    name: 'Avant-Garde Offset Overlap',
    subtitle: 'Unconventional off-axis typography overlapping an oversized cropped artwork that breaks its frame',
    illustrationScale: 'oversized-bleed',
    illustrationPlacement: 'floating-overlap',
    negativeSpaceRatio: 'high-zen',
  },
  {
    id: 'split-poster-duality',
    name: '50/50 Inverted Split Poster',
    subtitle: 'High-contrast color-inverted split screen pairing a full-height visual showcase with an editorial manifesto',
    illustrationScale: 'oversized-bleed',
    illustrationPlacement: 'left-wing',
    negativeSpaceRatio: 'balanced-editorial',
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

  const preferred = artDirection.preferredLayouts;
  if (preferred && preferred.length > 0) {
    // Filter out previousLayoutId if possible so consecutive regenerations change layout structure
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
