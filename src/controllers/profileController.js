import asyncHandler from 'express-async-handler'
import User from "../models/user.js"
import { validationResult } from "express-validator"

export const getMyProfile= asyncHandler(async(req, res)=>{
   res.status(200).json(req.user)
})

export const updateMyProfile= asyncHandler(async(req, res)=>{
    const errors= validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()})
    }
     const {bio, username, imageUrl} = req.body
     const user= await User.findById(req.user.id)
     if(!user){
        return res.status(404).json({message: "User not found"})
     }
     if(username){
        const existingUser = await User.findOne({username})
        if(existingUser && existingUser._id.toString()!== user._id.toString()){
            return res.status(400).json({message: "user is already in use by another account"})
        }
        user.username= username
     }
     if(bio !== undefined){
        user.bio= bio
     }
       if(imageUrl !== undefined){
        user.imageUrl= imageUrl
     }
     const updatedUser= await user.save()
     res.status(200).json(updatedUser)
})
