import { createServer } from "http";
import app from "./http/app.js";
import { setupWebSocketServer } from "./realtime/websocket.server.js";
import { config } from "./config/env.js";

const httpServer = createServer(app);

setupWebSocketServer(httpServer);

httpServer.listen(config.port, () => {
  console.log(`\n🚀 SyncWrite server running at http://localhost:${config.port}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${config.port}/collaboration\n`);
});

export default app;
