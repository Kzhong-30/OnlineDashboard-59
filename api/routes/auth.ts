import { Router, type Response } from 'express'
import * as handlers from '../data/handlers.js'
import type { AuthRequest } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req: AuthRequest, res: Response) => {
  const result = await handlers.register(req.body)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

router.post('/login', async (req: AuthRequest, res: Response) => {
  const result = await handlers.login(req.body)
  const status = result.status || 500
  delete result.status
  res.status(status).json(result)
})

export default router
