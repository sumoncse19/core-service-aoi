import { z } from 'zod'
import { UserRole } from '../shared/enumeration'

export const registerSchema = z.object({
  first_name: z.string().min(2, 'Name is required'),
  last_name: z.string().min(2, 'Name is required'),
  user_name: z.string().optional(),
  role: z.enum([UserRole.ADMIN, UserRole.PARENT, UserRole.STAFF]),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
  resetPasswordOTP: z.string().optional(),
  resetPasswordOTPExpiry: z.date().optional(),
})

export const loginSchema = z
  .object({
    user_name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.email || data.user_name, {
    message: 'Either email or username must be provided',
  })

export const resetPasswordSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
})
