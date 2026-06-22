import { Router, type Response } from 'express'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'
import * as handlers from '../data/handlers.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await handlers.getCourses()
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId
  const result = await handlers.getCourse(req.params.id, userId)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.post('/:id/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.updateProgress(req.user.userId, req.params.id, req.body)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

export default router
