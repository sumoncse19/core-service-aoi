/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import { APIResponseError } from '../api.response.types'

const handleDuplicateError = (err: any): APIResponseError => {
  const match = err.message.match(/"([^"]*)"/)
  const extractedMessage = match && match[1]

  const errors = [
    {
      path: '',
      message: `${extractedMessage} already exists`,
    },
  ]

  return {
    success: false,
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Duplicate Key Error',
    errors,
    stack: err.stack,
  }
}

export default handleDuplicateError
