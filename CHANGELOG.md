# Changelog

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