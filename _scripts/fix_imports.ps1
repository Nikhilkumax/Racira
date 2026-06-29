# STEP 4: Fix broken import paths in all copied route files
# Strategy:
# - Files in src/app/[route]/, src/lib/[route]/, src/components/[route]/
#   may import @/lib/X where X is now at @/lib/[route]/X
#   OR @/components/X where X is now at @/components/[route]/X
# - We fix only imports that are ACTUALLY BROKEN (file doesn't exist at the original @/ path)

$MAIN = "C:\Racira\racira-nextjs"
$SRC = "$MAIN\src"

$routes = @(
  'pdf','image','design','colors','typography','photo','video','animator',
  'audio','writing','seo','developers','business','finance','productivity',
  'games','education','3d','cad','fitness','music','insight','engineering',
  'travel','crypto','security','flowchart','presentation','maps'
)

# Build a map of all files that exist at src/lib/[route]/* so we know what's namespaced
$namespacedLibFiles = @{}
$namespacedCompFiles = @{}

foreach ($route in $routes) {
  $libDir = "$SRC\lib\$route"
  if (Test-Path $libDir) {
    Get-ChildItem -Path $libDir -Recurse -File | ForEach-Object {
      # e.g. src/lib/pdf/pdf-tools.ts -> relative key: pdf-tools (no ext)
      $rel = $_.FullName.Substring($libDir.Length + 1)
      $key = $rel -replace '\\','/'
      if (-not $namespacedLibFiles.ContainsKey($key)) {
        $namespacedLibFiles[$key] = @()
      }
      $namespacedLibFiles[$key] += $route
    }
  }
  $compDir = "$SRC\components\$route"
  if (Test-Path $compDir) {
    Get-ChildItem -Path $compDir -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($compDir.Length + 1)
      $key = $rel -replace '\\','/'
      if (-not $namespacedCompFiles.ContainsKey($key)) {
        $namespacedCompFiles[$key] = @()
      }
      $namespacedCompFiles[$key] += $route
    }
  }
}

$totalFixes = 0
$fixLog = @()

