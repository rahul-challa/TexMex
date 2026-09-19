/**
 * Embedded PDF Viewer
 * Renders PDFs using a locally bundled pdf.js (no external CDN dependencies,
 * no reliance on a native PDF plugin inside the webview sandbox).
 */

import * as crypto from 'crypto';

export interface PdfViewerResources {
    /** webview.asWebviewUri() for out/vendor/pdfjs/pdf.min.mjs */
    pdfJsUri: string;
    /** webview.asWebviewUri() for out/vendor/pdfjs/pdf.worker.min.mjs */
    pdfWorkerUri: string;
    /** webview.cspSource, for the Content-Security-Policy meta tag */
    cspSource: string;
}

export function getEmbeddedPdfViewerHtml(
    pdfBase64: string,
    isDarkTheme: boolean,
    resources: PdfViewerResources
): string {
    const backgroundColor = isDarkTheme ? '#1e1e1e' : '#ffffff';
    const textColor = isDarkTheme ? '#d4d4d4' : '#000000';
    const controlBackground = isDarkTheme ? '#2d2d30' : '#f3f3f3';
    const groupBackground = isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const hoverBackground = isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    const { pdfJsUri, pdfWorkerUri, cspSource } = resources;
    const nonce = crypto.randomBytes(16).toString('base64');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' ${cspSource} 'wasm-unsafe-eval'; style-src ${cspSource} 'unsafe-inline'; img-src ${cspSource} data: blob:; worker-src ${cspSource} blob:; connect-src ${cspSource} blob:; font-src ${cspSource};">
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
            padding: 5px 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
            height: 38px;
        }

        .toolbar-group {
            display: flex;
            align-items: center;
            gap: 1px;
            background-color: ${groupBackground};
            border-radius: 6px;
            padding: 2px;
        }

        .toolbar-spacer {
            flex: 1;
        }

        .icon-btn {
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            color: ${textColor};
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 15px;
            line-height: 1;
            padding: 0;
            transition: background-color 0.15s;
        }

        .icon-btn:hover:not(:disabled) {
            background-color: ${hoverBackground};
        }

        .icon-btn:active:not(:disabled) {
            opacity: 0.7;
        }

        .icon-btn:disabled {
            opacity: 0.35;
            cursor: default;
        }

        .page-input {
            width: 32px;
            text-align: center;
            border: none;
            background: transparent;
            color: ${textColor};
            font-size: 12px;
            padding: 2px 0;
            font-family: inherit;
        }

        .page-input::-webkit-inner-spin-button,
        .page-input::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        .page-total {
            font-size: 12px;
            opacity: 0.7;
            padding-right: 6px;
            white-space: nowrap;
        }

        .zoom-level {
            min-width: 44px;
            font-size: 12px;
            background: transparent;
            border: none;
            color: ${textColor};
            cursor: pointer;
            border-radius: 4px;
            padding: 4px 2px;
            font-family: inherit;
        }

        .zoom-level:hover {
            background-color: ${hoverBackground};
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

        #pdf-canvas {
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
        <div class="toolbar-group">
            <button id="prev-page" class="icon-btn" title="Previous page">&lsaquo;</button>
            <input type="number" id="page-number" min="1" class="page-input">
            <span class="page-total">/ <span id="total-pages">0</span></span>
            <button id="next-page" class="icon-btn" title="Next page">&rsaquo;</button>
        </div>
        <div class="toolbar-group">
            <button id="zoom-out" class="icon-btn" title="Zoom out">&minus;</button>
            <button id="zoom-level" class="zoom-level" title="Reset zoom to 100%">150%</button>
            <button id="zoom-in" class="icon-btn" title="Zoom in">+</button>
        </div>
        <div class="toolbar-spacer"></div>
        <button id="download-button" class="icon-btn" title="Download PDF">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button id="settings-button" class="icon-btn" title="TexMex Settings">&#9881;</button>
    </div>
    <div id="pdf-container">
        <div class="loading" id="loading-indicator">
            <div class="spinner"></div>
            <span>Loading PDF...</span>
        </div>
    </div>

    <script type="module" nonce="${nonce}">
        import * as pdfjsLib from "${pdfJsUri}";

        pdfjsLib.GlobalWorkerOptions.workerSrc = "${pdfWorkerUri}";

        const vscode = acquireVsCodeApi();
        const container = document.getElementById('pdf-container');
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        const pageInput = document.getElementById('page-number');
        const zoomLevelButton = document.getElementById('zoom-level');

        const pdfBase64 = '${pdfBase64}';
        const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

        let pdfDoc = null;
        let currentPage = 1;
        let zoomLevel = 1.5;
        let renderTask = null;

        function showError(message) {
            container.innerHTML = '<div class="error"><h3>Error</h3><pre>' +
                String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre></div>';
        }

        function updateToolbar() {
            document.getElementById('total-pages').textContent = pdfDoc ? pdfDoc.numPages : '?';
            pageInput.value = currentPage;
            zoomLevelButton.textContent = Math.round(zoomLevel * 100) + '%';
            prevButton.disabled = currentPage <= 1;
            nextButton.disabled = !!(pdfDoc && currentPage >= pdfDoc.numPages);
        }

        async function renderPage(pageNumber) {
            if (!pdfDoc) return;

            if (renderTask) {
                renderTask.cancel();
            }

            const page = await pdfDoc.getPage(pageNumber);
            const viewport = page.getViewport({ scale: zoomLevel });

            let canvas = document.getElementById('pdf-canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = 'pdf-canvas';
                container.innerHTML = '';
                container.appendChild(canvas);
            }

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const canvasContext = canvas.getContext('2d');
            renderTask = page.render({ canvasContext, viewport });

            try {
                await renderTask.promise;
            } catch (error) {
                if (error && error.name === 'RenderingCancelledException') return;
                throw error;
            }

            updateToolbar();
        }

        async function loadPdf() {
            try {
                const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
                pdfDoc = await loadingTask.promise;
                currentPage = 1;
                await renderPage(currentPage);
            } catch (error) {
                showError('Failed to render PDF: ' + (error && error.message ? error.message : error));
            }
        }

        function goToPage(page) {
            if (!pdfDoc || page < 1 || page > pdfDoc.numPages) return;
            currentPage = page;
            renderPage(currentPage);
        }

        function setZoom(newZoom) {
            zoomLevel = Math.max(0.3, Math.min(5, Math.round(newZoom * 100) / 100));
            renderPage(currentPage);
        }

        document.getElementById('download-button').addEventListener('click', () => {
            vscode.postMessage({ command: 'downloadPDF' });
        });

        document.getElementById('settings-button').addEventListener('click', () => {
            vscode.postMessage({ command: 'openSettings' });
        });

        prevButton.addEventListener('click', () => goToPage(currentPage - 1));
        nextButton.addEventListener('click', () => goToPage(currentPage + 1));

        pageInput.addEventListener('change', (e) => {
            goToPage(parseInt(e.target.value, 10));
        });

        document.getElementById('zoom-in').addEventListener('click', () => setZoom(zoomLevel + 0.1));
        document.getElementById('zoom-out').addEventListener('click', () => setZoom(zoomLevel - 0.1));
        zoomLevelButton.addEventListener('click', () => setZoom(1.0));

        loadPdf();
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
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
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
