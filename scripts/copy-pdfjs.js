// Copies the pdf.js runtime files the webview needs into out/vendor/pdfjs,
// since the extension host process never touches pdfjs-dist itself.
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build');
const destDir = path.join(__dirname, '..', 'out', 'vendor', 'pdfjs');

fs.mkdirSync(destDir, { recursive: true });

for (const file of ['pdf.min.mjs', 'pdf.worker.min.mjs']) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}
