import { BookingStatus, AttendanceStatus, PaymentStatus } from '../enumeration'

// Used for tracking activity participation across booking and attendance
export interface IActivityParticipation {
  booking_id: string
  child_id: string
  activity_id: string
  status: BookingStatus
  attendance_status?: AttendanceStatus
  payment_status: PaymentStatus
}

// Used for validating activity eligibility in both booking and child services
export interface IActivityEligibility {
  minAge?: number
  maxAge?: number
  requiredMedical?: boolean
  specialNeeds?: string[]
  capacity: number
  waitlistEnabled: boolean
}
