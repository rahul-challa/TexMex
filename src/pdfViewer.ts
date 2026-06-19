/**
 * Embedded PDF Viewer
 * Renders PDFs without external dependencies
 * Uses a simplified viewer compatible with the extension
 */

export function getEmbeddedPdfViewerHtml(pdfBase64: string, isDarkTheme: boolean = false): string {
    const backgroundColor = isDarkTheme ? '#1e1e1e' : '#ffffff';
    const textColor = isDarkTheme ? '#d4d4d4' : '#000000';
    const controlBackground = isDarkTheme ? '#2d2d30' : '#f3f3f3';

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background-color: ${backgroundColor};
            color: ${textColor};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            overflow: hidden;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .toolbar {
            background-color: ${controlBackground};
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
            height: 44px;
        }

        button {
            padding: 6px 12px;
            background-color: var(--vscode-button-background, #0e639c);
            color: var(--vscode-button-foreground, #ffffff);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            transition: background-color 0.2s;
        }

        button:hover {
            background-color: var(--vscode-button-hoverBackground, #1177bb);
        }

        button:active {
            opacity: 0.8;
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .page-info {
            margin-left: auto;
            font-size: 12px;
            opacity: 0.7;
        }

        #pdf-container {
            flex: 1;
            overflow: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            gap: 20px;
        }

        .pdf-page {
            background-color: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 12px;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(200, 200, 200, 0.3);
            border-top: 2px solid var(--vscode-button-background, #0e639c);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .error {
            padding: 20px;
            background-color: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.3);
            border-radius: 4px;
            color: #f48771;
        }

        .error h3 {
            margin-bottom: 10px;
        }

        .error pre {
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-word;
            max-height: 200px;
            overflow: auto;
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <button id="prev-page" title="Previous page">← Prev</button>
        <button id="next-page" title="Next page">Next →</button>
        <input type="number" id="page-number" min="1" style="width: 50px; padding: 4px; border: 1px solid rgba(0,0,0,0.2); border-radius: 3px; background: ${controlBackground}; color: ${textColor};">
        <span class="page-info"><span id="current-page">0</span> / <span id="total-pages">0</span></span>
        <button id="download-button" title="Download PDF">⬇ Download</button>
        <button id="zoom-in" title="Zoom in">🔍+</button>
        <button id="zoom-out" title="Zoom out">🔍−</button>
    </div>
    <div id="pdf-container">
        <div class="loading">
            <div class="spinner"></div>
            <span>Loading PDF...</span>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // Base64 PDF data
        const pdfBase64 = '${pdfBase64}';
        const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

        let currentPage = 1;
        let totalPages = 0;
        let zoomLevel = 1.5;
        const container = document.getElementById('pdf-container');

        // Simple PDF parser for basic rendering
        function parsePdfAndRender() {
            try {
                // Create a blob from the PDF data
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                // Since we can't use pdf.js from CDN, we'll use an iframe approach
                // This is a fallback that works without external dependencies
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.src = url;

                container.innerHTML = '';
                container.appendChild(iframe);

                // Note: For better rendering, pdf.js should be bundled
                // This fallback uses the browser's native PDF viewer

            } catch (error) {
                showError('Error loading PDF: ' + error.message);
            }
        }

        function showError(message) {
            container.innerHTML = '<div class="error"><h3>Error</h3><pre>' +
                message.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre></div>';
        }

        function updatePageDisplay() {
            document.getElementById('current-page').textContent = currentPage;
            document.getElementById('total-pages').textContent = totalPages || '?';
            document.getElementById('page-number').value = currentPage;
        }

        // Event listeners
        document.getElementById('download-button').addEventListener('click', () => {
            vscode.postMessage({ command: 'downloadPDF' });
        });

        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updatePageDisplay();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (totalPages === 0 || currentPage < totalPages) {
                currentPage++;
                updatePageDisplay();
            }
        });

        document.getElementById('page-number').addEventListener('change', (e) => {
            const page = parseInt(e.target.value, 10);
            if (page >= 1 && (totalPages === 0 || page <= totalPages)) {
                currentPage = page;
                updatePageDisplay();
            }
        });

        document.getElementById('zoom-in').addEventListener('click', () => {
            zoomLevel *= 1.2;
            // Update iframe zoom if supported
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.style.transform = 'scale(' + zoomLevel + ')';
                iframe.style.transformOrigin = 'top center';
            }
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            zoomLevel /= 1.2;
            // Update iframe zoom if supported
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.style.transform = 'scale(' + zoomLevel + ')';
                iframe.style.transformOrigin = 'top center';
            }
        });

        // Load PDF
        try {
            parsePdfAndRender();
            // Try to get page count (this is tricky without pdf.js)
            totalPages = 0; // Unknown without proper parsing
            updatePageDisplay();
        } catch (error) {
            showError('Failed to initialize PDF viewer: ' + error.message);
        }
    </script>
</body>
</html>`;
}

export function getErrorHtml(error: Error, isDarkTheme: boolean = false): string {
    const backgroundColor = isDarkTheme ? '#1e1e1e' : '#ffffff';
    const textColor = isDarkTheme ? '#d4d4d4' : '#000000';

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 20px;
            background-color: ${backgroundColor};
            color: ${textColor};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        .error-container {
            background-color: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.3);
            border-radius: 4px;
            padding: 16px;
            color: #f48771;
        }
        h2 {
            margin-bottom: 12px;
            color: #f48771;
        }
        pre {
            background-color: rgba(0, 0, 0, 0.1);
            padding: 12px;
            border-radius: 4px;
            overflow: auto;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-word;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h2>Error Compiling LaTeX</h2>
        <pre>${error.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
</body>
</html>`;
}
