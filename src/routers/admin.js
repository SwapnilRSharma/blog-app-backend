const express = require('express')
const router = new express.Router()
const Joi = require('joi')
const Blog = require('../models/blog')
const auth = require('../middleware/auth')
const User = require('../models/user')


router.get('/users', auth, async (req, res) => {
    try {
        if(req.user.user_type != "ADMIN") return res.status(401).send({message: "Unauthorised Access"})
        const users = await User.find({ user_type: "CONTENT_WRITER"})
        if(!users) return res.send([])

        return res.status(200).send(users)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

//Create user
router.post('/user', auth,  async (req, res) => {
    if(req.user.user_type != "ADMIN") return res.status(401).send({message: "Unauthorised Access"})
    try {
        const schema = Joi.object({
            name: Joi.string().min(2).max(1024).required(),
            email: Joi.string().email().min(5).max(255).required(),
            password: Joi.string().min(5).max(1024).required()
        })

        const result = schema.validate(req.body)
        if (result.error) return res.status(400).send({ error: result.error.details[0].message })

        const user = new User({ ...req.body, user_type: "CONTENT_WRITER" })
        await user.save()

        return res.status(200).send(user)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

//Delete user
router.get('/delete-user/:id', auth, async (req, res) => {
    if(req.user.user_type != "ADMIN") return res.status(401).send({message: "Unauthorised Access"})
    try {
        const user = await User.findOne({ _id: req.params.id, user_type: "CONTENT_WRITER" })
        if(!user) return res.status(404).send({message: "User not found."})

        await user.remove()
        return res.status(200).send({message: "User deleted."})
    } catch (error) {
        return res.status(500).send(error.message)
    }
})


//Update user
router.patch('/user/:userId',auth,  async (req, res) => {
    if(req.user.user_type != "ADMIN") return res.status(401).send({message: "Unauthorised Access"})
    const allowedUpdates = ['name', 'password']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid Upadates!' })
    }

    try {
        const user = await User.findOne({ _id: req.params.userId , softDelete: false})
        if(!user) return res.status(404).send({ message: "User not found" })

        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        return res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/deleted-blogs', auth, async (req, res) => {
    try{
        const blogs = await Blog.find({softDelete: true})
        return res.send(blogs)
    }catch(e){
        console.log(e)
        return res.status(400).send(e.message)
    }
})

router.get('/deleted-users', auth, async (req, res) => {
    try{
        const users = await User.find({softDelete: true})
        return res.send(users)
    }catch(e){
        console.log(e)
        return res.status(400).send(e.message)
    }
})

router.get('/pending-blogs', auth, async (req, res) => {
    try{
        const blogs = await Blog.find({softDelete: false, isApproved: false})
        return res.send(blogs)
    }catch(e){
        console.log(e)
        return res.status(400).send(e.message)
    }
})

router.get('/approve-blog/:id', auth, async (req, res) => {
    try{
        const blog = await Blog.findOne({softDelete: false, _id: req.params.id})
        blog.isApproved = true
        await blog.save()
        return res.send(blog)
    }catch(e){
        console.log(e)
        return res.status(400).send(e.message)
    }
})

router.get('/delete-blog/:id', auth, async (req, res) => {
    try{
        const blog = await Blog.findOne({softDelete: false, _id: req.params.id})
        blog.softDelete = true
        await blog.save()
        return res.send(blog)
    }catch(e){
        console.log(e)
        return res.status(400).send(e.message)
    }
})

//View Blog
router.get('/view-blog/:id', async (req, res) => {
    try{
        const blog = await Blog.findOne({softDelete: false, _id: req.params.id})
        if(!blog) return res.status(404).send({message: "Not found"})
        return res.send(blog)
    }catch(e){
        console.log(e)
        return res.status(400).send(e.message)
    }
})


module.exports = router