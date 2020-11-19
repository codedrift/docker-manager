import { FilterRequest, logger as winstonLogger } from "express-winston";
import { createLogger, format, transports } from "winston";

const authorizationHeaderFilter = (req: FilterRequest, propName: string) => {
  if (propName === "headers") {
    return Object.keys(req.headers).reduce<any>((filteredHeaders, key) => {
      if (key !== "authorization") {
        filteredHeaders[key] = req.headers[key];
      }
      return filteredHeaders;
    }, {});
  } else {
    return req[propName];
  }
};

const isDevelopment = process.env.NODE_ENV === "development";

const logFormat = isDevelopment
  ? {
      format: format.combine(format.colorize(), format.simple()),
    }
  : {};

const logLevel = isDevelopment ? "debug" : "info";

export const logger = createLogger({
  level: logLevel,
  transports: [new transports.Console(logFormat)],
});

export const expressLogger = winstonLogger({
  winstonInstance: logger,
  requestFilter: authorizationHeaderFilter,
});
