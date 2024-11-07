import { Request } from 'express'
import { RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { UserRole } from '../modules/shared/enumeration'

export interface AuthRequest extends Request {
  auth?: {
    userId: string
    roles: UserRole[]
    user_name: string
  }
}

export interface RequestWithAuth extends Request {
  auth?: {
    userId: string
    roles: UserRole[]
    user_name: string
  }
}

export type AuthRequestHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
> = RequestHandler<P, ResBody, ReqBody, ReqQuery>

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string
        roles: UserRole[]
        user_name: string
      }
    }
  }
}
