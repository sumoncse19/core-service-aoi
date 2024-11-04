export interface CacheConfig {
  enabled: boolean
  ttl: number
  maxSize: number
}

export interface CacheItem<T = unknown> {
  data: T
  expiry: number
}

export interface CacheOptions {
  ttl?: number
  key?: string
}
