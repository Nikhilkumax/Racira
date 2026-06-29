$SRC = 'C:\Racira\racira-nextjs\src'
$fixes = 0

# Files that need @/components/X -> @/components/[route]/X
$specificFixes = @(
  # [file, route, oldImport, newImport]
  @("$SRC\app\security\page.tsx", 'security', '@/components/Layout', '@/components/security/Layout'),
  @("$SRC\app\games\layout.tsx", 'games', '@/components/Header', '@/components/games/Header'),
  @("$SRC\app\games\layout.tsx", 'games', '@/components/Footer', '@/components/games/Footer'),
  @("$SRC\app\presentation\page.tsx", 'presentation', '@/components/Header', '@/components/presentation/Header'),
  @("$SRC\app\video\layout.tsx", 'video', '@/components/Header', '@/components/video/Header'),
  @("$SRC\app\video\layout.tsx", 'video', '@/components/Footer', '@/components/video/Footer'),
  @("$SRC\views\pdf\Index.tsx", 'pdf', '@/data/tools', '@/data/pdf/tools')
)

foreach ($fix in $specificFixes) {
  $file = $fix[0]
  $route = $fix[1]
  $oldPath = $fix[2]
  $newPath = $fix[3]
  
  if (Test-Path $file) {
    $content = [System.IO.File]::ReadAllText($file)
    if ($content.Contains($oldPath)) {
      $content = $content.Replace($oldPath, $newPath)
      [System.IO.File]::WriteAllText($file, $content)
      Write-Host "FIXED [$route]: $oldPath -> $newPath"
      $fixes++
    } else {
      Write-Host "NOT FOUND in $($file.Replace($SRC,'')): $oldPath"
    }
  }
}

Write-Host "`nTotal specific fixes: $fixes"
