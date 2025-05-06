# TexMex - LaTeX Live Preview for VS Code

TexMex is a VS Code extension that provides live preview functionality for LaTeX documents, similar to Overleaf but running locally in VS Code.

## Features

- Live preview of LaTeX documents
- Automatic recompilation on save
- PDF preview with zoom and scroll support
- Error reporting in the preview panel
- Configurable update delay
- Support for custom LaTeX compiler paths

## Requirements

- VS Code 1.85.0 or higher
- A LaTeX distribution installed on your system (e.g., TeX Live, MiKTeX)
- Node.js and npm for development

## Installation

1. Install the extension from the VS Code marketplace
2. Make sure you have a LaTeX distribution installed on your system
3. Configure the path to your LaTeX compiler in VS Code settings if needed

## Usage

1. Open a `.tex` file in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
3. Type "TexMex: Open Live Preview" and press Enter
4. The preview will open in a new panel to the right of your editor
5. Any changes you make to the LaTeX file will automatically update the preview

## Configuration

You can configure the following settings in VS Code:

- `texmex.latexPath`: Path to your LaTeX compiler (default: "pdflatex")
- `texmex.updateDelay`: Delay in milliseconds before updating the preview after changes (default: 1000)

## Development

1. Clone the repository
2. Run `npm install` to install dependencies
3. Press F5 to start debugging
4. Make changes to the code in `src/extension.ts`
5. The extension will automatically recompile and reload

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 