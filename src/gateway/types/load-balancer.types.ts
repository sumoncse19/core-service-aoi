export type LoadBalancerStrategy = 'round-robin' | 'least-connection' | 'random'

export interface ServiceInstance {
  id: string
  url: string
  weight: number
  currentConnections: number
  lastUsed?: Date
}

export interface LoadBalancerConfig {
  strategy: LoadBalancerStrategy
  healthCheck: {
    enabled: boolean
    interval: number
    timeout: number
    unhealthyThreshold: number
  }
}
