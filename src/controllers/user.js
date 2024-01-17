import bcrypt from "bcrypt";
import { saltRounds } from "../config/index.js";
import User from "../models/user.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";
import userRoles from "../utils/userRoles.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const register = async (req, res) => {
  const { username, password, firstname, lastname,email } = req.body;
  const isUserExists = await User.findOne({
    where: {
      username,
    },
  });
  if (isUserExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  if(!email){
    res.status(400).json({message:"Email is not "})
  }
  try {
    const salt = await bcrypt.genSalt(+saltRounds);
    const hashedPass = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      firstname,
      lastname,
      email,
      password: hashedPass,
      role:userRoles.USER
    });

    const {password:pass,...rest} = user.toJSON();

    res.json({
      message: "User is created",
      user: rest,
    });
  } catch (error) {
    res.status(400).json({ message: "Couldn't create the user" });
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

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const updateUser = async (req,res)=>{
  const {  firstname,lastname, email } = req.body;
  const {username} = req.user;
  try {
    const user = await User.findOne({
      where: {
        username,
      },
    });
    if (!user) {
      res
        .status(401)
      return;
    }

    const {password:pass,...rest} = user.toJSON();
    
    await User.update({
      firstname:firstname ?? rest.firstname, 
      lastname:lastname ?? rest.lastname,
      email:email ?? rest.email,
    }, {
      where:{username}
    });
    
    const idToken = generateAccessToken(rest);
  
    res.json({ message: "Authorization succeeded", idToken });
  } catch (error) {
    res.status(400).json({message:"Failed to update user"})
  }
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const updatePassword = async (req,res)=>{
  const { password, newPassword} = req.body;
  const {username} = req.user;
  try {
    const user = await User.findOne({
      where: {
        username,
      },
    });
    if (!user) {
      res
        .status(401)
      return;
    }
    const isPassCorrect = await bcrypt.compare(password, user.password);
    if (!isPassCorrect) {
      res
        .status(401)
      return;
    }

    const { password: pass, ...rest } = user.toJSON();
    
    const salt = await bcrypt.genSalt(+saltRounds);
    const hashedPass = await bcrypt.hash(newPassword, salt);

    await User.update({
      password:hashedPass
    },{
      where:{ username }
    });
    
    const idToken = generateAccessToken(rest);
  
    res.json({ message: "Authorization succeeded", idToken });
  } catch (error) {
    res.status(400).json({message:"Failed to update user"})
  }
}