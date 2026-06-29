$appDir = 'C:\Racira\racira-nextjs\src\app'
$fixed = 0
Get-ChildItem $appDir -Recurse -Filter 'layout.tsx' | ForEach-Object {
  $content = [System.IO.File]::ReadAllText($_.FullName)
  if ($content.Contains('"./globals.css"')) {
    Write-Host "Fixing: $($_.FullName.Replace($appDir, ''))"
    $newContent = $content -replace 'import\s+"./globals.css";\r?\n?', ''
    [System.IO.File]::WriteAllText($_.FullName, $newContent)
    $fixed++
  }
}
Write-Host "Fixed $fixed layouts with globals.css imports"
