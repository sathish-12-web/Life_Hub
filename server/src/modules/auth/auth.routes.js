import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.schema.js';
import { register, login, logout, refresh, getMe, updateProfile } from './auth.controller.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile);

export default router;
