/**
 * Manages the bundled Tectonic LaTeX engine: resolving the right binary for
 * the current platform, downloading it on first use, verifying it, and
 * exposing stable paths for the compiled binary and its package cache.
 */

import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as cp from 'child_process';

const TECTONIC_VERSION = '0.17.0';
const RELEASE_TAG = `tectonic@${TECTONIC_VERSION}`;

interface EngineAsset {
    /** Release asset file name */
    asset: string;
    /** Expected SHA256 of the downloaded archive */
    sha256: string;
    /** File name of the extracted binary inside the archive */
    binaryName: string;
    /** 'zip' extracted via PowerShell, 'tar.gz' via system tar */
    archiveType: 'zip' | 'tar.gz';
}

const ASSETS: Record<string, EngineAsset> = {
    'win32-x64': {
        asset: 'tectonic-0.17.0-x86_64-pc-windows-msvc.zip',
        sha256: 'f61ce51f0b0ade1015b7de7ef368541c5424e9756ecbd0d7af97d6d48030845f',
        binaryName: 'tectonic.exe',
        archiveType: 'zip'
    },
    'darwin-x64': {
        asset: 'tectonic-0.17.0-x86_64-apple-darwin.tar.gz',
        sha256: '7c90ef5b6ddb1eb1937e4337add5237b79338e4b9676459fa91187d24d6cdf80',
        binaryName: 'tectonic',
        archiveType: 'tar.gz'
    },
    'darwin-arm64': {
        asset: 'tectonic-0.17.0-aarch64-apple-darwin.tar.gz',
        sha256: 'a3f1cac7c5678f01661a92212f58480ae3b0634115d880dbc59e2953ded45667',
        binaryName: 'tectonic',
        archiveType: 'tar.gz'
    },
    'linux-x64': {
        asset: 'tectonic-0.17.0-x86_64-unknown-linux-musl.tar.gz',
        sha256: '8533d07f9ccbd7a65824b9e0459041bca34af1eb33daba48f59215593753a3b7',
        binaryName: 'tectonic',
        archiveType: 'tar.gz'
    },
    'linux-arm64': {
        asset: 'tectonic-0.17.0-aarch64-unknown-linux-musl.tar.gz',
        sha256: 'b10954a95404f3ab2328d2fa59a5ebab8e657f893fab096f98be8db7c0c979b8',
        binaryName: 'tectonic',
        archiveType: 'tar.gz'
    }
};

export class UnsupportedPlatformError extends Error {
    constructor(platformKey: string) {
        super(
            `TexMex's bundled LaTeX engine doesn't have a build for ${platformKey}. ` +
            `Enable "texmex.useSystemLatex" and point "texmex.systemLatexPath" at your own LaTeX installation instead.`
        );
    }
}

function getPlatformKey(): string {
    return `${process.platform}-${process.arch}`;
}

function getAsset(): EngineAsset {
    const key = getPlatformKey();
    const asset = ASSETS[key];
    if (!asset) {
        throw new UnsupportedPlatformError(key);
    }
    return asset;
}

function getEngineRoot(context: vscode.ExtensionContext): string {
    return path.join(context.globalStorageUri.fsPath, 'engine', TECTONIC_VERSION);
}

function getBinaryPath(context: vscode.ExtensionContext): string {
    const asset = getAsset();
    return path.join(getEngineRoot(context), asset.binaryName);
}

export function getPackageCacheDir(context: vscode.ExtensionContext): string {
    const dir = path.join(context.globalStorageUri.fsPath, 'package-cache');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

function sha256File(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

function downloadWithProgress(
    url: string,
    destPath: string,
    onProgress: (receivedBytes: number, totalBytes: number) => void,
    token: vscode.CancellationToken
): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        let cancelled = false;

        const cleanupAndReject = (error: Error) => {
            file.close();
            fs.unlink(destPath, () => undefined);
            reject(error);
        };

        const request = (requestUrl: string, redirects: number) => {
            if (redirects > 5) {
                cleanupAndReject(new Error('Too many redirects while downloading LaTeX engine'));
                return;
            }

            https.get(requestUrl, { headers: { 'User-Agent': 'TexMex-VSCode-Extension' } }, (res) => {
                if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
                    res.resume();
                    request(res.headers.location, redirects + 1);
                    return;
                }

                if (res.statusCode !== 200) {
                    cleanupAndReject(new Error(`Download failed with HTTP ${res.statusCode}`));
                    return;
                }

                const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
                let receivedBytes = 0;

                res.on('data', (chunk) => {
                    if (cancelled) return;
                    receivedBytes += chunk.length;
                    onProgress(receivedBytes, totalBytes);
                });

                res.pipe(file);

                file.on('finish', () => {
                    file.close();
                    if (!cancelled) resolve();
                });

                res.on('error', cleanupAndReject);
            }).on('error', cleanupAndReject);
        };

        token.onCancellationRequested(() => {
            cancelled = true;
            cleanupAndReject(new Error('Download cancelled'));
        });

        request(url, 0);
    });
}

