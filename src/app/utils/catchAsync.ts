import { NextFunction, Request, RequestHandler, Response } from 'express'
import { ERROR } from '../modules/shared/api.response.types'

const catchAsync = (
  fn: RequestHandler,
  statusCode?: number,
  message?: string,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      return ERROR(
        res,
        err.statusCode ? err.statusCode : statusCode,
        message || 'Something went wrong',
        [err.message],
      )
    })
  }
}

export default catchAsync
