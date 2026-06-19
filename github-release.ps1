# TexMex GitHub Release Publishing Script
# Creates a GitHub release and uploads the .vsix file

param(
    [Parameter(Mandatory=$false)]
    [string]$Token
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "Creating TexMex v0.0.5 GitHub Release" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# If token not provided, ask for it
if (-not $Token) {
    Write-Host "📝 Enter your GitHub Personal Access Token:"
    Write-Host "   (Get it from: https://github.com/settings/tokens)"
    Write-Host "   Scopes needed: repo (full)"
    Write-Host ""

    $secureToken = Read-Host -AsSecureString "Token"
    $Token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secureToken))
}

if (-not $Token) {
    Write-Host "❌ Token is required" -ForegroundColor Red
    exit 1
}

# Configuration
$repo = "RahulChalla/texmex"
$tag = "v0.0.5"
$title = "v0.0.5 - Peer Collaboration & Zero External Dependencies"
$projectPath = Split-Path -Parent $PSCommandPath

Set-Location $projectPath

Write-Host "✓ Repository: $repo" -ForegroundColor Green
Write-Host "✓ Tag: $tag" -ForegroundColor Green
Write-Host ""

# Step 1: Check if .vsix exists
Write-Host "[1/3] Checking extension package..." -ForegroundColor Cyan
if (-not (Test-Path "texmex-0.0.5.vsix")) {
    Write-Host "❌ texmex-0.0.5.vsix not found!" -ForegroundColor Red
    exit 1
}
$vsixPath = Get-Item "texmex-0.0.5.vsix"
$vsixSize = $vsixPath.Length / 1MB
Write-Host "✓ Package found: $($vsixPath.Name) ($([Math]::Round($vsixSize, 1)) MB)" -ForegroundColor Green
Write-Host ""

# Step 2: Check if release exists
Write-Host "[2/3] Checking GitHub..." -ForegroundColor Cyan
$headers = @{
    Authorization = "token $Token"
    "Accept" = "application/vnd.github+json"
    "User-Agent" = "TexMex-Publisher"
}

$checkUrl = "https://api.github.com/repos/$repo/releases/tags/$tag"
try {
    $existing = Invoke-RestMethod -Uri $checkUrl -Headers $headers -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "⚠ Release already exists!" -ForegroundColor Yellow
        Write-Host "   URL: https://github.com/$repo/releases/tag/$tag" -ForegroundColor Gray
        Write-Host ""
        $continue = Read-Host "Update existing release? (y/n)"
        if ($continue -ne "y") {
            Write-Host "Canceled" -ForegroundColor Yellow
            exit 0
        }
        # For now, we'll just skip if it exists
        Write-Host "Note: GitHub API requires deleting and recreating to update assets" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✓ Release does not exist (will create new)" -ForegroundColor Green
}
Write-Host ""

# Step 3: Create release with asset
Write-Host "[3/3] Creating release on GitHub..." -ForegroundColor Cyan
Write-Host ""

$releaseNotes = @"
## 🎉 TexMex v0.0.5 - Major Update

### ✨ New Features

**🤝 Peer Collaboration**
- Create collaborative sessions with WebSocket support
- Real-time document synchronization across peers
- Share session IDs for easy team editing
- No external services required - runs locally

**📦 Fully Self-Contained**
- Removed external CDN dependencies
- Embedded PDF viewer
- Works completely offline
- Zero external service calls

### 🎯 Improvements

- Better error handling and messaging
- Dark/light theme support
- Improved PDF viewer toolbar
  - Navigation controls
  - Zoom in/out
  - Page number input
  - Professional styling
- Comprehensive documentation
- Build scripts for easy packaging

### 📋 What's Included

- \`texmex-0.0.5.vsix\` - Ready-to-install VS Code extension
- Full source code with TypeScript
- Complete documentation:
  - README.md - Full feature documentation
  - QUICK_START.md - 30-second setup
  - SETUP_GUIDE.md - Installation & troubleshooting
  - IMPROVEMENTS_SUMMARY.md - Complete changelog

### 🚀 Quick Start

1. Download \`texmex-0.0.5.vsix\` below
2. Open VS Code → Ctrl+Shift+X → ... menu → Install from VSIX
3. Open a .tex file
4. Ctrl+Shift+P → "TexMex: Open Live Preview"
5. Done! See your LaTeX render in real-time

### 🤝 Peer Collaboration

\`\`\`
1. Run: TexMex: Create Peer Session
2. Share session ID with peers
3. They run: TexMex: Join Peer Session
4. Changes sync instantly!
\`\`\`

### 📦 Requirements

- VS Code 1.85.0+
- LaTeX distribution (TeX Live, MiKTeX, MacTeX)
- No Node.js required
- No internet required

### 🔍 Verification

\`\`\`bash
# The .vsix file is ready to install immediately
# No compilation or setup needed
\`\`\`

### 📚 Documentation

- [Full README](https://github.com/$repo)
- [Quick Start Guide](https://github.com/$repo/blob/main/QUICK_START.md)
- [Setup Guide](https://github.com/$repo/blob/main/SETUP_GUIDE.md)
- [Improvements Summary](https://github.com/$repo/blob/main/IMPROVEMENTS_SUMMARY.md)

---

**Download the .vsix file below to install in VS Code!**
"@

# Encode the body for JSON
$bodyJson = @{
    tag_name = $tag
    name = $title
    body = $releaseNotes
    draft = $false
    prerelease = $false
} | ConvertTo-Json

# Create release
$createUrl = "https://api.github.com/repos/$repo/releases"
try {
    $release = Invoke-RestMethod -Uri $createUrl -Method Post -Headers $headers -Body $bodyJson -ContentType "application/json"
    Write-Host "✓ Release created successfully!" -ForegroundColor Green
    Write-Host "  ID: $($release.id)" -ForegroundColor Gray
    Write-Host ""

    # Step 4: Upload asset
    Write-Host "Uploading .vsix file as asset..." -ForegroundColor Cyan

    $uploadUrl = $release.upload_url -replace '\{.*\}', "?name=texmex-0.0.5.vsix"
    $vsixContent = [System.IO.File]::ReadAllBytes("texmex-0.0.5.vsix")

    $uploadHeaders = @{
        Authorization = "token $Token"
        "Accept" = "application/vnd.github+json"
        "Content-Type" = "application/octet-stream"
        "User-Agent" = "TexMex-Publisher"
    }

    $asset = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -Body $vsixContent
    Write-Host "✓ Asset uploaded!" -ForegroundColor Green
    Write-Host "  Download URL: $($asset.browser_download_url)" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host "❌ Failed to create release" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ GitHub Release Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Release Details:" -ForegroundColor Cyan
Write-Host "  Repository: https://github.com/$repo" -ForegroundColor Yellow
Write-Host "  Release URL: https://github.com/$repo/releases/tag/$tag" -ForegroundColor Yellow
Write-Host "  Download: texmex-0.0.5.vsix" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Visit: https://github.com/$repo/releases/tag/$tag" -ForegroundColor Gray
Write-Host "  2. Verify .vsix is attached" -ForegroundColor Gray
Write-Host "  3. Run publish.ps1 to publish to Marketplace" -ForegroundColor Gray
Write-Host "  4. Update Marketplace description (optional)" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 Token Security:" -ForegroundColor Cyan
Write-Host "  Your token was not saved. For next time:" -ForegroundColor Gray
Write-Host "    ./github-release.ps1 -Token 'your_github_token'" -ForegroundColor Gray
Write-Host ""
