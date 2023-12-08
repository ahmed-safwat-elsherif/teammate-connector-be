import bcrypt from "bcrypt";
import { saltRounds } from "../config/index.js";
import User from "../models/user.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const register = async (req, res) => {
  const { username, password, firstname, lastname } = req.body;
  const isUserExists = await User.findOne({
    where: {
      username,
    },
  });
  if (isUserExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }
  try {
    const salt = await bcrypt.genSalt(+saltRounds);
    const hashedPass = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: hashedPass,
      firstname,
      lastname,
    });

    res.json({
      message: "User is created",
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(400).json({ message: "Couldn't be able to create the user" });
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({
    where: {
      username,
    },
  });
  if (!user) {
    res
      .status(401)
      .json({ message: "User doesn't exist or password is wrong" });
    return;
  }
  const isPassCorrect = await bcrypt.compare(password, user.password);
  if (!isPassCorrect) {
    res
      .status(401)
      .json({ message: "User doesn't exist or password is wrong" });
    return;
  }
  const { password: pass, ...rest } = user.toJSON();

  const idToken = generateAccessToken(rest);
  const refreshToken = generateRefreshToken(rest);

  res.json({ message: "Authorization succeeded", idToken, refreshToken });
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const refreshUserTokens = (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  const result = verifyRefreshToken(refreshToken);

  if (!result.success) {
    return res.status(403).json({ error: "Refresh token expired!" });
  }

  const { exp, iat, ...user } = result.data;
  const newAccessToken = generateAccessToken(user);
  res.json({ idToken: newAccessToken });
};
