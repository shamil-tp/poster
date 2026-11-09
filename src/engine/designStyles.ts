import {
  DESIGN_STYLES_50,
  DesignStyleSpec,
  GeneratedPosterStyle,
  createHybridDesignStyle,
} from '../utils/posterStyles';

export type MotionPersonality =
  | 'calm-zen'
  | 'bouncy-pop'
  | 'glitch-abrupt'
  | 'fluid-aurora'
  | 'precise-deco'
  | 'dramatic-baroque'
  | 'sharp-brutal'
  | 'soft-ethereal'
  | 'neon-perspective'
  | 'paper-tactile';

export type LayoutArchetypeId =
  | 'magazine-cover'
  | 'bauhaus-constructivist'
  | 'diagonal-split'
  | 'circular-monument'
  | 'vertical-spine-editorial'
  | 'layered-collage-zine'
  | 'full-bleed-artwork'
  | 'brutalist-manifesto'
  | 'three-column-broadsheet'
  | 'bento-playground'
  | 'asymmetric-avant-garde'
  | 'split-poster-duality';

export interface EnrichedStyleSpec extends DesignStyleSpec {
  illustrationSubject: string;
  illustrationCategory:
    | 'classical-sculpture'
    | 'ornate-engraving'
    | 'fluid-atmospheric'
    | 'botanical-organic'
    | 'character-mascot'
    | 'pixel-retro'
    | 'drafting-sketch'
    | 'typographic-sculpture'
    | 'zen-ceramic'
    | 'geometric-construct'
    | 'cyber-schematic'
    | 'synth-horizon'
    | 'collage-scrapbook'
    | 'mechanical-gear'
    | 'surreal-portal'
    | 'maritime-nautical'
    | 'glass-3d';
  preferredLayouts: LayoutArchetypeId[];
  compatibleHybrids: number[];
  motionPersonality: MotionPersonality;
  defaultDisplayFont: string;
  defaultBodyFont: string;
}

const STYLE_ENRICHMENTS: Record<
  number,
  {
    illustrationSubject: string;
    illustrationCategory: EnrichedStyleSpec['illustrationCategory'];
    preferredLayouts: LayoutArchetypeId[];
    compatibleHybrids: number[];
    motionPersonality: MotionPersonality;
    defaultDisplayFont: string;
    defaultBodyFont: string;
  }
