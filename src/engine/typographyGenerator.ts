import { SynthesizedArtDirection } from './hybridGenerator';

export type HeadlineTreatment =
  | 'oversized-editorial'
  | 'split-outline-solid'
  | 'layered-echo-shadow'
  | 'rotated-constructivist'
  | 'curved-svg-arc'
  | 'gradient-iridescent'
  | 'staggered-kinetic-words'
  | 'drop-cap-monograph';

export type InteractiveTypeMode =
  | 'hover-letter-spread'
  | 'cursor-weight-wave'
  | 'word-tilt-shift'
  | 'outline-fill-invert'
  | 'chromatic-echo-split';

export interface TypographyConfig {
  id: string;
  pairingName: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
  headlineTreatment: HeadlineTreatment;
  interactiveMode: InteractiveTypeMode;
  interactiveLabel: string;
  letterSpacing: string;
  lineHeight: number;
  uppercaseHeadline: boolean;
  decorativeDropCap: boolean;
}

export const CURATED_FONT_PAIRINGS: {
  id: string;
  name: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
}[] = [
  {
    id: 'neoclassical-cinzel',
    name: 'Cinzel × Cormorant Garamond',
    fontDisplay: "'Cinzel', Georgia, serif",
    fontBody: "'Cormorant Garamond', Georgia, serif",
    fontMono: "'JetBrains Mono', monospace",
  },
  {
    id: 'baroque-bodoni',
    name: 'Bodoni Moda × Playfair Display',
    fontDisplay: "'Bodoni Moda', Georgia, serif",
    fontBody: "'Lora', Georgia, serif",
    fontMono: "'IBM Plex Mono', monospace",
  },
  {
    id: 'aurora-grotesk',
    name: 'Space Grotesk × Outfit',
    fontDisplay: "'Space Grotesk', sans-serif",
    fontBody: "'Outfit', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
  },
  {
    id: 'ethereal-dmserif',
    name: 'DM Serif Display × Cormorant',
    fontDisplay: "'DM Serif Display', Georgia, serif",
    fontBody: "'Cormorant Garamond', Georgia, serif",
    fontMono: "'Space Mono', monospace",
  },
  {
    id: 'filigree-decorative',
    name: 'Cinzel Decorative × EB Garamond',
    fontDisplay: "'Cinzel Decorative', Georgia, serif",
    fontBody: "'EB Garamond', Georgia, serif",
    fontMono: "'JetBrains Mono', monospace",
  },
  {
    id: 'memphis-archivo',
    name: 'Archivo Black × Fredoka',
    fontDisplay: "'Archivo Black', sans-serif",
    fontBody: "'Fredoka', sans-serif",
    fontMono: "'Space Mono', monospace",
  },
  {
    id: 'victorian-fell',
    name: 'IM Fell English × Libre Baskerville',
    fontDisplay: "'IM Fell English', Georgia, serif",
    fontBody: "'Libre Baskerville', Georgia, serif",
    fontMono: "'IBM Plex Mono', monospace",
  },
  {
    id: 'artdeco-poiret',
    name: 'Poiret One × Josefin Sans',
    fontDisplay: "'Poiret One', sans-serif",
    fontBody: "'Josefin Sans', sans-serif",
    fontMono: "'Space Mono', monospace",
  },
  {
    id: 'y2k-orbitron',
    name: 'Orbitron × Audiowide',
    fontDisplay: "'Orbitron', sans-serif",
    fontBody: "'Space Grotesk', sans-serif",
    fontMono: "'Share Tech Mono', monospace",
  },
  {
    id: 'bauhaus-montserrat',
    name: 'Montserrat Black × DM Sans',
    fontDisplay: "'Montserrat', sans-serif",
    fontBody: "'DM Sans', sans-serif",
    fontMono: "'IBM Plex Mono', monospace",
  },
  {
    id: 'brutalist-mono',
    name: 'Anton × IBM Plex Mono',
    fontDisplay: "'Anton', sans-serif",
    fontBody: "'IBM Plex Mono', monospace",
    fontMono: "'Space Mono', monospace",
  },
  {
    id: 'cybercore-oxanium',
    name: 'Oxanium × Share Tech Mono',
    fontDisplay: "'Oxanium', sans-serif",
    fontBody: "'Share Tech Mono', monospace",
    fontMono: "'Share Tech Mono', monospace",
  },
  {
    id: 'synthwave-michroma',
    name: 'Michroma × Orbitron',
    fontDisplay: "'Michroma', sans-serif",
    fontBody: "'Space Grotesk', sans-serif",
    fontMono: "'Share Tech Mono', monospace",
  },
  {
    id: 'popart-bangers',
    name: 'Bangers × Anton',
    fontDisplay: "'Bangers', cursive",
    fontBody: "'Space Grotesk', sans-serif",
    fontMono: "'Space Mono', monospace",
  },
  {
    id: 'gothic-unifraktur',
    name: 'UnifrakturMaguntia × Cormorant',
    fontDisplay: "'UnifrakturMaguntia', Georgia, serif",
    fontBody: "'Cormorant Garamond', Georgia, serif",
    fontMono: "'IBM Plex Mono', monospace",
  },
  {
    id: 'steampunk-elite',
    name: 'Special Elite × IM Fell English',
    fontDisplay: "'Special Elite', serif",
    fontBody: "'Libre Baskerville', serif",
    fontMono: "'IBM Plex Mono', monospace",
  },
  {
    id: 'kawaii-baloo',
    name: 'Baloo 2 × Nunito',
    fontDisplay: "'Baloo 2', sans-serif",
    fontBody: "'Nunito', sans-serif",
    fontMono: "'Space Mono', monospace",
  },
  {
    id: 'coquette-vibes',
    name: 'Bodoni Moda × Great Vibes',
    fontDisplay: "'Bodoni Moda', Georgia, serif",
    fontBody: "'Lora', Georgia, serif",
    fontMono: "'JetBrains Mono', monospace",
  },
  {
    id: 'scrapbook-caveat',
    name: 'Caveat × Permanent Marker',
    fontDisplay: "'Caveat', cursive",
    fontBody: "'DM Sans', sans-serif",
    fontMono: "'Space Mono', monospace",
  },
  {
    id: 'swiss-antonio',
    name: 'Antonio × Bricolage Grotesque',
    fontDisplay: "'Antonio', sans-serif",
    fontBody: "'Bricolage Grotesque', sans-serif",
    fontMono: "'IBM Plex Mono', monospace",
  },
];

