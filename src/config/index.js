export { tmPassword, tmUsername } from "./teammate.js";

export const serverPort = process.env.PORT;

export const dbPort = process.env.DB_PORT;
export const dbUsername = process.env.DB_USERNAME;
export const dbPass = process.env.DB_PASSWORD;
export const saltRounds = process.env.SALT_ROUNDS;
export const jwtKey = process.env.JWT_SECRET_KEY;
export const jwtRefreshKey = process.env.JWT_SECRET_REFRESH_KEY;
export const jwtExpiration = 2 * 60; // 2min
export const jwtRefreshExpiration = 1 * 60 * 60; // 1h
export const teammateAuthToken = process.env.TM_AUTH_TOKEN;

export const oDataBaseUrl =
  "https://grafenesales.teammatehosting.com/TeamMate/odata/v1";

export const tmBaseUrl =
  "https://grafenesales.teammatehosting.com/TeamMate/api/v1/TeamStore";
