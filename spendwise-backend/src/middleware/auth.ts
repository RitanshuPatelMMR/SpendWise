import { Request, Response, NextFunction } from 'express'
import admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
}

export interface AuthRequest extends Request {
  userId?: string
  firebaseUid?: string
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.firebaseUid = decoded.uid
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}