
$path = "src/calculators/ACTScoreCalculator.tsx"
$content = [System.IO.File]::ReadAllText($path)

Write-Host "File size: $($content.Length)"
Write-Host "Has showResults: $($content -match 'showResults')"
Write-Host "Has results state: $($content -match 'const \[results, setResults\] = useState')"

if ($content -match 'const \[results, setResults\] = useState') {
    $content = [regex]::Replace($content, '(const \[results, setResults\] = useState[^\n]+)', '$1' + "`n  const [showResults, setShowResults] = useState(false);")
    Write-Host "Added showResults"
}

if ($content -match 'const calculate = \(\) => \{') {
    $content = $content -replace 'const calculate = \(\) => \{', "const handleCalculate = () => {`n    setShowResults(true);"
    Write-Host "Renamed calculate"
}

[System.IO.File]::WriteAllText($path, $content)
Write-Host "Finished ACTScoreCalculator debug."
