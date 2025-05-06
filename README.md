# TexMex - LaTeX Live Preview Extension for Visual Studio Code

TexMex is a Visual Studio Code extension that enables live LaTeX preview and editing within the editor. It brings Overleaf-style functionality to your local environment, allowing users to write, compile, and view LaTeX documents with minimal setup.

**Marketplace:** [https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex](https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex)  
**Extension Management Hub:** [https://marketplace.visualstudio.com/manage/publishers/RahulChalla/extensions/texmex/hub](https://marketplace.visualstudio.com/manage/publishers/RahulChalla/extensions/texmex/hub)

---

## Features

- Live preview of LaTeX documents inside a dedicated panel
- Automatic recompilation and rendering on file save or edit
- Embedded PDF viewer with scroll and zoom functionality
- Error diagnostics shown in the preview panel on failed compilation
- Command to manually compile and save the `.tex` file as a PDF (`TexMex: Save as PDF`)
- Support for custom LaTeX compiler paths (e.g., `pdflatex`, `xelatex`)
- Configurable delay for preview updates to reduce unnecessary recompilation

---

## System Requirements

- Visual Studio Code version 1.85.0 or higher
- A LaTeX distribution installed locally (e.g., TeX Live, MiKTeX)
- Node.js and npm for extension development or local builds

---

## Installation

1. Open Visual Studio Code.
2. Visit the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS).
3. Search for **TexMex** and click Install, or install it directly from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=RahulChalla.texmex).
4. Ensure a LaTeX distribution is installed and available in your system's PATH.

---

## Usage

1. Open a `.tex` file in the editor.
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
3. Run the command **TexMex: Open Live Preview**. This will open a side panel with a rendered PDF view of your document.
4. As you edit and save the `.tex` file, the preview will update automatically.
5. To manually compile and save the PDF to your working directory, run **TexMex: Save as PDF** from the Command Palette.

---

## Configuration Options

TexMex can be customized through the VS Code settings (`.vscode/settings.json` or global settings):

```json
"texmex.latexPath": "pdflatex",
"texmex.updateDelay": 1000
