import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { UserEntity } from '../user/user.entity'
import { ActivityEntity } from '../tracking/tracking.entity'
import { ChildEntity } from '../child/child.entity'
import { BookingStatus, PaymentStatus } from '../shared/enumeration'

@Entity('bookings')
@Index(['child_id', 'activity_id', 'start_date'], { unique: true })
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  child_id!: string

  @Column('uuid')
  activity_id!: string

  @Column('uuid')
  parent_id!: string

  @Column('timestamp')
  start_date!: Date

  @Column('timestamp')
  end_date!: Date

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status!: PaymentStatus

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount!: number

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paid_amount!: number

  @Column('text', { nullable: true })
  notes?: string

  @Column({ type: 'varchar', length: 255 })
  created_by!: string

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'clerk_user_id' })
  creator!: UserEntity

  @ManyToOne(() => ActivityEntity)
  @JoinColumn({ name: 'activity_id' })
  activity!: ActivityEntity

  @ManyToOne(() => ChildEntity)
  @JoinColumn({ name: 'child_id' })
  child!: ChildEntity
}

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  booking_id!: string

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number

  @Column({ type: 'varchar', length: 50 })
  payment_method!: string

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id?: string

  @Column('timestamp')
  payment_date!: Date

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @ManyToOne(() => BookingEntity)
  @JoinColumn({ name: 'booking_id' })
  booking!: BookingEntity
}

@Entity('booking_confirmations')
export class BookingConfirmationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  booking_id!: string

  @Column({ type: 'varchar', length: 100, unique: true })
  confirmation_code!: string

  @Column('timestamp', { nullable: true })
  confirmed_at?: Date

  @Column('timestamp')
  expires_at!: Date

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @ManyToOne(() => BookingEntity)
  @JoinColumn({ name: 'booking_id' })
  booking!: BookingEntity
}
