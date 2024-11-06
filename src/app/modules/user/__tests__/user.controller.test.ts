import { Request, Response, NextFunction } from 'express'
import { jest, describe, expect, it, beforeEach } from '@jest/globals'
import { UserController } from '../user.controller'
import { UserService } from '../user.service'
import {
  mockUserData,
  mockUserResponse,
  mockLoginData,
} from './mocks/user.mock'
import { UserEntity } from '../user.entity'
import { UserRole } from '../../shared/enumeration'

// Mock UserService
jest.mock('../user.service')

// Define the expected return type for register
interface RegisterResponse {
  id: string
  first_name: string
  last_name: string
  user_name: string | undefined
  email: string
  role: UserRole
  email_verified: boolean
  is_active: boolean
  created_at: Date
  updated_at: Date
}

describe('UserController', () => {
  let userController: UserController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let mockUserService: jest.Mocked<UserService>

  beforeEach(() => {
    mockRequest = {
      body: {},
      headers: {},
    }
    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn().mockReturnThis() as unknown as Response['json'],
    }
    // Cast the mock function to NextFunction
    mockNext = jest.fn() as unknown as NextFunction
    mockUserService = new UserService() as jest.Mocked<UserService>
    userController = new UserController()

    // Use unknown type assertion first
    ;(
      userController as unknown as { userService: jest.Mocked<UserService> }
    ).userService = mockUserService
  })

  describe('register', () => {
    it('should successfully register a user', async () => {
      mockRequest.body = mockUserData
      mockUserService.register.mockResolvedValue(
        mockUserResponse as RegisterResponse,
      )

      await userController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUserResponse,
      })
    })
  })

  describe('login', () => {
    it('should successfully login a user', async () => {
      mockRequest.body = mockLoginData
      mockUserService.login.mockResolvedValue({
        user: mockUserResponse as Required<
          Pick<
            UserEntity,
            'id' | 'first_name' | 'last_name' | 'email' | 'user_name' | 'role'
          >
        >,
        token: 'mock-token',
      })

      await userController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUserResponse,
          token: 'mock-token',
        },
      })
    })
  })

  describe('resetPasswordRequest', () => {
    it('should successfully send reset password OTP', async () => {
      mockRequest.body = { email: mockUserData.email }
      mockUserService.resetPasswordRequest.mockResolvedValue({
        success: true,
        message: 'Password reset OTP has been sent to your email',
      })

      await userController.resetPasswordRequest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset OTP has been sent to your email',
      })
    })
  })

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      mockRequest.body = {
        email: mockUserData.email,
        otp: '123456',
        newPassword: 'NewTest123!@#',
      }
      mockUserService.resetPassword.mockResolvedValue({
        success: true,
        message: 'Password has been reset successfully',
      })

      await userController.resetPassword(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password has been reset successfully',
      })
    })
  })
})
