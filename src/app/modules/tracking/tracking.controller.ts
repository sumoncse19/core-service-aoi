import { Request, Response } from 'express'
import { TrackingService } from './tracking.service'
import catchAsync from '../../utils/catchAsync'
import { AuthRequest } from '../../types/express'

export class TrackingController {
  private trackingService: TrackingService

  constructor() {
    this.trackingService = new TrackingService()
  }

  /**
   * @swagger
   * /tracking/activities:
   *   post:
   *     summary: Create a new activity
   *     tags: [Activities]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               start_time:
   *                 type: string
   *                 format: date-time
   *               end_time:
   *                 type: string
   *                 format: date-time
   *               assigned_staff:
   *                 type: array
   *                 items:
   *                   type: string
   *               max_participants:
   *                 type: integer
   *               location:
   *                 type: string
   *               metadata:
   *                 type: object
   *     responses:
   *       201:
   *         description: Activity created successfully
   *       400:
   *         description: Bad request
   */
  createActivity = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const activity = await this.trackingService.createActivity({
      ...req.body,
      created_by: authReq.auth?.userId,
    })

    res.status(201).json({
      success: true,
      data: activity,
    })
  })

  /**
   * @swagger
   * /tracking/activities:
   *   get:
   *     summary: Get all activities
   *     tags: [Activities]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of activities
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
   *     tags: [Activities]
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
   *     tags: [Activities]
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
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               start_time:
   *                 type: string
   *                 format: date-time
   *               end_time:
   *                 type: string
   *                 format: date-time
   *               assigned_staff:
   *                 type: array
   *                 items:
   *                   type: string
   *               max_participants:
   *                 type: integer
   *               location:
   *                 type: string
   *               metadata:
   *                 type: object
   *     responses:
   *       200:
   *         description: Activity updated successfully
   *       400:
   *         description: Bad request
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
   *     tags: [Activities]
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
   *     tags: [Attendance]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               activity_id:
   *                 type: string
   *               child_id:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [present, absent, late, excused]
   *               check_in_time:
   *                 type: string
   *                 format: date-time
   *               check_out_time:
   *                 type: string
   *                 format: date-time
   *               notes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Attendance recorded successfully
   *       400:
   *         description: Bad request
   */
  recordAttendance = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const attendance = await this.trackingService.recordAttendance({
      ...req.body,
      recorded_by: authReq.auth?.userId,
    })

    res.status(201).json({
      success: true,
      data: attendance,
    })
  })

  /**
   * @swagger
   * /tracking/attendance/activity/{activityId}:
   *   get:
   *     summary: Get attendance by activity
   *     tags: [Attendance]
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
   *     tags: [Reports]
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
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Daily report
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
   *     tags: [Attendance]
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
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [present, absent, late, excused]
   *               check_in_time:
   *                 type: string
   *                 format: date-time
   *               check_out_time:
   *                 type: string
   *                 format: date-time
   *               notes:
   *                 type: string
   *     responses:
   *       200:
   *         description: Attendance updated successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: Attendance record not found
   */
  updateAttendance = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const attendance = await this.trackingService.updateAttendance(
      req.params.id,
      {
        ...req.body,
        recorded_by: authReq.auth?.userId,
      },
    )

    res.status(200).json({
      success: true,
      data: attendance,
    })
  })

  /**
   * @swagger
   * /tracking/attendance/bulk:
   *   post:
   *     summary: Record attendance for multiple children
   *     tags: [Attendance]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               activity_id:
   *                 type: string
   *               attendances:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     child_id:
   *                       type: string
   *                     status:
   *                       type: string
   *                       enum: [present, absent, late, excused]
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
   * /tracking/activities/upcoming:
   *   get:
   *     summary: Get upcoming activities
   *     tags: [Activities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: number
   *         description: Number of days to look ahead (default: 7)
   */
  getUpcomingActivities = catchAsync(async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 7
    const activities = await this.trackingService.getUpcomingActivities(days)

    res.status(200).json({
      success: true,
      data: activities,
    })
  })

  /**
   * @swagger
   * /tracking/reports/weekly:
   *   get:
   *     summary: Get weekly activity report
   *     tags: [Reports]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date of the week
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
   *     tags: [Reports]
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
