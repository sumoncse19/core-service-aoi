/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import { ERROR } from '../modules/shared/api.response.types'
import httpStatus from 'http-status'
import config from '../config'
import { UserRole } from '../modules/shared/enumeration'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { UserModel } from '../modules/user/user.model'

const requireAuth = (...requiredRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization

      const token = authHeader?.split(' ')[1]

      // Check if the token is missing
      if (!token) {
        return ERROR(
          res,
          httpStatus.UNAUTHORIZED,
          'You are not authorized!',
          [],
        )
      }

      // Verify if the given token is valid
      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload

      const { role, userId } = decoded

      // Check if the user exists
      const user = await UserModel.findById(userId)

      if (!user) {
        return ERROR(res, httpStatus.NOT_FOUND, 'This user is not found!', [])
      }

      // Check if the user is already deleted
      if (user.isDeleted) {
        return ERROR(res, httpStatus.FORBIDDEN, 'This user is deleted!', [])
      }

      // Check if the user's role is in the required roles
      if (requiredRoles.length && !requiredRoles.includes(role as UserRole)) {
        return ERROR(
          res,
          httpStatus.UNAUTHORIZED,
          'You have no access to this route',
        )
      }

      // Attach the user info to the request object
      req.user = decoded as JwtPayload & { role: string }
      next()
    } catch (err: any) {
      return ERROR(
        res,
        httpStatus.UNAUTHORIZED,
        err.message || 'Authentication failed!',
        [],
        err.stack,
      )
    }
  }
}

export default requireAuth
