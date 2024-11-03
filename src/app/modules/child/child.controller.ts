import { Request, Response } from 'express'
import { ChildService } from './child.service'
import catchAsync from '../../utils/catchAsync'
import { AuthRequest } from '../../types/express'
import AppError from '../shared/errors/AppError'

export class ChildController {
  private childService: ChildService

  constructor() {
    this.childService = new ChildService()
  }

  /**
   * @swagger
   * /children/register:
   *   post:
   *     summary: Register a new child
   *     tags: [Children]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               first_name:
   *                 type: string
   *               last_name:
   *                 type: string
   *               date_of_birth:
   *                 type: string
   *                 format: date
   *               gender:
   *                 type: string
   *                 enum: [male, female]
   *               medical_info:
   *                 type: string
   *               emergency_contact:
   *                 type: object
   *                 properties:
   *                   name:
   *                     type: string
   *                   phone:
   *                     type: string
   *                   relationship:
   *                     type: string
   *     responses:
   *       201:
   *         description: Child registered successfully
   *       400:
   *         description: Bad request
   */
  registerChild = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    if (!authReq.auth?.userId) {
      throw new AppError(401, 'Authentication required')
    }

    const child = await this.childService.registerChild({
      ...req.body,
      parent_id: authReq.auth.userId,
    })

    res.status(201).json({
      success: true,
      data: child,
    })
  })

  /**
   * @swagger
   * /children/my-children:
   *   get:
   *     summary: Get all children of the authenticated parent
   *     tags: [Children]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of children
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   first_name:
   *                     type: string
   *                   last_name:
   *                     type: string
   *                   date_of_birth:
   *                     type: string
   *                     format: date
   *                   gender:
   *                     type: string
   *                   medical_info:
   *                     type: string
   *                   emergency_contact:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                       phone:
   *                         type: string
   *                       relationship:
   *                         type: string
   *       401:
   *         description: Unauthorized
   */
  getMyChildren = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    if (!authReq.auth?.userId) {
      throw new AppError(401, 'Authentication required')
    }

    const children = await this.childService.getChildrenByParent(
      authReq.auth.userId,
    )

    res.status(200).json({
      success: true,
      data: children,
    })
  })

  /**
   * @swagger
   * /children/{id}:
   *   patch:
   *     summary: Update child information
   *     tags: [Children]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The child ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               first_name:
   *                 type: string
   *               last_name:
   *                 type: string
   *               date_of_birth:
   *                 type: string
   *                 format: date
   *               gender:
   *                 type: string
   *                 enum: [male, female]
   *               medical_info:
   *                 type: string
   *               emergency_contact:
   *                 type: object
   *                 properties:
   *                   name:
   *                     type: string
   *                   phone:
   *                     type: string
   *                   relationship:
   *                     type: string
   *     responses:
   *       200:
   *         description: Child updated successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Child not found
   */
  updateChild = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    if (!authReq.auth?.userId) {
      throw new AppError(401, 'Authentication required')
    }

    const child = await this.childService.updateChild(
      req.params.id,
      authReq.auth.userId,
      req.body,
    )

    res.status(200).json({
      success: true,
      data: child,
    })
  })

  /**
   * @swagger
   * /children/{id}:
   *   delete:
   *     summary: Delete a child
   *     tags: [Children]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The child ID
   *     responses:
   *       200:
   *         description: Child deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Child not found
   */
  deleteChild = catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    if (!authReq.auth?.userId) {
      throw new AppError(401, 'Authentication required')
    }

    await this.childService.deleteChild(req.params.id, authReq.auth.userId)

    res.status(200).json({
      success: true,
      message: 'Child deleted successfully',
    })
  })
}
