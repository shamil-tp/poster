<#
.SYNOPSIS
    High-Performance Bulk Poster Downloader for Poster Playground (https://poster.shamiltp.life).

.DESCRIPTION
    Generates and downloads high-resolution posters in bulk using a persistent headless
    worker-pool architecture. Instead of sequentially opening pages and pressing keys,
    it batches unique design states, renders across parallel worker contexts, and packages
    all posters into a single high-resolution ZIP archive.

.PARAMETER Count
    Number of unique posters to generate and download (default: 50, supports up to 1000).

.PARAMETER OutputDir
    Destination directory where the ZIP archive and extracted PNG posters will be saved (default: ./posters).

.PARAMETER SiteUrl
    The Poster Playground server URL (default: https://poster.shamiltp.life).

.PARAMETER Concurrency
    Number of parallel worker pages to utilize during rendering (default: 4).

.PARAMETER Format
    Image format: 'png' (lossless, default) or 'jpeg' (smaller file size).

.PARAMETER Extract
    Automatically extract the ZIP archive into OutputDir so individual posters are immediately accessible (default: $true).

.PARAMETER KeepZip
    Keep the downloaded ZIP archive file in OutputDir (default: $true).

.PARAMETER Local
    Run generation directly through local Node.js / Playwright engine without HTTP server.

.EXAMPLE
    .\Download-Posters.ps1 -Count 50

.EXAMPLE
    .\Download-Posters.ps1 -Count 100 -OutputDir "C:\Users\User\Pictures\Posters" -Concurrency 4

.EXAMPLE
    .\Download-Posters.ps1 -Count 1000 -SiteUrl "http://localhost:3000"
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateRange(1, 1000)]
    [int]$Count = 50,

    [Parameter(Position = 1)]
    [string]$OutputDir = "./posters",

    [Parameter()]
    [string]$SiteUrl = "https://poster.shamiltp.life",

    [Parameter()]
    [ValidateRange(1, 8)]
    [int]$Concurrency = 4,

    [Parameter()]
    [ValidateSet("png", "jpeg")]
    [string]$Format = "png",

    [Parameter()]
    [bool]$Extract = $true,

    [Parameter()]
    [bool]$KeepZip = $true,

    [Parameter()]
    [switch]$Local
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptStartTime = [System.Diagnostics.Stopwatch]::StartNew()

# 1. Resolve and create output directory
$targetDir = [System.IO.Path]::GetFullPath($OutputDir)
if (-not (Test-Path -LiteralPath $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "[INIT] Created output directory: $targetDir" -ForegroundColor Green
} else {
    Write-Host "[INIT] Destination directory: $targetDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🎨 POSTER PLAYGROUND HIGH-PERFORMANCE BULK DOWNLOADER" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Target Posters:   $Count" -ForegroundColor White
Write-Host " Image Format:     $($Format.ToUpper()) (1440x900 high-res)" -ForegroundColor White
Write-Host " Concurrency:      $Concurrency parallel worker contexts" -ForegroundColor White
Write-Host " Endpoint/Site:    $SiteUrl" -ForegroundColor White
Write-Host " Auto-Extract ZIP: $Extract" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Helper to run local generation
function Invoke-LocalBulkGeneration {
    param([int]$BatchCount, [int]$BatchConcurrency, [string]$ImgFormat, [string]$DestDir)

    Write-Host "[LOCAL] Launching standalone local generation engine..." -ForegroundColor Yellow
    
    # Check for tsx or node
    $cliPath = Join-Path $PSScriptRoot "src" "server" "bulkPosterGenerator.ts"
    if (-not (Test-Path -LiteralPath $cliPath)) {
        Write-Error "Local bulk generator not found at: $cliPath"
        exit 1
    }

    $npxCmd = Get-Command "npx" -ErrorAction SilentlyContinue
    if (-not $npxCmd) {
        Write-Error "Node.js / npx is required to run the local generator. Please install Node.js (v18+)."
        exit 1
    }

    Write-Host "  Executing: npx tsx src/server/bulkPosterGenerator.ts $BatchCount $BatchConcurrency $ImgFormat" -ForegroundColor Gray
    $env:NODE_PATH = "/usr/local/share/bun-global/node_modules"
    & npx tsx $cliPath $BatchCount $BatchConcurrency $ImgFormat

    $expectedZip = Join-Path (Join-Path $PSScriptRoot "dist-posters") "posters-$BatchCount-batch.zip"
    if (Test-Path -LiteralPath $expectedZip) {
        $destZip = Join-Path $DestDir ([System.IO.Path]::GetFileName($expectedZip))
        Copy-Item -Path $expectedZip -Destination $destZip -Force
        return $destZip
    }
    return $null
}

$zipLocalPath = $null

if ($Local) {
    $zipLocalPath = Invoke-LocalBulkGeneration -BatchCount $Count -BatchConcurrency $Concurrency -ImgFormat $Format -DestDir $targetDir
} else {
    # 2. Server API Execution
    $apiUrl = "$($SiteUrl.TrimEnd('/'))/api/bulk-generate"
    Write-Host "[1/3] Requesting bulk generation of $Count posters from server..." -ForegroundColor Cyan
    Write-Host "      Waiting for parallel rendering & packaging (approx $([math]::Round($Count / 2.8, 1))s)..." -ForegroundColor Gray

    $requestBody = @{
        count       = $Count
        concurrency = $Concurrency
        format      = $Format
        width       = 1440
        height      = 900
    } | ConvertTo-Json -Compress

    $response = $null
    try {
        # Set large timeout (30 mins = 1800s) to comfortably support batches up to 1000 posters
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $requestBody -ContentType "application/json" -TimeoutSec 1800
    } catch {
        Write-Warning "Failed to contact bulk server API at $apiUrl: $_"
        Write-Host "Falling back to local high-speed worker pool runner..." -ForegroundColor Yellow
        $zipLocalPath = Invoke-LocalBulkGeneration -BatchCount $Count -BatchConcurrency $Concurrency -ImgFormat $Format -DestDir $targetDir
    }

    if ($null -ne $response -and $response.ok) {
        Write-Host "  ✅ Server completed rendering!" -ForegroundColor Green
        if ($response.metrics) {
            Write-Host "     Render Time: $([math]::Round($response.metrics.renderTimeMs / 1000, 2))s" -ForegroundColor Gray
            Write-Host "     Throughput:  $($response.metrics.postersPerSecond) posters/sec" -ForegroundColor Gray
            Write-Host "     Archive Size: $([math]::Round($response.zipSizeBytes / 1MB, 2)) MB" -ForegroundColor Gray
        }

        # 3. Download the generated ZIP file
        $downloadUrl = "$($SiteUrl.TrimEnd('/'))$($response.downloadUrl)"
        $zipFileName = [System.IO.Path]::GetFileName($response.downloadUrl)
        if (-not $zipFileName) { $zipFileName = "posters-$Count-batch.zip" }
        $zipLocalPath = Join-Path $targetDir $zipFileName

        Write-Host ""
        Write-Host "[2/3] Downloading ZIP archive ($([math]::Round($response.zipSizeBytes / 1MB, 2)) MB)..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipLocalPath -TimeoutSec 600
        Write-Host "  ✅ Archive downloaded to: $zipLocalPath" -ForegroundColor Green
    }
}

if (-not $zipLocalPath -or -not (Test-Path -LiteralPath $zipLocalPath)) {
    Write-Error "Bulk download failed: ZIP archive was not produced or downloaded."
    exit 1
}

# 4. Extract individual posters if requested
$extractedCount = 0
if ($Extract) {
    Write-Host ""
    Write-Host "[3/3] Extracting high-res individual posters into $targetDir..." -ForegroundColor Cyan
    
    try {
        # Use built-in Expand-Archive (PowerShell 5+)
        Expand-Archive -Path $zipLocalPath -DestinationPath $targetDir -Force
    } catch {
        # Fallback to .NET ZipFile
        [System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null
        [System.IO.Compression.ZipFile]::ExtractToDirectory($zipLocalPath, $targetDir)
    }

    $extractedFiles = Get-ChildItem -Path $targetDir -Filter "*.$Format" -File
    $extractedCount = $extractedFiles.Count
    Write-Host "  ✅ Extracted $extractedCount unique posters directly to: $targetDir" -ForegroundColor Green
}

# Remove ZIP if user did not request KeepZip
if (-not $KeepZip -and (Test-Path -LiteralPath $zipLocalPath)) {
    Remove-Item -LiteralPath $zipLocalPath -Force
    Write-Host "  (Cleaned up temporary ZIP archive)" -ForegroundColor Gray
}

$scriptStartTime.Stop()
$totalElapsedSec = [math]::Round($scriptStartTime.Elapsed.TotalSeconds, 2)
$overallRate = if ($totalElapsedSec -gt 0) { [math]::Round($Count / $totalElapsedSec, 2) } else { 0 }

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "🎉 BULK POSTER DOWNLOAD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host " Total Posters:       $Count unique designs generated" -ForegroundColor White
Write-Host " Total Elapsed Time:  $($totalElapsedSec)s" -ForegroundColor White
Write-Host " Overall Throughput:  $($overallRate) posters/second" -ForegroundColor White
Write-Host " Destination Folder:  $targetDir" -ForegroundColor White
if ($KeepZip -and (Test-Path -LiteralPath $zipLocalPath)) {
    $zipSizeMb = [math]::Round((Get-Item -LiteralPath $zipLocalPath).Length / 1MB, 2)
    Write-Host " ZIP Archive File:    $zipLocalPath ($zipSizeMb MB)" -ForegroundColor White
}
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
