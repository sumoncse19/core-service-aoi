import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string
        role: string
        user_name: string
      }
      user?: JwtPayload
    }
  }
}

export interface AuthRequest extends Request {
  auth?: {
    userId: string
    role: string
    user_name: string
  }
}
