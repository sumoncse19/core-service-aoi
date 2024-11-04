import { Response, NextFunction } from 'express'
import { clerk } from '../config/clerk'
import AppError from '../modules/shared/errors/AppError'
import { UserRole } from '../modules/shared/enumeration'
import { SessionModel } from '../modules/session/session.model'
import { AuthRequest } from '../types/express'

export const validateSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new AppError(401, 'Please login first')
    }

    // Verify session in MongoDB
    const session = await SessionModel.findOne({ token })
    if (!session) {
      throw new AppError(401, 'Your session has expired. Please login again')
    }

    // Verify with Clerk
    const clerkUser = await clerk.users.getUser(session.clerkUserId)
    if (!clerkUser) {
      throw new AppError(401, 'Authentication failed. Please login again')
    }

    // Set auth information
    req.auth = {
      userId: clerkUser.id,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      user_name: clerkUser.username || '',
      email: clerkUser.emailAddresses[0].emailAddress || '',
      role: clerkUser.publicMetadata.role as string,
    }

    next()
  } catch (error) {
    // If it's already an AppError, pass it through
    if (error instanceof AppError) {
      next(error)
      return
    }

    // For any other errors, return a generic message
    next(new AppError(401, 'Your token is invalid. Please login first'))
  }
}

export const requireRole = (allowedRoles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId) {
        throw new AppError(401, 'Please login first')
      }

      const user = await clerk.users.getUser(req.auth.userId)
      const userRole = user.publicMetadata.role as UserRole

      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new AppError(
          403,
          'You do not have permission to access this resource',
        )
      }

      next()
    } catch (error) {
      if (error instanceof AppError) {
        next(error)
        return
      }
      next(new AppError(401, 'Authentication failed. Please login again'))
    }
  }
}
