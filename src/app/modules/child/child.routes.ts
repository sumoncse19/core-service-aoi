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

export const ChildRoutes = router
