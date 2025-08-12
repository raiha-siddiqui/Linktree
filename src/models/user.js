import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const LinkSchema= new mongoose.Schema({
    title:{
        type : String,
        required:[true,'Title must be required'],
        trim: true,
        maxlength:[100, 'Title cannot not be more than 100 characters']
    },
    url:{
         type : String,
         required: [true, 'Url must be required'],
         validate:{
            validator: function(value){
                return validator.isURL(value,{
                   protocols:['http', 'https'],
                   require_protocol:true
                })
            },
            message: val=>`${val.value} is not a valid Url`
         }
    },
    isActive:{
        type : Boolean,
        default: true
    },
    clicks:{
        type:Number,
        default:0
    }
})

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
            throw new Error("Invalid email Address" + value)
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
    },
    username:{
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        sparse: true
    },
    bio:{
        type:String,
        maxlength: 250,
        default: 'Welcome tp my page'
    },
    imageUrl:{
        type: String,
        default: ""
    },
    role:{
        type: String,
        enum:['user', 'admin'],
        default: "user"
    },
    isActive:{
        type: Boolean,
        default: true
    },
    links: [LinkSchema]
}, {timestamps: true})

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