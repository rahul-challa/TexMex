# TexMex

![TexMex Logo](assets/logo.png)

---

TexMex is a Visual Studio Code extension that provides live LaTeX preview functionality with **peer collaboration support**. Similar to Overleaf, but integrated directly into your editor with real-time synchronization across multiple users.

## Features

- ✨ **Live Preview**: See your LaTeX document rendered in real-time as you type
- 🤝 **Peer Collaboration**: Work with others using WebSocket-based real-time synchronization
- 📥 **PDF Download**: Save your compiled documents as PDF files
- ⚡ **Automatic Updates**: Preview updates automatically when you save or edit
- 🛡️ **Error Handling**: Clear error messages when compilation fails
- ⚙️ **Customizable**: Configure compiler path, update delay, and peer settings
- 📦 **Zero External Dependencies**: Fully bundled and self-contained
- 🎨 **Theme Support**: Respects VS Code dark and light themes

## Requirements

- Visual Studio Code version 1.85.0 or higher
- A LaTeX distribution installed locally (e.g., TeX Live, MiKTeX)
- **No Node.js required** — everything is bundled into the extension

## Installation

### Quick Install (Recommended)

1. Download the latest `.vsix` file from [Releases](https://github.com/RahulChalla/texmex/releases)
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
5. As you edit and save, the preview updates automatically

### Downloading PDF

1. With the preview open, click the **"⬇ Download"** button in the toolbar
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
    "texmex.latexPath": "pdflatex",          // Path to your LaTeX compiler
    "texmex.updateDelay": 1000,              // Delay before preview updates (ms)
    "texmex.enablePeerWork": true,           // Enable peer collaboration (WebSocket)
    "texmex.peerServerPort": 3000            // Port for peer collaboration server
}
```

### Configuration Details

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `texmex.latexPath` | string | `pdflatex` | Path to your LaTeX compiler (e.g., `xelatex`, `lualatex`) |
| `texmex.updateDelay` | number | `1000` | Delay in milliseconds before updating preview after changes |
| `texmex.enablePeerWork` | boolean | `true` | Enable WebSocket peer collaboration features |
| `texmex.peerServerPort` | number | `3000` | Port for the internal peer collaboration server |

## Development

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/RahulChalla/texmex.git
   cd texmex
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

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile TypeScript to JavaScript |
| `npm run watch` | Watch for file changes and recompile |
| `npm run lint` | Run ESLint code quality checks |
| `npm run test` | Run test suite |
| `npm run clean` | Clean build artifacts and temp files |
| `npm run package` | Package as .vsix for installation |
| `npm run install-vsce` | Install VS Code packaging tool globally |

## Architecture

### Core Components

- **Extension** (`extension.ts`): Main VS Code extension entry point
- **Peer Server** (`peerServer.ts`): WebSocket server for real-time collaboration
- **PDF Viewer** (`pdfViewer.ts`): Embedded PDF renderer (no external CDN dependencies)

### No External Dependencies at Runtime

The extension includes everything needed:
- ✅ WebSocket support (bundled `ws` library)
- ✅ PDF rendering (embedded viewer)
- ✅ All node dependencies are bundled into the extension
- ✅ Works offline without internet connection

## Troubleshooting

### Preview Not Showing

1. Make sure LaTeX is installed: `pdflatex --version`
2. Check the `texmex.latexPath` setting matches your installation
3. Look for error messages in the preview panel

### Peer Collaboration Not Working

1. Ensure `texmex.enablePeerWork` is `true` in settings
2. Check that the peer server port (default 3000) is not blocked by firewall
3. Verify both users are running the extension version 0.0.5 or higher
4. Session IDs must match exactly

### LaTeX Compilation Errors

1. The error message will be displayed in the preview panel
2. Check your `.tex` file for syntax errors
3. Ensure all required LaTeX packages are installed in your distribution
4. Try compiling manually: `pdflatex yourfile.tex`

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

- 🐛 Report bugs on [GitHub Issues](https://github.com/RahulChalla/texmex/issues)
- 💡 Request features on [GitHub Issues](https://github.com/RahulChalla/texmex/issues)
- ⭐ Star the repository if you find it useful!

## Links

- **VS Code Marketplace**: [TexMex](https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex)
- **GitHub Repository**: [RahulChalla/texmex](https://github.com/RahulChalla/texmex)
- **Extension Hub**: [Manage Extension](https://marketplace.visualstudio.com/manage/publishers/RahulChalla/extensions/texmex/hub)

---

## Version History

### v0.0.5 (Current)
- ✨ Added peer collaboration with WebSocket support
- 🔧 Removed external CDN dependencies
- 🎨 Improved UI with toolbar and controls
- 📦 Fully self-contained, plug-and-play extension

### v0.0.4
- Initial stable release
