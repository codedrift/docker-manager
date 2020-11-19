import Axios from "axios";
import Docker from "dockerode";
import { RequestHandler } from "express";
import { logger } from "../utils";
import { sleep } from "../utils/sleep";
import { renderHtmlTemplate } from "../utils/template";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export const getProcessSnapshot: RequestHandler = async (req, res) => {
  const containersResult = await docker.listContainers();
  console.log(containersResult);

  const containers = containersResult.map((container) => ({
    id: container.Id,
    name: container.Names.join("/"),
    state: container.State,
    image: container.Image,
    status: container.Status,
    ports: container.Ports,
  }));

  if (req.query.type === "html") {
    const html = renderHtmlTemplate("containers.html", {
      containers: containers.map((c) => ({
        id: c.id,
        text: JSON.stringify(c, null, 2),
      })),
    });

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } else {
    res.send(containers);
  }
};

type CreateContainerRequest = {
  name: string;
  readyRoute?: string;
  readyTimeoutMs?: number;
  image: string;
  ports?: Array<{
    host: number;
    container: number;
    type?: "tcp" | "udp";
  }>;
  env?: string[];
};

export const createContainer: RequestHandler = async (req, res) => {
  const body: CreateContainerRequest = req.body;
  logger.info(`Starting container`, body);
  try {
    const PortBindings: any = {};

    (body.ports || []).forEach(({ host, container, type = "tcp" }) => {
      PortBindings[`${container}/${type}`] = [
        {
          HostPort: String(host),
        },
      ];
    });
    const container = await docker.createContainer({
      Image: body.image,
      Env: body.env || [],
      Labels: {
        "net.codedrift.docker-manager": "yes",
      },
      HostConfig: {
        PortBindings,
      },
      name: body.name,
    });
    await container.start();

    const readyTimeStart = Date.now();
    const maxReadyTime = body.readyTimeoutMs || 10000;
    const timeout = readyTimeStart + maxReadyTime;

    if (body.readyRoute) {
      logger.info(`Checking readyness for ${maxReadyTime}ms`);
      while (Date.now() < timeout) {
        logger.debug(
          `Checking container readiness ${Date.now() - readyTimeStart}`
        );
        try {
          const hostPort = body.ports?.find(Boolean)?.host;
          if (hostPort) {
            const healthResult = await Axios.get(
              `http://localhost:${hostPort}${body.readyRoute}`
            );
            if (healthResult.status === 200) {
              logger.info("Container is healthy");
              break;
            }
          }
        } catch (error) {
          logger.debug("Error checking container readiness", error);
        }
        sleep(10);
      }
      if (!(Date.now() < timeout)) {
        logger.warn("Container was not ready in time");
        throw new Error("Container was not ready in time");
      }
    }

    const readyTime = Date.now() - readyTimeStart;

    res.send({ id: container.id, readyTimeMs: readyTime });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

export const getContainerLogs: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    logger.info(`Get logs for container ${id}`);
    const logs = await docker.getContainer(id).logs({
      stdout: true,
      stderr: true,
      timestamps: true,
    });

    const sanitized = String(logs).replace(
      // eslint-disable-next-line no-control-regex
      /[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g,
      ""
    );

    if (req.query.type === "html") {
      const html = renderHtmlTemplate("logs.html", {
        id,
        logs: sanitized.split("\n").reverse().join("\n"),
      });
      res.send(html);
    } else {
      res.send(sanitized);
    }
  } catch (error) {
    console.log("Error getting logs", error);
    res.status(500).send(error);
  }
};
