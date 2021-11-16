const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    softDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true}
})


const Blog = mongoose.model("Blog", blogSchema)

module.exports = Blog