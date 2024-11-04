import { Response, NextFunction } from 'express'
import { ProxyRequest } from '../../types/routing.types'
import { CacheService } from '../../cache/cache.service'

export const cacheMiddleware = (cacheService: CacheService) => {
  return async (req: ProxyRequest, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next()
    }

    const cacheKey = `${req.targetService}:${req.originalPath}`
    const cachedData = await cacheService.get(cacheKey)

    if (cachedData) {
      res.setHeader('x-cache', 'HIT')
      return res.json(cachedData)
    }

    res.setHeader('x-cache', 'MISS')

    // Store original send function
    const originalSend = res.send

    // Override send function to cache response
    res.send = function (body: unknown): Response {
      // Cache the response before sending
      void cacheService.set(cacheKey, body).then(() => {
        // Optionally log cache set result
        console.debug(`Cached response for ${cacheKey}`)
      })

      return originalSend.call(this, body)
    }

    next()
  }
}
