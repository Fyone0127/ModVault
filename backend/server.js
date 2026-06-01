import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import creatorRoutes from './routes/creatorRoutes.js'
import gameRoutes from './routes/gameRoutes.js'
import modRoutes from './routes/modRoutes.js'
import favouriteRoutes from './routes/favouriteRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import downloadRoutes from './routes/downloadRoutes.js'
import recommendationRoutes from './routes/recommendationRoutes.js'
import externalRoutes from './routes/externalRoutes.js'

dotenv.config()
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`))
  }
}))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'ModVault API' }))
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/creator', creatorRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/mods', modRoutes)
app.use('/api/favourites', favouriteRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/downloads', downloadRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/external', externalRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Server error', detail: err.message })
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`ModVault API running on http://localhost:${port}`))
