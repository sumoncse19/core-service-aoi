/* eslint-disable no-unused-vars */
import mongoose, { Schema, Document, CallbackError } from 'mongoose'
import { ActivityStatus, AttendanceStatus } from '../shared/enumeration'
import { IActivity, IAttendance } from './tracking.interface'

// Define document types without id to avoid conflict
type ActivityDocumentProps = Omit<IActivity, 'id'>
type AttendanceDocumentProps = Omit<IAttendance, 'id'>

// Extend Document with our props
interface ActivityDocument extends Document, ActivityDocumentProps {}
interface AttendanceDocument extends Document, AttendanceDocumentProps {}

const activitySchema = new Schema<ActivityDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(ActivityStatus),
      default: ActivityStatus.SCHEDULED,
    },
    created_by: { type: String, required: true },
    assigned_staff: [{ type: String }],
    max_participants: { type: Number },
    location: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v
        return ret
      },
    },
  },
)

// Add index for efficient querying
activitySchema.index({ start_time: 1, end_time: 1 })
activitySchema.index({ status: 1 })
activitySchema.index({ created_by: 1 })

// Virtual for duration in minutes
activitySchema.virtual('duration').get(function () {
  return Math.round(
    (this.end_time.getTime() - this.start_time.getTime()) / (1000 * 60),
  )
})

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    activity_id: { type: String, required: true },
    child_id: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.ABSENT,
    },
    check_in_time: { type: Date },
    check_out_time: { type: Date },
    notes: { type: String },
    recorded_by: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v
        return ret
      },
    },
  },
)

// Create compound index for unique attendance records and efficient querying
attendanceSchema.index({ activity_id: 1, child_id: 1 }, { unique: true })
attendanceSchema.index({ activity_id: 1, status: 1 })
attendanceSchema.index({ child_id: 1, check_in_time: 1 })

// Virtual for attendance duration in minutes
attendanceSchema.virtual('duration').get(function () {
  if (this.check_in_time && this.check_out_time) {
    return Math.round(
      (this.check_out_time.getTime() - this.check_in_time.getTime()) /
        (1000 * 60),
    )
  }
  return null
})

// Pre-save middleware to validate check-in/check-out times
attendanceSchema.pre('save', function (next) {
  if (this.check_in_time && this.check_out_time) {
    if (this.check_out_time <= this.check_in_time) {
      next(new Error('Check-out time must be after check-in time'))
    }
  }
  next()
})

// Static method to get attendance summary for an activity
attendanceSchema.statics.getActivitySummary = async function (
  activityId: string,
) {
  return this.aggregate([
    { $match: { activity_id: activityId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        summary: {
          $push: {
            status: '$_id',
            count: '$count',
          },
        },
      },
    },
  ])
}

// Define types for MongoDB error
interface MongoError extends Error {
  code?: number
  name: string
}

// Add error handling middleware with proper types
activitySchema.post(
  'save',
  function (
    err: CallbackError | null,
    _doc: ActivityDocument,
    next: (_err?: Error) => void,
  ) {
    if (
      err &&
      err.name === 'MongoError' &&
      (err as MongoError).code === 11000
    ) {
      next(new Error('Duplicate activity record'))
    } else if (err) {
      next(err)
    } else {
      next()
    }
  },
)

attendanceSchema.post(
  'save',
  function (
    err: CallbackError | null,
    _doc: AttendanceDocument,
    next: (_err?: Error) => void,
  ) {
    if (
      err &&
      err.name === 'MongoError' &&
      (err as MongoError).code === 11000
    ) {
      next(new Error('Duplicate attendance record'))
    } else if (err) {
      next(err)
    } else {
      next()
    }
  },
)

export const ActivityModel = mongoose.model<ActivityDocument>(
  'Activity',
  activitySchema,
)
export const AttendanceModel = mongoose.model<AttendanceDocument>(
  'Attendance',
  attendanceSchema,
)
