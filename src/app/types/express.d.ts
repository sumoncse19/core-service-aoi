import { Request } from 'express'
import { ClerkUser } from '@clerk/clerk-sdk-node'
import { RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'

export interface AuthRequest extends Request {
  auth?: ClerkUser
  user?: {
    userId: string
    role: string
    user_name: string
  }
}

export type AuthRequestHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
> = RequestHandler<P, ResBody, ReqBody, ReqQuery>
