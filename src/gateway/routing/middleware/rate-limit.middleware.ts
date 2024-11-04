import rateLimitExpress from 'express-rate-limit'
import { RouteConfig } from '../../types/routing.types'

export const rateLimitMiddleware = (
  config: Required<RouteConfig>['rateLimit'],
) => {
  return rateLimitExpress({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_, res) => {
      res.status(429).json({
        status: 'error',
        message: 'Too many requests, please try again later.',
      })
    },
  })
}
