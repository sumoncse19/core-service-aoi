import { Router } from 'express'
import { RouteConfig, ProxyRequest } from '../types/routing.types'
import { ProxyHandler } from './handlers/proxy.handler'
import { LoadBalancer } from '../load-balancer/load.balancer'
import { CacheService } from '../cache/cache.service'
import { validateAuth } from './middleware/auth.middleware'
import { rateLimitMiddleware } from './middleware/rate-limit.middleware'
import { cacheMiddleware } from './middleware/cache.middleware'
import { gatewayConfig } from '../config/gateway.config'

export class ApiRouter {
  private router: Router
  private proxyHandler: ProxyHandler

  constructor(loadBalancer: LoadBalancer, cacheService: CacheService) {
    this.router = Router()
    this.proxyHandler = new ProxyHandler(loadBalancer)
    this.router.use(cacheMiddleware(cacheService))
    this.setupRoutes()
  }

  private setupRoutes(): void {
    // Add service registry routes
    this.router.post('/registry/services', async (req, res) => {
      try {
        await this.proxyHandler.addServiceInstance(req.body.name, {
          id: req.body.name + Date.now(),
          url: req.body.url,
          weight: 1,
          currentConnections: 0,
        })
        res.status(201).json({ success: true })
      } catch (error) {
        if (error instanceof Error) {
          res.status(500).json({ success: false, error: error.message })
        } else {
          res
            .status(500)
            .json({ success: false, error: 'An unknown error occurred' })
        }
      }
    })

    // Service routes
    this.addServiceRoutes([
      {
        path: '/test-service/*',
        service: 'test-service',
        method: 'GET',
        auth: false,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 100,
        },
      },
      // Tracking Service Routes
      {
        path: '/tracking/*',
        service: gatewayConfig.services.tracking.name,
        method: 'GET',
        auth: true,
      },
      // Booking Service Routes
      {
        path: '/booking/*',
        service: gatewayConfig.services.booking.name,
        method: 'GET',
        auth: true,
      },
      // Child Service Routes
      {
        path: '/children/*',
        service: gatewayConfig.services.child.name,
        method: 'GET',
        auth: true,
      },
    ])
  }

  private addServiceRoutes(routes: RouteConfig[]): void {
    routes.forEach((route) => {
      const middleware = []

      if (route.auth) {
        middleware.push(validateAuth)
      }

      if (route.rateLimit) {
        middleware.push(rateLimitMiddleware(route.rateLimit))
      }

      this.router.use(
        route.path,
        ...middleware,
        (req: ProxyRequest, _, next) => {
          req.targetService = route.service
          req.originalPath = req.path
          next()
        },
        this.proxyHandler.handleProxy,
      )
    })
  }

  getRouter(): Router {
    return this.router
  }
}
