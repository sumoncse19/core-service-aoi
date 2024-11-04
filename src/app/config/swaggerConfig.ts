import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pulikids API Documentation',
      version: '1.0.0',
      description:
        'API documentation for the Pulikids childcare management platform',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Users', description: 'User management and authentication' },
      { name: 'Children', description: 'Child profile management' },
      { name: 'Activities', description: 'Activity management' },
      { name: 'Attendance', description: 'Attendance tracking' },
      { name: 'Reports', description: 'Reporting system' },
      { name: 'Bookings', description: 'Booking management' },
      { name: 'Payments', description: 'Payment processing' },
    ],
  },
  apis: ['./src/app/modules/**/*.ts'], // Ensure this path includes all your route files
}

const swaggerSpec = swaggerJsdoc(options)

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
