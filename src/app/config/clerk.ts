import { createClerkClient } from '@clerk/backend'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is not set in environment variables')
}

// Initialize Clerk client for API operations
export const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})
