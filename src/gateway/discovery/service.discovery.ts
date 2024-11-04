import axios from 'axios'
import { ServiceRegistry } from '../registry/service.registry'
import { ServiceInfo, RegistryConfig } from '../types/gateway.types'

export class ServiceDiscovery {
  private registry: ServiceRegistry
  private config: RegistryConfig

  constructor(config: RegistryConfig) {
    this.registry = new ServiceRegistry()
    this.config = config
    this.startHealthChecks()
  }

  private async checkServiceHealth(service: ServiceInfo): Promise<boolean> {
    try {
      const response = await axios.get(`${service.url}${service.healthCheck}`, {
        timeout: this.config.timeout,
      })
      return response.status === 200
    } catch (error) {
      console.error(`Health check failed for service ${service.name}:`, error)
      return false
    }
  }

  private async startHealthChecks(): Promise<void> {
    setInterval(async () => {
      const services = await this.registry.getAllServices()

      for (const service of services) {
        const isHealthy = await this.checkServiceHealth(service)

        if (!isHealthy && service.status === 'active') {
          service.status = 'inactive'
          await this.registry.registerService(service)
        } else if (isHealthy && service.status === 'inactive') {
          service.status = 'active'
          await this.registry.registerService(service)
        }
      }
    }, this.config.checkInterval)
  }

  async discoverService(serviceName: string): Promise<ServiceInfo | null> {
    const services = await this.registry.getAllServices()
    return (
      services.find(
        (service) =>
          service.name === serviceName && service.status === 'active',
      ) || null
    )
  }
}
