import express  from 'express'
import morgan from 'morgan'
import authRouter from './routes/auth.js'
import errorHandler from './middleware/errorHandler.js'
import profileRouter from './routes/profileRoutes.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from '../swaggerConfig.js'


const app= express()

app.use(morgan('dev'))
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/profile', profileRouter)

app.use(errorHandler)
export default app
