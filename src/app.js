import express  from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import connectDB from './config/database.js'
import authRouter from './routes/auth.js'
import errorHandler from './middleware/errorHandler.js'
dotenv.config()
const app= express()

app.use(morgan('dev'))
app.use(express.json())

app.use('/api/v1/auth', authRouter)

app.use(errorHandler)
const PORT= process.env.PORT
connectDB().then(()=>{
    app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`))
})