import { Request } from 'express'

export interface RouteConfig {
  path: string
  service: string
  method: string
  auth: boolean
  rateLimit?: {
    windowMs: number
    max: number
  }
}

export interface ProxyRequest extends Request {
  targetService?: string
  originalPath?: string
}
