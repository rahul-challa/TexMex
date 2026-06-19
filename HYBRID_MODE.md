# TexMex Hybrid Mode: Local + Online LaTeX Compilation

## Overview

TexMex now supports **hybrid compilation** — automatically using local LaTeX if installed, or seamlessly falling back to online compilation if not. Users get the best of both worlds:

- ✅ **Local LaTeX** → Fastest, offline, maximum privacy
- ✅ **Online LaTeX** → No installation needed, works everywhere
- ✅ **Automatic** → User doesn't need to choose, it just works

## How It Works

### 1. Local Compilation (Default)

When a user opens a `.tex` file and saves changes:

```
User saves .tex file
         ↓
TexMex checks for LaTeX compiler
         ↓
✓ LaTeX found? → Compile locally
         ↓
Display PDF in preview
```

**Benefits:**
- ⚡ Fastest (no network latency)
- 🔒 Complete privacy (no file uploads)
- 📡 Works completely offline
- ♾️ No rate limits

### 2. Online Fallback

If local LaTeX is not found:

```
User saves .tex file
         ↓
TexMex checks for LaTeX compiler
         ↓
✗ LaTeX not found? → Try online compilation
         ↓
Send .tex to pdflatex.online API
         ↓
Receive compiled PDF
         ↓
Display PDF in preview
```

