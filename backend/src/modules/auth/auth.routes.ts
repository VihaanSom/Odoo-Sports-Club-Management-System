import { Router } from 'express';
import { authController } from './auth.controller';
import { validateBody } from '../../middlewares/validate.middleware';
import { loginSchema } from './auth.schema';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// AU-01: Unified login
router.post('/login', validateBody(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

// AU-02: Token refresh
router.post('/refresh', (req, res, next) =>
  authController.refresh(req, res, next)
);

// AU-03: Logout (requires active access token)
router.post('/logout', authenticate, (req, res, next) =>
  authController.logout(req, res, next)
);

// AU-04: Current user profile
router.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req, res, next)
);

export default router;
