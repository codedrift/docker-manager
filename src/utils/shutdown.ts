import http from "http";
import { logger } from "./logger";

export function createShutdownHandler(
  httpServer: http.Server,
  socketIoServer: SocketIO.Server
) {
  return async () => {
    logger.info("Received kill signal, shutting down gracefully");

    setTimeout(() => {
      logger.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);

    httpServer.close(() => {
      logger.info("Closed http server");
      socketIoServer.close(() => {
        logger.info("Closed socketio server");
        process.exit(0);
      });
    });
  };
}
