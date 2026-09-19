/**
 * Peer Collaboration Server using WebSockets
 * Enables multiple VS Code instances to collaborate on LaTeX documents
 */

import { WebSocket, WebSocketServer } from 'ws';
import * as net from 'net';
import * as vscode from 'vscode';

interface PeerMessage {
    type: 'sync' | 'change' | 'cursor' | 'compile' | 'join' | 'leave';
    peerId: string;
    content?: string;
    position?: { line: number; character: number };
    timestamp: number;
    sessionId: string;
}

export class PeerCollaborationServer {
    private wss: WebSocketServer | null = null;
    private peers: Map<string, WebSocket> = new Map();
    private port: number = 0;
    private sessions: Map<string, Set<string>> = new Map();
    private server: net.Server | null = null;

    async start(initialPort: number = 3000): Promise<number> {
        return new Promise((resolve, reject) => {
            const server = net.createServer();
            this.server = server;

            // Find available port
            const tryPort = (port: number) => {
                server.listen(port, '127.0.0.1', () => {
                    this.port = port;
                    server.close();

                    // Now create WebSocket server on this port
                    this.wss = new WebSocketServer({ port });

                    this.wss.on('connection', (ws) => {
                        const peerId = this.generatePeerId();
                        this.peers.set(peerId, ws);

                        ws.on('message', (data) => {
                            try {
                                const message = JSON.parse(data.toString()) as PeerMessage;
                                this.handleMessage(peerId, message);
                            } catch (error) {
                                console.error('Failed to parse peer message:', error);
                            }
                        });

                        ws.on('close', () => {
                            this.peers.delete(peerId);
                            this.broadcastPeerLeft(peerId);
                        });

                        ws.on('error', (error) => {
                            console.error('WebSocket error:', error);
                        });
                    });

                    resolve(port);
                });

                server.on('error', (err: any) => {
                    if (err.code === 'EADDRINUSE') {
                        tryPort(port + 1);
                    } else {
                        reject(err);
                    }
                });
            };

            tryPort(initialPort);
        });
    }

    private handleMessage(peerId: string, message: PeerMessage) {
        message.peerId = peerId;

        switch (message.type) {
            case 'join':
                this.handlePeerJoin(peerId, message);
                break;
            case 'sync':
                this.broadcastToSession(message.sessionId, message);
                break;
            case 'change':
                this.broadcastToSession(message.sessionId, message);
                break;
            case 'cursor':
                this.broadcastToSession(message.sessionId, message);
                break;
            case 'compile':
                this.broadcastToSession(message.sessionId, message);
                break;
        }
    }

    private handlePeerJoin(peerId: string, message: PeerMessage) {
        const sessionId = message.sessionId;
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, new Set());
        }
        this.sessions.get(sessionId)!.add(peerId);

        // Notify others of new peer
        this.broadcastToSession(sessionId, {
            type: 'join',
            peerId,
            timestamp: Date.now(),
            sessionId
        });
    }

    private broadcastToSession(sessionId: string, message: PeerMessage) {
        const sessionPeers = this.sessions.get(sessionId);
        if (!sessionPeers) return;

        const data = JSON.stringify(message);
        for (const peerId of sessionPeers) {
            const ws = this.peers.get(peerId);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        }
    }

    private broadcastPeerLeft(peerId: string) {
        for (const [sessionId, peers] of this.sessions.entries()) {
            if (peers.has(peerId)) {
                peers.delete(peerId);
                this.broadcastToSession(sessionId, {
                    type: 'leave',
                    peerId,
                    timestamp: Date.now(),
                    sessionId
                });
            }
        }
    }

    private generatePeerId(): string {
        return `peer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    getPort(): number {
        return this.port;
    }

    async stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.wss) {
                this.wss.close(() => {
                    this.peers.clear();
                    this.sessions.clear();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    getPeersCount(): number {
        return this.peers.size;
    }

    getSessionPeersCount(sessionId: string): number {
        return this.sessions.get(sessionId)?.size ?? 0;
    }
}

export class PeerClient {
    private ws: WebSocket | null = null;
    private peerId: string = '';
    private sessionId: string = '';
    private messageHandlers: Map<string, (message: PeerMessage) => void> = new Map();

    async connect(url: string, sessionId: string, onConnected?: () => void): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.sessionId = sessionId;
                this.ws = new WebSocket(url);

                this.ws.on('open', () => {
                    // Send join message
                    this.send({
                        type: 'join',
                        peerId: '',
                        timestamp: Date.now(),
                        sessionId
                    });
                    onConnected?.();
                    resolve();
                });

                this.ws.on('message', (data) => {
                    try {
                        const message = JSON.parse(data.toString()) as PeerMessage;
                        const handler = this.messageHandlers.get(message.type);
                        if (handler) {
                            handler(message);
                        }
                    } catch (error) {
                        console.error('Failed to parse message:', error);
                    }
                });

                this.ws.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    send(message: Partial<PeerMessage>) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const fullMessage: PeerMessage = {
                type: message.type || 'sync',
                peerId: this.peerId,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                ...message
            };
            this.ws.send(JSON.stringify(fullMessage));
        }
    }

    on(messageType: string, handler: (message: PeerMessage) => void) {
        this.messageHandlers.set(messageType, handler);
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
