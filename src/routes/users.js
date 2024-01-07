import express from 'express';
import { login, refreshUserTokens, register } from '../controllers/user.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/token/refresh', refreshUserTokens);

export default router;
