import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// ─── GET /reports/summary?month=3&year=2026 ──────────────────────────────────
router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebase_uid: req.firebaseUid } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const now   = new Date()
    const month = parseInt(req.query.month as string) || now.getMonth() + 1
    const year  = parseInt(req.query.year  as string) || now.getFullYear()

    const start     = new Date(year, month - 1, 1)
    const end       = new Date(year, month, 0)
    const lastStart = new Date(year, month - 2, 1)
    const lastEnd   = new Date(year, month - 1, 0)

    const [transactions, lastMonthTxns, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          user_id: user.id,
          status: 'CONFIRMED',
          transaction_date: { gte: start, lte: end }
        },
        include: { category: true },
        orderBy: { transaction_date: 'desc' }
      }),
      prisma.transaction.findMany({
        where: {
          user_id: user.id,
          status: 'CONFIRMED',
          transaction_date: { gte: lastStart, lte: lastEnd }
        }
      }),
      prisma.budget.findMany({
        where: { user_id: user.id, month, year }
      })
    ])

    // ── Totals ───────────────────────────────────────────────────────────────
    const total     = transactions.reduce((s, t) => s + parseFloat((t.my_share || t.amount).toString()), 0)
    const lastTotal = lastMonthTxns.reduce((s, t) => s + parseFloat((t.my_share || t.amount).toString()), 0)
    const vsLastMonth = lastTotal > 0 ? ((total - lastTotal) / lastTotal) * 100 : 0

    // ── By category ──────────────────────────────────────────────────────────
    const byCategoryMap: Record<string, {
      name: string, icon: string, color: string, amount: number, count: number
    }> = {}

    for (const t of transactions) {
      if (!t.category) continue
      const key = t.category_id!
      if (!byCategoryMap[key]) {
        byCategoryMap[key] = {
          name: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
          amount: 0,
          count: 0
        }
      }
      byCategoryMap[key].amount += parseFloat((t.my_share || t.amount).toString())
      byCategoryMap[key].count++
    }
    const byCategory = Object.values(byCategoryMap).sort((a, b) => b.amount - a.amount)

    // ── Daily spending ───────────────────────────────────────────────────────
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

    // ── Top 5 expenses ───────────────────────────────────────────────────────
    const top5 = [...transactions]
      .sort((a, b) =>
        parseFloat((b.my_share || b.amount).toString()) -
        parseFloat((a.my_share || a.amount).toString())
      )
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        merchant: t.merchant,
        amount: parseFloat((t.my_share || t.amount).toString()),
        transaction_date: t.transaction_date,
        category: t.category
          ? { name: t.category.name, icon: t.category.icon, color: t.category.color }
          : null
      }))

    // ── Day of week ──────────────────────────────────────────────────────────
    const dowMap: Record<number, { total: number, count: number }> = {}
    for (let i = 0; i < 7; i++) dowMap[i] = { total: 0, count: 0 }

    for (const t of transactions) {
      const dow = new Date(t.transaction_date).getDay()
      dowMap[dow].total += parseFloat((t.my_share || t.amount).toString())
      dowMap[dow].count++
    }
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, i) => ({
      name,
      total: dowMap[i].total,
      count: dowMap[i].count,
      avg: dowMap[i].count > 0 ? dowMap[i].total / dowMap[i].count : 0
    }))

    // ── Budget / safe-to-spend ───────────────────────────────────────────────
    const totalBudget = budgets.reduce((s, b) => s + parseFloat(b.amount.toString()), 0)
    const daysLeft    = Math.max(0, daysInMonth - now.getDate())
    const remaining   = totalBudget - total
    const safePerDay  = daysLeft > 0 ? remaining / daysLeft : 0

    res.json({
      total,
      lastTotal,
      vsLastMonth,
      byCategory,
      dailySpending,
      top5,
      dayOfWeek,
      totalBudget,
      remaining,
      safePerDay,
      daysLeft,
      transactionCount: transactions.length
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// ─── GET /reports/yearly?year=2026 ──────────────────────────────────────────
router.get('/yearly', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebase_uid: req.firebaseUid } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const year  = parseInt(req.query.year as string) || new Date().getFullYear()
    const start = new Date(year, 0, 1)
    const end   = new Date(year, 11, 31, 23, 59, 59)

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        status: 'CONFIRMED',
        transaction_date: { gte: start, lte: end }
      },
      include: { category: true }
    })

    const total = transactions.reduce((s, t) => s + parseFloat((t.my_share || t.amount).toString()), 0)
    const count = transactions.length

    // Monthly totals — index 0 = Jan … 11 = Dec
    const monthly = Array(12).fill(0)
    for (const t of transactions) {
      const m = new Date(t.transaction_date).getMonth()
      monthly[m] += parseFloat((t.my_share || t.amount).toString())
    }

    // Biggest month = highest spend
    const biggestMonth = monthly.indexOf(Math.max(...monthly))

    // Best month = lowest non-zero spend
    const nonZero   = monthly.map((v, i) => ({ v, i })).filter(x => x.v > 0)
    const bestMonth = nonZero.length > 0
      ? nonZero.reduce((a, b) => a.v < b.v ? a : b).i
      : -1

    const dailyAvg = count > 0 ? total / 365 : 0

    // Top category
    const catMap: Record<string, { name: string, icon: string, amount: number }> = {}
    for (const t of transactions) {
      if (!t.category) continue
      const key = t.category_id!
      if (!catMap[key]) catMap[key] = { name: t.category.name, icon: t.category.icon, amount: 0 }
      catMap[key].amount += parseFloat((t.my_share || t.amount).toString())
    }
    const topCategory = Object.values(catMap).sort((a, b) => b.amount - a.amount)[0] || null

    res.json({
      total,
      count,
      monthly,
      biggestMonth,
      bestMonth,
      dailyAvg,
      topCategory
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router