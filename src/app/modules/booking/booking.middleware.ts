import { Request, Response, NextFunction } from 'express'
import { BookingService } from './booking.service'
import AppError from '../shared/errors/AppError'
import { UserRole } from '../shared/enumeration'
import { AuthRequest } from '../../types/express'

const bookingService = new BookingService()

export const checkAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { activity_id, start_date } = req.body

    const availability = await bookingService.checkAvailability(
      activity_id,
      new Date(start_date),
    )

    if (availability.available_spots === 0) {
      throw new AppError(400, 'No available spots for this activity')
    }

    next()
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
    } else {
      next(new AppError(400, 'Failed to check activity availability'))
    }
  }
}

// Add additional middleware
export const validateBookingOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthRequest
    const booking = await bookingService.getBookingById(req.params.id)

    if (
      booking.parent_id !== authReq.auth?.userId &&
      !authReq.auth?.roles.includes(UserRole.ADMIN)
    ) {
      throw new AppError(403, 'Not authorized to access this booking')
    }

    next()
  } catch (error) {
    next(error)
  }
}
