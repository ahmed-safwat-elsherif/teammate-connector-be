import bcrypt from 'bcryptjs';
import { saltRounds } from '../config/index.js';
import User from '../models/user.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";
import userRoles from "../utils/userRoles.js";

/**
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
    res.status(400).json({ message: 'User already exists' });
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
    res.status(401).json({ message: "User doesn't exist or password is wrong" });
    return;
  }
  const isPassCorrect = await bcrypt.compare(password, user.password);
  if (!isPassCorrect) {
    res.status(401).json({ message: "User doesn't exist or password is wrong" });
    return;
  }
  const { password: pass, ...rest } = user.toJSON();

  const idToken = generateAccessToken(rest);
  const refreshToken = generateRefreshToken(rest);

  res.json({ message: 'Authorization succeeded', idToken, refreshToken });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const refreshUserTokens = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  
  if (!refreshToken) {
    return res.sendStatus(401);
  }

  const result = verifyRefreshToken(refreshToken);

  if (!result.success) {
    return res.status(403).json({ error: 'Refresh token expired!' });
  }

  const user = await User.findOne({ where:{username:result.data.username}});
  
  if (!user) {
    res
      .status(401)
    return;
  } 

  const {password:pass, ...rest} = user.toJSON();
  const newAccessToken = generateAccessToken(rest);
  const newRefreshToken= generateRefreshToken(rest);

  res.json({ idToken: newAccessToken,refreshToken:newRefreshToken });
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
    const updates = {
      firstname:firstname ?? rest.firstname, 
      lastname:lastname ?? rest.lastname,
      email:email ?? rest.email,
    }
    await User.update(updates, {
      where:{username}
    });
    console.log({...rest,...updates});
    const idToken = generateAccessToken({...rest,...updates});
    
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

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const getUserById = async (req,res)=>{
  try {
    const {id } = req.params;
    const user = await User.findOne({
      where: {
        id
      },
    });
    const {password:pass} = user.toJSON()
    console.log(users)
   
    res.json({ message: "Data retreived!", users });
  } catch (error) {
    res.status(400).json({message:"Couldn't retrieve the list of users"})
  }
}

/**
 *
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 * @returns
 */
export const getUsers = async (_,res)=>{
  try {
    const allUsers = await User.findAll({
      where: {
        role:userRoles.USER,
      },
    });
    const users = allUsers.map(user=>user.toJSON())
    console.log(users)
   
    res.json({ message: "Data retreived!", users });
  } catch (error) {
    res.status(400).json({message:"Couldn't retrieve the list of users"})
  }
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const updateUserById = async (req,res)=>{
  try {
    const {id} = req.params;
    const {firstname, lastname, email, username} = req.body;

    const user = User.findOne({where:{id}});
    if(!user) {
      res.status(404).json({message:"User is not found!"}) 
      return 
    }
    if(username && username.trim().length < 6) {
      res.status(400).json({message:"Username length should be minimum 6 characters!"}) 
      return 
    }
    const {password:pass, ...rest} = user.toJSON(); 

    const updates = {
      firstname:firstname ?? rest.firstname, 
      lastname:lastname?? rest.lastname,
      email:email ?? rest.email,
      username:username?? rest.username
    }

    await User.update(updates, {where:{id}});

    res.status(200).json({message:"User updated successfully!"})
  } catch (error) {
    res.status(400).json({message:`Failed to update user of id = ${id}`})
  }
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const deleteUserById = async (req,res)=>{
  try {
    const {id} = req.params;

    const user = User.findOne({where:{id, role:userRoles.USER}});

    if(!user) {
      res.status(404).json({message:`Couldn't find a normal user with id = ${id}`}) 
      return 
    }

    await User.destroy({where:{id}});

    res.status(200).json({message:"User removed successfully!"})
  } catch (error) {
    res.status(400).json({message:`Failed to delete user of id = ${id}`})
  }
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const updateUserRoleById = async (req,res)=>{
  try {
    const {id} = req.params;
    const {role} = req.body;

    const user = User.findOne({where:{id,role:userRoles.USER}});

    if(!user) {
      res.status(404).json({message:`Couldn't find a normal user with id = ${id}`}) 
      return 
    }

    const isRole = userRoles[role];

    if(!isRole) {
      res.status(400).json({message:`Role ${role} is not a valid role`}) 
      return 
    }
    
    await User.update({role}, {where:{id}});

    res.status(200).json({message:`User granted a new role (${role}) successfully!`})
  } catch (error) {
    res.status(400).json({message:`Failed to update user of id = ${id}`})
  }
}