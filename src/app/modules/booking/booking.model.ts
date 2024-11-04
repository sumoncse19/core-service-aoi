import mongoose, { Schema, Document } from 'mongoose'
import { BookingStatus, PaymentStatus } from '../shared/enumeration'
import { IBooking, IPayment, IBookingConfirmation } from './booking.interface'

// Define document types
type BookingDocument = Document & Omit<IBooking, 'id'>
type PaymentDocument = Document & Omit<IPayment, 'id'>
type BookingConfirmationDocument = Document & Omit<IBookingConfirmation, 'id'>

const bookingSchema = new Schema<BookingDocument>(
  {
    child_id: { type: String, required: true },
    activity_id: { type: String, required: true },
    parent_id: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    payment_status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    total_amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    notes: { type: String },
    created_by: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

const paymentSchema = new Schema<PaymentDocument>(
  {
    booking_id: { type: String, required: true },
    amount: { type: Number, required: true },
    payment_method: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    transaction_id: { type: String },
    payment_date: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

const bookingConfirmationSchema = new Schema<BookingConfirmationDocument>(
  {
    booking_id: { type: String, required: true },
    confirmation_code: { type: String, required: true, unique: true },
    confirmed_at: { type: Date },
    expires_at: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

// Indexes
bookingSchema.index(
  { child_id: 1, activity_id: 1, start_date: 1 },
  { unique: true },
)
bookingSchema.index({ parent_id: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ payment_status: 1 })

paymentSchema.index({ booking_id: 1 })
paymentSchema.index({ transaction_id: 1 }, { unique: true, sparse: true })

bookingConfirmationSchema.index({ booking_id: 1 })
bookingConfirmationSchema.index({ confirmation_code: 1 }, { unique: true })
bookingConfirmationSchema.index({ expires_at: 1 })

export const BookingModel = mongoose.model<BookingDocument>(
  'Booking',
  bookingSchema,
)
export const PaymentModel = mongoose.model<PaymentDocument>(
  'Payment',
  paymentSchema,
)
export const BookingConfirmationModel =
  mongoose.model<BookingConfirmationDocument>(
    'BookingConfirmation',
    bookingConfirmationSchema,
  )
