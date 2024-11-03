/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express'

export interface APIResponseSuccess {
  success: boolean
  statusCode: number
  message: string
  token?: string
  refreshToken?: string
  data?: any
}

export interface APIResponseError {
  success: false
  statusCode: number
  message: string
  errors?: any[]
  stack?: string
}

export type APIResponse = APIResponseSuccess | APIResponseError

function sendAPIResponse(res: Response, response: APIResponse) {
  res.status(response.statusCode).json(response)
}

export function SUCCESS(
  res: Response,
  statusCode: number = 200,
  message: string,
  data?: any,
) {
  const apiResponse: APIResponseSuccess = {
    success: statusCode === 404 ? false : true,
    statusCode,
    message,
    data,
  }
  sendAPIResponse(res, apiResponse)
}

export function SUCCESS_LOGIN(
  res: Response,
  statusCode: number = 200,
  message: string,
  token?: string,
  refreshToken?: string,
  data?: any,
) {
  const apiResponse: APIResponseSuccess = {
    success: true,
    statusCode,
    message,
    token,
    refreshToken,
    data,
  }
  sendAPIResponse(res, apiResponse)
}

export function ERROR(
  res: Response,
  statusCode: number = 400,
  message: string,
  errors?: any[],
  stack?: string,
) {
  const apiResponse: APIResponseError = {
    success: false,
    statusCode,
    message,
    errors,
    stack,
  }
  sendAPIResponse(res, apiResponse)
}
