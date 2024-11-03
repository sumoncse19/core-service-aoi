import { z } from 'zod'
import { ActivityStatus, AttendanceStatus } from '../shared/enumeration'

// Activity Schemas
const staffIdValidation = z
  .array(z.string())
  .optional()
  .refine((staff) => {
    if (!staff?.length) return true
    return staff.every((id) => {
      // Accept both UUID format and Clerk user ID format
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const clerkPattern = /^user_/
      return uuidPattern.test(id) || clerkPattern.test(id)
    })
  }, 'Invalid staff ID format. Must be either a UUID or Clerk user ID')

export const createActivitySchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    start_time: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    end_time: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    assigned_staff: staffIdValidation,
    max_participants: z
      .number()
      .positive()
      .optional()
      .refine((val) => !val || val > 0, {
        message: 'Maximum participants must be greater than 0',
      }),
    location: z.string().optional(),
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
      const start = new Date(data.start_time)
      const end = new Date(data.end_time)
      return end > start
    },
    {
      message: 'End time must be after start time',
    },
  )

export const updateActivitySchema = z
  .object({
    title: z.string().min(2, 'Title must be at least 2 characters').optional(),
    description: z
      .string()
      .min(5, 'Description must be at least 5 characters')
      .optional(),
    start_time: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    end_time: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    status: z.nativeEnum(ActivityStatus).optional(),
    assigned_staff: staffIdValidation,
    max_participants: z.number().positive().optional(),
    location: z.string().optional(),
    metadata: z
      .record(z.string(), z.unknown())
      .optional()
      .transform((val) => (val ? JSON.parse(JSON.stringify(val)) : undefined)),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return new Date(data.end_time) > new Date(data.start_time)
      }
      return true
    },
    {
      message: 'End time must be after start time',
    },
  )

// Attendance Schemas
export const createAttendanceSchema = z
  .object({
    activity_id: z.string().uuid('Invalid activity ID'),
    child_id: z.string().uuid('Invalid child ID'),
    status: z.nativeEnum(AttendanceStatus),
    check_in_time: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    check_out_time: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.check_in_time && data.check_out_time) {
        return new Date(data.check_out_time) > new Date(data.check_in_time)
      }
      return true
    },
    {
      message: 'Check-out time must be after check-in time',
    },
  )

export const updateAttendanceSchema = z
  .object({
    status: z.nativeEnum(AttendanceStatus).optional(),
    check_in_time: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    check_out_time: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.check_in_time && data.check_out_time) {
        return new Date(data.check_out_time) > new Date(data.check_in_time)
      }
      return true
    },
    {
      message: 'Check-out time must be after check-in time',
    },
  )

// Report Schemas
export const activityReportSchema = z.object({
  activityId: z.string().uuid('Invalid activity ID'),
})

export const dateRangeSchema = z
  .object({
    start_date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    end_date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
  })
  .refine(
    (data) => {
      return new Date(data.end_date) > new Date(data.start_date)
    },
    {
      message: 'End date must be after start date',
    },
  )

export const monthlyReportSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
})

export const bulkAttendanceSchema = z.object({
  activity_id: z.string().uuid('Invalid activity ID'),
  attendances: z.array(
    z.object({
      child_id: z.string().uuid('Invalid child ID'),
      status: z.nativeEnum(AttendanceStatus),
      check_in_time: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val))
        .optional(),
      check_out_time: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val))
        .optional(),
      notes: z.string().optional(),
    }),
  ),
})
