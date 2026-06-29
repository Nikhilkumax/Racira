$routes = @(
  [PSCustomObject]@{src='C:\Racira\2pdf-nextjs'; route='pdf'},
  [PSCustomObject]@{src='C:\Racira\3image-nextjs'; route='image'},
  [PSCustomObject]@{src='C:\Racira\6-typography-nextjs'; route='typography'},
  [PSCustomObject]@{src='C:\Racira\8video-nextjs'; route='video'},
  [PSCustomObject]@{src='C:\Racira\11audio-nextjs'; route='audio'},
  [PSCustomObject]@{src='C:\Racira\14developers-nextjs'; route='developers'},
  [PSCustomObject]@{src='C:\Racira\17Productivity-nextjs'; route='productivity'},
  [PSCustomObject]@{src='C:\Racira\18-games-nextjs'; route='games'},
  [PSCustomObject]@{src='C:\Racira\30-presentation-nextjs'; route='presentation'}
)

foreach ($p in $routes) {
  $dataPath = "$($p.src)\src\data"
  Write-Host "[$($p.route)] data/ exists: $(Test-Path $dataPath)"
  if (Test-Path $dataPath) {
    Get-ChildItem $dataPath -Recurse -File | ForEach-Object {
      Write-Host "  $($_.FullName.Replace($p.src, ''))"
    }
  }
}
