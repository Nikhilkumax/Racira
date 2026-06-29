# Find all remaining build errors by scanning all app files for missing imports
# Specifically:
# 1. Geist font errors in layouts
# 2. @/data/* imports not covered
# 3. Any other missing module patterns

$SRC = "C:\Racira\racira-nextjs\src"

Write-Host "=== Layouts with Geist font imports ==="
Get-ChildItem "$SRC\app" -Recurse -Filter "layout.tsx" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  if ($content -match "Geist") {
    Write-Host $_.FullName.Replace("$SRC\", "")
    $_.FullName | ForEach-Object { Get-Content $_ | Select-Object -First 30 | Select-String "Geist|font|next/font" }
  }
}

Write-Host "`n=== Files importing @/data/* ==="
Get-ChildItem "$SRC\app" -Recurse -Include "*.ts","*.tsx" | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  if ($content -match '@/data/') {
    $matches = [regex]::Matches($content, "@/data/([^""']+)")
    Write-Host $_.FullName.Replace("$SRC\", "")
    $matches | ForEach-Object { Write-Host "  Import: @/data/$($_.Groups[1].Value)" }
  }
}

Write-Host "`n=== Check if audio data file was copied ==="
Test-Path "C:\Racira\racira-nextjs\src\data"
Test-Path "C:\Racira\11audio-nextjs\src\data\audioTools.ts"
