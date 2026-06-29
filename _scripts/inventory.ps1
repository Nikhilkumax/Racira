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

Write-Host "| Route | Has lib/ | Has components/ | Has public/ | Has .env | Pkg count |"
Write-Host "|-------|----------|-----------------|-------------|----------|-----------|"

foreach ($p in $projects) {
  $src = $p.src
  $route = $p.route
  $hasLib = Test-Path "$src\src\lib"
  $hasComp = Test-Path "$src\src\components"
  $hasPub = Test-Path "$src\public"
  $hasEnv = (Test-Path "$src\.env") -or (Test-Path "$src\.env.local")
  $pkgPath = "$src\package.json"
  $pkgCount = 0
  if (Test-Path $pkgPath) {
    try {
      $pkgContent = Get-Content $pkgPath -Raw | ConvertFrom-Json
      $deps = @()
      if ($pkgContent.dependencies) { $deps += $pkgContent.dependencies.PSObject.Properties.Name }
      if ($pkgContent.devDependencies) { $deps += $pkgContent.devDependencies.PSObject.Properties.Name }
      $pkgCount = $deps.Count
    } catch { $pkgCount = "ERR" }
  }
  Write-Host "| $route | $hasLib | $hasComp | $hasPub | $hasEnv | $pkgCount |"
}
