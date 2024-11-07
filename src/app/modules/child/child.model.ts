import mongoose, { Schema } from 'mongoose'
import { IChild } from './child.interface'

const childSchema = new Schema<IChild>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    parent_id: { type: String, required: true },
    gender: { type: String },
    medical_info: { type: String },
    emergency_contact: [
      {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        phone: { type: String, required: true },
      },
    ],
    is_active: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
)

export const ChildModel = mongoose.model<IChild>('Child', childSchema)
