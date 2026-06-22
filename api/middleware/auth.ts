import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'bake_community_secret_key_2024'

export interface AuthRequest extends Request {
  user?: {
    userId: string
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: '未登录或登录已过期' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    req.user = {
      userId: decoded.userId,
    }

    next()
  } catch (error) {
    res.status(401).json({ success: false, message: '无效的 token' })
  }
}

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next()
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    req.user = {
      userId: decoded.userId,
    }
  } catch (error) {
    // token 无效时不报错，继续执行
  }

  next()
}
