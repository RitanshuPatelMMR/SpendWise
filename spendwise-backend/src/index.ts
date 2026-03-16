import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Spendwise backend running on port ${PORT}`)
})

export default app