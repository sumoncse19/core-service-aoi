import { DataSource } from 'typeorm'
import mongoose from 'mongoose'
import { UserEntity } from '../modules/user/user.entity'
import {
  ActivityEntity,
  AttendanceEntity,
} from '../modules/tracking/tracking.entity'
import { ChildEntity } from '../modules/child/child.entity'
import AppError from '../modules/shared/errors/AppError'

export const PostgresDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pulikids',
  entities: [UserEntity, ActivityEntity, AttendanceEntity, ChildEntity],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production',
})

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '')
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new AppError(500, 'MongoDB connection failed')
  }
}
