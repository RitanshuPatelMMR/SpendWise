import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebase_uid: req.firebaseUid } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const now = new Date()
    const month = parseInt(req.query.month as string) || now.getMonth() + 1
    const year = parseInt(req.query.year as string) || now.getFullYear()

    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)

    // Last month
    const lastStart = new Date(year, month - 2, 1)
    const lastEnd = new Date(year, month - 1, 0)

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        status: 'CONFIRMED',
        transaction_date: { gte: start, lte: end }
      },
      include: { category: true }
    })

    const lastMonthTxns = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        status: 'CONFIRMED',
        transaction_date: { gte: lastStart, lte: lastEnd }
      }
    })

    // Total spent this month
    const total = transactions.reduce((sum, t) =>
      sum + parseFloat((t.my_share || t.amount).toString()), 0)

    // Last month total
    const lastTotal = lastMonthTxns.reduce((sum, t) =>
      sum + parseFloat((t.my_share || t.amount).toString()), 0)

    // By category
    const byCategory: Record<string, { name: string, icon: string, color: string, amount: number }> = {}
    for (const t of transactions) {
      if (!t.category) continue
      const key = t.category_id!
      if (!byCategory[key]) {
        byCategory[key] = {
          name: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
          amount: 0
        }
      }
      byCategory[key].amount += parseFloat((t.my_share || t.amount).toString())
    }

    // Daily spending
    const dailyMap: Record<number, number> = {}
    for (const t of transactions) {
      const day = new Date(t.transaction_date).getDate()
      dailyMap[day] = (dailyMap[day] || 0) + parseFloat((t.my_share || t.amount).toString())
    }
    const daysInMonth = end.getDate()
    const dailySpending = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      amount: dailyMap[i + 1] || 0
    }))

    // Safe to spend per day
    const budgets = await prisma.budget.findMany({
      where: { user_id: user.id, month, year }
    })
    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0)
    const daysLeft = daysInMonth - now.getDate()
    const remaining = totalBudget - total
    const safePerDay = daysLeft > 0 ? remaining / daysLeft : 0

    res.json({
      total,
      lastTotal,
      vsLastMonth: lastTotal > 0 ? ((total - lastTotal) / lastTotal) * 100 : 0,
      byCategory: Object.values(byCategory).sort((a, b) => b.amount - a.amount),
      dailySpending,
      totalBudget,
      remaining,
      safePerDay,
      daysLeft,
      transactionCount: transactions.length,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router