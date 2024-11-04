import {
  PaymentStatus,
  BookingStatus,
  WaitlistStatus,
} from '../shared/enumeration'

export interface IBooking {
  id?: string
  child_id: string
  activity_id: string
  parent_id: string
  start_date: Date
  end_date: Date
  status: BookingStatus
  payment_status: PaymentStatus
  total_amount: number
  paid_amount: number
  notes?: string
  created_by: string
  metadata?: Record<string, unknown>
}

export interface IPayment {
  id?: string
  booking_id: string
  amount: number
  payment_method: string
  status: PaymentStatus
  transaction_id?: string
  payment_date: Date
  metadata?: Record<string, unknown>
}

export interface IAvailability {
  activity_id: string
  date: Date
  total_spots: number
  booked_spots: number
  available_spots: number
}

export interface IBookingConfirmation {
  booking_id: string
  confirmation_code: string
  confirmed_at?: Date
  expires_at: Date
  status: BookingStatus
}

export interface IWaitlistEntry {
  id?: string
  booking_id: string
  position: number
  status: WaitlistStatus
  notification_sent: boolean
  created_at: Date
}

export interface IRecurringBooking {
  frequency: 'daily' | 'weekly' | 'monthly'
  days_of_week?: number[]
  until: Date
  exceptions?: Date[]
}
