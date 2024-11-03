import express, { RequestHandler } from 'express'
import { UserRole } from '../shared/enumeration'
import validateRequest from '../../middleware/validateRequest'
import {
  createActivitySchema,
  updateActivitySchema,
  createAttendanceSchema,
  updateAttendanceSchema,
} from './tracking.schema'
import { TrackingController } from './tracking.controller'
import { requireRole, validateSession } from '../../middleware/auth.middleware'
import { validateCapacity } from './tracking.middleware'

const router = express.Router()
const trackingController = new TrackingController()

// Activity routes
router.post(
  '/activities',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.ADMIN, UserRole.STAFF]) as unknown as RequestHandler,
  validateRequest(createActivitySchema),
  validateCapacity as unknown as RequestHandler,
  trackingController.createActivity,
)

router.get(
  '/activities',
  validateSession as unknown as RequestHandler,
  trackingController.getActivities,
)

router.get(
  '/activities/:id',
  validateSession as unknown as RequestHandler,
  trackingController.getActivityById,
)

router.patch(
  '/activities/:id',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.ADMIN, UserRole.STAFF]) as unknown as RequestHandler,
  validateRequest(updateActivitySchema),
  trackingController.updateActivity,
)

router.delete(
  '/activities/:id',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.ADMIN]) as unknown as RequestHandler,
  trackingController.deleteActivity,
)

// Attendance routes
router.post(
  '/attendance',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.ADMIN, UserRole.STAFF]) as unknown as RequestHandler,
  validateRequest(createAttendanceSchema),
  trackingController.recordAttendance,
)

router.get(
  '/attendance/activity/:activityId',
  validateSession as unknown as RequestHandler,
  trackingController.getAttendanceByActivity,
)

router.patch(
  '/attendance/:id',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.ADMIN, UserRole.STAFF]) as unknown as RequestHandler,
  validateRequest(updateAttendanceSchema),
  trackingController.updateAttendance,
)

// Reports routes
router.get(
  '/reports/activity/:activityId',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.ADMIN, UserRole.STAFF]) as unknown as RequestHandler,
  trackingController.getActivityReport,
)

router.get(
  '/reports/daily',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.ADMIN, UserRole.STAFF]) as unknown as RequestHandler,
  trackingController.getDailyReport,
)

export const TrackingRoutes = router
