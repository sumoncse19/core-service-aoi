import { jest, describe, expect, it, beforeEach } from '@jest/globals'
import { Repository } from 'typeorm'
import { ChildService } from '../child.service'
import { ChildEntity } from '../child.entity'
import { ChildModel } from '../child.model'
import { PostgresDataSource } from '../../../config/database'
import {
  mockChildData,
  mockChildResponse,
  mockParentUser,
} from './mocks/child.mock'
import AppError from '../../shared/errors/AppError'
import { UserEntity } from '../../user/user.entity'

// Mock the database connection
jest.mock('../../../config/database', () => ({
  PostgresDataSource: {
    getRepository: jest.fn(),
  },
}))

describe('ChildService', () => {
  let childService: ChildService
  let mockChildRepository: jest.Mocked<Repository<ChildEntity>>
  let mockUserRepository: jest.Mocked<Repository<UserEntity>>

  beforeEach(() => {
    jest.clearAllMocks()

    mockChildRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<ChildEntity>>

    mockUserRepository = {
      findOne: jest
        .fn()
        .mockImplementation(() => Promise.resolve(mockParentUser)),
    } as unknown as jest.Mocked<Repository<UserEntity>>
    ;(PostgresDataSource.getRepository as jest.Mock).mockImplementation(
      (entity) => {
        if (entity === UserEntity) return mockUserRepository
        return mockChildRepository
      },
    )

    childService = new ChildService()
  })

  describe('registerChild', () => {
    it('should successfully create a child', async () => {
      mockChildRepository.create.mockReturnValue(
        mockChildResponse as ChildEntity,
      )
      mockChildRepository.save.mockResolvedValue(
        mockChildResponse as ChildEntity,
      )
      jest
        .spyOn(ChildModel.prototype, 'save')
        .mockResolvedValue(mockChildResponse)

      const result = await childService.registerChild({
        ...mockChildData,
        parent_id: mockParentUser.clerk_user_id,
      })

      expect(result).toBeDefined()
      expect(result.first_name).toBe(mockChildData.first_name)
      expect(mockChildRepository.save).toHaveBeenCalled()
    })

    it('should throw error if parent is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(
        childService.registerChild({
          ...mockChildData,
          parent_id: 'non-existent',
        }),
      ).rejects.toThrow(
        new AppError(403, 'Only active parents can register children'),
      )
    })
  })

  describe('getChildrenByParent', () => {
    it('should return all children for a parent', async () => {
      mockChildRepository.find.mockResolvedValue([
        mockChildResponse as ChildEntity,
      ])

      const result = await childService.getChildrenByParent(
        mockParentUser.clerk_user_id,
      )

      expect(result).toHaveLength(1)
      expect(result[0].parent_id).toBe(mockParentUser.id)
    })
  })

  describe('updateChild', () => {
    it('should successfully update a child', async () => {
      const updatedChild = {
        ...mockChildResponse,
        first_name: 'Updated',
        full_name: 'Updated Child',
      } as ChildEntity

      // Mock findOne for parent validation
      mockUserRepository.findOne.mockResolvedValue(mockParentUser)

      // Mock findOne for child validation
      mockChildRepository.findOne.mockResolvedValue(
        mockChildResponse as ChildEntity,
      )

      // Mock create and save for the update
      mockChildRepository.create.mockReturnValue({
        ...mockChildResponse,
        first_name: 'Updated',
      } as ChildEntity)
      mockChildRepository.save.mockResolvedValue(updatedChild)

      const result = await childService.updateChild(
        'child-123',
        mockParentUser.clerk_user_id,
        { first_name: 'Updated' },
      )

      expect(result).toBeDefined()
      expect(result.first_name).toBe('Updated')
      expect(mockChildRepository.save).toHaveBeenCalled()
    })

    it('should throw error if child not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockParentUser)
      mockChildRepository.findOne.mockResolvedValue(null)

      await expect(
        childService.updateChild('non-existent', mockParentUser.clerk_user_id, {
          first_name: 'Updated',
        }),
      ).rejects.toThrow(new AppError(404, 'Child not found'))
    })
  })

  describe('deleteChild', () => {
    it('should successfully delete a child', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockParentUser)
      mockChildRepository.findOne.mockResolvedValue(
        mockChildResponse as ChildEntity,
      )
      mockChildRepository.save.mockResolvedValue({
        ...mockChildResponse,
        is_active: false,
      } as ChildEntity)

      const result = await childService.deleteChild(
        'child-123',
        mockParentUser.clerk_user_id,
      )

      expect(result).toBe(true)
    })

    it('should throw error if child not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockParentUser)
      mockChildRepository.findOne.mockResolvedValue(null)

      await expect(
        childService.deleteChild('non-existent', mockParentUser.clerk_user_id),
      ).rejects.toThrow(new AppError(404, 'Child not found'))
    })
  })
})
