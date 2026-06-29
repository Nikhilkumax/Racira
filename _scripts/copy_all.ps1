# STEP 3: Copy all 29 source projects into racira-nextjs monorepo
# Rules:
#   - Copy src/app/ -> src/app/[route]/
#   - Copy src/lib/ (excluding utils.ts) -> src/lib/[route]/
#   - Copy src/components/ (excluding ui/*) -> src/components/[route]/
#   - Copy public/ (excluding boilerplate SVGs and robots.txt) -> public/[route]/
#   - NEVER modify existing files in the main project
#   - NEVER copy into calculator/, voice/, or any existing route

$MAIN = "C:\Racira\racira-nextjs"
$SKIP_PUBLIC = @("file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg", "robots.txt")

$projects = @(
  [PSCustomObject]@{src='C:\Racira\2pdf-nextjs';           route='pdf'},
  [PSCustomObject]@{src='C:\Racira\3image-nextjs';         route='image'},
  [PSCustomObject]@{src='C:\Racira\4-design-nextjs';       route='design'},
  [PSCustomObject]@{src='C:\Racira\5-colors-nextjs';       route='colors'},
  [PSCustomObject]@{src='C:\Racira\6-typography-nextjs';   route='typography'},
  [PSCustomObject]@{src='C:\Racira\7-photo-nextjs';        route='photo'},
  [PSCustomObject]@{src='C:\Racira\8video-nextjs';         route='video'},
  [PSCustomObject]@{src='C:\Racira\9-animator-nextjs';     route='animator'},
  [PSCustomObject]@{src='C:\Racira\11audio-nextjs';        route='audio'},
  [PSCustomObject]@{src='C:\Racira\12-writing-nextjs';     route='writing'},
  [PSCustomObject]@{src='C:\Racira\13seo-nextjs';          route='seo'},
  [PSCustomObject]@{src='C:\Racira\14developers-nextjs';   route='developers'},
  [PSCustomObject]@{src='C:\Racira\15business-nextjs';     route='business'},
  [PSCustomObject]@{src='C:\Racira\16financeBlog-nextjs';  route='finance'},
  [PSCustomObject]@{src='C:\Racira\17Productivity-nextjs'; route='productivity'},
  [PSCustomObject]@{src='C:\Racira\18-games-nextjs';       route='games'},
  [PSCustomObject]@{src='C:\Racira\19-education-nextjs';   route='education'},
  [PSCustomObject]@{src='C:\Racira\20-3d-nextjs';          route='3d'},
  [PSCustomObject]@{src='C:\Racira\21-cad-nextjs';         route='cad'},
  [PSCustomObject]@{src='C:\Racira\22-fit-nextjs';         route='fitness'},
  [PSCustomObject]@{src='C:\Racira\23-music-nextjs';       route='music'},
  [PSCustomObject]@{src='C:\Racira\24-insight-nextjs';     route='insight'},
  [PSCustomObject]@{src='C:\Racira\25-engineering-nextjs'; route='engineering'},
  [PSCustomObject]@{src='C:\Racira\26-travel-nextjs';      route='travel'},
  [PSCustomObject]@{src='C:\Racira\27-crypto-nextjs';      route='crypto'},
  [PSCustomObject]@{src='C:\Racira\28-security-nextjs';    route='security'},
  [PSCustomObject]@{src='C:\Racira\29-flowchart-main';     route='flowchart'},
  [PSCustomObject]@{src='C:\Racira\30-presentation-nextjs';route='presentation'},
  [PSCustomObject]@{src='C:\Racira\31-map-nextjs';         route='maps'}
)

