import express, { Express } from 'express'
import { Server } from 'http'

const createApp = (port: number): Express => {
  const app = express()

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    })
  })

  // Test service endpoints
  app.get('/test-service/endpoint', (_, res) => {
    res.json({
      message: 'Test endpoint response',
      server: `mock-service-${port}`,
    })
  })

  app.get('/test-service/cached-endpoint', (_, res) => {
    res.json({
      message: 'Cached endpoint response',
      server: `mock-service-${port}`,
    })
  })

  // Load balancing endpoint
  app.get('/api/test-service/endpoint', (_req, res) => {
    res.json({ message: 'Load Balancing Endpoint Hit' })
  })

  // Cached endpoint
  app.get('/api/test-service/cached-endpoint', (_req, res) => {
    res.status(200).send('Cached Endpoint Hit')
  })

  // Log all requests for debugging
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path} - Mock Service ${port}`)
    next()
  })

  // Handle 404s
  app.use((req, res) => {
    console.log(`404: ${req.method} ${req.path} - Mock Service ${port}`)
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
      server: `mock-service-${port}`,
    })
  })

  return app
}

// Start multiple instances
const servers: Server[] = []
const ports = [4000, 4001, 4002]

ports.forEach((port) => {
  const app = createApp(port)
  const server = app.listen(port, () => {
    console.log(`Mock service running on port ${port}`)
  })
  servers.push(server)
})

// Export servers for cleanup
export { servers }