function execFile(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        cp.execFile(command, args, { maxBuffer: 1024 * 1024 * 32 }, (error, _stdout, stderr) => {
            if (error) {
                reject(new Error(`${error.message}\n${stderr}`));
            } else {
                resolve();
            }
        });
    });
}

async function extractArchive(archivePath: string, destDir: string, archiveType: 'zip' | 'tar.gz'): Promise<void> {
    if (archiveType === 'zip') {
        await execFile('powershell.exe', [
            '-NoProfile',
            '-NonInteractive',
            '-Command',
            `Expand-Archive -LiteralPath "${archivePath}" -DestinationPath "${destDir}" -Force`
        ]);
    } else {
        await execFile('tar', ['-xzf', archivePath, '-C', destDir]);
    }
}

/**
 * Ensures the bundled Tectonic binary is present and usable, downloading and
 * extracting it on first use. Returns the absolute path to the binary.
 */
export async function ensureEngine(context: vscode.ExtensionContext): Promise<string> {
    const binaryPath = getBinaryPath(context);
    if (fs.existsSync(binaryPath)) {
        return binaryPath;
    }

    const asset = getAsset();
    const engineRoot = getEngineRoot(context);
    fs.mkdirSync(engineRoot, { recursive: true });

    const archivePath = path.join(engineRoot, asset.asset);
    const downloadUrl = `https://github.com/tectonic-typesetting/tectonic/releases/download/${RELEASE_TAG}/${asset.asset}`;

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'TexMex: setting up LaTeX engine (one-time download)',
            cancellable: true
        },
        async (progress, token) => {
            let lastReportedPercent = 0;
            progress.report({ message: 'Starting download…' });

            await downloadWithProgress(downloadUrl, archivePath, (received, total) => {
                if (total <= 0) return;
                const percent = Math.floor((received / total) * 100);
                if (percent > lastReportedPercent) {
                    progress.report({ increment: percent - lastReportedPercent, message: `Downloading… ${percent}%` });
                    lastReportedPercent = percent;
                }
            }, token);

            if (token.isCancellationRequested) {
                throw new Error('LaTeX engine download cancelled');
            }

            progress.report({ message: 'Verifying download…' });
            const actualHash = await sha256File(archivePath);
            if (actualHash !== asset.sha256) {
                fs.unlinkSync(archivePath);
                throw new Error(
                    `Downloaded LaTeX engine failed integrity verification (checksum mismatch). ` +
                    `Please try again, or run "TexMex: Reinstall LaTeX Engine".`
                );
            }

            progress.report({ message: 'Extracting…' });
            await extractArchive(archivePath, engineRoot, asset.archiveType);
            fs.unlinkSync(archivePath);

            if (process.platform !== 'win32') {
                fs.chmodSync(binaryPath, 0o755);
            }
        }
    );

    if (!fs.existsSync(binaryPath)) {
        throw new Error('LaTeX engine extraction did not produce the expected binary.');
    }

    return binaryPath;
}

/** Removes the cached engine binary so the next ensureEngine() call re-downloads it. */
export async function reinstallEngine(context: vscode.ExtensionContext): Promise<string> {
    const engineRoot = getEngineRoot(context);
    if (fs.existsSync(engineRoot)) {
        fs.rmSync(engineRoot, { recursive: true, force: true });
    }
    return ensureEngine(context);
}

export function isEngineReady(context: vscode.ExtensionContext): boolean {
    try {
        return fs.existsSync(getBinaryPath(context));
    } catch {
        return false;
    }
}
