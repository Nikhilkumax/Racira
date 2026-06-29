$content = [System.IO.File]::ReadAllText('C:\Racira\racira-nextjs\src\lib\pdf\pdf-tools.ts')
$content = $content.Replace('eta: null', 'eta: undefined')
[System.IO.File]::WriteAllText('C:\Racira\racira-nextjs\src\lib\pdf\pdf-tools.ts', $content)
