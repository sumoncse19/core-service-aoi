import mongoose, { Schema } from 'mongoose'
import { ISession } from './session.interface'

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: String, required: true },
    token: { type: String, required: true },
    clerkUserId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

// Create indexes without trying to drop first
sessionSchema.index({ userId: 1 })
sessionSchema.index({ token: 1 }, { unique: true })
sessionSchema.index({ clerkUserId: 1 })
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Only create indexes if they don't exist
const SessionModel = mongoose.model<ISession>('Session', sessionSchema)
SessionModel.createIndexes().catch((error) => {
  // Log error but don't throw
  console.warn('Warning: Session index creation error:', error.message)
})

export { SessionModel }
