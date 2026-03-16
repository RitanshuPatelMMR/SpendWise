import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import reportsRoutes from './routes/reports'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors())
app.use(express.json())

import authRoutes from './routes/auth'
import transactionRoutes from './routes/transactions'
import categoryRoutes from './routes/categories'

app.use('/auth', authRoutes)
app.use('/transactions', transactionRoutes)
app.use('/categories', categoryRoutes)
app.use('/reports', reportsRoutes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Digest cron — runs every hour, checks if 9AM or 9PM IST
import { sendDigestNotification } from './cron'

setInterval(async () => {
  const now = new Date()
  const istHour = (now.getUTCHours() + 5) % 24
  const istMinute = (now.getUTCMinutes() + 30) % 60

  if ((istHour === 9 || istHour === 21) && istMinute < 5) {
    await sendDigestNotification()
  }
}, 5 * 60 * 1000) // check every 5 minutes

app.listen(PORT, () => {
  console.log(`🚀 Spendwise backend running on port ${PORT}`)
})

export default app