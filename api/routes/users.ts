import { Router, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import * as handlers from '../data/handlers.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.getCurrentUser(req.user.userId)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const result = await handlers.getUser(req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.post('/:id/follow', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.followUser(req.user.userId, req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.delete('/:id/follow', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.unfollowUser(req.user.userId, req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

export default router
