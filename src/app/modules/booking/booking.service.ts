import { Between, Repository } from 'typeorm'
import { PostgresDataSource } from '../../config/database'
import {
  BookingEntity,
  PaymentEntity,
  BookingConfirmationEntity,
} from './booking.entity'
import {
  BookingModel,
  PaymentModel,
  BookingConfirmationModel,
} from './booking.model'
import {
  IBooking,
  IPayment,
  IBookingConfirmation,
  IAvailability,
} from './booking.interface'
import { ActivityEntity } from '../tracking/tracking.entity'
import { ChildEntity } from '../child/child.entity'
import AppError from '../shared/errors/AppError'
import {
  BookingStatus,
  PaymentStatus,
  ActivityStatus,
} from '../shared/enumeration'
import { generateConfirmationCode } from '../../utils/generators'
import { TrackingService } from '../tracking/tracking.service'
import {
  IActivityParticipation,
  IActivityEligibility,
} from '../shared/interfaces/common.interface'

// Add these type definitions for activity metadata
interface ActivityMetadata {
  minAge?: number
  maxAge?: number
  requiredMedical?: boolean
  specialNeeds?: string[]
  waitlistEnabled?: boolean
}

export class BookingService {
  private bookingRepository: Repository<BookingEntity>
  private paymentRepository: Repository<PaymentEntity>
  private confirmationRepository: Repository<BookingConfirmationEntity>
  private activityRepository: Repository<ActivityEntity>
  private childRepository: Repository<ChildEntity>
  private trackingService: TrackingService

  constructor() {
    this.bookingRepository = PostgresDataSource.getRepository(BookingEntity)
    this.paymentRepository = PostgresDataSource.getRepository(PaymentEntity)
    this.confirmationRepository = PostgresDataSource.getRepository(
      BookingConfirmationEntity,
    )
    this.activityRepository = PostgresDataSource.getRepository(ActivityEntity)
    this.childRepository = PostgresDataSource.getRepository(ChildEntity)
    this.trackingService = new TrackingService()
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

  private async validateChild(childId: string, parentId?: string) {
    const query = this.childRepository
      .createQueryBuilder('child')
      .where('child.id = :childId', { childId })
      .andWhere('child.is_active = :isActive', { isActive: true })

    if (parentId) {
      query.andWhere('child.parent_id = :parentId', { parentId })
    }

    const child = await query.getOne()
    if (!child) {
      throw new AppError(404, 'Child not found or not authorized')
    }
    return child
  }

  async checkAvailability(
    activityId: string,
    date: Date,
  ): Promise<IAvailability> {
    const activity = await this.validateActivity(activityId)

    const bookings = await this.bookingRepository.count({
      where: {
        activity_id: activityId,
        start_date: Between(
          new Date(date.setHours(0, 0, 0, 0)),
          new Date(date.setHours(23, 59, 59, 999)),
        ),
        status: BookingStatus.CONFIRMED,
      },
    })

    const totalSpots = activity.max_participants || 0
    const bookedSpots = bookings
    const availableSpots = totalSpots === 0 ? -1 : totalSpots - bookedSpots

    return {
      activity_id: activityId,
      date: date,
      total_spots: totalSpots,
      booked_spots: bookedSpots,
      available_spots: availableSpots,
    }
  }

  private async createBookingConfirmation(
    bookingId: string,
  ): Promise<BookingConfirmationEntity> {
    const confirmationData: IBookingConfirmation = {
      booking_id: bookingId,
      confirmation_code: generateConfirmationCode(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: BookingStatus.PENDING,
    }

    const pgConfirmation = this.confirmationRepository.create(confirmationData)
    await this.confirmationRepository.save(pgConfirmation)

    try {
      const mongoConfirmation = new BookingConfirmationModel({
        ...confirmationData,
        _id: pgConfirmation.id,
      })
      await mongoConfirmation.save()
    } catch (mongoError) {
      console.error('MongoDB save error:', mongoError)
    }

    return pgConfirmation
  }

  async syncBookingWithAttendance(bookingId: string): Promise<void> {
    const booking = await this.getBookingById(bookingId)
    if (booking.status === BookingStatus.CONFIRMED) {
      // Create attendance record in tracking service
      // This would require integration with tracking service
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date()
    let age = today.getFullYear() - dateOfBirth.getFullYear()
    const monthDiff = today.getMonth() - dateOfBirth.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age--
    }

    return age
  }

  private async validateChildEligibility(childId: string, activityId: string) {
    const child = await this.childRepository.findOne({
      where: { id: childId, is_active: true },
    })
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    })

    if (!child || !activity) {
      throw new AppError(404, 'Child or activity not found')
    }

    // Type cast metadata to our interface
    const metadata = activity.metadata as ActivityMetadata

    // Check age restrictions if any
    const childAge = this.calculateAge(child.date_of_birth)
    if (metadata?.minAge && childAge < metadata.minAge) {
      throw new AppError(400, 'Child does not meet minimum age requirement')
    }

    return true
  }
  async createBooking(bookingData: IBooking): Promise<BookingEntity> {
    try {
      // First check activity availability in tracking service
      const activityDetails = await this.trackingService.getActivityById(
        bookingData.activity_id,
      )

      // Validate activity status
      if (activityDetails.status !== ActivityStatus.SCHEDULED) {
        throw new AppError(
          400,
          `Cannot book - activity is ${activityDetails.status}`,
        )
      }

      // Check child eligibility
      await this.validateChildEligibility(
        bookingData.child_id,
        bookingData.activity_id,
      )

      // Then check booking availability
      const availability = await this.checkAvailability(
        bookingData.activity_id,
        bookingData.start_date,
      )

      // Create booking if available
      await this.validateActivity(bookingData.activity_id)
      await this.validateChild(bookingData.child_id, bookingData.parent_id)

      if (availability.available_spots === 0) {
        throw new AppError(400, 'No available spots for this activity')
      }

      // Save to PostgreSQL
      const pgBooking = this.bookingRepository.create(bookingData)
      await this.bookingRepository.save(pgBooking)

      // Save to MongoDB
      try {
        const mongoBooking = new BookingModel({
          ...bookingData,
          _id: pgBooking.id,
        })
        await mongoBooking.save()
      } catch (mongoError) {
        console.error('MongoDB save error:', mongoError)
      }

      // Create booking confirmation
      await this.createBookingConfirmation(pgBooking.id)

      // Sync with tracking service
      await this.syncBookingWithAttendance(pgBooking.id)

      return pgBooking
    } catch (error) {
      console.error('Create booking error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to create booking')
    }
  }

