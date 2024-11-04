import { z } from 'zod'
import { BookingStatus, PaymentStatus } from '../shared/enumeration'

export const createBookingSchema = z
  .object({
    child_id: z.string().uuid('Invalid child ID'),
    activity_id: z.string().uuid('Invalid activity ID'),
    start_date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    end_date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    notes: z.string().optional(),
    metadata: z
      .record(z.unknown())
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          try {
            JSON.stringify(val)
            return true
          } catch {
            return false
          }
        },
        {
          message: 'Invalid metadata format',
        },
      ),
  })
  .refine(
    (data) => {
      return new Date(data.end_date) > new Date(data.start_date)
    },
    {
      message: 'End date must be after start date',
    },
  )

export const updateBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  payment_status: z.nativeEnum(PaymentStatus).optional(),
  notes: z.string().optional(),
  metadata: z
    .record(z.unknown())
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        try {
          JSON.stringify(val)
          return true
        } catch {
          return false
        }
      },
      {
        message: 'Invalid metadata format',
      },
    ),
})

export const createPaymentSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  amount: z.number().positive('Amount must be greater than 0'),
  payment_method: z.string().min(1, 'Payment method is required'),
  transaction_id: z.string().optional(),
  metadata: z
    .record(z.unknown())
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        try {
          JSON.stringify(val)
          return true
        } catch {
          return false
        }
      },
      {
        message: 'Invalid metadata format',
      },
    ),
})

export const checkAvailabilitySchema = z.object({
  activity_id: z.string().uuid('Invalid activity ID'),
  date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
})

export const createRecurringBookingSchema = z.object({
  child_id: z.string().uuid('Invalid child ID'),
  activity_id: z.string().uuid('Invalid activity ID'),
  start_date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    until: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    days_of_week: z.array(z.number().min(0).max(6)).optional(),
    exceptions: z.array(z.date()).optional(),
  }),
  notes: z.string().optional(),
})
