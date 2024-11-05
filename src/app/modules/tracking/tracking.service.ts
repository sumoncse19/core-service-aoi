import { Between, Not, Repository, In } from 'typeorm'
import { PostgresDataSource } from '../../config/database'
import { ActivityEntity, AttendanceEntity } from './tracking.entity'
import { ActivityModel, AttendanceModel } from './tracking.model'
import { IActivity, IAttendance } from './tracking.interface'
import AppError from '../shared/errors/AppError'
import { ActivityStatus } from '../shared/enumeration'
import { UserEntity } from '../user/user.entity'
import { UserRole } from '../shared/enumeration'
import { BookingEntity } from '../booking/booking.entity'
import { BookingStatus } from '../shared/enumeration'
import { AttendanceStatus } from '../shared/enumeration'

export class TrackingService {
  private activityRepository: Repository<ActivityEntity>
  private attendanceRepository: Repository<AttendanceEntity>
  private userRepository: Repository<UserEntity>
  private bookingRepository: Repository<BookingEntity>

  constructor() {
    this.activityRepository = PostgresDataSource.getRepository(ActivityEntity)
    this.attendanceRepository =
      PostgresDataSource.getRepository(AttendanceEntity)
    this.userRepository = PostgresDataSource.getRepository(UserEntity)
    this.bookingRepository = PostgresDataSource.getRepository(BookingEntity)
  }

  private async validateStaffIds(staffIds: string[]) {
    try {
      const staffMembers = await this.userRepository.find({
        where: {
          id: In(staffIds),
          role: UserRole.STAFF,
          is_active: true,
          isDeleted: false,
        },
      })

      if (staffMembers.length !== staffIds.length) {
        const foundIds = staffMembers.map((staff) => staff.id)
        const invalidIds = staffIds.filter((id) => !foundIds.includes(id))
        throw new AppError(400, `Invalid staff IDs: ${invalidIds.join(', ')}`)
      }

      return true
    } catch (error) {
      console.error('Staff validation error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to validate staff IDs')
    }
  }

  async createActivity(activityData: IActivity) {
    try {
      // Validate staff IDs if provided
      if (activityData.assigned_staff?.length) {
        await this.validateStaffIds(activityData.assigned_staff)
      }

      // Save to PostgreSQL
      const pgActivity = this.activityRepository.create(activityData)
      await this.activityRepository.save(pgActivity)

      // Save to MongoDB with the same ID
      try {
        const mongoActivity = new ActivityModel({
          ...activityData,
          _id: pgActivity.id.toString(), // Ensure ID is a string
        })
        await mongoActivity.save()
      } catch (mongoError) {
        console.error('MongoDB save error:', mongoError)
        // Continue even if MongoDB save fails
      }

      return pgActivity
    } catch (error) {
      console.error('Create activity error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to create activity')
    }
  }

  async getActivities() {
    try {
      const activities = await this.activityRepository.find({
        order: {
          start_time: 'DESC',
        },
        relations: ['creator'],
      })

      return activities
    } catch (error) {
      console.error('Get activities error:', error)
      throw new AppError(500, 'Failed to fetch activities')
    }
  }

