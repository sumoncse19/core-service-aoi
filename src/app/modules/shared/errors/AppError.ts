class AppError extends Error {
  public statusCode: number

  constructor(statusCode: number, message: string, stack = '') {
    super(message)
    this.statusCode = statusCode

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor) // Ekhane 1st this diye error stack theke theke sob gula error ney and 2nd this.constructor diye specific error ta find out kore response ee dewa hoy
    }
  }
}

export default AppError
