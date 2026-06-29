# Get all new packages from all 29 source projects vs the main project
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

# Collect unique new packages with version from first source that has them
$allNewPkgs = @{}
foreach ($p in $projects) {
  $pkgPath = "$($p.src)\package.json"
  if (Test-Path $pkgPath) {
    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
    $deps = @{}
    if ($pkg.dependencies) { $pkg.dependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
    # Only list prod deps as new
    foreach ($dep in $deps.Keys) {
      if (-not $mainDeps.ContainsKey($dep)) {
        if (-not $allNewPkgs.ContainsKey($dep)) {
          $allNewPkgs[$dep] = $deps[$dep]
        }
      }
    }
  }
}

Write-Host "=== UNIQUE NEW PRODUCTION PACKAGES ==="
foreach ($dep in ($allNewPkgs.Keys | Sort-Object)) {
  Write-Host "  `"$dep`": `"$($allNewPkgs[$dep])`","
}
Write-Host ""
Write-Host "Total new packages: $($allNewPkgs.Count)"

# Also check lib/ collisions (summarized)
Write-Host "`n=== LIB FILE COLLISION CHECK (UNIQUE FILES) ==="
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
$libCollisions = 0
foreach ($file in ($libFiles.Keys | Sort-Object)) {
  if ($libFiles[$file].Count -gt 1) {
    $libCollisions++
    Write-Host "  COLLISION lib\$file => $($libFiles[$file] -join ', ')"
  }
}
if ($libCollisions -eq 0) { Write-Host "  None found." }
Write-Host "Total lib collisions: $libCollisions"
