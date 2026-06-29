# Find all projects with extra src-level folders (views/, tools/, hooks/)
# and copy them with route namespacing

$MAIN = "C:\Racira\racira-nextjs"
$SRC = "$MAIN\src"

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
  [PSCustomObject]@{src='C:\Racira\30-presentation-nextjs';route='presentation'},
  [PSCustomObject]@{src='C:\Racira\31-map-nextjs';         route='maps'}
)

$extraFolders = @('views', 'tools', 'hooks', 'contexts', 'stores', 'types')
$totalCopied = 0

foreach ($p in $projects) {
  foreach ($folder in $extraFolders) {
    $srcFolder = "$($p.src)\src\$folder"
    if (Test-Path $srcFolder) {
      Write-Host "Found $folder/ in $($p.route)"
      # Determine destination
      # views/ -> src/views/[route]/ (used as relative imports from app/[route]/)
      # tools/ -> src/tools/[route]/ (used as @/tools/*)  
      # hooks/ -> src/hooks/[route]/ (used as @/hooks/*)
      # contexts/, stores/, types/ -> same pattern
      $destFolder = "$SRC\$folder\$($p.route)"
      Get-ChildItem $srcFolder -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($srcFolder.Length + 1)
        $destFile = Join-Path $destFolder $rel
        $destDir = Split-Path $destFile -Parent
        if (-not (Test-Path $destDir)) { New-Item -ItemType Directory $destDir -Force | Out-Null }
        Copy-Item $_.FullName $destFile -Force
        Write-Host "  Copied: $folder/$($p.route)/$rel"
        $totalCopied++
      }
    }
  }
}

Write-Host "`nTotal extra files copied: $totalCopied"

# Now fix import paths for these extra folders
# @/tools/* -> @/tools/[route]/*
# @/hooks/* -> @/hooks/[route]/*
# ../views/* -> ../../views/[route]/* or relative fix

$allRoutes = @('pdf','image','design','colors','typography','photo','video','animator',
  'audio','writing','seo','developers','business','finance','productivity',
  'games','education','3d','cad','fitness','music','insight','engineering',
  'travel','crypto','security','flowchart','presentation','maps')

$importFixes = 0

foreach ($route in $allRoutes) {
  $filesToFix = @()
  $appDir = "$SRC\app\$route"
  $libDir = "$SRC\lib\$route"
  $compDir = "$SRC\components\$route"

  if (Test-Path $appDir)  { $filesToFix += Get-ChildItem $appDir -Recurse -File -Include "*.ts","*.tsx" }
  if (Test-Path $libDir)  { $filesToFix += Get-ChildItem $libDir -Recurse -File -Include "*.ts","*.tsx" }
  if (Test-Path $compDir) { $filesToFix += Get-ChildItem $compDir -Recurse -File -Include "*.ts","*.tsx" }

  foreach ($file in $filesToFix) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content
    $changed = $false

    # Fix @/tools/* imports (not already namespaced)
    $m = [regex]::Matches($content, "@/tools/(?!$route/)([^""']+)")
    foreach ($match in $m) {
      $importPath = $match.Groups[1].Value
      $namespacedPath = "$SRC\tools\$route\$($importPath -replace '/','\').ts"
      $namespacedPath2 = "$SRC\tools\$route\$($importPath -replace '/','\').tsx"
      if ((Test-Path $namespacedPath) -or (Test-Path $namespacedPath2)) {
        $content = $content.Replace("@/tools/$importPath", "@/tools/$route/$importPath")
        $changed = $true
        $importFixes++
        Write-Host "  FIX @/tools [$route]: @/tools/$importPath -> @/tools/$route/$importPath"
      }
    }

    # Fix @/hooks/* imports (not already namespaced)
    $m = [regex]::Matches($content, "@/hooks/(?!$route/)([^""']+)")
    foreach ($match in $m) {
      $importPath = $match.Groups[1].Value
      $namespacedPath = "$SRC\hooks\$route\$($importPath -replace '/','\').ts"
      $namespacedPath2 = "$SRC\hooks\$route\$($importPath -replace '/','\').tsx"
      if ((Test-Path $namespacedPath) -or (Test-Path $namespacedPath2)) {
        $content = $content.Replace("@/hooks/$importPath", "@/hooks/$route/$importPath")
        $changed = $true
        $importFixes++
        Write-Host "  FIX @/hooks [$route]: @/hooks/$importPath -> @/hooks/$route/$importPath"
      }
    }

    # Fix relative ../views/* imports (from src/app/[route]/page.tsx)
    # These are like: import Index from "../views/Index"
    # The views/ folder is now at src/views/[route]/
    # From src/app/[route]/, the relative path to src/views/[route]/ is ../../views/[route]/
    $m = [regex]::Matches($content, "(from|import)\s+[""']\.\./views/([^""']+)[""']")
    foreach ($match in $m) {
      $viewName = $match.Groups[2].Value
      $namespacedPath = "$SRC\views\$route\$viewName.tsx"
      $namespacedPath2 = "$SRC\views\$route\$viewName.ts"
      if ((Test-Path $namespacedPath) -or (Test-Path $namespacedPath2)) {
        $content = $content.Replace("""../views/$viewName""", """../../views/$route/$viewName""")
        $content = $content.Replace("'../views/$viewName'", "'../../views/$route/$viewName'")
        $changed = $true
        $importFixes++
        Write-Host "  FIX ../views [$route]: ../views/$viewName -> ../../views/$route/$viewName"
      }
    }

    if ($changed) {
      [System.IO.File]::WriteAllText($file.FullName, $content)
    }
  }
}

Write-Host "`nTotal import fixes for extra folders: $importFixes"
