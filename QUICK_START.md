# TexMex Quick Start Guide

## ⚡ 30-Second Setup

### Option 1: Install from VSIX (Easiest)

```bash
# Get the latest .vsix file
npm run install-vsce
npm run package

# In VS Code:
# Ctrl+Shift+X → ... menu → Install from VSIX... → Select texmex-X.X.X.vsix
```

### Option 2: Build and Run Locally

```bash
# 1. Clone and setup
git clone https://github.com/RahulChalla/texmex.git
cd texmex
npm install

# 2. Compile
npm run compile

# 3. Package
npm run package

# 4. Install in VS Code
# Ctrl+Shift+X → ... menu → Install from VSIX... → texmex-X.X.X.vsix
```

## 🚀 First Use

1. **Open a `.tex` file** in VS Code
2. **Press** `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. **Type** "TexMex: Open Live Preview" and hit Enter
4. **See your PDF** render automatically as you edit!

## 🤝 Peer Collaboration

### Start Sharing

1. Run: **TexMex: Create Peer Session**
2. Share the session ID with your friend
3. They run: **TexMex: Join Peer Session**
4. They enter your session ID
5. **Done!** Changes sync instantly

## ⚙️ Configuration (Optional)

Add to `.vscode/settings.json`:

```json
{
  "texmex.latexPath": "pdflatex",
  "texmex.updateDelay": 1000,
  "texmex.enablePeerWork": true,
  "texmex.peerServerPort": 3000
}
```

## 🛠️ For Developers

```bash
# Watch for changes and recompile
npm run watch

# Run linter
npm run lint

# Clean build artifacts
npm run clean
```

## ❓ Need Help?

- **LaTeX not found?** Install [TeX Live](https://www.tug.org/texlive/) or [MiKTeX](https://miktex.org/)
- **Preview not updating?** Check `texmex.updateDelay` setting
- **Peer sync failing?** Verify port 3000 isn't blocked
- **Errors?** Check the error panel for LaTeX compilation errors

## 📚 Full Documentation

See [README.md](README.md) for complete documentation.
