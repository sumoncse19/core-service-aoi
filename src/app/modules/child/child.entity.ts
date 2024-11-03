import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { UserEntity } from '../user/user.entity'

@Entity('children')
export class ChildEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  first_name!: string

  @Column()
  last_name!: string

  @Column('date')
  date_of_birth!: Date

  @Column('uuid')
  parent_id!: string

  @Column({ nullable: true })
  gender?: string

  @Column('text', { nullable: true })
  medical_info?: string

  @Column('jsonb', { nullable: true })
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }

  @Column({ default: true })
  is_active!: boolean

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'parent_id' })
  parent!: UserEntity

  // Virtual property to get full name
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`
  }
}
