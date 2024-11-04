import { Request, Response } from 'express'
import { BookingService } from './booking.service'
import catchAsync from '../../utils/catchAsync'
import { AuthRequest } from '../../types/express'

export class BookingController {
  private bookingService: BookingService

  constructor() {
    this.bookingService = new BookingService()
  }

  /**
   * @swagger
   * /booking/bookings:
   *   post:
   *     summary: Create a new booking
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               child_id:
   *                 type: string
   *                 format: uuid
   *               activity_id:
   *                 type: string
   *                 format: uuid
   *               start_date:
   *                 type: string
   *                 format: date-time
   *               end_date:
   *                 type: string
   *                 format: date-time
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Booking created successfully
   *       400:
   *         description: Bad request
   */
  createBooking = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const booking = await this.bookingService.createBooking({
      ...req.body,
      created_by: authReq.auth?.userId,
      parent_id: authReq.auth?.userId,
    })

    res.status(201).json({
      success: true,
      data: booking,
    })
  })

  /**
   * @swagger
   * /booking/bookings:
   *   get:
   *     summary: Get all bookings
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of bookings
   */
  getBookings = catchAsync(async (req: Request, res: Response) => {
    const bookings = await this.bookingService.getBookings()

    res.status(200).json({
      success: true,
      data: bookings,
    })
  })

  /**
   * @swagger
   * /booking/bookings/{id}:
   *   get:
   *     summary: Get booking by ID
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The booking ID
   *     responses:
   *       200:
   *         description: Booking details
   *       404:
   *         description: Booking not found
   */
  getBookingById = catchAsync(async (req: Request, res: Response) => {
    const booking = await this.bookingService.getBookingById(req.params.id)

    res.status(200).json({
      success: true,
      data: booking,
    })
  })

  /**
   * @swagger
   * /booking/bookings/{id}:
   *   patch:
   *     summary: Update booking
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The booking ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, confirmed, cancelled, completed, no_show, waitlist]
   *               payment_status:
   *                 type: string
   *                 enum: [pending, paid, partially_paid, refunded, failed, cancelled]
   *               notes:
   *                 type: string
   *     responses:
   *       200:
   *         description: Booking updated successfully
   *       404:
   *         description: Booking not found
   */
  updateBooking = catchAsync(async (req: Request, res: Response) => {
    const booking = await this.bookingService.updateBooking(
      req.params.id,
      req.body,
    )

    res.status(200).json({
      success: true,
      data: booking,
    })
  })

  /**
   * @swagger
   * /booking/bookings/{id}:
   *   delete:
   *     summary: Delete booking
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The booking ID
   *     responses:
   *       200:
   *         description: Booking deleted successfully
   *       404:
   *         description: Booking not found
   */
  deleteBooking = catchAsync(async (req: Request, res: Response) => {
    await this.bookingService.deleteBooking(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    })
  })

  /**
   * @swagger
   * /booking/payments:
   *   post:
   *     summary: Create a new payment
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               booking_id:
   *                 type: string
   *                 format: uuid
   *               amount:
   *                 type: number
   *               payment_method:
   *                 type: string
   *               transaction_id:
   *                 type: string
   *     responses:
   *       201:
   *         description: Payment created successfully
   *       400:
   *         description: Bad request
   */
  createPayment = catchAsync(async (req: Request, res: Response) => {
    const payment = await this.bookingService.createPayment(req.body)

    res.status(201).json({
      success: true,
      data: payment,
    })
  })

  /**
   * @swagger
   * /booking/payments/booking/{bookingId}:
   *   get:
   *     summary: Get payments by booking
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: bookingId
   *         required: true
   *         schema:
   *           type: string
   *         description: The booking ID
   *     responses:
   *       200:
   *         description: List of payments
   */
  getPaymentsByBooking = catchAsync(async (req: Request, res: Response) => {
    const payments = await this.bookingService.getPaymentsByBooking(
      req.params.bookingId,
    )

    res.status(200).json({
      success: true,
      data: payments,
    })
  })

  /**
   * @swagger
   * /booking/availability:
   *   get:
   *     summary: Check activity availability
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: activity_id
   *         required: true
   *         schema:
   *           type: string
   *         description: The activity ID
   *       - in: query
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: The date to check availability
   *     responses:
   *       200:
   *         description: Availability information
   */
  checkAvailability = catchAsync(async (req: Request, res: Response) => {
    const { activity_id, date } = req.query
    const availability = await this.bookingService.checkAvailability(
      activity_id as string,
      new Date(date as string),
    )

    res.status(200).json({
      success: true,
      data: availability,
    })
  })

  /**
   * @swagger
   * /booking/bookings/{id}/confirm:
   *   post:
   *     summary: Confirm a booking
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The booking ID
   *     responses:
   *       200:
   *         description: Booking confirmed successfully
   *       404:
   *         description: Booking not found
   */
  confirmBooking = catchAsync(async (req: Request, res: Response) => {
    const booking = await this.bookingService.confirmBooking(req.params.id)

    res.status(200).json({
      success: true,
      data: booking,
    })
  })

  /**
   * @swagger
   * /booking/bookings/{id}/confirmation-status:
   *   get:
   *     summary: Get booking confirmation status
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The booking ID
   *     responses:
   *       200:
   *         description: Booking confirmation status
   *       404:
   *         description: Booking confirmation not found
   */
  getConfirmationStatus = catchAsync(async (req: Request, res: Response) => {
    const confirmation = await this.bookingService.getConfirmationStatus(
      req.params.id,
    )

    res.status(200).json({
      success: true,
      data: confirmation,
    })
  })

  /**
   * @swagger
   * /booking/bookings/recurring:
   *   post:
   *     summary: Create recurring bookings
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               child_id:
   *                 type: string
   *               activity_id:
   *                 type: string
   *               start_date:
   *                 type: string
   *                 format: date-time
   *               recurrence:
   *                 type: object
   *                 properties:
   *                   frequency:
   *                     type: string
   *                     enum: [daily, weekly, monthly]
   *                   until:
   *                     type: string
   *                     format: date
   *     responses:
   *       201:
   *         description: Recurring bookings created successfully
   *       400:
   *         description: Bad request
   */
  createRecurringBooking = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const bookings = await this.bookingService.createRecurringBooking({
      ...req.body,
      created_by: authReq.auth?.userId,
      parent_id: authReq.auth?.userId,
    })

    res.status(201).json({
      success: true,
      data: bookings,
    })
  })

  /**
   * @swagger
   * /booking/bookings/{id}/participation:
   *   get:
   *     summary: Get booking participation details
   *     tags: [Bookings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Booking participation details
   *       404:
   *         description: Booking not found
   */
  getBookingParticipation = catchAsync(async (req: Request, res: Response) => {
    const participation = await this.bookingService.getBookingParticipation(
      req.params.id,
    )

    res.status(200).json({
      success: true,
      data: participation,
    })
  })

  /**
   * @swagger
   * /booking/activities/{id}/eligibility:
   *   get:
   *     summary: Check activity eligibility criteria
   *     tags: [Activities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Activity eligibility criteria
   *       404:
   *         description: Activity not found
   */
  checkActivityEligibility = catchAsync(async (req: Request, res: Response) => {
    const eligibility = await this.bookingService.checkActivityEligibility(
      req.params.id,
    )

    res.status(200).json({
      success: true,
      data: eligibility,
    })
  })
}
