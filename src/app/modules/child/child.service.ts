import { Repository } from 'typeorm'
import { PostgresDataSource } from '../../config/database'
import { ChildEntity } from './child.entity'
import { IChild } from './child.interface'
import AppError from '../shared/errors/AppError'
import { UserEntity } from '../user/user.entity'
import { UserRole } from '../shared/enumeration'

export class ChildService {
  private childRepository: Repository<ChildEntity>
  private userRepository: Repository<UserEntity>

  constructor() {
    this.childRepository = PostgresDataSource.getRepository(ChildEntity)
    this.userRepository = PostgresDataSource.getRepository(UserEntity)
  }

  private async validateParent(userId: string) {
    try {
      const parent = await this.userRepository.findOne({
        where: {
          clerk_user_id: userId,
          role: UserRole.PARENT,
          is_active: true,
          isDeleted: false,
        },
      })

      if (!parent) {
        throw new AppError(403, 'Only active parents can register children')
      }

      return parent
    } catch (error) {
      console.error('Parent validation error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(403, 'Failed to validate parent')
    }
  }

  async registerChild(childData: IChild) {
    try {
      const parent = await this.validateParent(childData.parent_id)

      const child = this.childRepository.create({
        ...childData,
        parent_id: parent.id,
      })

      await this.childRepository.save(child)

      return child
    } catch (error) {
      console.error('Register child error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to register child')
    }
  }

  async getChildrenByParent(parentClerkId: string) {
    try {
      const parent = await this.validateParent(parentClerkId)

      return await this.childRepository.find({
        where: {
          parent_id: parent.id,
          is_active: true,
        },
      })
    } catch (error) {
      console.error('Get children error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to fetch children')
    }
  }

  async updateChild(
    childId: string,
    parentClerkId: string,
    updateData: Partial<IChild>,
  ) {
    try {
      const parent = await this.validateParent(parentClerkId)

      const child = await this.childRepository.findOne({
        where: {
          id: childId,
          parent_id: parent.id,
          is_active: true,
        },
      })

      if (!child) {
        throw new AppError(404, 'Child not found')
      }

      const updatedChild = this.childRepository.create({
        ...child,
        ...updateData,
      })
      await this.childRepository.save(updatedChild)

      return updatedChild
    } catch (error) {
      console.error('Update child error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to update child')
    }
  }

  async deleteChild(childId: string, parentClerkId: string) {
    try {
      const parent = await this.validateParent(parentClerkId)

      const child = await this.childRepository.findOne({
        where: {
          id: childId,
          parent_id: parent.id,
          is_active: true,
        },
      })

      if (!child) {
        throw new AppError(404, 'Child not found')
      }

      child.is_active = false
      await this.childRepository.save(child)

      return true
    } catch (error) {
      console.error('Delete child error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to delete child')
    }
  }
}
