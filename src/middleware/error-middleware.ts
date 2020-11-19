import { ErrorRequestHandler } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  if (error.status) {
    res.status(error.status).send(error.message);
    return;
  }
  res.status(500).send(error.message);
};
