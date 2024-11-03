import { Request, Response, NextFunction } from 'express'
import { TrackingService } from './tracking.service'
import AppError from '../shared/errors/AppError'

const trackingService = new TrackingService()

export const validateCapacity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const activityId = req.params.id || req.body.activity_id
    if (!activityId) {
      throw new AppError(400, 'Activity ID is required')
    }

    await trackingService.validateCapacity(activityId)
    next()
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
    } else {
      next(new AppError(400, 'Failed to validate activity capacity'))
    }
  }
}
