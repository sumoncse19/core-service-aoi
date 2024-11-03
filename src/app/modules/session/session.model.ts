import mongoose, { Schema } from 'mongoose'
import { ISession } from './session.interface'

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    clerkUserId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    lastActivity: { type: Date, default: Date.now },
    deviceInfo: {
      userAgent: String,
      ip: String,
    },
  },
  {
    timestamps: true,
  },
)

// Remove any existing indexes first
sessionSchema.index({ token: 1 }, { unique: true })
sessionSchema.index({ userId: 1 })
sessionSchema.index({ clerkUserId: 1 })
sessionSchema.index({ expiresAt: 1 })

// Drop the problematic index if it exists
mongoose.connection.on('connected', async () => {
  try {
    await mongoose.connection.db
      .collection('sessions')
      .dropIndex('clerkSessionId_1')
  } catch (error) {
    console.log(error)
    // Index might not exist, ignore error
  }
})

export const SessionModel = mongoose.model<ISession>('Session', sessionSchema)
