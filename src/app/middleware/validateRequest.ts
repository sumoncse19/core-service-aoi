import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodEffects } from 'zod'
import { ERROR } from '../modules/shared/api.response.types'
import httpStatus from 'http-status'

const validateRequest = (schema: AnyZodObject | ZodEffects<AnyZodObject>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actualSchema =
        schema instanceof ZodEffects ? schema._def.schema : schema

      // Use safeParseAsync to get both success and error handling
      const result = await actualSchema.safeParseAsync(req.body)

      if (!result.success) {
        // Log errors to see what Zod is throwing
        console.error('Validation failed:', result.error.errors)

        return ERROR(
          res,
          httpStatus.BAD_REQUEST,
          'Validation error',
          result.error.errors,
        )
      } else {
        console.log('validate successfully')
      }

      next()
    } catch (err) {
      console.error('Unexpected validation error:', err)
      if (err instanceof Error) {
        return ERROR(
          res,
          httpStatus.BAD_REQUEST,
          'Validation error',
          [{ message: err.message }],
          err.stack,
        )
      }
    }
  }
}

export default validateRequest
