import {
  ENRICHED_STYLES_50,
  EnrichedStyleSpec,
  getEnrichedStyleById,
  GeneratedPosterStyle,
  MotionPersonality,
  LayoutArchetypeId,
} from './designStyles';

export interface SynthesizedArtDirection extends GeneratedPosterStyle {
  illustrationSubject: string;
  secondaryIllustrationSubject?: string;
  illustrationCategory: EnrichedStyleSpec['illustrationCategory'];
  preferredLayouts: LayoutArchetypeId[];
  motionPersonality: MotionPersonality;
  harmonyNote: string;
}

export const CURATED_HYBRID_PAIRS: [number, number, string][] = [
  [17, 10, 'Geometric 1920s brass symmetry meets bespoke high-fashion serif monograph authority.'],
  [11, 44, 'Nordic-Japanese architectural calm fused with Kintsugi stoneware organic imperfection.'],
  [24, 23, 'High-density underground phosphor schematics locked inside raw brutalist concrete grids.'],
  [26, 37, 'Classical marble nostalgia drifting through dreamlike Magritte surrealist portals.'],
  [16, 42, '19th-century gilded copperplate engraving illuminated by candlelit scholarly mysticism.'],
  [12, 27, 'Milanese geometric terrazzo rebellion amplified by silkscreen Ben-Day halftone pop punch.'],
  [3, 48, 'Flowing boreal iridescent light ribbons refracted through multi-layered frosted optical glass.'],
  [18, 4, 'Sinuous botanical whiplash arches suspended in weightless morning mist and celestial light.'],
  [34, 16, 'Interlocking Victorian brass chronometer escapements inside ornate historical broadsheet frames.'],
  [50, 49, 'Hard-shadow Neo-Brutalist graphic blocks governed by strict Swiss modular typographic grids.'],
  [15, 40, 'Pastoral herbarium botanical specimens pinned with tactile washi tape and Polaroid cutouts.'],
  [21, 41, 'Millennium liquid-chrome orbital vectors paired with hydro-atmospheric glossy aqua spheres.'],
  [22, 39, 'Weimar primary geometric constructivism balanced with warm Eames atomic boomerang curves.'],
  [31, 30, 'Medieval cathedral lancet tracery emerging from dramatic Caravaggio chiaroscuro shadow.'],
];

export function blendEnrichedStyles(
  primary: EnrichedStyleSpec,
  secondary: EnrichedStyleSpec | null,
  editionNumber: number
): SynthesizedArtDirection {
  if (!secondary || primary.id === secondary.id) {
    return {
      ...primary,
      signatureId: `pure-${primary.id}`,
      isHybrid: false,
      parentStyles: [primary],
      editionNumber,
      harmonyNote: `Pure ${primary.name} art direction: ${primary.mood.toLowerCase()}.`,
    };
  }

  const curatedMatch = CURATED_HYBRID_PAIRS.find(
    ([a, b]) =>
      (a === primary.id && b === secondary.id) ||
      (b === primary.id && a === secondary.id)
  );

  const combinedLayouts = Array.from(
    new Set([...primary.preferredLayouts, ...secondary.preferredLayouts])
  );

  return {
    ...primary,
    id: primary.id * 100 + secondary.id,
    name: `${primary.name} × ${secondary.name}`,
    slug: `${primary.slug}-x-${secondary.slug}`,
    description:
      curatedMatch?.[2] ||
      `Cohesive synthesis blending ${primary.name} (${primary.mood.split(',')[0].toLowerCase()} palette & ${primary.illustrationSubject.split(',')[0].toLowerCase()}) with ${secondary.name} (${secondary.fontDisplay.split(',')[0].replace(/'/g, '')} typography & ${secondary.borderStyle} framing).`,
    coreElements: [
      ...primary.coreElements.slice(0, 2),
      ...secondary.coreElements.slice(0, 2),
    ],
    mood: `${primary.mood.split(',')[0]} × ${secondary.mood.split(',')[0]}`,
    isDark: primary.isDark,
    bgCanvas: primary.bgCanvas,
    bgSurface: primary.bgSurface,
    bgElevated: primary.bgElevated,
    textPrimary: primary.textPrimary,
    textSecondary: primary.textSecondary,
    accentPrimary: primary.accentPrimary,
    accentSecondary: secondary.accentPrimary,
    borderColor: primary.borderColor,
    borderStyle: secondary.borderStyle,
    fontDisplay: secondary.defaultDisplayFont,
    fontBody: primary.defaultBodyFont,
    fontMono: secondary.fontMono,
    layoutVariant: secondary.layoutVariant,
    motif: primary.motif,
    microInteraction: secondary.microInteraction,
    microInteractionLabel: `${secondary.microInteractionLabel} × ${primary.name}`,
    photoTreatment: secondary.photoTreatment,
    signatureId: `hybrid-${primary.id}-${secondary.id}`,
    isHybrid: true,
    parentStyles: [primary, secondary],
    editionNumber,
    illustrationSubject: `${primary.illustrationSubject} fused with ${secondary.illustrationSubject.toLowerCase()}`,
    secondaryIllustrationSubject: secondary.illustrationSubject,
    illustrationCategory: primary.illustrationCategory,
    preferredLayouts: combinedLayouts,
    motionPersonality: secondary.motionPersonality,
    harmonyNote:
      curatedMatch?.[2] ||
      `Blends ${primary.name} chromatic field and ${primary.illustrationCategory} illustration with ${secondary.name} typographic hierarchy.`,
  };
}

