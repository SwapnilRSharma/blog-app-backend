const express = require('express')
const router = new express.Router()
const Joi = require('joi')
const User = require('../models/user')
const auth = require('../middleware/auth')
const Blog = require('../models/blog')


router.post('/login', async(req, res) => {
    try {
        console.log(req.body)
        const schema = Joi.object({
            email: Joi.string().email().min(5).max(255).required(),
            password: Joi.string().min(5).max(1024).required(),
            user_type: Joi.string().required()
        })

        const result = schema.validate(req.body)
        if (result.error) return res.status(400).send({ error: result.error.details[0].message })

        const user = await User.findByCredentials(req.body.email, req.body.password, req.body.user_type)
        const accessToken = await user.generateAuthToken()
        return res.send({...user._doc, accessToken})
    } catch (e) {
        console.log(e)
        res.status(400).send({
            status: 'error',
            message: e.message
        })
    }
})

router.post('/register', async(req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(2).max(255).required(),
            email: Joi.string().email().min(5).max(255).required(),
            password: Joi.string().min(5).max(1024).required(),
            user_type: Joi.string().required()
        })

        const result = schema.validate(req.body)
        if (result.error) return res.status(400).send({ error: result.error.details[0].message })

        const isExist = await User.findOne({ email: req.body.email })
        if(isExist) return res.status(401).send({message: "Email id already used."})

        const user = new User({name: req.body.name, email: req.body.email, password: req.body.password, user_type: req.body.user_type})
        await user.save()
        const token = await user.generateAuthToken()

        return res.status(200).send({ user, token })
    } catch (e) {
        console.log(e)
        res.status(400).send({
            status: 'error',
            message: e.message
        })
    }
})

//Create blog
router.post('/submit-blog', auth ,async (req, res) => {
    try {
        const schema = Joi.object({
            title: Joi.string().min(2).required(),
            description: Joi.string().min(5).required(),
            category: Joi.string().min(5).max(1024).required()
        })

        const result = schema.validate(req.body)
        if (result.error) return res.status(400).send({ error: result.error.details[0].message })

        const blog = new Blog({...req.body, owner: req.user.id})
        await blog.save()
        return res.send(blog)
    } catch (error) {
        console.log(error)
        return res.status(400).send(error.message)
    }
})

//get blogs
router.get('/blogs', auth ,async (req, res) => {
    try {
        // console.log(req.user)
        // await req.user.populate({ path:'blogs'}).execPopulate()

        const blogs = await Blog.find({owner: req.user._id, softDelete: false})
        console.log(blogs)
        return res.send(blogs)
    } catch (error) {
        console.log(error)
        return res.status(400).send(error.message)
    }
})


module.exports = router