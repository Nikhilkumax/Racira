cd 'C:\Racira\racira-nextjs'
$output = & npm run build 2>&1
$inError = $false
$errorLines = @()
foreach ($line in $output) {
  if ($line -match '^\./' -or $line -match "Module not found|Can't resolve|Failed to compile") {
    $inError = $true
  }
  if ($inError) {
    $errorLines += $line
    if ($line -match "^$" -or $line -match "^https://") {
      $inError = $false
    }
  }
}
$errorLines | Select-Object -Unique
