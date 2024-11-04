export interface ServiceInfo {
  id: string
  name: string
  url: string
  status: 'active' | 'inactive'
  healthCheck: string
  version: string
  endpoints: {
    path: string
    method: string
    auth: boolean
  }[]
}

export interface RegistryConfig {
  checkInterval: number // Health check interval in ms
  timeout: number // Request timeout in ms
}
