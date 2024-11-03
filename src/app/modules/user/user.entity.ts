import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'
import { UserRole } from '../shared/enumeration'

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  first_name!: string

  @Column()
  last_name!: string

  @Column({ nullable: true })
  @Index({ unique: true, where: 'user_name IS NOT NULL' })
  user_name?: string

  @Column({ unique: true })
  @Index()
  email!: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PARENT,
  })
  role!: UserRole

  @Column({ nullable: true })
  @Index({ unique: true })
  clerk_user_id?: string

  @Column({ default: false })
  email_verified!: boolean

  @Column({ default: true })
  is_active!: boolean

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @Column({ nullable: true, type: 'varchar', length: 6 })
  resetPasswordOTP?: string | null

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordOTPExpiry?: Date | null

  @Column({ default: false })
  isDeleted!: boolean

  // Virtual property to get full name
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`
  }
}
