const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const PostSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    photo:{
        type:String,
    },
    price:{
        type:Number,
        required: true
    },
    description:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    book_type:{
        type:String,
        required:true
    },
    postedBy:{
        type: ObjectId,
        ref:"User",
        enum: ['Science Fiction', 'Adventure', 'Romance', 'Horror', 'Art & Photography', 'Children', 'Other'], // Allowed book types
        default: 'Other'
    },
    likes:[{
        type:ObjectId,
        ref:"User"
    }],
    comments:[{
        comment: {
            type: String,
            required: true
          },
          postedBy: {
            type: ObjectId,  // Reference to the User model
            ref: 'User',
            required: true
          }
    }]
},{timestamps:true})

const POST = mongoose.model('POST', PostSchema);

module.exports = POST