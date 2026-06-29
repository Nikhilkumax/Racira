# Remediation: Copy src/data/ directories + fix @/data/* imports + fix Geist font layouts
$MAIN = "C:\Racira\racira-nextjs"
$SRC = "$MAIN\src"

# --- 1. Copy src/data/ from source projects ---
$dataProjects = @(
  [PSCustomObject]@{src='C:\Racira\2pdf-nextjs';           route='pdf'},
  [PSCustomObject]@{src='C:\Racira\6-typography-nextjs';   route='typography'},
  [PSCustomObject]@{src='C:\Racira\8video-nextjs';         route='video'},
  [PSCustomObject]@{src='C:\Racira\11audio-nextjs';        route='audio'},
  [PSCustomObject]@{src='C:\Racira\14developers-nextjs';   route='developers'},
  [PSCustomObject]@{src='C:\Racira\17Productivity-nextjs'; route='productivity'},
  [PSCustomObject]@{src='C:\Racira\18-games-nextjs';       route='games'},
  [PSCustomObject]@{src='C:\Racira\30-presentation-nextjs';route='presentation'}
)

Write-Host "=== COPYING src/data/ from source projects ==="
foreach ($p in $dataProjects) {
  $srcData = "$($p.src)\src\data"
  $destData = "$SRC\data\$($p.route)"
  if (Test-Path $srcData) {
    Get-ChildItem $srcData -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($srcData.Length + 1)
      $destFile = Join-Path $destData $rel
      $destDir = Split-Path $destFile -Parent
      if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
      Copy-Item $_.FullName $destFile -Force
      Write-Host "  Copied: data/$($p.route)/$rel"
    }
  }
}

# --- 2. Fix @/data/* imports in all new route app files ---
Write-Host "`n=== FIXING @/data/* IMPORTS ==="

$allRoutes = @('pdf','image','design','colors','typography','photo','video','animator',
  'audio','writing','seo','developers','business','finance','productivity',
  'games','education','3d','cad','fitness','music','insight','engineering',
  'travel','crypto','security','flowchart','presentation','maps')

$fixes = 0
foreach ($route in $allRoutes) {
  $filesToFix = @()
  $appDir = "$SRC\app\$route"
  $libDir = "$SRC\lib\$route"
  $compDir = "$SRC\components\$route"

  if (Test-Path $appDir)  { $filesToFix += Get-ChildItem $appDir -Recurse -File -Include "*.ts","*.tsx" }
  if (Test-Path $libDir)  { $filesToFix += Get-ChildItem $libDir -Recurse -File -Include "*.ts","*.tsx" }
  if (Test-Path $compDir) { $filesToFix += Get-ChildItem $compDir -Recurse -File -Include "*.ts","*.tsx" }

  foreach ($file in $filesToFix) {
    $lines = Get-Content $file.FullName -Encoding UTF8
    $changed = $false
    $newLines = $lines | ForEach-Object {
      $line = $_
      # Find @/data/XXX imports (not already route-namespaced, not @/data/calculatorRegistry)
      if ($line -match "@/data/" -and $line -notmatch "@/data/(pdf|image|typography|video|audio|developers|productivity|games|presentation|calculatorRegistry|calculator)") {
        # Extract the import path after @/data/
        $newLine = $line -replace "@/data/", "@/data/$route/"
        if ($newLine -ne $line) {
          $changed = $true
          $fixes++
          Write-Host "  FIX [$route]: $($line.Trim()) -> $($newLine.Trim())"
        }
        $newLine
      } else {
        $line
      }
    }
    if ($changed) {
      Set-Content $file.FullName -Value $newLines -Encoding UTF8
    }
  }
}
Write-Host "Total @/data/* fixes: $fixes"

# --- 3. Fix Geist font imports in engineering/layout.tsx and image/layout.tsx ---
Write-Host "`n=== FIXING GEIST FONT LAYOUTS ==="

$geistLayouts = @(
  "$SRC\app\engineering\layout.tsx",
  "$SRC\app\image\layout.tsx"
)

foreach ($layoutFile in $geistLayouts) {
  if (-not (Test-Path $layoutFile)) { continue }
  $lines = Get-Content $layoutFile -Encoding UTF8
  
  # Remove Geist import lines, const declarations, and className usage of geist variables
  $newLines = $lines | Where-Object {
    $_ -notmatch "Geist|geistSans|geistMono|next/font/google"
  } | ForEach-Object {
    # Remove geist class variable references from className
    $_ -replace '\$\{geistSans\.variable\}\s*', '' -replace '\$\{geistMono\.variable\}\s*', ''
  }
  
  Set-Content $layoutFile -Value $newLines -Encoding UTF8
  Write-Host "  Fixed Geist font in: $($layoutFile.Replace($MAIN,''))"
}

Write-Host "`n=== REMEDIATION COMPLETE ==="
