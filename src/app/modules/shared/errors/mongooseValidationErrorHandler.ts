import mongoose from 'mongoose'
import { APIResponseError } from '../api.response.types'
import httpStatus from 'http-status'

const handleValidationError = (
  err: mongoose.Error.ValidationError,
): APIResponseError => {
  const errors = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => ({
      path: val?.path,
      message: val?.message,
    }),
  )

  return {
    success: false,
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Validation Error',
    errors,
    stack: err.stack,
  }
}

export default handleValidationError
