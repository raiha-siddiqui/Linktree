import { validationResult } from 'express-validator'
import asyncHandler from 'express-async-handler'
import User from '../models/user.js'

export const addLink=asyncHandler(async(req, res)=>{
      const errors= validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()[0].msg})
      }
      const {title, url, isActive}= req.body
          const user= await User.findById(req.user.id)
          const newLink={title, url, isActive}
          user.links.push(newLink)
          await user.save()
          res.status(201).json(user.links[user.links.length-1])

      
})
export const getAllLinks=asyncHandler(async(req, res)=>{
    const user=await  User.findById(req.user.id)
    return res.status(200).json(user.links)

})
export const updateLink=asyncHandler(async(req, res)=>{
      const errors= validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()[0].msg})
      }
        const {title, url, isActive}= req.body
        const {linkId}=req.params
       
            const user= await User.findById(req.user.id)
            const link= user.links.id(linkId)
            if(!link){
                return res.status(400).json({message: 'Link not found'})
            }
            link.title= title
            link.url= url
            if(isActive !== undefined){
                link.isActive= isActive
            }
            await user.save()
             res.status(200).json(link)
        

})
export const deleteLink=asyncHandler(async(req, res)=>{
        const {linkId}= req.params
        const user= await User.findById(req.user.id)
        user.links.pull({_id: linkId})
        await user.save()
        return res.status(204).send()
})
