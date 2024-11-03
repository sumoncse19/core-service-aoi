export interface ISession {
  userId: string
  token: string
  clerkUserId: string
  expiresAt: Date
  lastActivity: Date
  deviceInfo?: {
    userAgent?: string
    ip?: string
  }
}
