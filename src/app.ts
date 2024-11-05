import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import notFound from './app/middleware/notFound'
import globalErrorHandler from './app/middleware/globalErrorHandler'
import router from './app/routes'
// import { setupSwagger } from './app/config/swaggerConfig'

const app: Application = express()

//parser
app.use(express.json())
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true, // Enable credentials
  }),
)

const getAController = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message:
      'Your Mongoose Starter system server is running and you hit the / route!',
  })
}

app.get('/', getAController)

// application routes
app.use('/api/v1', router)

// Setup Swagger
// setupSwagger(app as Express)

// Global error handling
app.use(globalErrorHandler)

// Not found route
app.use(notFound)

export default app
