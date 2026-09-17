# Racira preview/build launcher — the ONLY supported way to start the detached
# dev server or a detached production build in an isolated dist dir.
#
# Why this exists: launching via inline `powershell -Command "...$env:..."` from
# a POSIX-ish shell eats the $env assignment (double-quote expansion), which
# silently pointed builds/servers at the shared .next dir twice. The quoting
# and env-var logic lives HERE, inside a checked-in file, where no outer shell
# can mangle it.
#
# Usage:
#   powershell -NoProfile -File scripts/start-preview.ps1 -Mode dev
#   powershell -NoProfile -File scripts/start-preview.ps1 -Mode build
#
# Modes:
#   dev   - starts `npm run dev -- -p 3003` detached, RACIRA_DIST_DIR=.next-preview,
#           logs to .freebuff/preview-*.log(+.err), waits for Ready, writes the
#           PID to .freebuff/preview.pid
#   build - starts `npm run build` detached, RACIRA_DIST_DIR=.next-build-test,
#           logs to .freebuff/build-test.log(+.err), writes the PID to
#           .freebuff/build.pid
#
# The script returns immediately after spawning (detached); poll the log files
# and pid files afterwards.

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("dev", "build")]
    [string]$Mode
)

$ErrorActionPreference = "Stop"

# Repo root = two levels up from this script.
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
Set-Location $repoRoot

if ($Mode -eq "dev") {
    $env:RACIRA_DIST_DIR = ".next-preview"
    $outLog = Join-Path $repoRoot ".freebuff\preview-cdf0c65b-8bf8-4385-98b5-5f05240d6cca.log"
    $errLog = "$outLog.err"
    $pidFile = Join-Path $repoRoot ".freebuff\preview.pid"
    $args = @("run", "dev", "--", "-p", "3003")
}
else {
    $env:RACIRA_DIST_DIR = ".next-build-test"
    $outLog = Join-Path $repoRoot ".freebuff\build-test.log"
    $errLog = Join-Path $repoRoot ".freebuff\build-test.log.err"
    $pidFile = Join-Path $repoRoot ".freebuff\build.pid"
    $args = @("run", "build")
}

# Fresh log per launch.
if (Test-Path $outLog) { Remove-Item $outLog -Force }
if (Test-Path $errLog) { Remove-Item $errLog -Force }

$proc = Start-Process -FilePath "npm.cmd" `
    -ArgumentList $args `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog `
    -WindowStyle Hidden `
    -PassThru

Set-Content -Path $pidFile -Value $proc.Id
Write-Output "PID=$($proc.Id) MODE=$Mode DIST=$env:RACIRA_DIST_DIR LOG=$outLog"

if ($Mode -eq "dev") {
    # Wait up to 45 s for the dev server to answer on 3003.
    $ready = $false
    for ($i = 0; $i -lt 45; $i++) {
        Start-Sleep -Seconds 1
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:3003/" -UseBasicParsing -TimeoutSec 2
            if ($resp.StatusCode -eq 200) { $ready = $true; break }
        }
        catch { }
    }
    if ($ready) { Write-Output "READY http://localhost:3003/" }
    else { Write-Output "NOT_READY_YET (check $outLog)" }
}
