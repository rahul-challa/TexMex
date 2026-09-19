/**
 * LaTeX Compiler
 *
 * Compiles documents using the bundled Tectonic engine by default (no local
 * LaTeX distribution required — Tectonic downloads and caches only the
 * packages a document actually needs). Users who already have their own
 * LaTeX distribution installed can opt into using it instead via the
 * `texmex.useSystemLatex` setting.
 */

import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ensureEngine, getPackageCacheDir } from './engineManager';

export interface CompilationResult {
    success: boolean;
    pdfPath?: string;
    error?: Error;
    message: string;
}

export const outputChannel = vscode.window.createOutputChannel('TexMex');

interface ProcessResult {
    code: number;
    stdout: string;
    stderr: string;
}

function runProcess(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv): Promise<ProcessResult> {
    return new Promise((resolve) => {
        let stdout = '';
        let stderr = '';

        const proc = cp.spawn(command, args, { cwd, env });

        proc.stdout?.on('data', (chunk) => { stdout += chunk.toString(); });
        proc.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });

        proc.on('error', (error) => {
            resolve({ code: -1, stdout, stderr: `${stderr}\n${error.message}` });
        });

        proc.on('close', (code) => {
            resolve({ code: code ?? -1, stdout, stderr });
        });
    });
}

/**
 * Compiles using the bundled Tectonic engine, downloading it on first use.
 */
async function compileWithTectonic(
    context: vscode.ExtensionContext,
    texFilePath: string,
    outDir: string
): Promise<CompilationResult> {
    let binaryPath: string;
    try {
        binaryPath = await ensureEngine(context);
    } catch (error) {
        return {
            success: false,
            error: error as Error,
            message: `Couldn't set up the bundled LaTeX engine: ${(error as Error).message}`
        };
    }

    const cacheDir = getPackageCacheDir(context);
    const baseName = path.basename(texFilePath, '.tex');
    const pdfPath = path.join(outDir, `${baseName}.pdf`);

    outputChannel.appendLine(`\n--- Compiling ${path.basename(texFilePath)} (${new Date().toLocaleTimeString()}) ---`);

    const result = await runProcess(
        binaryPath,
        [texFilePath, '--outdir', outDir, '--keep-logs', '--synctex'],
        path.dirname(texFilePath),
        { ...process.env, TECTONIC_CACHE_DIR: cacheDir }
    );

    if (result.stdout) outputChannel.append(result.stdout);
    if (result.stderr) outputChannel.append(result.stderr);

    if (result.code === 0 && fs.existsSync(pdfPath)) {
        return { success: true, pdfPath, message: 'Compiled successfully' };
    }

    return {
        success: false,
        error: new Error(result.stderr || result.stdout || 'Tectonic compilation failed'),
        message: 'LaTeX compilation failed. See the "TexMex" output channel for details.'
    };
}

/**
 * Compiles using a system-installed LaTeX distribution (advanced opt-out
 * for users who already have TeX Live/MiKTeX and prefer it).
 */
async function compileWithSystemLatex(
    latexPath: string,
    texFilePath: string,
    outDir: string
): Promise<CompilationResult> {
    const baseName = path.basename(texFilePath, '.tex');
    const pdfPath = path.join(outDir, `${baseName}.pdf`);

    outputChannel.appendLine(`\n--- Compiling ${path.basename(texFilePath)} with system LaTeX (${new Date().toLocaleTimeString()}) ---`);

    const result = await runProcess(
        latexPath,
        ['-interaction=nonstopmode', `-output-directory=${outDir}`, texFilePath],
        path.dirname(texFilePath),
        process.env
    );

    if (result.stdout) outputChannel.append(result.stdout);
    if (result.stderr) outputChannel.append(result.stderr);

    if (result.code === 0 && fs.existsSync(pdfPath)) {
        return { success: true, pdfPath, message: 'Compiled successfully (system LaTeX)' };
    }

    return {
        success: false,
        error: new Error(result.stderr || result.stdout || 'LaTeX compilation failed'),
        message: `LaTeX compilation failed using "${latexPath}". See the "TexMex" output channel for details.`
    };
}

/**
 * Compiles a LaTeX document into a PDF in outDir. Uses the bundled Tectonic
 * engine by default, or a system LaTeX install if the user opted into that
 * via texmex.useSystemLatex.
 */
export async function compileLatex(
    context: vscode.ExtensionContext,
    texFilePath: string,
    outDir: string
): Promise<CompilationResult> {
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const config = vscode.workspace.getConfiguration('texmex');
    const useSystemLatex = config.get<boolean>('useSystemLatex', false);

    if (useSystemLatex) {
        const systemLatexPath = config.get<string>('systemLatexPath', 'pdflatex');
        return compileWithSystemLatex(systemLatexPath, texFilePath, outDir);
    }

    return compileWithTectonic(context, texFilePath, outDir);
}
