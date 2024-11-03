/* eslint-disable no-unused-vars */
export enum UserRole {
  ADMIN = 'admin',
  PARENT = 'parent',
  STAFF = 'staff',
}

export enum ActivityStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}
