import Redis from 'ioredis'
import { CacheConfig, CacheOptions } from '../types/cache.types'

export class CacheService {
  public readonly redis: Redis
  private readonly config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = config
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          return null // Stop retrying
        }
        return Math.min(times * 50, 2000) // Exponential backoff
      },
      enableOfflineQueue: false,
    })

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) return null

    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {},
  ): Promise<boolean> {
    if (!this.config.enabled) return false

    try {
      const ttl = options.ttl || this.config.ttl
      const value = JSON.stringify(data)

      if (ttl > 0) {
        await this.redis.setex(key, ttl, value)
      } else {
        await this.redis.set(key, value)
      }

      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async invalidate(key: string): Promise<boolean> {
    if (!this.config.enabled) return false

    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error('Cache invalidate error:', error)
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    if (!this.config.enabled) return false

    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error('Cache invalidate pattern error:', error)
      return false
    }
  }

  async clear(): Promise<boolean> {
    if (!this.config.enabled) return false

    try {
      await this.redis.flushdb()
      return true
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  }
}