> = {
  1: {
    illustrationSubject: 'Marble bust pedestal, fluted Greco-Roman columns & golden laurel wreath',
    illustrationCategory: 'classical-sculpture',
    preferredLayouts: ['three-column-broadsheet', 'circular-monument', 'split-poster-duality'],
    compatibleHybrids: [10, 43, 6, 17],
    motionPersonality: 'precise-deco',
    defaultDisplayFont: "'Cinzel', 'Cormorant Garamond', serif",
    defaultBodyFont: "'Cormorant Garamond', 'DM Sans', serif",
  },
  2: {
    illustrationSubject: 'Ornate gilded chiaroscuro frame, dramatic drapery & sunburst halo',
    illustrationCategory: 'ornate-engraving',
    preferredLayouts: ['circular-monument', 'magazine-cover', 'three-column-broadsheet'],
    compatibleHybrids: [30, 16, 5, 42],
    motionPersonality: 'dramatic-baroque',
    defaultDisplayFont: "'Bodoni Moda', 'Playfair Display', serif",
    defaultBodyFont: "'Lora', 'DM Sans', serif",
  },
  3: {
    illustrationSubject: 'Flowing northern-lights iridescent ribbon waves & luminous celestial orbs',
    illustrationCategory: 'fluid-atmospheric',
    preferredLayouts: ['full-bleed-artwork', 'asymmetric-avant-garde', 'circular-monument'],
    compatibleHybrids: [48, 4, 41, 25],
    motionPersonality: 'fluid-aurora',
    defaultDisplayFont: "'Space Grotesk', 'Outfit', sans-serif",
    defaultBodyFont: "'Outfit', 'DM Sans', sans-serif",
  },
  4: {
    illustrationSubject: 'Weightless botanical silhouettes, crescent mist halo & floating petals',
    illustrationCategory: 'botanical-organic',
    preferredLayouts: ['vertical-spine-editorial', 'full-bleed-artwork', 'circular-monument'],
    compatibleHybrids: [18, 3, 43, 36],
    motionPersonality: 'soft-ethereal',
    defaultDisplayFont: "'DM Serif Display', 'Cormorant Garamond', serif",
    defaultBodyFont: "'Cormorant Garamond', 'DM Sans', serif",
  },
  5: {
    illustrationSubject: 'Intricate metallic gold-and-silver filigree mandala & fine lace scroll',
    illustrationCategory: 'ornate-engraving',
    preferredLayouts: ['circular-monument', 'three-column-broadsheet', 'magazine-cover'],
    compatibleHybrids: [10, 16, 17, 2],
    motionPersonality: 'precise-deco',
    defaultDisplayFont: "'Cinzel Decorative', 'Cinzel', serif",
    defaultBodyFont: "'EB Garamond', 'DM Sans', serif",
  },
  6: {
    illustrationSubject: 'Symmetrical Corinthian acanthus foliage & carved travertine botanical relief',
    illustrationCategory: 'botanical-organic',
    preferredLayouts: ['three-column-broadsheet', 'split-poster-duality', 'circular-monument'],
    compatibleHybrids: [1, 18, 43, 16],
    motionPersonality: 'calm-zen',
    defaultDisplayFont: "'Playfair Display', 'EB Garamond', serif",
    defaultBodyFont: "'Lora', 'DM Sans', serif",
  },
  7: {
    illustrationSubject: 'Expressive anthropomorphic geometric character with kinetic eyes & friendly limbs',
    illustrationCategory: 'character-mascot',
    preferredLayouts: ['bento-playground', 'magazine-cover', 'asymmetric-avant-garde'],
    compatibleHybrids: [35, 12, 27, 47],
    motionPersonality: 'bouncy-pop',
    defaultDisplayFont: "'Fredoka', 'Baloo 2', sans-serif",
    defaultBodyFont: "'Nunito', 'DM Sans', sans-serif",
  },
  8: {
    illustrationSubject: 'Retro 8-bit pixel-art arcade guardian, CRT scanline matrix & voxel stars',
    illustrationCategory: 'pixel-retro',
    preferredLayouts: ['bento-playground', 'brutalist-manifesto', 'split-poster-duality'],
    compatibleHybrids: [24, 21, 25, 26],
    motionPersonality: 'glitch-abrupt',
    defaultDisplayFont: "'Share Tech Mono', 'JetBrains Mono', monospace",
    defaultBodyFont: "'Space Mono', monospace",
  },
  9: {
    illustrationSubject: 'Hand-drawn architectural pencil crosshatching, caliper arcs & construction lines',
    illustrationCategory: 'drafting-sketch',
    preferredLayouts: ['asymmetric-avant-garde', 'layered-collage-zine', 'brutalist-manifesto'],
    compatibleHybrids: [38, 33, 40, 49],
    motionPersonality: 'paper-tactile',
    defaultDisplayFont: "'Caveat', 'Bricolage Grotesque', cursive",
    defaultBodyFont: "'IBM Plex Mono', monospace",
  },
  10: {
    illustrationSubject: 'Sculptural serif ligature monolith & high-contrast gold-foil editorial totem',
    illustrationCategory: 'typographic-sculpture',
    preferredLayouts: ['magazine-cover', 'vertical-spine-editorial', 'split-poster-duality'],
    compatibleHybrids: [17, 1, 5, 49],
    motionPersonality: 'precise-deco',
    defaultDisplayFont: "'Bodoni Moda', 'Playfair Display', serif",
    defaultBodyFont: "'Josefin Sans', 'DM Sans', sans-serif",
  },
  11: {
    illustrationSubject: 'Minimalist stoneware vessel, architectural timber screen & single botanical branch',
    illustrationCategory: 'zen-ceramic',
    preferredLayouts: ['vertical-spine-editorial', 'split-poster-duality', 'asymmetric-avant-garde'],
    compatibleHybrids: [44, 39, 4, 28],
    motionPersonality: 'calm-zen',
    defaultDisplayFont: "'Outfit', 'DM Sans', sans-serif",
    defaultBodyFont: "'DM Sans', sans-serif",
  },
  12: {
    illustrationSubject: 'Milanese 1980s geometric totem with terrazzo confetti, squiggles & primary blocks',
    illustrationCategory: 'geometric-construct',
    preferredLayouts: ['bauhaus-constructivist', 'diagonal-split', 'asymmetric-avant-garde'],
    compatibleHybrids: [27, 50, 22, 20],
    motionPersonality: 'bouncy-pop',
    defaultDisplayFont: "'Archivo Black', 'Fredoka', sans-serif",
    defaultBodyFont: "'Space Grotesk', sans-serif",
  },
  13: {
    illustrationSubject: 'Radiant terracotta sun-and-moon mandala, woven macramé arcs & desert botanicals',
    illustrationCategory: 'botanical-organic',
    preferredLayouts: ['circular-monument', 'layered-collage-zine', 'asymmetric-avant-garde'],
    compatibleHybrids: [19, 18, 45, 44],
    motionPersonality: 'soft-ethereal',
    defaultDisplayFont: "'Fraunces', 'Playfair Display', serif",
    defaultBodyFont: "'Lora', sans-serif",
  },
  14: {
    illustrationSubject: 'Distressed vintage botanical rose engraving, cameo oval & French linen border',
    illustrationCategory: 'botanical-organic',
    preferredLayouts: ['three-column-broadsheet', 'layered-collage-zine', 'circular-monument'],
    compatibleHybrids: [15, 36, 40, 43],
    motionPersonality: 'soft-ethereal',
    defaultDisplayFont: "'Cormorant Garamond', 'Playfair Display', serif",
    defaultBodyFont: "'Lora', serif",
  },
  15: {
    illustrationSubject: 'Woodland herbarium specimen, botanical wildflowers, gingham weave & rustic timber arch',
    illustrationCategory: 'botanical-organic',
    preferredLayouts: ['layered-collage-zine', 'three-column-broadsheet', 'split-poster-duality'],
    compatibleHybrids: [40, 14, 43, 44],
    motionPersonality: 'paper-tactile',
    defaultDisplayFont: "'Fraunces', 'EB Garamond', serif",
    defaultBodyFont: "'Lora', serif",
  },
  16: {
    illustrationSubject: '19th-century copperplate botanical & architectural engraving inside gilded damask frame',
    illustrationCategory: 'ornate-engraving',
    preferredLayouts: ['three-column-broadsheet', 'circular-monument', 'magazine-cover'],
    compatibleHybrids: [42, 34, 2, 31],
    motionPersonality: 'dramatic-baroque',
    defaultDisplayFont: "'IM Fell English', 'Playfair Display', serif",
    defaultBodyFont: "'Libre Baskerville', serif",
  },
  17: {
    illustrationSubject: '1920s geometric brass sunburst spire, stepped ziggurat arches & symmetrical fan',
    illustrationCategory: 'geometric-construct',
    preferredLayouts: ['circular-monument', 'magazine-cover', 'three-column-broadsheet'],
    compatibleHybrids: [10, 5, 1, 22],
    motionPersonality: 'precise-deco',
    defaultDisplayFont: "'Poiret One', 'Antonio', sans-serif",
    defaultBodyFont: "'Josefin Sans', sans-serif",
  },
  18: {
    illustrationSubject: 'Sinuous Alphonse Mucha whiplash botanical arch, stained-glass halo & iris vines',
    illustrationCategory: 'botanical-organic',
    preferredLayouts: ['circular-monument', 'magazine-cover', 'vertical-spine-editorial'],
    compatibleHybrids: [4, 6, 13, 36],
    motionPersonality: 'fluid-aurora',
    defaultDisplayFont: "'Cormorant Garamond', 'Fraunces', serif",
    defaultBodyFont: "'Lora', serif",
  },
  19: {
    illustrationSubject: 'Celestial tarot sun-and-crescent desert canyon, saguaro silhouette & star compass',
    illustrationCategory: 'surreal-portal',
    preferredLayouts: ['circular-monument', 'split-poster-duality', 'magazine-cover'],
    compatibleHybrids: [45, 42, 37, 13],
    motionPersonality: 'dramatic-baroque',
    defaultDisplayFont: "'Cinzel', 'IM Fell English', serif",
    defaultBodyFont: "'EB Garamond', serif",
  },
  20: {
    illustrationSubject: 'Atomic starburst sticker explosion, retro television silhouette & ironic pop badge',
    illustrationCategory: 'character-mascot',
    preferredLayouts: ['layered-collage-zine', 'diagonal-split', 'bento-playground'],
    compatibleHybrids: [27, 12, 26, 50],
    motionPersonality: 'bouncy-pop',
    defaultDisplayFont: "'Bangers', 'Archivo Black', cursive",
    defaultBodyFont: "'Space Grotesk', sans-serif",
  },
  21: {
    illustrationSubject: 'Liquid chrome Y2K orbital rings, cyber-starburst vector & glossy metallic sphere',
    illustrationCategory: 'glass-3d',
    preferredLayouts: ['diagonal-split', 'full-bleed-artwork', 'asymmetric-avant-garde'],
    compatibleHybrids: [41, 48, 24, 25],
    motionPersonality: 'neon-perspective',
    defaultDisplayFont: "'Orbitron', 'Audiowide', sans-serif",
    defaultBodyFont: "'Space Grotesk', sans-serif",
  },
  22: {
    illustrationSubject: 'Weimar Bauhaus constructivist composition of primary red circle, blue square & yellow triangle',
    illustrationCategory: 'geometric-construct',
    preferredLayouts: ['bauhaus-constructivist', 'diagonal-split', 'split-poster-duality'],
    compatibleHybrids: [39, 49, 50, 12],
    motionPersonality: 'precise-deco',
    defaultDisplayFont: "'Montserrat', 'Outfit', sans-serif",
    defaultBodyFont: "'DM Sans', sans-serif",
  },
  23: {
    illustrationSubject: 'Raw architectural concrete monolith, exposed wireframe crosshair & structural dimension grid',
    illustrationCategory: 'typographic-sculpture',
    preferredLayouts: ['brutalist-manifesto', 'bauhaus-constructivist', 'split-poster-duality'],
    compatibleHybrids: [24, 50, 38, 49],
    motionPersonality: 'sharp-brutal',
    defaultDisplayFont: "'Anton', 'Antonio', sans-serif",
    defaultBodyFont: "'IBM Plex Mono', 'Space Mono', monospace",
  },
  24: {
    illustrationSubject: 'High-density cybernetic HUD schematic, phosphor circuit bus & glitch data core',
    illustrationCategory: 'cyber-schematic',
    preferredLayouts: ['brutalist-manifesto', 'bento-playground', 'diagonal-split'],
    compatibleHybrids: [23, 25, 21, 8],
    motionPersonality: 'glitch-abrupt',
    defaultDisplayFont: "'Oxanium', 'Share Tech Mono', monospace",
    defaultBodyFont: "'Share Tech Mono', 'JetBrains Mono', monospace",
  },
  25: {
    illustrationSubject: '1980s outrun neon wireframe sun over perspective vector grid horizon & twin peaks',
    illustrationCategory: 'synth-horizon',
    preferredLayouts: ['full-bleed-artwork', 'diagonal-split', 'magazine-cover'],
    compatibleHybrids: [26, 24, 21, 3],
    motionPersonality: 'neon-perspective',
    defaultDisplayFont: "'Michroma', 'Orbitron', sans-serif",
    defaultBodyFont: "'Space Grotesk', sans-serif",
  },
  26: {
    illustrationSubject: 'Surreal classical marble bust floating over pastel checkerboard horizon & retro OS window',
    illustrationCategory: 'classical-sculpture',
    preferredLayouts: ['asymmetric-avant-garde', 'layered-collage-zine', 'diagonal-split'],
    compatibleHybrids: [37, 25, 1, 21],
    motionPersonality: 'neon-perspective',
    defaultDisplayFont: "'Cinzel', 'Orbitron', serif",
    defaultBodyFont: "'Space Mono', monospace",
  },
  27: {
    illustrationSubject: 'Silkscreen Ben-Day halftone comic explosion, bold ink speech lightning & pop frame',
    illustrationCategory: 'character-mascot',
    preferredLayouts: ['diagonal-split', 'magazine-cover', 'bento-playground'],
    compatibleHybrids: [12, 50, 20, 29],
    motionPersonality: 'bouncy-pop',
    defaultDisplayFont: "'Bangers', 'Anton', sans-serif",
    defaultBodyFont: "'Space Grotesk', sans-serif",
  },
  28: {
    illustrationSubject: 'Modular isometric icon compartments, precision telemetry rings & tactile grid tiles',
    illustrationCategory: 'geometric-construct',
    preferredLayouts: ['bento-playground', 'bauhaus-constructivist', 'split-poster-duality'],
    compatibleHybrids: [11, 48, 41, 49],
    motionPersonality: 'calm-zen',
    defaultDisplayFont: "'Bricolage Grotesque', 'Outfit', sans-serif",
    defaultBodyFont: "'DM Sans', sans-serif",
  },
  29: {
    illustrationSubject: 'Urban street-art spray stencil crown, dripping aerosol tags & concrete poster tear',
    illustrationCategory: 'typographic-sculpture',
    preferredLayouts: ['diagonal-split', 'layered-collage-zine', 'asymmetric-avant-garde'],
    compatibleHybrids: [50, 27, 33, 23],
    motionPersonality: 'sharp-brutal',
    defaultDisplayFont: "'Permanent Marker', 'Anton', cursive",
    defaultBodyFont: "'Space Grotesk', sans-serif",
  },
  30: {
    illustrationSubject: 'Caravaggio chiaroscuro spotlight beam illuminating a sculptural sphere in deep shadow',
    illustrationCategory: 'classical-sculpture',
    preferredLayouts: ['full-bleed-artwork', 'split-poster-duality', 'vertical-spine-editorial'],
    compatibleHybrids: [31, 2, 42, 10],
    motionPersonality: 'dramatic-baroque',
    defaultDisplayFont: "'Bodoni Moda', 'Playfair Display', serif",
    defaultBodyFont: "'Cormorant Garamond', serif",
  },
  31: {
    illustrationSubject: 'Medieval Gothic pointed lancet arch, cathedral rose window tracery & raven silhouette',
    illustrationCategory: 'ornate-engraving',
    preferredLayouts: ['three-column-broadsheet', 'circular-monument', 'vertical-spine-editorial'],
    compatibleHybrids: [30, 42, 16, 2],
    motionPersonality: 'dramatic-baroque',
    defaultDisplayFont: "'UnifrakturMaguntia', 'Cinzel', serif",
    defaultBodyFont: "'Cormorant Garamond', serif",
  },
  32: {
    illustrationSubject: 'Neo-impressionist Seurat stippled dot-matrix landscape & optical color-mixing halo',
    illustrationCategory: 'fluid-atmospheric',
    preferredLayouts: ['full-bleed-artwork', 'circular-monument', 'vertical-spine-editorial'],
    compatibleHybrids: [4, 44, 37, 11],
    motionPersonality: 'soft-ethereal',
    defaultDisplayFont: "'Cormorant Garamond', 'Fraunces', serif",
    defaultBodyFont: "'DM Sans', sans-serif",
  },
  33: {
    illustrationSubject: 'Avant-garde Dada collage of torn newspaper clippings, halftone portrait & ink brushstrokes',
    illustrationCategory: 'collage-scrapbook',
    preferredLayouts: ['layered-collage-zine', 'asymmetric-avant-garde', 'diagonal-split'],
    compatibleHybrids: [40, 9, 29, 50],
    motionPersonality: 'paper-tactile',
    defaultDisplayFont: "'Bricolage Grotesque', 'Permanent Marker', sans-serif",
    defaultBodyFont: "'IBM Plex Mono', monospace",
  },
  34: {
    illustrationSubject: 'Interlocking Victorian brass cogwheels, pressure gauge dial & mechanical astrolabe',
    illustrationCategory: 'mechanical-gear',
    preferredLayouts: ['circular-monument', 'three-column-broadsheet', 'brutalist-manifesto'],
    compatibleHybrids: [16, 42, 46, 38],
    motionPersonality: 'precise-deco',
    defaultDisplayFont: "'Special Elite', 'IM Fell English', serif",
    defaultBodyFont: "'Courier Prime', 'IBM Plex Mono', monospace",
  },
  35: {
    illustrationSubject: 'Cheerful pastel kawaii cloud companion, twinkling four-point stars & soft bubble heart',
    illustrationCategory: 'character-mascot',
    preferredLayouts: ['bento-playground', 'circular-monument', 'magazine-cover'],
    compatibleHybrids: [7, 36, 41, 12],
    motionPersonality: 'bouncy-pop',
    defaultDisplayFont: "'Baloo 2', 'Fredoka', sans-serif",
    defaultBodyFont: "'Nunito', sans-serif",
  },
  36: {
    illustrationSubject: 'Delicate silk ribbon bow, baroque pearl strand & romantic oval locket frame',
    illustrationCategory: 'ornate-engraving',
    preferredLayouts: ['circular-monument', 'magazine-cover', 'three-column-broadsheet'],
    compatibleHybrids: [4, 14, 18, 10],
    motionPersonality: 'soft-ethereal',
    defaultDisplayFont: "'Bodoni Moda', 'Playfair Display', serif",
    defaultBodyFont: "'Cormorant Garamond', serif",
  },
  37: {
    illustrationSubject: 'Dreamlike Magritte floating architectural portal, levitating sphere & celestial eye',
    illustrationCategory: 'surreal-portal',
    preferredLayouts: ['asymmetric-avant-garde', 'full-bleed-artwork', 'circular-monument'],
    compatibleHybrids: [26, 19, 30, 3],
    motionPersonality: 'fluid-aurora',
    defaultDisplayFont: "'Fraunces', 'DM Serif Display', serif",
    defaultBodyFont: "'Lora', serif",
  },
  38: {
    illustrationSubject: 'ISO industrial schematic diagram, telemetry callout vectors & dimensional tolerances',
    illustrationCategory: 'cyber-schematic',
    preferredLayouts: ['brutalist-manifesto', 'bauhaus-constructivist', 'bento-playground'],
    compatibleHybrids: [23, 49, 22, 9],
    motionPersonality: 'sharp-brutal',
    defaultDisplayFont: "'Antonio', 'Space Mono', sans-serif",
    defaultBodyFont: "'IBM Plex Mono', monospace",
  },
  39: {
    illustrationSubject: '1950s Eames atomic boomerang mobile, organic kidney curves & starburst clock',
    illustrationCategory: 'geometric-construct',
    preferredLayouts: ['bauhaus-constructivist', 'asymmetric-avant-garde', 'split-poster-duality'],
    compatibleHybrids: [22, 11, 45, 49],
    motionPersonality: 'calm-zen',
    defaultDisplayFont: "'Outfit', 'Josefin Sans', sans-serif",
    defaultBodyFont: "'DM Sans', sans-serif",
  },
  40: {
    illustrationSubject: 'Tactile Polaroid photo cutout, washi masking tape strips, postage stamp & handwritten notes',
    illustrationCategory: 'collage-scrapbook',
    preferredLayouts: ['layered-collage-zine', 'asymmetric-avant-garde', 'bento-playground'],
    compatibleHybrids: [15, 33, 9, 14],
    motionPersonality: 'paper-tactile',
    defaultDisplayFont: "'Caveat', 'Fraunces', cursive",
    defaultBodyFont: "'DM Sans', sans-serif",
  },
  41: {
    illustrationSubject: 'Luminous Frutiger Aero translucent aqua spheres, glossy water droplets & sky horizon',
    illustrationCategory: 'glass-3d',
    preferredLayouts: ['bento-playground', 'full-bleed-artwork', 'asymmetric-avant-garde'],
    compatibleHybrids: [21, 48, 3, 28],
    motionPersonality: 'fluid-aurora',
    defaultDisplayFont: "'Outfit', 'Space Grotesk', sans-serif",
    defaultBodyFont: "'Nunito', 'DM Sans', sans-serif",
  },
  42: {
    illustrationSubject: 'Celestial brass astrolabe, antique leather spellbook, flickering taper candle & wax seal',
    illustrationCategory: 'ornate-engraving',
    preferredLayouts: ['three-column-broadsheet', 'circular-monument', 'magazine-cover'],
    compatibleHybrids: [16, 31, 30, 43],
    motionPersonality: 'dramatic-baroque',
    defaultDisplayFont: "'Cinzel', 'IM Fell English', serif",
    defaultBodyFont: "'EB Garamond', serif",
  },
  43: {
    illustrationSubject: 'Sunlit classical library colonnade, open archival manuscript & marble bust sketch',
    illustrationCategory: 'classical-sculpture',
    preferredLayouts: ['three-column-broadsheet', 'vertical-spine-editorial', 'split-poster-duality'],
    compatibleHybrids: [1, 42, 14, 6],
    motionPersonality: 'calm-zen',
    defaultDisplayFont: "'EB Garamond', 'Playfair Display', serif",
    defaultBodyFont: "'Lora', serif",
  },
  44: {
    illustrationSubject: 'Asymmetric Kintsugi stoneware tea bowl with gold-mended crack & organic ink enso circle',
    illustrationCategory: 'zen-ceramic',
    preferredLayouts: ['vertical-spine-editorial', 'asymmetric-avant-garde', 'split-poster-duality'],
    compatibleHybrids: [11, 15, 4, 32],
    motionPersonality: 'calm-zen',
    defaultDisplayFont: "'Cormorant Garamond', 'Fraunces', serif",
    defaultBodyFont: "'DM Sans', sans-serif",
  },
  45: {
    illustrationSubject: 'Sun-baked Monument Valley terracotta mesas, desert sun arch & frontier woodcut star',
    illustrationCategory: 'botanical-organic',
    preferredLayouts: ['split-poster-duality', 'three-column-broadsheet', 'magazine-cover'],
    compatibleHybrids: [19, 13, 39, 34],
    motionPersonality: 'paper-tactile',
    defaultDisplayFont: "'Cinzel', 'Anton', serif",
    defaultBodyFont: "'Lora', sans-serif",
  },
  46: {
    illustrationSubject: 'Admiralty brass compass rose, cartographic latitude meridians & maritime anchor crest',
    illustrationCategory: 'maritime-nautical',
    preferredLayouts: ['circular-monument', 'bauhaus-constructivist', 'three-column-broadsheet'],
    compatibleHybrids: [34, 1, 38, 17],
    motionPersonality: 'precise-deco',
    defaultDisplayFont: "'Cinzel', 'Antonio', serif",
    defaultBodyFont: "'DM Sans', sans-serif",
  },
  47: {
    illustrationSubject: 'Witty Rebus visual equation combining geometric eye, stair, and key pictograms with type',
    illustrationCategory: 'typographic-sculpture',
    preferredLayouts: ['bento-playground', 'bauhaus-constructivist', 'asymmetric-avant-garde'],
    compatibleHybrids: [49, 22, 7, 12],
    motionPersonality: 'bouncy-pop',
    defaultDisplayFont: "'Bricolage Grotesque', 'Space Grotesk', sans-serif",
    defaultBodyFont: "'IBM Plex Mono', monospace",
  },
  48: {
    illustrationSubject: 'Multi-layered frosted optical glass prisms refracting iridescent ambient spheres',
    illustrationCategory: 'glass-3d',
    preferredLayouts: ['bento-playground', 'full-bleed-artwork', 'asymmetric-avant-garde'],
    compatibleHybrids: [3, 41, 21, 28],
    motionPersonality: 'fluid-aurora',
    defaultDisplayFont: "'Space Grotesk', 'Outfit', sans-serif",
    defaultBodyFont: "'DM Sans', sans-serif",
  },
  49: {
    illustrationSubject: 'Swiss International kinetic letterform grid, modular typographic blocks & baseline rulers',
    illustrationCategory: 'typographic-sculpture',
    preferredLayouts: ['bauhaus-constructivist', 'brutalist-manifesto', 'vertical-spine-editorial'],
    compatibleHybrids: [50, 22, 23, 10],
    motionPersonality: 'precise-deco',
    defaultDisplayFont: "'Antonio', 'Archivo Black', sans-serif",
    defaultBodyFont: "'IBM Plex Mono', monospace",
  },
  50: {
    illustrationSubject: 'Bold Neo-Brutalist graphic poster character, hard-shadow offset blocks & kinetic starburst',
    illustrationCategory: 'geometric-construct',
    preferredLayouts: ['bauhaus-constructivist', 'diagonal-split', 'bento-playground'],
    compatibleHybrids: [49, 12, 27, 23],
    motionPersonality: 'sharp-brutal',
    defaultDisplayFont: "'Archivo Black', 'Bricolage Grotesque', sans-serif",
    defaultBodyFont: "'Space Grotesk', 'IBM Plex Mono', sans-serif",
  },
};

export const ENRICHED_STYLES_50: EnrichedStyleSpec[] = DESIGN_STYLES_50.map((s) => {
  const extra = STYLE_ENRICHMENTS[s.id] || STYLE_ENRICHMENTS[1];
  return {
    ...s,
    ...extra,
    fontDisplay: extra.defaultDisplayFont,
    fontBody: extra.defaultBodyFont,
  };
});

export function getEnrichedStyleById(id: number): EnrichedStyleSpec {
  return ENRICHED_STYLES_50.find((s) => s.id === id) || ENRICHED_STYLES_50[0];
}

export { DESIGN_STYLES_50, createHybridDesignStyle };
export type { DesignStyleSpec, GeneratedPosterStyle };
