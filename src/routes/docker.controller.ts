import Docker from "dockerode";
import { RequestHandler } from "express";
import { CreateContainerRequest } from "../model";
import { logger } from "../utils";
import { waitForReadiness } from "../utils/docker";
import { renderHtmlTemplate } from "../utils/template";
import uniqid from "uniqid";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export const getProcessSnapshot: RequestHandler = async (req, res) => {
  const containers = (await docker.listContainers()).map((container) => ({
    id: container.Id,
    name: container.Names.find(Boolean)?.replace("/", ""),
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
    return;
  }

  res.send(containers);
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
    const name = body.name || uniqid();
    const container = await docker.createContainer({
      Image: body.image,
      Env: body.env || [],
      Labels: {
        "net.codedrift.docker-manager": "yes",
      },
      HostConfig: {
        PortBindings,
      },
      name,
      NetworkingConfig: {
        EndpointsConfig: {
          manager_network: {
            // Start new container in manager network to perform health/ready check
            NetworkID: "manager_network",
          },
        },
      },
    });
    console.log(container);
    await container.start();

    const readyTime = await waitForReadiness(
      name,
      body.readyRoute,
      body.readyTimeoutMs,
    );

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
      return;
    }

    res.send(sanitized);
  } catch (error) {
    console.log("Error getting logs", error);
    res.status(500).send(error);
  }
};
