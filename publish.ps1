# TexMex VS Code Marketplace Publishing Script
# This script publishes your extension to the VS Code Marketplace

param(
    [Parameter(Mandatory=$false)]
    [string]$Token
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "TexMex v0.0.5 Publishing to Marketplace" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# If token not provided, ask for it
if (-not $Token) {
    Write-Host "📝 Enter your VS Code Marketplace Personal Access Token:"
    Write-Host "   (Get it from: https://marketplace.visualstudio.com/manage/publishers/RahulChalla)"
    Write-Host ""

    $secureToken = Read-Host -AsSecureString "Token"
    $Token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secureToken))
}

if (-not $Token) {
    Write-Host "❌ Token is required" -ForegroundColor Red
    exit 1
}

# Change to project directory
$projectPath = Split-Path -Parent $PSCommandPath
Set-Location $projectPath

Write-Host "✓ Using project directory: $projectPath" -ForegroundColor Green
Write-Host ""

# Step 1: Verify .vsix file exists
Write-Host "[1/4] Checking extension package..." -ForegroundColor Cyan
if (-not (Test-Path "texmex-0.0.5.vsix")) {
    Write-Host "❌ texmex-0.0.5.vsix not found!" -ForegroundColor Red
    Write-Host "Run 'npm run package' first" -ForegroundColor Yellow
    exit 1
}
$vsixSize = (Get-Item "texmex-0.0.5.vsix").Length / 1MB
Write-Host "✓ Package found: texmex-0.0.5.vsix ($([Math]::Round($vsixSize, 1)) MB)" -ForegroundColor Green
Write-Host ""

# Step 2: Verify vsce is installed
Write-Host "[2/4] Checking vsce..." -ForegroundColor Cyan
$vsce = & where.exe vsce 2>$null
if (-not $vsce) {
    Write-Host "⚠ vsce not found, installing globally..." -ForegroundColor Yellow
    npm install -g @vscode/vsce | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install vsce" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ vsce ready" -ForegroundColor Green
Write-Host ""

# Step 3: Publish to marketplace
Write-Host "[3/4] Publishing to VS Code Marketplace..." -ForegroundColor Cyan
Write-Host "   Publisher: RahulChalla" -ForegroundColor Gray
Write-Host "   Extension: texmex" -ForegroundColor Gray
Write-Host "   Version: 0.0.5" -ForegroundColor Gray
Write-Host ""

$publishOutput = & vsce publish --pat $Token 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully published to Marketplace!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Marketplace Listing:" -ForegroundColor Cyan
    Write-Host "   https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "❌ Publishing failed" -ForegroundColor Red
    Write-Host $publishOutput
    exit 1
}

# Step 4: Verify publication
Write-Host "[4/4] Verifying publication..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

$verifyUrl = "https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex"
Write-Host "✓ Verification URL:" -ForegroundColor Green
Write-Host "   $verifyUrl" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Publishing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Visit marketplace: $verifyUrl" -ForegroundColor Gray
Write-Host "  2. Verify version is 0.0.5" -ForegroundColor Gray
Write-Host "  3. Create GitHub release with .vsix file" -ForegroundColor Gray
Write-Host "  4. Update changelog on marketplace (optional)" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Installation:" -ForegroundColor Cyan
Write-Host "  Users can now install via:" -ForegroundColor Gray
Write-Host "    Ctrl+Shift+X → Search 'TexMex' → Install" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 Token Management:" -ForegroundColor Cyan
Write-Host "  Your token was not saved. For next time:" -ForegroundColor Gray
Write-Host "    ./publish.ps1 -Token 'your_token_here'" -ForegroundColor Gray
Write-Host "    (Or just run ./publish.ps1 to enter token interactively)" -ForegroundColor Gray
Write-Host ""
