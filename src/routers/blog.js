const express = require('express')
const router = new express.Router()
const Joi = require('joi')
const Blog = require('../models/blog')
const auth = require('../middleware/auth')


router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ isApproved: true, softDelete: false })
        if(!blogs) return res.send([])

        return res.status(200).send(blogs)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

router.get('/:id',async (req, res) => {
    try {
        
        const blog = await Blog.findOne({ _id: req.params.id, softDelete: false })
        if(!blog) return res.status(404).send({message: "Blog not found"})
         return res.status(200).send(blog);
    } catch (error) {
        console.log(error)
        return res.status(500).send(error.message)
    }
})

module.exports = router