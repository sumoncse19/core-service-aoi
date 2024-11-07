import { Request, Response } from 'express'
import { TrackingService } from './tracking.service'
import catchAsync from '../../utils/catchAsync'
import { AuthRequest } from '../../types/express'
import AppError from '../shared/errors/AppError'

export class TrackingController {
  private trackingService: TrackingService

  constructor() {
    this.trackingService = new TrackingService()
  }

  /**
   * @swagger
   * /tracking/activities/upcoming:
   *   get:
   *     summary: Get upcoming activities
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 30
   *         description: "Number of days to look ahead (default: 7)"
   *     responses:
   *       200:
   *         description: List of upcoming activities
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Activity'
   *       401:
   *         description: Unauthorized
   */
  getUpcomingActivities = catchAsync(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 7
    const activities = await this.trackingService.getUpcomingActivities(days)

    res.status(200).json({
      success: true,
      data: activities,
    })
  })

  /**
   * @swagger
   * /tracking/activities:
   *   post:
   *     summary: Create a new activity
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ActivityInput'
   *     responses:
   *       201:
   *         description: Activity created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Activity'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  createActivity = catchAsync(
    async (req: Request | AuthRequest, res: Response) => {
      const authReq = req as AuthRequest
      if (!authReq.auth?.userId) {
        throw new AppError(401, 'Authentication required')
      }

      const activity = await this.trackingService.createActivity({
        ...req.body,
        created_by: authReq.auth.userId,
      })

      res.status(201).json({
        success: true,
        data: activity,
      })
    },
  )

  /**
   * @swagger
   * /tracking/activities:
   *   get:
   *     summary: Get all activities
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of activities
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Activity'
   *       401:
   *         description: Unauthorized
   */
  getActivities = catchAsync(async (req: Request, res: Response) => {
    const activities = await this.trackingService.getActivities()

    res.status(200).json({
      success: true,
      data: activities,
    })
  })

  /**
   * @swagger
   * /tracking/activities/{id}:
   *   get:
   *     summary: Get activity by ID
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The activity ID
   *     responses:
   *       200:
   *         description: Activity details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Activity'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Activity not found
   */
  getActivityById = catchAsync(async (req: Request, res: Response) => {
    const activity = await this.trackingService.getActivityById(req.params.id)

    res.status(200).json({
      success: true,
      data: activity,
    })
  })

  /**
   * @swagger
   * /tracking/activities/{id}:
   *   patch:
   *     summary: Update activity
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The activity ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ActivityInput'
   *     responses:
   *       200:
   *         description: Activity updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Activity'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Activity not found
   */
  updateActivity = catchAsync(async (req: Request, res: Response) => {
    const activity = await this.trackingService.updateActivity(
      req.params.id,
      req.body,
    )

    res.status(200).json({
      success: true,
      data: activity,
    })
  })

  /**
   * @swagger
   * /tracking/activities/{id}:
   *   delete:
   *     summary: Delete activity
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The activity ID
   *     responses:
   *       200:
   *         description: Activity deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Activity'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Activity not found
   */
  deleteActivity = catchAsync(async (req: Request, res: Response) => {
    await this.trackingService.deleteActivity(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    })
  })

  /**
   * @swagger
   * /tracking/attendance:
   *   post:
   *     summary: Record attendance
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AttendanceInput'
   *     responses:
   *       201:
   *         description: Attendance recorded successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Attendance'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  recordAttendance = catchAsync(
    async (req: Request | AuthRequest, res: Response) => {
      const authReq = req as AuthRequest
      if (!authReq.auth?.userId) {
        throw new AppError(401, 'Authentication required')
      }

      const attendance = await this.trackingService.recordAttendance({
        ...req.body,
        recorded_by: authReq.auth.userId,
      })

      res.status(201).json({
        success: true,
        data: attendance,
      })
    },
  )

  /**
   * @swagger
   * /tracking/attendance/activity/{activityId}:
   *   get:
   *     summary: Get attendance by activity
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: activityId
   *         required: true
   *         schema:
   *           type: string
   *         description: The activity ID
   *     responses:
   *       200:
   *         description: List of attendance records
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Attendance'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Activity not found
   */
  getAttendanceByActivity = catchAsync(async (req: Request, res: Response) => {
    const attendance = await this.trackingService.getAttendanceByActivity(
      req.params.activityId,
    )

    res.status(200).json({
      success: true,
      data: attendance,
    })
  })

  /**
   * @swagger
   * /tracking/reports/activity/{activityId}:
   *   get:
   *     summary: Get activity report
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: activityId
   *         required: true
   *         schema:
   *           type: string
   *         description: The activity ID
   *     responses:
   *       200:
   *         description: Activity report
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ActivityReport'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Activity not found
   */
  getActivityReport = catchAsync(async (req: Request, res: Response) => {
    const report = await this.trackingService.getActivityReport(
      req.params.activityId,
    )

    res.status(200).json({
      success: true,
      data: report,
    })
  })

  /**
   * @swagger
   * /tracking/reports/daily:
   *   get:
   *     summary: Get daily report
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Daily report
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DailyReport'
   *       401:
   *         description: Unauthorized
   */
  getDailyReport = catchAsync(async (req: Request, res: Response) => {
    const report = await this.trackingService.getDailyReport()

    res.status(200).json({
      success: true,
      data: report,
    })
  })

  /**
   * @swagger
   * /tracking/attendance/{id}:
   *   patch:
   *     summary: Update attendance record
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The attendance record ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AttendanceInput'
   *     responses:
   *       200:
   *         description: Attendance updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Attendance'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Attendance record not found
   */
  updateAttendance = catchAsync(
    async (req: Request | AuthRequest, res: Response) => {
      const authReq = req as AuthRequest
      if (!authReq.auth?.userId) {
        throw new AppError(401, 'Authentication required')
      }

      const attendance = await this.trackingService.updateAttendance(
        req.params.id,
        {
          ...req.body,
          recorded_by: authReq.auth.userId,
        },
      )

      res.status(200).json({
        success: true,
        data: attendance,
      })
    },
  )

  /**
   * @swagger
   * /tracking/attendance/bulk:
   *   post:
   *     summary: Record attendance for multiple children
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BulkAttendanceInput'
   *     responses:
   *       201:
   *         description: Attendance recorded successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/BulkAttendance'
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  recordBulkAttendance = catchAsync(async (req: Request, res: Response) => {
    const { activity_id, attendances } = req.body
    const result = await this.trackingService.recordBulkAttendance(
      activity_id,
      attendances,
    )

    res.status(201).json({
      success: true,
      data: result,
    })
  })

  /**
   * @swagger
   * /tracking/reports/weekly:
   *   get:
   *     summary: Get weekly activity report
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date of the week
   *     responses:
   *       200:
   *         description: Weekly activity report
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WeeklyReport'
   *       401:
   *         description: Unauthorized
   */
  getWeeklyReport = catchAsync(async (req: Request, res: Response) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date()
    const report = await this.trackingService.getWeeklyReport(startDate)

    res.status(200).json({
      success: true,
      data: report,
    })
  })

  /**
   * @swagger
   * /tracking/reports/monthly:
   *   get:
   *     summary: Get monthly activity report
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: year
   *         required: true
   *         schema:
   *           type: number
   *       - in: query
   *         name: month
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Monthly activity report
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MonthlyReport'
   *       401:
   *         description: Unauthorized
   */
  getMonthlyReport = catchAsync(async (req: Request, res: Response) => {
    const { year, month } = req.query
    const report = await this.trackingService.getMonthlyReport(
      parseInt(year as string),
      parseInt(month as string),
    )

    res.status(200).json({
      success: true,
      data: report,
    })
  })
}
