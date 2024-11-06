/* eslint-disable no-unused-vars */
import { jest } from '@jest/globals'
import { UserRole } from '../../../shared/enumeration'

// Define types for Clerk user
interface ClerkUser {
  id: string
  firstName: string
  lastName: string
  emailAddresses: Array<{ emailAddress: string }>
  username: string
}

// Define type for user creation data
interface ClerkUserCreateData {
  firstName: string
  lastName: string
  emailAddress: string[]
  password: string
  username?: string
  publicMetadata: {
    role: UserRole
  }
}

// Define type for user update data
interface ClerkUserUpdateData {
  firstName?: string
  lastName?: string
  password?: string
  username?: string
}

// Define types for Clerk methods
interface ClerkMethods {
  createUser: (data: ClerkUserCreateData) => Promise<ClerkUser>
  getUser: (id: string) => Promise<ClerkUser>
  verifyPassword: (id: string, password: string) => Promise<boolean>
  updateUser: (id: string, data: ClerkUserUpdateData) => Promise<ClerkUser>
}

export const mockClerkUser: ClerkUser = {
  id: 'clerk_123',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  username: 'johndoe',
}

export const mockClerk = {
  users: {
    createUser: jest
      .fn<ClerkMethods['createUser']>()
      .mockResolvedValue(mockClerkUser),
    getUser: jest
      .fn<ClerkMethods['getUser']>()
      .mockResolvedValue(mockClerkUser),
    verifyPassword: jest
      .fn<ClerkMethods['verifyPassword']>()
      .mockResolvedValue(true),
    updateUser: jest
      .fn<ClerkMethods['updateUser']>()
      .mockResolvedValue(mockClerkUser),
  },
}
