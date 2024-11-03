import { ZodError, ZodIssue } from 'zod'
import { APIResponseError } from '../api.response.types'
import httpStatus from 'http-status'

const handleZodError = (err: ZodError): APIResponseError => {
  const errors = err.issues.map((issue: ZodIssue) => ({
    path: issue?.path[issue.path.length - 1],
    message: issue.message,
  }))

  return {
    success: false,
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Validation Error',
    errors,
    stack: err.stack,
  }
}

export default handleZodError