const HEADLINE_TREATMENTS: HeadlineTreatment[] = [
  'oversized-editorial',
  'split-outline-solid',
  'layered-echo-shadow',
  'rotated-constructivist',
  'curved-svg-arc',
  'gradient-iridescent',
  'staggered-kinetic-words',
  'drop-cap-monograph',
];

const INTERACTIVE_MODES: { mode: InteractiveTypeMode; label: string }[] = [
  { mode: 'hover-letter-spread', label: 'Kinetic Tracking Expansion' },
  { mode: 'cursor-weight-wave', label: 'Cursor-Reactive Character Wave' },
  { mode: 'word-tilt-shift', label: 'Asymmetric Word Tilt & Scale' },
  { mode: 'outline-fill-invert', label: 'Hollow Stroke / Solid Invert' },
  { mode: 'chromatic-echo-split', label: 'Layered Chromatic Offset Echo' },
];

export function generateTypographyConfig(
  artDirection: SynthesizedArtDirection,
  rng: () => number,
  overrideIndex?: number
): TypographyConfig {
  // If overrideIndex is provided (user pressed T / Randomize Typography), pick a distinct font pairing
  if (overrideIndex !== undefined && overrideIndex > 0) {
    const pairing =
      CURATED_FONT_PAIRINGS[overrideIndex % CURATED_FONT_PAIRINGS.length];
    const treatment =
      HEADLINE_TREATMENTS[(overrideIndex * 3) % HEADLINE_TREATMENTS.length];
    const interactive =
      INTERACTIVE_MODES[(overrideIndex * 2) % INTERACTIVE_MODES.length];

    return {
      id: `type-custom-${overrideIndex}-${pairing.id}`,
      pairingName: pairing.name,
      fontDisplay: pairing.fontDisplay,
      fontBody: pairing.fontBody,
      fontMono: pairing.fontMono,
      headlineTreatment: treatment,
      interactiveMode: interactive.mode,
      interactiveLabel: interactive.label,
      letterSpacing: treatment === 'oversized-editorial' ? '-0.03em' : '0.02em',
      lineHeight: 0.96,
      uppercaseHeadline: overrideIndex % 2 === 0,
      decorativeDropCap: treatment === 'drop-cap-monograph' || overrideIndex % 3 === 0,
    };
  }

  // Choose treatment matching the style's character
  let treatment: HeadlineTreatment = 'oversized-editorial';
  if (
    artDirection.illustrationCategory === 'classical-sculpture' ||
    artDirection.illustrationCategory === 'ornate-engraving'
  ) {
    treatment = rng() < 0.45 ? 'drop-cap-monograph' : 'curved-svg-arc';
  } else if (
    artDirection.illustrationCategory === 'geometric-construct' ||
    artDirection.slug.includes('bauhaus') ||
    artDirection.slug.includes('brutal')
  ) {
    treatment = rng() < 0.5 ? 'split-outline-solid' : 'rotated-constructivist';
  } else if (
    artDirection.illustrationCategory === 'fluid-atmospheric' ||
    artDirection.illustrationCategory === 'glass-3d' ||
    artDirection.illustrationCategory === 'synth-horizon'
  ) {
    treatment = rng() < 0.55 ? 'gradient-iridescent' : 'layered-echo-shadow';
  } else if (artDirection.illustrationCategory === 'collage-scrapbook') {
    treatment = 'staggered-kinetic-words';
  } else {
    treatment =
      HEADLINE_TREATMENTS[Math.floor(rng() * HEADLINE_TREATMENTS.length)];
  }

  const interactive =
    INTERACTIVE_MODES[Math.floor(rng() * INTERACTIVE_MODES.length)];

  const cleanDisplayName = artDirection.fontDisplay
    .split(',')[0]
    .replace(/'/g, '')
    .trim();
  const cleanBodyName = artDirection.fontBody
    .split(',')[0]
    .replace(/'/g, '')
    .trim();

  return {
    id: `type-native-${artDirection.signatureId}-${treatment}`,
    pairingName: `${cleanDisplayName} × ${cleanBodyName}`,
    fontDisplay: artDirection.fontDisplay,
    fontBody: artDirection.fontBody,
    fontMono: artDirection.fontMono,
    headlineTreatment: treatment,
    interactiveMode: interactive.mode,
    interactiveLabel: interactive.label,
    letterSpacing:
      cleanDisplayName.includes('Poiret') || cleanDisplayName.includes('Cinzel')
        ? '0.06em'
        : '-0.02em',
    lineHeight: 0.95,
    uppercaseHeadline:
      cleanDisplayName.includes('Cinzel') ||
      cleanDisplayName.includes('Anton') ||
      cleanDisplayName.includes('Orbitron') ||
      cleanDisplayName.includes('Michroma'),
    decorativeDropCap:
      treatment === 'drop-cap-monograph' ||
      artDirection.illustrationCategory === 'ornate-engraving',
  };
}