export function selectArtDirection(
  rng: () => number,
  editionNumber: number,
  options?: {
    forceStyleId?: number;
    forceSecondaryStyleId?: number;
    forceHybrid?: boolean;
    previousSignatureId?: string;
  }
): SynthesizedArtDirection {
  if (options?.forceStyleId) {
    const primary = getEnrichedStyleById(options.forceStyleId);
    if (options.forceSecondaryStyleId && options.forceSecondaryStyleId !== primary.id) {
      const secondary = getEnrichedStyleById(options.forceSecondaryStyleId);
      return blendEnrichedStyles(primary, secondary, editionNumber);
    }
    if (options.forceHybrid) {
      const partnerId =
        primary.compatibleHybrids[
          Math.floor(rng() * primary.compatibleHybrids.length)
        ] || ((primary.id % 50) + 1);
      return blendEnrichedStyles(primary, getEnrichedStyleById(partnerId), editionNumber);
    }
    return blendEnrichedStyles(primary, null, editionNumber);
  }

  // Weighted randomization: ~45% standalone style, ~55% compatible hybrid style
  const shouldUseHybrid = options?.forceHybrid ?? rng() < 0.52;

  for (let attempt = 0; attempt < 25; attempt++) {
    if (shouldUseHybrid && rng() < 0.45) {
      // Pick one of the 14 signature curated pairs
      const pair =
        CURATED_HYBRID_PAIRS[
          Math.floor(rng() * CURATED_HYBRID_PAIRS.length)
        ];
      const flip = rng() < 0.5;
      const p1 = getEnrichedStyleById(flip ? pair[1] : pair[0]);
      const p2 = getEnrichedStyleById(flip ? pair[0] : pair[1]);
      const dir = blendEnrichedStyles(p1, p2, editionNumber);
      if (dir.signatureId !== options?.previousSignatureId) {
        return dir;
      }
    }

    const primaryIdx = Math.floor(rng() * ENRICHED_STYLES_50.length);
    const primary = ENRICHED_STYLES_50[primaryIdx];

    if (shouldUseHybrid) {
      const compatList = primary.compatibleHybrids;
      const partnerId =
        compatList[Math.floor(rng() * compatList.length)] ||
        ((primary.id + 7) % 50) + 1;
      const secondary = getEnrichedStyleById(partnerId);
      const dir = blendEnrichedStyles(primary, secondary, editionNumber);
      if (dir.signatureId !== options?.previousSignatureId) {
        return dir;
      }
    } else {
      const dir = blendEnrichedStyles(primary, null, editionNumber);
      if (dir.signatureId !== options?.previousSignatureId) {
        return dir;
      }
    }
  }

  const fallbackPrimary = ENRICHED_STYLES_50[editionNumber % 50];
  return blendEnrichedStyles(fallbackPrimary, null, editionNumber);
}
