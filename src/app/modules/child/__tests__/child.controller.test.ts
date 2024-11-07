import { Response, NextFunction } from 'express'
import { jest, describe, expect, it, beforeEach } from '@jest/globals'
import { ChildController } from '../child.controller'
import { ChildService } from '../child.service'
import {
  mockChildData,
  mockChildResponse,
  createUpdatedChildResponse,
} from './mocks/child.mock'
import { RequestWithAuth } from '../../../types/express'
import { UserRole } from '../../shared/enumeration'

// Mock ChildService
jest.mock('../child.service')

describe('ChildController', () => {
  let childController: ChildController
  let mockRequest: Partial<RequestWithAuth>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let mockChildService: jest.Mocked<ChildService>

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      auth: {
        userId: 'parent-123',
        roles: [UserRole.PARENT],
        user_name: 'parent',
      },
    }

    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn().mockReturnThis() as unknown as Response['json'],
    }
    mockNext = jest.fn()
    mockChildService = new ChildService() as jest.Mocked<ChildService>
    childController = new ChildController()
    ;(
      childController as unknown as { childService: jest.Mocked<ChildService> }
    ).childService = mockChildService
  })

  describe('registerChild', () => {
    it('should successfully create a child', async () => {
      mockRequest.body = mockChildData
      mockChildService.registerChild.mockResolvedValue(mockChildResponse)

      await childController.registerChild(
        mockRequest as RequestWithAuth,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockChildResponse,
      })
    })
  })

  describe('getMyChildren', () => {
    it('should successfully get all children', async () => {
      mockChildService.getChildrenByParent.mockResolvedValue([
        mockChildResponse,
      ])

      await childController.getMyChildren(
        mockRequest as RequestWithAuth,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockChildResponse],
      })
    })
  })

  describe('updateChild', () => {
    it('should successfully update a child', async () => {
      mockRequest.params = { id: 'child-123' }
      mockRequest.body = { first_name: 'Updated' }
      const updatedChild = createUpdatedChildResponse({ first_name: 'Updated' })
      mockChildService.updateChild.mockResolvedValue(updatedChild)

      await childController.updateChild(
        mockRequest as RequestWithAuth,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedChild,
      })
    })
  })

  describe('deleteChild', () => {
    it('should successfully delete a child', async () => {
      mockRequest.params = { id: 'child-123' }
      mockChildService.deleteChild.mockResolvedValue(true)

      await childController.deleteChild(
        mockRequest as RequestWithAuth,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Child deleted successfully',
      })
    })
  })
})
