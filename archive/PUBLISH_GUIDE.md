# Publishing TexMex to VS Code Marketplace

This guide walks you through publishing your extension to the VS Code Marketplace and creating a GitHub release.

## Prerequisites

1. **GitHub Account** with push access to your repo
2. **VS Code Marketplace Publisher Account** (you already have: `RahulChalla`)
3. **Personal Access Tokens:**
   - GitHub PAT (for creating releases)
   - VS Code Marketplace PAT (for publishing)

## Step 1: Create GitHub Release

### Option A: Using GitHub CLI (Recommended)

If you don't have `gh` CLI installed:
```bash
# Windows (using Chocolatey)
choco install gh

# Mac (using Homebrew)
brew install gh

# Or download from: https://github.com/cli/cli/releases
```

Authenticate:
```bash
gh auth login
# Follow the prompts to authenticate
```

Create release and upload .vsix:
```bash
cd C:\Users\rahul\Desktop\CODE\TexMex

gh release create v0.0.5 \
  --title "v0.0.5 - Peer Collaboration & Zero External Dependencies" \
  --notes "See IMPROVEMENTS_SUMMARY.md for details" \
  texmex-0.0.5.vsix
```

### Option B: Using GitHub Web UI (Manual)

1. Go to: https://github.com/RahulChalla/texmex/releases
2. Click "Create a new release"
3. Tag: `v0.0.5`
4. Title: `v0.0.5 - Peer Collaboration & Zero External Dependencies`
5. Description:
   ```
   ## 🎉 Major Update

   ### New Features
   - 🤝 WebSocket-based peer collaboration
   - Create and join sessions for real-time sync
   - Embedded PDF viewer (no CDN required)
   - Full offline support

   ### Improvements
   - Removed external CDN dependencies
   - Better error handling
   - Dark/light theme support
   - Improved documentation

   See [IMPROVEMENTS_SUMMARY.md](https://github.com/RahulChalla/texmex/blob/main/IMPROVEMENTS_SUMMARY.md) for complete changelog.

   ### Downloads
   - **texmex-0.0.5.vsix** - VS Code extension package
   ```
6. Upload `texmex-0.0.5.vsix` as a binary attachment
7. Click "Publish release"

---

## Step 2: Publish to VS Code Marketplace

### Get Your Marketplace Personal Access Token

1. Go to: https://marketplace.visualstudio.com/manage/publishers/RahulChalla
2. Click your profile name → "Personal access tokens"
3. Click "Create new token"
4. Name: `texmex-publish`
5. Scopes: Select "Publish" and "Manage"
6. Validity: 90 days (or as needed)
7. Copy the token (save it securely!)

### Publish Using vsce

```bash
cd C:\Users\rahul\Desktop\CODE\TexMex

# First time: Store token
vsce login RahulChalla
# Paste your token when prompted

# Or publish directly
vsce publish --pat YOUR_TOKEN_HERE

# Or for personal use (stores token locally)
vsce publish -p YOUR_TOKEN_HERE
```

### Or Use PowerShell Script

```powershell
$token = Read-Host "Enter VS Code Marketplace PAT" -AsSecureString
$plainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($token))

cd "C:\Users\rahul\Desktop\CODE\TexMex"
vsce publish -p $plainToken
```

---

## Step 3: Update Marketplace Description (Optional)

After publishing, you can update the marketplace page:

1. Go to: https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex
2. Edit → "Edit Extension"
3. Update "Overview" with new features
4. Update version info
5. Save changes

### Suggested Marketplace Description for v0.0.5

```markdown
# TexMex - LaTeX Live Preview for VS Code

Live LaTeX preview with **peer collaboration** support. Similar to Overleaf, but integrated directly into your editor.

## Features

✨ **Live Preview** - See your LaTeX render in real-time as you type
🤝 **Peer Collaboration** - Work together with WebSocket-based real-time sync
📥 **PDF Download** - Save compiled documents as PDF
⚡ **Auto-Update** - Preview updates automatically when you save
🛡️ **Error Handling** - Clear error messages when compilation fails
📦 **Fully Self-Contained** - No external dependencies or internet required

## Quick Start

1. Open a `.tex` file
2. `Ctrl+Shift+P` → "TexMex: Open Live Preview"
3. See your PDF render as you edit!

## Peer Collaboration

Share your session:
- Run: `TexMex: Create Peer Session`
- Share the session ID
- Others run: `TexMex: Join Peer Session` and enter the ID
- Changes sync in real-time!

## Requirements

- VS Code 1.85.0+
- LaTeX distribution (TeX Live, MiKTeX, MacTeX)
- No Node.js or internet required

## Configuration

```json
{
  "texmex.latexPath": "pdflatex",
  "texmex.updateDelay": 1000,
  "texmex.enablePeerWork": true,
  "texmex.peerServerPort": 3000
}
```

See [Full Documentation](https://github.com/RahulChalla/texmex) for more.
```

---

## Complete Publishing Checklist

- [ ] Commit all changes: `git add -A && git commit -m "..."`
- [ ] Push to GitHub: `git push origin main`
- [ ] Tag release: `git tag v0.0.5` (already done)
- [ ] Push tag: `git push origin v0.0.5`
- [ ] Create GitHub release with .vsix file
- [ ] Test .vsix install locally before publishing
- [ ] Get VS Code Marketplace PAT
- [ ] Run: `vsce publish -p YOUR_TOKEN`
- [ ] Verify on Marketplace: https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex
- [ ] Update Marketplace description (optional)
- [ ] Post announcement (optional)

---

## Verification

After publishing, verify:

```bash
# Check marketplace listing
# https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex

# Test installation
# Open VS Code → Ctrl+Shift+X → Search "TexMex" → Install
```

---

## Troubleshooting

### "Invalid publisher" error
- Ensure you're logged in: `vsce login RahulChalla`
- Check token is valid
- Verify token has "Publish" scope

### "Invalid version" error
- Version in `package.json` must match release tag
- Current: `0.0.5` (check `package.json` line ~6)

### "ECONNREFUSED" error
- Network connectivity issue
- Check internet connection
- Try again in a few moments

### Token compromised?
- Go to marketplace.visualstudio.com/manage
- Revoke old token under "Personal access tokens"
- Create new token
- Update your local token: `vsce login RahulChalla`

---

## Need Help?

1. Check [vsce documentation](https://github.com/Microsoft/vsce)
2. Review [Marketplace guidelines](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
3. Post issues on GitHub

---

**Next Step:** Gather your GitHub and Marketplace tokens, then follow the steps above!
