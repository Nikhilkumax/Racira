$files = Get-ChildItem -Path 'C:\Racira\racira-nextjs\src\lib\developers\tools', 'C:\Racira\racira-nextjs\src\components\developers\tools' -Filter '*.tsx' -Recurse
$files += Get-ChildItem -Path 'C:\Racira\racira-nextjs\src\lib\developers\tools', 'C:\Racira\racira-nextjs\src\components\developers\tools' -Filter '*.ts' -Recurse
foreach ($file in $files) {
  $content = [System.IO.File]::ReadAllText($file.FullName)
  if ($content.Contains('@/components/tools/')) {
    $content = $content.Replace('@/components/tools/', '@/components/developers/tools/')
    [System.IO.File]::WriteAllText($file.FullName, $content)
  }
}
