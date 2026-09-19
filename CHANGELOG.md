# Changelog

## [0.0.9] - 2026-09-18
### Fixed
- Preview panel rendering blank - the old viewer relied on a `blob:` iframe and VS Code webviews don't expose a native PDF plugin to render it. Replaced with a bundled `pdf.js`, rendering pages to a canvas
- Download button icon read as a downvote arrow rather than a download affordance; swapped for the standard arrow-into-tray glyph

### Added
- Editor-title preview button (shows automatically on any `.tex` file, keyed off the file extension - no dependency on another extension registering a "latex" language)
- `texmex.openPreview` now falls back to any visible `.tex` editor instead of requiring literal focus, so it still works if the terminal or another panel has focus
- Settings (gear) button in the preview toolbar, opening VS Code's Settings UI filtered to TexMex - no more hand-editing `settings.json` for basic options

### Changed
- Preview toolbar redesigned to match conventional PDF reader/browser UX: grouped icon buttons, a page-jump box between chevrons, and a browser-style zoom control (`- 100% +`, click the percentage to reset)
- Shortened the marketplace description and README hero section to a scannable length

## [0.0.8] - 2026-09-18
### Added
- **Bundled Tectonic LaTeX engine** - no local LaTeX distribution required
- Automatic per-platform engine download on first compile (Windows/macOS/Linux, x64/arm64), verified against a pinned SHA256 checksum and cached in global storage
- On-demand LaTeX package fetching via Tectonic (only the packages a document needs, cached after first use)
- "TexMex" output channel with full compiler logs
- `texmex.redownloadEngine` ("TexMex: Reinstall LaTeX Engine") command for recovering from an interrupted/corrupted download
- `texmex.showOutputLog` ("TexMex: Show Compiler Log") command
- `texmex.useSystemLatex` / `texmex.systemLatexPath` settings as an advanced opt-out for users who prefer their own LaTeX install

### Removed
- Online compilation fallback (`pdflatex.online`) - previously sent document content to a third-party service by default; compilation is now always local
- `texmex.latexPath` and `texmex.enableOnlineFallback` settings (superseded by `texmex.useSystemLatex`/`texmex.systemLatexPath`)

### Changed
- Compilation temp/output files now live under the OS temp directory instead of a `.texmex-temp` folder inside the workspace
- Build now bundles with esbuild instead of plain `tsc`, producing a smaller `.vsix`
- Repository moved out of the project root into `archive/`: old version-pinned publishing guides and release scripts, superseded by `PUBLISHING.md`

### Fixed
- Marketplace page showing a broken logo image - `package.json`'s `repository.url` pointed at the wrong GitHub org/repo casing, which broke the Marketplace's resolution of relative image paths in the README
- A `ws` import pattern that would have silently broken peer collaboration once bundled with esbuild (`WebSocket.Server`/`WebSocket.OPEN` resolved to `undefined` under esbuild's ESM resolution of the `ws` package)

## [0.0.7] - 2025-06-19
### Added
- 🎯 **Hybrid LaTeX Compilation Mode** - Local + Online with automatic fallback
- Support for users without LaTeX distribution installed
- Online compilation via pdflatex.online (free, no account required)
- Automatic detection of local LaTeX installation
- Fallback to online when local LaTeX not available
- Configuration option to control online fallback behavior

### Changed
- Improved compiler detection and error handling
- Better user notifications for compilation mode
- Enhanced LaTeX detection at extension startup

### Benefits
- **Zero installation barriers** - Users without LaTeX can still use the extension
- **Privacy-first** - Uses local compilation when available
- **Graceful degradation** - Seamlessly falls back to online when needed
- **Best of both worlds** - Fast local compilation for power users, easy online for everyone else

### New Features
- `texmex.enableOnlineFallback` setting (default: true)
- Automatic LaTeX installation check on startup
- Online compilation engine with pdflatex.online integration

## [0.0.6] - 2025-06-19
### Added
- 🤝 **WebSocket-based peer collaboration** for real-time document synchronization
- **Create and join peer sessions** with shareable session IDs
- **Embedded PDF viewer** with no external CDN dependencies
- **Offline-first support** - works completely without internet
- **Dark and light theme support** for the preview panel
- Improved PDF viewer toolbar with navigation, zoom, and download controls
- Comprehensive documentation (QUICK_START.md, SETUP_GUIDE.md, SETUP_GUIDE.md)
- Build scripts for Windows (build.bat) and Unix/Mac (build.sh)
- Publishing guides for developers

### Changed
- Removed external pdf.js CDN dependency
- Enhanced error handling with better messages
- Improved UI/UX with professional toolbar and controls
- Better TypeScript support with proper type definitions

### Fixed
- All TypeScript compilation errors resolved
- PDF rendering now works without external services
- Improved error messages for LaTeX compilation failures

## [0.0.5] - 2025-05-12
### Fixed
- PDF download button now works reliably using VS Code's native API.

### Changed
- Cleaned up and documented the codebase.
- Improved README with badges, logo, and screenshot.
- Added a changelog for better release tracking.

## [0.0.4] - 2025-05-11
### Added
- Initial public release.
- Live LaTeX preview in a side panel.
- PDF download button in the preview panel.
- Customizable LaTeX compiler path and update delay. 