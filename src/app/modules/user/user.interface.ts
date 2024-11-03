import { Email } from '../shared/common.types'
import { UserRole } from '../shared/enumeration'

export interface ILogin {
  email?: string
  user_name?: string
  password: string
}

export interface IUser extends Omit<ILogin, 'password'> {
  first_name: string
  last_name: string
  user_name?: string
  role: UserRole
  email: Email
  password: string
  resetPasswordOTP?: string | null
  resetPasswordOTPExpiry?: Date | null
  isDeleted?: boolean
  is_active?: boolean
}
