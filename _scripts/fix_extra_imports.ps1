$SRC = 'C:\Racira\racira-nextjs\src'

$allRoutes = @('pdf','image','design','colors','typography','photo','video','animator',
  'audio','writing','seo','developers','business','finance','productivity',
  'games','education','3d','cad','fitness','music','insight','engineering',
  'travel','crypto','security','flowchart','presentation','maps')

$importFixes = 0

foreach ($route in $allRoutes) {
  # Collect files in tools/[route]/ too (newly added)
  $filesToFix = @()
  $toolsDir = "$SRC\tools\$route"
  $hooksDir = "$SRC\hooks\$route"
  $viewsDir = "$SRC\views\$route"
  $typesDir = "$SRC\types\$route"

  if (Test-Path $toolsDir)  { $filesToFix += Get-ChildItem $toolsDir -Recurse -File -Include "*.ts","*.tsx" }
  if (Test-Path $hooksDir)  { $filesToFix += Get-ChildItem $hooksDir -Recurse -File -Include "*.ts","*.tsx" }
  if (Test-Path $viewsDir)  { $filesToFix += Get-ChildItem $viewsDir -Recurse -File -Include "*.ts","*.tsx" }
  if (Test-Path $typesDir)  { $filesToFix += Get-ChildItem $typesDir -Recurse -File -Include "*.ts","*.tsx" }

  foreach ($file in $filesToFix) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content
    $changed = $false

    # Fix @/components/X imports that are now at @/components/[route]/X
    $matches = [regex]::Matches($content, "@/components/([^""/][^""']+)")
    foreach ($m in $matches) {
      $importPath = $m.Groups[1].Value
      # Skip if already namespaced
      if ($importPath -match "^(ui/|$route/|calculator/|calculators/|tools/)") { continue }
      # Check if it exists in route namespace
      $checkPaths = @(
        "$SRC\components\$route\$($importPath -replace '/','\').tsx",
        "$SRC\components\$route\$($importPath -replace '/','\').ts"
      )
      $existsNamespaced = $checkPaths | Where-Object { Test-Path $_ }
      if ($existsNamespaced) {
        $content = $content.Replace("@/components/$importPath", "@/components/$route/$importPath")
        $changed = $true
        $importFixes++
        Write-Host "  FIX @/components [$route] in tools/: @/components/$importPath -> @/components/$route/$importPath"
      }
    }

    # Fix @/lib/X imports (not already namespaced, not utils)
    $matches = [regex]::Matches($content, "@/lib/([^""/][^""']+)")
    foreach ($m in $matches) {
      $importPath = $m.Groups[1].Value
      if ($importPath -match "^(utils|shared|pdf|image|design|colors|typography|photo|video|animator|audio|writing|seo|developers|business|finance|productivity|games|education|3d|cad|fitness|music|insight|engineering|travel|crypto|security|flowchart|presentation|maps)/") { continue }
      # Check if it exists at root
      $rootPaths = @(
        "$SRC\lib\$($importPath -replace '/','\').ts",
        "$SRC\lib\$($importPath -replace '/','\').tsx"
      )
      $existsAtRoot = $rootPaths | Where-Object { Test-Path $_ }
      if (-not $existsAtRoot) {
        $namespacedPaths = @(
          "$SRC\lib\$route\$($importPath -replace '/','\').ts",
          "$SRC\lib\$route\$($importPath -replace '/','\').tsx"
        )
        $existsNamespaced = $namespacedPaths | Where-Object { Test-Path $_ }
        if ($existsNamespaced) {
          $content = $content.Replace("@/lib/$importPath", "@/lib/$route/$importPath")
          $changed = $true
          $importFixes++
          Write-Host "  FIX @/lib [$route] in tools/: @/lib/$importPath -> @/lib/$route/$importPath"
        }
      }
    }

    if ($changed) {
      [System.IO.File]::WriteAllText($file.FullName, $content)
    }
  }
}

Write-Host "`nTotal import fixes for tools/hooks/views/types folders: $importFixes"
