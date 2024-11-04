import express, { RequestHandler } from 'express'
import { UserRole } from '../shared/enumeration'
import validateRequest from '../../middleware/validateRequest'
import {
  createBookingSchema,
  updateBookingSchema,
  createPaymentSchema,
  checkAvailabilitySchema,
  createRecurringBookingSchema,
} from './booking.schema'
import { requireRole, validateSession } from '../../middleware/auth.middleware'
import { BookingController } from './booking.controller'
import { checkAvailability } from './booking.middleware'

const router = express.Router()
const bookingController = new BookingController()

// Booking routes
router.post(
  '/bookings',
  validateSession as unknown as RequestHandler,
  validateRequest(createBookingSchema),
  checkAvailability as unknown as RequestHandler,
  bookingController.createBooking,
)

router.get(
  '/bookings',
  validateSession as unknown as RequestHandler,
  bookingController.getBookings,
)

router.get(
  '/bookings/:id',
  validateSession as unknown as RequestHandler,
  bookingController.getBookingById,
)

router.patch(
  '/bookings/:id',
  validateSession as unknown as RequestHandler,
  validateRequest(updateBookingSchema),
  bookingController.updateBooking,
)

router.delete(
  '/bookings/:id',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.ADMIN]) as unknown as RequestHandler,
  bookingController.deleteBooking,
)

// Payment routes
router.post(
  '/payments',
  validateSession as unknown as RequestHandler,
  validateRequest(createPaymentSchema),
  bookingController.createPayment,
)

router.get(
  '/payments/booking/:bookingId',
  validateSession as unknown as RequestHandler,
  bookingController.getPaymentsByBooking,
)

// Availability routes
router.get(
  '/availability',
  validateSession as unknown as RequestHandler,
  validateRequest(checkAvailabilitySchema),
  bookingController.checkAvailability,
)

// Confirmation routes
router.post(
  '/bookings/:id/confirm',
  validateSession as unknown as RequestHandler,
  bookingController.confirmBooking,
)

router.get(
  '/bookings/:id/confirmation-status',
  validateSession as unknown as RequestHandler,
  bookingController.getConfirmationStatus,
)

// Add these new routes
router.post(
  '/bookings/recurring',
  validateSession as unknown as RequestHandler,
  validateRequest(createRecurringBookingSchema),
  checkAvailability as unknown as RequestHandler,
  bookingController.createRecurringBooking,
)

router.get(
  '/bookings/:id/participation',
  validateSession as unknown as RequestHandler,
  bookingController.getBookingParticipation,
)

router.get(
  '/activities/:id/eligibility',
  validateSession as unknown as RequestHandler,
  bookingController.checkActivityEligibility,
)

export const BookingRoutes = router
