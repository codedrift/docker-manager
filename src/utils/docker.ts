import Axios from "axios";
import { logger } from "./logger";
import { sleep } from "./sleep";

export const waitForReadiness = async (
  containerName: string,
  readyRoute?: string,
  maxReadyTime: number = 10000
) => {
  const readyTimeStart = Date.now();
  const timeout = readyTimeStart + Math.min(maxReadyTime, 60000);

  if (readyRoute) {
    logger.info(`Checking readyness for ${maxReadyTime}ms`);
    while (Date.now() < timeout) {
      
      try {
        const host =
          process.env.CONNECT_HOST === "docker" ? containerName : "localhost";
        const redyCheckUrl = `http://${host}${readyRoute}`;
        logger.debug(
          `Checking container readiness ${Date.now() - readyTimeStart} url=${redyCheckUrl}`
        );
        const healthResult = await Axios.get(redyCheckUrl);
        
        if (healthResult.status === 200) {
          logger.info("Container is healthy");
          break;
        }

      } catch (error) {
        logger.debug("Error checking container readiness", error);
      }
      sleep(10);
    }
    if (!(Date.now() < timeout)) {
      logger.warn("Container was not ready in time");
    }
  }

  const readyTime = Date.now() - readyTimeStart;
  return readyTime;
};
