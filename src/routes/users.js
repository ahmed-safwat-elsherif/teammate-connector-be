import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";
import { login, refreshUserTokens, register } from "../controllers/user.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/token/refresh", refreshUserTokens);

export default router;
