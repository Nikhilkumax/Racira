$files = Get-ChildItem 'C:\Racira\racira-nextjs\src\calculators' -Filter '*.tsx'
$missing = @()
foreach ($file in $files) {
  $content = [System.IO.File]::ReadAllText($file.FullName)
  if ($content.Contains('<AdPlaceholder') -and -not $content.Contains('import AdPlaceholder')) {
    $missing += $file.Name
  }
}
$missing
