import express, { RequestHandler } from 'express'
import { validateSession, requireRole } from '../../middleware/auth.middleware'
import { UserRole } from '../shared/enumeration'
import validateRequest from '../../middleware/validateRequest'
import { registerChildSchema, updateChildSchema } from './child.schema'
import { ChildController } from './child.controller'

const router = express.Router()
const childController = new ChildController()

router.post(
  '/register',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.PARENT]) as unknown as RequestHandler,
  validateRequest(registerChildSchema),
  childController.registerChild,
)

router.get(
  '/my-children',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.PARENT]) as unknown as RequestHandler,
  childController.getMyChildren,
)

router.patch(
  '/:id',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.PARENT]) as unknown as RequestHandler,
  validateRequest(updateChildSchema),
  childController.updateChild,
)

router.delete(
  '/:id',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.PARENT]) as unknown as RequestHandler,
  childController.deleteChild,
)

router.get(
  '/:id/activity-history',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.PARENT, UserRole.STAFF]) as unknown as RequestHandler,
  childController.getChildActivityHistory,
)

router.get(
  '/:id/eligible-activities',
  validateSession as unknown as RequestHandler,
  requireRole([UserRole.PARENT]) as unknown as RequestHandler,
  childController.getEligibleActivities,
)

export const ChildRoutes = router

/**
 * Project Context: Pulikids is building a modern childcare management platform that will serve nurseries, schools, and childcare providers across the UK. The system will handle everything from booking and activity tracking to compliance monitoring and parent communications.

Technical Stack Requirements: Node.js, TypeScript, PostgreSQL, Mongoose, Zod (Schema validation), Clerk (Authentication), Docker (optional), Redis (optional for API Gateway implementation)

Architecture Requirements: Must follow MVC (Model-View-Controller) pattern, Must implement proper error handling, Must include input validation, Must include proper API documentation, Must implement proper security measures.

I already done user and tracking service. with the given file.

I want to implement my new service which is booking with given requirement and given tracking service structure.

Booking Service:
○ Create/manage bookings
○ Availability checking
○ Booking confirmation system
○ Basic payment integration

Now create routes, entity, interface model and schema for this booking service
 * 
 */
