export interface PortfolioIdentity {
  fullName: string;
  handle: string;
  primaryRole: string;
  academicStatus: string;
  location: string;
  email: string;
  phone: string;
  domains: string[];
  github: string;
  linkedin: string;
  twitter: string;
  subdomains: { url: string; label: string }[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location: string;
  period: string;
  status: string;
  detail?: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  organization: string;
  location: string;
  period: string;
  teamSize: string;
  technologies: string[];
  highlights: string[];
}

export interface HackathonEntry {
  id: string;
  title: string;
  eventType: string;
  organizer: string;
  location: string;
  dates: string;
  result: string;
  projectBuilt?: string;
  credentialId?: string;
}

export interface ProjectDossier {
  id: string;
  index: string;
  name: string;
  shortName: string;
  tagline: string;
  slug: string;
  category: string;
  ownership: string;
  liveUrl?: string;
  docsUrl?: string;
  repoUrl?: string;
  techStack: string[];
  metrics: string[];
  highlights: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface PortfolioPhoto {
  id: string;
  url: string;
  caption: string;
  mood: string;
  aspectHint: 'square' | 'portrait';
}

export interface ParsedKnowledgeBase {
  identity: PortfolioIdentity;
  education: EducationEntry[];
  experiences: ExperienceEntry[];
  hackathons: HackathonEntry[];
  projects: ProjectDossier[];
  skills: SkillGroup[];
  infrastructureSummary: string[];
  photos: PortfolioPhoto[];
}

export interface PosterDataSlice {
  focalProject: ProjectDossier;
  secondaryProject: ProjectDossier;
  featuredExperience: ExperienceEntry;
  featuredHackathon: HackathonEntry;
  featuredSkillGroup: SkillGroup;
  featuredEducation: EducationEntry;
  photo: PortfolioPhoto;
  searchQuery: string;
  matchCount: number;
  matchSummary: string;
}

export const DEFAULT_PHOTOS: PortfolioPhoto[] = [
  {
    id: 'photo-coastal',
    url: '/assets/aistudio/dp_0e27f21b.jpg',
    caption: 'Shamil TP · Coastal Horizon',
    mood: 'Architectural & Contemplative',
    aspectHint: 'square',
  },
  {
    id: 'photo-hackathon',
    url: '/assets/aistudio/WA_1791902870441_721ea694.jpeg',
    caption: 'Shamil TP · 24h Hackathon Systems Build',
    mood: 'High-Focus Engineering',
    aspectHint: 'portrait',
  },
  {
    id: 'photo-portrait',
    url: '/assets/aistudio/profile-700_c6decb6b.webp',
    caption: 'Shamil TP · Studio Portrait',
    mood: 'Editorial Monograph',
    aspectHint: 'square',
  },
];

export const INITIAL_RAW_MARKDOWN = `# SHAMIL TP — STRUCTURED PORTFOLIO DOCUMENTATION & FACTUAL KNOWLEDGE BASE

## 1. PERSONAL IDENTITY & CONTACT INFORMATION
- **Full Name:** Shamil TP
- **Primary Handle:** shamil-tp
- **Primary Role:** Backend-Focused Full Stack Developer
- **Current Academic Status:** Master of Computer Applications (MCA) Student (2026–2028 batch)
- **Location:** Kozhikode (Calicut), Kerala, India
- **Email:** shamiltp073@gmail.com
- **Phone:** +91 79027 86927
`;

const STRUCTURED_PROJECTS: ProjectDossier[] = [
  {
    id: 'opspilot',
    index: '01',
    name: 'OpsPilot — Agentic Incident Response & DevOps Copilot',
    shortName: 'OpsPilot',
    tagline: 'Deterministic 7-Step Incident State Machine & Citation-Grounded SRE Platform',
    slug: 'opspilot',
    category: 'AI-Assisted Incident Response, SRE & DevOps Platform',
    ownership: 'Repo Owner & Backend Architect (4-Member Team · Top 37 Gateways 2026)',
    liveUrl: 'https://opspilot.shamiltp.me',
    docsUrl: 'https://fast.shamiltp.me/docs',
    repoUrl: 'https://github.com/shamil-tp/OopsPilot',
    techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Async SQLAlchemy', 'Alembic', 'Pydantic', 'Next.js', 'Docker', 'Nginx'],
    metrics: ['33 REST & WS Endpoints', '10 PostgreSQL Tables', '7-Step State Machine', 'Top 37 Finalist'],
    highlights: [
      'Enforces deterministic progression (Detect -> Investigate -> Root Cause -> Remediate -> Approval -> Verify -> Report) with HTTP 409 conflict guards.',
      'Collects bounded ±10 minute anomaly logs and requires Pydantic-validated evidence_id citations.',
      'Validates HMAC-SHA256 GitHub webhooks with automatic secret redaction prior to PR risk analysis.',
    ],
  },
  {
    id: 'rewind',
    index: '02',
    name: 'Rewind — Self-Hosted Music Streaming Server',
    shortName: 'Rewind',
    tagline: 'Single-Binary Go & Embedded Svelte PWA Lossless Audio Streamer',
    slug: 'rewind',
    category: 'Self-Hosted Systems Programming & Audio Streaming Server',
    ownership: '100% Solo Project · v1.2.0 · Apache-2.0 License',
    repoUrl: 'https://github.com/shamil-tp/rewind',
    techStack: ['Go (Golang)', 'net/http', 'embed.FS', 'SQLite', 'Svelte', 'TagLib', 'Argon2id', 'systemd', 'Tailscale'],
    metrics: ['Single Static Binary', 'RFC 7233 Byte-Range', '30 Go Test Files', 'Zero Runtime Deps'],
    highlights: [
      'Compiles Svelte PWA into the Go binary via embed.FS with single-file SQLite state and 4 automated schema migrations.',
      'Streams lossless FLAC, MP3, M4A, Ogg, and WAV via RFC 7233 HTTP 206 Partial Content byte-range requests.',
      'Hardened localhost binding, Argon2id auth, symlink confinement, and automated systemd health-check rollback.',
    ],
  },
  {
    id: 'lume',
    index: '03',
    name: 'LUME (v2) — Asynchronous Video Streaming Platform',
    shortName: 'LUME v2',
    tagline: '5-Stage Event-Driven Tus Upload, BullMQ FFmpeg HLS & Cloudflare R2 Pipeline',
    slug: 'lume',
    category: 'Distributed Media Ingestion, Transcoding & Adaptive Streaming',
    ownership: '100% Solo Project · 67 Commits · v2 Redesign',
    liveUrl: 'https://lume-one.vercel.app/',
    repoUrl: 'https://github.com/shamil-tp/LUME',
    techStack: ['Node.js', 'Express.js', 'BullMQ', 'Redis', 'tus-node-server', 'FFmpeg', 'Cloudflare R2', 'MongoDB', 'React.js', 'hls.js'],
    metrics: ['5-Stage Async Pipeline', 'Resumable Tus Chunks', 'HLS .m3u8 / .ts', 'Zero-Egress R2 Sync'],
    highlights: [
      'Decoupled resumable video ingestion via Uppy and tus-node-server from CPU-heavy transcoding via Redis BullMQ queues.',
      'Isolated Node.js worker slices video via fluent-ffmpeg into adaptive HLS .m3u8 manifests and .ts segments.',
      'Syncs segments to Cloudflare R2 via AWS S3 SDK and cleans local disk automatically.',
    ],
  },
  {
    id: 'regretmap',
    index: '04',
    name: 'RegretMap — Community Geospatial Travel Lessons Platform',
    shortName: 'RegretMap',
    tagline: 'Interactive Leaflet Density Map & Story-Grounded Travel Intelligence PWA',
    slug: 'regretmap',
    category: 'Geospatial Community Platform & Grounded AI PWA',
    ownership: 'Repo Owner & Data/Map Architect (2-Member Team · Top 13 Layover 2026)',
    liveUrl: 'https://regret-map.shamiltp.me/',
    repoUrl: 'https://github.com/shamil-tp/RegretMap',
    techStack: ['Next.js App Router', 'React 19', 'TypeScript', 'Leaflet', 'Supabase PostgreSQL', 'Row Level Security', 'Zod', 'Vitest'],
    metrics: ['Top 13 @ Layover 2026', '9 SQL Migrations', 'RLS Protected', 'Rotating Key Pool'],
    highlights: [
      'Interactive Leaflet geospatial canvas with coordinate pins, density heatmap toggling, and proxied Photon geocoding.',
      '9 sequential PostgreSQL migrations on Supabase enforcing Row Level Security across stories, votes, and threaded comments.',
      'Round-robin API key pool with automatic failover retry on HTTP 429 rate-limit thresholds.',
    ],
  },
  {
    id: 'blogify',
    index: '05',
    name: 'Blogify — OWASP-Hardened Full Stack Publishing Platform',
    shortName: 'Blogify',
    tagline: '10-Layer OWASP Top 10 Hardened Express 5 REST Architecture',
    slug: 'blogify',
    category: 'Security-First Full Stack Content Publishing Platform',
    ownership: 'Lead Developer · 100% Backend & Security Architecture (131 Commits)',
    liveUrl: 'https://blogify-7mdx.vercel.app/',
    repoUrl: 'https://github.com/shamil-tp/Blogify',
    techStack: ['Node.js', 'Express.js 5', 'MongoDB', 'Argon2id', 'Dual JWT Rotation', 'Google OAuth 2.0', 'Zod', 'Helmet.js', 'React.js'],
    metrics: ['10-Layer OWASP Stack', 'Argon2id Hashing', 'Dual JWT Rotation', '131 Git Commits'],
    highlights: [
      'Engineered memory-hard Argon2id password hashing paired with short-lived access tokens and rotating refresh tokens.',
      'Cryptographic backend verification of Google OAuth 2.0 ID tokens and strict Zod request validation middleware.',
      'Hardened with Helmet CSP/HSTS, HTTP Parameter Pollution (hpp) guards, IP rate-limiting, and collision-resistant NanoID slugs.',
    ],
  },
  {
    id: 'brl',
    index: '06',
    name: 'blog-Rendering-Library — Zero-Dependency DOM Engine',
    shortName: 'blog-Rendering-Lib',
    tagline: 'Pure Vanilla JS JSON-to-DOM Renderer with 15+ Dynamic CSS Variable Themes',
    slug: 'brl',
    category: 'Open-Source JavaScript Library & Theme Engine',
    ownership: 'Solo Primary Author · MIT License',
    liveUrl: 'https://shamil-tp.github.io/blog-Rendering-Library/?slug=messis-world-cup-glory-48qNNV&theme=tokyo_night',
    repoUrl: 'https://github.com/shamil-tp/blog-Rendering-Library',
    techStack: ['Vanilla JavaScript (ES6+)', 'Browser DOM API', 'CSS Custom Properties', 'GitHub Actions', 'GitHub Pages'],
    metrics: ['0 NPM Dependencies', '15+ Live Themes', 'Direct JSON-to-DOM', 'MIT Open Source'],
    highlights: [
      'Built library_V2.js using pure document.createElement manipulation without React, Vue, or external markdown libraries.',
      'Transforms structured JSON payloads directly into semantic headings, code blocks, quotes, and responsive figures.',
      'Supports instant URL-driven theme switching across 15+ palettes including Tokyo Night, Dracula, Gruvbox, and Nord.',
    ],
  },
  {
    id: 'njin',
    index: '07',
    name: 'N-jin — Concurrent Web Crawler & Localized Search Engine',
    shortName: 'N-jin Search',
    tagline: '10-Generation Iterative Web Crawler Indexing 250,000+ Pages with Redis Cache',
    slug: 'njin',
    category: 'Web Crawler, Information Retrieval & Search Engine',
    ownership: 'Repo Owner & Core Crawler/Indexing Engineer (3-Person R&D Team)',
    liveUrl: 'https://magnificent-recreation-production.up.railway.app/',
    repoUrl: 'https://github.com/shamil-tp/web-crawler',
    techStack: ['Node.js', 'Express.js', 'Cheerio', 'jsdom', 'MongoDB Aggregation', 'Redis', 'Axios', 'EJS', 'Railway'],
    metrics: ['250,000+ Pages Indexed', 'Sub-50ms Redis Cache', '10 Crawler Generations', 'FIFO Queue Frontier'],
    highlights: [
      'Evolved crawler architecture across 10 iterations (crawlerV1 to crawlerV10), replacing recursion with an explicit FIFO queue frontier.',
      'Implemented Set-based URL normalization, Map-based PageRank link authority scoring, and adaptive concurrency throttling.',
      'Ranked results via multi-stage MongoDB aggregation pipelines backed by a sub-50ms Redis query cache.',
    ],
  },
  {
    id: 'osmium',
    index: '08',
    name: 'Osmium — Lossless Text Compression Utility',
    shortName: 'Osmium',
    tagline: 'First-Principles LZ77, Run-Length Encoding & Huffman Coding in Pure JS',
    slug: 'osmium',
    category: 'Data Compression & Algorithmic Systems Project',
    ownership: '100% Solo Project',
    liveUrl: 'https://osmium-production.up.railway.app',
    repoUrl: 'https://github.com/shamil-tp/osmium',
    techStack: ['JavaScript (ES6+)', 'Node.js', 'Express.js', 'LZ77 Sliding Window', 'Huffman Trees', 'RLE', 'EJS'],
    metrics: ['Zero Compression Libs', '3 Core Algorithms', 'Bit-Level Prefix Trees', 'Lossless Restore'],
    highlights: [
      'Implemented lossless text compression from scratch in pure JavaScript without zlib or external npm compression packages.',
      'Combines LZ77 sliding-window `[distance, length]` back-references, Run-Length Encoding (RLE), and Huffman frequency trees.',
      'Provides interactive byte-size inspection, compression ratio telemetry, and binary-exact file restoration.',
    ],
  },
  {
    id: 'skylark',
    index: '09',
    name: 'Skylark — Rent-A-Car Booking & Fleet Management Platform',
    shortName: 'Skylark',
    tagline: 'Vue 3 Multi-Layout SPA, End-to-End Admin Analytics & Razorpay HMAC Verification',
    slug: 'skylark',
    category: 'Commercial Vehicle Reservation & Fleet Administration Platform',
    ownership: 'Lead Developer · Vue 3 SPA Architect & Admin/Payment Engineer',
    liveUrl: 'https://skylark-frontend-eqdt.onrender.com',
    repoUrl: 'https://github.com/sinanrahman/skylark',
    techStack: ['Vue.js 3', 'Composition API', 'Pinia', 'Vue Router', 'Chart.js', 'Node.js', 'Express.js', 'MongoDB', 'Razorpay SDK'],
    metrics: ['3 SPA Layout Shells', 'HMAC-SHA256 Payments', 'Chart.js Analytics', '~6.7k Lines Shipped'],
    highlights: [
      'Architected Vue 3 SPA with AdminLayout, AuthLayout, and MainLayout guarded by role-aware Vue Router navigation interceptors.',
      'Built the complete Admin Portal featuring Chart.js revenue analytics, Fleet CRUD, booking lifecycle control, and issue ticketing.',
      'Secured reservations with server-side Razorpay HMAC-SHA256 signature verification and Nodemailer OTP workflows.',
    ],
  },
  {
    id: 'coffeecat',
    index: '10',
    name: 'coffeeCat — Mobile-First Real-Time Social Network',
    shortName: 'coffeeCat',
    tagline: 'Socket.io Persistent Rooms, 5 Vuex Modules & Cascading Account Anonymization',
    slug: 'coffeecat',
    category: 'Real-Time Social Graph & Instant Messaging Web Application',
    ownership: '100% Solo Project',
    liveUrl: 'https://coffee-cat-topaz.vercel.app/login',
    repoUrl: 'https://github.com/shamil-tp/coffeeCat',
    techStack: ['Vue.js 3', 'Vuex', 'Socket.io', 'Node.js', 'Express.js', 'MongoDB', 'Cloudinary CDN', 'Multer', 'JWT'],
    metrics: ['6 MongoDB Collections', '5 Vuex State Modules', 'Live Socket.io Rooms', 'Safe Cascade Delete'],
    highlights: [
      'Blends an Instagram-style media feed with real-time 1-to-1 instant messaging over persistent Socket.io WebSocket rooms.',
      'Orchestrates 5 modular Vuex client stores synced with 6 normalized MongoDB collections and Cloudinary CDN uploads.',
      'Engineered cascading account deletion that purges user media while preserving anonymized shared chat histories.',
    ],
  },
  {
    id: 'emvbazar',
    index: '11',
    name: 'EMVBazar — Debt Tracking & Automated Billing System',
    shortName: 'EMVBazar',
    tagline: 'Production Progressive Web App & AWS Cloud Infrastructure for Automated Billing',
    slug: 'emvbazar',
    category: 'Client-Commissioned Financial Ledger, PWA & Billing Automation',
    ownership: 'PWA & AWS Cloud Server Developer (2-Member Production Client Project)',
    liveUrl: 'https://shamiltp.me/myProjectDetails/emvbazar.html',
    techStack: ['Progressive Web App (PWA)', 'AWS Cloud Server', 'Linux Administration', 'Service Workers', 'Automated Billing'],
    metrics: ['Paid Client System', 'AWS Production Cloud', 'Offline-Ready PWA', 'WhatsApp Ledger Sync'],
    highlights: [
      'Engineered the client application as an installable Progressive Web App (PWA) with mobile homescreen and offline resilience.',
      'Provisioned, configured, hardened, and maintained the entire production AWS cloud server environment.',
      'Powers automated customer debt ledgers, invoice generation, and scheduled WhatsApp billing reminders.',
    ],
  },
  {
    id: 'tutora',
    index: '12',
    name: 'Tutora — Multi-Role Education Management Platform',
    shortName: 'Tutora',
    tagline: 'Role-Based Academic Operations Platform for 4 Stakeholder Groups',
    slug: 'tutora',
    category: 'Client-Commissioned Education Operations & RBAC Platform',
    ownership: 'Full Stack Developer (7-Member Cross-Functional Client Team)',
    liveUrl: 'https://shamiltp.me/myProjectDetails/tutora.html',
    techStack: ['Full Stack Web', 'Role-Based Access Control (RBAC)', 'REST APIs', 'Multi-Tenant Views', 'Git Workflows'],
    metrics: ['4 Stakeholder Roles', '7-Developer Team', 'Production Client App', 'Granular RBAC'],
    highlights: [
      'Delivered a centralized academic and administrative operations suite commissioned by a regional tutoring organization.',
      'Implemented strict role-based views and permission boundaries serving students, teachers, coordinators, and parents.',
      'Collaborated across a 7-developer engineering team with structured branch workflows and code reviews.',
    ],
  },
];

export function parsePortfolioMarkdown(rawMarkdown: string, customPhotos: PortfolioPhoto[] = []): ParsedKnowledgeBase {
  const text = rawMarkdown || INITIAL_RAW_MARKDOWN;

  // Extract dynamic overrides from markdown if user edits text
  const nameMatch = text.match(/\*\*Full Name:\*\*\s*([^\n(]+)/i);
  const roleMatch = text.match(/\*\*Primary Role:\*\*\s*([^\n]+)/i);
  const locationMatch = text.match(/\*\*Location:\*\*\s*([^\n]+)/i);
  const emailMatch = text.match(/\*\*Email:\*\*\s*([^\n]+)/i);
  const phoneMatch = text.match(/\*\*Phone:\*\*\s*([^\n]+)/i);
  const academicMatch = text.match(/\*\*Current Academic Status:\*\*\s*([^\n]+)/i);

  const identity: PortfolioIdentity = {
    fullName: nameMatch ? nameMatch[1].trim() : 'Shamil TP',
    handle: 'shamil-tp',
    primaryRole: roleMatch ? roleMatch[1].trim() : 'Backend-Focused Full Stack Developer',
    academicStatus: academicMatch
      ? academicMatch[1].trim()
      : 'Master of Computer Applications (MCA) Student (2026–2028)',
    location: locationMatch ? locationMatch[1].trim() : 'Kozhikode (Calicut), Kerala, India',
    email: emailMatch ? emailMatch[1].trim() : 'shamiltp073@gmail.com',
    phone: phoneMatch ? phoneMatch[1].trim() : '+91 79027 86927',
    domains: ['https://shamiltp.life', 'https://shamiltp.me'],
    github: 'https://github.com/shamil-tp',
    linkedin: 'https://www.linkedin.com/in/shamil-tp/',
    twitter: 'https://x.com/ShamilTp6',
    subdomains: [
      { url: 'https://opspilot.shamiltp.me', label: 'OpsPilot Live App' },
      { url: 'https://fast.shamiltp.me/docs', label: 'OpsPilot FastAPI Docs' },
      { url: 'https://regret-map.shamiltp.me/', label: 'RegretMap Live PWA' },
    ],
  };

  const education: EducationEntry[] = [
    {
      degree: 'Master of Computer Applications (MCA)',
      institution: "St. Joseph's College (Autonomous), Devagiri",
      location: 'Kozhikode, Kerala, India',
      period: '2026 – 2028',
      status: 'In Progress',
      detail: 'Postgraduate Systems & Software Engineering Track',
    },
    {
      degree: 'Bachelor of Computer Application (BCA)',
      institution: 'Safi Institute of Advanced Study',
      location: 'Vazhayoor, Kerala, India',
      period: 'Graduated March 2025',
      status: 'Completed · CGPA 7.76 / 10.0',
      detail: 'Foundations in Algorithms, Databases & Web Architecture',
    },
  ];

  const experiences: ExperienceEntry[] = [
    {
      id: 'exp-fugipie',
      title: 'Full Stack Development Intern',
      organization: 'Fugipie Technologies',
      location: 'Kerala, India',
      period: 'Dec 2024 – Mar 2025 (4 Months)',
      teamSize: '7 Developers',
      technologies: [
        'Node.js',
        'Express.js',
        'MongoDB',
        'Mongoose',
        'React.js',
        'Vue.js',
        'Zod',
        'JWT & BcryptJS',
        'Helmet.js & HPP',
        'Razorpay API',
      ],
      highlights: [
        'Designed & deployed RESTful APIs with Zod schema validation across 15+ endpoints.',
        'Engineered stateless JWT authentication, BcryptJS hashing, Helmet.js, rate-limiting & HPP protection.',
        'Integrated Razorpay payment webhooks with cryptographic HMAC signature verification.',
      ],
    },
    {
      id: 'exp-freelance',
      title: 'Freelance Full Stack & Cloud Developer',
      organization: 'Independent Client Engagements (EMVBazar & Tutora)',
      location: 'Kerala, India',
      period: 'Nov 2023 – Present',
      teamSize: '2 to 7 Members',
      technologies: ['PWA', 'AWS Cloud Server', 'Node.js', 'Role-Based Access Control', 'Linux Production Ops'],
      highlights: [
        'EMVBazar: Built installable offline-ready PWA and provisioned/maintained the production AWS cloud server.',
        'Tutora: Engineered role-based views and permissions across students, teachers, coordinators, and parents.',
      ],
    },
  ];

  const hackathons: HackathonEntry[] = [
    {
      id: 'hack-layover',
      title: 'Layover 2026 Overnight Hackathon',
      eventType: 'Overnight Hackathon',
      organizer: 'TinkerHub · TinkerSpace Calicut',
      location: 'Kozhikode, Kerala',
      dates: '10–11 October 2026',
      result: 'Top 13 Finalist',
      projectBuilt: 'RegretMap (regret-map.shamiltp.me)',
    },
    {
      id: 'hack-gateways',
      title: 'Gateways 2026 (24° Shift) International Hackathon',
      eventType: 'International Hackathon',
      organizer: 'CHRIST (Deemed to be University)',
      location: 'Bangalore, Karnataka',
      dates: '30 Sep – 1 Oct 2026',
      result: 'Top 37 Finalist',
      projectBuilt: 'OpsPilot (opspilot.shamiltp.me)',
      credentialId: 'GW26-REG-174658',
    },
    {
      id: 'cert-mern',
      title: 'MERN Stack Web Development Certification',
      eventType: '6-Month Professional Certification',
      organizer: 'DataTribe',
      location: 'Kerala, India',
      dates: 'May 2025 – Nov 2025',
      result: 'Grade A+',
      credentialId: 'MERN2A08',
    },
    {
      id: 'hack-aiunplugged',
      title: 'AI Unplugged 2026 International Symposium',
      eventType: 'International Symposium on AI',
      organizer: "St. Joseph's College (Autonomous), Devagiri",
      location: 'Kozhikode, Kerala',
      dates: '13 July 2026',
      result: 'Official Participant',
    },
    {
      id: 'hack-beyondus',
      title: 'Beyond Us 2023 — 24-Hour Hackathon',
      eventType: '24-Hour Online Hackathon',
      organizer: 'GTech µLearn & KKEM',
      location: 'Online',
      dates: '8–9 July 2023',
      result: 'Participant · Credential µ2023B10090',
      credentialId: 'µ2023B10090',
    },
  ];

  const skills: SkillGroup[] = [
    {
      category: 'Languages & Systems Runtimes',
      items: ['Go (Golang)', 'Python', 'TypeScript', 'JavaScript (ES6+)', 'SQL', 'Bash / Shell', 'MicroPython'],
    },
    {
      category: 'Backend & API Architecture',
      items: ['FastAPI', 'Node.js', 'Express.js (v4 & v5)', 'Go net/http & embed.FS', 'REST', 'Socket.io & WebSockets', 'RFC 7233 Byte-Range', 'Tus Resumable Uploads'],
    },
    {
      category: 'Databases, Caching & Queues',
      items: ['PostgreSQL (Async SQLAlchemy & Alembic)', 'Supabase & RLS', 'MongoDB (Mongoose & Aggregations)', 'SQLite (WAL Mode)', 'Redis & BullMQ'],
    },
    {
      category: 'Media, Cloud & Self-Hosted Infra',
      items: ['Ubuntu Home Server & Nginx', 'AWS Cloud Server', 'Cloudflare R2 (S3 SDK)', 'FFmpeg & HLS (.m3u8/.ts)', 'Docker & GitHub Actions CI/CD', 'systemd & Tailscale'],
    },
    {
      category: 'Security & Cryptography',
      items: ['OWASP Top 10 Hardening', 'Argon2id & BcryptJS', 'Dual JWT Rotation', 'Google OAuth 2.0', 'HMAC-SHA256 Webhooks', 'Zod & Pydantic', 'Helmet.js & HPP'],
    },
    {
      category: 'Frontend & Embedded IoT Lab',
      items: ['React 19 & Next.js', 'Vue.js 3 (Pinia & Vuex)', 'Svelte PWA', 'Tailwind CSS', 'Leaflet Geospatial', 'ESP32 & Raspberry Pi Pico 2 W'],
    },
  ];

  const infrastructureSummary = [
    'Personal Ubuntu Home Server with Nginx reverse proxy hosting opspilot.shamiltp.me, fast.shamiltp.me & regret-map.shamiltp.me',
    'Automated GitHub Actions CI/CD pipelines: Ruff/gofmt linting, live PostgreSQL pytest containers, Go race/fuzz tests & SSH deploys',
    'IoT Hardware Lab: MicroPython firmware & sensor experiments on ESP32 and Raspberry Pi Pico 2 W microcontrollers',
  ];

  const allPhotos = [...customPhotos, ...DEFAULT_PHOTOS];

  return {
    identity,
    education,
    experiences,
    hackathons,
    projects: STRUCTURED_PROJECTS,
    skills,
    infrastructureSummary,
    photos: allPhotos,
  };
}

export function selectPosterDataSlice(
  kb: ParsedKnowledgeBase,
  options: {
    projectIndex: number;
    secondaryProjectIndex?: number;
    experienceIndex: number;
    hackathonIndex: number;
    skillGroupIndex: number;
    educationIndex: number;
    photoIndex: number;
    searchQuery?: string;
  }
): PosterDataSlice {
  const query = (options.searchQuery || '').trim().toLowerCase();

  if (query.length > 0) {
    // Score projects against query
    const scoredProjects = kb.projects
      .map((proj) => {
        let score = 0;
        if (proj.name.toLowerCase().includes(query)) score += 10;
        if (proj.shortName.toLowerCase().includes(query)) score += 10;
        if (proj.slug.toLowerCase().includes(query)) score += 8;
        if (proj.category.toLowerCase().includes(query)) score += 6;
        if (proj.ownership.toLowerCase().includes(query)) score += 5;
        if (proj.techStack.some((t) => t.toLowerCase().includes(query))) score += 7;
        if (proj.highlights.some((h) => h.toLowerCase().includes(query))) score += 4;
        if (proj.metrics.some((m) => m.toLowerCase().includes(query))) score += 4;
        return { proj, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const matchedSkillGroups = kb.skills.filter(
      (sg) =>
        sg.category.toLowerCase().includes(query) ||
        sg.items.some((item) => item.toLowerCase().includes(query))
    );

    const matchedHackathons = kb.hackathons.filter(
      (h) =>
        h.title.toLowerCase().includes(query) ||
        h.result.toLowerCase().includes(query) ||
        (h.projectBuilt && h.projectBuilt.toLowerCase().includes(query)) ||
        h.organizer.toLowerCase().includes(query)
    );

    const matchedExperiences = kb.experiences.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.organization.toLowerCase().includes(query) ||
        e.technologies.some((t) => t.toLowerCase().includes(query)) ||
        e.highlights.some((h) => h.toLowerCase().includes(query))
    );

    const focalProject =
      scoredProjects.length > 0
        ? scoredProjects[options.projectIndex % scoredProjects.length].proj
        : kb.projects[options.projectIndex % kb.projects.length];

    const secondaryProject =
      scoredProjects.length > 1
        ? scoredProjects[(options.projectIndex + 1) % scoredProjects.length].proj
        : kb.projects[( kb.projects.indexOf(focalProject) + 1) % kb.projects.length];

    const featuredSkillGroup =
      matchedSkillGroups.length > 0
        ? matchedSkillGroups[options.skillGroupIndex % matchedSkillGroups.length]
        : kb.skills[options.skillGroupIndex % kb.skills.length];

    const featuredHackathon =
      matchedHackathons.length > 0
        ? matchedHackathons[options.hackathonIndex % matchedHackathons.length]
        : kb.hackathons[options.hackathonIndex % kb.hackathons.length];

    const featuredExperience =
      matchedExperiences.length > 0
        ? matchedExperiences[options.experienceIndex % matchedExperiences.length]
        : kb.experiences[options.experienceIndex % kb.experiences.length];

    const totalMatches =
      scoredProjects.length +
      matchedSkillGroups.length +
      matchedHackathons.length +
      matchedExperiences.length;

    return {
      focalProject,
      secondaryProject,
      featuredExperience,
      featuredHackathon,
      featuredSkillGroup,
      featuredEducation: kb.education[options.educationIndex % kb.education.length],
      photo: kb.photos[options.photoIndex % kb.photos.length],
      searchQuery: options.searchQuery || '',
      matchCount: totalMatches,
      matchSummary:
        totalMatches > 0
          ? `${totalMatches} verified dossier matches for "${options.searchQuery}"`
          : `Showing curated spotlight for "${options.searchQuery}"`,
    };
  }

  const focalIdx = options.projectIndex % kb.projects.length;
  const secIdx =
    options.secondaryProjectIndex !== undefined
      ? options.secondaryProjectIndex % kb.projects.length
      : (focalIdx + 5) % kb.projects.length;

  return {
    focalProject: kb.projects[focalIdx],
    secondaryProject: kb.projects[secIdx === focalIdx ? (focalIdx + 1) % kb.projects.length : secIdx],
    featuredExperience: kb.experiences[options.experienceIndex % kb.experiences.length],
    featuredHackathon: kb.hackathons[options.hackathonIndex % kb.hackathons.length],
    featuredSkillGroup: kb.skills[options.skillGroupIndex % kb.skills.length],
    featuredEducation: kb.education[options.educationIndex % kb.education.length],
    photo: kb.photos[options.photoIndex % kb.photos.length],
    searchQuery: '',
    matchCount: kb.projects.length,
    matchSummary: 'Curated from 12 Project Dossiers · 5 Honors · Self-Hosted Lab',
  };
}
