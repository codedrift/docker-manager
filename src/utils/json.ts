import { logger } from "./logger";

export const parseJsonValue = <T>(data: string) => {
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error(`Could not parse JSON data: ${error.message}`);
    return null;
  }
};

export const stringifyValue = <T>(data: T): string | null => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    logger.error(`Could not stringify JSON data: ${error.message}`);
    return null;
  }
};
