# TexMex Setup & Installation Guide

## 📦 What You Have

Your TexMex VS Code extension is **fully self-contained**:
- ✅ Zero external runtime dependencies
- ✅ WebSocket peer collaboration built-in
- ✅ No CDN dependencies (offline-first)
- ✅ Ready to install and use immediately

## 🚀 Installation Methods

### Method 1: Direct VSIX Install (Fastest)

**Prerequisites:** VS Code 1.85.0 or later

1. **Locate the package:**
   ```
   C:\Users\rahul\Desktop\CODE\TexMex\texmex-0.0.5.vsix
   ```

2. **Install in VS Code:**
   - Open VS Code
   - Press `Ctrl+Shift+X` (Extensions panel)
   - Click the `...` menu (top-right)
   - Select "Install from VSIX..."
   - Choose `texmex-0.0.5.vsix`
   - Click "Install"

3. **Activate:**
   - Restart VS Code
   - Open any `.tex` file
   - Press `Ctrl+Shift+P` → "TexMex: Open Live Preview"

### Method 2: Build from Source

**Prerequisites:** Node.js 16+, npm, LaTeX distribution

```bash
cd C:\Users\rahul\Desktop\CODE\TexMex

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension
npm run package

# Install in VS Code (same as Method 1)
```

**On Windows:** Double-click `build.bat`
**On Mac/Linux:** Run `bash build.sh`

## 🎯 First Time Setup

### Step 1: Verify LaTeX Installation

```bash
# Check if pdflatex is available
pdflatex --version
```

**If not installed:**
- **Windows:** Install [MiKTeX](https://miktex.org/download)
- **Mac:** Install [MacTeX](https://www.tug.org/mactex/)
- **Linux:** `sudo apt-get install texlive-full` (Ubuntu/Debian)

### Step 2: Configure TexMex (Optional)

Create or edit `.vscode/settings.json` in your workspace:

```json
{
  "texmex.latexPath": "pdflatex",
  "texmex.updateDelay": 1000,
  "texmex.enablePeerWork": true,
  "texmex.peerServerPort": 3000
}
```

**Or configure globally:**
- Open VS Code Settings (`Ctrl+,`)
- Search for "TexMex"
- Adjust settings as needed

### Step 3: Test the Installation

1. **Create a test file** `test.tex`:
   ```latex
   \documentclass{article}
   \usepackage[utf-8]{inputenc}
   \title{TexMex Test}
   \author{Your Name}
   \begin{document}
   \maketitle
   \section{Introduction}
   TexMex is working!
   \end{document}
   ```

2. **Open the preview:**
   - `Ctrl+Shift+P` → "TexMex: Open Live Preview"
   - You should see a rendered PDF

3. **Test live editing:**
   - Edit the file
   - Save (`Ctrl+S`)
   - Preview should update automatically

## 🤝 Peer Collaboration Setup

### For the "Host" (starts the session):

1. Open your `.tex` file
2. Open preview: `Ctrl+Shift+P` → "TexMex: Open Live Preview"
3. Create session: `Ctrl+Shift+P` → "TexMex: Create Peer Session"
4. Copy the session ID from the notification
5. Share with your collaborator

### For the "Guest" (joins the session):

1. Open a `.tex` file (same or different)
2. Open preview: `Ctrl+Shift+P` → "TexMex: Open Live Preview"
3. Join session: `Ctrl+Shift+P` → "TexMex: Join Peer Session"
4. Paste the session ID your peer shared
5. Changes now sync in real-time!

**Note:** The host's LaTeX compiler is used by default. Both users need LaTeX installed for the best experience.

## ⚙️ Configuration Reference

### Settings in VS Code

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `texmex.latexPath` | string | `pdflatex` | LaTeX compiler path |
| `texmex.updateDelay` | number | `1000` | Preview update delay (ms) |
| `texmex.enablePeerWork` | boolean | `true` | Enable peer collaboration |
| `texmex.peerServerPort` | number | `3000` | Peer server port |

### Example Configurations

**Fast preview updates (500ms):**
```json
{ "texmex.updateDelay": 500 }
```

**Use XeLaTeX instead:**
```json
{ "texmex.latexPath": "xelatex" }
```

**Disable peer work (local only):**
```json
{ "texmex.enablePeerWork": false }
```

**Custom peer server port:**
```json
{ "texmex.peerServerPort": 3001 }
```

## 🔧 Troubleshooting

### Issue: "LaTeX not found" Error

**Solution:**
1. Install a LaTeX distribution (see "Verify LaTeX Installation" above)
2. Update `texmex.latexPath` to your LaTeX executable path:
   ```json
   { "texmex.latexPath": "/usr/local/bin/pdflatex" }
   ```
3. Restart VS Code

### Issue: Preview Shows "Error Loading PDF"

**Solution:**
1. Check LaTeX compilation error (shown in preview panel)
2. Ensure your `.tex` file has valid LaTeX syntax
3. Test compilation manually: `pdflatex yourfile.tex`
4. Check that all required LaTeX packages are installed

### Issue: Peer Session Not Connecting

**Causes & Solutions:**
1. **Port blocked:** Check firewall settings for port 3000
   - Change port: `"texmex.peerServerPort": 3001`
2. **Wrong session ID:** Verify ID is copied exactly
3. **Different versions:** Ensure both users have v0.0.5+
4. **Network issues:** Restart VS Code on both machines

### Issue: Preview Updates Lag

**Solution:** Adjust update delay:
```json
{ "texmex.updateDelay": 2000 }
```

Increase if your LaTeX compilation is slow, decrease for faster feedback.

### Issue: Extension Takes Long to Activate

**Note:** First activation loads the WebSocket server (5-10 seconds is normal)

**Solution:** Once loaded, it's instant for subsequent uses.

## 📊 System Requirements Summary

| Component | Requirement |
|-----------|------------|
| **VS Code** | 1.85.0 or higher |
| **LaTeX** | TeX Live, MiKTeX, or MacTeX |
| **Node.js** | ❌ Not required (bundled in extension) |
| **Internet** | ❌ Not required (works offline) |
| **Disk Space** | ~25 MB for extension |

## 🎓 Learning Resources

- **LaTeX Introduction:** [Learn LaTeX](https://www.learnlatex.org/)
- **TexMex Docs:** See [README.md](README.md)
- **Quick Start:** See [QUICK_START.md](QUICK_START.md)

## 🐛 Reporting Issues

Found a bug or have a feature request?

1. Check [GitHub Issues](https://github.com/RahulChalla/texmex/issues)
2. Create a new issue with:
   - TexMex version (v0.0.5)
   - VS Code version
   - Steps to reproduce
   - Error messages

## 📝 Common Tasks

### Change Default Compiler

```json
{
  "texmex.latexPath": "lualatex"
}
```

### Make Preview Updates Faster

```json
{
  "texmex.updateDelay": 500
}
```

### Disable Peer Collaboration

```json
{
  "texmex.enablePeerWork": false
}
```

### Use Different Port for Peer Server

```json
{
  "texmex.peerServerPort": 3001
}
```

## ✅ Verification Checklist

- [ ] VS Code 1.85.0+ installed
- [ ] LaTeX distribution installed
- [ ] TexMex extension installed via VSIX
- [ ] `.tex` file opens successfully
- [ ] Preview opens with "TexMex: Open Live Preview"
- [ ] PDF renders after save
- [ ] (Optional) Peer session connects

---

**Need Help?** See [README.md](README.md) or report an issue on GitHub!
