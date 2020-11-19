import http from "http";
import socketIo from "socket.io";
import { logger } from "./utils";

let socketIoServer: socketIo.Server | null = null;

export function initWebsocketHandler(httpServer: http.Server) {
  socketIoServer = socketIo(httpServer);
  socketIoServer.on("connection", (socket) => {
    logger.info(`Websocket connected user=${socket.id}`);
  });

  return socketIoServer;
}

export function emitMessage(room: string, message: any) {
  if (socketIoServer) {
    socketIoServer.to(room).emit("message", JSON.stringify(message));
  }
}
