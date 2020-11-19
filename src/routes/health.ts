import { RequestHandler } from "express";

export const handleHealthCheck: RequestHandler = (_, res) => {
  res.send("OK");
};
