import express, { Express, Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import { generateToken } from './auth'
import { connectDatabases } from './database'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5001

app.use(express.json())
// Define a health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'Server is running' })
})

app.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body

    try {
        const token = await generateToken(username)
        res.json({ token })
    } catch (error) {
        res.status(401).json({ message: 'Invalid credentials' })
        next(error)
    }
})
const startServer = async () => {
    try {
        const { pgPool, mongoose } = await connectDatabases()
        console.log('🚀 Databases connected, starting server...')

        // Store database connections for use in routes
        app.locals.pgPool = pgPool
        app.locals.mongoose = mongoose

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error(
            '❌ Failed to connect to databases. Server not started.',
            error
        )
        process.exit(1) // Exit process if database connection fails
    }
}

startServer()
