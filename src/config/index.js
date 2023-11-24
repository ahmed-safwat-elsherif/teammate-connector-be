export const serverPort = process.env.PORT;

export const dbPort = process.env.DB_PORT;
export const dbUsername = process.env.DB_USERNAME;
export const dbPass = process.env.DB_PASSWORD;
export const saltRounds = process.env.SALT_ROUNDS;
export const jwtKey = process.env.JWT_SECRET_KEY;
export const jwtRefreshKey = process.env.JWT_SECRET_REFRESH_KEY;
export const jwtExpiration = 60 * 60; // 1h
export const jwtRefreshExpiration = 24 * 60 * 60; // 1d
