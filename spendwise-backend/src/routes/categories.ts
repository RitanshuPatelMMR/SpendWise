import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebase_uid: req.firebaseUid } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const categories = await prisma.category.findMany({
      where: { user_id: user.id, is_hidden: false },
      orderBy: { sort_order: 'asc' }
    })

    res.json({ categories })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router