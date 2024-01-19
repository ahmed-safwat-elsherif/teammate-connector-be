import express from 'express';
import { deleteUserById, getUsers, login, refreshUserTokens, register, updatePassword, updateUser, updateUserById, updateUserRoleById,getUserById } from '../controllers/user.js';
import authenticate from '../middlewares/authenticate.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();


// User Actions
router.post('/register', register);

router.patch('/user',authenticate, updateUser);

router.patch('/password',authenticate, updatePassword);

router.post('/login', login);

router.post('/token/refresh', refreshUserTokens);

// Admin actions
router.get("/users",authenticate,isAdmin,getUsers);

router.get("/users/:id", authenticate, isAdmin,getUserById);

router.patch("/users/:id", authenticate, isAdmin,updateUserById);

router.patch("/users/:id/role", authenticate, isAdmin,updateUserRoleById);

router.delete("/users/:id", authenticate, isAdmin,deleteUserById);

export default router;
