import express, { Express } from 'express'
import { Server } from 'http'
import { LoadBalancer } from './load-balancer/load.balancer'
import { CacheService } from './cache/cache.service'
import { ApiRouter } from './routing/router'
import { ServiceRegistry } from './registry/service.registry'
import { LoadBalancerStrategy } from './types/load-balancer.types'
import { cacheMiddleware } from './routing/middleware/cache.middleware'

interface GatewayConfig {
  port: number
  redis: {
    host: string
    port: number
  }
  loadBalancer: {
    strategy: LoadBalancerStrategy
    healthCheck: {
      enabled: boolean
      interval: number
    }
  }
  cache: {
    enabled: boolean
    ttl: number
    maxSize: number
  }
}

export class ApiGateway {
  public app: Express
  private port: number
  private loadBalancer: LoadBalancer
  private cacheService: CacheService
  private registry: ServiceRegistry
  private server: Server | null = null

  constructor(config: GatewayConfig) {
    this.port = config.port
    this.app = express()
    this.registry = new ServiceRegistry()
    this.loadBalancer = new LoadBalancer(
      {
        strategy: config.loadBalancer.strategy,
        healthCheck: {
          enabled: config.loadBalancer.healthCheck.enabled,
          interval: config.loadBalancer.healthCheck.interval,
          timeout: 5000,
          unhealthyThreshold: 3,
        },
      },
      this.registry,
    )
    this.cacheService = new CacheService({
      enabled: config.cache.enabled,
      ttl: config.cache.ttl,
      maxSize: config.cache.maxSize || 1000,
    })
    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cacheMiddleware(this.cacheService))
  }

  private setupRoutes(): void {
    const apiRouter = new ApiRouter(this.loadBalancer, this.cacheService)
    this.app.use('/api', apiRouter.getRouter())

    this.app.delete('/cache/invalidate/:pattern', async (req, res) => {
      const success = await this.cacheService.invalidatePattern(
        req.params.pattern,
      )
      res.json({ success })
    })

    this.app.delete('/cache/clear', async (_, res) => {
      const success = await this.cacheService.clear()
      res.json({ success })
    })
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`Gateway running on port ${this.port}`)
        resolve()
      })
    })
  }

  private async cleanup(): Promise<void> {
    if (this.cacheService) {
      await this.cacheService.redis.quit()
    }
    if (this.registry) {
      await this.registry.closeConnection()
    }
    if (this.loadBalancer) {
      clearInterval(this.loadBalancer.healthCheckInterval)
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.cleanup()
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server?.close(() => resolve())
        })
      }
    } catch (error) {
      console.error('Error during gateway shutdown:', error)
    }
  }
}
