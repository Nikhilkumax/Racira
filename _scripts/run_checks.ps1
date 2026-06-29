Write-Host "--- CHECK 1 ---"
Get-ChildItem C:\Racira\racira-nextjs\src\app -Directory | Select-Object -ExpandProperty Name | Sort-Object

Write-Host "--- CHECK 2 ---"
Write-Host "page.tsx:"
Get-Content C:\Racira\racira-nextjs\src\app\page.tsx -TotalCount 5
Write-Host "layout.tsx:"
Get-Content C:\Racira\racira-nextjs\src\app\layout.tsx -TotalCount 5
Write-Host "calculator\page.tsx:"
Get-Content C:\Racira\racira-nextjs\src\app\calculator\page.tsx -TotalCount 5
Write-Host "voice\page.tsx:"
Get-Content C:\Racira\racira-nextjs\src\app\voice\page.tsx -TotalCount 5

Write-Host "--- CHECK 4 ---"
Get-ChildItem C:\Racira\racira-nextjs\src\app -Recurse -File | Select-String -Pattern "quarantine" -SimpleMatch

Write-Host "--- CHECK 5 ---"
$routes = @("pdf","image","design","colors","typography","photo","video","animator","audio","writing","seo","developers","business","finance","productivity","games","education","3d","cad","fitness","music","insight","engineering","travel","crypto","security","flowchart","presentation","maps")
foreach ($r in $routes) {
  $path = "C:\Racira\racira-nextjs\src\app\$r\page.tsx"
  if (Test-Path $path) { Write-Host "OK: $r" } else { Write-Host "MISSING: $r" }
}

Write-Host "--- CHECK 6 ---"
$srcPath = "C:\Racira\racira-nextjs\src"
Get-ChildItem $srcPath -Recurse -Include "*.ts","*.tsx" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $file = $_.FullName.Replace($srcPath, "")
  if ($content -match "@/components/Header[^/]" -or
      $content -match "@/components/Footer[^/]" -or
      $content -match "@/components/Layout[^/]" -or
      $content -match "@/lib/tools[^/-]" -or
      $content -match "@/lib/tools-data[^/-]" -or
      $content -match "@/data/(?!pdf|image|design|colors|typography|photo|video|animator|audio|writing|seo|developers|business|finance|productivity|games|education|3d|cad|fitness|music|insight|engineering|travel|crypto|security|flowchart|presentation|maps|calculatorRegistry)") {
    Write-Host "WARN: $file"
    Select-String -Path $_.FullName -Pattern "@/components/Header[^/]|@/components/Footer[^/]|@/components/Layout[^/]|@/lib/tools[^/-]|@/lib/tools-data[^/-]" | ForEach-Object { Write-Host "   $_" }
  }
}
