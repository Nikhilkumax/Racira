$f1 = Get-Content 'C:\Racira\2pdf-nextjs\src\lib\utils.ts' -Raw
$f2 = Get-Content 'C:\Racira\4-design-nextjs\src\lib\utils.ts' -Raw
$f3 = Get-Content 'C:\Racira\13seo-nextjs\src\lib\utils.ts' -Raw
Write-Host "pdf utils==design utils: $($f1 -eq $f2)"
Write-Host "pdf utils==seo utils: $($f1 -eq $f3)"
Write-Host "--- pdf utils.ts content ---"
Write-Host $f1

$b1 = Get-Content 'C:\Racira\2pdf-nextjs\src\components\ui\button.tsx' -Raw
$b2 = Get-Content 'C:\Racira\4-design-nextjs\src\components\ui\button.tsx' -Raw
$b3 = Get-Content 'C:\Racira\13seo-nextjs\src\components\ui\button.tsx' -Raw
Write-Host "button pdf==design: $($b1 -eq $b2)"
Write-Host "button pdf==seo: $($b1 -eq $b3)"

# Check tools.ts collision samples
Write-Host "`n--- tools.ts in photo ---"
Get-Content 'C:\Racira\7-photo-nextjs\src\lib\tools.ts' -Raw | Select-Object -First 1
(Get-Content 'C:\Racira\7-photo-nextjs\src\lib\tools.ts').Count
Write-Host "`n--- tools.ts in security ---"
(Get-Content 'C:\Racira\28-security-nextjs\src\lib\tools.ts').Count

Write-Host "`n--- tools-data.ts in design ---"
(Get-Content 'C:\Racira\4-design-nextjs\src\lib\tools-data.ts').Count
Write-Host "`n--- tools-data.ts in fitness ---"
(Get-Content 'C:\Racira\22-fit-nextjs\src\lib\tools-data.ts').Count
