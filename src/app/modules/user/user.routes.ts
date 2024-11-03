import express, { Response, RequestHandler, Request } from 'express'
import { UserController } from './user.controller'
import { validateSession, requireRole } from '../../middleware/auth.middleware'
import { UserRole } from '../shared/enumeration'
import { AuthRequest } from '../../types/express'
import { registerSchema } from './user.schema'
import validateRequest from '../../middleware/validateRequest'
import { z } from 'zod'

const router = express.Router()
const userController = new UserController()

router.post(
  '/register',
  validateRequest(registerSchema),
  userController.register,
)
router.post('/login', userController.login)

// Create separate schemas for reset password flows
const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const resetPasswordConfirmSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
})

router.post(
  '/reset-password-request',
  validateRequest(resetPasswordRequestSchema),
  userController.resetPasswordRequest,
)

router.post(
  '/reset-password',
  validateRequest(resetPasswordConfirmSchema),
  userController.resetPassword,
)

// user profile
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 user_name:
 *                   type: string
 *                 email_verified:
 *                   type: boolean
 *                 is_active:
 *                   type: boolean
 *                 metadata:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
const profileHandler: RequestHandler = (req: Request, res: Response) => {
  const authReq = req as AuthRequest
  res.json({ user: authReq.auth })
}

router.get(
  '/profile',
  validateSession as unknown as RequestHandler,
  requireRole([
    UserRole.ADMIN,
    UserRole.STAFF,
    UserRole.PARENT,
  ]) as unknown as RequestHandler,
  profileHandler,
)

router.post(
  '/logout',
  validateSession as unknown as RequestHandler,
  userController.logout,
)

export const UserRoutes = router
