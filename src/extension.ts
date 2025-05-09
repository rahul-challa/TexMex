import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import { PDFDocumentProxy } from 'pdfjs-dist';

let previewPanel: vscode.WebviewPanel | undefined;
let updateTimeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Register the command to open preview
    let disposable = vscode.commands.registerCommand('texmex.openPreview', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        if (previewPanel) {
            previewPanel.reveal(vscode.ViewColumn.Two);
        } else {
            previewPanel = vscode.window.createWebviewPanel(
                'texmexPreview',
                'LaTeX Preview',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            previewPanel.onDidDispose(() => {
                previewPanel = undefined;
            });
        }

        updatePreview(editor.document);
    });

    // Watch for document changes
    let changeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
        if (previewPanel && event.document === vscode.window.activeTextEditor?.document) {
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }
            updateTimeout = setTimeout(() => {
                updatePreview(event.document);
            }, vscode.workspace.getConfiguration('texmex').get('updateDelay', 1000));
        }
    });

    context.subscriptions.push(disposable, changeDisposable);
}

async function updatePreview(document: vscode.TextDocument) {
    if (!previewPanel) return;

    const content = document.getText();
    const tempDir = path.join(vscode.workspace.rootPath || '', '.texmex-temp');
    const tempFile = path.join(tempDir, 'temp.tex');
    const outputFile = path.join(tempDir, 'temp.pdf');

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write content to temp file
    fs.writeFileSync(tempFile, content);

    try {
        // Compile LaTeX
        const latexPath = vscode.workspace.getConfiguration('texmex').get('latexPath', 'pdflatex');
        await new Promise<void>((resolve, reject) => {
            cp.exec(`${latexPath} -interaction=nonstopmode -output-directory="${tempDir}" "${tempFile}"`, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        // Convert PDF to base64
        const pdfBuffer = fs.readFileSync(outputFile);
        const base64Pdf = pdfBuffer.toString('base64');

        // Update webview
        previewPanel.webview.html = getPreviewHtml(base64Pdf);
    } catch (error) {
        previewPanel.webview.html = getErrorHtml(error as Error);
    }
}

function getPreviewHtml(pdfBase64: string): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
            body {
                margin: 0;
                padding: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            #pdf-container {
                width: 100%;
                height: calc(100vh - 80px);
                overflow: auto;
            }
            #download-button {
                position: fixed;
                top: 10px;
                right: 10px;
                padding: 8px 16px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            #download-button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
        </style>
    </head>
    <body>
        <button id="download-button">Download PDF</button>
        <div id="pdf-container"></div>
        <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const pdfData = atob('${pdfBase64}');
            const loadingTask = pdfjsLib.getDocument({data: pdfData});
            
            // Add download functionality
            document.getElementById('download-button').addEventListener('click', function() {
                const blob = new Blob([pdfData], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'document.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
            
            loadingTask.promise.then(function(pdf) {
                const container = document.getElementById('pdf-container');
                
                for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    pdf.getPage(pageNum).then(function(page) {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        const viewport = page.getViewport({scale: 1.5});
                        
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        
                        page.render(renderContext);
                        container.appendChild(canvas);
                    });
                }
            });
        </script>
    </body>
    </html>`;
}

function getErrorHtml(error: Error): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                margin: 20px;
                color: var(--vscode-errorForeground);
            }
        </style>
    </head>
    <body>
        <h2>Error compiling LaTeX</h2>
        <pre>${error.message}</pre>
    </body>
    </html>`;
}

export function deactivate() {
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }
} 