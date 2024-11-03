import { Request, Response } from 'express'
import { UserService } from './user.service'
import { registerSchema, loginSchema } from './user.schema'
import catchAsync from '../../utils/catchAsync'
import AppError from '../shared/errors/AppError'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  /**
   * @swagger
   * /users/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               first_name:
   *                 type: string
   *               last_name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [parent, admin, staff]
   *               user_name:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *       409:
   *         description: User already exists
   */
  register = catchAsync(async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body)
    const user = await this.userService.register(validatedData)

    res.status(201).json({
      success: true,
      data: user,
    })
  })

  /**
   * @swagger
   * /users/login:
   *   post:
   *     summary: Login a user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: User logged in successfully
   *       401:
   *         description: Invalid credentials
   */
  login = catchAsync(async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body)
    const { user, token } = await this.userService.login(validatedData)

    res.status(200).json({
      success: true,
      data: { user, token },
    })
  })

  /**
   * @swagger
   * /users/reset-password-request:
   *   post:
   *     summary: Request password reset
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password reset OTP sent to email
   *       404:
   *         description: User not found
   */
  resetPasswordRequest = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body
    await this.userService.resetPasswordRequest(email)

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email',
    })
  })

  /**
   * @swagger
   * /users/reset-password:
   *   post:
   *     summary: Reset user password
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               otp:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password has been reset successfully
   *       400:
   *         description: Invalid OTP or request
   */
  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body
    await this.userService.resetPassword(email, otp, newPassword)

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    })
  })

  /**
   * @swagger
   * /users/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logged out successfully
   *       401:
   *         description: Unauthorized
   */
  logout = catchAsync(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new AppError(401, 'No token provided')
    }

    await this.userService.logout(token)

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  })
}
