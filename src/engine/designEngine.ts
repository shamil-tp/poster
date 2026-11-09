import { LayoutArchetypeId } from './designStyles';
import { selectArtDirection, SynthesizedArtDirection } from './hybridGenerator';
import {
  generateTypographyConfig,
  TypographyConfig,
} from './typographyGenerator';
import {
  generateLayoutConfig,
  LayoutCompositionSpec,
} from './layoutGenerator';
import {
  generateIllustrationConfig,
  IllustrationConfig,
} from './illustrationGenerator';

/**
 * Deterministic seeded PRNG (Mulberry32) so any generated seed produces a reproducible
 * multi-dimensional design state until regenerated.
 */
export function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface CompleteDesignState {
  seed: number;
  editionNumber: number;
  artDirection: SynthesizedArtDirection;
  typography: TypographyConfig;
  layout: LayoutCompositionSpec;
  illustration: IllustrationConfig;
  projectIndex: number;
  secondaryProjectIndex: number;
  experienceIndex: number;
  hackathonIndex: number;
  skillGroupIndex: number;
  educationIndex: number;
  photoIndex: number;
  comboSignature: string;
}

export function generateCompleteDesignState(
  seed: number,
  editionNumber: number,
  options?: {
    forceStyleId?: number;
    forceSecondaryStyleId?: number;
    forceHybrid?: boolean;
    typeOverrideIndex?: number;
    layoutOverrideIndex?: number;
    previousState?: CompleteDesignState;
    projectCount?: number;
    photoCount?: number;
  }
): CompleteDesignState {
  // Fork independent deterministic PRNG streams per subsystem so overriding typography or layout
  // never alters any other subsystem's random choices.
  const styleRng = createSeededRng(seed ^ 0x13579bdf);
  const typeRng = createSeededRng(seed ^ 0x2468ace0);
  const layoutRng = createSeededRng(seed ^ 0x369cf036);
  const illusRng = createSeededRng(seed ^ 0x48ae159d);
  const dataRng = createSeededRng(seed ^ 0x5a5a5a5a);

  const projectCount = options?.projectCount || 12;
  const photoCount = options?.photoCount || 3;
  const prev = options?.previousState;

  const artDirection = selectArtDirection(styleRng, editionNumber, {
    forceStyleId: options?.forceStyleId,
    forceSecondaryStyleId: options?.forceSecondaryStyleId,
    forceHybrid: options?.forceHybrid,
    previousSignatureId: prev?.artDirection.signatureId,
  });

  const typography = generateTypographyConfig(
    artDirection,
    typeRng,
    options?.typeOverrideIndex
  );

  const layout = generateLayoutConfig(
    artDirection,
    layoutRng,
    options?.layoutOverrideIndex,
    prev?.layout.id as LayoutArchetypeId | undefined
  );

  const illustration = generateIllustrationConfig(artDirection, illusRng);

  let projectIndex = Math.floor(dataRng() * projectCount);
  if (prev && projectCount > 1 && projectIndex === prev.projectIndex) {
    projectIndex = (projectIndex + 1) % projectCount;
  }

  let secondaryProjectIndex =
    (projectIndex + 3 + Math.floor(dataRng() * (projectCount - 2))) % projectCount;
  if (secondaryProjectIndex === projectIndex) {
    secondaryProjectIndex = (projectIndex + 1) % projectCount;
  }

  let photoIndex = Math.floor(dataRng() * photoCount);
  if (prev && photoCount > 1 && photoIndex === prev.photoIndex) {
    photoIndex = (photoIndex + 1) % photoCount;
  }

  const experienceIndex = Math.floor(dataRng() * 2);
  const hackathonIndex = Math.floor(dataRng() * 5);
  const skillGroupIndex = Math.floor(dataRng() * 6);
  const educationIndex = editionNumber % 2;

  const comboSignature = `${artDirection.signatureId}::${layout.id}::${typography.id}::proj-${projectIndex}`;

  return {
    seed,
    editionNumber,
    artDirection,
    typography,
    layout,
    illustration,
    projectIndex,
    secondaryProjectIndex,
    experienceIndex,
    hackathonIndex,
    skillGroupIndex,
    educationIndex,
    photoIndex,
    comboSignature,
  };
}
