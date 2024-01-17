import express from 'express';
import { login, refreshUserTokens, register, updatePassword, updateUser } from '../controllers/user.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();


// User Actions
router.post('/register', register);

router.patch('/user',authenticate, updateUser);

router.patch('/password',authenticate, updatePassword);

router.post('/login', login);

router.post('/token/refresh', refreshUserTokens);

// Admin actions

router.get("/users",authenticate, )

export default router;
