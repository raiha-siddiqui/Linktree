import { protect } from "../middleware/authmiddleware.js"
import { getMyProfile, updateMyProfile } from "../controllers/profileController.js"
import express from 'express'
import {body} from 'express-validator'

const profileRouter= express.Router()

const profileUpdateValidator=[
    body('username').optional().trim().escape().isLength({min:4}).withMessage('Username must be at least 4 characters'),
    body('bio').optional().trim().isLength({max:250}).withMessage('Bio cannot be longer than 250 characters'),
    body('imageUrl').optional().trim().isURL().withMessage("A valid image URL is required")
]
profileRouter.get('/me',protect,  getMyProfile)
profileRouter.put('/', protect,profileUpdateValidator, updateMyProfile)

export default profileRouter