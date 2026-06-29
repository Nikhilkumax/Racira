Write-Host '--- Route folders in src/app/ ---'
Get-ChildItem 'C:\Racira\racira-nextjs\src\app' -Directory | Select-Object -ExpandProperty Name | Sort-Object

Write-Host ''
Write-Host '--- flowchart source structure ---'
Get-ChildItem 'C:\Racira\29-flowchart-main' -Recurse -File | Select-Object -First 30 | ForEach-Object {
  Write-Host $_.FullName.Replace('C:\Racira\29-flowchart-main\', '')
}

Write-Host ''
Write-Host '--- Route count ---'
$count = (Get-ChildItem 'C:\Racira\racira-nextjs\src\app' -Directory).Count
Write-Host "Total route folders: $count"
