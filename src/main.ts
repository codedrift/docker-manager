import bodyParser from "body-parser";
import cors from "cors";
import { default as express } from "express";
import http from "http";
import { errorMiddleware } from "./middleware";
import { handleHealthCheck } from "./routes";
import {
  createContainer, getContainerLogs ,
  getProcessSnapshot
} from "./routes/docker.controller";
import { createShutdownHandler, expressLogger, logger } from "./utils";
import { initWebsocketHandler } from "./websocket";

const PORT = process.env.PORT || 8080;

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(expressLogger);

app.use(errorMiddleware);

app.get(["/", "/health"], handleHealthCheck);
app.get("/containers", getProcessSnapshot);
app.post("/containers", createContainer);
app.get("/logs/:id", getContainerLogs);

const httpServer = http.createServer(app);

const socketIoServer = initWebsocketHandler(httpServer);

process.on("SIGTERM", createShutdownHandler(httpServer, socketIoServer));
process.on("SIGINT", createShutdownHandler(httpServer, socketIoServer));

httpServer.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});


