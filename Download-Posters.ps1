<#
.SYNOPSIS
    Automated Bulk Poster Downloader for Poster Playground (https://poster.shamiltp.life).
.DESCRIPTION
    Automates the generation and high-resolution PNG export of posters directly from
    the deployed website using Chromium/Edge. Ensures each poster is genuinely unique,
    waits for custom Google Fonts and illustrations to render, and saves numbered PNG files
    (e.g., poster-001.png, poster-002.png) to a local directory.
.PARAMETER Count
    Number of unique posters to download (default: 5).
.PARAMETER OutputDir
    Local folder where downloaded PNGs will be saved (default: ./posters).
.PARAMETER DelaySeconds
    Pause between generations to ensure polite request cadence (default: 3).
.PARAMETER Headless
    Run browser invisibly in headless mode (default: $true). Set to $false to watch the generator live.
.PARAMETER SiteUrl
    The target website URL (default: https://poster.shamiltp.life).
.EXAMPLE
    .\Download-Posters.ps1 -Count 10 -OutputDir "C:\Users\username\Pictures\Posters"
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateRange(1, 200)]
    [int]$Count = 5,

    [Parameter(Position = 1)]
    [string]$OutputDir = "./posters",

    [Parameter()]
    [ValidateRange(1, 30)]
    [int]$DelaySeconds = 3,

    [Parameter()]
    [bool]$Headless = $true,

    [Parameter()]
    [string]$SiteUrl = "https://poster.shamiltp.life"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# 1. Resolve and ensure output folder exists
$resolvedOutDir = [System.IO.Path]::GetFullPath($OutputDir)
if (-not (Test-Path -LiteralPath $resolvedOutDir)) {
    New-Item -ItemType Directory -Path $resolvedOutDir -Force | Out-Null
    Write-Host "[INIT] Created output directory: $resolvedOutDir" -ForegroundColor Green
} else {
    Write-Host "[INIT] Output directory: $resolvedOutDir" -ForegroundColor Green
}

# 2. Check for Node.js
Write-Host "[CHECK] Verifying Node.js environment..." -ForegroundColor Cyan
try {
    $nodeVer = & node -v
    Write-Host "  Found Node.js $nodeVer" -ForegroundColor Gray
} catch {
    Write-Error @"
[ERROR] Node.js is required to drive the browser automation engine.
Please install Node.js (v18+) from https://nodejs.org or run:
  winget install OpenJS.NodeJS.LTS
"@
    exit 1
}

# 3. Create a self-contained helper script in a temp folder
$tempScriptPath = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "poster_bulk_downloader.mjs")

$jsCode = @"
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const TARGET_URL = process.env.POSTER_SITE_URL || 'https://poster.shamiltp.life';
const OUTPUT_DIR = process.env.POSTER_OUT_DIR || './posters';
const COUNT = parseInt(process.env.POSTER_COUNT || '5', 10);
const DELAY_SEC = parseFloat(process.env.POSTER_DELAY || '3');
const HEADLESS = process.env.POSTER_HEADLESS !== 'false';

// Dynamically load playwright or install lightweight dependency if needed
async function getPlaywright() {
  try {
    return await import('playwright');
  } catch {
    console.log('[SETUP] Installing playwright browser runner (one-time setup)...');
    execSync('npm install --no-save playwright', { stdio: 'inherit' });
    return await import('playwright');
  }
}

async function run() {
  const { chromium } = await getPlaywright();

  console.log(`\n========================================================`);
  console.log(`🎨 POSTER PLAYGROUND BULK DOWNLOADER`);
  console.log(`Target:      ` + TARGET_URL);
  console.log(`Output:      ` + OUTPUT_DIR);
  console.log(`Count:       ` + COUNT + ` posters`);
  console.log(`Delay:       ` + DELAY_SEC + `s`);
  console.log(`Headless:    ` + HEADLESS);
  console.log(`========================================================\n`);

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true
  });

  const page = await context.newPage();

  console.log('[1/3] Navigating to Poster Playground...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);

  const seenSignatures = new Set();
  let downloadedCount = 0;
  let attempts = 0;
  const maxAttempts = COUNT * 4;

  while (downloadedCount < COUNT && attempts < maxAttempts) {
    attempts++;
    const currentNum = downloadedCount + 1;
    const formattedNum = String(currentNum).padStart(3, '0');
    const targetFilename = `poster-` + formattedNum + `.png`;
    const targetFilePath = path.join(OUTPUT_DIR, targetFilename);

    console.log(`\n--- [Poster ` + currentNum + `/` + COUNT + `] Generating unique design... ---`);

    // Ensure fonts and images are fully rendered
    await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve());
    await page.waitForTimeout(800);

    // Get current poster signature
    const info = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="poster-canvas"]');
      const text = el ? (el.innerText || '').slice(0, 80).replace(/\s+/g, ' ') : '';
      return {
        bg: el ? window.getComputedStyle(el).backgroundColor : '',
        text
      };
    });

    const signature = info.bg + '|' + info.text;
    if (seenSignatures.has(signature)) {
      console.log('  Notice: Duplicate visual state detected. Mutating style with Space...');
      await page.keyboard.press('Space');
      await page.waitForTimeout(1500);
      continue;
    }
    seenSignatures.add(signature);

    console.log(`  Style: ` + (info.text.slice(0, 45) || 'Art Composition'));

    // Trigger high-res PNG export using the exact in-app download mechanism ([D] key)
    let downloaded = false;
    for (let retry = 1; retry <= 3; retry++) {
      try {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 12000 }),
          page.keyboard.press('d')
        ]);

        await download.saveAs(targetFilePath);
        const stats = fs.statSync(targetFilePath);
        console.log(`  ✅ Successfully saved ` + targetFilename + ` (` + (stats.size / 1024).toFixed(1) + ` KB)`);
        downloaded = true;
        break;
      } catch (err) {
        console.log(`  ⚠️ Download event retry ` + retry + `/3...`);
        await page.waitForTimeout(1000);
      }
    }

    if (downloaded) {
      downloadedCount++;
      if (downloadedCount < COUNT) {
        console.log(`  Regenerating new poster composition with [Space]...`);
        await page.keyboard.press('Space');
        await page.waitForTimeout(DELAY_SEC * 1000);
      }
    } else {
      console.log(`  ❌ Failed to export poster after 3 retries, advancing...`);
      await page.keyboard.press('Space');
      await page.waitForTimeout(2000);
    }
  }

  await browser.close();
  console.log(`\n🎉 Bulk download complete! ` + downloadedCount + `/` + COUNT + ` posters saved to:\n   ` + OUTPUT_DIR + `\n`);
}

run().catch(err => {
  console.error('\n[FATAL ERROR]:', err);
  process.exit(1);
});
"@

[System.IO.File]::WriteAllText($tempScriptPath, $jsCode, [System.Text.Encoding]::UTF8)

# 4. Set environment variables for the runner
$env:POSTER_SITE_URL = $SiteUrl
$env:POSTER_OUT_DIR = $resolvedOutDir
$env:POSTER_COUNT = $Count.ToString()
$env:POSTER_DELAY = $DelaySeconds.ToString()
$env:POSTER_HEADLESS = $Headless.ToString().ToLower()

# 5. Execute the bulk downloader
try {
    Write-Host "[START] Launching Bulk Downloader..." -ForegroundColor Green
    & node $tempScriptPath
} finally {
    if (Test-Path -LiteralPath $tempScriptPath) {
        Remove-Item -LiteralPath $tempScriptPath -Force -ErrorAction SilentlyContinue
    }
}
