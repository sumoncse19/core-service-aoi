import config from './app/config'
import { createServer } from 'http'
import { connectMongoDB, PostgresDataSource } from './app/config/database'
import 'reflect-metadata'
import app from './app'
import { setupSwagger } from './app/config/swaggerConfig'

const initializeDatabases = async () => {
  try {
    await PostgresDataSource.initialize()
    await connectMongoDB()
    console.log('All database connections established successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    process.exit(1)
  }
}

async function main() {
  try {
    const server = createServer(app)
    await initializeDatabases()

    // Setup Swagger
    setupSwagger(app)

    server.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error)
    process.exit(1)
  }
}

main()
