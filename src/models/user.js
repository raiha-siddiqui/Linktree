import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const UserSchema= new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        trim : true
    },
    email:{
      type: String,
      unique: true, // automatically set index
      lowercase:true,
      required: [true, 'Please provide an email'],
      trim: true,
      validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Inavlid email Address" + value)
        }
      }
    },
    password:{
        type:String,
        required:[true, 'Please provide a password'],
        minlength: [8, 'Password must be 8 characters long'],
        select:false,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error('Password must strong')
            }
        }
    }
})

UserSchema.pre('save', async function(next){
      if(!this.isModified('password')){
        return next() //prevent to rehash the hash password if it happen the user will be lock out from their account forever
      }

       const salt= await bcrypt.genSalt(12)
       this.password= await bcrypt.hash(this.password, salt)
        next()
})
UserSchema.methods.comparePassword= async function(passwordInputByUser){
    const isPasswordValid= await bcrypt.compare( passwordInputByUser, this.password)
    //this.passowrd is the hashed password save in db we are comparing the user input password with the hashed one
    return isPasswordValid
}
UserSchema.methods.getJwt= async function(){
 const token= await jwt.sign({_id:this._id}, process.env.JWT_SECRET, {expiresIn: "1d"})
    return token
}
const User= mongoose.model('User', UserSchema)
export default User