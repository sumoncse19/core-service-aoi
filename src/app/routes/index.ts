import express from 'express'
import { UserRoutes } from '../modules/user/user.routes'
import { TrackingRoutes } from '../modules/tracking/tracking.routes'
import { ChildRoutes } from '../modules/child/child.routes'

const router = express.Router()

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/tracking',
    route: TrackingRoutes,
  },
  {
    path: '/children',
    route: ChildRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
