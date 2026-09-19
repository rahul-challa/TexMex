/**
 * TexMex - LaTeX Live Preview Extension for VS Code
 *
 * This extension provides live preview functionality for LaTeX documents,
 * similar to Overleaf, but integrated directly into VS Code.
 *
 * Features:
 * - Live LaTeX preview with automatic updates
 * - Peer collaboration via WebSocket
 * - PDF download functionality
 * - No external runtime dependencies
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import { PeerCollaborationServer, PeerClient } from './peerServer';
import { getEmbeddedPdfViewerHtml, getErrorHtml } from './pdfViewer';
import { compileLatex, outputChannel } from './latexCompiler';
import { reinstallEngine } from './engineManager';

// Global state
let previewPanel: vscode.WebviewPanel | undefined;
let updateTimeout: NodeJS.Timeout | undefined;
let peerServer: PeerCollaborationServer | undefined;
let peerClient: PeerClient | undefined;
let serverPort: number = 0;
let extensionContext: vscode.ExtensionContext;

/**
 * Returns a stable per-workspace scratch directory under the OS temp folder,
 * so TexMex doesn't leave a `.texmex-temp` folder inside the user's project.
 */
function getTempDir(): string {
    const root = vscode.workspace.rootPath || 'no-workspace';
    const hash = crypto.createHash('md5').update(root).digest('hex').slice(0, 10);
    const dir = path.join(os.tmpdir(), 'texmex', hash);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

/**
 * Activates the extension and registers all commands and event handlers.
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
    extensionContext = context;

    // Initialize peer server if collaboration is enabled
    const config = vscode.workspace.getConfiguration('texmex');
    const enablePeerWork = config.get<boolean>('enablePeerWork', true);

    if (enablePeerWork) {
        initializePeerServer(context);
    }

    // Show welcome page on install or update
    const currentVersion = vscode.extensions.getExtension('RahulChalla.texmex')?.packageJSON.version;
    const previousVersion = context.globalState.get<string>('texmexVersion');
    if (currentVersion !== previousVersion) {
        const welcomePath = vscode.Uri.file(path.join(context.extensionPath, 'WELCOME.md'));
        vscode.commands.executeCommand('markdown.showPreview', welcomePath);
        context.globalState.update('texmexVersion', currentVersion);
    }

    // Register commands
    const openPreviewCmd = vscode.commands.registerCommand('texmex.openPreview', () => {
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

    const joinPeerCmd = vscode.commands.registerCommand('texmex.joinPeerSession', async () => {
        if (!enablePeerWork) {
            vscode.window.showErrorMessage('Peer work is not enabled. Enable it in settings.');
            return;
        }

        const sessionId = await vscode.window.showInputBox({
            prompt: 'Enter peer session ID',
            placeHolder: 'Session ID from your peer'
        });

        if (sessionId) {
            connectToPeerSession(sessionId);
        }
    });

    const createPeerSessionCmd = vscode.commands.registerCommand('texmex.createPeerSession', () => {
        if (!peerServer) {
            vscode.window.showErrorMessage('Peer server not initialized');
            return;
        }

        const sessionId = generateSessionId();
        vscode.window.showInformationMessage(
            `Peer Session Created: ${sessionId}`,
            'Copy'
        ).then(action => {
            if (action === 'Copy') {
                vscode.env.clipboard.writeText(sessionId);
                vscode.window.showInformationMessage('Session ID copied to clipboard!');
            }
        });
    });

    const redownloadEngineCmd = vscode.commands.registerCommand('texmex.redownloadEngine', async () => {
        try {
            await vscode.window.withProgress(
                { location: vscode.ProgressLocation.Notification, title: 'TexMex: Reinstalling LaTeX engine…' },
                () => reinstallEngine(context)
            );
            vscode.window.showInformationMessage('TexMex: LaTeX engine reinstalled successfully.');
        } catch (error) {
            vscode.window.showErrorMessage(`TexMex: Failed to reinstall LaTeX engine: ${(error as Error).message}`);
        }
    });

    const showOutputLogCmd = vscode.commands.registerCommand('texmex.showOutputLog', () => {
        outputChannel.show();
    });

    // Watch for document changes
    const changeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
        if (previewPanel && event.document === vscode.window.activeTextEditor?.document) {
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }
            updateTimeout = setTimeout(() => {
                updatePreview(event.document);
            }, config.get('updateDelay', 1000));
        }

        // Broadcast changes to peers
        if (peerClient && event.document === vscode.window.activeTextEditor?.document) {
            peerClient.send({
                type: 'change',
                content: event.document.getText()
            });
        }
    });

    context.subscriptions.push(
        openPreviewCmd,
        joinPeerCmd,
        createPeerSessionCmd,
        redownloadEngineCmd,
        showOutputLogCmd,
        changeDisposable,
        outputChannel
    );
}

async function initializePeerServer(context: vscode.ExtensionContext) {
    try {
        peerServer = new PeerCollaborationServer();
        serverPort = await peerServer.start();
        console.log(`TexMex peer server started on port ${serverPort}`);
    } catch (error) {
        console.error('Failed to start peer server:', error);
    }
}

async function connectToPeerSession(sessionId: string) {
    try {
        if (!peerClient) {
            peerClient = new PeerClient();
        }

        const wsUrl = `ws://127.0.0.1:${serverPort}`;
        await peerClient.connect(wsUrl, sessionId, () => {
            vscode.window.showInformationMessage('Connected to peer session!');
        });

        // Handle peer messages
        peerClient.on('change', (message) => {
            if (message.content && previewPanel) {
                // Update preview with peer's changes
                const tempDir = getTempDir();
                const tempFile = path.join(tempDir, 'peer-sync.tex');
                fs.writeFileSync(tempFile, message.content);
                updatePreviewWithFile(tempFile);
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to connect to peer session: ${error}`);
    }
}

function generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
            retainContextWhenHidden: true,
            enableCommandUris: true
        }
    );

    previewPanel.iconPath = vscode.Uri.file(
        path.join(context.extensionPath, 'assets', 'logo.png')
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
        const pdfPath = path.join(getTempDir(), 'temp.pdf');
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
    const tempDir = getTempDir();
    const tempFile = path.join(tempDir, 'temp.tex');

    // Write content to temp file
    fs.writeFileSync(tempFile, content);

    try {
        const result = await compileLatex(extensionContext, tempFile, tempDir);

        if (result.success && result.pdfPath) {
            const base64Pdf = await convertPdfToBase64(result.pdfPath);
            const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
            previewPanel.webview.html = getEmbeddedPdfViewerHtml(base64Pdf, isDarkTheme);
        } else {
            const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
            const error = new Error(result.message);
            previewPanel.webview.html = getErrorHtml(error, isDarkTheme);
        }
    } catch (error) {
        const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
        previewPanel.webview.html = getErrorHtml(error as Error, isDarkTheme);
    }
}

/**
 * Updates preview from a specific file (used for peer sync).
 * @param filePath Path to the LaTeX file to compile
 */
async function updatePreviewWithFile(filePath: string) {
    if (!previewPanel) return;

    const tempDir = path.dirname(filePath);

    try {
        const result = await compileLatex(extensionContext, filePath, tempDir);

        if (result.success && result.pdfPath) {
            const base64Pdf = await convertPdfToBase64(result.pdfPath);
            const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
            previewPanel.webview.html = getEmbeddedPdfViewerHtml(base64Pdf, isDarkTheme);
        } else {
            const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
            const error = new Error(result.message);
            previewPanel.webview.html = getErrorHtml(error, isDarkTheme);
        }
    } catch (error) {
        const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
        previewPanel.webview.html = getErrorHtml(error as Error, isDarkTheme);
    }
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
 * Deactivates the extension and cleans up resources.
 */
export async function deactivate() {
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }

    if (peerClient) {
        peerClient.disconnect();
    }

    if (peerServer) {
        await peerServer.stop();
    }
} 