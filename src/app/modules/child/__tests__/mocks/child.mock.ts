import { UserRole } from '../../../shared/enumeration'
import { ChildEntity } from '../../child.entity'
import { IChild } from '../../child.interface'
import { UserEntity } from '../../../user/user.entity'

// Mock parent user data with required properties
export const mockParentUser: Required<UserEntity> = {
  id: 'parent-123',
  first_name: 'Parent',
  last_name: 'User',
  email: 'parent@example.com',
  role: UserRole.PARENT,
  is_active: true,
  isDeleted: false,
  full_name: 'Parent User',
  created_at: new Date(),
  updated_at: new Date(),
  user_name: 'parent',
  email_verified: true,
  clerk_user_id: 'parent-123',
  metadata: {},
} as Required<UserEntity>

// Mock data for creating a child with required properties
export const mockChildData: IChild = {
  first_name: 'Test',
  last_name: 'Child',
  date_of_birth: new Date('2020-01-01'),
  parent_id: 'parent-123',
  gender: 'Male',
  medical_info: 'None',
  emergency_contact: {
    name: 'Emergency Contact',
    relationship: 'Relative',
    phone: '1234567890',
  },
  is_active: true,
}

// Mock response when a child is retrieved with all required properties
export const mockChildResponse: ChildEntity = {
  id: 'child-123',
  first_name: 'Test',
  last_name: 'Child',
  date_of_birth: new Date('2020-01-01'),
  parent_id: 'parent-123',
  gender: 'Male',
  medical_info: 'None',
  emergency_contact: {
    name: 'Emergency Contact',
    relationship: 'Relative',
    phone: '1234567890',
  },
  is_active: true,
  parent: mockParentUser,
  full_name: 'Test Child',
  created_at: new Date(),
  updated_at: new Date(),
  metadata: {},
} as ChildEntity

// Helper function to create updated child entity
export const createUpdatedChildResponse = (
  updates: Partial<ChildEntity>,
): ChildEntity =>
  ({
    ...mockChildResponse,
    ...updates,
    full_name: `${updates.first_name || mockChildResponse.first_name} ${updates.last_name || mockChildResponse.last_name}`,
  }) as ChildEntity
