
$files = Get-ChildItem src/calculators/*.tsx | Select-Object -ExpandProperty FullName

$junkPattern = '(?s)\s+\$all = \$args\[0\].Groups\[1\].Value.*?;\s*'

foreach ($path in $files) {
    $name = [System.IO.Path]::GetFileName($path)
    $content = [System.IO.File]::ReadAllText($path)
    $original = $content
    
    # 1. Remove Junk (Global)
    if ($content -match '\$all = \$args\[0\]') {
        $content = [regex]::Replace($content, $junkPattern, "`r`n")
    }

    # 2. Pattern Implementation
    if ($content -notmatch 'showResults') {
        # Add showResults state
        if ($content -match 'const \[results, setResults\] = useState') {
            $content = [regex]::Replace($content, '(const \[results, setResults\] = useState[^\n]+)', '$1' + "`n  const [showResults, setShowResults] = useState(false);")
        }

        # Rename calculate to handleCalculate and add setShowResults(true)
        if ($content -match 'const calculate = \(\) => \{') {
            $content = $content -replace 'const calculate = \(\) => \{', "const handleCalculate = () => {`n    setShowResults(true);"
            $content = $content -replace '\bcalculate\(\)', 'handleCalculate()'
        }

        # Remove useEffect auto-calc
        $content = [regex]::Replace($content, '(?s)\s+useEffect\(\(\) => \{\s*handleCalculate\(\);\s*\}, \[[^\]]+\]\);', '')
        $content = [regex]::Replace($content, '(?s)\s+useEffect\(\(\) => \{\s*calculate\(\);\s*\}, \[[^\]]+\]\);', '')

        # Add Calculate Button
        $calcBtn = "`n              <button`n                onClick={handleCalculate}`n                className=`"flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2`"`n              >`n                <Calculator className=`"h-4 w-4`" />`n                Calculate`n              </button>`n"
        
        # Match flex justify-end area
        if ($content -match 'className="mt-8 flex justify-end[^"]*"') {
            $content = [regex]::Replace($content, 'className="mt-8 flex justify-end([^"]*)"', 'className="mt-8 flex gap-3 items-center$1"')
            if ($content -match '<button onClick=\{reset\}') {
                $content = $content -replace '(<button onClick=\{reset\})', ($calcBtn + '$1')
            }
        }

        # Wrap results
        $content = $content -replace '\{results && \(', '{showResults && results && ('
        
        # Reset clears showResults
        if ($content -match 'const reset = \(\) => \{') {
            $content = $content -replace 'const reset = \(\) => \{', "const reset = () => {`n    setShowResults(false);"
        }
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content)
        Write-Host "Updated: $name"
    }
}

Write-Host "Done."
