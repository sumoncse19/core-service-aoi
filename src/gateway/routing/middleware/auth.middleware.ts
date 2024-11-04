import { Response, NextFunction } from 'express'
import { ProxyRequest } from '../../types/routing.types'
import { clerk } from '../../../app/config/clerk'
import AppError from '../../../app/modules/shared/errors/AppError'

export const validateAuth = async (
  req: ProxyRequest,
  _: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new AppError(401, 'Authentication required')
    }

    const sessionId = req.headers['x-session-id'] as string
    const session = await clerk.sessions.verifySession(sessionId, token)

    if (!session) {
      throw new AppError(401, 'Invalid or expired session')
    }

    next()
  } catch (error) {
    next(error)
  }
}
