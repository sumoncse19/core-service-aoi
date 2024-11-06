import { jest, describe, expect, it, beforeEach } from '@jest/globals'
import { Repository, UpdateResult } from 'typeorm'
import { UserEntity } from '../user.entity'
import { mockClerk, mockClerkUser } from './mocks/clerk.mock'
import { UserService } from '../user.service'
import { UserModel } from '../user.model'
import { SessionModel } from '../../session/session.model'
import { PostgresDataSource } from '../../../config/database'
import {
  mockUserData,
  mockUserResponse,
  mockLoginData,
  mockSessionData,
} from './mocks/user.mock'
import AppError from '../../shared/errors/AppError'

// Then declare mocks
jest.mock('../../../config/clerk', () => ({
  clerk: mockClerk,
}))

jest.mock('../../../config/database', () => ({
  PostgresDataSource: {
    getRepository: jest.fn(),
  },
}))

// Mock nodemailer with proper return type
type NodemailerResponse = {
  messageId: string
  response: string
}

const mockNodemailerResponse: NodemailerResponse = {
  messageId: 'mock-message-id',
  response: 'mock-response',
}

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockNodemailerResponse)),
  }),
}))

describe('UserService', () => {
  let userService: UserService
  let mockUserRepository: jest.Mocked<Repository<UserEntity>>

  beforeEach(() => {
    jest.clearAllMocks()

    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserEntity>>
    ;(PostgresDataSource.getRepository as jest.Mock).mockReturnValue(
      mockUserRepository,
    )
    userService = new UserService()

    // Reset mock implementations
    mockClerk.users.createUser.mockResolvedValue(mockClerkUser)
    mockClerk.users.getUser.mockResolvedValue(mockClerkUser)
    mockClerk.users.verifyPassword.mockResolvedValue(true)
    mockClerk.users.updateUser.mockResolvedValue(mockClerkUser)
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)
      mockUserRepository.create.mockReturnValue(mockUserResponse as UserEntity)
      mockUserRepository.save.mockResolvedValue(mockUserResponse as UserEntity)

      jest
        .spyOn(UserModel.prototype, 'save')
        .mockResolvedValue(mockUserResponse as UserEntity)

      const result = await userService.register(mockUserData)

      expect(result).toBeDefined()
      expect(result.email).toBe(mockUserData.email)
      expect(mockUserRepository.save).toHaveBeenCalled()
      expect(mockClerk.users.createUser).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should successfully login user', async () => {
      mockUserRepository.findOne.mockResolvedValue(
        mockUserResponse as UserEntity,
      )

      jest.spyOn(SessionModel, 'deleteMany').mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      })
      jest
        .spyOn(SessionModel.prototype, 'save')
        .mockResolvedValue(mockSessionData)

      const result = await userService.login(mockLoginData)

      expect(result).toBeDefined()
      expect(result.token).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.user.email).toBe(mockLoginData.email)
    })

    it('should throw error for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(
        mockUserResponse as UserEntity,
      )
      mockClerk.users.verifyPassword.mockResolvedValue(false)

      await expect(userService.login(mockLoginData)).rejects.toThrow(
        new AppError(401, 'Invalid credentials'),
      )
    })
  })

  describe('resetPasswordRequest', () => {
    it('should successfully send reset password OTP', async () => {
      mockUserRepository.findOne.mockResolvedValue(
        mockUserResponse as UserEntity,
      )
      mockUserRepository.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      } as UpdateResult)

      jest
        .spyOn(UserModel, 'findOneAndUpdate')
        .mockResolvedValue(mockUserResponse as UserEntity)

      const result = await userService.resetPasswordRequest(mockUserData.email)

      expect(result.success).toBe(true)
      expect(mockUserRepository.update).toHaveBeenCalled()
    })

    it('should throw error for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(
        userService.resetPasswordRequest(mockUserData.email),
      ).rejects.toThrow(new AppError(404, 'User not found'))
    })
  })

  describe('resetPassword', () => {
    const mockOTP = '123456'
    const mockNewPassword = 'NewTest123!@#'

    it('should successfully reset password', async () => {
      const userWithOTP = {
        ...mockUserResponse,
        resetPasswordOTP: mockOTP,
        resetPasswordOTPExpiry: new Date(Date.now() + 1000000),
      } as UserEntity

      mockUserRepository.findOne.mockResolvedValue(userWithOTP)

      jest.spyOn(UserModel, 'findOne').mockResolvedValue(userWithOTP)
      jest
        .spyOn(UserModel, 'findOneAndUpdate')
        .mockResolvedValue(mockUserResponse as UserEntity)

      const result = await userService.resetPassword(
        mockUserData.email,
        mockOTP,
        mockNewPassword,
      )

      expect(result.success).toBe(true)
      expect(mockClerk.users.updateUser).toHaveBeenCalled()
    })

    it('should throw error for invalid OTP', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(
        userService.resetPassword(mockUserData.email, mockOTP, mockNewPassword),
      ).rejects.toThrow(new AppError(400, 'Invalid or expired OTP'))
    })
  })
})
