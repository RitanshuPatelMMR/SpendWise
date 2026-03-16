import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.post('/verify', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, email, fcm_token } = req.body
    const firebaseUid = req.firebaseUid!

    let user = await prisma.user.findUnique({
      where: { firebase_uid: firebaseUid }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebase_uid: firebaseUid,
          email: email || '',
          name: name || '',
          fcm_token: fcm_token || null,
        }
      })
      console.log('New user created:', user.id)
    } else if (fcm_token) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { fcm_token }
      })
    }

    res.json({ user })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router