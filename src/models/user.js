const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        default: '123456'
    },
    user_type: {
        type: String,
        required: true,
        default: "CONTENT_WRITER"
    },
    softDelete: {
        type: Boolean,
        default: false
    }
    // blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
}, {
    timestamps: true
})

// userSchema.virtual('blogs', {
//     ref: 'Blogs',
//     localField: '_id',
//     foreignField: 'owner'
// })

userSchema.methods.toJSON = function () {
    const user = this
    userObject = user.toObject()

    delete userObject.password

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this

    const token = jwt.sign({ _id: user._id.toString(), user_type: user.user_type }, process.env.JWT_SECRET)

    return token
}

userSchema.statics.findByCredentials = async (email, password, user_type) => {
    const user = await User.findOne({ email , user_type})

    if (!user) {
        throw new Error('Unable to login.')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login.')
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User