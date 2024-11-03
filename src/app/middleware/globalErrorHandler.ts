/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import mongoose from 'mongoose'
import handleZodError from '../modules/shared/errors/zodErrorHandler'
import handleValidationError from '../modules/shared/errors/mongooseValidationErrorHandler'
import handleCastError from '../modules/shared/errors/mongooseCastErrorHandler'
import handleDuplicateError from '../modules/shared/errors/duplicateKeyErrorHandler'
import { ERROR } from '../modules/shared/api.response.types'
import httpStatus from 'http-status'
import AppError from '../modules/shared/errors/AppError'

interface ErrorResponse {
  success: boolean
  statusCode: number
  message: string
  errors: any[]
  stack?: string
}

function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let errorResponse: ErrorResponse = {
    success: false,
    statusCode: err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    message: err.message || 'Internal server error',
    errors: [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  }

  if (err instanceof ZodError) {
    const zodError = handleZodError(err)
    errorResponse = {
      ...errorResponse,
      statusCode: zodError.statusCode,
      message: zodError.message,
      errors: zodError.errors || [],
    }
  } else if (err instanceof mongoose.Error.ValidationError) {
    const validationError = handleValidationError(err)
    errorResponse = {
      ...errorResponse,
      statusCode: validationError.statusCode,
      message: validationError.message,
      errors: validationError.errors || [],
    }
  } else if (err instanceof mongoose.Error.CastError) {
    const castError = handleCastError(err)
    errorResponse = {
      ...errorResponse,
      statusCode: castError.statusCode,
      message: castError.message,
      errors: castError.errors || [],
    }
  } else if (err.code && err.code === 11000) {
    const duplicateError = handleDuplicateError(err)
    errorResponse = {
      ...errorResponse,
      statusCode: duplicateError.statusCode,
      message: duplicateError.message,
      errors: duplicateError.errors || [],
    }
  } else if (err instanceof AppError) {
    errorResponse = {
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: [],
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }
  }

  // Send error response
  ERROR(
    res,
    errorResponse.statusCode,
    errorResponse.message,
    errorResponse.errors,
  )
}

export default globalErrorHandler
