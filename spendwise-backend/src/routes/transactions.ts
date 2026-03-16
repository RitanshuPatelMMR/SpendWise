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

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebase_uid: req.firebaseUid } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const {
      amount, merchant, bank, account_masked, mode,
      txn_type, upi_ref, sms_raw, transaction_date, suggested_category
    } = req.body

    // Check merchant override
    const override = await prisma.merchantOverride.findUnique({
      where: { user_id_merchant: { user_id: user.id, merchant } }
    })

    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        amount,
        merchant,
        bank,
        account_masked,
        mode,
        txn_type,
        upi_ref,
        sms_raw,
        transaction_date: new Date(transaction_date),
        category_id: override?.category_id || null,
        status: 'PENDING',
      }
    })

    res.json({
      transaction,
      suggested_category_id: override?.category_id || null
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebase_uid: req.firebaseUid } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { category_id, my_share, status, note } = req.body
    const id = req.params.id as string  // ← add this line

    const transaction = await prisma.transaction.update({
      where: { id },  // ← use id instead of req.params.id
      data: {
        category_id,
        my_share,
        status,
        note,
      }
    })

    // Save merchant override if confirmed
    if (status === 'CONFIRMED' && category_id && transaction.merchant) {
      await prisma.merchantOverride.upsert({
        where: { user_id_merchant: { user_id: user.id, merchant: transaction.merchant } },
        update: { category_id },
        create: { user_id: user.id, merchant: transaction.merchant, category_id }
      })
    }

    res.json({ transaction })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router