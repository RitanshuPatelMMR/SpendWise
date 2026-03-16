import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebase_uid: req.firebaseUid } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1
    const year = parseInt(req.query.year as string) || new Date().getFullYear()

    const budgets = await prisma.budget.findMany({
      where: { user_id: user.id, month, year },
      include: { category: true }
    })

    res.json({ budgets })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebase_uid: req.firebaseUid } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { category_id, amount, month, year } = req.body

    const budget = await prisma.budget.upsert({
      where: {
        user_id_category_id_month_year: {
          user_id: user.id,
          category_id,
          month,
          year
        }
      },
      update: { amount },
      create: { user_id: user.id, category_id, amount, month, year }
    })

    res.json({ budget })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.budget.delete({ where: { id: req.params.id as string } })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router