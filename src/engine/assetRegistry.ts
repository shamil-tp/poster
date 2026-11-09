import { EnrichedStyleSpec } from './designStyles';
import { SynthesizedArtDirection } from './hybridGenerator';

export type AssetVisualCategory =
  | 'bauhaus-geometric'
  | 'ukiyo-zen-botanical'
  | 'pop-street-character'
  | 'noir-gothic-sketch'
  | 'architectural-scenic';

export type AssetPlacementRole =
  | 'focal-plate'
  | 'overlapping-cutout'
  | 'edge-bleed-backdrop'
  | 'floating-badge'
  | 'diptych-pair';

export type AssetCropFit = 'contain' | 'cover-center' | 'cover-top';

export interface IllustrationAssetSpec {
  id: string;
  url: string;
  filename: string;
  format: 'jpeg' | 'png' | 'webp';
  width: number;
  height: number;
  aspectRatio: number;
  hasTransparency: boolean;
  title: string;
  subject: string;
  visualCategory: AssetVisualCategory;
  compatibleStyleIds: number[];
  compatibleCategories: EnrichedStyleSpec['illustrationCategory'][];
  dominantPalette: [string, string, string];
  tone: 'dark' | 'light' | 'vibrant' | 'warm-earth' | 'monochrome';
  recommendedPlacements: AssetPlacementRole[];
  recommendedCrop: AssetCropFit;
  isCustom?: boolean;
}

/**
 * Complete catalog of all 39 inspected illustration assets in /public/assets/aistudio/
 * with exact dimensions, aspect ratios, alpha flags, visual subjects, and style mappings.
 */
