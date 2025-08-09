import asyncHandler from "express-async-handler";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from "../models/user.js";
dotenv.config()

export const protect= asyncHandler(async(req, res, next)=>{
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
      try{
        token= req.headers.authorization.split(' ')[1]
        const decoded= jwt.verify(token, process.env.JWT_SECRET)
        req.user= await User.findById(decoded._id).select('-password')
        if(!req.user){   //the case when the ID in a valid token no longer exist in a DB
            return res.status(401).json({mnessage: 'User not found request not authorized'})
        }
        next()
      }catch(err){
           console.log('Token verification failed', err)
           res.status(401)
           throw new Error('Not Authorized, token failed')
      }
    }
    if(!token){
        return res.status(400).json({message: 'Not authorized no token provided'})
    }
})