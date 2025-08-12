import express from 'express'
import {protect} from '../middleware/authMiddleware.js'
import {body} from 'express-validator'
import { addLink, deleteLink, getAllLinks, updateLink } from '../controllers/linksController.js'
const  linkRouter= express.Router()


const linkValidator=[
    body('title').notEmpty().withMessage('Title must be at least 4 characters').trim().escape(),
    body('url').isURL({ protocols: ['http','https'], require_protocol: true }).withMessage('A valid URL is required')
]

linkRouter.post('/', protect, linkValidator, addLink)
linkRouter.get('/', protect,  getAllLinks)
linkRouter.put('/:linkId', protect, linkValidator, updateLink)
linkRouter.delete('/:linkId', protect,  deleteLink)

export default linkRouter