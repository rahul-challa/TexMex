# TexMex

![TexMex Logo](https://raw.githubusercontent.com/rahul-challa/TexMex/main/assets/logo.png)

---

Live LaTeX preview for VS Code, with real-time peer collaboration. No LaTeX installation required — TexMex downloads and manages its own compiler.

## Features

- **No setup**: no TeX Live or MiKTeX to install — the compiler downloads itself on first use
- **Live preview**: renders as you type, with a one-click preview button on any `.tex` file
- **Peer collaboration**: real-time multi-user editing over WebSockets
- **PDF export**: one click to save the compiled document
- **Private**: compiles entirely on your machine, nothing is sent anywhere

## Requirements

- VS Code 1.85.0+, and an internet connection the first time you compile (~10-22MB one-time download). No Node.js or LaTeX distribution needed.

## Installation

### Quick Install (Recommended)

1. Download the latest `.vsix` file from [Releases](https://github.com/rahul-challa/TexMex/releases)
2. Open VS Code
3. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS)
4. Click the `...` menu → **Install from VSIX...**
5. Select the `.vsix` file
6. Click **Install**

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS)
3. Search for "TexMex"
4. Click Install

## Usage

### Basic Workflow

1. Open a `.tex` file
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
3. Type "TexMex: Open Live Preview" and press Enter
4. The preview will open in a side panel
5. **First time only**: TexMex downloads its bundled LaTeX engine (~10-22MB) and shows progress in a notification. This happens once and is cached for all future use.
6. As you edit and save, the preview updates automatically. If a document uses a LaTeX package that hasn't been fetched yet, it's downloaded automatically on that compile and cached for next time.

### Downloading PDF

1. With the preview open, click the **Download** button in the toolbar
2. Choose where to save the PDF file
3. The PDF will be saved to your chosen location

### Peer Collaboration

#### Starting a Collaborative Session

1. Run command: **TexMex: Create Peer Session**
2. A session ID will be generated and copied to your clipboard
3. Share this session ID with your collaborators

#### Joining a Collaborative Session

1. Get the session ID from your peer
2. Run command: **TexMex: Join Peer Session**
3. Enter the session ID
4. You'll be connected and changes will sync in real-time

#### How It Works

- **WebSocket Server**: A local peer collaboration server runs automatically when the extension loads
- **Real-time Sync**: All changes are broadcast to connected peers instantly
- **No Setup Required**: Everything runs locally — no external services needed
- **Auto Reconnect**: Seamless reconnection if the connection drops

## Configuration

You can customize TexMex through VS Code settings (`.vscode/settings.json` or global settings):

```json
{
    "texmex.updateDelay": 1000,              // Delay before preview updates (ms)
    "texmex.enablePeerWork": true,           // Enable peer collaboration (WebSocket)
    "texmex.peerServerPort": 3000,           // Port for peer collaboration server
    "texmex.useSystemLatex": false,          // Advanced: use your own LaTeX install instead of the bundled engine
    "texmex.systemLatexPath": "pdflatex"     // Only used when useSystemLatex is true
}
```

### Configuration Details

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `texmex.updateDelay` | number | `1000` | Delay in milliseconds before updating preview after changes |
| `texmex.enablePeerWork` | boolean | `true` | Enable WebSocket peer collaboration features |
| `texmex.peerServerPort` | number | `3000` | Port for the internal peer collaboration server |
| `texmex.useSystemLatex` | boolean | `false` | Advanced: compile with a LaTeX distribution already installed on your system instead of TexMex's bundled engine |
| `texmex.systemLatexPath` | string | `pdflatex` | Path to your system LaTeX compiler (e.g. `xelatex`, `lualatex`). Only used when `texmex.useSystemLatex` is `true` |

## Development

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/rahul-challa/TexMex.git
   cd TexMex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Package the extension:
   ```bash
   npm run install-vsce  # Install vsce globally if needed
   npm run package       # Creates texmex-X.X.X.vsix
   ```

5. Install the local build:
   - Open VS Code
   - Press `Ctrl+Shift+X`
   - Click `...` menu → **Install from VSIX...**
   - Select the generated `.vsix` file

See [PUBLISHING.md](PUBLISHING.md) for how to cut and publish a release.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Type-check and bundle the extension with esbuild |
| `npm run watch` | Watch for file changes and rebuild |
| `npm run lint` | Run ESLint code quality checks |
| `npm run test` | Run test suite |
| `npm run clean` | Clean build artifacts |
| `npm run package` | Package as .vsix for installation |
| `npm run install-vsce` | Install VS Code packaging tool globally |

