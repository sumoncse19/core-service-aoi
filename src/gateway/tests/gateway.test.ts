import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from '@jest/globals'
import request from 'supertest'
import { ApiGateway } from '../gateway'
import { Server } from 'http'
import { servers } from './mock-service'

// Mock Redis with proper type safety
jest.mock('ioredis', () => {
  const cache = new Map<string, string>()

  const mockRedis = {
    get: jest.fn(async (key: unknown) => cache.get(String(key))),
    set: jest.fn(async (key: unknown, value: unknown) => {
      cache.set(String(key), String(value))
      return 'OK'
    }),
    setex: jest.fn(async (key: unknown, _ttl: unknown, value: unknown) => {
      cache.set(String(key), String(value))
      return 'OK'
    }),
    del: jest.fn(async () => 1),
    keys: jest.fn(async () => [] as string[]),
    flushdb: jest.fn(async () => {
      cache.clear()
      return 'OK'
    }),
    hset: jest.fn(async () => 1),
    hdel: jest.fn(async () => 1),
    hgetall: jest.fn(async () => ({})),
    hget: jest.fn(async () => null),
    on: jest.fn(),
    quit: jest.fn(async () => 'OK'),
  }

  return jest.fn(() => mockRedis)
})

describe('API Gateway Tests', () => {
  let gateway: ApiGateway
  let server: Server

  beforeAll(async () => {
    // Start gateway
    gateway = new ApiGateway({
      port: 3000,
      redis: {
        host: 'localhost',
        port: 6379,
      },
      loadBalancer: {
        strategy: 'round-robin' as const,
        healthCheck: {
          enabled: false,
          interval: 30000,
        },
      },
      cache: {
        enabled: true,
        ttl: 300,
        maxSize: 1000,
      },
    })
    await gateway.start()
  })

  afterAll(async () => {
    await gateway.stop()
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolve) => server.close(() => resolve())),
      ),
    )
  })

  describe('Service Registry', () => {
    it('should register a new service', async () => {
      const response = await request(gateway.app)
        .post('/api/registry/services')
        .send({
          name: 'test-service',
          url: 'http://localhost:4000',
          healthCheck: '/health',
          version: '1.0.0',
        })
      expect(response.status).toBe(201)
    })
  })

  describe('Load Balancing', () => {
    beforeEach(async () => {
      // Register test services
      await Promise.all(
        [4000, 4001, 4002].map((port) =>
          request(gateway.app)
            .post('/api/registry/services')
            .send({
              name: 'test-service',
              url: `http://localhost:${port}`,
              healthCheck: '/health',
              version: '1.0.0',
            }),
        ),
      )
    })

    it('should distribute requests across services', async () => {
      // Ensure the service is registered
      await request(gateway.app)
        .post('/api/register')
        .send({
          serviceName: 'test-service',
          instance: { url: 'http://localhost:4000' },
        })

      // Make multiple requests to ensure distribution
      const responses = await Promise.all(
        Array(6)
          .fill(null)
          .map(() =>
            request(gateway.app).get('/api/test-service/endpoint').expect(200),
          ),
      )

      const uniqueServers = new Set(
        responses.map((r) => r.headers['x-served-by']),
      )
      expect(uniqueServers.size).toBeGreaterThan(1)
    })
  })

  describe('Caching', () => {
    beforeEach(async () => {
      // Register test service
      await request(gateway.app).post('/api/registry/services').send({
        name: 'test-service',
        url: 'http://localhost:4000',
        healthCheck: '/health',
        version: '1.0.0',
      })
    })

    it('should cache GET requests', async () => {
      const endpoint = '/api/test-service/cached-endpoint'

      // First request
      const response1 = await request(gateway.app).get(endpoint).expect(200)
      expect(response1.header['x-cache']).toBe('MISS')

      // Second request (should be cached)
      const response2 = await request(gateway.app).get(endpoint).expect(200)
      expect(response2.header['x-cache']).toBe('HIT')
    })
  })
})
