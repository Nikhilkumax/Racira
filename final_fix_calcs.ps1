
$files = Get-ChildItem src/calculators/*.tsx | Select-Object -ExpandProperty FullName

$junkPattern = '(?s)\s+\$all = \$args\[0\].Groups\[1\].Value.*?;\s*'

foreach ($path in $files) {
    $name = [System.IO.Path]::GetFileName($path)
    $content = [System.IO.File]::ReadAllText($path)
    $original = $content
    
    # 1. Remove Junk
    if ($content -match '\$all = \$args\[0\]') {
        $content = [regex]::Replace($content, $junkPattern, "`r`n")
    }

    # 2. Add Calculate Button if missing
    if ($content -notmatch 'onClick=\{handleCalculate\}') {
        $calcBtn = "`n              <button`n                onClick={handleCalculate}`n                className=`"flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2`"`n              >`n                <Calculator className=`"h-4 w-4`" />`n                Calculate`n              </button>`n"
        
        # Look for the container that has the reset button
        if ($content -match 'className="[^"]*flex[^"]*justify-end[^"]*"') {
            $content = [regex]::Replace($content, 'className="([^"]*flex[^"]*)justify-end([^"]*)"', 'className="$1gap-3 items-center$2"')
            if ($content -match '<button onClick=\{reset\}') {
                $content = $content -replace '(<button onClick=\{reset\})', ($calcBtn + '$1')
            }
        }
    }

    # 3. Remove useEffect auto-calc
    $content = [regex]::Replace($content, '(?s)\s+useEffect\(\(\) => \{\s*handleCalculate\(\);\s*\}, \[[^\]]+\]\);', '')
    $content = [regex]::Replace($content, '(?s)\s+useEffect\(\(\) => \{\s*calculate\(\);\s*\}, \[[^\]]+\]\);', '')

    # 4. Final check for showResults state (if missing)
    if ($content -notmatch 'const \[showResults, setShowResults\] = useState\(false\)') {
         if ($content -match 'const \[results, setResults\] = useState') {
            $content = [regex]::Replace($content, '(const \[results, setResults\] = useState[^\n]+)', '$1' + "`n  const [showResults, setShowResults] = useState(false);")
        }
    }

    # 5. Final check for handleCalculate setShowResults(true)
    if ($content -match 'const handleCalculate = \(\) => \{' -and $content -notmatch 'setShowResults\(true\)') {
        $content = $content -replace 'const handleCalculate = \(\) => \{', "const handleCalculate = () => {`n    setShowResults(true);"
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content)
        Write-Host "Updated: $name"
    }
}

Write-Host "Done."
