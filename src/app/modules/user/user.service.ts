import { clerk } from '../../config/clerk'
import { PostgresDataSource } from '../../config/database'
import { UserEntity } from './user.entity'
import { UserModel } from './user.model'
import { ILogin, IUser } from './user.interface'
import { SessionModel } from '../session/session.model'
import bcrypt from 'bcryptjs'
import AppError from '../shared/errors/AppError'
import { v4 as uuidv4 } from 'uuid'
import { MoreThan } from 'typeorm'
import { generateOTP } from '../../utils/otp.utils'
import nodemailer from 'nodemailer'

export class UserService {
  private userRepository
  private transporter
  // jecg rsav ebib acgt

  constructor() {
    this.userRepository = PostgresDataSource.getRepository(UserEntity)

    // Initialize nodemailer
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'mdsumoncse19@gmail.com',
        pass: 'jecg rsav ebib acgt',
      },
    })
  }

  async register(userData: IUser) {
    try {
      console.log('Registration data:', userData)

      const existingUser = await this.userRepository.findOne({
        where: [{ email: userData.email }, { user_name: userData.user_name }],
      })

      if (existingUser) {
        throw new AppError(409, 'User already exists')
      }

      // Create user in Clerk with proper format according to documentation
      const clerkUserParams = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        emailAddress: [userData.email], // Array of strings as per documentation
        password: userData.password,
        username: userData.user_name || undefined,
        publicMetadata: {
          role: userData.role,
        },
        skipPasswordChecks: true, // Optional: Skip password validation during migration
      }

      console.log('Clerk user params:', clerkUserParams)

      const clerkUser = await clerk.users.createUser(clerkUserParams)

      console.log('Clerk user created:', clerkUser)

      if (!clerkUser) {
        throw new AppError(400, 'Failed to create user in Clerk')
      }

      // Save to PostgreSQL
      const pgUser = this.userRepository.create({
        first_name: userData.first_name,
        last_name: userData.last_name,
        user_name: userData.user_name,
        email: userData.email,
        role: userData.role,
        clerk_user_id: clerkUser.id,
        email_verified: false,
        is_active: true,
      })

      console.log('Saving to PostgreSQL:', pgUser)
      await this.userRepository.save(pgUser)

      // Save to MongoDB
      const mongoUser = new UserModel({
        first_name: userData.first_name,
        last_name: userData.last_name,
        user_name: userData.user_name,
        email: userData.email,
        role: userData.role,
        clerk_user_id: clerkUser.id,
        password: await bcrypt.hash(userData.password, 10),
      })

      console.log('Saving to MongoDB:', mongoUser)
      await mongoUser.save()

      // Return user without sensitive data
      return {
        id: pgUser.id,
        first_name: pgUser.first_name,
        last_name: pgUser.last_name,
        user_name: pgUser.user_name,
        email: pgUser.email,
        role: pgUser.role,
        email_verified: pgUser.email_verified,
        is_active: pgUser.is_active,
        created_at: pgUser.created_at,
        updated_at: pgUser.updated_at,
      }
    } catch (error: unknown) {
      console.error('Registration error details:', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
      })

      // If it's our custom error, throw it directly
      if (error instanceof AppError) {
        throw error
      }

      // If it's a Clerk error, provide more detailed error information
      if (error && typeof error === 'object' && 'errors' in error) {
        const clerkError = error as {
          errors: Array<{
            code: string
            message: string
            longMessage?: string
            meta?: { paramName?: string }
          }>
        }
        console.error(
          'Clerk error details:',
          JSON.stringify(clerkError, null, 2),
        )

        // Handle specific Clerk errors
        if (clerkError.errors[0]?.code === 'form_password_pwned') {
          throw new AppError(
            422,
            'This password has been compromised in a data breach. Please choose a different password.',
          )
        }

        if (clerkError.errors[0]?.code === 'form_data_missing') {
          throw new AppError(
            422,
            'Missing required fields. Please check your input.',
          )
        }

        // Handle other validation errors
        const errorMessage =
          clerkError.errors[0]?.longMessage ||
          clerkError.errors[0]?.message ||
          'Registration failed'
        throw new AppError(422, errorMessage)
      }

      // For any other error
      throw new AppError(400, 'Registration failed')
    }
  }

  async login(loginData: ILogin) {
    try {
      // Find user in PostgreSQL
      const user = await this.userRepository.findOne({
        where: loginData.email
          ? { email: loginData.email }
          : { user_name: loginData.user_name },
      })

      if (!user) {
        throw new AppError(404, 'User not found')
      }

      try {
        // Verify with Clerk
        const clerkUser = await clerk.users.getUser(user.clerk_user_id!)
        if (!clerkUser) {
          throw new AppError(401, 'Invalid credentials')
        }

        // Verify password with Clerk
        try {
          const isPasswordValid = await clerk.users.verifyPassword({
            userId: clerkUser.id,
            password: loginData.password,
          })

          if (!isPasswordValid) {
            throw new AppError(401, 'Invalid credentials')
          }
        } catch (error) {
          console.error('Password verification error:', error)
          throw new AppError(401, 'Invalid credentials')
        }

        // Create session token
        const sessionToken = uuidv4()

        try {
          // Delete any existing sessions for this user
          await SessionModel.deleteMany({ userId: user.id })

          // Create new session in MongoDB
          const session = new SessionModel({
            userId: user.id,
            token: sessionToken,
            clerkUserId: user.clerk_user_id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            lastActivity: new Date(),
            deviceInfo: {
              userAgent: 'web',
              ip: '127.0.0.1',
            },
          })

          await session.save()

          // Return user data and token
          return {
            user: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              user_name: user.user_name,
              role: user.role,
            },
            token: sessionToken,
          }
        } catch (sessionError) {
          console.error('Session creation error:', sessionError)
          throw new AppError(500, 'Failed to create session')
        }
      } catch (clerkError) {
        console.error('Clerk verification error:', clerkError)
        throw new AppError(401, 'Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(500, 'Something went wrong during login')
    }
  }

  async resetPasswordRequest(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } })
      if (!user) {
        throw new AppError(404, 'User not found')
      }

      // Generate OTP
      const otp = generateOTP(6) // 6-digit OTP
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      // Save OTP in PostgreSQL
      const updateResult = await this.userRepository.update(
        { id: user.id },
        {
          resetPasswordOTP: otp,
          resetPasswordOTPExpiry: otpExpiry,
        },
      )

      console.log('PostgreSQL update result:', updateResult)

      // Save OTP in MongoDB
      const mongoUpdateResult = await UserModel.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            resetPasswordOTP: otp,
            resetPasswordOTPExpiry: otpExpiry,
          },
        },
        { new: true }, // Return updated document
      )

      console.log('MongoDB update result:', mongoUpdateResult)

      if (!updateResult.affected || !mongoUpdateResult) {
        throw new AppError(500, 'Failed to save OTP')
      }

      // Send OTP via email
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'mdsumoncse19@gmail.com',
        to: email,
        subject: 'Password Reset OTP',
        html: `
          <h1>Password Reset Request</h1>
          <p>Your OTP for password reset is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      })

      return {
        success: true,
        message: 'Password reset OTP has been sent to your email',
      }
    } catch (error) {
      console.error('Reset password request error:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(500, 'Failed to initiate password reset')
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    try {
      // Find user and verify OTP in PostgreSQL
      const user = await this.userRepository.findOne({
        where: {
          email,
          resetPasswordOTP: otp,
          resetPasswordOTPExpiry: MoreThan(new Date()),
        },
      })

      if (!user) {
        throw new AppError(400, 'Invalid or expired OTP')
      }

      // Verify OTP in MongoDB as well
      const mongoUser = await UserModel.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordOTPExpiry: { $gt: new Date() },
      })

      if (!mongoUser) {
        throw new AppError(400, 'Invalid or expired OTP')
      }

      // Update password in Clerk
      await clerk.users.updateUser(user.clerk_user_id!, {
        password: newPassword,
      })

      // Update password in MongoDB
      await UserModel.findOneAndUpdate(
        { email },
        {
          password: await bcrypt.hash(newPassword, 10),
          resetPasswordOTP: null,
          resetPasswordOTPExpiry: null,
        },
      )

      // Clear OTP in PostgreSQL
      await this.userRepository.update(user.id, {
        resetPasswordOTP: null,
        resetPasswordOTPExpiry: null,
      })

      return {
        success: true,
        message: 'Password has been reset successfully',
      }
    } catch (error) {
      console.error('Reset password error:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(400, 'Failed to reset password')
    }
  }

  async logout(token: string) {
    try {
      // Find and delete the session from MongoDB
      const session = await SessionModel.findOneAndDelete({ token })

      if (!session) {
        throw new AppError(404, 'Session not found')
      }

      // Optionally, you can also revoke the session in Clerk
      try {
        await clerk.users.getUser(session.clerkUserId)
      } catch (error) {
        console.error('Error revoking Clerk session:', error)
      }

      return {
        success: true,
        message: 'Logged out successfully',
      }
    } catch (error) {
      console.error('Logout error:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(500, 'Failed to logout')
    }
  }
}
