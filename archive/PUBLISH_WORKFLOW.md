# TexMex v0.0.5 Publishing Workflow

Complete guide to publish your extension to GitHub and VS Code Marketplace.

## 📋 Prerequisites Checklist

- [ ] VS Code Marketplace Publisher account (you have: `RahulChalla`)
- [ ] GitHub account with admin access to `RahulChalla/texmex`
- [ ] VS Code Marketplace Personal Access Token (PAT)
- [ ] GitHub Personal Access Token (optional, for CLI release creation)
- [ ] texmex-0.0.5.vsix file ready (21 MB)

## 🔑 Getting Your Tokens

### VS Code Marketplace PAT

**This is what you need to publish to the Marketplace.**

1. Go to: https://marketplace.visualstudio.com/manage
2. Click your profile in top-right
3. Select "Personal access tokens"
4. Click "New Token"
5. Fill in:
   - Name: `texmex-publish`
   - Organization: `RahulChalla` (or leave blank)
   - Scopes: Check ✓ "Publish"
   - Validity: 90 days (or preferred)
6. Click "Create"
7. **Copy the token** (save it somewhere secure - you won't see it again!)

### GitHub Personal Access Token (Optional)

**Only needed if you want to automate GitHub release creation.**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Fill in:
   - Token name: `texmex-publish`
   - Scopes: Check ✓ "repo" (full)
   - Expiration: 90 days (or preferred)
4. Click "Generate token"
5. **Copy the token** (save it somewhere secure!)

---

## 🚀 Publishing Steps

### Method 1: Automated Scripts (Recommended)

Your scripts handle everything securely:

#### Option A: Both GitHub Release + Marketplace Publish

```powershell
cd C:\Users\rahul\Desktop\CODE\TexMex

# Step 1: Create GitHub Release
.\github-release.ps1
# When prompted, paste your GitHub token

# Step 2: Publish to Marketplace
.\publish.ps1
# When prompted, paste your Marketplace token
```

#### Option B: GitHub Release Only

```powershell
cd C:\Users\rahul\Desktop\CODE\TexMex
.\github-release.ps1
```

#### Option C: Marketplace Publish Only

```powershell
cd C:\Users\rahul\Desktop\CODE\TexMex
.\publish.ps1
```

### Method 2: Manual Steps

#### 1. Create GitHub Release

**Using Web UI (Easiest):**

1. Go to: https://github.com/RahulChalla/texmex/releases
2. Click "Create a new release"
3. Tag version: `v0.0.5`
4. Release title: `v0.0.5 - Peer Collaboration & Zero External Dependencies`
5. Release notes:
   ```markdown
   ## 🎉 Major Update

   - 🤝 Added WebSocket peer collaboration
   - 📦 Removed external dependencies
   - 🎨 Improved PDF viewer
   - 📚 Comprehensive documentation

   See IMPROVEMENTS_SUMMARY.md for details.
   ```
6. Attach binary: Upload `texmex-0.0.5.vsix`
7. Check "This is a pre-release" (if needed)
8. Click "Publish release"

**Using GitHub CLI:**

```bash
gh release create v0.0.5 \
  --title "v0.0.5 - Peer Collaboration & Zero External Dependencies" \
  --notes "See IMPROVEMENTS_SUMMARY.md for details" \
  texmex-0.0.5.vsix
```

#### 2. Publish to VS Code Marketplace

**Verify token authentication:**

```powershell
vsce login RahulChalla
# Paste your token when prompted
```

**Publish:**

```powershell
cd C:\Users\rahul\Desktop\CODE\TexMex
vsce publish
```

**Or directly:**

```powershell
vsce publish --pat YOUR_MARKETPLACE_TOKEN
```

---

## ✅ Verification

After publishing, verify everything is working:

### Check Marketplace

1. Visit: https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex
2. Verify:
   - [ ] Version shows 0.0.5
   - [ ] Description is updated
   - [ ] Install button works
   - [ ] Rating/reviews show

### Check GitHub Release

1. Visit: https://github.com/RahulChalla/texmex/releases/tag/v0.0.5
2. Verify:
   - [ ] Release notes visible
   - [ ] texmex-0.0.5.vsix attached
   - [ ] Download link works

### Test Installation

In VS Code:
1. Press `Ctrl+Shift+X` (Extensions)
2. Search for "TexMex"
3. Click "Install"
4. Verify version is 0.0.5
5. Test the extension works

---

## 📝 Updating Marketplace Description (Optional)

After publishing, you can enhance the marketplace listing:

1. Go to: https://marketplace.visualstudio.com/manage/publishers/RahulChalla/extensions/texmex/hub
2. Click "Edit in Marketplace"
3. Update sections:

**Overview Tab:**
```markdown
Live LaTeX preview with peer collaboration. Real-time editing like Overleaf, built directly into VS Code.

## Features
- Live Preview: See your LaTeX render in real-time
- Peer Collaboration: WebSocket-based team editing
- PDF Download: Save compiled documents
- No External Dependencies: Works completely offline

## Quick Start
1. Open .tex file
2. Ctrl+Shift+P → "TexMex: Open Live Preview"
3. Edit and watch preview update!

## Peer Work
1. TexMex: Create Peer Session
2. Share session ID with teammates
3. They join and changes sync instantly
```

4. Click "Save" at bottom
5. Wait 5-10 minutes for update to appear

---

## 🔄 Complete Checklist

### Pre-Publishing
- [ ] All code committed to git
- [ ] Changes pushed to GitHub
- [ ] Version in package.json is 0.0.5
- [ ] texmex-0.0.5.vsix exists (21 MB)
- [ ] Extension compiles without errors
- [ ] Documentation is updated
- [ ] CHANGELOG.md updated

### Publishing
- [ ] GitHub release created with .vsix
- [ ] Marketplace token acquired
- [ ] Extension published to Marketplace
- [ ] GitHub release verified
- [ ] Marketplace listing verified
- [ ] Installation tested

### Post-Publishing
- [ ] Update marketplace description (optional)
- [ ] Announce update on GitHub
- [ ] Verify users can install from marketplace
- [ ] Monitor for issues/feedback
- [ ] Archive tokens securely

---

## 🔒 Security Best Practices

### Token Management

✅ **DO:**
- Use strong, unique tokens
- Set expiration dates (90 days recommended)
- Create separate tokens for different purposes
- Store tokens in password manager
- Rotate tokens regularly

❌ **DON'T:**
- Commit tokens to GitHub
- Share tokens via email/chat
- Use same token for multiple services
- Keep tokens indefinitely
- Paste tokens in scripts permanently

### If Token Compromised

1. Immediately revoke token:
   - Marketplace: https://marketplace.visualstudio.com/manage
   - GitHub: https://github.com/settings/tokens

2. Create new token with same scopes

3. Update any saved credentials

---

## 🚨 Troubleshooting

### "Publisher not recognized" Error

**Solution:**
```powershell
vsce login RahulChalla
# Paste your Marketplace token
```

### "Invalid token" Error

1. Verify token has "Publish" scope
2. Check token hasn't expired
3. Create new token if needed
4. Log in again: `vsce login RahulChalla`

### "Version already published" Error

This means v0.0.5 is already on the Marketplace. Either:
- Update version in package.json and rebuild
- Skip publishing (already live)
- Check Marketplace for existing version

### Release Upload Failed

1. Check .vsix file exists and is valid
2. Verify GitHub token has repo scope
3. Check file isn't too large (current: 21 MB is OK)
4. Try again - may be temporary network issue

### "ECONNREFUSED" Error

Temporary network issue. Wait a few moments and retry.

---

## 📚 Resources

- [VS Code Extension Publishing Docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce GitHub Repository](https://github.com/Microsoft/vsce)
- [Marketplace API Reference](https://docs.microsoft.com/en-us/rest/api/vsx/)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Create GitHub release | `.\github-release.ps1` |
| Publish to Marketplace | `.\publish.ps1` |
| Login to Marketplace | `vsce login RahulChalla` |
| Check published version | `vsce show RahulChalla.texmex` |
| View Marketplace listing | https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex |

---

**Ready to publish? Start with the automated scripts above!**

**Created:** June 19, 2025  
**Status:** Ready to Publish ✅
