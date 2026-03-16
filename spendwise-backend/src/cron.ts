import { PrismaClient } from '@prisma/client'
import admin from 'firebase-admin'

const prisma = new PrismaClient()

export async function sendDigestNotification() {
  console.log('⏰ Running digest cron...')

  try {
    // Get all users with pending transactions
    const users = await prisma.user.findMany({
      where: {
        transactions: {
          some: { status: 'PENDING' }
        },
        fcm_token: { not: null }
      },
      include: {
        transactions: {
          where: { status: 'PENDING' }
        }
      }
    })

    console.log(`Found ${users.length} users with pending transactions`)

    for (const user of users) {
      if (!user.fcm_token) continue

      const count = user.transactions.length
      const total = user.transactions.reduce(
        (sum, t) => sum + parseFloat(t.amount.toString()), 0
      )

      await admin.messaging().send({
        token: user.fcm_token,
        notification: {
          title: `You have ${count} expense${count > 1 ? 's' : ''} to sort`,
          body: `You spent ₹${total.toFixed(0)} — takes 20 seconds to tag`,
        },
        data: {
          type: 'digest',
          pending_count: count.toString(),
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'spendwise_digest',
          }
        }
      })

      console.log(`✅ Digest sent to user ${user.id}`)
    }
  } catch (e) {
    console.error('Digest cron error:', e)
  }
}