import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebase_uid: req.firebaseUid } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { month, year, status } = req.query
    const where: any = { user_id: user.id }
    if (status && status !== 'all') where.status = status
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1)
      const end = new Date(Number(year), Number(month), 0)
      where.transaction_date = { gte: start, lte: end }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { transaction_date: 'desc' },
      include: { category: true }
    })

    res.json({ transactions })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router