function Copy-Tree {
  param(
    [string]$Source,
    [string]$Dest,
    [string[]]$ExcludeFiles = @(),
    [string[]]$ExcludeDirs = @()
  )
  if (-not (Test-Path $Source)) { return 0 }
  $files = Get-ChildItem -Path $Source -Recurse -File
  $count = 0
  foreach ($file in $files) {
    # Check excluded dirs
    $skip = $false
    foreach ($excDir in $ExcludeDirs) {
      $dirPart = $file.FullName.Substring($Source.Length).TrimStart('\').Split('\')[0]
      if ($dirPart -eq $excDir) { $skip = $true; break }
    }
    if ($skip) { continue }
    # Check excluded filenames
    if ($ExcludeFiles -contains $file.Name) { continue }

    $rel = $file.FullName.Substring($Source.Length).TrimStart('\')
    $destFile = Join-Path $Dest $rel
    $destDir = Split-Path $destFile -Parent
    if (-not (Test-Path $destDir)) {
      New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    Copy-Item -Path $file.FullName -Destination $destFile -Force
    $count++
  }
  return $count
}

$totalFiles = 0
$log = @()

foreach ($p in $projects) {
  $src = $p.src
  $route = $p.route
  Write-Host "`n======================================" -ForegroundColor Cyan
  Write-Host "Processing: $route ($src)" -ForegroundColor Cyan
  Write-Host "======================================" -ForegroundColor Cyan

  # Safety: never touch existing routes
  $protected = @('calculator','voice','(home)','tools','sitemaps')
  if ($protected -contains $route) {
    Write-Host "  SKIPPED: $route is a protected route" -ForegroundColor Red
    $log += "SKIPPED: $route - protected route"
    continue
  }

  $routeFilesTotal = 0

  # 1. Copy src/app/ -> src/app/[route]/
  $srcApp = "$src\src\app"
  $destApp = "$MAIN\src\app\$route"
  if (Test-Path $srcApp) {
    # Exclude globals.css from source app (main project has its own)
    $n = Copy-Tree -Source $srcApp -Dest $destApp -ExcludeFiles @("globals.css")
    Write-Host "  [app/]       Copied $n files -> src/app/$route/"
    $routeFilesTotal += $n
  } else {
    Write-Host "  [app/]       NOT FOUND - skipping"
  }

  # 2. Copy src/lib/ (excluding utils.ts) -> src/lib/[route]/
  $srcLib = "$src\src\lib"
  $destLib = "$MAIN\src\lib\$route"
  if (Test-Path $srcLib) {
    $n = Copy-Tree -Source $srcLib -Dest $destLib -ExcludeFiles @("utils.ts")
    Write-Host "  [lib/]       Copied $n files -> src/lib/$route/"
    $routeFilesTotal += $n
  } else {
    Write-Host "  [lib/]       NOT FOUND - skipping"
  }

  # 3. Copy src/components/ (excluding ui/ subfolder) -> src/components/[route]/
  $srcComp = "$src\src\components"
  $destComp = "$MAIN\src\components\$route"
  if (Test-Path $srcComp) {
    $n = Copy-Tree -Source $srcComp -Dest $destComp -ExcludeDirs @("ui")
    Write-Host "  [components/] Copied $n files -> src/components/$route/"
    $routeFilesTotal += $n
  } else {
    Write-Host "  [components/] NOT FOUND - skipping"
  }

  # 4. Copy public/ (excluding boilerplate) -> public/[route]/
  $srcPub = "$src\public"
  $destPub = "$MAIN\public\$route"
  if (Test-Path $srcPub) {
    $n = Copy-Tree -Source $srcPub -Dest $destPub -ExcludeFiles $SKIP_PUBLIC
    Write-Host "  [public/]    Copied $n files -> public/$route/"
    $routeFilesTotal += $n
  } else {
    Write-Host "  [public/]    NOT FOUND - skipping"
  }

  Write-Host "  TOTAL for $route : $routeFilesTotal files" -ForegroundColor Green
  $log += "OK: $route - $routeFilesTotal files"
  $totalFiles += $routeFilesTotal
}

Write-Host "`n======================================" -ForegroundColor Yellow
Write-Host "COPY COMPLETE: $totalFiles total files" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
$log | ForEach-Object { Write-Host "  $_" }
