import type { Server } from "http";
import { WebSocketServer } from "ws";
import { hocuspocusServer } from "./hocuspocus.server.js";

export function setupWebSocketServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    const url = request.url || "";
    console.log(`[WS] Upgrade request: ${url}`);

    if (url.startsWith("/collaboration")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        console.log(`[WS] ✅ Handshake complete for ${url}`);

        // Create the Hocuspocus client connection — this sets up the document room
        const clientConnection = hocuspocusServer.handleConnection(
          ws as any,
          request as any
        );

        // Wire incoming binary messages from the ws socket to Hocuspocus
        ws.on("message", (data: Buffer | ArrayBuffer | Buffer[]) => {
          try {
            const buf = Buffer.isBuffer(data)
              ? data
              : Buffer.from(data as ArrayBuffer);
            clientConnection.handleMessage(buf);
          } catch (err) {
            console.error("[WS] Error handling message:", err);
          }
        });

        // Wire close event so Hocuspocus cleans up the connection
        ws.on("close", (code: number, reason: Buffer) => {
          clientConnection.handleClose({
            code,
            reason: reason?.toString() ?? "",
          });
        });

        // Log errors
        ws.on("error", (err: Error) => {
          console.error("[WS] WebSocket error:", err.message);
        });
      });
    } else {
      console.log(`[WS] ❌ Rejected unknown upgrade path: ${url}`);
      socket.destroy();
    }
  });

  return wss;
}
