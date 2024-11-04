/* eslint-disable no-undef */
import {
  ServiceInstance,
  LoadBalancerConfig,
} from '../types/load-balancer.types'
import { ServiceRegistry } from '../registry/service.registry'
import AppError from '../../app/modules/shared/errors/AppError'
import axios from 'axios'

export class LoadBalancer {
  private instances: Map<string, ServiceInstance[]> = new Map()
  private currentIndex: Map<string, number> = new Map()
  private readonly config: LoadBalancerConfig
  private readonly registry: ServiceRegistry
  public healthCheckInterval?: NodeJS.Timeout

  constructor(config: LoadBalancerConfig, registry: ServiceRegistry) {
    this.config = config
    this.registry = registry
    this.initializeHealthChecks()
  }

  private async initializeHealthChecks(): Promise<void> {
    if (this.config.healthCheck.enabled) {
      this.healthCheckInterval = setInterval(
        () => this.performHealthChecks(),
        this.config.healthCheck.interval,
      )
    }
  }

  private async performHealthChecks(): Promise<void> {
    for (const [serviceName, instances] of this.instances) {
      for (const instance of instances) {
        try {
          const isHealthy = await this.checkInstanceHealth(instance)
          if (!isHealthy) {
            await this.handleUnhealthyInstance(serviceName, instance)
          }
        } catch (error) {
          console.error(`Health check failed for ${instance.url}:`, error)
        }
      }
    }
  }

  private async checkInstanceHealth(
    instance: ServiceInstance,
  ): Promise<boolean> {
    try {
      const response = await axios.get(`${instance.url}/health`, {
        timeout: this.config.healthCheck.timeout,
      })
      return response.status === 200
    } catch {
      return false
    }
  }

  private async handleUnhealthyInstance(
    serviceName: string,
    instance: ServiceInstance,
  ): Promise<void> {
    const instances = this.instances.get(serviceName) || []
    const index = instances.findIndex((i) => i.id === instance.id)
    if (index !== -1) {
      instances.splice(index, 1)
      this.instances.set(serviceName, instances)
      await this.registry.deregisterService(instance.id)
    }
  }

  public async addInstance(
    serviceName: string,
    instance: ServiceInstance,
  ): Promise<void> {
    const instances = this.instances.get(serviceName) || []
    instances.push(instance)
    this.instances.set(serviceName, instances)
  }

  public async getInstance(serviceName: string): Promise<ServiceInstance> {
    const instances = this.instances.get(serviceName) || []
    if (instances.length === 0) {
      throw new AppError(
        503,
        `No available instances for service: ${serviceName}`,
      )
    }

    const instance = this.roundRobin(serviceName, instances)
    instance.currentConnections++
    instance.lastUsed = new Date()
    return instance
  }

  private roundRobin(
    serviceName: string,
    instances: ServiceInstance[],
  ): ServiceInstance {
    let currentIndex = this.currentIndex.get(serviceName) || 0
    const instance = instances[currentIndex]

    currentIndex = (currentIndex + 1) % instances.length
    this.currentIndex.set(serviceName, currentIndex)

    return instance
  }

  public releaseInstance(instance: ServiceInstance): void {
    if (instance.currentConnections > 0) {
      instance.currentConnections--
    }
  }
}
