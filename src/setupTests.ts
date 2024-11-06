import { config } from 'dotenv'
import { jest, beforeAll, afterAll } from '@jest/globals'

config({ path: '.env.test' })

beforeAll(() => {
  // Setup any global test configuration
  jest.clearAllMocks()
})

afterAll(() => {
  // Cleanup after all tests
  jest.clearAllMocks()
})
