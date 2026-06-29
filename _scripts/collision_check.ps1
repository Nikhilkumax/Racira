# Step 2: Collision check + dependency comparison
# Run this from C:\Racira

$mainPkg = Get-Content "C:\Racira\racira-nextjs\package.json" -Raw | ConvertFrom-Json
$mainDeps = @{}
if ($mainPkg.dependencies) { $mainPkg.dependencies.PSObject.Properties | ForEach-Object { $mainDeps[$_.Name] = $_.Value } }
if ($mainPkg.devDependencies) { $mainPkg.devDependencies.PSObject.Properties | ForEach-Object { $mainDeps[$_.Name] = $_.Value } }

$projects = @(
  [PSCustomObject]@{src='C:\Racira\2pdf-nextjs'; route='pdf'},
  [PSCustomObject]@{src='C:\Racira\3image-nextjs'; route='image'},
  [PSCustomObject]@{src='C:\Racira\4-design-nextjs'; route='design'},
  [PSCustomObject]@{src='C:\Racira\5-colors-nextjs'; route='colors'},
  [PSCustomObject]@{src='C:\Racira\6-typography-nextjs'; route='typography'},
  [PSCustomObject]@{src='C:\Racira\7-photo-nextjs'; route='photo'},
  [PSCustomObject]@{src='C:\Racira\8video-nextjs'; route='video'},
  [PSCustomObject]@{src='C:\Racira\9-animator-nextjs'; route='animator'},
  [PSCustomObject]@{src='C:\Racira\11audio-nextjs'; route='audio'},
  [PSCustomObject]@{src='C:\Racira\12-writing-nextjs'; route='writing'},
  [PSCustomObject]@{src='C:\Racira\13seo-nextjs'; route='seo'},
  [PSCustomObject]@{src='C:\Racira\14developers-nextjs'; route='developers'},
  [PSCustomObject]@{src='C:\Racira\15business-nextjs'; route='business'},
  [PSCustomObject]@{src='C:\Racira\16financeBlog-nextjs'; route='finance'},
  [PSCustomObject]@{src='C:\Racira\17Productivity-nextjs'; route='productivity'},
  [PSCustomObject]@{src='C:\Racira\18-games-nextjs'; route='games'},
  [PSCustomObject]@{src='C:\Racira\19-education-nextjs'; route='education'},
  [PSCustomObject]@{src='C:\Racira\20-3d-nextjs'; route='3d'},
  [PSCustomObject]@{src='C:\Racira\21-cad-nextjs'; route='cad'},
  [PSCustomObject]@{src='C:\Racira\22-fit-nextjs'; route='fitness'},
  [PSCustomObject]@{src='C:\Racira\23-music-nextjs'; route='music'},
  [PSCustomObject]@{src='C:\Racira\24-insight-nextjs'; route='insight'},
  [PSCustomObject]@{src='C:\Racira\25-engineering-nextjs'; route='engineering'},
  [PSCustomObject]@{src='C:\Racira\26-travel-nextjs'; route='travel'},
  [PSCustomObject]@{src='C:\Racira\27-crypto-nextjs'; route='crypto'},
  [PSCustomObject]@{src='C:\Racira\28-security-nextjs'; route='security'},
  [PSCustomObject]@{src='C:\Racira\29-flowchart-main'; route='flowchart'},
  [PSCustomObject]@{src='C:\Racira\30-presentation-nextjs'; route='presentation'},
  [PSCustomObject]@{src='C:\Racira\31-map-nextjs'; route='maps'}
)

# ---- NEW PACKAGES ----
$allNewPkgs = @{}
foreach ($p in $projects) {
  $pkgPath = "$($p.src)\package.json"
  if (Test-Path $pkgPath) {
    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
    $deps = @{}
    if ($pkg.dependencies) { $pkg.dependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
    if ($pkg.devDependencies) { $pkg.devDependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
    foreach ($dep in $deps.Keys) {
      if (-not $mainDeps.ContainsKey($dep)) {
        if (-not $allNewPkgs.ContainsKey($dep)) { $allNewPkgs[$dep] = @() }
        $allNewPkgs[$dep] += $p.route
      }
    }
  }
}

Write-Host "`n=== NEW PACKAGES NOT IN MAIN package.json ==="
foreach ($dep in ($allNewPkgs.Keys | Sort-Object)) {
  Write-Host "  $dep  (used by: $($allNewPkgs[$dep] -join ', '))"
}

# ---- LIB FILE COLLISIONS ----
Write-Host "`n=== LIB FILE COLLISION CHECK ==="
$libFiles = @{}
foreach ($p in $projects) {
  $libPath = "$($p.src)\src\lib"
  if (Test-Path $libPath) {
    Get-ChildItem -Path $libPath -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($libPath.Length + 1)
      if (-not $libFiles.ContainsKey($rel)) { $libFiles[$rel] = @() }
      $libFiles[$rel] += $p.route
    }
  }
}
foreach ($file in ($libFiles.Keys | Sort-Object)) {
  if ($libFiles[$file].Count -gt 1) {
    Write-Host "  COLLISION lib/$file => $($libFiles[$file] -join ', ')"
  }
}

# ---- COMPONENTS FILE COLLISIONS ----
Write-Host "`n=== COMPONENTS FILE COLLISION CHECK ==="
$compFiles = @{}
foreach ($p in $projects) {
  $compPath = "$($p.src)\src\components"
  if (Test-Path $compPath) {
    Get-ChildItem -Path $compPath -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($compPath.Length + 1)
      if (-not $compFiles.ContainsKey($rel)) { $compFiles[$rel] = @() }
      $compFiles[$rel] += $p.route
    }
  }
}
$collisionCount = 0
foreach ($file in ($compFiles.Keys | Sort-Object)) {
  if ($compFiles[$file].Count -gt 1) {
    $collisionCount++
    Write-Host "  COLLISION components/$file => $($compFiles[$file] -join ', ')"
  }
}
if ($collisionCount -eq 0) { Write-Host "  None" }

# ---- PUBLIC FILE COLLISIONS ----
Write-Host "`n=== PUBLIC FILE COLLISION CHECK ==="
$pubFiles = @{}
foreach ($p in $projects) {
  $pubPath = "$($p.src)\public"
  if (Test-Path $pubPath) {
    Get-ChildItem -Path $pubPath -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($pubPath.Length + 1)
      if (-not $pubFiles.ContainsKey($rel)) { $pubFiles[$rel] = @() }
      $pubFiles[$rel] += $p.route
    }
  }
}
$pubCollisionCount = 0
foreach ($file in ($pubFiles.Keys | Sort-Object)) {
  if ($pubFiles[$file].Count -gt 1) {
    $pubCollisionCount++
    Write-Host "  COLLISION public/$file => $($pubFiles[$file] -join ', ')"
  }
}
if ($pubCollisionCount -eq 0) { Write-Host "  None" }

# ---- ROUTE EXISTENCE CHECK ----
Write-Host "`n=== ROUTE ALREADY EXISTS IN MAIN PROJECT ==="
foreach ($p in $projects) {
  $routePath = "C:\Racira\racira-nextjs\src\app\$($p.route)"
  if (Test-Path $routePath) {
    Write-Host "  CONFLICT: $($p.route) already exists!"
  }
}
Write-Host "Done checking existing routes."