  async getActivityById(id: string) {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id },
        relations: ['creator'],
      })

      if (!activity) {
        throw new AppError(404, 'Activity not found')
      }

      return activity
    } catch (error) {
      console.error('Get activity by ID error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(500, 'Failed to fetch activity')
    }
  }

  async updateActivity(id: string, updateData: Partial<IActivity>) {
    try {
      // Validate staff IDs if being updated
      if (updateData.assigned_staff?.length) {
        await this.validateStaffIds(updateData.assigned_staff)
      }

      // First find the activity to ensure it exists
      const activity = await this.activityRepository.findOne({
        where: { id },
      })

      if (!activity) {
        throw new AppError(404, 'Activity not found')
      }

      // Update in PostgreSQL using save instead of update
      const updatedActivity = this.activityRepository.create({
        ...activity,
        ...updateData,
      })
      await this.activityRepository.save(updatedActivity)

      // Update in MongoDB - Use findOneAndUpdate with string ID
      try {
        await ActivityModel.findOneAndUpdate(
          { _id: id.toString() },
          { $set: updateData },
          { new: true, runValidators: true },
        ).exec()
      } catch (mongoError) {
        console.error('MongoDB update error:', mongoError)
        // Continue even if MongoDB update fails
        // You might want to implement a retry mechanism or queue here
      }

      return this.getActivityById(id)
    } catch (error) {
      console.error('Update activity error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to update activity')
    }
  }

  async deleteActivity(id: string) {
    try {
      // Delete from PostgreSQL
      const deleteResult = await this.activityRepository.delete(id)
      if (!deleteResult.affected) {
        throw new AppError(404, 'Activity not found')
      }

      // Delete from MongoDB
      await ActivityModel.findByIdAndDelete(id)

      // Delete related attendance records
      await this.attendanceRepository.delete({ activity_id: id })
      await AttendanceModel.deleteMany({ activity_id: id })

      return true
    } catch (error) {
      console.error('Delete activity error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to delete activity')
    }
  }

  private async validateActivity(activityId: string) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    })

    if (!activity) {
      throw new AppError(404, 'Activity not found')
    }

    return activity
  }

  public async validateCapacity(activityId: string) {
    const activity = await this.validateActivity(activityId)
    const attendance = await this.getAttendanceByActivity(activityId)

    if (
      activity.max_participants &&
      attendance.length >= activity.max_participants
    ) {
      throw new AppError(400, 'Activity has reached maximum capacity')
    }
  }

  async recordAttendance(attendanceData: IAttendance & { booking_id: string }) {
    try {
      await this.validateActivity(attendanceData.activity_id)
      await this.validateCapacity(attendanceData.activity_id)

      // Verify booking exists and is confirmed
      const booking = await this.bookingRepository.findOne({
        where: {
          id: attendanceData.booking_id,
          status: BookingStatus.CONFIRMED,
        },
      })

      if (!booking) {
        throw new AppError(404, 'Valid booking not found')
      }

      // Save to PostgreSQL
      const pgAttendance = this.attendanceRepository.create({
        ...attendanceData,
        child_id: booking.child_id,
      })
      await this.attendanceRepository.save(pgAttendance)

      // Save to MongoDB
      const mongoAttendance = new AttendanceModel({
        ...attendanceData,
        child_id: booking.child_id,
      })
      await mongoAttendance.save()

      return pgAttendance
    } catch (error) {
      console.error('Record attendance error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to record attendance')
    }
  }

  async getAttendanceByActivity(activityId: string) {
    try {
      const attendance = await this.attendanceRepository.find({
        where: { activity_id: activityId },
        relations: ['activity', 'recorder'],
      })

      return attendance
    } catch (error) {
      console.error('Get attendance error:', error)
      throw new AppError(500, 'Failed to fetch attendance records')
    }
  }

  async updateAttendance(id: string, updateData: Partial<IAttendance>) {
    try {
      // Find attendance record to ensure it exists
      const attendance = await this.attendanceRepository.findOne({
        where: { id },
      })

      if (!attendance) {
        throw new AppError(404, 'Attendance record not found')
      }

      // Update in PostgreSQL
      const updatedAttendance = this.attendanceRepository.create({
        ...attendance,
        ...updateData,
      })
      await this.attendanceRepository.save(updatedAttendance)

      // Update in MongoDB using string ID
      try {
        await AttendanceModel.findOneAndUpdate(
          {
            activity_id: attendance.activity_id,
            child_id: attendance.child_id,
          },
          { $set: updateData },
          { new: true },
        )
      } catch (mongoError) {
        console.error('MongoDB update error:', mongoError)
        // Continue even if MongoDB update fails
      }

      // Return updated record with relations
      return this.attendanceRepository.findOne({
        where: { id },
        relations: ['activity', 'recorder'],
      })
    } catch (error) {
      console.error('Update attendance error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to update attendance')
    }
  }

  async getActivityReport(activityId: string) {
    try {
      const activity = await this.validateActivity(activityId)
      const attendance = await this.getAttendanceByActivity(activityId)

      const attendanceSummary = this.calculateAttendanceSummary(attendance)
      const capacityInfo = {
        total_capacity: activity.max_participants || 'unlimited',
        current_attendance: attendance.length,
        available_spots: activity.max_participants
          ? activity.max_participants - attendance.length
          : 'unlimited',
      }

      return {
        activity,
        total_participants: attendance.length,
        attendance_summary: attendanceSummary,
        capacity_info: capacityInfo,
        created_at: new Date(),
      }
    } catch (error) {
      console.error('Get activity report error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(500, 'Failed to generate activity report')
    }
  }

  async getDailyReport() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const activities = await this.activityRepository.find({
        where: {
          start_time: Between(today, tomorrow),
          status: Not(ActivityStatus.CANCELLED),
        },
        relations: ['creator'],
      })

      const reports = await Promise.all(
        activities.map(async (activity) => {
          const attendance = await this.getAttendanceByActivity(activity.id)
          const attendanceSummary = attendance.reduce(
            (acc, record) => {
              acc[record.status]++
              return acc
            },
            {
              present: 0,
              absent: 0,
              late: 0,
              excused: 0,
            },
          )

          return {
            activity,
            total_participants: attendance.length,
            attendance_summary: attendanceSummary,
          }
        }),
      )

      return {
        date: today,
        total_activities: activities.length,
        activities: reports,
      }
    } catch (error) {
      console.error('Get daily report error:', error)
      throw new AppError(500, 'Failed to generate daily report')
    }
  }

  // Helper method for attendance summary calculation
  private calculateAttendanceSummary(attendance: AttendanceEntity[]) {
    return attendance.reduce(
      (acc, record) => {
        acc[record.status]++
        return acc
      },
      {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      },
    )
  }

  async getWeeklyReport(startDate: Date) {
    try {
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7)

      const activities = await this.activityRepository.find({
        where: {
          start_time: Between(startDate, endDate),
          status: Not(ActivityStatus.CANCELLED),
        },
        relations: ['creator'],
        order: {
          start_time: 'ASC',
        },
      })

      const reports = await Promise.all(
        activities.map(async (activity) => {
          const attendance = await this.getAttendanceByActivity(activity.id)
          return {
            activity,
            total_participants: attendance.length,
            attendance_summary: this.calculateAttendanceSummary(attendance),
          }
        }),
      )

      return {
        start_date: startDate,
        end_date: endDate,
        total_activities: activities.length,
        activities: reports,
      }
    } catch (error) {
      console.error('Get weekly report error:', error)
      throw new AppError(500, 'Failed to generate weekly report')
    }
  }

  async getMonthlyReport(year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const activities = await this.activityRepository.find({
        where: {
          start_time: Between(startDate, endDate),
          status: Not(ActivityStatus.CANCELLED),
        },
        relations: ['creator'],
        order: {
          start_time: 'ASC',
        },
      })

      const reports = await Promise.all(
        activities.map(async (activity) => {
          const attendance = await this.getAttendanceByActivity(activity.id)
          return {
            activity,
            total_participants: attendance.length,
            attendance_summary: this.calculateAttendanceSummary(attendance),
          }
        }),
      )

      return {
        year,
        month,
        total_activities: activities.length,
        activities: reports,
      }
    } catch (error) {
      console.error('Get monthly report error:', error)
      throw new AppError(500, 'Failed to generate monthly report')
    }
  }

  // Add activity scheduling features
  async getUpcomingActivities(days: number = 7) {
    try {
      const now = new Date()
      const futureDate = new Date(now)
      futureDate.setDate(futureDate.getDate() + days)

      return await this.activityRepository.find({
        where: {
          start_time: Between(now, futureDate),
          status: Not(ActivityStatus.CANCELLED),
        },
        relations: ['creator'],
        order: {
          start_time: 'ASC',
        },
      })
    } catch (error) {
      console.error('Get upcoming activities error:', error)
      throw new AppError(500, 'Failed to fetch upcoming activities')
    }
  }

  // Add bulk attendance recording
  async recordBulkAttendance(
    activityId: string,
    attendanceRecords: Omit<IAttendance, 'activity_id'>[],
  ) {
    try {
      const activity = await this.getActivityById(activityId)
      if (!activity) {
        throw new AppError(404, 'Activity not found')
      }

      const attendanceData = attendanceRecords.map((record) => ({
        ...record,
        activity_id: activityId,
      }))

      // Save to PostgreSQL
      const pgAttendance = await this.attendanceRepository.save(
        this.attendanceRepository.create(attendanceData),
      )

      // Save to MongoDB
      await AttendanceModel.insertMany(attendanceData)

      return pgAttendance
    } catch (error) {
      console.error('Bulk attendance recording error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to record bulk attendance')
    }
  }

  // Add method to count confirmed bookings
  private async getConfirmedBookingsCount(activityId: string): Promise<number> {
    return await this.bookingRepository.count({
      where: {
        activity_id: activityId,
        status: BookingStatus.CONFIRMED,
      },
    })
  }

  // Add method to create attendance record
  private async createAttendanceRecord(
    bookingId: string,
    activityId: string,
  ): Promise<AttendanceEntity> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    })

    if (!booking) {
      throw new AppError(404, 'Booking not found')
    }

    const attendanceData: IAttendance = {
      activity_id: activityId,
      child_id: booking.child_id,
      status: AttendanceStatus.ABSENT, // Default status
      recorded_by: booking.created_by,
    }

    const attendance = this.attendanceRepository.create(attendanceData)
    await this.attendanceRepository.save(attendance)

    return attendance
  }

  // Add method to handle booking confirmations
  async handleBookingConfirmation(bookingId: string, activityId: string) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    })

    if (!activity) {
      throw new AppError(404, 'Activity not found')
    }

    // Update activity capacity
    if (activity.max_participants) {
      const currentBookings = await this.getConfirmedBookingsCount(activityId)
      if (currentBookings >= activity.max_participants) {
        throw new AppError(400, 'Activity is fully booked')
      }
    }

    // Create placeholder attendance record
    await this.createAttendanceRecord(bookingId, activityId)
  }
}
