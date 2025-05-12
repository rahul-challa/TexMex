/**
 * TexMex - LaTeX Live Preview Extension for VS Code
 * 
 * This extension provides live preview functionality for LaTeX documents,
 * similar to Overleaf, but integrated directly into VS Code.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';

// Global state
let previewPanel: vscode.WebviewPanel | undefined;
let updateTimeout: NodeJS.Timeout | undefined;

/**
 * Activates the extension and registers all commands and event handlers.
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
    // Show welcome page on install or update
    const currentVersion = vscode.extensions.getExtension('RahulChalla.texmex')?.packageJSON.version;
    const previousVersion = context.globalState.get<string>('texmexVersion');
    if (currentVersion !== previousVersion) {
        const welcomePath = vscode.Uri.file(path.join(context.extensionPath, 'WELCOME.md'));
        vscode.commands.executeCommand('markdown.showPreview', welcomePath);
        context.globalState.update('texmexVersion', currentVersion);
    }

    // Register the command to open preview
    const disposable = vscode.commands.registerCommand('texmex.openPreview', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        if (previewPanel) {
            previewPanel.reveal(vscode.ViewColumn.Two);
        } else {
            createPreviewPanel(context);
        }

        updatePreview(editor.document);
    });

    // Watch for document changes
    const changeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
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

/**
 * Creates a new preview panel with message handling.
 * @param context The extension context
 */
function createPreviewPanel(context: vscode.ExtensionContext) {
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

    // Handle messages from the webview
    previewPanel.webview.onDidReceiveMessage(
        async message => {
            if (message.command === 'downloadPDF') {
                await handlePdfDownload();
            }
        },
        undefined,
        context.subscriptions
    );
}

/**
 * Handles the PDF download process.
 * Shows a save dialog and copies the PDF to the selected location.
 */
async function handlePdfDownload() {
    try {
        const pdfPath = path.join(vscode.workspace.rootPath || '', '.texmex-temp', 'temp.pdf');
        if (!fs.existsSync(pdfPath)) {
            vscode.window.showErrorMessage('PDF file not found');
            return;
        }

        const savePath = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(path.join(vscode.workspace.rootPath || '', 'document.pdf')),
            filters: {
                'PDF files': ['pdf']
            }
        });
        
        if (savePath) {
            fs.copyFileSync(pdfPath, savePath.fsPath);
            vscode.window.showInformationMessage(`PDF saved to ${savePath.fsPath}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to save PDF: ${error}`);
    }
}

/**
 * Updates the preview panel with the latest compiled PDF.
 * @param document The current LaTeX document
 */
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
        await compileLatex(tempDir, tempFile);
        const base64Pdf = await convertPdfToBase64(outputFile);
        previewPanel.webview.html = getPreviewHtml(base64Pdf);
    } catch (error) {
        previewPanel.webview.html = getErrorHtml(error as Error);
    }
}

/**
 * Compiles the LaTeX document using the configured compiler.
 * @param tempDir Directory for temporary files
 * @param tempFile Path to the temporary .tex file
 */
async function compileLatex(tempDir: string, tempFile: string): Promise<void> {
    const latexPath = vscode.workspace.getConfiguration('texmex').get('latexPath', 'pdflatex');
    return new Promise<void>((resolve, reject) => {
        cp.exec(`${latexPath} -interaction=nonstopmode -output-directory="${tempDir}" "${tempFile}"`, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Converts a PDF file to base64 string.
 * @param pdfPath Path to the PDF file
 * @returns Base64 encoded string of the PDF
 */
async function convertPdfToBase64(pdfPath: string): Promise<string> {
    const pdfBuffer = fs.readFileSync(pdfPath);
    return pdfBuffer.toString('base64');
}

/**
 * Generates the HTML content for the preview panel.
 * @param pdfBase64 Base64 encoded PDF data
 * @returns HTML string for the preview panel
 */
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
            const vscode = acquireVsCodeApi();
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            const pdfData = atob('${pdfBase64}');
            const loadingTask = pdfjsLib.getDocument({data: pdfData});
            
            // Add download functionality
            document.getElementById('download-button').addEventListener('click', function() {
                vscode.postMessage({
                    command: 'downloadPDF'
                });
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
            }).catch(function(error) {
                console.error('Error loading PDF:', error);
                container.innerHTML = '<p>Error loading PDF preview</p>';
            });
        </script>
    </body>
    </html>`;
}

/**
 * Generates HTML content for error display.
 * @param error The error to display
 * @returns HTML string for error display
 */
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

/**
 * Deactivates the extension and cleans up resources.
 */
export function deactivate() {
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }
} 