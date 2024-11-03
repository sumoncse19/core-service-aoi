import { ActivityStatus, AttendanceStatus } from '../shared/enumeration'

export interface IActivity {
  id?: string
  title: string
  description: string
  start_time: Date
  end_time: Date
  status: ActivityStatus
  created_by: string
  assigned_staff?: string[]
  max_participants?: number
  location?: string
  metadata?: Record<string, unknown>
}

export interface IAttendance {
  id?: string
  activity_id: string
  child_id: string
  status: AttendanceStatus
  check_in_time?: Date
  check_out_time?: Date
  notes?: string
  recorded_by: string
}

export interface IActivityReport {
  activity_id: string
  total_participants: number
  attendance_summary: {
    present: number
    absent: number
    late: number
    excused: number
  }
  capacity_info: {
    total_capacity: number | 'unlimited'
    current_attendance: number
    available_spots: number | 'unlimited'
  }
  staff_notes?: string
  created_by: string
  created_at: Date
}

export interface IDateRange {
  start_date: Date
  end_date: Date
}

export interface IMonthlyReport {
  year: number
  month: number
}

export interface IBulkAttendance {
  activity_id: string
  attendances: Array<Omit<IAttendance, 'activity_id' | 'id'>>
}
