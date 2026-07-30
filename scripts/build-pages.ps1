# Builds the static GitHub Pages preview of the site.
# Server-only routes (auth API, quote API, account portal) are temporarily
# moved out of src/app because `output: "export"` cannot build them, then
# restored afterward. Output lands in .\out with a .nojekyll marker.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$excluded = Join-Path $root ".static-excluded"
New-Item -ItemType Directory -Force $excluded | Out-Null

$serverOnly = @("src\app\api", "src\app\account")

try {
    foreach ($p in $serverOnly) {
        if (Test-Path (Join-Path $root $p)) {
            $dest = Join-Path $excluded (Split-Path $p -Leaf)
            Move-Item (Join-Path $root $p) $dest
        }
    }

    $env:STATIC_EXPORT = "1"
    $env:NEXT_PUBLIC_STATIC = "1"
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "next build failed" }

    # GitHub Pages runs Jekyll by default, which drops _next/ — disable it.
    New-Item -ItemType File -Force (Join-Path $root "out\.nojekyll") | Out-Null
    Write-Host "`nStatic preview built to .\out"
}
finally {
    $env:STATIC_EXPORT = $null
    $env:NEXT_PUBLIC_STATIC = $null
    foreach ($p in $serverOnly) {
        $src = Join-Path $excluded (Split-Path $p -Leaf)
        if (Test-Path $src) {
            Move-Item $src (Join-Path $root $p)
        }
    }
    Remove-Item $excluded -Recurse -Force -ErrorAction SilentlyContinue
}
