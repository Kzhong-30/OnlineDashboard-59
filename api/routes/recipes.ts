import { Router, type Response } from 'express'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'
import * as handlers from '../data/handlers.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await handlers.getRecipes(req.query as Record<string, string>)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId
  const result = await handlers.getRecipe(req.params.id, userId)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.createRecipe(req.user.userId, req.body)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.likeRecipe(req.user.userId, req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.delete('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.unlikeRecipe(req.user.userId, req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.post('/:id/favorite', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.favoriteRecipe(req.user.userId, req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.delete('/:id/favorite', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: '未登录' })
    return
  }
  const result = await handlers.unfavoriteRecipe(req.user.userId, req.params.id)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

export default router
