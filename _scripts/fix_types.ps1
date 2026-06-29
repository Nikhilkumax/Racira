$files = @(
  'C:\Racira\racira-nextjs\src\lib\finance\mock\data.ts',
  'C:\Racira\racira-nextjs\src\lib\finance\data\media.ts',
  'C:\Racira\racira-nextjs\src\lib\finance\data\taxonomy.ts',
  'C:\Racira\racira-nextjs\src\lib\finance\data\posts.ts',
  'C:\Racira\racira-nextjs\src\lib\finance\data\store.ts',
  'C:\Racira\racira-nextjs\src\components\finance\post-card.tsx',
  'C:\Racira\racira-nextjs\src\components\finance\admin\post-form.tsx'
)
foreach ($file in $files) {
  $content = [System.IO.File]::ReadAllText($file)
  $content = $content.Replace('@/types/db', '@/types/finance/db')
  [System.IO.File]::WriteAllText($file, $content)
  Write-Host "Fixed: $file"
}
