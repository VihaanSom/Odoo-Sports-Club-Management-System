import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;

export const initWebSocket = (server: HttpServer): WebSocketServer => {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // ignore malformed messages
      }
    });
  });

  return wss;
};

export const broadcast = (channel: string, data: any): void => {
  if (!wss) return;
  const payload = JSON.stringify({ channel, data, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};