## Architecture

### Core Components

- **Extension** (`extension.ts`): Main VS Code extension entry point
- **Engine Manager** (`engineManager.ts`): Resolves, downloads, verifies, and caches the bundled Tectonic LaTeX engine per platform
- **LaTeX Compiler** (`latexCompiler.ts`): Runs the bundled engine (or an opted-in system LaTeX install) and reports results
- **Peer Server** (`peerServer.ts`): WebSocket server for real-time collaboration
- **PDF Viewer** (`pdfViewer.ts`): Embedded PDF renderer (no external CDN dependencies)

### Bundled LaTeX Engine

TexMex ships without a LaTeX distribution to keep the `.vsix` small, and instead downloads [Tectonic](https://tectonic-typesetting.github.io/) — a self-contained, single-binary LaTeX engine — the first time you compile:

- The correct binary for your OS/architecture (Windows, macOS Intel/Apple Silicon, Linux x64/arm64) is downloaded from Tectonic's GitHub releases and verified against a pinned SHA256 checksum
- It's cached in VS Code's global storage, so it's downloaded once, not per-workspace or per-update
- Tectonic itself fetches only the individual LaTeX packages a document actually needs (not a full distribution), caching them the same way — so unusual packages "just work" the first time they're used
- Everything runs locally; your document content never leaves your machine
- Prefer your own TeX Live/MiKTeX install? Set `texmex.useSystemLatex` to `true`

### No External npm Dependencies at Runtime

- WebSocket support (bundled `ws` library)
- PDF rendering (embedded viewer)
- Engine download uses Node's built-in `https`/`crypto`; archive extraction uses the OS's native `tar`/`Expand-Archive` — no extra packages needed
- Works fully offline once the engine and any packages your documents need are cached

## Troubleshooting

### Preview Not Showing / Engine Download Fails

1. Make sure you have an internet connection for the one-time engine download (subsequent compiles work offline)
2. Check the "TexMex" output channel (**TexMex: Show Compiler Log**) for the underlying error
3. If a download was interrupted or the binary seems corrupted, run **TexMex: Reinstall LaTeX Engine**

### Peer Collaboration Not Working

1. Ensure `texmex.enablePeerWork` is `true` in settings
2. Check that the peer server port (default 3000) is not blocked by firewall
3. Verify both users are running extension version 0.0.6 or higher
4. Session IDs must match exactly

### LaTeX Compilation Errors

1. Open **TexMex: Show Compiler Log** to see the full engine output
2. Check your `.tex` file for syntax errors (undefined commands, mismatched `\begin`/`\end`, etc.)
3. If you enabled `texmex.useSystemLatex`, make sure `texmex.systemLatexPath` points at a working compiler and that the packages your document needs are installed in your distribution

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Report bugs on [GitHub Issues](https://github.com/rahul-challa/TexMex/issues)
- Request features on [GitHub Issues](https://github.com/rahul-challa/TexMex/issues)
- Star the repository if you find it useful

## Links

- **VS Code Marketplace**: [TexMex](https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex)
- **GitHub Repository**: [rahul-challa/TexMex](https://github.com/rahul-challa/TexMex)
- **Extension Hub**: [Manage Extension](https://marketplace.visualstudio.com/manage/publishers/RahulChalla/extensions/texmex/hub)

---

## Version History

See [CHANGELOG.md](CHANGELOG.md) for full release notes.

### v0.0.9 (Current)
- Fixed the preview panel rendering blank by replacing the old iframe-based viewer with a bundled pdf.js
- Redesigned the preview toolbar (grouped icon buttons, browser-style zoom, page-jump box) and added a settings shortcut
- Added a one-click preview button on the editor title bar for any `.tex` file

### v0.0.8
- Bundled Tectonic LaTeX engine — no local LaTeX distribution required, downloaded and cached automatically on first use
- Removed the online compilation fallback (`pdflatex.online`) that sent document content to a third party
- Added a "TexMex" output channel with full compiler logs, plus **Reinstall LaTeX Engine** and **Show Compiler Log** commands
- Added `texmex.useSystemLatex` / `texmex.systemLatexPath` as an advanced opt-out for users with their own LaTeX install
