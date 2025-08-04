import app from './app.js'
import connectDB from './config/database.js'
import dotenv from 'dotenv'
dotenv.config()


const PORT= process.env.PORT
connectDB().then(()=>{
    app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`))
})
