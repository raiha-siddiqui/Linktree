import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const connectDB=async()=>{
    try{
       await mongoose.connect(process.env.MONGO_URI)
       console.log('DB connection is established successfully')
    }catch(err){
      console.log(`DB Connection is not establised ${err.message}`)
    }
}
export default connectDB