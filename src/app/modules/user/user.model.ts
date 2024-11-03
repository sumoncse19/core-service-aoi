import mongoose, { Schema } from 'mongoose'
import { IUser } from './user.interface'
import { UserRole } from '../shared/enumeration'

const userSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    user_name: { type: String, unique: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

export const UserModel = mongoose.model<IUser>('User', userSchema)
