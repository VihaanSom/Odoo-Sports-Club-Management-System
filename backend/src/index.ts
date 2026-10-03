import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { initWebSocket } from './ws';
import { prisma } from './config/prisma';

const app = createApp();
const server = http.createServer(app);

// Initialize WebSocket server on the same HTTP port
initWebSocket(server);

server.listen(env.PORT, () => {
  console.log('==================================================');
  console.log(`🚀 Champions Club API Server started successfully!`);
  console.log(`🌐 HTTP Server:  http://localhost:${env.PORT}`);
  console.log(`🔌 WebSocket:    ws://localhost:${env.PORT}/ws`);
  console.log(`🩺 Health check: http://localhost:${env.PORT}/health`);
  console.log(`🌿 Environment:  ${env.NODE_ENV}`);
  console.log('==================================================');
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);

  server.close(async () => {
    console.log('🔒 Closed HTTP and WebSocket connections.');
    try {
      await prisma.$disconnect();
      console.log('📦 Disconnected Prisma client from database.');
    } catch (err) {
      console.error('Error during Prisma disconnect:', err);
    }
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('⚠️ Forcing process exit after 10s timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
