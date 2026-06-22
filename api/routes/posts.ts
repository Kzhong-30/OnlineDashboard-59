import { Router, type Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import * as handlers from '../data/handlers.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await handlers.getPosts(req.query as Record<string, string>)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const result = await handlers.getPost(req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.createPost(req.user.userId, req.body)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.likePost(req.user.userId, req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.delete('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.unlikePost(req.user.userId, req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.post('/:id/comments', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.addComment(req.user.userId, req.params.id, req.body)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

export default router
