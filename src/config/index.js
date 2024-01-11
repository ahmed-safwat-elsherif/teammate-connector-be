export const serverPort = process.env.PORT;

export const saltRounds = process.env.SALT_ROUNDS;
export const jwtKey = process.env.JWT_SECRET_KEY;
export const jwtRefreshKey = process.env.JWT_SECRET_REFRESH_KEY;
export const jwtExpiration = 2 * 60; // 2min
export const jwtRefreshExpiration = 1 * 60 * 60; // 1h
export const teammateAuthToken = process.env.TM_AUTH_TOKEN;
export const tmBaseUrl = process.env.TM_BASEURL;
// TM Database settings
export const dbTMPort = process.env.DB_TM_PORT;
export const dbTMOrigin = process.env.DB_TM_ORIGIN;
export const dbTMUser = process.env.DB_TM_USER;
export const dbTMPass = process.env.DB_TM_PASS;

// OSX Database settings
export const dbOSXPort = process.env.DB_OSX_PORT;
export const dbOSXOrigin = process.env.DB_OSX_ORIGIN;
export const dbOSXUser = process.env.DB_OSX_USER;
export const dbOSXPass = process.env.DB_OSX_PASS;
