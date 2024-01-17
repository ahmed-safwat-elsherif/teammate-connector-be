import express from 'express';
import { login, refreshUserTokens, register, updatePassword, updateUser } from '../controllers/user.js';

const router = express.Router();

router.post('/register', register);

router.patch('/user', updateUser);

router.patch('/password', updatePassword);

router.post('/login', login);

router.post('/token/refresh', refreshUserTokens);

export default router;
