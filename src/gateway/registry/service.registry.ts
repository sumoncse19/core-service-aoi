import { ServiceInfo } from '../types/gateway.types'
import Redis from 'ioredis'

export class ServiceRegistry {
  private redis: Redis
  private readonly REGISTRY_KEY = 'services:registry'

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    })
  }

  public async closeConnection(): Promise<void> {
    await this.redis.quit()
  }

  async registerService(service: ServiceInfo): Promise<void> {
    try {
      await this.redis.hset(
        this.REGISTRY_KEY,
        service.id,
        JSON.stringify(service),
      )
    } catch (error) {
      console.error('Service registration failed:', error)
      throw error
    }
  }

  async deregisterService(serviceId: string): Promise<void> {
    try {
      await this.redis.hdel(this.REGISTRY_KEY, serviceId)
    } catch (error) {
      console.error('Service deregistration failed:', error)
      throw error
    }
  }

  async getAllServices(): Promise<ServiceInfo[]> {
    try {
      const services = await this.redis.hgetall(this.REGISTRY_KEY)
      return Object.values(services).map((service) => JSON.parse(service))
    } catch (error) {
      console.error('Failed to get services:', error)
      throw error
    }
  }

  async getServiceById(serviceId: string): Promise<ServiceInfo | null> {
    try {
      const service = await this.redis.hget(this.REGISTRY_KEY, serviceId)
      return service ? JSON.parse(service) : null
    } catch (error) {
      console.error('Failed to get service:', error)
      throw error
    }
  }
}
