export interface IChild {
  id?: string
  first_name: string
  last_name: string
  date_of_birth: Date
  parent_id: string
  gender?: string
  medical_info?: string
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  is_active?: boolean
  metadata?: Record<string, unknown>
} 