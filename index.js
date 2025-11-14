import { WebSocketServer } from 'ws';

/* server setup */
const port = 48829;
const host = "0.0.0.0";

const wss = new WebSocketServer({ port, host });

wss.on('connection', (ws) => {
  console.log(`${ws._socket.remoteAddress} == connected`);

  ws.on('message', (message) => {
    const content = message.toString();
    console.log(`${ws._socket.remoteAddress} << ${content}`);

    /// Handle commands
    const echoMatch = content.match(/^echo:(.*)/);
    if (echoMatch) {
      const echoMessage = echoMatch[1];
      ws.send(echoMessage);
      return;
    }

    console.log(`${ws._socket.remoteAddress} >> ${content}`);
  });

  ws.on('close', () => {
    console.log(`${ws._socket.remoteAddress} == disconnected`);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
