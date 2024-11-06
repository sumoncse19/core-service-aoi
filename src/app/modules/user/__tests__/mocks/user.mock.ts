import { UserRole } from '../../../shared/enumeration'
import { UserEntity } from '../../user.entity'

export const mockUserData = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  password: 'Test123!@#',
  role: UserRole.PARENT,
  user_name: 'johndoe',
}

export const mockUserResponse: Partial<UserEntity> = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  role: UserRole.PARENT,
  user_name: 'johndoe',
  clerk_user_id: 'clerk_123',
  email_verified: false,
  is_active: true,
  isDeleted: false,
  created_at: new Date(),
  updated_at: new Date(),
  full_name: 'John Doe',
}

export const mockLoginData = {
  email: 'john.doe@example.com',
  password: 'Test123!@#',
}

export const mockSessionData = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  token: 'mock-session-token',
  clerkUserId: 'clerk_123',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  lastActivity: new Date(),
}
