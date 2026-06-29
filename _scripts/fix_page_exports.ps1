$SRC = 'C:\Racira\racira-nextjs\src\app'
$fixed = 0

# Find all page.tsx files that have named exports that could cause TS errors
# Pattern: "export function" or "export const" (that are not 'metadata', 'default', 'generateMetadata', etc.)
$allowedExports = @('metadata', 'generateMetadata', 'generateStaticParams', 'revalidate', 'dynamic', 'dynamicParams', 'fetchCache', 'runtime', 'preferredRegion', 'maxDuration', 'generateViewport', 'config')

Get-ChildItem $SRC -Recurse -Filter 'page.tsx' | ForEach-Object {
  $content = [System.IO.File]::ReadAllText($_.FullName)
  $matches = [regex]::Matches($content, 'export\s+(function|const|class)\s+(\w+)')
  $hasExtraExports = $false
  foreach ($m in $matches) {
    $exportName = $m.Groups[2].Value
    if ($allowedExports -notcontains $exportName -and $exportName -ne 'default') {
      Write-Host "EXTRA EXPORT in $($_.FullName.Replace($SRC,'')): $exportName"
      $hasExtraExports = $true
    }
  }
  
  if ($hasExtraExports) {
    # Fix: change "export function X" to "function X" for non-standard exports
    $newContent = $content
    foreach ($m in ([regex]::Matches($content, 'export\s+(function|const|class)\s+(\w+)'))) {
      $exportName = $m.Groups[2].Value
      $exportKind = $m.Groups[1].Value
      if ($allowedExports -notcontains $exportName -and $exportName -ne 'default') {
        $oldExport = "export $exportKind $exportName"
        $newExport = "$exportKind $exportName"
        $newContent = $newContent.Replace($oldExport, $newExport)
        Write-Host "  FIXED: $oldExport -> $newExport"
        $fixed++
      }
    }
    if ($newContent -ne $content) {
      [System.IO.File]::WriteAllText($_.FullName, $newContent)
    }
  }
}

Write-Host "`nTotal export fixes: $fixed"
