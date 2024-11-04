export const gatewayConfig = {
  registry: {
    checkInterval: 30000, // 30 seconds
    timeout: 5000, // 5 seconds
  },
  services: {
    user: {
      name: 'user-service',
      healthCheck: '/health',
      version: '1.0.0',
    },
    tracking: {
      name: 'tracking-service',
      healthCheck: '/health',
      version: '1.0.0',
    },
    booking: {
      name: 'booking-service',
      healthCheck: '/health',
      version: '1.0.0',
    },
    child: {
      name: 'child-service',
      healthCheck: '/health',
      version: '1.0.0',
    },
  },
  loadBalancer: {
    strategy: 'round-robin' as const,
    healthCheck: {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      unhealthyThreshold: 3,
    },
  },
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
    maxSize: 1000,
  },
}
