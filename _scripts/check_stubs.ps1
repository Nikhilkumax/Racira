Write-Host '--- ai-tools/page.tsx ---'
Get-Content C:\Racira\racira-nextjs\src\app\ai-tools\page.tsx -ErrorAction SilentlyContinue

Write-Host '--- pdf-tools/page.tsx ---'
Get-Content C:\Racira\racira-nextjs\src\app\pdf-tools\page.tsx -ErrorAction SilentlyContinue

Write-Host '--- image-tools/page.tsx ---'
Get-Content C:\Racira\racira-nextjs\src\app\image-tools\page.tsx -ErrorAction SilentlyContinue

Write-Host '--- pdf/sitemap.xml/ contents ---'
Get-ChildItem C:\Racira\racira-nextjs\src\app\pdf\sitemap.xml -Recurse -File -ErrorAction SilentlyContinue |
  ForEach-Object { Write-Host $_.Name; Get-Content $_.FullName }

Write-Host '--- productivity/sitemap.xml/ contents ---'
Get-ChildItem C:\Racira\racira-nextjs\src\app\productivity\sitemap.xml -Recurse -File -ErrorAction SilentlyContinue |
  ForEach-Object { Write-Host $_.Name; Get-Content $_.FullName }

Write-Host '--- STEP 2 ---'
$stubRoutes = @('/ai-tools', '/pdf-tools', '/image-tools')
foreach ($route in $stubRoutes) {
  $results = Get-ChildItem C:\Racira\racira-nextjs\src -Recurse -Include '*.tsx','*.ts' | Select-String -Pattern $route -SimpleMatch
  if ($results) {
    Write-Host "LINKED: $route"
    $results | ForEach-Object { Write-Host "  $($_.Filename): $($_.Line.Trim())" }
  } else {
    Write-Host "NOT LINKED: $route - safe to delete"
  }
}
