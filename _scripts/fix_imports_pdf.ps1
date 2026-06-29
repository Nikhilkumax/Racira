Write-Host "════════════════════════════════════════"
Write-Host "STEP 1 — SCAN ALL IMPORTS IN src/views/pdf/"
Write-Host "════════════════════════════════════════"
Get-ChildItem C:\Racira\racira-nextjs\src\views\pdf -Recurse -Include "*.ts","*.tsx" |
  ForEach-Object {
    Write-Host "--- $($_.Name) ---"
    Select-String -Path $_.FullName -Pattern 'from "@/'
  }

Write-Host "`n════════════════════════════════════════"
Write-Host "STEP 2 — CHECK WHICH PATHS ACTUALLY EXIST"
Write-Host "════════════════════════════════════════"
$check = @(
  "C:\Racira\racira-nextjs\src\data\pdf\tool-config.ts",
  "C:\Racira\racira-nextjs\src\data\pdf\tool-seo.ts",
  "C:\Racira\racira-nextjs\src\data\tool-config.ts",
  "C:\Racira\racira-nextjs\src\data\tool-seo.ts",
  "C:\Racira\racira-nextjs\src\hooks\usePdfEditor.ts",
  "C:\Racira\racira-nextjs\src\hooks\usePdfEditor.tsx",
  "C:\Racira\racira-nextjs\src\hooks\pdf\usePdfEditor.ts",
  "C:\Racira\racira-nextjs\src\hooks\pdf\usePdfEditor.tsx"
)
foreach ($p in $check) {
  if (Test-Path $p) { Write-Host "EXISTS : $p" } 
  else { Write-Host "MISSING: $p" }
}

Write-Host "--- src/data/pdf/ ---"
Get-ChildItem C:\Racira\racira-nextjs\src\data\pdf -Recurse -File |
  ForEach-Object { Write-Host $_.FullName.Replace("C:\Racira\racira-nextjs\src\","") }

Write-Host "--- src/hooks/ ---"
Get-ChildItem C:\Racira\racira-nextjs\src\hooks -Recurse -File -ErrorAction SilentlyContinue |
  ForEach-Object { Write-Host $_.FullName.Replace("C:\Racira\racira-nextjs\src\","") }

Write-Host "--- 2pdf-nextjs src/data/ ---"
Get-ChildItem C:\Racira\2pdf-nextjs\src\data -Recurse -File -ErrorAction SilentlyContinue |
  ForEach-Object { Write-Host $_.Name }

Write-Host "--- 2pdf-nextjs src/hooks/ ---"
Get-ChildItem C:\Racira\2pdf-nextjs\src\hooks -Recurse -File -ErrorAction SilentlyContinue |
  ForEach-Object { Write-Host $_.Name }


Write-Host "`n════════════════════════════════════════"
Write-Host "STEP 3 — COPY MISSING FOLDERS FROM SOURCE"
Write-Host "════════════════════════════════════════"
$missing = @()
if (-not (Test-Path "C:\Racira\racira-nextjs\src\data\pdf\tool-config.ts")) {
  $missing += "data"
}
if (-not (Test-Path "C:\Racira\racira-nextjs\src\hooks\pdf")) {
  $missing += "hooks"
}

if ($missing -contains "data") {
  Copy-Item "C:\Racira\2pdf-nextjs\src\data\*" `
            "C:\Racira\racira-nextjs\src\data\pdf\" `
            -Recurse -Force
  Write-Host "Copied: 2pdf-nextjs/src/data/ -> src/data/pdf/"
}

if ($missing -contains "hooks") {
  $null = New-Item "C:\Racira\racira-nextjs\src\hooks\pdf" -ItemType Directory -Force
  Copy-Item "C:\Racira\2pdf-nextjs\src\hooks\*" `
            "C:\Racira\racira-nextjs\src\hooks\pdf\" `
            -Recurse -Force
  Write-Host "Copied: 2pdf-nextjs/src/hooks/ -> src/hooks/pdf/"
}


Write-Host "`n════════════════════════════════════════"
Write-Host "STEP 4 — FIX ALL IMPORTS IN src/views/pdf/ IN ONE PASS"
Write-Host "════════════════════════════════════════"
$viewsPath = "C:\Racira\racira-nextjs\src\views\pdf"
$files = Get-ChildItem $viewsPath -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
  $content = [System.IO.File]::ReadAllText($file.FullName)
  $original = $content

  # Fix data imports
  $content = $content -replace '@\/data\/tool-config\b', '@/data/pdf/tool-config'
  $content = $content -replace '@\/data\/tool-seo\b',    '@/data/pdf/tool-seo'
  $content = $content -replace '@\/data\/tools\b',       '@/data/pdf/tools'

  # Fix hooks imports
  $content = $content -replace '@\/hooks\/usePdfEditor\b', '@/hooks/pdf/usePdfEditor'
  $content = $content -replace '@\/hooks\/use-pdf\b',      '@/hooks/pdf/use-pdf'

  if ($content -ne $original) {
    [System.IO.File]::WriteAllText($file.FullName, $content)
    Write-Host "Fixed: $($file.Name)"
  } else {
    Write-Host "Clean: $($file.Name)"
  }
}

$appPdfPath = "C:\Racira\racira-nextjs\src\app\pdf"
$appFiles = Get-ChildItem $appPdfPath -Recurse -Include "*.ts","*.tsx"

foreach ($file in $appFiles) {
  $content = [System.IO.File]::ReadAllText($file.FullName)
  $original = $content

  $content = $content -replace '@\/data\/tool-config\b', '@/data/pdf/tool-config'
  $content = $content -replace '@\/data\/tool-seo\b',    '@/data/pdf/tool-seo'
  $content = $content -replace '@\/data\/tools\b',       '@/data/pdf/tools'
  $content = $content -replace '@\/hooks\/usePdfEditor\b', '@/hooks/pdf/usePdfEditor'

  if ($content -ne $original) {
    [System.IO.File]::WriteAllText($file.FullName, $content)
    Write-Host "Fixed (app/pdf): $($file.Name)"
  }
}

Write-Host "`n════════════════════════════════════════"
Write-Host "STEP 5 — ALSO FIX INTERNAL IMPORTS INSIDE THE COPIED DATA/HOOKS FILES"
Write-Host "════════════════════════════════════════"
$foldersToFix = @(
  "C:\Racira\racira-nextjs\src\data\pdf",
  "C:\Racira\racira-nextjs\src\hooks\pdf"
)

foreach ($folder in $foldersToFix) {
  if (-not (Test-Path $folder)) { continue }
  Get-ChildItem $folder -Recurse -Include "*.ts","*.tsx" | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    $original = $content

    $content = $content -replace '@\/data\/tool-config\b', '@/data/pdf/tool-config'
    $content = $content -replace '@\/data\/tool-seo\b',    '@/data/pdf/tool-seo'
    $content = $content -replace '@\/data\/tools\b',       '@/data/pdf/tools'
    $content = $content -replace '@\/hooks\/usePdfEditor\b', '@/hooks/pdf/usePdfEditor'
    $content = $content -replace '@\/hooks\/use-pdf\b',      '@/hooks/pdf/use-pdf'

    if ($content -ne $original) {
      [System.IO.File]::WriteAllText($_.FullName, $content)
      Write-Host "Fixed internal: $($_.Name)"
    }
  }
}