**Online Service:** [pdflatex.online](https://pdflatex.online)
- Free service
- No account required
- Fast compilation
- Reliable uptime

**Benefits:**
- 🚀 No installation needed
- 🌍 Works for all users
- ⚙️ Automatic fallback
- 💻 Cross-platform

## Configuration

### For Users

In VS Code settings (`.vscode/settings.json` or global):

```json
{
  "texmex.enableOnlineFallback": true,      // Enable online fallback
  "texmex.latexPath": "pdflatex",           // Local compiler path
  "texmex.updateDelay": 1000                // Preview update delay
}
```

**Options:**

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `texmex.enableOnlineFallback` | bool | `true` | Use online service if local not found |
| `texmex.latexPath` | string | `pdflatex` | Path to local LaTeX compiler |

### Disable Online Fallback

To require local LaTeX only (strict mode):

```json
{ "texmex.enableOnlineFallback": false }
```

This forces users to install LaTeX locally, disabling online fallback.

## User Experience

### First Run (No Local LaTeX)

When a user without LaTeX opens the extension:

1. TexMex checks for LaTeX installation
2. If not found, shows a notification:
   ```
   📡 Using online LaTeX compilation
   (no local distro detected)
   
   Privacy: Your .tex file is sent to 
   pdflatex.online for compilation.
   
   [OK] [Disable Online Fallback]
   ```

3. User can:
   - Click **OK** → Continue with online
   - Click **Disable** → Require local LaTeX
   - Or install LaTeX locally for better performance

### Subsequent Runs

- If LaTeX is installed → Uses local (silently, no notification)
- If not installed → Uses online (notification shown once per session if mode changes)

## Privacy & Security

### Local Mode
- ✅ **No data leaves your machine**
- ✅ Complete privacy
- ✅ Works offline

### Online Mode
- 📤 Your `.tex` file is sent to pdflatex.online
- ✅ Connection is HTTPS encrypted
- ⏱️ File is deleted after compilation (no storage)
- 📊 [pdflatex.online](https://pdflatex.online) privacy policy applies

**User Choice:**
- Users see notification about online compilation
- Can disable with one click
- Can install LaTeX locally for privacy

## Compilation Modes

### Mode: Local

```
Latency: ~100-500ms (depends on document size)
Privacy: 100% (no upload)
Requirements: LaTeX distro installed
Internet: Not required
```

### Mode: Online

```
Latency: ~1-3s (network + processing)
Privacy: File sent to pdflatex.online
Requirements: Internet connection
Internet: Required
Rate Limits: ~5-10 requests/minute (free tier)
```

## Implementation Details

### Files Modified

**Core Logic:**
- `src/latexCompiler.ts` (NEW) - Hybrid compilation engine
- `src/extension.ts` - Updated to use hybrid compiler

**Configuration:**
- `package.json` - New setting: `texmex.enableOnlineFallback`

### Compilation Flow

```typescript
// Pseudo-code
async function compileLatex(latexPath, tempDir, tempFile, texContent) {
  // 1. Check if local LaTeX installed
  if (isLatexInstalled(latexPath)) {
    result = compileLocal(latexPath, tempDir, tempFile);
    if (result.success) return result;
  }

  // 2. Fall back to online if enabled
  if (enableOnlineFallback) {
    result = compileOnline(texContent, tempDir);
    return result;
  }

  // 3. No compilation method available
  return error("LaTeX not found and online fallback disabled");
}
```

## API: pdflatex.online

The online compilation uses pdflatex.online's free API:

```
POST https://pdflatex.online/api/v1/create
Content-Type: application/json

{
  "compiler": "pdflatex",
  "resources": [
    {
      "main": true,
      "filename": "main.tex",
      "content": "..."
    }
  ]
}

Response:
{
  "status": "success",
  "pdf": "<base64-encoded-pdf>"
}
```

**Limits:**
- No authentication required
- ~5-10 requests/minute (free)
- PDF size: Up to 10MB
- Compile time: 30 seconds timeout

## Troubleshooting

### "Online compilation failed"

**Causes:**
1. No internet connection
2. pdflatex.online is down
3. LaTeX syntax error in document
4. Document too large (>10MB)
5. Rate limit exceeded

**Solutions:**
1. Check internet connection
2. Install LaTeX locally for offline work
3. Check `.tex` file syntax
4. Simplify document or split into smaller files
5. Wait a moment before retrying

### "LaTeX not found and online fallback disabled"

**Solution:**
1. Install LaTeX locally, OR
2. Enable online fallback in settings:
   ```json
   { "texmex.enableOnlineFallback": true }
   ```

### Slow compilation with online

**Why:**
- Network latency (~1-3 seconds)
- pdflatex.online processing time

**Solution:**
- Install LaTeX locally for instant compilation
- Or use a simpler document to reduce compilation time

## Best Practices

### For Users

**Best Performance:**
1. Install LaTeX locally
2. Keep `enableOnlineFallback` enabled as safety net
3. TexMex uses local by default if available

**Privacy First:**
1. Disable `enableOnlineFallback` if concerned
2. Install LaTeX locally
3. Only send sensitive .tex files to online if necessary

**Offline Work:**
1. Install LaTeX locally
2. Set `enableOnlineFallback: false`
3. Work completely offline

### For Document Developers

**Hybrid-Friendly LaTeX:**
- Keep documents simple when possible
- Avoid large graphics in online mode
- Test with both local and online
- Provide fallback text for complex packages

## Examples

### Scenario 1: User with LaTeX Installed

```
1. Opens TexMex
2. Opens document.tex
3. Saves changes
4. TexMex detects LaTeX → Compiles locally
5. PDF preview updates in ~200ms
6. Works completely offline
```

### Scenario 2: User without LaTeX

```
1. Opens TexMex
2. Opens document.tex
3. Saves changes
4. TexMex doesn't find LaTeX → Tries online
5. Sends .tex to pdflatex.online
6. Receives compiled PDF
7. PDF preview updates in ~2s
8. Notification: "Using online compilation"
```

### Scenario 3: Switching Modes

```
1. User starts with online mode (no LaTeX)
2. Later installs LaTeX locally
3. Next save: TexMex detects LaTeX
4. Switches to local compilation automatically
5. Performance improves to ~200ms
6. Offline capability enabled
```

## Future Enhancements

Possible improvements:

1. **Caching** - Cache compiled PDFs to avoid re-uploads
2. **Progress** - Show compilation progress indicator
3. **Alternative Services** - Support multiple online providers
4. **Overleaf Integration** - Use Overleaf's API for advanced users
5. **Sync** - Keep local and online sync'd for peer collaboration

## Summary

TexMex's hybrid mode provides:

| Feature | Local | Online |
|---------|-------|--------|
| **Speed** | ⚡⚡⚡ | ⚡⚡ |
| **Privacy** | 🔒🔒🔒 | 🔒 |
| **Offline** | ✅ | ❌ |
| **No Setup** | ❌ | ✅ |
| **Reliability** | ✅ | ✅ |

**Result:** Best experience for all users! 🎉
