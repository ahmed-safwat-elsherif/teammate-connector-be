import {
  jwtExpiration,
  jwtKey,
  jwtRefreshExpiration,
  jwtRefreshKey,
} from "../config/index.js";

import jwt from "jsonwebtoken";

export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, jwtKey);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export const generateAccessToken = (payload) =>
  jwt.sign(payload, jwtKey, { expiresIn: jwtExpiration });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, jwtRefreshKey, { expiresIn: jwtRefreshExpiration });

// Verify a refresh token
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtRefreshKey);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
