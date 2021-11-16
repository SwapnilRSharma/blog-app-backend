const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_OLD_URL, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
})