export const ILLUSTRATION_ASSETS_39: IllustrationAssetSpec[] = [
  {
    id: 'asset-img1',
    url: '/assets/aistudio/img1.jpg',
    filename: 'img1.jpg',
    format: 'jpeg',
    width: 896,
    height: 1344,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Crimson Woodcut Roaring Cat',
    subject: 'Bold woodblock screenprint of a yawning white cat on crimson red with raw black ink linework',
    visualCategory: 'pop-street-character',
    compatibleStyleIds: [7, 20, 23, 27, 29, 33, 35, 40, 46],
    compatibleCategories: ['character-mascot', 'collage-scrapbook', 'drafting-sketch'],
    dominantPalette: ['#D90429', '#FFFFFF', '#111111'],
    tone: 'vibrant',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout', 'floating-badge'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img2',
    url: '/assets/aistudio/img2.jpg',
    filename: 'img2.jpg',
    format: 'jpeg',
    width: 1200,
    height: 1600,
    aspectRatio: 0.75,
    hasTransparency: false,
    title: 'Bauhaus Concentric Eye Totem',
    subject: 'Mid-century geometric eye construct with concentric terracotta, slate blue, and charcoal arcs',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [12, 17, 22, 28, 37, 38, 39, 44, 49, 50],
    compatibleCategories: ['geometric-construct', 'surreal-portal', 'typographic-sculpture'],
    dominantPalette: ['#D95D24', '#5282A8', '#F2E8D5'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'diptych-pair'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img3',
    url: '/assets/aistudio/img3.png',
    filename: 'img3.png',
    format: 'png',
    width: 569,
    height: 879,
    aspectRatio: 0.65,
    hasTransparency: true,
    title: 'Halftone Pop Monograph (Heisenberg)',
    subject: 'High-contrast crimson and slate-teal stencil screenprint poster with condensed block lettering',
    visualCategory: 'pop-street-character',
    compatibleStyleIds: [19, 20, 23, 27, 29, 33, 46],
    compatibleCategories: ['character-mascot', 'collage-scrapbook', 'typographic-sculpture'],
    dominantPalette: ['#C92A2A', '#3B6E8C', '#E9D8B4'],
    tone: 'vibrant',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img4',
    url: '/assets/aistudio/img4.jpg',
    filename: 'img4.jpg',
    format: 'jpeg',
    width: 2200,
    height: 2800,
    aspectRatio: 0.79,
    hasTransparency: false,
    title: 'Memphis & Bauhaus Quarter-Circle Matrix',
    subject: 'High-density modular geometric grid of primary red, yellow, cobalt, and striped arcs',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [8, 12, 22, 23, 27, 28, 32, 38, 49],
    compatibleCategories: ['geometric-construct', 'pixel-retro', 'collage-scrapbook'],
    dominantPalette: ['#E63946', '#FFB703', '#1D3557'],
    tone: 'vibrant',
    recommendedPlacements: ['edge-bleed-backdrop', 'diptych-pair', 'focal-plate'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img5',
    url: '/assets/aistudio/img5.jpg',
    filename: 'img5.jpg',
    format: 'jpeg',
    width: 752,
    height: 1000,
    aspectRatio: 0.75,
    hasTransparency: false,
    title: 'Ukiyo-e Black Cat Ramen Print',
    subject: 'Vintage Japanese woodblock poster of a black cat slurping ramen noodles with calligraphed kanji',
    visualCategory: 'ukiyo-zen-botanical',
    compatibleStyleIds: [7, 11, 13, 15, 20, 35, 39, 40, 43],
    compatibleCategories: ['character-mascot', 'zen-ceramic', 'collage-scrapbook'],
    dominantPalette: ['#D47A43', '#1C1B18', '#E8D8B9'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout', 'floating-badge'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img6',
    url: '/assets/aistudio/img6.jpg',
    filename: 'img6.jpg',
    format: 'jpeg',
    width: 512,
    height: 768,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Swiss Constructivist Grand Prix Monolith',
    subject: 'Minimalist De Stijl and Bauhaus Formula 1 racing poster in primary red, blue, and yellow',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [10, 17, 22, 23, 28, 38, 39, 47, 50],
    compatibleCategories: ['geometric-construct', 'typographic-sculpture', 'mechanical-gear'],
    dominantPalette: ['#004E98', '#E63946', '#F4F1DE'],
    tone: 'light',
    recommendedPlacements: ['focal-plate', 'diptych-pair'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img7',
    url: '/assets/aistudio/img7.jpg',
    filename: 'img7.jpg',
    format: 'jpeg',
    width: 750,
    height: 1061,
    aspectRatio: 0.71,
    hasTransparency: false,
    title: 'Neon Grunge Comic Scream',
    subject: 'Distressed black-and-magenta street comic illustration with expressive halftone textures',
    visualCategory: 'pop-street-character',
    compatibleStyleIds: [20, 21, 23, 24, 25, 26, 27, 29, 31, 46],
    compatibleCategories: ['character-mascot', 'collage-scrapbook', 'cyber-schematic'],
    dominantPalette: ['#F72585', '#121214', '#FFBE0B'],
    tone: 'dark',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img8',
    url: '/assets/aistudio/img8.jpg',
    filename: 'img8.jpg',
    format: 'jpeg',
    width: 1080,
    height: 1080,
    aspectRatio: 1.0,
    hasTransparency: false,
    title: 'Nocturne Skeleton Cat & Yarn',
    subject: 'Minimalist dark whimsical illustration of a bone-white cat skeleton unraveling burnt-orange yarn',
    visualCategory: 'noir-gothic-sketch',
    compatibleStyleIds: [7, 8, 9, 19, 30, 31, 35, 37, 42],
    compatibleCategories: ['character-mascot', 'drafting-sketch', 'ornate-engraving'],
    dominantPalette: ['#0D131A', '#F4F1EA', '#D95326'],
    tone: 'dark',
    recommendedPlacements: ['focal-plate', 'floating-badge', 'overlapping-cutout'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img9',
    url: '/assets/aistudio/img9.jpg',
    filename: 'img9.jpg',
    format: 'jpeg',
    width: 810,
    height: 1440,
    aspectRatio: 0.56,
    hasTransparency: false,
    title: 'Chiaroscuro Crimson Philosopher Portrait',
    subject: 'Painterly neo-noir portrait with glowing amber spectacles against a terracotta-crimson canvas',
    visualCategory: 'noir-gothic-sketch',
    compatibleStyleIds: [1, 2, 9, 10, 16, 19, 30, 31, 34, 37, 42, 43],
    compatibleCategories: ['classical-sculpture', 'ornate-engraving', 'drafting-sketch'],
    dominantPalette: ['#A8383B', '#1D2630', '#E09F5A'],
    tone: 'dark',
    recommendedPlacements: ['focal-plate', 'diptych-pair', 'edge-bleed-backdrop'],
    recommendedCrop: 'cover-top',
  },
  {
    id: 'asset-img10',
    url: '/assets/aistudio/img10.jpg',
    filename: 'img10.jpg',
    format: 'jpeg',
    width: 857,
    height: 1200,
    aspectRatio: 0.71,
    hasTransparency: false,
    title: 'Dessau Modernist Cantilever Facade',
    subject: 'Mid-century architectural perspective of a modernist concrete building in ochre, teal, and vermilion',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [1, 10, 11, 17, 22, 23, 28, 38, 39, 44, 47, 50],
    compatibleCategories: ['geometric-construct', 'classical-sculpture', 'drafting-sketch'],
    dominantPalette: ['#D95D39', '#4A7C82', '#F3E9D2'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'diptych-pair'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img11',
    url: '/assets/aistudio/img11.jpg',
    filename: 'img11.jpg',
    format: 'jpeg',
    width: 653,
    height: 980,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Coastal Beacon at Dusk',
    subject: 'Flat vector mid-century maritime lighthouse on rocky surf under a warm terracotta sunset',
    visualCategory: 'architectural-scenic',
    compatibleStyleIds: [3, 11, 13, 15, 19, 34, 39, 43, 44, 45],
    compatibleCategories: ['maritime-nautical', 'fluid-atmospheric', 'zen-ceramic'],
    dominantPalette: ['#D06A4C', '#1D3539', '#F4D8B8'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'diptych-pair'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img12',
    url: '/assets/aistudio/img12.jpg',
    filename: 'img12.jpg',
    format: 'jpeg',
    width: 1668,
    height: 2224,
    aspectRatio: 0.75,
    hasTransparency: false,
    title: 'Cobalt Mediterranean Courtyard & Steps',
    subject: 'Crisp architectural illustration of cobalt-blue stucco walls, terracotta stairs, and potted citrus',
    visualCategory: 'architectural-scenic',
    compatibleStyleIds: [6, 11, 12, 13, 14, 15, 32, 39, 44, 48],
    compatibleCategories: ['botanical-organic', 'maritime-nautical', 'geometric-construct'],
    dominantPalette: ['#0F4C81', '#E07A3C', '#2A5C43'],
    tone: 'vibrant',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'diptych-pair'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img13',
    url: '/assets/aistudio/img13.png',
    filename: 'img13.png',
    format: 'png',
    width: 786,
    height: 1100,
    aspectRatio: 0.71,
    hasTransparency: false,
    title: 'Bauhaus Manifesto: Less Is More',
    subject: 'Iconic Swiss-Bauhaus typographic composition with primary yellow triangle, blue circle, and red square',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [10, 12, 22, 23, 28, 38, 39, 49, 50],
    compatibleCategories: ['typographic-sculpture', 'geometric-construct'],
    dominantPalette: ['#EDEDED', '#D62828', '#00509D'],
    tone: 'light',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout', 'diptych-pair'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img14',
    url: '/assets/aistudio/img14.jpg',
    filename: 'img14.jpg',
    format: 'jpeg',
    width: 1224,
    height: 1632,
    aspectRatio: 0.75,
    hasTransparency: false,
    title: 'Coral Block Ink Line Portrait',
    subject: 'Expressive architectural ink sketch portrait with round glasses over an asymmetric coral-pink plane',
    visualCategory: 'pop-street-character',
    compatibleStyleIds: [9, 12, 14, 21, 33, 35, 36, 40, 43, 49],
    compatibleCategories: ['drafting-sketch', 'character-mascot', 'collage-scrapbook'],
    dominantPalette: ['#F28482', '#FFFFFF', '#1A1A1A'],
    tone: 'light',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout'],
    recommendedCrop: 'cover-top',
  },
  {
    id: 'asset-img15',
    url: '/assets/aistudio/img15.jpg',
    filename: 'img15.jpg',
    format: 'jpeg',
    width: 736,
    height: 1104,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Cubist Color-Plane Stoic Portrait',
    subject: 'Angular mid-century vector portrait partitioned into warm ochre, rust, navy, and charcoal planes',
    visualCategory: 'pop-street-character',
    compatibleStyleIds: [10, 17, 19, 22, 23, 27, 30, 39, 46, 50],
    compatibleCategories: ['geometric-construct', 'character-mascot', 'classical-sculpture'],
    dominantPalette: ['#C87D28', '#8C2D19', '#1D2D44'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'diptych-pair'],
    recommendedCrop: 'cover-top',
  },
  {
    id: 'asset-img16',
    url: '/assets/aistudio/img16.jpg',
    filename: 'img16.jpg',
    format: 'jpeg',
    width: 736,
    height: 1104,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Bauhaus Ausstellung 1923 Isometric Cubes',
    subject: 'Historic Weimar Bauhaus exhibition poster with rhythmic 3D isometric cubes in primary colors',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [8, 10, 12, 22, 23, 28, 38, 49, 50],
    compatibleCategories: ['geometric-construct', 'pixel-retro', 'typographic-sculpture'],
    dominantPalette: ['#F2EBDC', '#D92B2B', '#1F4E8C'],
    tone: 'light',
    recommendedPlacements: ['focal-plate', 'diptych-pair', 'overlapping-cutout'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img17',
    url: '/assets/aistudio/img17.jpg',
    filename: 'img17.jpg',
    format: 'jpeg',
    width: 1440,
    height: 1440,
    aspectRatio: 1.0,
    hasTransparency: false,
    title: 'Midnight Ghost, Black Cat & Espresso',
    subject: 'Minimalist cream-and-black illustration of a friendly ghost holding a black cat and steaming coffee',
    visualCategory: 'noir-gothic-sketch',
    compatibleStyleIds: [7, 8, 9, 30, 31, 35, 36, 42],
    compatibleCategories: ['character-mascot', 'drafting-sketch'],
    dominantPalette: ['#141413', '#F5E9D4', '#C87A53'],
    tone: 'dark',
    recommendedPlacements: ['focal-plate', 'floating-badge'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img18',
    url: '/assets/aistudio/img18.png',
    filename: 'img18.png',
    format: 'png',
    width: 1024,
    height: 1536,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Bauhaus Architectural Fountain Piazza',
    subject: 'Constructivist courtyard and tiered fountain rendered in crisp primary red, ochre, cobalt, and sand',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [1, 10, 11, 17, 22, 28, 38, 39, 44, 50],
    compatibleCategories: ['geometric-construct', 'classical-sculpture', 'zen-ceramic'],
    dominantPalette: ['#E5D4B8', '#C83E2B', '#1B4353'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'diptych-pair'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img19',
    url: '/assets/aistudio/img19.png',
    filename: 'img19.png',
    format: 'png',
    width: 576,
    height: 1024,
    aspectRatio: 0.56,
    hasTransparency: false,
    title: 'Prismatic Art Deco Muse',
    subject: 'Faceted jewel-tone geometric portrait of a woman in deep indigo, magenta, coral, and gold',
    visualCategory: 'pop-street-character',
    compatibleStyleIds: [3, 4, 10, 13, 17, 18, 25, 26, 27, 36, 48],
    compatibleCategories: ['geometric-construct', 'glass-3d', 'fluid-atmospheric'],
    dominantPalette: ['#241E4E', '#D94E67', '#F2C166'],
    tone: 'vibrant',
    recommendedPlacements: ['focal-plate', 'diptych-pair'],
    recommendedCrop: 'cover-top',
  },
  {
    id: 'asset-img20',
    url: '/assets/aistudio/img20.png',
    filename: 'img20.png',
    format: 'png',
    width: 1024,
    height: 1536,
    aspectRatio: 0.67,
    hasTransparency: true,
    title: 'Mid-Century Italian Moka Pot Totem',
    subject: 'Sculptural geometric illustration of an octagonal stovetop espresso maker in burnt orange and teal',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [11, 12, 17, 20, 22, 27, 28, 34, 38, 39, 50],
    compatibleCategories: ['geometric-construct', 'mechanical-gear', 'zen-ceramic'],
    dominantPalette: ['#D94E28', '#225560', '#E8C56B'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout', 'floating-badge'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img21',
    url: '/assets/aistudio/img21.png',
    filename: 'img21.png',
    format: 'png',
    width: 1024,
    height: 1536,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Wabi-Sabi Bonsai & Misty Ridge',
    subject: 'Contemplative Japanese landscape with windswept pine tree, layered mountain mist, and terracotta sun',
    visualCategory: 'ukiyo-zen-botanical',
    compatibleStyleIds: [4, 6, 11, 13, 14, 15, 18, 39, 43, 44],
    compatibleCategories: ['zen-ceramic', 'botanical-organic', 'fluid-atmospheric'],
    dominantPalette: ['#D9CAB3', '#B86B43', '#3A4A3F'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'diptych-pair'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img22',
    url: '/assets/aistudio/img22.jpg',
    filename: 'img22.jpg',
    format: 'jpeg',
    width: 816,
    height: 1451,
    aspectRatio: 0.56,
    hasTransparency: false,
    title: 'Botanical Reverie & Golden Halo',
    subject: 'Poetic profile illustration framed by deep forest foliage and a glowing ochre solar disc',
    visualCategory: 'ukiyo-zen-botanical',
    compatibleStyleIds: [4, 5, 6, 11, 13, 14, 15, 16, 18, 36, 37, 43],
    compatibleCategories: ['botanical-organic', 'ornate-engraving', 'fluid-atmospheric'],
    dominantPalette: ['#2D4739', '#D99B4E', '#E8DFD1'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'diptych-pair'],
    recommendedCrop: 'cover-top',
  },
  {
    id: 'asset-img23',
    url: '/assets/aistudio/img23.jpg',
    filename: 'img23.jpg',
    format: 'jpeg',
    width: 4333,
    height: 5768,
    aspectRatio: 0.75,
    hasTransparency: false,
    title: 'High-Intensity Crosshatched Ink Avatar',
    subject: 'Dramatic monochrome pen-and-ink manga etching with fierce chiaroscuro lighting and raw energy lines',
    visualCategory: 'noir-gothic-sketch',
    compatibleStyleIds: [2, 9, 23, 24, 29, 30, 31, 33, 42, 46],
    compatibleCategories: ['drafting-sketch', 'ornate-engraving', 'cyber-schematic'],
    dominantPalette: ['#111111', '#E5E5E5', '#555555'],
    tone: 'monochrome',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'overlapping-cutout'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img24',
    url: '/assets/aistudio/img24.png',
    filename: 'img24.png',
    format: 'png',
    width: 1000,
    height: 1500,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Weimar 1923 Analog Turntable Poster',
    subject: 'Bauhaus constructivist exhibition poster featuring an isometric vinyl record player and primary geometry',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [10, 12, 17, 22, 23, 28, 34, 38, 39, 47, 50],
    compatibleCategories: ['geometric-construct', 'mechanical-gear', 'typographic-sculpture'],
    dominantPalette: ['#E8DEC8', '#D63222', '#1B4982'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout', 'diptych-pair'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img25',
    url: '/assets/aistudio/img25.jpg',
    filename: 'img25.jpg',
    format: 'jpeg',
    width: 1080,
    height: 1920,
    aspectRatio: 0.56,
    hasTransparency: false,
    title: 'Violet Twilight & White Gardenia Portrait',
    subject: 'Stylized editorial portrait with gold geometric earrings and white blossom against electric violet',
    visualCategory: 'pop-street-character',
    compatibleStyleIds: [3, 4, 13, 17, 18, 20, 21, 25, 26, 27, 36, 48],
    compatibleCategories: ['character-mascot', 'botanical-organic', 'fluid-atmospheric'],
    dominantPalette: ['#6C4AB6', '#F2A65A', '#1B1725'],
    tone: 'vibrant',
    recommendedPlacements: ['focal-plate', 'diptych-pair'],
    recommendedCrop: 'cover-top',
  },
  {
    id: 'asset-img26',
    url: '/assets/aistudio/img26.jpg',
    filename: 'img26.jpg',
    format: 'jpeg',
    width: 720,
    height: 1280,
    aspectRatio: 0.56,
    hasTransparency: false,
    title: 'Golden Hour Commuter Reverie',
    subject: 'Warm cinematic illustration of two travelers resting inside a sunlit vintage train carriage',
    visualCategory: 'architectural-scenic',
    compatibleStyleIds: [4, 11, 13, 14, 15, 35, 36, 39, 40, 41, 43],
    compatibleCategories: ['fluid-atmospheric', 'character-mascot', 'collage-scrapbook'],
    dominantPalette: ['#3A5A40', '#E09F3E', '#5E3023'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'diptych-pair'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img27',
    url: '/assets/aistudio/img27.jpg',
    filename: 'img27.jpg',
    format: 'jpeg',
    width: 720,
    height: 1283,
    aspectRatio: 0.56,
    hasTransparency: false,
    title: 'Minimalist Noir Silhouette & Spectacles',
    subject: 'Stark avant-garde monochrome character silhouette with luminous white round glasses on slate grey',
    visualCategory: 'noir-gothic-sketch',
    compatibleStyleIds: [1, 9, 10, 22, 23, 30, 31, 37, 38, 42, 50],
    compatibleCategories: ['typographic-sculpture', 'drafting-sketch', 'classical-sculpture'],
    dominantPalette: ['#0A0A0A', '#8C8C8C', '#FFFFFF'],
    tone: 'monochrome',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout', 'diptych-pair'],
    recommendedCrop: 'cover-top',
  },
  {
    id: 'asset-img28',
    url: '/assets/aistudio/img28.jpg',
    filename: 'img28.jpg',
    format: 'jpeg',
    width: 1000,
    height: 1415,
    aspectRatio: 0.71,
    hasTransparency: false,
    title: 'Cubist Acoustic & Vinyl Construct',
    subject: 'Mid-century abstract musical collage layering vinyl grooves, guitar fretboard, and terracotta planes',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [12, 13, 17, 22, 32, 33, 34, 39, 40, 49, 50],
    compatibleCategories: ['collage-scrapbook', 'geometric-construct', 'mechanical-gear'],
    dominantPalette: ['#C44536', '#D9AE61', '#282623'],
    tone: 'warm-earth',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'overlapping-cutout'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img29',
    url: '/assets/aistudio/img29.png',
    filename: 'img29.png',
    format: 'png',
    width: 1024,
    height: 1536,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Nordic-Bauhaus Geometric Tile Tapestry',
    subject: 'Modular architectural tile pattern of split circles and diagonals in navy, rust, ochre, and cream',
    visualCategory: 'bauhaus-geometric',
    compatibleStyleIds: [8, 11, 12, 17, 22, 28, 32, 38, 39, 44, 49, 50],
    compatibleCategories: ['geometric-construct', 'zen-ceramic', 'pixel-retro'],
    dominantPalette: ['#1D3557', '#C85A32', '#E9C46A'],
    tone: 'warm-earth',
    recommendedPlacements: ['edge-bleed-backdrop', 'diptych-pair', 'focal-plate'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img30',
    url: '/assets/aistudio/img30.jpg',
    filename: 'img30.jpg',
    format: 'jpeg',
    width: 1024,
    height: 1536,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Edo Washi Print: Cat with Catch',
    subject: 'Traditional woodblock illustration of a seated black cat holding a fish on textured ivory washi paper',
    visualCategory: 'ukiyo-zen-botanical',
    compatibleStyleIds: [1, 7, 9, 10, 11, 15, 35, 39, 40, 43],
    compatibleCategories: ['zen-ceramic', 'character-mascot', 'ornate-engraving'],
    dominantPalette: ['#EAE0C8', '#1F1E1B', '#9E3B33'],
    tone: 'light',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout', 'floating-badge'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img31',
    url: '/assets/aistudio/img31.jpg',
    filename: 'img31.jpg',
    format: 'jpeg',
    width: 2250,
    height: 3000,
    aspectRatio: 0.75,
    hasTransparency: false,
    title: 'Twin Celestial Orbs & Crimson Sakura',
    subject: 'Fine Japanese botanical print with cherry blossom boughs crossing overlapping teal and vermilion discs',
    visualCategory: 'ukiyo-zen-botanical',
    compatibleStyleIds: [4, 5, 6, 11, 13, 14, 16, 18, 32, 36, 43],
    compatibleCategories: ['botanical-organic', 'zen-ceramic', 'ornate-engraving'],
    dominantPalette: ['#EDE3CE', '#D1493E', '#489597'],
    tone: 'light',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'diptych-pair'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img32',
    url: '/assets/aistudio/img32.jpg',
    filename: 'img32.jpg',
    format: 'jpeg',
    width: 474,
    height: 842,
    aspectRatio: 0.56,
    hasTransparency: false,
    title: 'Bubblegum Pop Panther & Boba',
    subject: 'Playful monochrome pink pop-art character in dark sunglasses sipping boba tea',
    visualCategory: 'pop-street-character',
    compatibleStyleIds: [7, 12, 20, 21, 26, 27, 35, 36, 41, 48],
    compatibleCategories: ['character-mascot', 'glass-3d', 'collage-scrapbook'],
    dominantPalette: ['#F472B6', '#18181B', '#FBCFE8'],
    tone: 'vibrant',
    recommendedPlacements: ['focal-plate', 'floating-badge', 'overlapping-cutout'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img33',
    url: '/assets/aistudio/img33.jpg',
    filename: 'img33.jpg',
    format: 'jpeg',
    width: 1792,
    height: 2688,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Sumi-e Mountain Mist & Blood Moon',
    subject: 'Atmospheric ink-wash mountain ranges beneath a crimson solar sphere and blossoming cliffside sakura',
    visualCategory: 'ukiyo-zen-botanical',
    compatibleStyleIds: [1, 4, 5, 6, 11, 14, 18, 37, 42, 43],
    compatibleCategories: ['zen-ceramic', 'botanical-organic', 'fluid-atmospheric'],
    dominantPalette: ['#EFECE6', '#C94A4A', '#2B3A42'],
    tone: 'light',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'diptych-pair'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img34',
    url: '/assets/aistudio/img34.jpg',
    filename: 'img34.jpg',
    format: 'jpeg',
    width: 640,
    height: 1136,
    aspectRatio: 0.56,
    hasTransparency: false,
    title: 'Crimson Sith Constructivist Woodcut',
    subject: 'High-impact red, black, and white linocut helmeted figure extending an armored hand',
    visualCategory: 'noir-gothic-sketch',
    compatibleStyleIds: [19, 23, 24, 25, 27, 29, 30, 31, 34, 46, 47],
    compatibleCategories: ['cyber-schematic', 'character-mascot', 'mechanical-gear'],
    dominantPalette: ['#A4161A', '#0B090A', '#F5F3F4'],
    tone: 'dark',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout', 'diptych-pair'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img35',
    url: '/assets/aistudio/img35.jpg',
    filename: 'img35.jpg',
    format: 'jpeg',
    width: 810,
    height: 1440,
    aspectRatio: 0.56,
    hasTransparency: false,
    title: 'Electric Tangerine Audio Streetwear',
    subject: 'Contemporary high-saturation editorial illustration of a listener in studio headphones against neon orange',
    visualCategory: 'pop-street-character',
    compatibleStyleIds: [3, 20, 21, 24, 25, 26, 27, 29, 33, 41, 46, 48],
    compatibleCategories: ['character-mascot', 'synth-horizon', 'cyber-schematic'],
    dominantPalette: ['#FF5400', '#005F73', '#141414'],
    tone: 'vibrant',
    recommendedPlacements: ['focal-plate', 'diptych-pair'],
    recommendedCrop: 'cover-top',
  },
  {
    id: 'asset-img36',
    url: '/assets/aistudio/img36.jpg',
    filename: 'img36.jpg',
    format: 'jpeg',
    width: 2189,
    height: 3000,
    aspectRatio: 0.73,
    hasTransparency: false,
    title: 'Mount Fuji & Crimson Solar Medallion',
    subject: 'Minimalist Japanese woodblock emblem uniting snow-capped Fuji, wave ripples, and a red sun circle',
    visualCategory: 'ukiyo-zen-botanical',
    compatibleStyleIds: [1, 10, 11, 15, 17, 22, 39, 43, 44, 45],
    compatibleCategories: ['zen-ceramic', 'maritime-nautical', 'geometric-construct'],
    dominantPalette: ['#E5DEC9', '#9E2A2B', '#335C67'],
    tone: 'light',
    recommendedPlacements: ['focal-plate', 'diptych-pair', 'floating-badge'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img37',
    url: '/assets/aistudio/img37.jpg',
    filename: 'img37.jpg',
    format: 'jpeg',
    width: 736,
    height: 736,
    aspectRatio: 1.0,
    hasTransparency: false,
    title: 'Folklore Frog Mage Linocut',
    subject: 'Forest-green woodblock stamp of an amphibious wizard holding a skull-topped staff on parchment',
    visualCategory: 'noir-gothic-sketch',
    compatibleStyleIds: [2, 5, 6, 7, 9, 15, 16, 19, 31, 35, 37, 40, 42],
    compatibleCategories: ['character-mascot', 'ornate-engraving', 'drafting-sketch'],
    dominantPalette: ['#F4F1E6', '#1B4332', '#081C15'],
    tone: 'light',
    recommendedPlacements: ['focal-plate', 'floating-badge', 'overlapping-cutout'],
    recommendedCrop: 'contain',
  },
  {
    id: 'asset-img38',
    url: '/assets/aistudio/img38.png',
    filename: 'img38.png',
    format: 'png',
    width: 3000,
    height: 4500,
    aspectRatio: 0.67,
    hasTransparency: false,
    title: 'Stained-Glass Sakura & Cloisonné Lattice',
    subject: 'High-resolution graphic botanical cherry blossoms with bold black cloisonné outlines and pastel geometry',
    visualCategory: 'ukiyo-zen-botanical',
    compatibleStyleIds: [4, 5, 6, 12, 13, 14, 16, 18, 20, 27, 35, 36, 40, 41],
    compatibleCategories: ['botanical-organic', 'ornate-engraving', 'collage-scrapbook'],
    dominantPalette: ['#FF6B9D', '#FFD166', '#118AB2'],
    tone: 'vibrant',
    recommendedPlacements: ['focal-plate', 'edge-bleed-backdrop', 'overlapping-cutout'],
    recommendedCrop: 'cover-center',
  },
  {
    id: 'asset-img39',
    url: '/assets/aistudio/img39.webp',
    filename: 'img39.webp',
    format: 'webp',
    width: 928,
    height: 1232,
    aspectRatio: 0.75,
    hasTransparency: false,
    title: 'Synthwave Crimson & Midnight Vapor Portrait',
    subject: 'Neon red and deep indigo duotone portrait in dark shades exhaling stylized turquoise vapor',
    visualCategory: 'noir-gothic-sketch',
    compatibleStyleIds: [3, 21, 24, 25, 26, 27, 29, 30, 37, 46, 47, 48],
    compatibleCategories: ['synth-horizon', 'cyber-schematic', 'fluid-atmospheric'],
    dominantPalette: ['#EF233C', '#0F172A', '#F48C06'],
    tone: 'dark',
    recommendedPlacements: ['focal-plate', 'diptych-pair', 'edge-bleed-backdrop'],
    recommendedCrop: 'cover-top',
  },
];

const STORAGE_CUSTOM_ASSETS_KEY = 'shamil_tp_custom_illustration_assets_v1';

// Runtime registry of dynamically added or auto-discovered assets
let runtimeDiscoveredAssets: IllustrationAssetSpec[] = [];

export function loadCustomIllustrationAssets(): IllustrationAssetSpec[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_CUSTOM_ASSETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomIllustrationAssets(assets: IllustrationAssetSpec[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_CUSTOM_ASSETS_KEY, JSON.stringify(assets.slice(0, 60)));
  } catch {
    // Ignore storage quota limits
  }
}

/**
 * Infers default style compatibility and metadata for newly uploaded or auto-discovered assets
 * so the asset library expands seamlessly without manual configuration.
 */
export function createExpandableAssetSpec(input: {
  id?: string;
  url: string;
  filename: string;
  title?: string;
  subject?: string;
  visualCategory?: AssetVisualCategory;
  width?: number;
  height?: number;
  hasTransparency?: boolean;
}): IllustrationAssetSpec {
  const w = input.width || 1024;
  const h = input.height || 1365;
  const ratio = +(w / h).toFixed(2);
  const extMatch = input.filename.toLowerCase().match(/\.(png|webp|jpg|jpeg)$/);
  const format: 'jpeg' | 'png' | 'webp' =
    extMatch?.[1] === 'png'
      ? 'png'
      : extMatch?.[1] === 'webp'
      ? 'webp'
      : 'jpeg';
  const cat = input.visualCategory || 'pop-street-character';

  const defaultStyleMap: Record<AssetVisualCategory, number[]> = {
    'bauhaus-geometric': [10, 12, 17, 22, 23, 28, 38, 39, 49, 50],
    'ukiyo-zen-botanical': [4, 5, 6, 11, 13, 14, 15, 18, 36, 43],
    'pop-street-character': [7, 20, 21, 25, 26, 27, 29, 33, 35, 46],
    'noir-gothic-sketch': [2, 8, 9, 16, 19, 24, 30, 31, 37, 42],
    'architectural-scenic': [1, 3, 11, 17, 34, 39, 44, 45, 47, 48],
  };

  return {
    id: input.id || `asset-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    url: input.url,
    filename: input.filename,
    format,
    width: w,
    height: h,
    aspectRatio: ratio,
    hasTransparency: input.hasTransparency ?? format === 'png',
    title:
      input.title ||
      input.filename
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    subject:
      input.subject ||
      `Expanded studio illustration asset (${input.filename}) integrated into the generative poster engine`,
    visualCategory: cat,
    compatibleStyleIds: defaultStyleMap[cat],
    compatibleCategories: [
      'geometric-construct',
      'character-mascot',
      'botanical-organic',
      'collage-scrapbook',
    ],
    dominantPalette: ['#E63946', '#1D3557', '#F1FAEE'],
    tone: 'vibrant',
    recommendedPlacements: ['focal-plate', 'overlapping-cutout', 'diptych-pair'],
    recommendedCrop: ratio < 0.8 ? 'cover-center' : 'contain',
    isCustom: true,
  };
}

export function registerRuntimeAssets(newAssets: IllustrationAssetSpec[]): void {
  const existingIds = new Set([
    ...ILLUSTRATION_ASSETS_39.map((a) => a.id),
    ...runtimeDiscoveredAssets.map((a) => a.id),
  ]);
  for (const asset of newAssets) {
    if (!existingIds.has(asset.id)) {
      runtimeDiscoveredAssets.push(asset);
      existingIds.add(asset.id);
    }
  }
}

export function getAllIllustrationAssets(
  customAssets: IllustrationAssetSpec[] = []
): IllustrationAssetSpec[] {
  const seen = new Set<string>();
  const combined: IllustrationAssetSpec[] = [];
  for (const item of [
    ...customAssets,
    ...runtimeDiscoveredAssets,
    ...ILLUSTRATION_ASSETS_39,
  ]) {
    if (!seen.has(item.id) && !seen.has(item.url)) {
      seen.add(item.id);
      seen.add(item.url);
      combined.push(item);
    }
  }
  return combined;
}

/**
 * Automatic runtime asset discovery for future images added to /public/assets/aistudio/
 * Checks optional /assets/aistudio/manifest.json or probes sequential img40..img48 files.
 */
export async function discoverAdditionalAssets(): Promise<IllustrationAssetSpec[]> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return [];
  }

  const discovered: IllustrationAssetSpec[] = [];

  try {
    const res = await fetch('/assets/aistudio/manifest.json', { method: 'GET' });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const entry of data) {
            if (entry && typeof entry.filename === 'string') {
              discovered.push(
                createExpandableAssetSpec({
                  id: entry.id || `asset-${entry.filename}`,
                  url: entry.url || `/assets/aistudio/${entry.filename}`,
                  filename: entry.filename,
                  title: entry.title,
                  subject: entry.subject,
                  visualCategory: entry.visualCategory,
                })
              );
            }
          }
        }
      }
    }
  } catch {
    // Optional manifest not present; continue silently
  }

  if (discovered.length > 0) {
    registerRuntimeAssets(discovered);
  }
  return discovered;
}

/**
 * Scores how well an illustration asset complements a synthesized art direction.
 */
export function scoreAssetCompatibility(
  asset: IllustrationAssetSpec,
  artDirection: SynthesizedArtDirection
): number {
  let score = 1;

  // 1. Direct Style ID compatibility (including parent styles in hybrid combinations)
  const activeStyleIds = artDirection.parentStyles.map((p) => p.id);
  if (!activeStyleIds.includes(artDirection.id) && artDirection.id <= 50) {
    activeStyleIds.push(artDirection.id);
  }

  for (const styleId of activeStyleIds) {
    if (asset.compatibleStyleIds.includes(styleId)) {
      score += 14;
    }
  }

  // 2. Illustration Category match
  if (asset.compatibleCategories.includes(artDirection.illustrationCategory)) {
    score += 9;
  }

  // 3. Tone & luminosity harmony
  if (artDirection.isDark && (asset.tone === 'dark' || asset.tone === 'vibrant')) {
    score += 4;
  } else if (!artDirection.isDark && (asset.tone === 'light' || asset.tone === 'warm-earth')) {
    score += 4;
  }

  return score;
}

/**
 * Scores how well a companion asset visually harmonizes with the primary asset in a multi-image collage.
 */
export function scoreEnsembleHarmony(
  primary: IllustrationAssetSpec,
  candidate: IllustrationAssetSpec
): number {
  if (primary.id === candidate.id) return 0;
  let harmony = 2;

  // Same visual family creates strong curatorial cohesion
  if (candidate.visualCategory === primary.visualCategory) {
    harmony += 10;
  }

  // Shared style compatibility
  const sharedStyles = candidate.compatibleStyleIds.filter((id) =>
    primary.compatibleStyleIds.includes(id)
  ).length;
  harmony += Math.min(8, sharedStyles * 2);

  // Tone affinity
  if (candidate.tone === primary.tone) {
    harmony += 4;
  } else if (
    (primary.tone === 'warm-earth' && candidate.tone === 'light') ||
    (primary.tone === 'light' && candidate.tone === 'warm-earth') ||
    (primary.tone === 'dark' && candidate.tone === 'vibrant') ||
    (primary.tone === 'vibrant' && candidate.tone === 'dark')
  ) {
    harmony += 3;
  }

  // Aspect ratio variety bonus for dynamic multi-scale collage layouts
  if (Math.abs(candidate.aspectRatio - primary.aspectRatio) >= 0.08) {
    harmony += 3;
  }

  return harmony;
}

/**
 * Selects a cohesive 4-asset ensemble (primary, secondary, tertiary, quaternary) for a poster,
 * weighted by style compatibility and inter-image harmony while avoiding recently used assets.
 */
export function selectAssetsForStyle(
  artDirection: SynthesizedArtDirection,
  rng: () => number,
  options?: {
    customAssets?: IllustrationAssetSpec[];
    excludeAssetIds?: string[];
    forceAssetId?: string;
  }
): {
  primaryAsset: IllustrationAssetSpec;
  secondaryAsset: IllustrationAssetSpec;
  ensembleAssets: IllustrationAssetSpec[];
  compatiblePoolSize: number;
} {
  const pool = getAllIllustrationAssets(options?.customAssets);
  const excludeSet = new Set(options?.excludeAssetIds || []);

  // Score all assets against the active style
  const scored = pool.map((asset) => {
    const rawScore = scoreAssetCompatibility(asset, artDirection);
    const penalty = excludeSet.has(asset.id) ? 0.14 : 1;
    const jitter = 0.84 + rng() * 0.36;
    return {
      asset,
      weight: rawScore * penalty * jitter,
      rawScore,
    };
  });

  scored.sort((a, b) => b.weight - a.weight);

  let primaryAsset = scored[0].asset;

  if (options?.forceAssetId) {
    const forced = pool.find((a) => a.id === options.forceAssetId);
    if (forced) {
      primaryAsset = forced;
    }
  } else {
    const topCandidates = scored.slice(0, Math.min(7, scored.length));
    const totalWeight = topCandidates.reduce((acc, item) => acc + item.weight, 0);
    let pick = rng() * totalWeight;
    for (const candidate of topCandidates) {
      pick -= candidate.weight;
      if (pick <= 0) {
        primaryAsset = candidate.asset;
        break;
      }
    }
  }

  // Build a 4-asset ensemble by scoring remaining candidates on both style fit AND visual harmony with primaryAsset
  const pickedIds = new Set<string>([primaryAsset.id]);
  const ensembleAssets: IllustrationAssetSpec[] = [primaryAsset];

  const companionScored = pool
    .filter((a) => a.id !== primaryAsset.id)
    .map((candidate) => {
      const styleScore = scoreAssetCompatibility(candidate, artDirection);
      const harmonyScore = scoreEnsembleHarmony(primaryAsset, candidate);
      const penalty = excludeSet.has(candidate.id) ? 0.25 : 1;
      const jitter = 0.82 + rng() * 0.38;
      return {
        asset: candidate,
        weight: (styleScore + harmonyScore) * penalty * jitter,
      };
    })
    .sort((a, b) => b.weight - a.weight);

  for (let slot = 1; slot < 4; slot++) {
    const available = companionScored.filter((c) => !pickedIds.has(c.asset.id));
    if (available.length === 0) break;
    const windowSize = Math.min(6, available.length);
    const slice = available.slice(0, windowSize);
    const sliceWeight = slice.reduce((acc, item) => acc + item.weight, 0);
    let roll = rng() * sliceWeight;
    let chosen = slice[0].asset;
    for (const item of slice) {
      roll -= item.weight;
      if (roll <= 0) {
        chosen = item.asset;
        break;
      }
    }
    pickedIds.add(chosen.id);
    ensembleAssets.push(chosen);
  }

  const secondaryAsset = ensembleAssets[1] || primaryAsset;
  const compatiblePoolSize = scored.filter((s) => s.rawScore >= 10).length;

  return {
    primaryAsset,
    secondaryAsset,
    ensembleAssets,
    compatiblePoolSize: Math.max(1, compatiblePoolSize),
  };
}
