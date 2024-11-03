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
import { ActivityStatus, AttendanceStatus } from '../shared/enumeration'

@Entity('activities')
export class ActivityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  title!: string

  @Column('text')
  description!: string

  @Column('timestamp')
  start_time!: Date

  @Column('timestamp')
  end_time!: Date

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.SCHEDULED,
  })
  status!: ActivityStatus

  @Column({ type: 'varchar', length: 255 })
  created_by!: string

  @Column('text', { array: true, nullable: true })
  assigned_staff?: string[]

  @Column({ nullable: true })
  max_participants?: number

  @Column({ nullable: true })
  location?: string

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'clerk_user_id' })
  creator!: UserEntity
}

@Entity('attendance')
@Index(['activity_id', 'child_id'], { unique: true })
export class AttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('uuid')
  activity_id!: string

  @Column('varchar', { length: 255 })
  child_id!: string

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT,
  })
  status!: AttendanceStatus

  @Column('timestamp', { nullable: true })
  check_in_time?: Date

  @Column('timestamp', { nullable: true })
  check_out_time?: Date

  @Column('text', { nullable: true })
  notes?: string

  @Column({ type: 'varchar', length: 255 })
  recorded_by!: string

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @ManyToOne(() => ActivityEntity)
  @JoinColumn({ name: 'activity_id' })
  activity!: ActivityEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'recorded_by', referencedColumnName: 'clerk_user_id' })
  recorder!: UserEntity
}