foreach ($route in $routes) {
  # Collect all files we need to fix for this route
  $filesToFix = @()
  $appDir = "$SRC\app\$route"
  $libDir = "$SRC\lib\$route"
  $compDir = "$SRC\components\$route"

  if (Test-Path $appDir)  { $filesToFix += Get-ChildItem -Path $appDir -Recurse -File -Include "*.ts","*.tsx" }
  if (Test-Path $libDir)  { $filesToFix += Get-ChildItem -Path $libDir -Recurse -File -Include "*.ts","*.tsx" }
  if (Test-Path $compDir) { $filesToFix += Get-ChildItem -Path $compDir -Recurse -File -Include "*.ts","*.tsx" }

  $routeFixes = 0

  foreach ($file in $filesToFix) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    $changed = $false

    # Pattern: from "@/lib/SOMETHING" or from '@/lib/SOMETHING'
    # But NOT @/lib/utils (exists at root), NOT @/lib/shared/* (doesn't exist yet)
    # We need to check if @/lib/SOMETHING actually resolves to something in src/lib/
    # If it doesn't exist at src/lib/SOMETHING but does at src/lib/[route]/SOMETHING, fix it.

    # Find all @/lib/* imports
    $libMatches = [regex]::Matches($content, "(from|import)\s+[""']@/lib/([^""']+)[""']")
    foreach ($m in $libMatches) {
      $importPath = $m.Groups[2].Value  # e.g. "tools" or "tools-data" or "pdf/something"
      # Skip if it already has a route namespace
      if ($importPath -match "^(utils|shared|pdf|image|design|colors|typography|photo|video|animator|audio|writing|seo|developers|business|finance|productivity|games|education|3d|cad|fitness|music|insight|engineering|travel|crypto|security|flowchart|presentation|maps)/") {
        continue
      }
      # Check if file exists at root level src/lib/
      $rootFile1 = "$SRC\lib\$importPath.ts"
      $rootFile2 = "$SRC\lib\$importPath.tsx"
      $rootFile3 = "$SRC\lib\$importPath\index.ts"
      $rootFile4 = "$SRC\lib\$importPath\index.tsx"
      $existsAtRoot = (Test-Path $rootFile1) -or (Test-Path $rootFile2) -or (Test-Path $rootFile3) -or (Test-Path $rootFile4)

      if (-not $existsAtRoot) {
        # Check if it exists namespaced under this route
        $namespacedFile1 = "$SRC\lib\$route\$importPath.ts"
        $namespacedFile2 = "$SRC\lib\$route\$importPath.tsx"
        $namespacedFile3 = "$SRC\lib\$route\$importPath\index.ts"
        # Also check with path separators
        $importPathFixed = $importPath -replace '/','\\'
        $namespacedFile4 = "$SRC\lib\$route\$importPathFixed.ts"
        $existsNamespaced = (Test-Path $namespacedFile1) -or (Test-Path $namespacedFile2) -or (Test-Path $namespacedFile3) -or (Test-Path $namespacedFile4)

        if ($existsNamespaced) {
          $oldImport = "@/lib/$importPath"
          $newImport = "@/lib/$route/$importPath"
          $content = $content -replace [regex]::Escape($oldImport), $newImport
          $changed = $true
          $routeFixes++
          $fixLog += "  FIX: $($file.FullName.Replace($MAIN,'')) : @/lib/$importPath -> @/lib/$route/$importPath"
        }
      }
    }

    # Pattern: from "@/components/SOMETHING" (non-ui)
    $compMatches = [regex]::Matches($content, "(from|import)\s+[""']@/components/([^""']+)[""']")
    foreach ($m in $compMatches) {
      $importPath = $m.Groups[2].Value
      # Skip if already route-namespaced or is ui/
      if ($importPath -match "^(ui/|pdf/|image/|design/|colors/|typography/|photo/|video/|animator/|audio/|writing/|seo/|developers/|business/|finance/|productivity/|games/|education/|3d/|cad/|fitness/|music/|insight/|engineering/|travel/|crypto/|security/|flowchart/|presentation/|maps/|calculator/|calculators/|tools/)") {
        continue
      }
      # Skip known main project root components
      $rootCompFile1 = "$SRC\components\$importPath.tsx"
      $rootCompFile2 = "$SRC\components\$importPath.ts"
      $rootCompFile3 = "$SRC\components\$($importPath -replace '/','\').tsx"
      $existsAtRoot = (Test-Path $rootCompFile1) -or (Test-Path $rootCompFile2) -or (Test-Path $rootCompFile3)

      if (-not $existsAtRoot) {
        $namespacedFile1 = "$SRC\components\$route\$($importPath -replace '/','\').tsx"
        $namespacedFile2 = "$SRC\components\$route\$($importPath -replace '/','\').ts"
        $existsNamespaced = (Test-Path $namespacedFile1) -or (Test-Path $namespacedFile2)

        if ($existsNamespaced) {
          $oldImport = "@/components/$importPath"
          $newImport = "@/components/$route/$importPath"
          $content = $content -replace [regex]::Escape($oldImport), $newImport
          $changed = $true
          $routeFixes++
          $fixLog += "  FIX: $($file.FullName.Replace($MAIN,'')) : @/components/$importPath -> @/components/$route/$importPath"
        }
      }
    }

    if ($changed) {
      Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
    }
  }

  if ($routeFixes -gt 0) {
    Write-Host "  [$route] Fixed $routeFixes imports" -ForegroundColor Green
  } else {
    Write-Host "  [$route] No import fixes needed" -ForegroundColor Gray
  }
  $totalFixes += $routeFixes
}

Write-Host "`n=== IMPORT FIX COMPLETE: $totalFixes total fixes ===" -ForegroundColor Yellow
Write-Host "Details:"
$fixLog | ForEach-Object { Write-Host $_ }
