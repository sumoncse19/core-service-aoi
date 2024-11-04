import { Response, NextFunction } from 'express'
import axios, { AxiosError } from 'axios'
import { ProxyRequest } from '../../types/routing.types'
import { LoadBalancer } from '../../load-balancer/load.balancer'
import AppError from '../../../app/modules/shared/errors/AppError'
import { ServiceInstance } from '../../types/load-balancer.types'

export class ProxyHandler {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly loadBalancer: LoadBalancer) {}

  handleProxy = async (
    req: ProxyRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    let instance
    try {
      if (!req.targetService) {
        throw new AppError(500, 'Target service not specified')
      }

      instance = await this.loadBalancer.getInstance(req.targetService)
      res.setHeader('x-served-by', instance.url)

      const servicePath = req.path.split('/').slice(3).join('/')

      const response = await axios({
        method: req.method as string,
        url: `${instance.url}/${servicePath}`,
        headers: {
          ...req.headers,
          host: new URL(instance.url).host,
        },
        data: req.body,
        params: req.query,
      })

      res.status(response.status).send(response.data)
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Proxy error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          path: req.path,
          targetService: req.targetService,
          originalError: error.response?.data,
        })
        next(new AppError(error.response?.status || 500, error.message))
      } else {
        next(error)
      }
    } finally {
      if (instance) {
        await this.loadBalancer.releaseInstance(instance)
      }
    }
  }

  public async addServiceInstance(
    serviceName: string,
    instance: ServiceInstance,
  ): Promise<void> {
    await this.loadBalancer.addInstance(serviceName, instance)
  }
}