  async getBookings(filters?: Partial<IBooking>): Promise<BookingEntity[]> {
    try {
      return await this.bookingRepository.find({
        where: filters,
        relations: ['activity', 'child', 'creator'],
        order: { created_at: 'DESC' },
      })
    } catch (error) {
      console.error('Get bookings error:', error)
      throw new AppError(500, 'Failed to fetch bookings')
    }
  }

  async getBookingById(id: string): Promise<BookingEntity> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['activity', 'child', 'creator'],
      })
      if (!booking) {
        throw new AppError(404, 'Booking not found')
      }
      return booking
    } catch (error) {
      console.error('Get booking error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(500, 'Failed to fetch booking')
    }
  }

  async updateBooking(
    id: string,
    updateData: Partial<IBooking>,
  ): Promise<BookingEntity> {
    try {
      const booking = await this.getBookingById(id)

      const updatedBooking = this.bookingRepository.create({
        ...booking,
        ...updateData,
      })
      await this.bookingRepository.save(updatedBooking)

      try {
        await BookingModel.findByIdAndUpdate(id, { $set: updateData })
      } catch (mongoError) {
        console.error('MongoDB update error:', mongoError)
      }

      return this.getBookingById(id)
    } catch (error) {
      console.error('Update booking error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to update booking')
    }
  }

  async deleteBooking(id: string): Promise<void> {
    try {
      const result = await this.bookingRepository.delete(id)
      if (!result.affected) {
        throw new AppError(404, 'Booking not found')
      }

      await BookingModel.findByIdAndDelete(id)
      await this.confirmationRepository.delete({ booking_id: id })
      await BookingConfirmationModel.deleteMany({ booking_id: id })
    } catch (error) {
      console.error('Delete booking error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to delete booking')
    }
  }

  async createPayment(paymentData: IPayment): Promise<PaymentEntity> {
    try {
      const booking = await this.getBookingById(paymentData.booking_id)

      // Validate payment amount
      const remainingAmount = booking.total_amount - booking.paid_amount
      if (paymentData.amount > remainingAmount) {
        throw new AppError(400, 'Payment amount exceeds remaining balance')
      }

      // Save to PostgreSQL
      const pgPayment = this.paymentRepository.create(paymentData)
      await this.paymentRepository.save(pgPayment)

      // Update booking payment status
      const newPaidAmount = booking.paid_amount + paymentData.amount
      const newPaymentStatus =
        newPaidAmount >= booking.total_amount
          ? PaymentStatus.PAID
          : PaymentStatus.PARTIALLY_PAID

      await this.updateBooking(booking.id, {
        paid_amount: newPaidAmount,
        payment_status: newPaymentStatus,
      })

      // Save to MongoDB
      try {
        const mongoPayment = new PaymentModel({
          ...paymentData,
          _id: pgPayment.id,
        })
        await mongoPayment.save()
      } catch (mongoError) {
        console.error('MongoDB save error:', mongoError)
      }

      return pgPayment
    } catch (error) {
      console.error('Create payment error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to create payment')
    }
  }

  async getPaymentsByBooking(bookingId: string): Promise<PaymentEntity[]> {
    try {
      return await this.paymentRepository.find({
        where: { booking_id: bookingId },
        relations: ['booking'],
        order: { payment_date: 'DESC' },
      })
    } catch (error) {
      console.error('Get payments error:', error)
      throw new AppError(500, 'Failed to fetch payments')
    }
  }

  async confirmBooking(id: string): Promise<BookingEntity> {
    try {
      const booking = await this.getBookingById(id)
      if (booking.status !== BookingStatus.PENDING) {
        throw new AppError(400, 'Booking is not in pending status')
      }

      // First update booking status
      const updatedBooking = await this.updateBooking(id, {
        status: BookingStatus.CONFIRMED,
      })

      // Then handle the confirmation in tracking service
      try {
        await this.trackingService.handleBookingConfirmation(
          booking.id,
          booking.activity_id,
        )
      } catch (error) {
        console.error(
          'Failed to handle booking confirmation in tracking service:',
          error,
        )
        // Optionally revert booking status if tracking service fails
        await this.updateBooking(id, { status: BookingStatus.PENDING })
        throw new AppError(500, 'Failed to confirm booking')
      }

      return updatedBooking
    } catch (error) {
      console.error('Confirm booking error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to confirm booking')
    }
  }

  async getConfirmationStatus(id: string): Promise<BookingConfirmationEntity> {
    try {
      const confirmation = await this.confirmationRepository.findOne({
        where: { booking_id: id },
        relations: ['booking'],
      })
      if (!confirmation) {
        throw new AppError(404, 'Booking confirmation not found')
      }
      return confirmation
    } catch (error) {
      console.error('Get confirmation status error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(500, 'Failed to fetch confirmation status')
    }
  }

  async validateBookingWithActivity(
    activityId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    })

    if (!activity) {
      throw new AppError(404, 'Activity not found')
    }

    // Validate booking time matches activity schedule
    if (startDate < activity.start_time || endDate > activity.end_time) {
      throw new AppError(400, 'Booking time must be within activity schedule')
    }

    // Check activity status
    if (activity.status !== ActivityStatus.SCHEDULED) {
      throw new AppError(400, `Cannot book - activity is ${activity.status}`)
    }

    return activity
  }

  async createRecurringBooking(
    bookingData: IBooking & { recurrence: { frequency: string; until: Date } },
  ): Promise<BookingEntity[]> {
    try {
      const bookings: BookingEntity[] = []
      const { recurrence, ...baseBooking } = bookingData
      const startDate = new Date(baseBooking.start_date)
      const endDate = new Date(recurrence.until)

      while (startDate <= endDate) {
        const newBooking = {
          ...baseBooking,
          start_date: new Date(startDate),
          end_date: new Date(startDate.setHours(startDate.getHours() + 2)), // Assuming 2-hour duration
        }

        const booking = await this.createBooking(newBooking)
        bookings.push(booking)

        // Increment date based on frequency
        switch (recurrence.frequency) {
          case 'daily':
            startDate.setDate(startDate.getDate() + 1)
            break
          case 'weekly':
            startDate.setDate(startDate.getDate() + 7)
            break
          case 'monthly':
            startDate.setMonth(startDate.getMonth() + 1)
            break
          default:
            throw new AppError(400, 'Invalid recurrence frequency')
        }
      }

      return bookings
    } catch (error) {
      console.error('Create recurring booking error:', error)
      if (error instanceof AppError) throw error
      throw new AppError(400, 'Failed to create recurring booking')
    }
  }

  // Fix the getBookingParticipation method
  async getBookingParticipation(
    bookingId: string,
  ): Promise<IActivityParticipation> {
    const booking = await this.getBookingById(bookingId)

    return {
      booking_id: booking.id,
      child_id: booking.child_id,
      activity_id: booking.activity_id,
      status: booking.status,
      payment_status: booking.payment_status,
    }
  }

  // Fix the checkActivityEligibility method
  async checkActivityEligibility(
    activityId: string,
  ): Promise<IActivityEligibility> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    })

    if (!activity) {
      throw new AppError(404, 'Activity not found')
    }

    // Type cast metadata to our interface
    const metadata = activity.metadata as ActivityMetadata

    return {
      minAge: metadata?.minAge,
      maxAge: metadata?.maxAge,
      requiredMedical: metadata?.requiredMedical || false,
      specialNeeds: metadata?.specialNeeds || [],
      capacity: activity.max_participants || 0, // Default to 0 if undefined
      waitlistEnabled: metadata?.waitlistEnabled || false,
    }
  }
}
